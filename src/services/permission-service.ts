/**
 * PermissionService - RBAC Authorization Service
 * 
 * Provides centralized permission checking with:
 * - Caching layer for performance
 * - Fallback to legacy role system
 * - Audit logging support
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Types
export type PermissionScope = 'all' | 'team' | 'own' | 'assigned';

export interface Permission {
  code: string;
  name: string;
  module: string;
  scope: PermissionScope;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  isSystem: boolean;
  isEditable: boolean;
  hierarchyLevel: number;
}

export interface UserRole {
  roleId: string | null;
  roleCode: string | null;
  roleName: string | null;
  legacyRole: string | null;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const permissionCache = new Map<string, { permissions: Permission[]; timestamp: number }>();
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();

// System role codes
export const SYSTEM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
  EXTERNAL: 'external',
} as const;

// System role UUIDs (fixed)
export const SYSTEM_ROLE_IDS = {
  OWNER: '00000000-0000-0000-0000-000000000001',
  ADMIN: '00000000-0000-0000-0000-000000000002',
  MANAGER: '00000000-0000-0000-0000-000000000003',
  MEMBER: '00000000-0000-0000-0000-000000000004',
  VIEWER: '00000000-0000-0000-0000-000000000005',
  EXTERNAL: '00000000-0000-0000-0000-000000000006',
} as const;

// Helper to generate cache key
function getCacheKey(userId: string, organizationId: string): string {
  return `${userId}:${organizationId}`;
}

// Clear cache for a user
export function clearPermissionCache(userId: string, organizationId: string): void {
  const key = getCacheKey(userId, organizationId);
  permissionCache.delete(key);
  roleCache.delete(key);
}

// Clear all cache
export function clearAllPermissionCache(): void {
  permissionCache.clear();
  roleCache.clear();
}

/**
 * Get user's role in an organization
 */
export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<UserRole | null> {
  const key = getCacheKey(userId, organizationId);
  
  // Check cache
  const cached = roleCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_role', {
        _user_id: userId,
        _organization_id: organizationId,
      });
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    const roleData = data?.[0];
    const role: UserRole = {
      roleId: roleData?.role_id || null,
      roleCode: roleData?.role_code || null,
      roleName: roleData?.role_name || null,
      legacyRole: roleData?.legacy_role || null,
    };
    
    // Cache the result
    roleCache.set(key, { role, timestamp: Date.now() });
    
    return role;
  } catch (err) {
    console.error('Error in getUserRole:', err);
    return null;
  }
}

/**
 * Get all permissions for a user in an organization
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<Permission[]> {
  const key = getCacheKey(userId, organizationId);
  
  // Check cache
  const cached = permissionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_permissions', {
        _user_id: userId,
        _organization_id: organizationId,
      });
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
    
    const permissions: Permission[] = (data || []).map((p: any) => ({
      code: p.permission_code,
      name: p.permission_name,
      module: p.module,
      scope: p.scope as PermissionScope,
    }));
    
    // Cache the result
    permissionCache.set(key, { permissions, timestamp: Date.now() });
    
    return permissions;
  } catch (err) {
    console.error('Error in getUserPermissions:', err);
    return [];
  }
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  permissionCode: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_user_permission', {
        _user_id: userId,
        _organization_id: organizationId,
        _permission_code: permissionCode,
      });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error('Error in checkPermission:', err);
    return false;
  }
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  organizationId: string,
  permissionCodes: string[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId);
  return permissionCodes.some(code => 
    permissions.some(p => p.code === code)
  );
}

/**
 * Check if user has ALL of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  organizationId: string,
  permissionCodes: string[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId);
  const userPermCodes = permissions.map(p => p.code);
  return permissionCodes.every(code => userPermCodes.includes(code));
}

/**
 * Get all available roles (system + organization custom)
 */
export async function getAvailableRoles(
  organizationId?: string
): Promise<Role[]> {
  try {
    let query = supabase
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false });
    
    if (organizationId) {
      query = query.or(`organization_id.is.null,organization_id.eq.${organizationId}`);
    } else {
      query = query.is('organization_id', null);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
    
    return (data || []).map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      color: r.color,
      isSystem: r.is_system,
      isEditable: r.is_editable,
      hierarchyLevel: r.hierarchy_level,
    }));
  } catch (err) {
    console.error('Error in getAvailableRoles:', err);
    return [];
  }
}

/**
 * Get all permission definitions
 */
export async function getAllPermissionDefinitions(): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from('permission_definitions')
      .select('*')
      .order('module', { ascending: true });
    
    if (error) {
      console.error('Error fetching permission definitions:', error);
      return [];
    }
    
    return (data || []).map(p => ({
      code: p.code,
      name: p.name,
      module: p.module,
      scope: 'all' as PermissionScope,
    }));
  } catch (err) {
    console.error('Error in getAllPermissionDefinitions:', err);
    return [];
  }
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        scope,
        permission:permission_definitions(code, name, module)
      `)
      .eq('role_id', roleId);
    
    if (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
    
    return (data || []).map((rp: any) => ({
      code: rp.permission?.code,
      name: rp.permission?.name,
      module: rp.permission?.module,
      scope: rp.scope as PermissionScope,
    })).filter(p => p.code);
  } catch (err) {
    console.error('Error in getRolePermissions:', err);
    return [];
  }
}

/**
 * Log an access audit entry
 */
export async function logAccessAudit(params: {
  organizationId: string;
  userId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  permissionCode?: string;
  granted: boolean;
  denialReason?: string;
  metadata?: Json | null;
}): Promise<void> {
  try {
    await supabase.from('access_audit_log').insert([{
      organization_id: params.organizationId,
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      permission_code: params.permissionCode,
      granted: params.granted,
      denial_reason: params.denialReason,
      metadata: params.metadata ?? null,
    }]);
  } catch (err) {
    console.error('Error logging access audit:', err);
  }
}

// Export service object for convenience
export const PermissionService = {
  getUserRole,
  getUserPermissions,
  checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAvailableRoles,
  getAllPermissionDefinitions,
  getRolePermissions,
  logAccessAudit,
  clearCache: clearPermissionCache,
  clearAllCache: clearAllPermissionCache,
  SYSTEM_ROLES,
  SYSTEM_ROLE_IDS,
};

export default PermissionService;
