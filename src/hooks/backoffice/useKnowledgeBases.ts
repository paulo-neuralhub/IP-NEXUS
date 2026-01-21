import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type KbConfidenceTier = "tier_1" | "tier_2" | "tier_3";
export type KbPlan = "basic" | "professional" | "enterprise";

export interface KbJurisdiction {
  id: string;
  code: string;
  name: string;
  name_local: string | null;
  language_code: string | null;
  flag_emoji: string | null;
  confidence_tier: KbConfidenceTier;
  score_overall: number;
  score_knowledge_depth: number;
  score_data_availability: number;
  score_update_recency: number;
  score_source_quality: number;
  data_sources: string[];
  official_registry_url: string | null;
  known_limitations: string[];
  coverage_gaps: string[];
  legal_disclaimer: string;
  requires_plan: KbPlan;
  is_active: boolean;
  is_beta: boolean;
  total_queries: number;
  accuracy_feedback_positive: number;
  accuracy_feedback_negative: number;
  last_content_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface KbLegalArea {
  id: string;
  jurisdiction_id: string;
  area_code: string;
  area_name: string;
  area_icon: string | null;
  area_score: number;
  documents_indexed: number;
  area_limitations: string[];
  is_active: boolean;
  requires_plan: KbPlan;
  last_updated: string;
}

export interface KbDisclaimer {
  id: string;
  tier: KbConfidenceTier;
  badge_text: string;
  badge_color: string;
  short_message: string;
  long_message: string;
  show_verification_prompt: boolean;
  verification_message: string | null;
  created_at: string;
}

export function useKbJurisdictions(filters?: {
  search?: string;
  tier?: KbConfidenceTier | "all";
  plan?: KbPlan | "all";
  active?: boolean | "all";
}) {
  return useQuery({
    queryKey: ["kb-jurisdictions", filters],
    queryFn: async (): Promise<KbJurisdiction[]> => {
      let query = supabase
        .from("ai_kb_jurisdictions")
        .select("*")
        .order("is_active", { ascending: false })
        .order("score_overall", { ascending: false });

      if (filters?.search) {
        const s = filters.search.trim();
        if (s) query = query.or(`code.ilike.%${s}%,name.ilike.%${s}%,name_local.ilike.%${s}%`);
      }
      if (filters?.tier && filters.tier !== "all") query = query.eq("confidence_tier", filters.tier);
      if (filters?.plan && filters.plan !== "all") query = query.eq("requires_plan", filters.plan);
      if (filters?.active !== undefined && filters.active !== "all") query = query.eq("is_active", filters.active);

      const { data, error } = await query.limit(500);
      if (error) throw error;
      return (data || []) as unknown as KbJurisdiction[];
    },
  });
}

export function useUpsertKbJurisdiction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<KbJurisdiction> & { id?: string }) => {
      const { id, ...rest } = payload;
      const base = {
        code: rest.code,
        name: rest.name,
        name_local: rest.name_local ?? null,
        language_code: rest.language_code ?? null,
        flag_emoji: rest.flag_emoji ?? null,
        confidence_tier: rest.confidence_tier,
        score_overall: rest.score_overall,
        score_knowledge_depth: rest.score_knowledge_depth,
        score_data_availability: rest.score_data_availability,
        score_update_recency: rest.score_update_recency,
        score_source_quality: rest.score_source_quality,
        data_sources: rest.data_sources ?? [],
        official_registry_url: rest.official_registry_url ?? null,
        known_limitations: rest.known_limitations ?? [],
        coverage_gaps: rest.coverage_gaps ?? [],
        legal_disclaimer: rest.legal_disclaimer,
        requires_plan: rest.requires_plan,
        is_active: rest.is_active ?? true,
        is_beta: rest.is_beta ?? false,
        last_content_update: rest.last_content_update ?? null,
      };

      if (id) {
        const { data, error } = await supabase
          .from("ai_kb_jurisdictions")
          .update(base)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        return data as unknown as KbJurisdiction;
      }

      const { data, error } = await supabase
        .from("ai_kb_jurisdictions")
        .insert(base)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as KbJurisdiction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb-jurisdictions"] });
      toast.success("Jurisdicción guardada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteKbJurisdiction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_kb_jurisdictions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb-jurisdictions"] });
      toast.success("Jurisdicción eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useKbLegalAreas(jurisdictionId: string | undefined) {
  return useQuery({
    queryKey: ["kb-legal-areas", jurisdictionId],
    queryFn: async (): Promise<KbLegalArea[]> => {
      if (!jurisdictionId) return [];
      const { data, error } = await supabase
        .from("ai_kb_legal_areas")
        .select("*")
        .eq("jurisdiction_id", jurisdictionId)
        .order("area_score", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as KbLegalArea[];
    },
    enabled: !!jurisdictionId,
  });
}

export function useUpsertKbLegalArea(jurisdictionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<KbLegalArea> & { id?: string }) => {
      const { id, ...rest } = payload;
      const base = {
        jurisdiction_id: jurisdictionId,
        area_code: rest.area_code,
        area_name: rest.area_name,
        area_icon: rest.area_icon ?? null,
        area_score: rest.area_score ?? 0,
        documents_indexed: rest.documents_indexed ?? 0,
        area_limitations: rest.area_limitations ?? [],
        is_active: rest.is_active ?? true,
        requires_plan: rest.requires_plan ?? "basic",
        last_updated: new Date().toISOString(),
      };

      if (id) {
        const { data, error } = await supabase
          .from("ai_kb_legal_areas")
          .update(base)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        return data as unknown as KbLegalArea;
      }

      const { data, error } = await supabase
        .from("ai_kb_legal_areas")
        .insert(base)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as KbLegalArea;
    },
    onSuccess: (_, __) => {
      qc.invalidateQueries({ queryKey: ["kb-legal-areas", jurisdictionId] });
      toast.success("Área legal guardada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteKbLegalArea(jurisdictionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_kb_legal_areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb-legal-areas", jurisdictionId] });
      toast.success("Área eliminada");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useKbDisclaimers() {
  return useQuery({
    queryKey: ["kb-disclaimers"],
    queryFn: async (): Promise<KbDisclaimer[]> => {
      const { data, error } = await supabase
        .from("ai_kb_disclaimers")
        .select("*")
        .order("tier", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as KbDisclaimer[];
    },
  });
}

export function useUpsertKbDisclaimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<KbDisclaimer> & { id: string }) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase
        .from("ai_kb_disclaimers")
        .update({
          badge_text: rest.badge_text,
          badge_color: rest.badge_color,
          short_message: rest.short_message,
          long_message: rest.long_message,
          show_verification_prompt: rest.show_verification_prompt,
          verification_message: rest.verification_message ?? null,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as KbDisclaimer;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb-disclaimers"] });
      toast.success("Disclaimer actualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
