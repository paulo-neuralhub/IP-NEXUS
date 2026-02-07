import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { returnUrl } = await req.json();
    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Get user's organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 400, headers: corsHeaders });
    }

    // Check if profile already exists
    const { data: profile } = await supabase
      .from('market_agent_profiles')
      .select('stripe_connected_account_id')
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    let accountId = profile?.stripe_connected_account_id;

    if (!accountId) {
      // Create Express connected account
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: {
          organization_id: membership.organization_id,
          user_id: user.id,
        },
      });
      accountId = account.id;

      // Upsert profile with Stripe account
      await supabase
        .from('market_agent_profiles')
        .upsert({
          organization_id: membership.organization_id,
          stripe_connected_account_id: accountId,
          stripe_onboarding_complete: false,
          display_name: user.user_metadata?.full_name || user.email || 'Agent',
        }, { onConflict: 'organization_id' });
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl || `${req.headers.get('origin')}/app/market/profile`,
      return_url: returnUrl || `${req.headers.get('origin')}/app/market/profile`,
      type: 'account_onboarding',
    });

    return new Response(
      JSON.stringify({ url: accountLink.url, accountId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Stripe onboard error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
