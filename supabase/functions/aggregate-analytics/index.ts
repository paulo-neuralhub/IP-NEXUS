import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional date parameter (defaults to yesterday)
    let targetDate: string;
    try {
      const body = await req.json();
      targetDate = body.date || getYesterday();
    } catch {
      targetDate = getYesterday();
    }

    console.log(`Calculating analytics for date: ${targetDate}`);

    // Call the database function
    const { error } = await supabase.rpc('calculate_daily_analytics', {
      p_date: targetDate
    });

    if (error) {
      console.error('Error calculating analytics:', error);
      throw error;
    }

    // Get summary of what was calculated
    const { data: metrics, error: metricsError } = await supabase
      .from('analytics_daily_metrics')
      .select('organization_id, daily_active_users, total_sessions')
      .eq('metric_date', targetDate);

    if (metricsError) {
      console.warn('Could not fetch metrics summary:', metricsError);
    }

    const totalOrgs = metrics?.length || 0;
    const totalDAU = metrics?.reduce((sum, m) => sum + (m.daily_active_users || 0), 0) || 0;
    const totalSessions = metrics?.reduce((sum, m) => sum + (m.total_sessions || 0), 0) || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Analytics calculated for ${targetDate}`,
        stats: {
          organizations_processed: totalOrgs,
          total_dau: totalDAU,
          total_sessions: totalSessions,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in aggregate-analytics:', errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}
