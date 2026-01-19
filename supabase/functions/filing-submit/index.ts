// supabase/functions/filing-submit/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmissionResult {
  success: boolean;
  filingNumber?: string;
  filingDate?: string;
  receiptUrl?: string;
  paymentUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { filingId } = await req.json();

    if (!filingId) {
      return new Response(
        JSON.stringify({ error: 'filingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get filing
    const { data: filing, error: filingError } = await supabase
      .from('filing_applications')
      .select(`
        *,
        trademark_data:filing_trademark_data(*)
      `)
      .eq('id', filingId)
      .single();

    if (filingError || !filing) {
      return new Response(
        JSON.stringify({ error: 'Filing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check status
    if (filing.status !== 'ready') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Filing is not ready for submission. Please validate first.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update to submitting
    await supabase
      .from('filing_applications')
      .update({ status: 'submitting' })
      .eq('id', filingId);

    console.log(`Starting submission for filing ${filingId} to office ${filing.office_code}`);

    // Get connector based on office
    const result = await submitToOffice(supabase, filing);

    if (result.success) {
      // Success - update filing
      await supabase
        .from('filing_applications')
        .update({
          status: 'submitted',
          official_filing_number: result.filingNumber,
          official_filing_date: result.filingDate,
          official_receipt_url: result.receiptUrl,
          submission_method: 'api',
          submission_attempts: filing.submission_attempts + 1,
          last_submission_at: new Date().toISOString(),
          submitted_at: new Date().toISOString(),
          submitted_by: userId,
        })
        .eq('id', filingId);

      // Log communication
      await supabase.from('filing_communication_logs').insert({
        filing_id: filingId,
        direction: 'outbound',
        comm_type: 'api_request',
        success: true,
        sent_at: new Date().toISOString(),
      });

      console.log(`Filing ${filingId} submitted successfully: ${result.filingNumber}`);

      return new Response(
        JSON.stringify({
          success: true,
          filingNumber: result.filingNumber,
          filingDate: result.filingDate,
          receiptUrl: result.receiptUrl,
          paymentUrl: result.paymentUrl,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Error - update filing
      await supabase
        .from('filing_applications')
        .update({
          status: 'error',
          submission_attempts: filing.submission_attempts + 1,
          last_submission_at: new Date().toISOString(),
        })
        .eq('id', filingId);

      // Log communication
      await supabase.from('filing_communication_logs').insert({
        filing_id: filingId,
        direction: 'outbound',
        comm_type: 'api_request',
        success: false,
        error_code: result.errorCode,
        error_message: result.errorMessage,
        sent_at: new Date().toISOString(),
      });

      console.error(`Filing ${filingId} submission failed: ${result.errorMessage}`);

      return new Response(
        JSON.stringify({
          success: false,
          error: result.errorMessage,
          errorCode: result.errorCode,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Submission error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function submitToOffice(supabase: any, filing: any): Promise<SubmissionResult> {
  const officeCode = filing.office_code;
  
  // Get office credentials
  const { data: credentials } = await supabase
    .from('ipo_credentials')
    .select('credential_data')
    .eq('office_id', filing.office_id)
    .eq('is_active', true)
    .single();

  if (!credentials) {
    return {
      success: false,
      errorCode: 'NO_CREDENTIALS',
      errorMessage: `No hay credenciales configuradas para la oficina ${officeCode}`,
    };
  }

  // Route to appropriate connector
  switch (officeCode) {
    case 'EM':
      return submitToEUIPO(filing, credentials.credential_data);
    case 'ES':
      return submitToOEPM(filing, credentials.credential_data);
    case 'US':
      return submitToUSPTO(filing, credentials.credential_data);
    case 'WO':
      return submitToWIPO(filing, credentials.credential_data);
    case 'GB':
      return submitToUKIPO(filing, credentials.credential_data);
    default:
      return {
        success: false,
        errorCode: 'UNSUPPORTED_OFFICE',
        errorMessage: `Oficina ${officeCode} no soportada para e-filing`,
      };
  }
}

// ============================================
// OFFICE CONNECTORS (Simulated for now)
// ============================================

async function submitToEUIPO(filing: any, credentials: any): Promise<SubmissionResult> {
  console.log('Submitting to EUIPO...');
  
  // In production, implement actual EUIPO API call
  // For now, simulate successful submission
  
  const filingNumber = `EM${new Date().getFullYear()}${Math.floor(Math.random() * 900000 + 100000)}`;
  
  return {
    success: true,
    filingNumber,
    filingDate: new Date().toISOString().split('T')[0],
    receiptUrl: `https://euipo.europa.eu/receipt/${filingNumber}`,
    paymentUrl: `https://euipo.europa.eu/payment/${filingNumber}`,
  };
}

async function submitToOEPM(filing: any, credentials: any): Promise<SubmissionResult> {
  console.log('Submitting to OEPM...');
  
  const filingNumber = `M${new Date().getFullYear()}${Math.floor(Math.random() * 90000 + 10000)}`;
  
  return {
    success: true,
    filingNumber,
    filingDate: new Date().toISOString().split('T')[0],
    receiptUrl: `https://sede.oepm.gob.es/recibo/${filingNumber}`,
    paymentUrl: `https://sede.oepm.gob.es/pago/${filingNumber}`,
  };
}

async function submitToUSPTO(filing: any, credentials: any): Promise<SubmissionResult> {
  console.log('Submitting to USPTO...');
  
  const filingNumber = `${Math.floor(Math.random() * 90 + 10)}/${Math.floor(Math.random() * 900000 + 100000)}`;
  
  return {
    success: true,
    filingNumber,
    filingDate: new Date().toISOString().split('T')[0],
    receiptUrl: `https://tsdr.uspto.gov/receipt/${filingNumber}`,
  };
}

async function submitToWIPO(filing: any, credentials: any): Promise<SubmissionResult> {
  console.log('Submitting to WIPO Madrid...');
  
  const filingNumber = `WO${new Date().getFullYear()}${Math.floor(Math.random() * 90000 + 10000)}`;
  
  return {
    success: true,
    filingNumber,
    filingDate: new Date().toISOString().split('T')[0],
    receiptUrl: `https://www.wipo.int/madrid/receipt/${filingNumber}`,
  };
}

async function submitToUKIPO(filing: any, credentials: any): Promise<SubmissionResult> {
  console.log('Submitting to UKIPO...');
  
  const filingNumber = `UK${Math.floor(Math.random() * 9000000 + 1000000)}`;
  
  return {
    success: true,
    filingNumber,
    filingDate: new Date().toISOString().split('T')[0],
    receiptUrl: `https://www.gov.uk/search-for-trademark/receipt/${filingNumber}`,
  };
}
