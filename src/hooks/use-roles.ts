/**
 * useRoles - Hook for managing roles in the organization
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { Json } from '@/integrations/supabase/types';

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string | null;
  hierarchy_level: number;
  is_system: boolean;
  is_editable: boolean;
  organization_id: string | null;
  created_at: string;
}

export interface PermissionDefinition {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
  is_system: boolean;
}

/**
 * Fetch all available roles (system + organization custom)
 */
export function useRoles() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['roles', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .or(`is_system.eq.true,organization_id.eq.${currentOrganization.id}`)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data as Role[];
    },
    enabled: !!currentOrganization?.id,
  });
}

/**
 * Fetch all permission definitions grouped by module
 */
export function usePermissionDefinitions() {
  return useQuery({
    queryKey: ['permission-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });
      
      if (error) throw error;
      return data as PermissionDefinition[];
    },
  });
}

/**
 * Fetch permissions for a specific role
 */
export function useRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          id,
          scope,
          permission:permission_definitions(*)
        `)
        .eq('role_id', roleId);
      
      if (error) throw error;
      return (data || []).map((rp: any) => ({
        id: rp.id,
        scope: rp.scope,
        ...rp.permission,
      }));
    },
    enabled: !!roleId,
  });
}

/**
 * Create a new custom role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (params: {
      name: string;
      code: string;
      description?: string;
      color?: string;
      level?: number;
      permissions?: string[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      // Create the role
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({
          name: params.name,
          code: params.code,
          description: params.description || null,
          color: params.color || '#3B82F6',
          level: params.level || 50,
          is_system: false,
          is_editable: true,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();
      
      if (roleError) throw roleError;
      
      // Add permissions if provided
      if (params.permissions && params.permissions.length > 0) {
        const permissionInserts = params.permissions.map(permCode => ({
          role_id: role.id,
          permission_id: permCode, // We need to look up the ID
          scope: 'all' as const,
        }));
        
        // Get permission IDs
        const { data: permDefs } = await supabase
          .from('permission_definitions')
          .select('id, code')
          .in('code', params.permissions);
        
        if (permDefs && permDefs.length > 0) {
          const rolePerms = permDefs.map(pd => ({
            role_id: role.id,
            permission_id: pd.id,
            scope: 'all' as const,
          }));
          
          await supabase.from('role_permissions').insert(rolePerms);
        }
      }
      
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * Update an existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      roleId: string;
      name?: string;
      description?: string;
      color?: string;
      level?: number;
    }) => {
      const { data, error } = await supabase
        .from('roles')
        .update({
          name: params.name,
          description: params.description,
          color: params.color,
          level: params.level,
        })
        .eq('id', params.roleId)
        .eq('is_editable', true)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * Delete a custom role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleId: string) => {
      // First check if role is deletable
      const { data: role } = await supabase
        .from('roles')
        .select('is_system, is_editable')
        .eq('id', roleId)
        .single();
      
      if (role?.is_system) {
        throw new Error('No se pueden eliminar roles del sistema');
      }
      
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
        .eq('is_system', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

/**
 * Update role permissions
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      roleId: string;
      permissions: { permissionId: string; scope: 'all' | 'team' | 'own' }[];
    }) => {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', params.roleId);
      
      // Insert new permissions
      if (params.permissions.length > 0) {
        const { error } = await supabase
          .from('role_permissions')
          .insert(params.permissions.map(p => ({
            role_id: params.roleId,
            permission_id: p.permissionId,
            scope: p.scope,
          })));
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
    },
  });
}

/**
 * Group permissions by module
 */
export function groupPermissionsByModule(permissions: PermissionDefinition[]): Record<string, PermissionDefinition[]> {
  return permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);
}
