import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

export interface ServiceCatalogMetadata {
  duration_estimate?: string;
  includes?: string[];
  requirements?: string[];
}

export interface ServiceCatalogItem {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  base_price: number;
  currency: string;
  category?: string | null;
  is_active: boolean;
  stripe_price_id?: string | null;
  display_order?: number | null;
  metadata?: ServiceCatalogMetadata | null;
  created_at: string;
}

export function useServiceCatalog(category?: string) {
  const { user } = usePortalAuth();
  const organizationId = user?.portal.organization_id;

  return useQuery({
    queryKey: ['service-catalog', organizationId, category],
    queryFn: async (): Promise<ServiceCatalogItem[]> => {
      if (!organizationId) return [];

      let query = supabase
        .from('service_catalog')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as ServiceCatalogItem[]) ?? [];
    },
    enabled: !!organizationId,
  });
}
