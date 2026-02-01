// =============================================
// Service Catalog Hooks
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  ServiceCatalogItem, 
  ServiceCatalogFilters, 
  ServiceType,
  ServicePrice,
  ServiceWithPrices,
} from '@/types/service-catalog';

// Legacy interface for portal compatibility
export interface ServiceCatalogMetadata {
  duration_estimate?: string;
  includes?: string[];
  requirements?: string[];
}

// Re-export types
export type { ServiceCatalogItem, ServiceCatalogFilters, ServiceType };

// ===== PORTAL QUERY (legacy) =====
export function usePortalServiceCatalog(category?: string) {
  const { user } = usePortalAuth();
  const organizationId = user?.portal.organization_id;

  return useQuery({
    queryKey: ['service-catalog-portal', organizationId, category],
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
      return (data as unknown as ServiceCatalogItem[]) ?? [];
    },
    enabled: !!organizationId,
  });
}

// ===== APP QUERIES =====

export function useServiceCatalog(filters?: ServiceCatalogFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['service-catalog', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name');
      
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      if (filters?.service_type && filters.service_type !== 'all') {
        query = query.eq('service_type', filters.service_type);
      }
      
      if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
        if (filters.jurisdiction === null) {
          query = query.is('jurisdiction', null);
        } else {
          query = query.eq('jurisdiction', filters.jurisdiction);
        }
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,reference_code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ServiceCatalogItem[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useActiveServices() {
  return useServiceCatalog({ is_active: true });
}

export function useServiceCatalogItem(id: string | undefined) {
  return useQuery({
    queryKey: ['service-catalog-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as ServiceCatalogItem;
    },
    enabled: !!id,
  });
}

// ===== MUTATIONS =====

export function useCreateService() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<ServiceCatalogItem> & { tax_rate?: number; estimated_hours?: number }) => {
      const insertData = {
        organization_id: currentOrganization!.id,
        name: data.name || '',
        description: data.description,
        category: typeof data.category === 'object' ? (data.category as any)?.name_es : data.category,
        category_id: (data as any).category_id,
        service_type: data.service_type || 'general',
        jurisdiction: data.jurisdiction,
        reference_code: data.reference_code,
        official_fee: data.official_fee || 0,
        professional_fee: data.professional_fee || 0,
        base_price: (data.official_fee || 0) + (data.professional_fee || 0),
        currency: data.currency || 'EUR',
        estimated_days: data.estimated_days,
        estimated_hours: data.estimated_hours,
        tax_rate: data.tax_rate ?? 21,
        nice_classes_included: data.nice_classes_included || 1,
        extra_class_fee: data.extra_class_fee || 0,
        display_order: data.display_order,
        is_active: data.is_active ?? true,
      } as any;
      
      const { data: service, error } = await supabase
        .from('service_catalog')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return service as unknown as ServiceCatalogItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceCatalogItem> }) => {
      // Recalculate base_price if fees changed
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      if (data.official_fee !== undefined || data.professional_fee !== undefined) {
        updateData.base_price = (data.official_fee || 0) + (data.professional_fee || 0);
      }
      
      const { data: service, error } = await supabase
        .from('service_catalog')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return service as unknown as ServiceCatalogItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog-item', variables.id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_catalog')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

// ===== HELPERS =====

export function useGenerateReferenceCode() {
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      serviceType, 
      jurisdiction 
    }: { 
      serviceType: ServiceType; 
      jurisdiction?: string | null;
    }) => {
      const prefixes: Record<string, string> = {
        marca: 'MAR',
        patente: 'PAT',
        diseño: 'DIS',
        vigilancia: 'VIG',
        renovacion: 'REN',
        oposicion: 'OPO',
        informe: 'INF',
        general: 'GEN',
        tm_registration: 'TM',
        tm_renewal: 'TMR',
        pt_filing: 'PT',
        ds_registration: 'DS',
      };
      
      const prefix = prefixes[serviceType] || 'GEN';
      const jurisdictionPart = jurisdiction ? `-${jurisdiction}` : '';
      const baseCode = `${prefix}${jurisdictionPart}`;
      
      // Count existing services with same prefix
      const { count } = await supabase
        .from('service_catalog')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization!.id)
        .ilike('reference_code', `${baseCode}-%`);
      
      const sequence = String((count || 0) + 1).padStart(3, '0');
      return `${baseCode}-${sequence}`;
    },
  });
}

// ===== SERVICE PRICES BY JURISDICTION =====

export function useServicePrices(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service-prices', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_prices')
        .select('*')
        .eq('service_id', serviceId!)
        .order('jurisdiction');
      
      if (error) throw error;
      return (data || []) as ServicePrice[];
    },
    enabled: !!serviceId,
  });
}

export function useServiceWithPrices(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service-with-prices', serviceId],
    queryFn: async () => {
      // Fetch service
      const { data: service, error: serviceError } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('id', serviceId!)
        .single();
      
      if (serviceError) throw serviceError;
      
      // Fetch prices
      const { data: prices, error: pricesError } = await supabase
        .from('service_prices')
        .select('*')
        .eq('service_id', serviceId!)
        .eq('is_active', true)
        .order('jurisdiction');
      
      if (pricesError) throw pricesError;
      
      return {
        ...(service as unknown as ServiceCatalogItem),
        prices: (prices || []) as ServicePrice[],
      } as ServiceWithPrices;
    },
    enabled: !!serviceId,
  });
}

export function useCreateServicePrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<ServicePrice, 'id' | 'total_price' | 'created_at' | 'updated_at'>) => {
      const { data: price, error } = await supabase
        .from('service_prices')
        .insert({
          service_id: data.service_id,
          jurisdiction: data.jurisdiction,
          official_fee: data.official_fee || 0,
          professional_fee: data.professional_fee || 0,
          currency: data.currency || 'EUR',
          classes_included: data.classes_included || 1,
          extra_class_fee: data.extra_class_fee || 0,
          notes: data.notes,
          is_active: data.is_active ?? true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return price as ServicePrice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-prices', variables.service_id] });
      queryClient.invalidateQueries({ queryKey: ['service-with-prices', variables.service_id] });
    },
  });
}

export function useUpdateServicePrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, serviceId, data }: { 
      id: string; 
      serviceId: string;
      data: Partial<ServicePrice>;
    }) => {
      const { data: price, error } = await supabase
        .from('service_prices')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return price as ServicePrice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-prices', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service-with-prices', variables.serviceId] });
    },
  });
}

export function useDeleteServicePrice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, serviceId }: { id: string; serviceId: string }) => {
      const { error } = await supabase
        .from('service_prices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-prices', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service-with-prices', variables.serviceId] });
    },
  });
}

// Helper to get price for a specific jurisdiction
export function getPriceForJurisdiction(
  service: ServiceWithPrices | ServiceCatalogItem,
  jurisdiction: string
): { 
  official_fee: number; 
  professional_fee: number; 
  total: number; 
  currency: string;
  source: 'jurisdiction' | 'default';
} {
  const prices = 'prices' in service ? service.prices : undefined;
  const jurisdictionPrice = prices?.find(p => p.jurisdiction === jurisdiction && p.is_active);
  
  if (jurisdictionPrice) {
    return {
      official_fee: jurisdictionPrice.official_fee,
      professional_fee: jurisdictionPrice.professional_fee,
      total: jurisdictionPrice.total_price,
      currency: jurisdictionPrice.currency,
      source: 'jurisdiction',
    };
  }
  
  return {
    official_fee: service.official_fee,
    professional_fee: service.professional_fee,
    total: service.base_price,
    currency: service.currency,
    source: 'default',
  };
}
