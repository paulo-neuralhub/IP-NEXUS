// ============================================================
// IP-NEXUS - DEADLINE ALERTS EDGE FUNCTION
// PROMPT 52: Docket Deadline Engine
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const { data: deadlines, error: deadlinesError } = await supabase
      .from('matter_deadlines')
      .select('id, title, deadline_date, priority, organization_id, matter_id, next_alert_date, alerts_sent')
      .in('status', ['pending', 'upcoming', 'urgent'])
      .lte('next_alert_date', todayStr)
      .order('deadline_date', { ascending: true });

    if (deadlinesError) throw deadlinesError;

    const results = { processed: 0, alerts_created: 0, errors: [] as string[] };

    for (const deadline of (deadlines || [])) {
      try {
        const daysUntil = Math.ceil(
          (new Date(deadline.deadline_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase.from('deadline_alerts').insert({
          deadline_id: deadline.id,
          organization_id: deadline.organization_id,
          alert_type: daysUntil <= 0 ? 'overdue' : daysUntil <= 7 ? 'urgent' : 'reminder',
          days_before: daysUntil,
          status: 'pending'
        });

        results.alerts_created++;

        const alertsSent = (deadline.alerts_sent || {}) as Record<string, string>;
        const updates: Record<string, unknown> = {
          alerts_sent: { ...alertsSent, [daysUntil.toString()]: new Date().toISOString() },
          status: daysUntil < 0 ? 'overdue' : daysUntil <= 3 ? 'urgent' : daysUntil <= 14 ? 'upcoming' : 'pending'
        };

        await supabase.from('matter_deadlines').update(updates).eq('id', deadline.id);
        results.processed++;
      } catch (e) {
        results.errors.push(`Error: ${(e as Error).message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
