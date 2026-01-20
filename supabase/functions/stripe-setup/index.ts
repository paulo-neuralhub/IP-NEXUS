import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetupProduct {
  name: string;
  description: string;
  module_code: string;
  features: Array<{ name: string; included: boolean }>;
  prices: Array<{
    nickname: string;
    unit_amount: number;
    currency: string;
    recurring: { interval: 'month' | 'year' };
  }>;
}

const PRODUCTS: SetupProduct[] = [
  {
    name: 'IP-NEXUS Starter',
    description: 'Plan gratuito con límites básicos',
    module_code: 'starter_pack',
    features: [
      { name: 'Docket Basic (50 matters)', included: true },
      { name: 'CRM Basic (100 contacts)', included: true },
      { name: 'Genius Basic (100 queries/month)', included: true },
      { name: '3 users', included: true }
    ],
    prices: [
      { nickname: 'Starter Free', unit_amount: 0, currency: 'eur', recurring: { interval: 'month' } }
    ]
  },
  {
    name: 'IP-NEXUS Professional',
    description: 'Plan más popular para equipos',
    module_code: 'professional_pack',
    features: [
      { name: 'Docket Pro (unlimited)', included: true },
      { name: 'CRM Pro (unlimited)', included: true },
      { name: 'Marketing Basic', included: true },
      { name: 'Finance Basic', included: true },
      { name: 'Spider Basic (5 watchlists)', included: true },
      { name: 'Genius Pro (1000 queries/month)', included: true },
      { name: 'Analytics Basic', included: true },
      { name: '10 users', included: true }
    ],
    prices: [
      { nickname: 'Professional Monthly', unit_amount: 29900, currency: 'eur', recurring: { interval: 'month' } },
      { nickname: 'Professional Yearly', unit_amount: 287040, currency: 'eur', recurring: { interval: 'year' } }
    ]
  },
  {
    name: 'IP-NEXUS Enterprise',
    description: 'Para grandes despachos y corporaciones',
    module_code: 'enterprise_pack',
    features: [
      { name: 'All modules included', included: true },
      { name: 'Legal Ops suite', included: true },
      { name: 'Client Portal', included: true },
      { name: 'API Access', included: true },
      { name: 'White Label option', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Unlimited users', included: true }
    ],
    prices: [
      { nickname: 'Enterprise Monthly', unit_amount: 99900, currency: 'eur', recurring: { interval: 'month' } },
      { nickname: 'Enterprise Yearly', unit_amount: 959040, currency: 'eur', recurring: { interval: 'year' } }
    ]
  },
  {
    name: 'Spider Pro Addon',
    description: 'Vigilancia avanzada de PI',
    module_code: 'spider',
    features: [
      { name: '25 watchlists', included: true },
      { name: 'Global coverage', included: true },
      { name: 'Domain monitoring', included: true },
      { name: 'Daily scans', included: true }
    ],
    prices: [
      { nickname: 'Spider Pro Monthly', unit_amount: 14900, currency: 'eur', recurring: { interval: 'month' } }
    ]
  },
  {
    name: 'Genius Pro Addon',
    description: 'IA avanzada con más queries',
    module_code: 'genius',
    features: [
      { name: '5000 queries/month', included: true },
      { name: 'Document analysis', included: true },
      { name: 'Multi-language support', included: true }
    ],
    prices: [
      { nickname: 'Genius Pro Monthly', unit_amount: 9900, currency: 'eur', recurring: { interval: 'month' } }
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results: any[] = [];

    for (const product of PRODUCTS) {
      // Generate mock Stripe IDs if no Stripe key
      const stripeProductId = STRIPE_SECRET_KEY 
        ? `prod_${crypto.randomUUID().slice(0, 8)}`
        : `mock_prod_${product.module_code}`;

      // Insert product into database
      const { data: dbProduct, error: productError } = await supabase
        .from('stripe_products')
        .upsert({
          stripe_product_id: stripeProductId,
          name: product.name,
          description: product.description,
          module_code: product.module_code,
          features: product.features,
          active: true
        }, { onConflict: 'stripe_product_id' })
        .select()
        .single();

      if (productError) {
        console.error('Product error:', productError);
        continue;
      }

      // Insert prices
      for (const price of product.prices) {
        const stripePriceId = STRIPE_SECRET_KEY
          ? `price_${crypto.randomUUID().slice(0, 8)}`
          : `mock_price_${product.module_code}_${price.recurring.interval}`;

        await supabase
          .from('stripe_prices')
          .upsert({
            stripe_price_id: stripePriceId,
            stripe_product_id: stripeProductId,
            currency: price.currency,
            unit_amount: price.unit_amount,
            recurring_interval: price.recurring.interval,
            nickname: price.nickname,
            active: true
          }, { onConflict: 'stripe_price_id' });
      }

      results.push({ product: product.name, status: 'created' });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
