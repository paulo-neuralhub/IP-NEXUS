// ============================================================
// IP-NEXUS - DEADLINE DIGEST EDGE FUNCTION
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

    const { digestType = 'daily' } = await req.json().catch(() => ({}));
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (digestType === 'weekly' ? 7 : 1));

    const { data: organizations } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('status', 'active');

    const results = { organizations_processed: 0, digests_sent: 0 };

    for (const org of (organizations || [])) {
      const { data: deadlines } = await supabase
        .from('matter_deadlines')
        .select('id, title, deadline_date, priority, status')
        .eq('organization_id', org.id)
        .in('status', ['pending', 'upcoming', 'urgent', 'overdue'])
        .lte('deadline_date', endDate.toISOString().split('T')[0])
        .order('deadline_date', { ascending: true });

      if (!deadlines?.length) continue;

      const { data: members } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('organization_id', org.id)
        .in('role', ['owner', 'admin']);

      results.digests_sent += members?.length || 0;
      results.organizations_processed++;
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
