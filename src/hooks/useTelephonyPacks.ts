import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type TelephonyPack = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  minutes_included: number;
  sms_included: number;
  price: number;
  currency: string;
  validity_days: number;
  is_active: boolean;
  is_featured: boolean;
  min_plan: string | null;
  display_order: number;
  badge_text: string | null;
  savings_percentage: number | null;
  created_at: string;
};

export function useTelephonyPacks() {
  return useQuery({
    queryKey: ['telephony-packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_packs')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return (data ?? []) as TelephonyPack[];
    },
  });
}

export function useTelephonyPack(id: string) {
  return useQuery({
    queryKey: ['telephony-pack', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telephony_packs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as TelephonyPack | null;
    },
    enabled: !!id,
  });
}
