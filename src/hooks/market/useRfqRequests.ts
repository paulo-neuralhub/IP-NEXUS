import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RfqRequest, RfqQuote, RfqInvitation, ServiceCategory } from '@/types/quote-request';
import { useToast } from '@/hooks/use-toast';

const PAGE_SIZE = 20;

// =====================================================
// FILTER INTERFACES
// =====================================================

export interface RfqRequestFilters {
  status?: string[];
  service_category?: ServiceCategory[];
  jurisdictions?: string[];
  search?: string;
  urgency?: string;
}

// =====================================================
// RFQ REQUESTS
// =====================================================

export function useRfqRequests(filters: RfqRequestFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['rfq-requests', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('rfq_requests')
        .select(`
          *,
          requester:requester_id(id, display_name, avatar_url, company_name)
        `)
        .eq('status', 'open')
        .order('published_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);
      
      if (filters.service_category?.length) {
        query = query.in('service_category', filters.service_category);
      }
      if (filters.jurisdictions?.length) {
        query = query.overlaps('jurisdictions', filters.jurisdictions);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.urgency) {
        query = query.eq('urgency', filters.urgency);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        requests: (data || []) as unknown as RfqRequest[],
        nextPage: (data?.length || 0) === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

export function useRfqRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['rfq-request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .select(`
          *,
          requester:requester_id(*)
        `)
        .eq('id', requestId!)
        .single();
      
      if (error) throw error;
      
      // Get quotes separately
      const { data: quotesData } = await supabase
        .from('rfq_quotes')
        .select(`
          *,
          agent:agent_id(id, display_name, avatar_url, company_name, reputation_score, rating_avg, is_verified_agent)
        `)
        .eq('request_id', requestId!)
        .neq('status', 'draft')
        .order('submitted_at', { ascending: false });
      
      return {
        ...data,
        quotes: quotesData || [],
      } as unknown as RfqRequest;
    },
    enabled: !!requestId,
  });
}

export function useMyRfqRequests() {
  return useQuery({
    queryKey: ['my-rfq-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!marketUser) return [];
      
      const { data, error } = await supabase
        .from('rfq_requests')
        .select('*')
        .eq('requester_id', marketUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as RfqRequest[];
    },
  });
}

export function useCreateRfqRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (request: Partial<RfqRequest>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!marketUser) throw new Error('Market user not found. Please complete your market profile first.');
      
      const { data, error } = await supabase
        .from('rfq_requests')
        .insert({
          ...request,
          requester_id: marketUser.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests'] });
      toast({ title: 'Solicitud creada correctamente' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error al crear solicitud', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });
}

export function useUpdateRfqRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RfqRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests'] });
      toast({ title: 'Solicitud actualizada' });
    },
  });
}

export function usePublishRfqRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .update({
          status: 'open',
          published_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      toast({ title: 'Solicitud publicada' });
    },
  });
}

export function useCancelRfqRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqRequest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests'] });
      toast({ title: 'Solicitud cancelada' });
    },
  });
}

// =====================================================
// RFQ QUOTES
// =====================================================

export function useRfqQuote(quoteId: string | undefined) {
  return useQuery({
    queryKey: ['rfq-quote', quoteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .select(`
          *,
          agent:agent_id(*),
          request:request_id(*)
        `)
        .eq('id', quoteId!)
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    enabled: !!quoteId,
  });
}

export function useMyRfqQuotes() {
  return useQuery({
    queryKey: ['my-rfq-quotes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!marketUser) return [];
      
      const { data, error } = await supabase
        .from('rfq_quotes')
        .select(`
          *,
          request:request_id(id, reference_number, title, service_type, jurisdictions, status, requester_user_id, requester_name)
        `)
        .eq('agent_id', marketUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as RfqQuote[];
    },
  });
}

export function useCreateRfqQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (quote: Partial<RfqQuote>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!marketUser) throw new Error('Market user not found');
      
      const { data, error } = await supabase
        .from('rfq_quotes')
        .insert({
          ...quote,
          agent_id: marketUser.id,
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-rfq-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.request_id] });
      toast({ title: 'Presupuesto guardado' });
    },
  });
}

export function useUpdateRfqQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RfqQuote> & { id: string }) => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-quote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-quotes'] });
      toast({ title: 'Presupuesto actualizado' });
    },
  });
}

export function useSubmitRfqQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-quote', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.request_id] });
      toast({ title: 'Presupuesto enviado al cliente' });
    },
  });
}

export function useAwardRfqQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, notes }: { quoteId: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update({
          status: 'awarded',
          awarded_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .select('*, request:request_id(*)')
        .single();
      
      if (error) throw error;
      
      // Reject other quotes
      await supabase
        .from('rfq_quotes')
        .update({ 
          status: 'rejected', 
          rejected_at: new Date().toISOString() 
        })
        .eq('request_id', (data as any).request_id)
        .neq('id', quoteId)
        .in('status', ['submitted', 'viewed', 'shortlisted']);
      
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.request_id] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      toast({ title: '¡Presupuesto adjudicado!' });
    },
  });
}

export function useShortlistRfqQuote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update({
          status: 'shortlisted',
          shortlisted_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.request_id] });
    },
  });
}

export function useRejectRfqQuote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ quoteId, reason }: { quoteId: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('rfq_quotes')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', quoteId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqQuote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.request_id] });
      toast({ title: 'Presupuesto rechazado' });
    },
  });
}

// =====================================================
// RFQ INVITATIONS
// =====================================================

export function useMyRfqInvitations() {
  return useQuery({
    queryKey: ['my-rfq-invitations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      
      if (!marketUser) return [];
      
      const { data, error } = await supabase
        .from('rfq_invitations')
        .select(`
          *,
          request:request_id(*)
        `)
        .eq('agent_id', marketUser.id)
        .eq('status', 'pending')
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as RfqInvitation[];
    },
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      invitationId, 
      accept, 
      declineReason 
    }: { 
      invitationId: string; 
      accept: boolean; 
      declineReason?: string;
    }) => {
      const { data, error } = await supabase
        .from('rfq_invitations')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString(),
          decline_reason: declineReason,
        })
        .eq('id', invitationId)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RfqInvitation;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-rfq-invitations'] });
      toast({ 
        title: variables.accept 
          ? 'Invitación aceptada. Puedes enviar tu presupuesto.' 
          : 'Invitación rechazada' 
      });
    },
  });
}
