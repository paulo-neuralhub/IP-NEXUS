import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncRequest {
  organizationId: string;
}

interface OfficeDetail {
  office_code: string;
  office_name: string;
  checked: number;
  updated: number;
  docs: number;
  deadlines: number;
  errors: number;
}

interface ChangeDetected {
  matter_id: string;
  matter_ref: string;
  field: string;
  old_value: string | null;
  new_value: string | null;
  office_code: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user token for auth check
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Parse request
    const { organizationId }: SyncRequest = await req.json();

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "organizationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify user has access to organization
    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: "No access to this organization" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check cooldown (15 min between manual syncs)
    const { data: syncConfig } = await supabase
      .from("tenant_sync_config")
      .select("last_manual_sync_at, manual_sync_cooldown_minutes")
      .eq("organization_id", organizationId)
      .single();

    const cooldownMinutes = syncConfig?.manual_sync_cooldown_minutes || 15;
    
    if (syncConfig?.last_manual_sync_at) {
      const lastSync = new Date(syncConfig.last_manual_sync_at);
      const cooldownEnd = new Date(lastSync.getTime() + cooldownMinutes * 60 * 1000);
      
      if (new Date() < cooldownEnd) {
        const remainingMinutes = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: "Sync cooldown active", 
            remaining_minutes: remainingMinutes,
            next_available_at: cooldownEnd.toISOString()
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Get active offices for this tenant (included in plan + add-ons)
    const { data: org } = await supabase
      .from("organizations")
      .select("plan")
      .eq("id", organizationId)
      .single();

    const plan = org?.plan || "starter";

    // Offices included in plan
    const { data: planOffices } = await supabase
      .from("office_plan_inclusions")
      .select("office_id, ipo_offices(id, code, name_official)")
      .eq("plan", plan);

    // Active add-ons
    const { data: addonOffices } = await supabase
      .from("tenant_office_addons")
      .select("office_id, ipo_offices(id, code, name_official)")
      .eq("organization_id", organizationId)
      .eq("status", "active");

    // Combine and dedupe
    const allOfficeIds = new Set<string>();
    const officeMap = new Map<string, { id: string; code: string; name: string }>();

    planOffices?.forEach((po: any) => {
      if (po.ipo_offices) {
        allOfficeIds.add(po.office_id);
        officeMap.set(po.office_id, {
          id: po.office_id,
          code: po.ipo_offices.code,
          name: po.ipo_offices.name_official
        });
      }
    });

    addonOffices?.forEach((ao: any) => {
      if (ao.ipo_offices) {
        allOfficeIds.add(ao.office_id);
        officeMap.set(ao.office_id, {
          id: ao.office_id,
          code: ao.ipo_offices.code,
          name: ao.ipo_offices.name_official
        });
      }
    });

    if (allOfficeIds.size === 0) {
      return new Response(
        JSON.stringify({ error: "No active offices found for this organization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create sync_history record
    const startTime = new Date();
    const { data: syncRecord, error: syncError } = await supabase
      .from("sync_history")
      .insert({
        organization_id: organizationId,
        sync_type: "manual",
        triggered_by: userId,
        status: "running",
        started_at: startTime.toISOString()
      })
      .select()
      .single();

    if (syncError) {
      console.error("Error creating sync record:", syncError);
      return new Response(
        JSON.stringify({ error: "Failed to create sync record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Get sync configuration
    const { data: config } = await supabase
      .from("tenant_sync_config")
      .select("*")
      .eq("organization_id", organizationId)
      .single();

    const syncStatus = config?.sync_status ?? true;
    const syncDocs = config?.sync_documents ?? true;
    const autoDeadlines = config?.auto_create_deadlines ?? true;
    const matterTypes = config?.sync_matter_types || ["trademark", "patent", "design", "utility_model"];
    const matterStatuses = config?.sync_matter_statuses || ["filed", "pending", "published", "registered"];

    // 6. Get matters to sync
    const { data: matters, error: mattersError } = await supabase
      .from("matters")
      .select(`
        id,
        reference,
        application_number,
        registration_number,
        ip_type,
        status,
        filing_date,
        registration_date,
        expiry_date,
        office_code,
        ipo_offices(id, code, name_official)
      `)
      .eq("organization_id", organizationId)
      .in("ip_type", matterTypes)
      .in("status", matterStatuses)
      .not("application_number", "is", null);

    if (mattersError) {
      console.error("Error fetching matters:", mattersError);
    }

    // Group matters by office
    const mattersByOffice = new Map<string, any[]>();
    matters?.forEach((matter: any) => {
      if (matter.office_code && allOfficeIds.has(matter.ipo_offices?.id)) {
        const officeCode = matter.office_code;
        if (!mattersByOffice.has(officeCode)) {
          mattersByOffice.set(officeCode, []);
        }
        mattersByOffice.get(officeCode)!.push(matter);
      }
    });

    // 7. Process each office (simulated for now - real implementation would call office APIs)
    const officeDetails: OfficeDetail[] = [];
    const changesDetected: ChangeDetected[] = [];
    const errors: { office_code: string; message: string; matter_id?: string }[] = [];
    
    let totalChecked = 0;
    let totalUpdated = 0;
    let totalDocs = 0;
    let totalDeadlines = 0;

    for (const [officeCode, officeMatters] of mattersByOffice) {
      const officeInfo = Array.from(officeMap.values()).find(o => o.code === officeCode);
      
      const detail: OfficeDetail = {
        office_code: officeCode,
        office_name: officeInfo?.name || officeCode,
        checked: officeMatters.length,
        updated: 0,
        docs: 0,
        deadlines: 0,
        errors: 0
      };

      totalChecked += officeMatters.length;

      // TODO: Real implementation would:
      // 1. Call office-check-status for each matter
      // 2. Compare returned status with current
      // 3. Update if different
      // 4. Download new docs if sync_documents enabled
      // 5. Create deadlines if auto_create_deadlines enabled
      
      // For now, simulate some activity
      for (const matter of officeMatters) {
        try {
          // Simulated check - in production, call the actual office API
          const shouldUpdate = Math.random() < 0.1; // 10% chance of update for demo
          
          if (shouldUpdate && syncStatus) {
            // Simulate status change
            const newStatus = matter.status === "pending" ? "published" : 
                             matter.status === "published" ? "registered" : matter.status;
            
            if (newStatus !== matter.status) {
              // Record change
              changesDetected.push({
                matter_id: matter.id,
                matter_ref: matter.reference || matter.application_number,
                field: "status",
                old_value: matter.status,
                new_value: newStatus,
                office_code: officeCode
              });

              // Update matter (in real implementation)
              // await supabase.from("matters").update({ status: newStatus }).eq("id", matter.id);
              
              detail.updated++;
              totalUpdated++;

              // Create deadline if applicable
              if (autoDeadlines && newStatus === "published") {
                detail.deadlines++;
                totalDeadlines++;
              }
            }
          }

          // Simulate document download
          if (syncDocs && Math.random() < 0.05) { // 5% chance
            detail.docs++;
            totalDocs++;
          }

        } catch (err) {
          detail.errors++;
          errors.push({
            office_code: officeCode,
            matter_id: matter.id,
            message: err instanceof Error ? err.message : "Unknown error"
          });
        }
      }

      officeDetails.push(detail);
    }

    // 8. Update sync_history with results
    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
    
    const finalStatus = errors.length > 0 
      ? (totalUpdated > 0 ? "partial" : "failed")
      : "completed";

    await supabase
      .from("sync_history")
      .update({
        status: finalStatus,
        matters_checked: totalChecked,
        matters_updated: totalUpdated,
        documents_downloaded: totalDocs,
        deadlines_created: totalDeadlines,
        errors_count: errors.length,
        office_details: officeDetails,
        changes_detected: changesDetected,
        errors: errors,
        completed_at: endTime.toISOString(),
        duration_seconds: durationSeconds
      })
      .eq("id", syncRecord.id);

    // 9. Update cooldown timestamp
    await supabase
      .from("tenant_sync_config")
      .upsert({
        organization_id: organizationId,
        last_manual_sync_at: endTime.toISOString()
      }, { onConflict: "organization_id" });

    // 10. Return result
    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncRecord.id,
        status: finalStatus,
        duration_seconds: durationSeconds,
        summary: {
          offices_synced: officeDetails.length,
          matters_checked: totalChecked,
          matters_updated: totalUpdated,
          documents_downloaded: totalDocs,
          deadlines_created: totalDeadlines,
          errors: errors.length
        },
        office_details: officeDetails,
        changes_detected: changesDetected,
        next_sync_available_at: new Date(endTime.getTime() + cooldownMinutes * 60 * 1000).toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Manual sync error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});