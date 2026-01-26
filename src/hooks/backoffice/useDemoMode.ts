// ============================================================
// IP-NEXUS - DEMO MODE HOOKS
// Gestión del modo demo para demostraciones a clientes
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Types
export type DemoConfig = {
  id: string;
  organization_id: string;
  is_active: boolean;
  data_loaded: boolean;
  show_guide: boolean;
  show_highlights: boolean;
  show_comparisons: boolean;
  prospect_company: string | null;
  prospect_industry: string | null;
  prospect_contact_name: string | null;
  prospect_contact_email: string | null;
  demos_count: number;
  last_demo_at: string | null;
  avg_demo_duration_seconds: number | null;
  total_demo_duration_seconds: number;
  demos_converted: number;
  demos_pending: number;
  demos_lost: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DemoSession = {
  id: string;
  organization_id: string;
  prospect_company: string | null;
  prospect_contact_name: string | null;
  prospect_contact_email: string | null;
  prospect_industry: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  modules_visited: string[];
  features_shown: string[];
  status: 'in_progress' | 'completed' | 'converted' | 'pending' | 'lost';
  notes: string | null;
  follow_up_date: string | null;
  presenter_id: string | null;
  created_at: string;
};

export type DemoSessionInsert = Omit<DemoSession, 'id' | 'created_at'>;

export type DemoStats = {
  todayDemos: number;
  conversionRate: number;
  avgDuration: number; // minutos
  totalDemos: number;
  pending: number;
  converted: number;
  lost: number;
};

// Hook para obtener configuración de demo de una organización
export function useDemoConfig(organizationId?: string) {
  return useQuery({
    queryKey: ["demo-config", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from("demo_config")
        .select("*")
        .eq("organization_id", organizationId)
        .maybeSingle();
      
      if (error) throw error;
      return data as DemoConfig | null;
    },
    enabled: !!organizationId,
  });
}

// Hook para listar todas las configuraciones de demo
export function useDemoConfigs() {
  return useQuery({
    queryKey: ["demo-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_config")
        .select(`
          *,
          organization:organizations(id, name, slug)
        `)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

// Hook para crear/actualizar configuración de demo
export function useUpsertDemoConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: Partial<DemoConfig> & { organization_id: string }) => {
      const { data: existing } = await supabase
        .from("demo_config")
        .select("id")
        .eq("organization_id", config.organization_id)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from("demo_config")
          .update(config)
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("demo_config")
          .insert(config)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["demo-config", variables.organization_id] });
      queryClient.invalidateQueries({ queryKey: ["demo-configs"] });
    },
  });
}

// Hook para activar/desactivar modo demo
export function useToggleDemoMode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, isActive }: { organizationId: string; isActive: boolean }) => {
      const { data: existing } = await supabase
        .from("demo_config")
        .select("id")
        .eq("organization_id", organizationId)
        .maybeSingle();
      
      if (existing) {
        const { data, error } = await supabase
          .from("demo_config")
          .update({ is_active: isActive })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("demo_config")
          .insert({ organization_id: organizationId, is_active: isActive })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["demo-config", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["demo-configs"] });
    },
  });
}

// Hook para sesiones de demo
export function useDemoSessions(organizationId?: string) {
  return useQuery({
    queryKey: ["demo-sessions", organizationId],
    queryFn: async () => {
      // Query sessions without FK join (no FK exists for presenter_id)
      let query = supabase
        .from("demo_sessions")
        .select("*")
        .order("started_at", { ascending: false });
      
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      
      const { data: sessions, error } = await query;
      if (error) throw error;

      // Fetch presenter info separately if needed
      if (sessions && sessions.length > 0) {
        const presenterIds = [...new Set(sessions.map(s => s.presenter_id).filter(Boolean))];
        if (presenterIds.length > 0) {
          const { data: users } = await supabase
            .from("users")
            .select("id, full_name, avatar_url")
            .in("id", presenterIds);

          const userMap = new Map((users ?? []).map(u => [u.id, u]));
          return sessions.map(s => ({
            ...s,
            presenter: s.presenter_id ? userMap.get(s.presenter_id) ?? null : null,
          }));
        }
      }

      return sessions?.map(s => ({ ...s, presenter: null })) ?? [];
    },
  });
}

