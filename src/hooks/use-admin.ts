import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import type { 
  AdminStats, 
  AdminFilters,
  SystemSetting,
  FeatureFlag,
  SystemAnnouncement,
  UserFeedback,
  AuditLog
} from '@/types/backoffice';

// ===== VERIFICAR SUPERADMIN =====
export function useIsSuperadmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-superadmin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('superadmins')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });
}

// ===== ESTADÍSTICAS GLOBALES =====
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Organizaciones
      const { count: totalOrgs } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });
      
      // Usuarios
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // Expedientes
      const { count: totalMatters } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true });
      
      // Suscripciones activas
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // MRR (suma de planes mensuales activos)
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
          billing_cycle,
          plan:subscription_plans(price_monthly, price_yearly)
        `)
        .eq('status', 'active');
      
      let mrr = 0;
      subscriptions?.forEach(sub => {
        const plan = sub.plan as any;
        if (plan) {
          if (sub.billing_cycle === 'monthly') {
            mrr += plan.price_monthly || 0;
          } else {
            mrr += (plan.price_yearly || 0) / 12;
          }
        }
      });
      
      // Trial conversions: orgs that went from trial to active
      const { count: trialConverted } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .not('trial_end', 'is', null);
      
      const { count: totalTrials } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .not('trial_end', 'is', null);
      
      const trialConversionRate = (totalTrials || 0) > 0
        ? Math.round(((trialConverted || 0) / (totalTrials || 1)) * 100)
        : 0;
      
      // Churn rate: cancelled in last 30 days / total active
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: cancelledRecent } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled')
        .gte('updated_at', thirtyDaysAgo);
      
      const churnRate = (activeSubscriptions || 0) > 0
        ? Math.round(((cancelledRecent || 0) / ((activeSubscriptions || 0) + (cancelledRecent || 0))) * 10000) / 100
        : 0;
      
      return {
        total_organizations: totalOrgs || 0,
        total_users: totalUsers || 0,
        total_matters: totalMatters || 0,
        active_subscriptions: activeSubscriptions || 0,
        mrr,
        arr: mrr * 12,
        trial_conversions: trialConversionRate,
        churn_rate: churnRate,
      } as AdminStats;
    },
  });
}

// ===== LISTA DE ORGANIZACIONES =====
export function useAdminOrganizations(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin-organizations', filters],
    queryFn: async () => {
      let query = supabase
        .from('organizations')
        .select(`
          *,
          subscription:subscriptions(
            *,
            plan:subscription_plans(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// ===== LISTA DE USUARIOS =====
export function useAdminUsers(filters?: AdminFilters) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select(`
          *,
          memberships(
            role,
            organization:organizations(id, name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// ===== CONFIGURACIÓN DEL SISTEMA =====
export function useSystemSettings(category?: string) {
  return useQuery({
    queryKey: ['system-settings', category],
    queryFn: async () => {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('category')
        .order('key');
      
      if (category) query = query.eq('category', category);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SystemSetting[];
    },
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
  });
}

// ===== FEATURE FLAGS =====
export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('code');
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FeatureFlag> }) => {
      const { data: flag, error } = await supabase
        .from('feature_flags')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return flag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
}

// ===== ANUNCIOS =====
export function useSystemAnnouncements() {
  return useQuery({
    queryKey: ['system-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SystemAnnouncement[];
    },
  });
}

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('is_active', true)
        .lte('starts_at', now)
        .or(`ends_at.is.null,ends_at.gt.${now}`);
      if (error) throw error;
      return data as SystemAnnouncement[];
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<SystemAnnouncement>) => {
      const { data: announcement, error } = await supabase
        .from('system_announcements')
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SystemAnnouncement> }) => {
      const { data: announcement, error } = await supabase
        .from('system_announcements')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    },
  });
}

// ===== FEEDBACK =====
export function useAdminFeedback(status?: string) {
  return useQuery({
    queryKey: ['admin-feedback', status],
    queryFn: async () => {
      let query = supabase
        .from('user_feedback')
        .select(`
          *,
          user:users!user_feedback_user_id_fkey(id, email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as unknown as UserFeedback[];
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFeedback> }) => {
      const { data: feedback, error } = await supabase
        .from('user_feedback')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    },
  });
}

// ===== AUDIT LOGS =====
export function useAuditLogs(filters?: {
  resource_type?: string;
  user_id?: string;
  organization_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(id, email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.resource_type) query = query.eq('resource_type', filters.resource_type);
      if (filters?.user_id) query = query.eq('user_id', filters.user_id);
      if (filters?.organization_id) query = query.eq('organization_id', filters.organization_id);
      if (filters?.date_from) query = query.gte('created_at', filters.date_from);
      if (filters?.date_to) query = query.lte('created_at', filters.date_to);
      
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
}
