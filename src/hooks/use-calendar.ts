// ============================================
// CALENDAR INTEGRATION HOOKS
// P62 - Calendarios Integrados
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// ============================================
// TYPES - Aligned with database schema
// ============================================

export type CalendarProvider = 'google' | 'microsoft' | 'apple';
export type SyncDirection = 'to_calendar' | 'from_calendar' | 'both';
export type SyncStatus = 'active' | 'paused' | 'error' | 'disconnected';

// Use database types directly
export type CalendarConnection = Database['public']['Tables']['calendar_connections']['Row'];
export type CalendarEventMapping = Database['public']['Tables']['calendar_event_mappings']['Row'];
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];
export type AvailabilityException = Database['public']['Tables']['availability_exceptions']['Row'];

// ============================================
// CALENDAR CONNECTIONS
// ============================================

export function useCalendarConnections() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['calendar-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCalendarConnection(connectionId: string | undefined) {
  return useQuery({
    queryKey: ['calendar-connection', connectionId],
    queryFn: async () => {
      if (!connectionId) return null;

      const { data, error } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!connectionId,
  });
}

export function useCreateCalendarConnection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      provider: CalendarProvider;
      access_token: string;
      calendar_id: string;
      calendar_name?: string;
      refresh_token?: string;
      sync_direction?: SyncDirection;
      sync_deadlines?: boolean;
      sync_tasks?: boolean;
      sync_meetings?: boolean;
      calendar_color?: string;
    }) => {
      if (!user?.id || !currentOrganization?.id) {
        throw new Error('User or organization not found');
      }

      const { data: result, error } = await supabase
        .from('calendar_connections')
        .insert({
          user_id: user.id,
          organization_id: currentOrganization.id,
          provider: data.provider,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          calendar_id: data.calendar_id,
          calendar_name: data.calendar_name,
          sync_direction: data.sync_direction || 'both',
          sync_deadlines: data.sync_deadlines ?? true,
          sync_tasks: data.sync_tasks ?? true,
          sync_meetings: data.sync_meetings ?? true,
          calendar_color: data.calendar_color,
          sync_status: 'active',
          sync_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Calendario añadido');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateCalendarConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CalendarConnection> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('calendar_connections')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Configuración actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteCalendarConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Calendario desconectado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ============================================
// SYNC OPERATIONS
// ============================================

export function useTriggerCalendarSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { connection_id: connectionId, action: 'sync' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Sincronización iniciada');
    },
    onError: (error: Error) => {
      toast.error(`Error de sincronización: ${error.message}`);
    },
  });
}

export function useCalendarEventMappings(connectionId: string | undefined) {
  return useQuery({
    queryKey: ['calendar-event-mappings', connectionId],
    queryFn: async () => {
      if (!connectionId) return [];

      const { data, error } = await supabase
        .from('calendar_event_mappings')
        .select('*')
        .eq('calendar_connection_id', connectionId)
        .order('last_synced_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!connectionId,
  });
}

// ============================================
// AVAILABILITY
// ============================================

export function useAvailabilitySlots() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['availability-slots', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useSaveAvailabilitySlots() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (slots: Omit<AvailabilitySlot, 'id' | 'user_id' | 'organization_id' | 'created_at'>[]) => {
      if (!user?.id || !currentOrganization?.id) {
        throw new Error('User or organization not found');
      }

      // Delete existing slots
      await supabase
        .from('availability_slots')
        .delete()
        .eq('user_id', user.id);

      if (slots.length === 0) return [];

      // Insert new slots
      const { data, error } = await supabase
        .from('availability_slots')
        .insert(
          slots.map(slot => ({
            ...slot,
            user_id: user.id,
            organization_id: currentOrganization.id,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast.success('Disponibilidad guardada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useAvailabilityExceptions(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['availability-exceptions', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('availability_exceptions')
        .select('*')
        .eq('user_id', user.id)
        .order('exception_date', { ascending: true });

      if (startDate) {
        query = query.gte('exception_date', startDate);
      }
      if (endDate) {
        query = query.lte('exception_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCreateAvailabilityException() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      exception_date: string;
      is_available?: boolean;
      start_time?: string;
      end_time?: string;
      reason?: string;
    }) => {
      if (!user?.id || !currentOrganization?.id) {
        throw new Error('User or organization not found');
      }

      const { data: result, error } = await supabase
        .from('availability_exceptions')
        .insert({
          user_id: user.id,
          organization_id: currentOrganization.id,
          exception_date: data.exception_date,
          is_available: data.is_available,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      toast.success('Excepción añadida');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('availability_exceptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-exceptions'] });
      toast.success('Excepción eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ============================================
// OAUTH HELPERS
// ============================================

export function useCalendarOAuthUrl() {
  return useMutation({
    mutationFn: async (provider: CalendarProvider) => {
      const { data, error } = await supabase.functions.invoke('calendar-oauth-url', {
        body: { 
          provider,
          redirect_uri: `${window.location.origin}/app/settings/integrations?calendar_callback=true`,
        },
      });

      if (error) throw error;
      return data as { url: string; state: string };
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useCalendarOAuthCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { code: string; state: string; provider: CalendarProvider }) => {
      const { data, error } = await supabase.functions.invoke('calendar-oauth-callback', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-connections'] });
      toast.success('Calendario conectado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al conectar: ${error.message}`);
    },
  });
}
