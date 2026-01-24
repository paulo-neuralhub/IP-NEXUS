import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body = { invoiceId: string };

function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return new Response(
      JSON.stringify({ error: 'Stripe no configurado. Añade STRIPE_SECRET_KEY en secrets.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase env not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.invoiceId) {
      return new Response(JSON.stringify({ error: 'invoiceId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch invoice + items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(
        `
        id,
        organization_id,
        invoice_number,
        total,
        currency,
        items:invoice_items(id, description, quantity, unit_price, subtotal)
      `
      )
      .eq('id', body.invoiceId)
      .single();
    if (invoiceError || !invoice) throw invoiceError;

    // Authorization: require org membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', invoice.organization_id)
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (!membership) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If an active link already exists, return it
    const { data: existing } = await supabase
      .from('payment_links')
      .select('stripe_url, qr_code_url')
      .eq('invoice_id', invoice.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (existing?.stripe_url && existing?.qr_code_url) {
      return new Response(JSON.stringify({ url: existing.stripe_url, qrCode: existing.qr_code_url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stripe Payment Link
    const { default: Stripe } = await import('https://esm.sh/stripe@13.0.0');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const currency = (invoice.currency || 'EUR').toLowerCase();
    const items = Array.isArray(invoice.items) ? invoice.items : [];

    // Create per-line Prices so the payment link reflects invoice lines.
    // (Stripe Payment Links require Prices; we create ephemeral products/prices per invoice.)
    const lineItems: Array<{ price: string; quantity: number }> = [];

    if (items.length) {
      for (const it of items as any[]) {
        const name = (it.description || '').slice(0, 120) || `Línea factura ${invoice.invoice_number}`;
        const unitAmount = Math.max(0, Math.round((Number(it.unit_price || 0) || 0) * 100));
        const quantity = Math.max(1, Number(it.quantity || 1));

        const product = await stripe.products.create({ name });
        const price = await stripe.prices.create({
          currency,
          unit_amount: unitAmount,
          product: product.id,
        });

        lineItems.push({ price: price.id, quantity });
      }
    } else {
      const product = await stripe.products.create({ name: `Factura ${invoice.invoice_number}` });
      const price = await stripe.prices.create({
        currency,
        unit_amount: Math.max(0, Math.round((Number(invoice.total || 0) || 0) * 100)),
        product: product.id,
      });
      lineItems.push({ price: price.id, quantity: 1 });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://ip-nexus.com';
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      metadata: {
        invoice_id: invoice.id,
        organization_id: invoice.organization_id,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${appUrl}/app/finance/invoices/${invoice.id}`,
        },
      },
    });

    if (!paymentLink.url) {
      return new Response(JSON.stringify({ error: 'Stripe payment link missing URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const expiresAt = addDaysIso(30);
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentLink.url)}`;

    const { error: plError } = await supabase.from('payment_links').insert({
      organization_id: invoice.organization_id,
      invoice_id: invoice.id,
      stripe_payment_link_id: paymentLink.id,
      stripe_url: paymentLink.url,
      amount: invoice.total || 0,
      currency: invoice.currency || 'EUR',
      status: 'active',
      expires_at: expiresAt,
      qr_code_url: qrCode,
    });
    if (plError) throw plError;

    return new Response(JSON.stringify({ url: paymentLink.url, qrCode }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('create-payment-link error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
