// =====================================================
// IP-NEXUS - HOOKS FOR HOLDERS (PROMPT 26)
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fromTable, rpcFn } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import type { Holder, HolderFormData, ClientHolder } from '@/types/holders';

// =====================================================
// HOOKS: HOLDERS
// =====================================================

export function useHolders(filters?: { search?: string; isActive?: boolean; limit?: number }) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['holders', organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = fromTable('holders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('legal_name', { ascending: true });

      if (filters?.search) {
        query = query.or(
          `legal_name.ilike.%${filters.search}%,trade_name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%`
        );
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Holder[];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 30,
  });
}

export function useHolder(id: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['holder', id],
    queryFn: async () => {
      if (!id || !organizationId) return null;
      
      const { data, error } = await fromTable('holders')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();
      
      if (error) throw error;
      return data as Holder;
    },
    enabled: !!id && !!organizationId,
  });
}

export function useCreateHolder() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: HolderFormData) => {
      if (!organizationId) throw new Error('No organization selected');

      // Generate holder code
      const { data: codeData } = await rpcFn('generate_holder_code', { p_organization_id: organizationId });
      const code = codeData || `HOL-${Date.now()}`;

      const { data, error } = await fromTable('holders')
        .insert({
          ...formData,
          organization_id: organizationId,
          code,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Holder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holders'] });
      toast({ title: 'Titular creado correctamente' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al crear titular', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateHolder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HolderFormData> }) => {
      const { data: updated, error } = await fromTable('holders')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Holder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['holders'] });
      queryClient.invalidateQueries({ queryKey: ['holder', variables.id] });
      toast({ title: 'Titular actualizado' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al actualizar titular', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteHolder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable('holders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holders'] });
      toast({ title: 'Titular eliminado' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al eliminar titular', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

// =====================================================
// HOOKS: CLIENT-HOLDER RELATIONSHIPS
// =====================================================

export function useClientHolders(accountId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['client-holders', accountId],
    queryFn: async () => {
      if (!accountId || !organizationId) return [];

      const { data, error } = await fromTable('client_holders')
        .select(`
          *,
          holder:holders(id, legal_name, trade_name, country, tax_id, holder_type)
        `)
        .eq('account_id', accountId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as ClientHolder[];
    },
    enabled: !!accountId && !!organizationId,
  });
}

export function useHolderClients(holderId: string | undefined) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['holder-clients', holderId],
    queryFn: async () => {
      if (!holderId || !organizationId) return [];

      const { data, error } = await fromTable('client_holders')
        .select(`
          *,
          account:crm_accounts(id, name, account_type)
        `)
        .eq('holder_id', holderId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as ClientHolder[];
    },
    enabled: !!holderId && !!organizationId,
  });
}

export function useCreateClientHolder() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      account_id: string;
      holder_id: string;
      relationship_type: string;
      representation_scope?: string;
      jurisdictions?: string[];
      client_reference?: string;
      notes?: string;
    }) => {
      if (!organizationId) throw new Error('No organization selected');

      const { data: created, error } = await fromTable('client_holders')
        .insert({
          ...data,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return created as ClientHolder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-holders', variables.account_id] });
      queryClient.invalidateQueries({ queryKey: ['holder-clients', variables.holder_id] });
      toast({ title: 'Relación cliente-titular creada' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al crear relación', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

export function useDeleteClientHolder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, accountId, holderId }: { id: string; accountId: string; holderId: string }) => {
      const { error } = await fromTable('client_holders').delete().eq('id', id);
      if (error) throw error;
      return { accountId, holderId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['client-holders', result.accountId] });
      queryClient.invalidateQueries({ queryKey: ['holder-clients', result.holderId] });
      toast({ title: 'Relación eliminada' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al eliminar relación', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}

// =====================================================
// HOOKS: MATTER PARTIES WITH HOLDERS
// =====================================================

export function useMatterHolders(matterId: string | undefined) {
  return useQuery({
    queryKey: ['matter-holders', matterId],
    queryFn: async () => {
      if (!matterId) return [];

      const { data, error } = await rpcFn('get_matter_current_holders', { p_matter_id: matterId });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!matterId,
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      matterId: string;
      fromHolderId: string;
      toHolderId: string;
      transferDate: string;
      registrationReference?: string;
      supportingDocumentId?: string;
      notes?: string;
    }) => {
      const { error } = await rpcFn('transfer_matter_ownership', {
        p_matter_id: params.matterId,
        p_from_holder_id: params.fromHolderId,
        p_to_holder_id: params.toHolderId,
        p_transfer_date: params.transferDate,
        p_registration_reference: params.registrationReference,
        p_supporting_document_id: params.supportingDocumentId,
        p_notes: params.notes,
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-holders', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-parties', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter', variables.matterId] });
      toast({ title: 'Titularidad transferida correctamente' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al transferir titularidad', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });
}
