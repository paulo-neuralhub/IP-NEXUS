// ============================================
// src/hooks/finance/useProvisions.ts
// Hooks para gestión de provisiones de fondos
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

// Types
export interface Provision {
  id: string;
  organization_id: string;
  client_id?: string;
  matter_id?: string;
  concept: string;
  description?: string;
  amount: number;
  currency: string;
  status: ProvisionStatus;
  requested_at?: string;
  received_at?: string;
  payment_reference?: string;
  payment_date?: string;
  used_amount: number;
  used_for?: string;
  returned_amount: number;
  returned_at?: string;
  quote_id?: string;
  quote_line_id?: string;
  invoice_id?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Relations
  client?: { id: string; name: string };
  matter?: { id: string; reference: string; title: string };
}

export type ProvisionStatus = 'pending' | 'requested' | 'received' | 'used' | 'returned';

export interface ProvisionMovement {
  id: string;
  provision_id: string;
  movement_type: 'request' | 'receipt' | 'use' | 'return';
  amount: number;
  description?: string;
  reference?: string;
  document_url?: string;
  movement_date: string;
  created_by?: string;
  created_at: string;
}

export interface ProvisionFilters {
  client_id?: string;
  matter_id?: string;
  status?: ProvisionStatus | ProvisionStatus[];
}

// ===== PROVISIONES =====
export function useProvisions(filters?: ProvisionFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['provisions', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('provisions')
        .select(`
          *,
          client:contacts!provisions_client_id_fkey(id, name),
          matter:matters!provisions_matter_id_fkey(id, reference, title)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (filters?.client_id) query = query.eq('client_id', filters.client_id);
      if (filters?.matter_id) query = query.eq('matter_id', filters.matter_id);
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data as Provision[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useProvision(id: string) {
  return useQuery({
    queryKey: ['provision', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provisions')
        .select(`
          *,
          client:contacts!provisions_client_id_fkey(id, name),
          matter:matters!provisions_matter_id_fkey(id, reference, title)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Provision;
    },
    enabled: !!id,
  });
}

export function useProvisionsByMatter(matterId: string) {
  return useProvisions({ matter_id: matterId });
}

export function useProvisionsByClient(clientId: string) {
  return useProvisions({ client_id: clientId });
}

export function useCreateProvision() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Omit<Partial<Provision>, 'organization_id'>) => {
      const { data: provision, error } = await supabase
        .from('provisions')
        .insert({
          organization_id: currentOrganization!.id,
          client_id: data.client_id,
          matter_id: data.matter_id,
          concept: data.concept || '',
          description: data.description,
          amount: data.amount || 0,
          currency: data.currency || 'EUR',
          status: data.status || 'pending',
          quote_id: data.quote_id,
          quote_line_id: data.quote_line_id,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return provision as Provision;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provisions'] });
    },
  });
}

export function useUpdateProvision() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Provision> }) => {
      const { client, matter, ...updateData } = data as any;
      const { data: provision, error } = await supabase
        .from('provisions')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return provision as Provision;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provisions'] });
      queryClient.invalidateQueries({ queryKey: ['provision', variables.id] });
    },
  });
}

export function useDeleteProvision() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('provisions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provisions'] });
    },
  });
}

// ===== MOVIMIENTOS =====
export function useProvisionMovements(provisionId: string) {
  return useQuery({
    queryKey: ['provision-movements', provisionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provision_movements')
        .select('*')
        .eq('provision_id', provisionId)
        .order('movement_date', { ascending: false });
      if (error) throw error;
      return data as ProvisionMovement[];
    },
    enabled: !!provisionId,
  });
}

export function useCreateProvisionMovement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: Omit<Partial<ProvisionMovement>, 'created_by'>) => {
      // Insert movement
      const { data: movement, error } = await supabase
        .from('provision_movements')
        .insert({
          provision_id: data.provision_id!,
          movement_type: data.movement_type!,
          amount: data.amount || 0,
          description: data.description,
          reference: data.reference,
          document_url: data.document_url,
          movement_date: data.movement_date || new Date().toISOString().split('T')[0],
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      
      // Update provision based on movement type
      const updateData: Partial<Provision> = {};
      
      if (data.movement_type === 'request') {
        updateData.status = 'requested';
        updateData.requested_at = new Date().toISOString();
      } else if (data.movement_type === 'receipt') {
        updateData.status = 'received';
        updateData.received_at = new Date().toISOString();
        updateData.payment_reference = data.reference;
        updateData.payment_date = data.movement_date;
      } else if (data.movement_type === 'use') {
        // Get current provision to update used_amount
        const { data: provision } = await supabase
          .from('provisions')
          .select('used_amount, amount')
          .eq('id', data.provision_id!)
          .single();
        
        const newUsedAmount = (provision?.used_amount || 0) + (data.amount || 0);
        updateData.used_amount = newUsedAmount;
        updateData.used_for = data.description;
        
        if (newUsedAmount >= (provision?.amount || 0)) {
          updateData.status = 'used';
        }
      } else if (data.movement_type === 'return') {
        // Get current provision
        const { data: provision } = await supabase
          .from('provisions')
          .select('returned_amount')
          .eq('id', data.provision_id!)
          .single();
        
        updateData.returned_amount = (provision?.returned_amount || 0) + (data.amount || 0);
        updateData.returned_at = new Date().toISOString();
        updateData.status = 'returned';
      }
      
      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('provisions')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', data.provision_id!);
      }
      
      return movement as ProvisionMovement;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provision-movements', variables.provision_id] });
      queryClient.invalidateQueries({ queryKey: ['provision', variables.provision_id] });
      queryClient.invalidateQueries({ queryKey: ['provisions'] });
    },
  });
}

// ===== STATS =====
export function useProvisionStats() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['provision-stats', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provisions')
        .select('status, amount, used_amount, returned_amount')
        .eq('organization_id', currentOrganization!.id);
      
      if (error) throw error;
      
      const pending = data.filter(p => p.status === 'pending' || p.status === 'requested');
      const received = data.filter(p => p.status === 'received');
      const all = data;
      
      return {
        pendingCount: pending.length,
        pendingAmount: pending.reduce((sum, p) => sum + Number(p.amount), 0),
        receivedAmount: received.reduce((sum, p) => sum + Number(p.amount), 0),
        availableAmount: all.reduce((sum, p) => {
          const available = Number(p.amount) - Number(p.used_amount) - Number(p.returned_amount);
          return sum + (available > 0 ? available : 0);
        }, 0),
        totalAmount: all.reduce((sum, p) => sum + Number(p.amount), 0),
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
