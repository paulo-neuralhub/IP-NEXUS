import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeedDemoDataResponse =
  | { ok: true; run_id: string }
  | { ok: false; error: string };

export type CleanupDemoDataResponse =
  | { ok: true; run_id?: string; deleted: Record<string, number> }
  | { ok: false; error: string };

export type CleanDemoTenantResponse =
  | { ok: true; tenant_id: string; deleted: Record<string, number>; timestamp: string }
  | { ok: false; error: string };

export type CleanAllDemoTenantsResponse =
  | { ok: true; cleaned_tenants: number; results: Array<{ org_id: string; org_name: string; org_slug: string; result: any }>; timestamp: string }
  | { ok: false; error: string };

export type SeedDemoUsersResponse =
  | {
      ok: true;
      created_count: number;
      created: Array<{ email: string; user_id: string; org: string }>;
      skipped_count: number;
      skipped: Array<{ email: string; reason: string }>;
    }
  | { ok: false; error: string };

export type SeedDemoTenantsClientsResponse =
  | {
      ok: true;
      results: Array<{ slug: string; run_id: string; companies: number }>;
    }
  | { ok: false; error: string };

export type SeedDemoMattersCoverageResponse =
  | {
      ok: true;
      results: Array<{ slug: string; run_id: string; matters_created: number }>;
    }
  | { ok: false; error: string };

export type SeedDemoDeadlinesCoverageResponse =
  | {
      ok: true;
      results: Array<{ slug: string; run_id: string; deadlines: number; alerts: number }>;
    }
  | { ok: false; error: string };

export type SeedDemoClientCommunicationsResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

export type SeedDemoFinanceFullResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

export type SeedDemoSpiderVigilanceResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

export type SeedDemoPortalConfigResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

export type SeedDemoTasksWorkflowsResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

export type SeedDemoDocumentsStructureResponse =
  | { ok: true; bucket: string; results: Array<{ slug: string; run_id: string; documents: number }> }
  | { ok: false; error: string };

export type SeedDemoTenantConfigsResponse =
  | { ok: true; results: Array<{ slug: string; run_id: string }> }
  | { ok: false; error: string };

// L108: Time tracking & Signature requests
export type SeedDemoTimeSignaturesResponse =
  | { ok: true; run_id: string; seeded: { time_entries: number; signature_requests: number; billing_rates: number } }
  | { ok: false; error: string };

export function useSeedDemoData() {
  return useMutation({
    mutationFn: async (organizationId: string): Promise<SeedDemoDataResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-data", {
        body: { organization_id: organizationId },
      });
      if (error) throw error;
      return data as SeedDemoDataResponse;
    },
  });
}

export function useCleanupDemoData() {
  return useMutation({
    mutationFn: async (params: {
      organizationId: string;
      runId?: string;
    }): Promise<CleanupDemoDataResponse> => {
      const { data, error } = await supabase.functions.invoke("cleanup-demo-data", {
        body: {
          organization_id: params.organizationId,
          run_id: params.runId,
        },
      });
      if (error) throw error;
      return data as CleanupDemoDataResponse;
    },
  });
}

export function useSeedDemoUsers() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoUsersResponse> => {
      const { data, error } = await supabase.functions.invoke("demo-seed-users", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoUsersResponse;
    },
  });
}

export function useSeedDemoTenantsClients() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoTenantsClientsResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-tenants-clients", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoTenantsClientsResponse;
    },
  });
}

export function useSeedDemoMattersCoverage() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoMattersCoverageResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-matters-coverage", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoMattersCoverageResponse;
    },
  });
}

export function useSeedDemoDeadlinesCoverage() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoDeadlinesCoverageResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-deadlines-coverage", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoDeadlinesCoverageResponse;
    },
  });
}

export function useSeedDemoClientCommunications() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoClientCommunicationsResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-client-communications", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoClientCommunicationsResponse;
    },
  });
}

export function useSeedDemoFinanceFull() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoFinanceFullResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-finance-full", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoFinanceFullResponse;
    },
  });
}

export function useSeedDemoSpiderVigilance() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoSpiderVigilanceResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-spider-vigilance", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoSpiderVigilanceResponse;
    },
  });
}

export function useSeedDemoPortalConfig() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoPortalConfigResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-portal-config", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoPortalConfigResponse;
    },
  });
}

export function useSeedDemoTasksWorkflows() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoTasksWorkflowsResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-tasks-workflows", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoTasksWorkflowsResponse;
    },
  });
}

export function useSeedDemoDocumentsStructure() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoDocumentsStructureResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-documents-structure", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoDocumentsStructureResponse;
    },
  });
}

export function useSeedDemoTenantConfigs() {
  return useMutation({
    mutationFn: async (): Promise<SeedDemoTenantConfigsResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-tenant-configs", {
        body: {},
      });
      if (error) throw error;
      return data as SeedDemoTenantConfigsResponse;
    },
  });
}

/**
 * L108: Seed time entries (400+) and signature requests (10+) for demo orgs
 */
export function useSeedDemoTimeSignatures() {
  return useMutation({
    mutationFn: async (organizationId: string): Promise<SeedDemoTimeSignaturesResponse> => {
      const { data, error } = await supabase.functions.invoke("seed-demo-time-signatures", {
        body: { organization_id: organizationId },
      });
      if (error) throw error;
      return data as SeedDemoTimeSignaturesResponse;
    },
  });
}

// ============================================================
// NUEVAS FUNCIONES DE LIMPIEZA TOTAL
// ============================================================

interface CleanDemoResult {
  success: boolean;
  tenant_id?: string;
  deleted?: Record<string, number>;
  timestamp?: string;
  error?: string;
}

interface CleanAllDemoResult {
  success: boolean;
  cleaned_tenants?: number;
  results?: Array<{ org_id: string; org_name: string; org_slug: string; result: unknown }>;
  timestamp?: string;
  error?: string;
}

/**
 * Limpia todos los datos de un tenant DEMO específico usando la función SQL
 */
export function useCleanDemoTenant() {
  return useMutation({
    mutationFn: async (tenantId?: string): Promise<CleanDemoTenantResponse> => {
      const { data, error } = await supabase.rpc('clean_demo_tenant_data', {
        p_tenant_id: tenantId || '00000000-0000-0000-0000-00000000de00'
      });
      if (error) throw error;
      
      const result = data as unknown as CleanDemoResult;
      
      if (result?.success) {
        return {
          ok: true,
          tenant_id: result.tenant_id || tenantId || DEMO_MASTER_TENANT_ID,
          deleted: result.deleted || {},
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
      return { ok: false, error: result?.error || 'Error desconocido' };
    },
  });
}

/**
 * Limpia todos los datos de TODOS los tenants marcados como demo
 */
export function useCleanAllDemoTenants() {
  return useMutation({
    mutationFn: async (): Promise<CleanAllDemoTenantsResponse> => {
      const { data, error } = await supabase.rpc('clean_all_demo_tenants');
      if (error) throw error;
      
      const result = data as unknown as CleanAllDemoResult;
      
      if (result?.success) {
        return {
          ok: true,
          cleaned_tenants: result.cleaned_tenants || 0,
          results: result.results || [],
          timestamp: result.timestamp || new Date().toISOString()
        };
      }
      
      return { ok: false, error: result?.error || 'Error desconocido' };
    },
  });
}

// Constante para el tenant demo maestro
export const DEMO_MASTER_TENANT_ID = '00000000-0000-0000-0000-00000000de00';
