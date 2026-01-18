import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to continue.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { plan_id, billing_cycle, success_url, cancel_url } = await req.json();
    
    // Obtener usuario autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener organización del usuario
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, organizations(*)')
      .eq('user_id', user.id)
      .single();
    
    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'No organization found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener plan
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();
    
    if (!plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Obtener o crear customer de Stripe
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', membership.organization_id)
      .single();
    
    let customerId = subscription?.stripe_customer_id;
    const org = membership.organizations as any;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org?.name || 'IP-NEXUS Customer',
        metadata: {
          organization_id: membership.organization_id,
          user_id: user.id,
        },
      });
      customerId = customer.id;
      
      // Guardar customer ID
      await supabase
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('organization_id', membership.organization_id);
    }
    
    // Determinar precio
    const price = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    
    // Crear sesión de checkout
    const appUrl = Deno.env.get('APP_URL') || 'https://id-preview--ec943dde-ae1e-40db-be06-10d553dd2119.lovable.app';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: (plan.currency || 'EUR').toLowerCase(),
            product_data: {
              name: `IP-NEXUS ${plan.name}`,
              description: plan.description || `Plan ${plan.name}`,
            },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval: billing_cycle === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: success_url || `${appUrl}/app/settings/billing?success=true`,
      cancel_url: cancel_url || `${appUrl}/app/settings/billing?canceled=true`,
      metadata: {
        organization_id: membership.organization_id,
        plan_id: plan.id,
        billing_cycle,
      },
      subscription_data: {
        metadata: {
          organization_id: membership.organization_id,
          plan_id: plan.id,
        },
      },
    });
    
    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
