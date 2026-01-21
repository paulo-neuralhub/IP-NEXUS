/**
 * Billing Rates Hooks
 * P57: Time Tracking Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export type RateType = 'user' | 'role' | 'matter_type' | 'client' | 'default';

export interface BillingRate {
  id: string;
  organization_id: string;
  rate_type: RateType;
  user_id?: string;
  role_name?: string;
  matter_type?: string;
  contact_id?: string;
  hourly_rate: number;
  currency: string;
  name?: string;
  description?: string;
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: { id: string; full_name: string };
  contact?: { id: string; full_name: string };
}

// Get all billing rates
export function useBillingRates() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['billing-rates', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('billing_rates')
        .select(`
          *,
          user:users(id, full_name),
          contact:contacts(id, full_name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('rate_type', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BillingRate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Create billing rate
export function useCreateBillingRate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      rate_type: RateType;
      hourly_rate: number;
      currency?: string;
      name?: string;
      description?: string;
      user_id?: string;
      role_name?: string;
      matter_type?: string;
      contact_id?: string;
      effective_from?: string;
      effective_until?: string;
    }) => {
      if (!currentOrganization?.id) {
        throw new Error('No organization');
      }

      const { data: rate, error } = await supabase
        .from('billing_rates')
        .insert({
          organization_id: currentOrganization.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return rate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-rates'] });
    },
  });
}

// Update billing rate
export function useUpdateBillingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BillingRate> & { id: string }) => {
      const { data, error } = await supabase
        .from('billing_rates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-rates'] });
    },
  });
}

// Delete billing rate
export function useDeleteBillingRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('billing_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-rates'] });
    },
  });
}

// Get applicable rate for a matter
export function useApplicableRate(matterId: string | undefined) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['applicable-rate', currentOrganization?.id, matterId],
    queryFn: async () => {
      if (!currentOrganization?.id || !matterId) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_applicable_rate', {
        p_organization_id: currentOrganization.id,
        p_user_id: user.id,
        p_matter_id: matterId,
      });

      if (error) throw error;
      return data as number;
    },
    enabled: !!currentOrganization?.id && !!matterId,
  });
}
