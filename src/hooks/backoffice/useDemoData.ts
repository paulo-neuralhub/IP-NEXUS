import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SeedDemoDataResponse =
  | { ok: true; run_id: string }
  | { ok: false; error: string };

export type CleanupDemoDataResponse =
  | { ok: true; run_id: string; deleted: Record<string, number> }
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
