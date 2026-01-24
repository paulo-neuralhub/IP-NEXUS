// ============================================
// src/hooks/legal-ops/useActivityLog.ts
// Activity log management for matters and clients
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export interface ActivityLog {
  id: string;
  organization_id: string;
  entity_type: string;
  entity_id: string;
  matter_id: string | null;
  client_id: string | null;
  invoice_id: string | null;
  quote_id: string | null;
  deal_id: string | null;
  action: string;
  action_category: string | null;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  amount: number | null;
  currency: string;
  old_value: string | null;
  new_value: string | null;
  changed_fields: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  batch_id: string | null;
  is_internal: boolean;
  is_system: boolean;
  // Joined data
  creator?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  action_info?: {
    code: string;
    name_es: string;
    name_en: string;
    category: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export interface ActivityActionType {
  code: string;
  name_es: string;
  name_en: string;
  category: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface GroupedActivities {
  date: string;
  label: string;
  activities: ActivityLog[];
}

// Fetch action types catalog
export function useActivityActionTypes() {
  return useQuery({
    queryKey: ['activity-action-types'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('activity_action_types') as any)
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ActivityActionType[];
    },
  });
}

// Fetch activities for a matter
export function useMatterActivity(matterId: string, options?: { category?: string; limit?: number }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['activity-log', 'matter', matterId, options],
    queryFn: async () => {
      if (!currentOrganization?.id || !matterId) return [];

      let query = (supabase.from('activity_log') as any)
        .select(`
          *,
          creator:users!activity_log_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('matter_id', matterId)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('action_category', options.category);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with action types
      const { data: actionTypes } = await (supabase.from('activity_action_types') as any)
        .select('*');
      
      const actionMap = new Map((actionTypes || []).map((a: ActivityActionType) => [a.code, a]));

      return (data || []).map((activity: ActivityLog) => ({
        ...activity,
        action_info: actionMap.get(activity.action),
      })) as ActivityLog[];
    },
    enabled: !!matterId && !!currentOrganization?.id,
  });
}

// Fetch activities for a client
export function useClientActivity(clientId: string, options?: { category?: string; limit?: number }) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['activity-log', 'client', clientId, options],
    queryFn: async () => {
      if (!currentOrganization?.id || !clientId) return [];

      let query = (supabase.from('activity_log') as any)
        .select(`
          *,
          creator:users!activity_log_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('client_id', clientId)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('action_category', options.category);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with action types
      const { data: actionTypes } = await (supabase.from('activity_action_types') as any)
        .select('*');
      
      const actionMap = new Map((actionTypes || []).map((a: ActivityActionType) => [a.code, a]));

      return (data || []).map((activity: ActivityLog) => ({
        ...activity,
        action_info: actionMap.get(activity.action),
      })) as ActivityLog[];
    },
    enabled: !!clientId && !!currentOrganization?.id,
  });
}

// Fetch recent activity across all entities
export function useRecentActivity(limit: number = 20) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['activity-log', 'recent', limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await (supabase.from('activity_log') as any)
        .select(`
          *,
          creator:users!activity_log_created_by_fkey(id, full_name, avatar_url)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Enrich with action types
      const { data: actionTypes } = await (supabase.from('activity_action_types') as any)
        .select('*');
      
      const actionMap = new Map((actionTypes || []).map((a: ActivityActionType) => [a.code, a]));

      return (data || []).map((activity: ActivityLog) => ({
        ...activity,
        action_info: actionMap.get(activity.action),
      })) as ActivityLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Group activities by date
export function groupActivitiesByDate(activities: ActivityLog[]): GroupedActivities[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const groups: Map<string, ActivityLog[]> = new Map();

  for (const activity of activities) {
    const date = activity.created_at.split('T')[0];
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(activity);
  }

  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, acts]) => {
      let label: string;
      if (date === today) {
        label = 'Hoy';
      } else if (date === yesterday) {
        label = 'Ayer';
      } else {
        label = new Date(date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      return { date, label, activities: acts };
    });
}

// Log a new activity
export interface LogActivityInput {
  entityType: string;
  entityId: string;
  matterId?: string;
  clientId?: string;
  invoiceId?: string;
  quoteId?: string;
  dealId?: string;
  action: string;
  actionCategory?: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  amount?: number;
  currency?: string;
  oldValue?: string;
  newValue?: string;
  changedFields?: Record<string, unknown>;
  isInternal?: boolean;
  batchId?: string;
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: LogActivityInput) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await (supabase.from('activity_log') as any)
        .insert({
          organization_id: currentOrganization.id,
          entity_type: input.entityType,
          entity_id: input.entityId,
          matter_id: input.matterId || null,
          client_id: input.clientId || null,
          invoice_id: input.invoiceId || null,
          quote_id: input.quoteId || null,
          deal_id: input.dealId || null,
          action: input.action,
          action_category: input.actionCategory || 'other',
          title: input.title,
          description: input.description || null,
          metadata: input.metadata || null,
          reference_type: input.referenceType || null,
          reference_id: input.referenceId || null,
          reference_number: input.referenceNumber || null,
          amount: input.amount || null,
          currency: input.currency || 'EUR',
          old_value: input.oldValue || null,
          new_value: input.newValue || null,
          changed_fields: input.changedFields || null,
          is_internal: input.isInternal || false,
          batch_id: input.batchId || null,
          created_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      if (variables.matterId) {
        queryClient.invalidateQueries({ queryKey: ['activity-log', 'matter', variables.matterId] });
      }
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: ['activity-log', 'client', variables.clientId] });
      }
      queryClient.invalidateQueries({ queryKey: ['activity-log', 'recent'] });
    },
  });
}

// Batch log multiple activities
export function useBatchLogActivity() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inputs: LogActivityInput[]) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const batchId = crypto.randomUUID();

      const records = inputs.map(input => ({
        organization_id: currentOrganization.id,
        entity_type: input.entityType,
        entity_id: input.entityId,
        matter_id: input.matterId || null,
        client_id: input.clientId || null,
        invoice_id: input.invoiceId || null,
        quote_id: input.quoteId || null,
        deal_id: input.dealId || null,
        action: input.action,
        action_category: input.actionCategory || 'other',
        title: input.title,
        description: input.description || null,
        metadata: input.metadata || null,
        reference_type: input.referenceType || null,
        reference_id: input.referenceId || null,
        reference_number: input.referenceNumber || null,
        amount: input.amount || null,
        currency: input.currency || 'EUR',
        old_value: input.oldValue || null,
        new_value: input.newValue || null,
        changed_fields: input.changedFields || null,
        is_internal: input.isInternal || false,
        batch_id: batchId,
        created_by: user?.id,
      }));

      const { error } = await (supabase.from('activity_log') as any)
        .insert(records);

      if (error) throw error;
      return batchId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
    },
  });
}
