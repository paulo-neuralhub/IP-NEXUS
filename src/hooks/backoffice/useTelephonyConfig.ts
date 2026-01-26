// ============================================================
// IP-NEXUS BACKOFFICE - Telephony Config Hook
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TelephonyProvider {
  id: string;
  code: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  is_default: boolean;
  required_credentials: string[];
  supports_voice: boolean;
  supports_sms: boolean;
  supports_whatsapp: boolean;
  supports_recording: boolean;
  base_rates: Record<string, number>;
  setup_instructions: string | null;
  api_docs_url: string | null;
}

export interface TelephonyConfig {
  id: string;
  active_provider_id: string | null;
  credentials_encrypted: Record<string, string> | null;
  phone_numbers: Array<{
    number: string;
    country: string;
    capabilities: string[];
  }> | null;
  markup_percentage: number;
  alert_low_balance_threshold: number;
  alert_email: string | null;
  test_mode: boolean;
  voip_enabled: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface VerifyProviderResult {
  success: boolean;
  error?: string;
  account_info?: {
    friendly_name?: string;
    status?: string;
    balance?: number;
  };
}

// Get all telephony providers
export function useTelephonyProviders() {
  return useQuery({
    queryKey: ['telephony-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_providers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as TelephonyProvider[];
    },
  });
}

// Get global telephony config
export function useTelephonyConfig() {
  return useQuery({
    queryKey: ['telephony-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_config')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as TelephonyConfig | null;
    },
  });
}

// Update telephony config
export function useUpdateTelephonyConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TelephonyConfig> & { id?: string }) => {
      if (data.id) {
        // Update existing
        const { error } = await supabase
          .from('telephony_config')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('telephony_config')
          .insert(data);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telephony-config'] });
      toast.success('Configuración guardada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Verify provider credentials
export function useVerifyTelephonyProvider() {
  return useMutation({
    mutationFn: async (params: { provider: string; credentials: Record<string, string> }): Promise<VerifyProviderResult> => {
      const { data, error } = await supabase.functions.invoke('verify-telephony-provider', {
        body: params,
      });
      
      if (error) throw error;
      return data as VerifyProviderResult;
    },
  });
}

// Telephony dashboard metrics
export interface TelephonyMetrics {
  today: {
    calls: number;
    minutes: number;
    revenue: number;
    cost: number;
  };
  weeklyActivity: Array<{
    date: string;
    calls: number;
    minutes: number;
  }>;
  lowBalanceTenants: Array<{
    id: string;
    name: string;
    minutes_balance: number;
  }>;
  topConsumers: Array<{
    id: string;
    name: string;
    total_minutes: number;
  }>;
  packsSoldThisMonth: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
}

export function useTelephonyMetrics() {
  return useQuery({
    queryKey: ['telephony-metrics'],
    queryFn: async (): Promise<TelephonyMetrics> => {
      // Get today's metrics
      const today = new Date().toISOString().split('T')[0];
      
      const { data: dailyMetrics } = await supabase
        .from('telephony_daily_metrics')
        .select('*')
        .eq('date', today)
        .is('tenant_id', null)
        .maybeSingle();
      
      // Get weekly activity
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyData } = await supabase
        .from('telephony_daily_metrics')
        .select('date, calls_outbound, calls_inbound, calls_total_minutes')
        .is('tenant_id', null)
        .gte('date', weekAgo.toISOString().split('T')[0])
        .order('date');
      
      // Get low balance tenants
      const { data: lowBalance } = await supabase
        .from('tenant_telephony_balance')
        .select('tenant_id, minutes_balance, organizations!inner(name)')
        .eq('is_enabled', true)
        .lt('minutes_balance', 30)
        .order('minutes_balance')
        .limit(10);
      
      // Get top consumers this month
      const monthStart = new Date();
      monthStart.setDate(1);
      
      const { data: topConsumers } = await supabase
        .from('telephony_daily_metrics')
        .select('tenant_id, calls_total_minutes, organizations!inner(name)')
        .gte('date', monthStart.toISOString().split('T')[0])
        .not('tenant_id', 'is', null)
        .order('calls_total_minutes', { ascending: false })
        .limit(5);
      
      // Get packs sold this month
      const { data: packsSold } = await supabase
        .from('tenant_telephony_purchases')
        .select('pack_id, price_paid, telephony_packs!inner(name)')
        .gte('purchased_at', monthStart.toISOString())
        .order('purchased_at', { ascending: false });
      
      // Aggregate packs sold
      const packsMap = new Map<string, { name: string; count: number; revenue: number }>();
      packsSold?.forEach((p: any) => {
        const name = p.telephony_packs?.name || 'Unknown';
        const existing = packsMap.get(name) || { name, count: 0, revenue: 0 };
        existing.count++;
        existing.revenue += Number(p.price_paid) || 0;
        packsMap.set(name, existing);
      });
      
      return {
        today: {
          calls: (dailyMetrics?.calls_outbound || 0) + (dailyMetrics?.calls_inbound || 0),
          minutes: dailyMetrics?.calls_total_minutes || 0,
          revenue: dailyMetrics?.revenue || 0,
          cost: dailyMetrics?.provider_cost || 0,
        },
        weeklyActivity: weeklyData?.map((d: any) => ({
          date: d.date,
          calls: (d.calls_outbound || 0) + (d.calls_inbound || 0),
          minutes: d.calls_total_minutes || 0,
        })) || [],
        lowBalanceTenants: lowBalance?.map((t: any) => ({
          id: t.tenant_id,
          name: t.organizations?.name || 'Unknown',
          minutes_balance: t.minutes_balance,
        })) || [],
        topConsumers: topConsumers?.map((t: any) => ({
          id: t.tenant_id,
          name: t.organizations?.name || 'Unknown',
          total_minutes: t.calls_total_minutes,
        })) || [],
        packsSoldThisMonth: Array.from(packsMap.values()),
      };
    },
  });
}

// Sync phone numbers from provider
export function useSyncPhoneNumbers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-telephony-numbers', {});
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telephony-config'] });
      toast.success('Números sincronizados');
    },
    onError: (error) => {
      toast.error(`Error al sincronizar: ${error.message}`);
    },
  });
}
