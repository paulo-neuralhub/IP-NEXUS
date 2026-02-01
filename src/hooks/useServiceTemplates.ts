// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - SERVICE TEMPLATES HOOK (PROMPT 4)
// ════════════════════════════════════════════════════════════════════════════

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  ServiceCatalogItem, 
  ServiceCategory, 
  ServiceCatalogFilters 
} from '@/types/service-catalog';

// ═══════════════════════════════════════════════════════════════
// SERVICE CATEGORIES
// ═══════════════════════════════════════════════════════════════

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      return data as ServiceCategory[];
    },
    staleTime: 1000 * 60 * 60, // 1 hora - categorías no cambian frecuentemente
  });
}

// ═══════════════════════════════════════════════════════════════
// SERVICE TEMPLATES (PRECONFIGURADOS)
// ═══════════════════════════════════════════════════════════════

export function useServiceTemplates(filters?: ServiceCatalogFilters) {
  return useQuery({
    queryKey: ['service-templates', filters],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_preconfigured', true)
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (filters?.category_id && filters.category_id !== 'all') {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
        query = query.eq('jurisdiction', filters.jurisdiction);
      }
      if (filters?.service_type && filters.service_type !== 'all') {
        query = query.eq('service_type', filters.service_type);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,preconfigured_code.ilike.%${filters.search}%`);
      }
      if (filters?.generates_matter !== undefined) {
        query = query.eq('generates_matter', filters.generates_matter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceCatalogItem[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION SERVICES (personalizados por org)
// ═══════════════════════════════════════════════════════════════

export function useOrganizationServices(filters?: ServiceCatalogFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['organization-services', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (filters?.category_id && filters.category_id !== 'all') {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
        query = query.eq('jurisdiction', filters.jurisdiction);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceCatalogItem[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ═══════════════════════════════════════════════════════════════
// ALL SERVICES (templates + org)
// ═══════════════════════════════════════════════════════════════

export function useAllServices(filters?: ServiceCatalogFilters) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['all-services', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog')
        .select(`
          *,
          category:service_categories(*)
        `)
        .eq('is_active', true)
        .or(`organization_id.is.null,organization_id.eq.${currentOrganization!.id}`)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (filters?.category_id && filters.category_id !== 'all') {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
        query = query.eq('jurisdiction', filters.jurisdiction);
      }
      if (filters?.service_type && filters.service_type !== 'all') {
        query = query.eq('service_type', filters.service_type);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceCatalogItem[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ═══════════════════════════════════════════════════════════════
// CLONE TEMPLATE TO ORGANIZATION
// ═══════════════════════════════════════════════════════════════

export function useCloneServiceTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (templateId: string) => {
      // Obtener template
      const { data: template, error: fetchError } = await supabase
        .from('service_catalog')
        .select('*')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Crear copia para la organización
      const { id, created_at, updated_at, is_preconfigured, preconfigured_code, ...rest } = template;
      
      const { data, error } = await supabase
        .from('service_catalog')
        .insert({
          ...rest,
          organization_id: currentOrganization!.id,
          is_preconfigured: false,
          preconfigured_code: null,
          reference_code: `${rest.reference_code || 'SVC'}-${Date.now().toString(36).toUpperCase()}`,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      toast.success('Servicio clonado a tu organización');
    },
    onError: (error) => {
      toast.error(`Error al clonar servicio: ${error.message}`);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// CREATE CUSTOM SERVICE
// ═══════════════════════════════════════════════════════════════

export function useCreateService() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Partial<ServiceCatalogItem>) => {
      const { data: service, error } = await supabase
        .from('service_catalog')
        .insert({
          ...data,
          organization_id: currentOrganization!.id,
          is_preconfigured: false,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      toast.success('Servicio creado');
    },
    onError: (error) => {
      toast.error(`Error al crear servicio: ${error.message}`);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// UPDATE SERVICE
// ═══════════════════════════════════════════════════════════════

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceCatalogItem> }) => {
      const { data: service, error } = await supabase
        .from('service_catalog')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      toast.success('Servicio actualizado');
    },
    onError: (error) => {
      toast.error(`Error al actualizar servicio: ${error.message}`);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// DELETE SERVICE
// ═══════════════════════════════════════════════════════════════

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_catalog')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      toast.success('Servicio eliminado');
    },
    onError: (error) => {
      toast.error(`Error al eliminar servicio: ${error.message}`);
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// SERVICE STATS
// ═══════════════════════════════════════════════════════════════

export function useServiceStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['service-stats', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_catalog')
        .select('service_type, jurisdiction, category_id')
        .eq('is_active', true)
        .or(`organization_id.is.null,organization_id.eq.${currentOrganization!.id}`);

      if (error) throw error;

      const byType: Record<string, number> = {};
      const byJurisdiction: Record<string, number> = {};
      const byCategory: Record<string, number> = {};

      data?.forEach(s => {
        byType[s.service_type || 'other'] = (byType[s.service_type || 'other'] || 0) + 1;
        byJurisdiction[s.jurisdiction || 'global'] = (byJurisdiction[s.jurisdiction || 'global'] || 0) + 1;
        byCategory[s.category_id || 'uncategorized'] = (byCategory[s.category_id || 'uncategorized'] || 0) + 1;
      });

      return {
        total: data?.length || 0,
        byType,
        byJurisdiction,
        byCategory,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}