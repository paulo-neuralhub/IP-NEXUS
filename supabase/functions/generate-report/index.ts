import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | undefined;
  
  try {
    const body = await req.json();
    reportId = body.report_id;
    
    // deno-lint-ignore no-explicit-any
    const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obtener informe
    const { data: report, error: reportError } = await supabase
      .from('generated_reports')
      .select(`
        *,
        template:report_templates(*)
      `)
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      throw new Error('Report not found');
    }
    
    // Marcar como generando
    await supabase
      .from('generated_reports')
      .update({ status: 'generating' })
      .eq('id', reportId);
    
    // Obtener datos según tipo de informe
    let reportData: Record<string, unknown>;
    let totalRecords = 0;
    
    const params = report.parameters || {};
    
    switch (report.report_type) {
      case 'portfolio_summary':
        reportData = await getPortfolioData(supabase, report.organization_id, params);
        totalRecords = Array.isArray(reportData.matters) ? reportData.matters.length : 0;
        break;
      
      case 'deadline_report':
        reportData = await getDeadlineData(supabase, report.organization_id, params);
        totalRecords = Array.isArray(reportData.deadlines) ? reportData.deadlines.length : 0;
        break;
      
      case 'renewal_forecast':
        reportData = await getRenewalData(supabase, report.organization_id, params);
        totalRecords = Array.isArray(reportData.renewals) ? reportData.renewals.length : 0;
        break;
      
      case 'cost_analysis':
        reportData = await getCostData(supabase, report.organization_id, params);
        totalRecords = Array.isArray(reportData.costs) ? reportData.costs.length : 0;
        break;
      
      case 'matter_detail':
        reportData = await getMatterDetailData(supabase, params.matter_id as string);
        totalRecords = 1;
        break;
      
      default:
        reportData = { params, message: 'Custom report - no specific data fetch implemented' };
    }
    
    // Generar contenido (en producción usar una librería de PDF real)
    const reportContent = JSON.stringify({
      title: report.name,
      type: report.report_type,
      generatedAt: new Date().toISOString(),
      data: reportData,
    }, null, 2);
    
    const contentBlob = new TextEncoder().encode(reportContent);
    
    // Intentar subir a storage (puede fallar si bucket no existe)
    let publicUrl: string | null = null;
    try {
      const fileName = `reports/${report.organization_id}/${reportId}.json`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, contentBlob, {
          contentType: 'application/json',
          upsert: true,
        });
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        publicUrl = urlData?.publicUrl || null;
      }
    } catch (storageError) {
      console.error('Storage error (continuing without file):', storageError);
    }
    
    const generationTime = Date.now() - startTime;
    
    // Actualizar informe
    await supabase
      .from('generated_reports')
      .update({
        status: 'completed',
        file_url: publicUrl,
        file_size: contentBlob.length,
        generated_at: new Date().toISOString(),
        metadata: {
          total_records: totalRecords,
          generation_time_ms: generationTime,
        },
      })
      .eq('id', reportId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        file_url: publicUrl,
        total_records: totalRecords,
        generation_time_ms: generationTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (err) {
    const error = err as Error;
    console.error('Report generation error:', error);
    
    // Intentar marcar como fallido
    if (reportId) {
      try {
        // deno-lint-ignore no-explicit-any
        const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('generated_reports')
          .update({ 
            status: 'failed',
            error_message: error.message || 'Unknown error',
          })
          .eq('id', reportId);
      } catch (updateError) {
        console.error('Error updating failed status:', updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Funciones de obtención de datos
// deno-lint-ignore no-explicit-any
async function getPortfolioData(supabase: SupabaseClient<any>, orgId: string, _params: Record<string, unknown>) {
  const { data: matters } = await supabase
    .from('matters')
    .select('*')
    .eq('organization_id', orgId)
    .order('reference');
  
  // Estadísticas por tipo
  const statsByType: Record<string, number> = {};
  const statsByStatus: Record<string, number> = {};
  
  // deno-lint-ignore no-explicit-any
  matters?.forEach((m: any) => {
    const ipType = m.type || 'unknown';
    statsByType[ipType] = (statsByType[ipType] || 0) + 1;
    statsByStatus[m.status] = (statsByStatus[m.status] || 0) + 1;
  });
  
  return { 
    matters, 
    stats: {
      total: matters?.length || 0,
      byType: statsByType,
      byStatus: statsByStatus,
    }
  };
}

// deno-lint-ignore no-explicit-any
async function getDeadlineData(supabase: SupabaseClient<any>, orgId: string, params: Record<string, unknown>) {
  const daysAhead = (params.days_ahead as number) || 90;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  // Try to get deadlines from matters table activities or a generic approach
  const { data: matters } = await supabase
    .from('matters')
    .select('id, reference, title, type, next_deadline')
    .eq('organization_id', orgId)
    .not('next_deadline', 'is', null)
    .lte('next_deadline', futureDate.toISOString())
    .order('next_deadline');
  
  return { deadlines: matters || [] };
}

// deno-lint-ignore no-explicit-any
async function getRenewalData(supabase: SupabaseClient<any>, orgId: string, params: Record<string, unknown>) {
  const monthsAhead = (params.months_ahead as number) || 12;
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);
  
  const { data: renewals } = await supabase
    .from('renewal_schedule')
    .select(`
      *,
      matter:matters(reference, title, type)
    `)
    .eq('organization_id', orgId)
    .lte('due_date', futureDate.toISOString())
    .order('due_date');
  
  return { renewals: renewals || [] };
}

// deno-lint-ignore no-explicit-any
async function getCostData(supabase: SupabaseClient<any>, orgId: string, params: Record<string, unknown>) {
  let query = supabase
    .from('matter_costs')
    .select(`
      *,
      matter:matters(reference, title)
    `)
    .eq('organization_id', orgId);
  
  if (params.date_from) {
    query = query.gte('cost_date', params.date_from as string);
  }
  if (params.date_to) {
    query = query.lte('cost_date', params.date_to as string);
  }
  
  const { data: costs } = await query.order('cost_date', { ascending: false });
  
  // Calcular totales
  // deno-lint-ignore no-explicit-any
  const totalAmount = costs?.reduce((sum: number, c: any) => sum + (c.total_amount || 0), 0) || 0;
  
  return { costs: costs || [], summary: { totalAmount, count: costs?.length || 0 } };
}

// deno-lint-ignore no-explicit-any
async function getMatterDetailData(supabase: SupabaseClient<any>, matterId: string) {
  const { data: matter } = await supabase
    .from('matters')
    .select(`
      *,
      documents:matter_documents(*),
      costs:matter_costs(*)
    `)
    .eq('id', matterId)
    .single();
  
  return { matter };
}
