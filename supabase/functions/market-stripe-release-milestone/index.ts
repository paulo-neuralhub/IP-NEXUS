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

    const { milestoneId } = await req.json();
    if (!milestoneId) {
      return new Response(JSON.stringify({ error: 'milestoneId required' }), { status: 400, headers: corsHeaders });
    }

    // Fetch milestone + transaction
    const { data: milestone, error: msErr } = await supabase
      .from('market_milestones')
      .select('*, market_service_transactions!inner(*)')
      .eq('id', milestoneId)
      .single();

    if (msErr || !milestone) {
      return new Response(JSON.stringify({ error: 'Milestone not found' }), { status: 404, headers: corsHeaders });
    }

    const tx = (milestone as any).market_service_transactions;

    // Only buyer can approve milestone releases
    if (tx.buyer_user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Only buyer can release funds' }), { status: 403, headers: corsHeaders });
    }

    if (milestone.payment_released) {
      return new Response(JSON.stringify({ error: 'Funds already released' }), { status: 400, headers: corsHeaders });
    }

    if (milestone.status !== 'delivered') {
      return new Response(JSON.stringify({ error: 'Milestone not delivered yet' }), { status: 400, headers: corsHeaders });
    }

    if (!tx.stripe_connected_account_id || !tx.stripe_payment_intent_id) {
      return new Response(JSON.stringify({ error: 'No Stripe payment found' }), { status: 400, headers: corsHeaders });
    }

    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Calculate release amount (milestone amount minus seller fee proportion)
    const milestoneAmount = milestone.amount || 0;
    const releaseAmountCents = Math.round(milestoneAmount * 100);

    // Create a transfer to the connected account for this milestone
    const transfer = await stripe.transfers.create({
      amount: releaseAmountCents,
      currency: (tx.currency || 'eur').toLowerCase(),
      destination: tx.stripe_connected_account_id,
      transfer_group: tx.id,
      metadata: {
        transaction_id: tx.id,
        milestone_id: milestoneId,
        milestone_name: milestone.name,
      },
    });

    // Update milestone
    await supabase
      .from('market_milestones')
      .update({
        status: 'approved',
        payment_released: true,
        payment_released_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
      })
      .eq('id', milestoneId);

    // Update transaction escrow amounts
    const newReleased = (tx.escrow_released || 0) + milestoneAmount;
    await supabase
      .from('market_service_transactions')
      .update({
        escrow_released: newReleased,
        stripe_transfer_id: transfer.id,
      })
      .eq('id', tx.id);

    // Log platform fee
    const sellerFeePct = tx.platform_fee_seller && tx.professional_fees
      ? (tx.platform_fee_seller / tx.professional_fees) * 100
      : 10;
    const milestoneFee = milestoneAmount * (sellerFeePct / 100);

    await supabase.from('market_platform_fees').insert({
      transaction_id: tx.id,
      milestone_id: milestoneId,
      fee_type: 'seller_fee',
      amount: milestoneFee,
      percentage: sellerFeePct,
      collected: true,
      collected_at: new Date().toISOString(),
    });

    // Notify seller
    await supabase.from('market_notifications').insert({
      user_id: tx.seller_user_id,
      organization_id: tx.seller_organization_id,
      type: 'milestone_approved',
      title: 'Milestone aprobado',
      message: `Milestone "${milestone.name}" aprobado. €${milestoneAmount.toFixed(2)} liberados.`,
      transaction_id: tx.id,
    });

    return new Response(
      JSON.stringify({ success: true, transferId: transfer.id, amountReleased: milestoneAmount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Release milestone error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
