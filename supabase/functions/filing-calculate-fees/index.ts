import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fee structures by office (simplified - real implementation would have full fee schedules)
const FEE_STRUCTURES = {
  euipo: {
    trademark: {
      base: 850,
      additionalClass: 50,
      priorityClaim: 0,
      fastTrack: 0, // Fast track is same price if application is correct
    },
    design: {
      base: 350,
      additionalDesign: 175,
      publication: 120,
      deferment: 40,
    },
    patent: {
      base: 0, // EUIPO doesn't handle patents
    }
  },
  oepm: {
    trademark: {
      base: 125.36,
      additionalClass: 81.79,
      priorityClaim: 98.96,
      urgent: 0,
    },
    design: {
      base: 65.43,
      additionalDesign: 32.72,
      publication: 0, // Included in base
    },
    patent: {
      base: 104.69,
      search: 622.73,
      examination: 402.09,
      claims21to30: 15.76,
      claims31plus: 31.51,
    },
    utility_model: {
      base: 78.59,
    }
  },
  uspto: {
    trademark: {
      base: 250, // TEAS Plus
      additionalClass: 250,
      teesStandard: 350,
    },
    design: {
      base: 200,
      small_entity: 100,
      micro_entity: 50,
    },
    patent: {
      base: 320,
      search: 700,
      examination: 800,
      small_entity_discount: 0.5,
      micro_entity_discount: 0.75,
    }
  },
  wipo: {
    trademark: { // Madrid Protocol
      basicFee: 653, // CHF
      complementaryFee: 100, // Per class after 3
      designationFees: {}, // Varies by country
    },
    design: { // Hague System
      basicFee: 397,
      publicationFee: 17,
      designationFee: {}, // Varies by contracting party
    },
    patent: { // PCT
      internationalFilingFee: 1330, // CHF
      searchFee: 1900, // Varies by ISA
      transmittalFee: 0, // Set by receiving office
    }
  },
  ukipo: {
    trademark: {
      base: 170,
      additionalClass: 50,
      online_discount: 0, // Online price shown
    },
    design: {
      base: 50,
      additionalDesign: 25,
    },
    patent: {
      base: 30,
      search: 150,
      examination: 100,
    }
  }
};

interface FeeRequest {
  officeCode: string;
  filingType: string;
  niceClasses?: number[];
  additionalDesigns?: number;
  claimsPriority?: boolean;
  urgent?: boolean;
  entitySize?: 'standard' | 'small' | 'micro';
  designations?: string[];
}

