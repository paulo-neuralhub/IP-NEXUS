import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let syncJobId: string | null = null;

  try {
    const { connector_id, sync_type, filters } = await req.json();
    
    if (!connector_id) {
      throw new Error("connector_id is required");
    }

    // Get connector
    const { data: connector, error: fetchError } = await supabase
      .from("data_connectors")
      .select("*")
      .eq("id", connector_id)
      .single();

    if (fetchError || !connector) {
      throw new Error("Connector not found");
    }

    // Create sync job
    const { data: syncJob, error: createError } = await supabase
      .from("sync_jobs")
      .insert({
        organization_id: connector.organization_id,
        connector_id,
        sync_type: sync_type || 'incremental',
        filters: filters || {},
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !syncJob) {
      throw new Error("Failed to create sync job");
    }

    syncJobId = syncJob.id;

    const { connector_type, config } = connector;

    // Simulate sync based on connector type
    let totalItems = 0;
    let newItems = 0;
    let updatedItems = 0;
    let errorCount = 0;
    const result: any = {};

    try {
      switch (connector_type) {
        case 'euipo':
          // Simulate EUIPO sync
          totalItems = 25;
          newItems = 5;
          updatedItems = 10;
          result.synced_marks = 15;
          result.source = 'EUIPO Database';
          break;

        case 'wipo':
          // Simulate WIPO sync
          totalItems = 30;
          newItems = 8;
          updatedItems = 12;
          result.synced_applications = 20;
          result.source = 'WIPO Madrid Monitor';
          break;

        case 'tmview':
          // Simulate TMView sync
          totalItems = 40;
          newItems = 10;
          updatedItems = 15;
          result.synced_marks = 25;
          result.databases_queried = ['EUIPO', 'OEPM', 'INPI'];
          break;

        default:
          totalItems = 10;
          newItems = 2;
          updatedItems = 3;
          result.message = 'Sync completed (simulated)';
      }

      // Update progress during sync (simulated)
      for (let i = 0; i <= totalItems; i += 5) {
        await supabase
          .from("sync_jobs")
          .update({ 
            processed_items: i,
            total_items: totalItems,
          })
          .eq("id", syncJobId);
        
        // Small delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete sync job
      await supabase
        .from("sync_jobs")
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_items: totalItems,
          processed_items: totalItems,
          new_items: newItems,
          updated_items: updatedItems,
          errors: errorCount,
          result,
        })
        .eq("id", syncJobId);

      // Update connector last sync
      await supabase
        .from("data_connectors")
        .update({ 
          last_sync_at: new Date().toISOString(),
          connection_status: 'connected',
        })
        .eq("id", connector_id);

    } catch (syncError: any) {
      // Mark job as failed
      await supabase
        .from("sync_jobs")
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: syncError.message,
        })
        .eq("id", syncJobId);

      throw syncError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        sync_job_id: syncJobId,
        total_items: totalItems,
        new_items: newItems,
        updated_items: updatedItems,
        errors: errorCount,
        result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Sync connector error:", error);

    // Update job if it was created
    if (syncJobId) {
      await supabase
        .from("sync_jobs")
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
        })
        .eq("id", syncJobId);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
