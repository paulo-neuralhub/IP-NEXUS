import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!stripeKey || !webhookSecret) {
    console.log('Stripe not configured - webhook disabled');
    return new Response(
      JSON.stringify({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Backoffice.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400, headers: corsHeaders });
    }

    // Import Stripe dynamically
    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: corsHeaders });
    }

    console.log(`Processing Stripe event: ${event.type}`);

    // Log event
    await supabase.from('billing_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
      status: 'processing'
    });

    // Handle events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, stripe, event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
      case 'invoice.paid':
        console.log(`Invoice paid: ${event.data.object.id}`);
        break;
      case 'invoice.payment_failed':
        console.log(`Payment failed for invoice: ${event.data.object.id}`);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
    }

    // Mark as processed
    await supabase
      .from('billing_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function handleSubscriptionUpdate(supabase: any, stripe: any, subscription: any) {
  const items = subscription.items.data.map((item: any) => ({
    id: item.id,
    price_id: item.price.id,
    product_id: item.price.product,
    quantity: item.quantity,
    module_code: item.price.metadata?.module_code
  }));

  await supabase.from('subscriptions').upsert({
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer.toString(),
    status: subscription.status,
    items: items,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  }, { onConflict: 'stripe_subscription_id' });
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', canceled_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleCheckoutCompleted(supabase: any, session: any) {
  if (session.metadata?.organization_id && session.customer) {
    await supabase.from('stripe_customers').upsert({
      organization_id: session.metadata.organization_id,
      stripe_customer_id: session.customer.toString(),
      email: session.customer_email,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' });
  }

  // L33-PAGOS: Stripe Payment Links
  // checkout.session.completed includes `payment_link` when the session originated from a Payment Link.
  if (session.payment_link) {
    const stripePaymentLinkId = session.payment_link.toString();

    // 1) Fetch + mark payment link completed
    const { data: pl } = await supabase
      .from('payment_links')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('stripe_payment_link_id', stripePaymentLinkId)
      .select('*')
      .maybeSingle();

    const invoiceId = pl?.invoice_id;
    const organizationId = pl?.organization_id;
    const amount = pl?.amount ?? null;
    const currency = pl?.currency ?? 'EUR';

    if (!invoiceId || !organizationId) return;

    // 2) Mark invoice as paid
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_amount: amount ?? undefined,
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'stripe',
        payment_reference: session.payment_intent?.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    // 3) Insert payment ledger row
    if (amount !== null) {
      await supabase.from('invoice_payments').insert({
        organization_id: organizationId,
        invoice_id: invoiceId,
        payment_link_id: pl?.id ?? null,
        amount,
        currency,
        method: 'stripe',
        stripe_payment_intent_id: session.payment_intent?.toString(),
        paid_at: new Date().toISOString(),
      });
    }
  }
}
