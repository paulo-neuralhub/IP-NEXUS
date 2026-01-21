import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting daily rankings calculation...");

    // Step 1: Calculate and insert rankings
    const { error: rankingsError } = await supabase.rpc('calculate_daily_rankings');
    
    if (rankingsError) {
      console.error("Error calculating rankings:", rankingsError);
      throw rankingsError;
    }

    console.log("Rankings calculated successfully");

    // Step 2: Assign automatic badges
    const { error: badgesError } = await supabase.rpc('assign_automatic_badges');
    
    if (badgesError) {
      console.error("Error assigning badges:", badgesError);
      throw badgesError;
    }

    console.log("Badges assigned successfully");

    // Step 3: Get summary stats
    const today = new Date().toISOString().split('T')[0];
    
    const { data: stats, error: statsError } = await supabase
      .from('agent_rankings')
      .select('id', { count: 'exact' })
      .eq('ranking_date', today);

    const totalRanked = stats?.length || 0;

    const { data: badgeStats } = await supabase
      .from('agent_badges')
      .select('id', { count: 'exact' })
      .gte('earned_at', today);

    const newBadges = badgeStats?.length || 0;

    console.log(`Completed: ${totalRanked} agents ranked, ${newBadges} new badges assigned`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Rankings calculated successfully",
        stats: {
          date: today,
          agents_ranked: totalRanked,
          new_badges_assigned: newBadges,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in calculate-rankings:", errorMessage);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
