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

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { transactionId } = await req.json();
    if (!transactionId) {
      return new Response(JSON.stringify({ error: 'transactionId required' }), { status: 400, headers: corsHeaders });
    }

    // Fetch transaction
    const { data: tx, error: txErr } = await supabase
      .from('market_service_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txErr || !tx) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404, headers: corsHeaders });
    }

    // Verify buyer
    if (tx.buyer_user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Not the buyer' }), { status: 403, headers: corsHeaders });
    }

    if (tx.status !== 'pending_payment') {
      return new Response(JSON.stringify({ error: 'Transaction not in pending_payment status' }), { status: 400, headers: corsHeaders });
    }

    // Get seller's Stripe Connect account
    const { data: sellerProfile } = await supabase
      .from('market_agent_profiles')
      .select('stripe_connected_account_id')
      .eq('organization_id', tx.seller_organization_id)
      .single();

    if (!sellerProfile?.stripe_connected_account_id) {
      return new Response(JSON.stringify({ error: 'Seller has no Stripe account' }), { status: 400, headers: corsHeaders });
    }

    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const totalAmountCents = Math.round((tx.total_amount || 0) * 100);
    const platformFeeCents = Math.round(
      ((tx.platform_fee_buyer || 0) + (tx.platform_fee_seller || 0)) * 100
    );

    // Create PaymentIntent with manual transfer (escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: (tx.currency || 'eur').toLowerCase(),
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: sellerProfile.stripe_connected_account_id,
      },
      // Manual transfers for escrow — funds held until milestones complete
      capture_method: 'automatic',
      metadata: {
        transaction_id: transactionId,
        buyer_user_id: user.id,
        seller_organization_id: tx.seller_organization_id,
      },
    });

    // Update transaction with Stripe IDs
    await supabase
      .from('market_service_transactions')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_connected_account_id: sellerProfile.stripe_connected_account_id,
      })
      .eq('id', transactionId);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
