// ============================================================
// IP-NEXUS - OFFICE HEALTH CHECK EDGE FUNCTION
// Monitors IP office API health and availability (CRON)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthResult {
  officeCode: string;
  officeName: string;
  previousStatus: string;
  currentStatus: string;
  responseTimeMs: number | null;
  error: string | null;
  statusChanged: boolean;
}

// Office test endpoints (simulated)
const OFFICE_HEALTH_ENDPOINTS: Record<string, string> = {
  "EUIPO": "https://euipo.europa.eu/eSearchCLW/api/health",
  "USPTO": "https://developer.uspto.gov/api/status",
  "WIPO": "https://www3.wipo.int/madrid/monitor/api/health",
  "EPO": "https://ops.epo.org/3.2/rest-services/status",
  "OEPM": "https://consultas2.oepm.es/LocalizadorWeb/status",
};

async function checkOfficeHealth(office: { code: string; api_base_url?: string }): Promise<{
  isHealthy: boolean;
  responseTimeMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // In production, this would make actual health check requests
    // For now, simulate with random results
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    const responseTimeMs = Date.now() - startTime;
    const isHealthy = Math.random() > 0.05; // 95% uptime simulation
    
    if (!isHealthy) {
      return {
        isHealthy: false,
        responseTimeMs,
        error: "Connection timeout",
      };
    }
    
    return {
      isHealthy: true,
      responseTimeMs,
    };
  } catch (error) {
    return {
      isHealthy: false,
      responseTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
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

    const { officeCode } = await req.json().catch(() => ({}));

    // Get active offices
    let officesQuery = supabase
      .from("ipo_offices")
      .select("id, code, name, api_base_url, operational_status, avg_response_time_ms")
      .eq("is_active", true);

    if (officeCode) {
      officesQuery = officesQuery.eq("code", officeCode);
    }

    const { data: offices, error: officesError } = await officesQuery;

    if (officesError) throw officesError;

    const results: HealthResult[] = [];
    const statusChanges: HealthResult[] = [];

    for (const office of offices || []) {
      const previousStatus = office.operational_status || "unknown";
      const healthCheck = await checkOfficeHealth(office);

      let currentStatus: string;
      if (!healthCheck.isHealthy) {
        currentStatus = "down";
      } else if (healthCheck.responseTimeMs > 5000) {
        currentStatus = "degraded";
      } else if (healthCheck.responseTimeMs > 2000) {
        currentStatus = "slow";
      } else {
        currentStatus = "operational";
      }

      const statusChanged = previousStatus !== currentStatus;

      const result: HealthResult = {
        officeCode: office.code,
        officeName: office.name,
        previousStatus,
        currentStatus,
        responseTimeMs: healthCheck.isHealthy ? healthCheck.responseTimeMs : null,
        error: healthCheck.error || null,
        statusChanged,
      };

      results.push(result);

      if (statusChanged) {
        statusChanges.push(result);
      }

      // Update office record
      await supabase
        .from("ipo_offices")
        .update({
          operational_status: currentStatus,
          last_health_check: new Date().toISOString(),
          avg_response_time_ms: healthCheck.isHealthy 
            ? Math.round((office.avg_response_time_ms || healthCheck.responseTimeMs) * 0.8 + healthCheck.responseTimeMs * 0.2)
            : office.avg_response_time_ms,
        })
        .eq("id", office.id);

      // Log status change
      if (statusChanged) {
        await supabase.from("activity_log").insert({
          organization_id: null, // System-level log
          entity_type: "ipo_office",
          entity_id: office.id,
          action: "health_status_changed",
          title: `${office.name}: ${previousStatus} → ${currentStatus}`,
          metadata: {
            office_code: office.code,
            previous_status: previousStatus,
            current_status: currentStatus,
            response_time_ms: healthCheck.responseTimeMs,
            error: healthCheck.error,
          },
          is_system: true,
        });
      }
    }

    // If any office went down, could trigger alerts here
    const officesDown = results.filter(r => r.currentStatus === "down");
    
    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalChecked: results.length,
        operational: results.filter(r => r.currentStatus === "operational").length,
        degraded: results.filter(r => r.currentStatus === "degraded" || r.currentStatus === "slow").length,
        down: officesDown.length,
        statusChanges: statusChanges.length,
      },
      results,
      alerts: officesDown.length > 0 ? {
        type: "offices_down",
        offices: officesDown.map(o => o.officeCode),
      } : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in health check:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
