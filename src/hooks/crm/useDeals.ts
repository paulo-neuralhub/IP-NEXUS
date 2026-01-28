/**
 * useDeals - Hook para gestión de Deals del CRM simplificado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export type DealStage = 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: string;
  organization_id: string;
  client_id: string | null;
  lead_id: string | null;
  deal_number: string;
  name: string;
  stage: DealStage;
  amount: number | null;
  probability: number;
  expected_close_date: string | null;
  next_action: string | null;
  next_action_date: string | null;
  won_at: string | null;
  won_value: number | null;
  lost_at: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    name: string;
    client_number: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface CreateDealData {
  client_id?: string;
  name: string;
  stage?: DealStage;
  amount?: number;
  probability?: number;
  expected_close_date?: string;
  next_action?: string;
  next_action_date?: string;
}

export function useDeals(filters?: { stage?: DealStage; client_id?: string; exclude_closed?: boolean }) {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ['crm-deals', orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      // Use 'as any' to bypass type conflicts with existing crm_deals schema
      let query = (supabase.from('crm_deals') as any)
        .select(`
          *,
          client:clients(id, name, client_number, email, phone)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.stage) {
        query = query.eq('stage', filters.stage);
      }

      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters?.exclude_closed) {
        query = query.not('stage', 'in', '(won,lost)');
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Deal[];
    },
    enabled: !!orgId,
  });
}

export function useDeal(dealId: string | undefined) {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ['crm-deal', dealId],
    queryFn: async () => {
      if (!dealId || !orgId) return null;

      const { data, error } = await (supabase.from('crm_deals') as any)
        .select(`
          *,
          client:clients(id, name, client_number, email, phone)
        `)
        .eq('id', dealId)
        .eq('organization_id', orgId)
        .single();

      if (error) throw error;
      return data as Deal;
    },
    enabled: !!dealId && !!orgId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: CreateDealData) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: result, error } = await (supabase.from('crm_deals') as any)
        .insert({
          ...data,
          organization_id: currentOrganization.id,
          stage: data.stage || 'contacted',
          probability: data.probability || 20,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.success('Deal creado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al crear deal: ${error.message}`);
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      stage,
      notes,
    }: {
      dealId: string;
      stage: DealStage;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_deal_stage', {
        p_deal_id: dealId,
        p_new_stage: stage,
        p_notes: notes || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; probability?: number };
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar stage');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useWinDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      wonValue,
      notes,
    }: {
      dealId: string;
      wonValue?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('win_deal', {
        p_deal_id: dealId,
        p_won_value: wonValue || null,
        p_notes: notes || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; won_value?: number };
      if (!result.success) {
        throw new Error(result.error || 'Error al marcar como ganado');
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.success(`🎉 Deal ganado por ${result.won_value?.toLocaleString('es-ES')} €`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useLoseDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      reason,
      reasonDetail,
    }: {
      dealId: string;
      reason: string;
      reasonDetail?: string;
    }) => {
      const { data, error } = await supabase.rpc('lose_deal', {
        p_deal_id: dealId,
        p_reason: reason,
        p_reason_detail: reasonDetail || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Error al marcar como perdido');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast.info('Deal marcado como perdido');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Hook para estadísticas del dashboard
export function useCRMDashboardStats() {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ['crm-dashboard-stats', orgId],
    queryFn: async () => {
      if (!orgId) return null;

      const { data, error } = await supabase.rpc('get_crm_dashboard_stats', {
        p_organization_id: orgId,
      });

      if (error) throw error;
      return data as {
        leads: {
          total: number;
          new: number;
          contacted: number;
          standby: number;
          converted_this_month: number;
        };
        deals: {
          total_open: number;
          total_value: number;
          by_stage: Record<string, number>;
          won_this_month: number;
          won_value_this_month: number;
          lost_this_month: number;
        };
        clients: {
          total: number;
          new_this_month: number;
        };
        activities: {
          today: number;
          this_week: number;
        };
      };
    },
    enabled: !!orgId,
  });
}
