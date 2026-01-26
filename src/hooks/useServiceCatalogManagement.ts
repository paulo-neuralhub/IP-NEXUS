/**
 * Hook for managing preconfigured service catalog
 * Handles activating, deactivating, and customizing services
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { ServiceType, Jurisdiction } from '@/types/service-catalog';

// =============================================
// TYPES
// =============================================

export interface PreconfiguredService {
  id: string;
  preconfigured_code: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  base_price: number;
  tax_rate: number;
  includes_official_fees: boolean;
  official_fees_note: string | null;
  estimated_duration: string | null;
  generates_matter: boolean;
  default_matter_type: string | null;
  default_matter_subtype: string | null;
  applicable_offices: string[] | null;
  display_order: number;
  is_active: boolean;
  is_preconfigured: boolean;
}

export interface ActiveService extends PreconfiguredService {
  id: string;
  organization_id: string;
  professional_fee: number;
  official_fee: number;
  reference_code: string | null;
}

export interface ActivateServiceConfig {
  preconfigured_code: string;
  reference_code?: string;  // Auto-generated or custom reference
  professional_fee: number;
  includes_official_fees: boolean;
  official_fees_note?: string;
  tax_rate: number;
  description?: string;
  estimated_duration?: string;
  generates_matter: boolean;
  default_matter_type?: string;
  default_matter_subtype?: string;
}

export interface ServiceStats {
  active: number;
  available: number;
  categories: number;
  pendingPrice: number;
}

export interface ServicesByCategory {
  category: string;
  label: string;
  icon: string;
  services: PreconfiguredService[];
  activeCount: number;
}

// =============================================
// CATEGORY CONFIG
// =============================================

export const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  trademarks: { label: 'Marcas', icon: '🏷️' },
  patents: { label: 'Patentes', icon: '📜' },
  designs: { label: 'Diseños', icon: '🎨' },
  domains: { label: 'Dominios', icon: '🌐' },
  other: { label: 'Otros', icon: '📋' },
};

export const SUBCATEGORY_LABELS: Record<string, string> = {
  searches: 'Búsquedas',
  registration: 'Registro',
  renewals: 'Renovaciones',
  oppositions: 'Oposiciones',
  watching: 'Vigilancia',
  modifications: 'Modificaciones',
  contracts: 'Contratos',
  maintenance: 'Mantenimiento',
  litigation: 'Litigios',
  disputes: 'Disputas',
  enforcement: 'Defensa',
  advisory: 'Asesoría',
  training: 'Formación',
};

// =============================================
// HELPERS
// =============================================

/**
 * Generate a sequential reference code for a service
 * Format: PREFIX-NNN (e.g., RM-001 for Registro Marca)
 */
async function generateReferenceCode(
  organizationId: string,
  preconfiguredCode: string,
  category: string
): Promise<string> {
  // Map preconfigured codes to short prefixes
  const prefixMap: Record<string, string> = {
    // Trademarks
    'TM_SEARCH_ES': 'BM',
    'TM_REG_ES': 'RM',
    'TM_REG_EU': 'RME',
    'TM_REG_INT': 'RMI',
    'TM_RENEW_ES': 'REN',
    'TM_RENEW_EU': 'RENE',
    'TM_OPP_DEF': 'OPO',
    'TM_OPP_FILE': 'OPF',
    // Patents
    'PAT_REG_ES': 'RP',
    'PAT_REG_EU': 'RPE',
    'PAT_RENEW': 'RENP',
    // Designs
    'DES_REG_ES': 'RD',
    'DES_REG_EU': 'RDE',
    // General fallback by category
  };
  
  const categoryPrefixes: Record<string, string> = {
    trademarks: 'TM',
    patents: 'PAT',
    designs: 'DIS',
    domains: 'DOM',
    other: 'SRV',
  };
  
  const prefix = prefixMap[preconfiguredCode] || categoryPrefixes[category] || 'SRV';
  
  // Count existing services with same prefix
  const { count } = await supabase
    .from('service_catalog')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .ilike('reference_code', `${prefix}-%`);
  
  const sequence = String((count || 0) + 1).padStart(3, '0');
  return `${prefix}-${sequence}`;
}

// =============================================
// HOOKS
// =============================================

/**
 * Get all preconfigured services (system-level, organization_id = NULL)
 * Note: is_active is false for templates (they become active when copied to org)
 */
