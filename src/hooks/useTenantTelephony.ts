import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export type TenantTelephonyBalance = {
  id: string;
  tenant_id: string;
  minutes_balance: number;
  sms_balance: number;
  credit_balance: number;
  low_balance_alert_sent: boolean;
  low_balance_threshold: number;
  is_enabled: boolean;
  outbound_caller_id: string | null;
  total_minutes_used: number;
  total_sms_sent: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

export type TenantTelephonyPurchase = {
  id: string;
  tenant_id: string;
  pack_id: string | null;
  minutes_purchased: number;
  sms_purchased: number;
  price_paid: number;
  currency: string;
  purchased_at: string;
  expires_at: string | null;
  status: string;
  minutes_remaining: number | null;
  sms_remaining: number | null;
  payment_method: string | null;
  stripe_payment_id: string | null;
  invoice_id: string | null;
  created_at: string;
};

export type TelephonyUsageLog = {
  id: string;
  tenant_id: string;
  user_id: string | null;
  usage_type: string;
  from_number: string | null;
  to_number: string | null;
  country_code: string | null;
  duration_seconds: number | null;
  duration_minutes: number | null;
  provider_cost: number | null;
  charged_cost: number | null;
  minutes_deducted: number | null;
  matter_id: string | null;
  contact_id: string | null;
  recording_url: string | null;
  recording_duration: number | null;
  status: string | null;
  error_message: string | null;
  provider_call_sid: string | null;
  created_at: string;
};

export function useTenantTelephonyBalance() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tenant-telephony-balance', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;

      const { data, error } = await supabase
        .from('tenant_telephony_balance')
        .select('*')
        .eq('tenant_id', currentOrganization.id)
        .maybeSingle();

      if (error) throw error;
      return data as TenantTelephonyBalance | null;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useTenantTelephonyPurchases() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['tenant-telephony-purchases', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('tenant_telephony_purchases')
        .select('*')
        .eq('tenant_id', currentOrganization.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as TenantTelephonyPurchase[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useTelephonyUsageLogs(limit = 50) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['telephony-usage-logs', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('telephony_usage_logs')
        .select('*')
        .eq('tenant_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data ?? []) as TelephonyUsageLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpdateTelephonySettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (updates: Partial<TenantTelephonyBalance>) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('tenant_telephony_balance')
        .upsert({
          tenant_id: currentOrganization.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-telephony-balance'] });
      toast.success('Configuración actualizada');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar');
    },
  });
}
