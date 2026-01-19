import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportParams {
  date_from?: string;
  date_to?: string;
  client_id?: string;
  office_code?: string;
  ip_type?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientType = any;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { reportId, params, format = 'json' } = await req.json();

    if (!reportId) {
      return new Response(
        JSON.stringify({ error: 'reportId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get organization from user membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ error: 'No organization found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const organizationId = membership.organization_id;

    // Get report definition
    const { data: report, error: reportError } = await supabase
      .from('report_definitions')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('report_executions')
      .insert({
        report_id: reportId,
        organization_id: organizationId,
        parameters: params || {},
        status: 'running',
        triggered_by: 'manual',
        executed_by: user.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (execError) {
      console.error('Error creating execution:', execError);
      return new Response(
        JSON.stringify({ error: 'Failed to create execution' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();

    try {
      // Process report based on config
      const result = await processReport(supabase, report, organizationId, params || {});

      // Update execution with success
      await supabase
        .from('report_executions')
        .update({
          status: 'completed',
          result_summary: {
            rows: result.data?.length || 0,
            charts: result.charts?.length || 0,
            metrics_count: Object.keys(result.metrics || {}).length,
            generation_time_ms: Date.now() - startTime,
          },
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      // Update report run count
      await supabase
        .from('report_definitions')
        .update({
          run_count: (report.run_count || 0) + 1,
          last_run_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      return new Response(
        JSON.stringify({
          success: true,
          executionId: execution.id,
          result,
          generatedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (processError: unknown) {
      const errorMessage = processError instanceof Error ? processError.message : 'Unknown error';
      
      // Update execution with error
      await supabase
        .from('report_executions')
        .update({
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      console.error('Error processing report:', processError);
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analytics-run-report:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Process report based on its configuration
async function processReport(
  supabase: SupabaseClientType,
  report: Record<string, unknown>,
  organizationId: string,
  params: ReportParams
): Promise<{
  data: unknown[];
  charts: unknown[];
  metrics: Record<string, unknown>;
}> {
  const config = report.config as Record<string, unknown> || {};
  const result: {
    data: unknown[];
    charts: unknown[];
    metrics: Record<string, unknown>;
  } = {
    data: [],
    charts: [],
    metrics: {},
  };

  // Get base stats using direct query instead of RPC
  const { data: mattersData } = await supabase
    .from('matters')
    .select('id, ip_type, status, expiry_date')
    .eq('organization_id', organizationId);

  const matters = mattersData || [];
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  result.metrics = {
    total_matters: matters.length,
    total_trademarks: matters.filter((m: any) => m.ip_type === 'trademark').length,
    total_patents: matters.filter((m: any) => m.ip_type === 'patent').length,
    total_designs: matters.filter((m: any) => m.ip_type === 'design').length,
    registered: matters.filter((m: any) => m.status === 'registered').length,
    pending: matters.filter((m: any) => m.status === 'pending').length,
    expiring_30d: matters.filter((m: any) => m.expiry_date && new Date(m.expiry_date) <= in30Days && new Date(m.expiry_date) >= now).length,
  };

  // Process based on category
  const category = report.category as string;
  
  switch (category) {
    case 'portfolio':
      result.charts = await getPortfolioCharts(supabase, organizationId, params);
      result.data = await getPortfolioData(supabase, organizationId, params);
      break;
      
    case 'costs':
      result.charts = await getCostCharts(supabase, organizationId, params);
      result.data = await getCostData(supabase, organizationId, params);
      break;
      
    case 'activity':
      result.data = await getActivityData(supabase, organizationId, params);
      break;
      
    case 'client':
      if (params.client_id) {
        result.data = await getClientData(supabase, organizationId, params.client_id);
      }
      break;
      
    default:
      result.data = await getGenericData(supabase, organizationId, config);
  }

  return result;
}

async function getPortfolioCharts(
  supabase: SupabaseClientType,
  organizationId: string,
  params: ReportParams
): Promise<unknown[]> {
  const charts = [];

  // Get matters for grouping
  const { data: matters } = await supabase
    .from('matters')
    .select('ip_type, status, office_code')
    .eq('organization_id', organizationId);

  if (matters) {
    // Group by type
    const byType = matters.reduce((acc: Record<string, number>, m: any) => {
      acc[m.ip_type || 'other'] = (acc[m.ip_type || 'other'] || 0) + 1;
      return acc;
    }, {});
    charts.push({ id: 'assets_by_type', type: 'pie', title: 'Por Tipo', data: Object.entries(byType).map(([label, value]) => ({ label, value })) });

    // Group by status
    const byStatus = matters.reduce((acc: Record<string, number>, m: any) => {
      acc[m.status || 'unknown'] = (acc[m.status || 'unknown'] || 0) + 1;
      return acc;
    }, {});
    charts.push({ id: 'assets_by_status', type: 'pie', title: 'Por Estado', data: Object.entries(byStatus).map(([label, value]) => ({ label, value })) });

    // Group by country
    const byCountry = matters.reduce((acc: Record<string, number>, m: any) => {
      acc[m.office_code || 'Sin oficina'] = (acc[m.office_code || 'Sin oficina'] || 0) + 1;
      return acc;
    }, {});
    charts.push({ id: 'assets_by_country', type: 'bar', title: 'Por País', data: Object.entries(byCountry).slice(0, 10).map(([label, value]) => ({ label, value })) });
  }

  return charts;
}

async function getPortfolioData(
  supabase: SupabaseClientType,
  organizationId: string,
  params: ReportParams
): Promise<unknown[]> {
  let query = supabase
    .from('matters')
    .select('id, reference, title, ip_type, status, office_code, filing_date, expiry_date')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (params.ip_type) {
    query = query.eq('ip_type', params.ip_type);
  }

  const { data } = await query;
  return data || [];
}

async function getCostCharts(
  supabase: SupabaseClientType,
  organizationId: string,
  params: ReportParams
): Promise<unknown[]> {
  const charts = [];

  // Costs by month (simplified - actual table may differ)
  const { data: costsByCategory } = await supabase
    .from('cost_entries')
    .select('category, amount')
    .eq('organization_id', organizationId);

  if (costsByCategory) {
    const grouped = costsByCategory.reduce((acc: Record<string, number>, item: { category: string; amount: number }) => {
      acc[item.category || 'other'] = (acc[item.category || 'other'] || 0) + (item.amount || 0);
      return acc;
    }, {});

    const chartData = Object.entries(grouped).map(([label, value]) => ({ label, value }));
    charts.push({ id: 'costs_by_category', type: 'pie', title: 'Por Categoría', data: chartData });
  }

  return charts;
}

async function getCostData(
  supabase: SupabaseClientType,
  organizationId: string,
  params: ReportParams
): Promise<unknown[]> {
  let query = supabase
    .from('cost_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: false })
    .limit(100);

  if (params.date_from) {
    query = query.gte('date', params.date_from);
  }
  if (params.date_to) {
    query = query.lte('date', params.date_to);
  }

  const { data } = await query;
  return data || [];
}

async function getActivityData(
  supabase: SupabaseClientType,
  organizationId: string,
  params: ReportParams
): Promise<unknown[]> {
  const { data } = await supabase
    .from('activities')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);

  return data || [];
}

async function getClientData(
  supabase: SupabaseClientType,
  organizationId: string,
  clientId: string
): Promise<unknown[]> {
  const { data } = await supabase
    .from('matters')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  return data || [];
}

async function getGenericData(
  supabase: SupabaseClientType,
  organizationId: string,
  config: Record<string, unknown>
): Promise<unknown[]> {
  const dataSource = config.data_source as string || 'matters';
  
  const { data } = await supabase
    .from(dataSource)
    .select('*')
    .eq('organization_id', organizationId)
    .limit(100);

  return data || [];
}
