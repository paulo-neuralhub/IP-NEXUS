// src/hooks/filing/useFiling.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { FilingApplication, FilingTrademarkData, FilingStatus, FilingType } from '@/types/filing.types';

// ============================================
// QUERIES
// ============================================

export function useFilingApplications(filters?: {
  status?: FilingStatus;
  ip_type?: string;
  search?: string;
}) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['filing-applications', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = (supabase
        .from('filing_applications' as any)
        .select(`
          *,
          office:ipo_offices(code, name_short, currency)
        `) as any)
        .eq('organization_id', currentOrganization?.id)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.ip_type) {
        query = query.eq('ip_type', filters.ip_type);
      }
      if (filters?.search) {
        query = query.or(`tracking_number.ilike.%${filters.search}%,official_filing_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data || []) as FilingApplication[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useFilingApplication(filingId?: string) {
  return useQuery({
    queryKey: ['filing-application', filingId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('filing_applications' as any)
        .select(`
          *,
          office:ipo_offices(code, name_short, name_official, currency, timezone),
          trademark_data:filing_trademark_data(*)
        `) as any)
        .eq('id', filingId)
        .single();
      
      if (error) throw error;
      return data as FilingApplication;
    },
    enabled: !!filingId,
  });
}

export function useFilingStats() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['filing-stats', currentOrganization?.id],
    queryFn: async () => {
      const { data } = await (supabase
        .from('filing_applications' as any)
        .select('status') as any)
        .eq('organization_id', currentOrganization?.id);

      const counts = {
        draft: 0,
        ready: 0,
        submitted: 0,
        accepted: 0,
        error: 0,
        total: data?.length || 0,
      };

      data?.forEach((f: any) => {
        if (f.status in counts) {
          counts[f.status as keyof typeof counts]++;
        }
      });

      return counts;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useFilingStatusHistory(filingId?: string) {
  return useQuery({
    queryKey: ['filing-status-history', filingId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('filing_status_history' as any)
        .select('*') as any)
        .eq('filing_id', filingId)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!filingId,
  });
}

export function useFilingTemplates(filingType?: FilingType, ipType?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['filing-templates', currentOrganization?.id, filingType, ipType],
    queryFn: async () => {
      let query = (supabase
        .from('filing_templates' as any)
        .select('*') as any)
        .or(`organization_id.eq.${currentOrganization?.id},organization_id.is.null`)
        .eq('is_active', true);

      if (filingType) query = query.eq('filing_type', filingType);
      if (ipType) query = query.eq('ip_type', ipType);

      const { data, error } = await query.order('use_count', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useFilingDrafts() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['filing-drafts', currentOrganization?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('filing_drafts' as any)
        .select('*') as any)
        .eq('user_id', user.id)
        .is('converted_to_filing_id', null)
        .order('auto_saved_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useFilingOffices(ipType: string) {
  return useQuery({
    queryKey: ['filing-offices', ipType],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ipo_offices' as any)
        .select('*') as any)
        .contains('ip_types', [ipType])
        .in('code', ['EM', 'ES', 'US', 'WO', 'GB'])
        .order('tier', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateFiling() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (params: {
      filing_type: FilingType;
      ip_type: 'trademark' | 'patent' | 'design';
      office_code: string;
      office_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate tracking number
      const year = new Date().getFullYear();
      const { count } = await (supabase
        .from('filing_applications' as any)
        .select('*', { count: 'exact', head: true }) as any)
        .eq('organization_id', currentOrganization?.id)
        .gte('created_at', `${year}-01-01`);
      
      const seq = String((count || 0) + 1).padStart(5, '0');
      const tracking_number = `FIL-${year}-${seq}`;

      const { data, error } = await (supabase
        .from('filing_applications' as any)
        .insert({
          organization_id: currentOrganization?.id,
          filing_type: params.filing_type,
          ip_type: params.ip_type,
          office_code: params.office_code,
          office_id: params.office_id,
          applicant_data: {},
          application_data: {},
          tracking_number,
          created_by: user.id,
        }) as any)
        .select()
        .single();

      if (error) throw error;
      return data as FilingApplication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filing-applications'] });
      queryClient.invalidateQueries({ queryKey: ['filing-stats'] });
    },
  });
}

export function useUpdateFiling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FilingApplication> & { id: string }) => {
      const { error } = await (supabase
        .from('filing_applications' as any)
        .update(data) as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filing-application', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['filing-applications'] });
    },
  });
}

export function useUpdateTrademarkData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ filing_id, ...data }: Partial<FilingTrademarkData> & { filing_id: string }) => {
      // Check if exists
      const { data: existing } = await (supabase
        .from('filing_trademark_data' as any)
        .select('id') as any)
        .eq('filing_id', filing_id)
        .single();

      if (existing) {
        const { error } = await (supabase
          .from('filing_trademark_data' as any)
          .update(data) as any)
          .eq('filing_id', filing_id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('filing_trademark_data' as any)
          .insert({ filing_id, ...data }) as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filing-application', variables.filing_id] });
    },
  });
}

export function useValidateFiling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filingId: string) => {
      const { data, error } = await supabase.functions.invoke('filing-validate', {
        body: { filingId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, filingId) => {
      queryClient.invalidateQueries({ queryKey: ['filing-application', filingId] });
      queryClient.invalidateQueries({ queryKey: ['filing-applications'] });
    },
  });
}

export function useCalculateFees() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filingId: string) => {
      const { data, error } = await supabase.functions.invoke('filing-calculate-fees', {
        body: { filingId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, filingId) => {
      queryClient.invalidateQueries({ queryKey: ['filing-application', filingId] });
    },
  });
}

export function useSubmitFiling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filingId: string) => {
      const { data, error } = await supabase.functions.invoke('filing-submit', {
        body: { filingId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, filingId) => {
      if (data.success) {
        toast.success(`¡Solicitud enviada! Número: ${data.filingNumber}`);
      } else {
        toast.error(data.error || 'Error al enviar solicitud');
      }
      queryClient.invalidateQueries({ queryKey: ['filing-application', filingId] });
      queryClient.invalidateQueries({ queryKey: ['filing-applications'] });
      queryClient.invalidateQueries({ queryKey: ['filing-stats'] });
    },
  });
}

export function useDeleteFiling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (filingId: string) => {
      const { error } = await (supabase
        .from('filing_applications' as any)
        .delete() as any)
        .eq('id', filingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filing-applications'] });
      queryClient.invalidateQueries({ queryKey: ['filing-stats'] });
      toast.success('Solicitud eliminada');
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (params: {
      filing_type: FilingType;
      ip_type: string;
      office_id?: string;
      current_step: number;
      wizard_data: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase
        .from('filing_drafts' as any)
        .upsert({
          organization_id: currentOrganization?.id,
          user_id: user.id,
          filing_type: params.filing_type,
          ip_type: params.ip_type,
          office_id: params.office_id,
          current_step: params.current_step,
          wizard_data: params.wizard_data,
          auto_saved_at: new Date().toISOString(),
        }) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filing-drafts'] });
    },
  });
}
