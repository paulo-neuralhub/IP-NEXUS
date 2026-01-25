import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { matterId, forceRefresh = false } = await req.json();

    if (!matterId) {
      return new Response(JSON.stringify({ error: "matterId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get matter details
    const { data: matter, error: matterError } = await supabase
      .from("matters")
      .select("*, organization:organizations(*)")
      .eq("id", matterId)
      .single();

    if (matterError || !matter) {
      return new Response(JSON.stringify({ error: "Matter not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const applicationNumber = matter.application_number;
    const officeCode = matter.jurisdiction_code || matter.jurisdiction;

    if (!applicationNumber || !officeCode) {
      return new Response(JSON.stringify({ 
        success: false,
        hasChanges: false,
        error: "Missing application number or jurisdiction" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("office_query_cache")
        .select("*")
        .eq("office_code", officeCode)
        .eq("query_type", "status")
        .eq("query_key", applicationNumber)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cached?.response_data) {
        return new Response(JSON.stringify({
          success: true,
          hasChanges: false,
          fromCache: true,
          data: cached.response_data,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Log the request
    const requestStart = new Date();
    await supabase.from("office_request_logs").insert({
      tenant_id: matter.organization_id,
      office_code: officeCode,
      matter_id: matterId,
      endpoint: `/status/${applicationNumber}`,
      method: "GET",
      started_at: requestStart.toISOString(),
    });

    // Simulate API call (in production, call actual office API)
    // This is a placeholder - actual implementation would call EUIPO/USPTO/etc APIs
    const mockStatus = {
      applicationNumber,
      status: matter.status || "pending",
      normalizedStatus: matter.status || "pending",
      filingDate: matter.filing_date,
      registrationDate: matter.registration_date,
      expiryDate: matter.expiry_date,
    };

    // Check for changes
    const hasChanges = false; // Compare with current matter data
    const changes: Record<string, { old: unknown; new: unknown }> = {};

    // Update cache
    await supabase.from("office_query_cache").upsert({
      office_code: officeCode,
      query_type: "status",
      query_key: applicationNumber,
      response_data: mockStatus,
      cached_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
    });

    // Update request log
    const requestEnd = new Date();
    await supabase.from("office_request_logs")
      .update({
        status_code: 200,
        completed_at: requestEnd.toISOString(),
        duration_ms: requestEnd.getTime() - requestStart.getTime(),
        response_summary: { hasChanges },
      })
      .eq("matter_id", matterId)
      .eq("started_at", requestStart.toISOString());

    return new Response(JSON.stringify({
      success: true,
      hasChanges,
      changes,
      currentStatus: mockStatus.status,
      data: mockStatus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error checking office status:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