// Hook para estadísticas de demo
export function useDemoStats(organizationId?: string) {
  return useQuery({
    queryKey: ["demo-stats", organizationId],
    queryFn: async (): Promise<DemoStats> => {
      const today = new Date().toISOString().split("T")[0];
      
      let query = supabase.from("demo_sessions").select("*");
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      
      const { data: sessions, error } = await query;
      if (error) throw error;
      
      const allSessions = sessions || [];
      const todaySessions = allSessions.filter(s => s.started_at?.startsWith(today));
      const completedSessions = allSessions.filter(s => s.status === 'completed' || s.status === 'converted');
      const convertedSessions = allSessions.filter(s => s.status === 'converted');
      const pendingSessions = allSessions.filter(s => s.status === 'pending');
      const lostSessions = allSessions.filter(s => s.status === 'lost');
      
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const avgDuration = completedSessions.length > 0 
        ? Math.round(totalDuration / completedSessions.length / 60) 
        : 0;
      
      const conversionRate = completedSessions.length > 0
        ? Math.round((convertedSessions.length / completedSessions.length) * 100)
        : 0;
      
      return {
        todayDemos: todaySessions.length,
        conversionRate,
        avgDuration,
        totalDemos: allSessions.length,
        pending: pendingSessions.length,
        converted: convertedSessions.length,
        lost: lostSessions.length,
      };
    },
  });
}

// Hook para iniciar una sesión de demo
export function useStartDemoSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (session: Omit<DemoSessionInsert, 'started_at' | 'status'>) => {
      const { data, error } = await supabase
        .from("demo_sessions")
        .insert({
          ...session,
          started_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Actualizar contador en demo_config manualmente
      const { data: currentConfig } = await supabase
        .from("demo_config")
        .select("demos_count")
        .eq("organization_id", session.organization_id)
        .maybeSingle();
      
      if (currentConfig) {
        await supabase
          .from("demo_config")
          .update({ 
            demos_count: (currentConfig.demos_count || 0) + 1,
            last_demo_at: new Date().toISOString(),
          })
          .eq("organization_id", session.organization_id);
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["demo-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["demo-stats"] });
      queryClient.invalidateQueries({ queryKey: ["demo-config", data.organization_id] });
    },
  });
}

// Hook para finalizar una sesión de demo
export function useEndDemoSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      status, 
      notes, 
      followUpDate 
    }: { 
      sessionId: string; 
      status: DemoSession['status']; 
      notes?: string;
      followUpDate?: string;
    }) => {
      const { data: session } = await supabase
        .from("demo_sessions")
        .select("started_at, organization_id")
        .eq("id", sessionId)
        .single();
      
      if (!session) throw new Error("Sesión no encontrada");
      
      const endedAt = new Date();
      const startedAt = new Date(session.started_at);
      const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
      
      const { data, error } = await supabase
        .from("demo_sessions")
        .update({
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          status,
          notes,
          follow_up_date: followUpDate,
        })
        .eq("id", sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demo-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["demo-stats"] });
    },
  });
}

// Hook para verificar si la organización actual está en modo demo
export function useIsDemoMode(organizationId?: string, organizationSlug?: string) {
  const { data: config, isLoading } = useDemoConfig(organizationId);
  
  // Una organización está en modo demo si:
  // 1. Tiene config.is_active = true, O
  // 2. Su slug empieza con "demo-"
  const isDemoBySlug = organizationSlug?.startsWith("demo-") ?? false;
  const isDemoByConfig = config?.is_active ?? false;
  const isDemoMode = isDemoByConfig || isDemoBySlug;
  
  return {
    isDemoMode,
    showGuide: config?.show_guide ?? true,
    showHighlights: config?.show_highlights ?? true,
    showComparisons: config?.show_comparisons ?? true,
    isLoading,
    config,
  };
}
