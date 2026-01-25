// ============================================================
// IP-NEXUS - OFFICE SYNC BATCH EDGE FUNCTION
// Batch synchronization of matters with IP offices (CRON)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncResult {
  tenantId: string;
  tenantName: string;
  mattersChecked: number;
  mattersUpdated: number;
  documentsDownloaded: number;
  deadlinesCreated: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { tenantId, officeCode, syncType = "scheduled" } = await req.json().catch(() => ({}));

    // Get tenants with sync enabled
    let tenantsQuery = supabase
      .from("tenant_sync_config")
      .select("*, organization:organizations(id, name, status)")
      .eq("sync_status", true);

    if (tenantId) {
      tenantsQuery = tenantsQuery.eq("tenant_id", tenantId);
    }

    const { data: syncConfigs, error: configError } = await tenantsQuery;

    if (configError) throw configError;

    const results: SyncResult[] = [];
    let totalMattersChecked = 0;
    let totalMattersUpdated = 0;
    let totalDocumentsDownloaded = 0;
    let totalDeadlinesCreated = 0;
    let totalErrors = 0;

    for (const config of syncConfigs || []) {
      if (config.organization?.status !== "active") continue;

      const syncResult: SyncResult = {
        tenantId: config.tenant_id,
        tenantName: config.organization?.name || "Unknown",
        mattersChecked: 0,
        mattersUpdated: 0,
        documentsDownloaded: 0,
        deadlinesCreated: 0,
        errors: [],
      };

      // Create sync history record
      const { data: syncHistory } = await supabase
        .from("sync_history")
        .insert({
          tenant_id: config.tenant_id,
          sync_type: syncType,
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      try {
        // Get active matters for this tenant
        let mattersQuery = supabase
          .from("matters")
          .select("id, application_number, jurisdiction_code, jurisdiction, status")
          .eq("organization_id", config.tenant_id)
          .in("status", config.sync_matter_statuses || ["filed", "examination", "published", "registered"]);

        if (officeCode) {
          mattersQuery = mattersQuery.or(`jurisdiction_code.eq.${officeCode},jurisdiction.eq.${officeCode}`);
        }

        const { data: matters, error: mattersError } = await mattersQuery.limit(100);

        if (mattersError) throw mattersError;

        for (const matter of matters || []) {
          syncResult.mattersChecked++;

          try {
            // Check status (simulated - in production call office API)
            const currentOfficeCode = matter.jurisdiction_code || matter.jurisdiction;
            
            // Rate limiting: wait between requests
            await new Promise(resolve => setTimeout(resolve, 100));

            // Mock status check - in production this would call office-check-status
            const hasChanges = Math.random() > 0.9; // 10% chance of changes for demo

            if (hasChanges) {
              syncResult.mattersUpdated++;

              // Log the update
              await supabase.from("activity_log").insert({
                organization_id: config.tenant_id,
                entity_type: "matter",
                entity_id: matter.id,
                action: "status_synced",
                title: `Estado actualizado desde ${currentOfficeCode}`,
                is_system: true,
              });
            }

            // Check for new documents if configured
            if (config.sync_documents) {
              // Mock document check
              const newDocs = Math.random() > 0.95 ? 1 : 0;
              syncResult.documentsDownloaded += newDocs;
            }

          } catch (matterError) {
            syncResult.errors.push(
              `Matter ${matter.id}: ${matterError instanceof Error ? matterError.message : "Unknown error"}`
            );
          }
        }

        // Update sync history as completed
        await supabase
          .from("sync_history")
          .update({
            status: syncResult.errors.length > 0 ? "partial" : "completed",
            matters_checked: syncResult.mattersChecked,
            matters_updated: syncResult.mattersUpdated,
            documents_downloaded: syncResult.documentsDownloaded,
            deadlines_created: syncResult.deadlinesCreated,
            errors_count: syncResult.errors.length,
            errors: syncResult.errors.length > 0 ? { items: syncResult.errors } : null,
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncHistory?.id);

        // Send notification if configured and there are updates
        if (config.notify_on_status_change && syncResult.mattersUpdated > 0) {
          // Would send email notification here
        }

      } catch (tenantError) {
        syncResult.errors.push(
          `Tenant error: ${tenantError instanceof Error ? tenantError.message : "Unknown error"}`
        );

        await supabase
          .from("sync_history")
          .update({
            status: "failed",
            errors_count: 1,
            errors: { items: syncResult.errors },
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncHistory?.id);
      }

      results.push(syncResult);
      totalMattersChecked += syncResult.mattersChecked;
      totalMattersUpdated += syncResult.mattersUpdated;
      totalDocumentsDownloaded += syncResult.documentsDownloaded;
      totalDeadlinesCreated += syncResult.deadlinesCreated;
      totalErrors += syncResult.errors.length;
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        tenantsProcessed: results.length,
        totalMattersChecked,
        totalMattersUpdated,
        totalDocumentsDownloaded,
        totalDeadlinesCreated,
        totalErrors,
      },
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in batch sync:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
