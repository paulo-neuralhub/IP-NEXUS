// src/hooks/use-branding.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export interface OrganizationBranding {
  id: string;
  organization_id: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  colors: Record<string, string>;
  font_family: string;
  heading_font_family: string | null;
  app_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  show_powered_by: boolean;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  custom_domain_ssl_status: 'pending' | 'active' | 'failed' | null;
  custom_email_domain: string | null;
  custom_email_from_name: string | null;
  smtp_host: string | null;
  smtp_port: number;
  smtp_user: string | null;
  smtp_verified: boolean;
  portal_logo_url: string | null;
  portal_primary_color: string | null;
  portal_background_url: string | null;
  portal_welcome_message: string | null;
  plan_allows_white_label: boolean;
  created_at: string;
  updated_at: string;
}

export function useBranding() {
  const { currentOrganization } = useOrganization();

  const { data: branding, isLoading, refetch } = useQuery({
    queryKey: ['organization-branding', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase
        .from('organization_branding')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as OrganizationBranding | null;
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos cache
  });

  return { branding, isLoading, refetch };
}

// Helper para convertir hex a HSL
export function hexToHSL(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '0 0% 0%';
  
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
