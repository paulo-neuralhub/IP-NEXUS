import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

serve(async (req) => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!stripeKey || !webhookSecret) {
    console.error('Stripe not configured');
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 503 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 });
  }

  const body = await req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errMessage);
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Guardar evento
  await supabase.from('webhook_events').insert({
    source: 'stripe',
    event_type: event.type,
    event_id: event.id,
    payload: event.data.object,
  });
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        const planId = session.metadata?.plan_id;
        const billingCycle = session.metadata?.billing_cycle;
        
        if (organizationId && planId) {
          // Actualizar suscripción
          await supabase
            .from('subscriptions')
            .update({
              plan_id: planId,
              status: 'active',
              billing_cycle: billingCycle,
              stripe_subscription_id: session.subscription as string,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
              ).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('organization_id', organizationId);
          
          // Registrar en historial
          await supabase.from('subscription_history').insert({
            organization_id: organizationId,
            event_type: 'upgraded',
            new_plan_id: planId,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
          });
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Buscar suscripción
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (subscription) {
          // Registrar pago
          await supabase.from('payments').insert({
            organization_id: subscription.organization_id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'succeeded',
            paid_at: new Date().toISOString(),
          });
          
          // Actualizar estado de suscripción
          const periodEnd = invoice.lines?.data?.[0]?.period?.end;
          if (periodEnd) {
            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_end: new Date(periodEnd * 1000).toISOString(),
              })
              .eq('stripe_subscription_id', subscriptionId);
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
          
          await supabase.from('subscription_history').insert({
            organization_id: subscription.organization_id,
            event_type: 'payment_failed',
            metadata: { invoice_id: invoice.id },
          });
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('organization_id, plan_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (sub) {
          // Obtener plan free
          const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('code', 'free')
            .single();
          
          await supabase
            .from('subscriptions')
            .update({
              plan_id: freePlan?.id,
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
          
          await supabase.from('subscription_history').insert({
            organization_id: sub.organization_id,
            event_type: 'canceled',
            previous_plan_id: sub.plan_id,
            new_plan_id: freePlan?.id,
          });
        }
        break;
      }
    }
    
    // Marcar evento como procesado
    await supabase
      .from('webhook_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('event_id', event.id);
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await supabase
      .from('webhook_events')
      .update({ status: 'failed', error_message: errorMessage })
      .eq('event_id', event.id);
    
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
});