export function usePreconfiguredServices() {
  return useQuery({
    queryKey: ['preconfigured-services'],
    queryFn: async () => {
      console.log('[ServiceCatalog] Fetching preconfigured services...');
      const { data, error } = await supabase
        .from('service_catalog')
        .select('*')
        .is('organization_id', null)
        .eq('is_preconfigured', true)
        .order('category')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('[ServiceCatalog] Error fetching preconfigured:', error);
        throw error;
      }
      console.log('[ServiceCatalog] Preconfigured services loaded:', data?.length || 0);
      console.log('[ServiceCatalog] Sample services:', data?.slice(0, 3));
      return (data || []) as unknown as PreconfiguredService[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Get organization's active services (activated from preconfigured)
 */
export function useOrganizationServices(includeInactive = false) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['organization-services', currentOrganization?.id, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('service_catalog')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('display_order', { ascending: true })
        .order('name');
      
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ActiveService[];
    },
    enabled: !!currentOrganization?.id,
  });
}

/**
 * Get all active services for the current organization
 */
export function useActiveServices() {
  return useOrganizationServices(false);
}

/**
 * Get available services (preconfigured minus already activated)
 */
export function useAvailableServices() {
  const { currentOrganization } = useOrganization();
  const { data: preconfigured = [] } = usePreconfiguredServices();
  const { data: orgServices = [] } = useOrganizationServices(true);
  
  // Map of activated preconfigured codes
  const activatedCodes = new Set(
    orgServices
      .filter(s => s.preconfigured_code)
      .map(s => s.preconfigured_code)
  );
  
  // Filter available services
  const available = preconfigured.map(service => ({
    ...service,
    isActivated: activatedCodes.has(service.preconfigured_code),
  }));
  
  return {
    data: available,
    activatedCodes,
    isLoading: false,
  };
}

/**
 * Get service catalog stats
 */
export function useServiceStats(): ServiceStats {
  const { data: preconfigured = [] } = usePreconfiguredServices();
  const { data: orgServices = [] } = useOrganizationServices(true);
  
  const active = orgServices.filter(s => s.is_active).length;
  const available = preconfigured.length;
  const categories = new Set(preconfigured.map(s => s.category)).size;
  const pendingPrice = orgServices.filter(s => s.base_price === 0 && s.is_active).length;
  
  return { active, available, categories, pendingPrice };
}

/**
 * Get services grouped by category
 */
export function useServicesByCategory(onlyActivated = false) {
  const { data: preconfigured = [] } = usePreconfiguredServices();
  const { data: orgServices = [] } = useOrganizationServices(true);
  
  const activatedCodes = new Set(
    orgServices.filter(s => s.preconfigured_code).map(s => s.preconfigured_code)
  );
  
  const categories = Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
    const services = preconfigured.filter(s => s.category === key);
    const activeCount = services.filter(s => activatedCodes.has(s.preconfigured_code)).length;
    
    return {
      category: key,
      label: config.label,
      icon: config.icon,
      services: onlyActivated 
        ? services.filter(s => activatedCodes.has(s.preconfigured_code))
        : services,
      activeCount,
    };
  }).filter(c => c.services.length > 0);
  
  return categories;
}

/**
 * Get services grouped by subcategory within a category
 */
export function useServicesBySubcategory(category: string) {
  const { data: preconfigured = [] } = usePreconfiguredServices();
  const { data: orgServices = [] } = useOrganizationServices(true);
  
  const activatedCodes = new Set(
    orgServices.filter(s => s.preconfigured_code).map(s => s.preconfigured_code)
  );
  
  const categoryServices = preconfigured.filter(s => s.category === category);
  const subcategories = [...new Set(categoryServices.map(s => s.subcategory))];
  
  return subcategories.map(sub => ({
    subcategory: sub || 'general',
    label: SUBCATEGORY_LABELS[sub || 'general'] || sub || 'General',
    services: categoryServices
      .filter(s => s.subcategory === sub)
      .map(s => ({
        ...s,
        isActivated: activatedCodes.has(s.preconfigured_code),
      })),
  }));
}

// =============================================
// MUTATIONS
// =============================================

/**
 * Activate a preconfigured service for the organization
 */