function calculateFees(request: FeeRequest): { 
  fees: Array<{ concept: string; amount: number; currency: string }>;
  total: number;
  currency: string;
  breakdown: string[];
} {
  const officeCode = request.officeCode.toLowerCase();
  const filingType = request.filingType.toLowerCase();
  const fees: Array<{ concept: string; amount: number; currency: string }> = [];
  const breakdown: string[] = [];
  
  const officeStructure = FEE_STRUCTURES[officeCode as keyof typeof FEE_STRUCTURES];
  if (!officeStructure) {
    return { fees: [], total: 0, currency: 'EUR', breakdown: ['Office not supported for fee calculation'] };
  }

  const typeStructure = officeStructure[filingType as keyof typeof officeStructure];
  if (!typeStructure) {
    return { fees: [], total: 0, currency: 'EUR', breakdown: ['Filing type not supported for this office'] };
  }

  // Determine currency
  let currency = 'EUR';
  if (officeCode === 'uspto') currency = 'USD';
  if (officeCode === 'wipo') currency = 'CHF';
  if (officeCode === 'ukipo') currency = 'GBP';

  // Calculate based on filing type
  if (filingType === 'trademark') {
    // Base fee
    const baseFee = (typeStructure as any).base || 0;
    fees.push({ concept: 'Tasa base de solicitud', amount: baseFee, currency });
    breakdown.push(`Tasa base: ${baseFee} ${currency}`);

    // Additional classes
    const niceClasses = request.niceClasses || [];
    const includedClasses = officeCode === 'wipo' ? 3 : 1;
    const additionalClasses = Math.max(0, niceClasses.length - includedClasses);
    
    if (additionalClasses > 0) {
      const additionalFee = (typeStructure as any).additionalClass || 0;
      const totalAdditional = additionalFee * additionalClasses;
      fees.push({ concept: `Clases adicionales (${additionalClasses})`, amount: totalAdditional, currency });
      breakdown.push(`${additionalClasses} clases adicionales x ${additionalFee} = ${totalAdditional} ${currency}`);
    }

    // Priority claim
    if (request.claimsPriority && (typeStructure as any).priorityClaim) {
      const priorityFee = (typeStructure as any).priorityClaim;
      fees.push({ concept: 'Reivindicación de prioridad', amount: priorityFee, currency });
      breakdown.push(`Prioridad: ${priorityFee} ${currency}`);
    }

    // Urgent/fast track
    if (request.urgent && (typeStructure as any).urgent) {
      const urgentFee = (typeStructure as any).urgent;
      fees.push({ concept: 'Tramitación urgente', amount: urgentFee, currency });
      breakdown.push(`Urgente: ${urgentFee} ${currency}`);
    }
  }

  if (filingType === 'design') {
    const baseFee = (typeStructure as any).base || 0;
    fees.push({ concept: 'Tasa base de diseño', amount: baseFee, currency });
    breakdown.push(`Tasa base: ${baseFee} ${currency}`);

    const additionalDesigns = request.additionalDesigns || 0;
    if (additionalDesigns > 0) {
      const additionalFee = (typeStructure as any).additionalDesign || 0;
      const totalAdditional = additionalFee * additionalDesigns;
      fees.push({ concept: `Diseños adicionales (${additionalDesigns})`, amount: totalAdditional, currency });
      breakdown.push(`${additionalDesigns} diseños adicionales = ${totalAdditional} ${currency}`);
    }

    if ((typeStructure as any).publication) {
      const pubFee = (typeStructure as any).publication;
      fees.push({ concept: 'Tasa de publicación', amount: pubFee, currency });
      breakdown.push(`Publicación: ${pubFee} ${currency}`);
    }
  }

  if (filingType === 'patent') {
    let baseFee = (typeStructure as any).base || 0;
    
    // Entity size discounts (USPTO)
    if (request.entitySize === 'small' && (typeStructure as any).small_entity_discount) {
      baseFee = baseFee * (1 - (typeStructure as any).small_entity_discount);
    } else if (request.entitySize === 'micro' && (typeStructure as any).micro_entity_discount) {
      baseFee = baseFee * (1 - (typeStructure as any).micro_entity_discount);
    }
    
    fees.push({ concept: 'Tasa base de patente', amount: baseFee, currency });
    breakdown.push(`Tasa base: ${baseFee} ${currency}`);

    if ((typeStructure as any).search) {
      const searchFee = (typeStructure as any).search;
      fees.push({ concept: 'Tasa de búsqueda', amount: searchFee, currency });
      breakdown.push(`Búsqueda: ${searchFee} ${currency}`);
    }

    if ((typeStructure as any).examination) {
      const examFee = (typeStructure as any).examination;
      fees.push({ concept: 'Tasa de examen', amount: examFee, currency });
      breakdown.push(`Examen: ${examFee} ${currency}`);
    }
  }

  const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
  breakdown.push(`---`);
  breakdown.push(`TOTAL: ${total.toFixed(2)} ${currency}`);

  return { fees, total, currency, breakdown };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: FeeRequest = await req.json();
    console.log('Calculating fees for:', body);

    // Validate required fields
    if (!body.officeCode || !body.filingType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Office code and filing type are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = calculateFees(body);

    console.log('Fee calculation result:', result);

    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Fee calculation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
