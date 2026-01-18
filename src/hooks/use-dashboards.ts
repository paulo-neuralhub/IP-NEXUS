import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { Dashboard, WidgetDefinition, DashboardWidget } from '@/types/reports';
import type { Json } from '@/integrations/supabase/types';

// Helper to convert DB response to Dashboard type
function mapDbToDashboard(data: unknown): Dashboard {
  const db = data as Record<string, unknown>;
  return {
    id: db.id as string,
    organization_id: db.organization_id as string,
    name: db.name as string,
    description: db.description as string | undefined,
    dashboard_type: db.dashboard_type as Dashboard['dashboard_type'],
    layout: (db.layout || []) as DashboardWidget[],
    config: (db.config || {}) as Dashboard['config'],
    is_public: db.is_public as boolean,
    shared_with: (db.shared_with || []) as string[],
    is_default: db.is_default as boolean,
    created_at: db.created_at as string,
    updated_at: db.updated_at as string,
    created_by: db.created_by as string | undefined,
  };
}

export function useDashboards() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['dashboards', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('is_default', { ascending: false })
        .order('name');
      if (error) throw error;
      return (data || []).map(mapDbToDashboard);
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return mapDbToDashboard(data);
    },
    enabled: !!id,
  });
}

export function useDefaultDashboard() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['default-dashboard', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .eq('is_default', true)
        .maybeSingle();
      
      if (error) throw error;
      return data ? mapDbToDashboard(data) : null;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<Dashboard>) => {
      const { data: dashboard, error } = await supabase
        .from('dashboards')
        .insert({
          organization_id: currentOrganization!.id,
          name: data.name || 'Nuevo Dashboard',
          description: data.description,
          dashboard_type: data.dashboard_type,
          layout: (data.layout || []) as unknown as Json,
          config: (data.config || {}) as unknown as Json,
          is_public: data.is_public || false,
          is_default: data.is_default || false,
          shared_with: (data.shared_with || []) as unknown as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbToDashboard(dashboard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Dashboard> }) => {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.description !== undefined) updatePayload.description = data.description;
      if (data.dashboard_type !== undefined) updatePayload.dashboard_type = data.dashboard_type;
      if (data.layout !== undefined) updatePayload.layout = data.layout as unknown as Json;
      if (data.config !== undefined) updatePayload.config = data.config as unknown as Json;
      if (data.is_public !== undefined) updatePayload.is_public = data.is_public;
      if (data.is_default !== undefined) updatePayload.is_default = data.is_default;
      if (data.shared_with !== undefined) updatePayload.shared_with = data.shared_with as unknown as Json;
      
      const { data: dashboard, error } = await supabase
        .from('dashboards')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapDbToDashboard(dashboard);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
    },
  });
}

export function useUpdateDashboardLayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, layout }: { id: string; layout: DashboardWidget[] }) => {
      const { error } = await supabase
        .from('dashboards')
        .update({ 
          layout: layout as unknown as Json, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useWidgetDefinitions() {
  return useQuery({
    queryKey: ['widget-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description,
        widget_type: d.widget_type,
        default_config: d.default_config,
        data_source: d.data_source,
        available_options: d.available_options,
        is_active: d.is_active,
      })) as WidgetDefinition[];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

export function useSetDefaultDashboard() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (dashboardId: string) => {
      // Quitar default de otros
      await supabase
        .from('dashboards')
        .update({ is_default: false })
        .eq('organization_id', currentOrganization!.id);
      
      // Poner default al seleccionado
      const { error } = await supabase
        .from('dashboards')
        .update({ is_default: true })
        .eq('id', dashboardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['default-dashboard'] });
    },
  });
}

export function useDuplicateDashboard() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Obtener dashboard original
      const { data: original, error: fetchError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Crear copia
      const { data: dashboard, error } = await supabase
        .from('dashboards')
        .insert({
          organization_id: currentOrganization!.id,
          name: `${original.name} (copia)`,
          description: original.description,
          dashboard_type: original.dashboard_type,
          layout: original.layout,
          config: original.config,
          is_public: false,
          is_default: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToDashboard(dashboard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}