export function useActivateService() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (config: ActivateServiceConfig) => {
      // Get the preconfigured service
      const { data: preconfig, error: fetchError } = await supabase
        .from('service_catalog')
        .select('*')
        .is('organization_id', null)
        .eq('preconfigured_code', config.preconfigured_code)
        .single();
      
      if (fetchError || !preconfig) {
        throw new Error('Servicio preconfigurado no encontrado');
      }
      
      // Generate reference code if not provided
      let referenceCode = config.reference_code;
      if (!referenceCode) {
        referenceCode = await generateReferenceCode(
          currentOrganization!.id,
          config.preconfigured_code,
          preconfig.category
        );
      }
      
      // Create organization's copy
      const insertData = {
        organization_id: currentOrganization!.id,
        preconfigured_code: config.preconfigured_code,
        reference_code: referenceCode,
        name: preconfig.name,
        description: config.description || preconfig.description,
        category: preconfig.category,
        subcategory: preconfig.subcategory,
        service_type: preconfig.service_type || 'general',
        professional_fee: config.professional_fee,
        official_fee: 0, // Official fees are noted, not stored as value
        base_price: config.professional_fee,
        tax_rate: config.tax_rate,
        includes_official_fees: config.includes_official_fees,
        official_fees_note: config.official_fees_note || preconfig.official_fees_note,
        estimated_duration: config.estimated_duration || preconfig.estimated_duration,
        generates_matter: config.generates_matter,
        default_matter_type: config.default_matter_type || preconfig.default_matter_type,
        default_matter_subtype: config.default_matter_subtype || preconfig.default_matter_subtype,
        applicable_offices: preconfig.applicable_offices,
        display_order: preconfig.display_order,
        is_active: true,
        is_preconfigured: true,
        currency: 'EUR',
        nice_classes_included: 1,
        extra_class_fee: 0,
      };
      
      const { data: service, error } = await supabase
        .from('service_catalog')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return service as unknown as ActiveService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

/**
 * Activate multiple services at once
 */
export function useBulkActivateServices() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (preconfiguredCodes: string[]) => {
      // Get all preconfigured services
      const { data: preconfigs, error: fetchError } = await supabase
        .from('service_catalog')
        .select('*')
        .is('organization_id', null)
        .in('preconfigured_code', preconfiguredCodes);
      
      if (fetchError) throw fetchError;
      if (!preconfigs?.length) return [];
      
      // Create organization copies
      const insertData = preconfigs.map(preconfig => ({
        organization_id: currentOrganization!.id,
        preconfigured_code: preconfig.preconfigured_code,
        name: preconfig.name,
        description: preconfig.description,
        category: preconfig.category,
        subcategory: preconfig.subcategory,
        service_type: preconfig.service_type || 'general',
        professional_fee: preconfig.base_price,
        official_fee: 0,
        base_price: preconfig.base_price,
        includes_official_fees: preconfig.includes_official_fees,
        official_fees_note: preconfig.official_fees_note,
        estimated_duration: preconfig.estimated_duration,
        generates_matter: preconfig.generates_matter,
        default_matter_type: preconfig.default_matter_type,
        default_matter_subtype: preconfig.default_matter_subtype,
        applicable_offices: preconfig.applicable_offices,
        display_order: preconfig.display_order,
        is_active: true,
        is_preconfigured: true,
        currency: 'EUR',
        nice_classes_included: 1,
        extra_class_fee: 0,
      }));
      
      const { data: services, error } = await supabase
        .from('service_catalog')
        .insert(insertData)
        .select();
      
      if (error) throw error;
      return services as unknown as ActiveService[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

/**
 * Update an activated service
 */
export function useUpdateOrganizationService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ActiveService> }) => {
      const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Recalculate base_price
      if (data.professional_fee !== undefined) {
        updateData.base_price = data.professional_fee;
      }
      
      const { data: service, error } = await supabase
        .from('service_catalog')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return service as unknown as ActiveService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

/**
 * Deactivate a service (set is_active = false)
 */
export function useDeactivateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_catalog')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

/**
 * Reactivate a deactivated service
 */
export function useReactivateService() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_catalog')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}

/**
 * Delete an organization service completely
 */
export function useDeleteOrganizationService() {
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
      queryClient.invalidateQueries({ queryKey: ['organization-services'] });
      queryClient.invalidateQueries({ queryKey: ['service-catalog'] });
    },
  });
}
