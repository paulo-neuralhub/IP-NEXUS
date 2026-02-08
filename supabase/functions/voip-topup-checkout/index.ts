import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MINUTE_PACKS: Record<number, { minutes: number; cents: number; label: string }> = {
  100: { minutes: 100, cents: 990, label: '100 minutos VoIP' },
  500: { minutes: 500, cents: 3990, label: '500 minutos VoIP' },
  1000: { minutes: 1000, cents: 6990, label: '1.000 minutos VoIP' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { minutes, successUrl, cancelUrl } = await req.json();
    const pack = MINUTE_PACKS[minutes];
    if (!pack) {
      return new Response(JSON.stringify({ error: 'Invalid pack' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get org
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'No organization' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Check/create Stripe customer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    let customerId = existingCustomer?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { organization_id: membership.organization_id, user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from('stripe_customers').insert({
        organization_id: membership.organization_id,
        stripe_customer_id: customerId,
        email: user.email,
      });
    }

    const appUrl = Deno.env.get('APP_URL') || req.headers.get('origin') || 'https://ip-nexus.com';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: pack.cents,
            product_data: {
              name: pack.label,
              description: `Recarga de ${pack.minutes} minutos para telefonía IP-NEXUS`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'voip_topup',
        minutes: String(pack.minutes),
        organization_id: membership.organization_id,
      },
      success_url: successUrl || `${appUrl}/app/settings?tab=voip&topup=success`,
      cancel_url: cancelUrl || `${appUrl}/app/settings?tab=voip`,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('VoIP topup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
