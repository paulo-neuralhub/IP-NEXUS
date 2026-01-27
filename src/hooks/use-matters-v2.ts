// ============================================================
// IP-NEXUS - Matters V2 Hooks
// New expediente system with numbering, filings, timeline
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

// ============================================================
// Types
// ============================================================

export interface MatterType {
  code: string;
  name_es: string;
  name_en: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface MatterV2 {
  id: string;
  organization_id: string;
  matter_number: string;
  reference: string | null;
  title: string;
  matter_type: string;
  status: string;
  status_date: string | null;
  client_id: string | null;
  instruction_date: string | null;
  priority_date: string | null;
  mark_name: string | null;
  mark_type: string | null;
  mark_image_url: string | null;
  invention_title: string | null;
  nice_classes: number[] | null;
  ipc_classes: string[] | null;
  goods_services: string | null;
  responsible_id: string | null;
  assistant_id: string | null;
  estimated_official_fees: number | null;
  estimated_professional_fees: number | null;
  currency: string;
  is_urgent: boolean;
  is_confidential: boolean;
  is_archived: boolean;
  internal_notes: string | null;
  client_instructions: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatterFiling {
  id: string;
  matter_id: string;
  organization_id: string;
  jurisdiction_code: string;
  office_code: string | null;
  application_number: string | null;
  registration_number: string | null;
  publication_number: string | null;
  filing_date: string | null;
  publication_date: string | null;
  registration_date: string | null;
  grant_date: string | null;
  expiry_date: string | null;
  next_renewal_date: string | null;
  status: string;
  status_date: string | null;
  priority_claimed: boolean;
  priority_country: string | null;
  priority_number: string | null;
  priority_date: string | null;
  official_fees_paid: number | null;
  professional_fees: number | null;
  local_agent_id: string | null;
  local_reference: string | null;
  notes: string | null;
  office_link_id: string | null;
  last_sync_at: string | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MatterTimelineEvent {
  id: string;
  matter_id: string;
  organization_id: string;
  event_type: string;
  event_category: string;
  title: string;
  description: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_fields: string[] | null;
  filing_id: string | null;
  document_id: string | null;
  party_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  event_date: string;
}

export interface MatterParty {
  id: string;
  matter_id: string;
  organization_id: string;
  party_role: string;
  contact_id: string | null;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  tax_id: string | null;
  nationality: string | null;
  inventor_waiver: boolean;
  is_primary: boolean;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatterV2Filters {
  search?: string;
  matter_type?: string;
  status?: string;
  client_id?: string;
  responsible_id?: string;
  is_archived?: boolean;
}

// ============================================================
// Hooks
// ============================================================

export function useMatterTypes() {
  return useQuery({
    queryKey: ['matter-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matter_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as MatterType[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useMattersV2(filters?: MatterV2Filters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['matters-v2', currentOrganization?.id, filters],
    queryFn: async () => {
      // Use legacy 'matters' table since matters_v2 is empty
      // Map legacy fields to V2 interface
      let query = supabase
        .from('matters')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,reference.ilike.%${filters.search}%,mark_name.ilike.%${filters.search}%`);
      }
      if (filters?.matter_type) {
        query = query.eq('type', filters.matter_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters?.responsible_id) {
        query = query.eq('assigned_to', filters.responsible_id);
      }
      // Legacy table doesn't have is_archived, skip that filter
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map legacy 'matters' fields to MatterV2 interface
      return (data || []).map((m: any) => ({
        id: m.id,
        organization_id: m.organization_id,
        matter_number: m.reference || m.id.substring(0, 8),
        reference: m.reference,
        title: m.title || m.mark_name || 'Sin título',
        matter_type: m.type || 'trademark',
        status: m.status || 'active',
        status_date: m.updated_at,
        client_id: m.client_id,
        instruction_date: m.filing_date,
        priority_date: m.priority_date,
        mark_name: m.mark_name,
        mark_type: m.mark_type,
        mark_image_url: m.mark_image_url,
        invention_title: m.title,
        nice_classes: m.nice_classes,
        ipc_classes: null,
        goods_services: m.goods_services,
        responsible_id: m.assigned_to,
        assistant_id: null,
        estimated_official_fees: null,
        estimated_professional_fees: null,
        currency: 'EUR',
        is_urgent: false,
        is_confidential: false,
        is_archived: false,
        internal_notes: m.notes,
        client_instructions: null,
        tags: m.tags || [],
        custom_fields: {},
        created_by: m.created_by,
        created_at: m.created_at,
        updated_at: m.updated_at,
      })) as MatterV2[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useMatterV2(id: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['matter-v2', id],
    queryFn: async () => {
      // Use legacy 'matters' table since matters_v2 is empty
      const { data: m, error } = await supabase
        .from('matters')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization!.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!m) return null;
      
      // Map legacy fields to MatterV2 interface
      return {
        id: m.id,
        organization_id: m.organization_id,
        matter_number: m.reference || m.id.substring(0, 8),
        reference: m.reference,
        title: m.title || m.mark_name || 'Sin título',
        matter_type: m.type || 'trademark',
        status: m.status || 'active',
        status_date: m.updated_at,
        client_id: m.client_id,
        instruction_date: m.filing_date,
        priority_date: m.priority_date,
        mark_name: m.mark_name,
        mark_type: m.mark_type,
        mark_image_url: m.mark_image_url,
        invention_title: m.title,
        nice_classes: m.nice_classes,
        ipc_classes: null,
        goods_services: m.goods_services,
        responsible_id: m.assigned_to,
        assistant_id: null,
        estimated_official_fees: m.official_fees,
        estimated_professional_fees: m.professional_fees,
        currency: m.currency || 'EUR',
        is_urgent: false,
        is_confidential: false,
        is_archived: m.is_archived || false,
        internal_notes: m.notes || m.internal_notes,
        client_instructions: null,
        tags: m.tags || [],
        custom_fields: {},
        created_by: m.created_by,
        created_at: m.created_at,
        updated_at: m.updated_at,
      } as MatterV2;
    },
    enabled: !!id && !!currentOrganization?.id,
  });
}

export function useMatterFilings(matterId: string) {
  return useQuery({
    queryKey: ['matter-filings', matterId],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('matter_filings')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MatterFiling[];
    },
    enabled: !!matterId,
  });
}

export function useMatterTimeline(matterId: string) {
  return useQuery({
    queryKey: ['matter-timeline', matterId],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('matter_timeline')
        .select('*')
        .eq('matter_id', matterId)
        .order('event_date', { ascending: false });
      
      if (error) throw error;
      return data as MatterTimelineEvent[];
    },
    enabled: !!matterId,
  });
}

export function useMatterParties(matterId: string) {
  return useQuery({
    queryKey: ['matter-parties', matterId],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client
        .from('matter_parties')
        .select('*')
        .eq('matter_id', matterId)
        .order('sort_order');
      
      if (error) throw error;
      return data as MatterParty[];
    },
    enabled: !!matterId,
  });
}

// ============================================================
// Mutations
// ============================================================

export function useGenerateMatterNumber() {
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      matterType, 
      jurisdictionCode, 
      clientId 
    }: { 
      matterType: string; 
      jurisdictionCode: string; 
      clientId?: string;
    }) => {
      const { data, error } = await supabase.rpc('generate_matter_number', {
        p_organization_id: currentOrganization!.id,
        p_matter_type: matterType,
        p_jurisdiction_code: jurisdictionCode,
        p_client_id: clientId || null,
      });
      
      if (error) throw error;
      return data as string;
    },
  });
}

export function useCreateMatterV2() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<MatterV2> & { 
      matter_number: string;
      title: string;
      matter_type: string;
    }) => {
      const client: any = supabase;
      const { data: matter, error } = await client
        .from('matters_v2')
        .insert({ 
          ...data, 
          organization_id: currentOrganization!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return matter as MatterV2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters-v2'] });
    },
  });
}

export function useUpdateMatterV2() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MatterV2> }) => {
      const client: any = supabase;
      const { data: matter, error } = await client
        .from('matters_v2')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return matter as MatterV2;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matters-v2'] });
      queryClient.invalidateQueries({ queryKey: ['matter-v2', variables.id] });
    },
  });
}

export function useDeleteMatterV2() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('matters_v2')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters-v2'] });
    },
  });
}

// Filing mutations
export function useCreateFiling() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<MatterFiling> & { 
      matter_id: string;
      jurisdiction_code: string;
    }) => {
      const client: any = supabase;
      const { data: filing, error } = await client
        .from('matter_filings')
        .insert({ 
          ...data, 
          organization_id: currentOrganization!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return filing as MatterFiling;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-filings', variables.matter_id] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', variables.matter_id] });
    },
  });
}

export function useUpdateFiling() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, matterId, data }: { id: string; matterId: string; data: Partial<MatterFiling> }) => {
      const client: any = supabase;
      const { data: filing, error } = await client
        .from('matter_filings')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return filing as MatterFiling;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-filings', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', variables.matterId] });
    },
  });
}

// Party mutations
export function useCreateParty() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<MatterParty> & { 
      matter_id: string;
      party_role: string;
      name: string;
    }) => {
      const client: any = supabase;
      const { data: party, error } = await client
        .from('matter_parties')
        .insert({ 
          ...data, 
          organization_id: currentOrganization!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return party as MatterParty;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', variables.matter_id] });
    },
  });
}

export function useDeleteParty() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, matterId }: { id: string; matterId: string }) => {
      const client: any = supabase;
      const { error } = await client
        .from('matter_parties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', variables.matterId] });
    },
  });
}
