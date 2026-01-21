/**
 * Time Entry Hooks
 * P57: Time Tracking Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface TimeEntry {
  id: string;
  organization_id: string;
  matter_id: string;
  task_id?: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  description: string;
  activity_type?: string;
  is_billable: boolean;
  billing_rate_id?: string;
  billing_rate?: number;
  billing_amount?: number;
  currency: string;
  billing_status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed';
  invoice_id?: string;
  timer_started_at?: string;
  timer_running: boolean;
  created_at: string;
  updated_at: string;
  matter?: {
    id: string;
    reference: string;
    title: string;
    contact?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    full_name: string;
  };
}

export interface TimeEntryFilters {
  startDate?: Date;
  endDate?: Date;
  matterId?: string;
  userId?: string;
  billingStatus?: string;
  isBillable?: boolean;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'billed';
}

// Get time entries with filters
// Transform data from Supabase format to TimeEntry format
function transformTimeEntries(data: any[]): TimeEntry[] {
  return data.map(entry => ({
    ...entry,
    matter: entry.matter ? {
      id: entry.matter.id,
      reference: entry.matter.reference,
      title: entry.matter.title,
      contact: entry.matter.contact?.[0] || undefined, // Take first contact from array
    } : undefined,
    user: entry.user || undefined,
  }));
}

export function useTimeEntries(filters: TimeEntryFilters = {}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['time-entries', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          matter:matters(id, reference, title, contact:contacts(id, name)),
          user:users(id, full_name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('date', { ascending: false });

      if (filters.startDate) {
        query = query.gte('date', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        query = query.lte('date', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters.matterId) {
        query = query.eq('matter_id', filters.matterId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.billingStatus) {
        query = query.eq('billing_status', filters.billingStatus);
      }
      if (filters.status) {
        query = query.eq('billing_status', filters.status);
      }
      if (filters.isBillable !== undefined) {
        query = query.eq('is_billable', filters.isBillable);
      }

      const { data, error } = await query;
      if (error) throw error;
      return transformTimeEntries(data || []);
    },
    enabled: !!currentOrganization?.id,
  });
}

// Get weekly time entries for timesheet
export function useWeeklyTimeEntries(weekStart: Date) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  return useQuery({
    queryKey: ['time-entries-weekly', currentOrganization?.id, user?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!currentOrganization?.id || !user?.id) return [];

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          matter:matters(id, reference, title, contact:contacts(id, name))
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', user.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) throw error;
      return transformTimeEntries(data || []);
    },
    enabled: !!currentOrganization?.id && !!user?.id,
  });
}

// Get active timer for current user
export function useActiveTimer() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-timer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          matter:matters(id, reference, title)
        `)
        .eq('user_id', user.id)
        .eq('timer_running', true)
        .maybeSingle();

      if (error) throw error;
      return data as TimeEntry | null;
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });
}

// Create time entry
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      matter_id: string;
      date?: string;
      duration_minutes: number;
      description: string;
      activity_type?: string;
      is_billable?: boolean;
      start_time?: string;
      end_time?: string;
    }) => {
      if (!currentOrganization?.id || !user?.id) {
        throw new Error('No organization or user');
      }

      // Get applicable rate
      const { data: rate } = await supabase.rpc('get_applicable_rate', {
        p_organization_id: currentOrganization.id,
        p_user_id: user.id,
        p_matter_id: data.matter_id,
      });

      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          matter_id: data.matter_id,
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
          duration_minutes: data.duration_minutes,
          description: data.description,
          activity_type: data.activity_type || null,
          is_billable: data.is_billable ?? true,
          billing_rate: rate || null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
        })
        .select()
        .single();

      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-weekly'] });
    },
  });
}

// Start timer
export function useStartTimer() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      matter_id: string;
      description?: string;
      activity_type?: string;
      is_billable?: boolean;
    }) => {
      if (!currentOrganization?.id || !user?.id) {
        throw new Error('No organization or user');
      }

      // Check if there's already a running timer
      const { data: existing } = await supabase
        .from('time_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('timer_running', true)
        .maybeSingle();

      if (existing) {
        throw new Error('Ya tienes un timer activo');
      }

      // Get applicable rate
      const { data: rate } = await supabase.rpc('get_applicable_rate', {
        p_organization_id: currentOrganization.id,
        p_user_id: user.id,
        p_matter_id: data.matter_id,
      });

      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert({
          organization_id: currentOrganization.id,
          user_id: user.id,
          matter_id: data.matter_id,
          date: format(new Date(), 'yyyy-MM-dd'),
          duration_minutes: 0,
          description: data.description || 'En progreso...',
          activity_type: data.activity_type || null,
          is_billable: data.is_billable ?? true,
          billing_rate: rate || null,
          timer_started_at: new Date().toISOString(),
          timer_running: true,
        })
        .select()
        .single();

      if (error) throw error;
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Stop timer
export function useStopTimer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      entryId: string;
      description?: string;
      elapsedSeconds: number;
    }) => {
      const durationMinutes = Math.max(1, Math.ceil(data.elapsedSeconds / 60));

      const { error } = await supabase
        .from('time_entries')
        .update({
          duration_minutes: durationMinutes,
          timer_running: false,
          timer_started_at: null,
          description: data.description || 'Trabajo realizado',
        })
        .eq('id', data.entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-weekly'] });
    },
  });
}

// Update time entry
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<TimeEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-weekly'] });
    },
  });
}

// Delete time entry
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-weekly'] });
    },
  });
}

// Get unbilled time entries (for invoicing)
export function useUnbilledTimeEntries(matterId?: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['unbilled-time-entries', currentOrganization?.id, matterId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          matter:matters(id, reference, title, contact:contacts(id, name)),
          user:users(id, full_name)
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('is_billable', true)
        .in('billing_status', ['draft', 'approved'])
        .order('date', { ascending: true });

      if (matterId) {
        query = query.eq('matter_id', matterId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return transformTimeEntries(data || []);
    },
    enabled: !!currentOrganization?.id,
  });
}

// Mark entries as billed
export function useMarkEntriesAsBilled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      entryIds: string[];
      invoiceId: string;
    }) => {
      const { error } = await supabase
        .from('time_entries')
        .update({
          billing_status: 'billed',
          invoice_id: data.invoiceId,
        })
        .in('id', data.entryIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['unbilled-time-entries'] });
    },
  });
}
