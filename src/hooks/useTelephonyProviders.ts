import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TelephonyProvider = {
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
  created_at: string;
};

export function useTelephonyProviders() {
  return useQuery({
    queryKey: ['telephony-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_providers')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return (data ?? []) as TelephonyProvider[];
    },
  });
}

export function useTelephonyProvider(code: string) {
  return useQuery({
    queryKey: ['telephony-provider', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_providers')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) throw error;
      return data as TelephonyProvider | null;
    },
    enabled: !!code,
  });
}
