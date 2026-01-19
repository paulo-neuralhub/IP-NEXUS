// ============================================================
// IP-NEXUS HELP - ANNOUNCEMENTS & SYSTEM STATUS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HelpAnnouncement, HelpSystemStatus, HelpTour, HelpTourProgress, HelpTooltip } from '@/types/help';
import { toast } from 'sonner';

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export function useHelpAnnouncements(options?: { unreadOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['help-announcements', options],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      let query = supabase
        .from('help_announcements')
        .select('*')
        .eq('is_published', true)
        .lte('publish_at', now)
        .order('publish_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: announcements, error } = await query;
      if (error) throw error;

      // Get read status if user is logged in
      if (user) {
        const { data: reads } = await supabase
          .from('help_announcement_reads')
          .select('announcement_id')
          .eq('user_id', user.id);

        const readIds = new Set(reads?.map(r => r.announcement_id) || []);

        let result = (announcements || []).map(a => ({
          ...a,
          is_read: readIds.has(a.id),
        }));

        if (options?.unreadOnly) {
          result = result.filter(a => !a.is_read);
        }

        return result as HelpAnnouncement[];
      }

      return (announcements || []).map(a => ({ ...a, is_read: false })) as HelpAnnouncement[];
    },
  });
}

export function useMarkAnnouncementRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('help_announcement_reads').upsert({
        user_id: user.id,
        announcement_id: announcementId,
      }, { onConflict: 'user_id,announcement_id' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-announcements'] });
    },
  });
}

export function useUnreadAnnouncementCount() {
  const { data: announcements } = useHelpAnnouncements({ unreadOnly: true });
  return announcements?.length || 0;
}

// ADMIN
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<HelpAnnouncement>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .from('help_announcements')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Anuncio creado');
      queryClient.invalidateQueries({ queryKey: ['help-announcements'] });
    },
    onError: () => {
      toast.error('Error al crear anuncio');
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpAnnouncement> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_announcements')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Anuncio actualizado');
      queryClient.invalidateQueries({ queryKey: ['help-announcements'] });
    },
    onError: () => {
      toast.error('Error al actualizar anuncio');
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('help_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Anuncio eliminado');
      queryClient.invalidateQueries({ queryKey: ['help-announcements'] });
    },
    onError: () => {
      toast.error('Error al eliminar anuncio');
    },
  });
}

// ==========================================
// SYSTEM STATUS
// ==========================================

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_system_status')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as HelpSystemStatus[];
    },
  });
}

export function useActiveIncidents() {
  return useQuery({
    queryKey: ['active-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_system_status')
        .select('*')
        .is('resolved_at', null)
        .neq('status', 'operational')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as HelpSystemStatus[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreateSystemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<HelpSystemStatus>) => {
      const { data: result, error } = await supabase
        .from('help_system_status')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Estado creado');
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
      queryClient.invalidateQueries({ queryKey: ['active-incidents'] });
    },
    onError: () => {
      toast.error('Error al crear estado');
    },
  });
}

export function useUpdateSystemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HelpSystemStatus> & { id: string }) => {
      const { data, error } = await supabase
        .from('help_system_status')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['system-status'] });
      queryClient.invalidateQueries({ queryKey: ['active-incidents'] });
    },
    onError: () => {
      toast.error('Error al actualizar estado');
    },
  });
}

// ==========================================
// TOOLTIPS
// ==========================================

export function useHelpTooltips(pagePath?: string) {
  return useQuery({
    queryKey: ['help-tooltips', pagePath],
    queryFn: async () => {
      let query = supabase
        .from('help_tooltips')
        .select('*')
        .eq('is_active', true);

      if (pagePath) {
        query = query.or(`page_path.eq.${pagePath},page_path.like.${pagePath.split('/')[1]}/*`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HelpTooltip[];
    },
  });
}

// ==========================================
// TOURS
// ==========================================

export function useHelpTour(tourKey: string) {
  return useQuery({
    queryKey: ['help-tour', tourKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_tours')
        .select('*')
        .eq('tour_key', tourKey)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as unknown as HelpTour;
    },
    enabled: !!tourKey,
  });
}

export function useTourProgress(tourId: string) {
  return useQuery({
    queryKey: ['tour-progress', tourId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('help_tour_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('tour_id', tourId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data as HelpTourProgress | null;
    },
    enabled: !!tourId,
  });
}

export function useUpdateTourProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tourId,
      status,
      currentStep,
    }: {
      tourId: string;
      status: HelpTourProgress['status'];
      currentStep?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('help_tour_progress').upsert({
        user_id: user.id,
        tour_id: tourId,
        status,
        current_step: currentStep,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        ...(status === 'skipped' ? { skipped_at: new Date().toISOString() } : {}),
      }, { onConflict: 'user_id,tour_id' });
    },
    onSuccess: (_, { tourId }) => {
      queryClient.invalidateQueries({ queryKey: ['tour-progress', tourId] });
    },
  });
}
