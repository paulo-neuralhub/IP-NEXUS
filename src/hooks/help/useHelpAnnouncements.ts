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
  return useQuery({
    queryKey: ['help-announcements-unread-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const now = new Date().toISOString();
      
      const { data: announcements, error: annError } = await supabase
        .from('help_announcements')
        .select('id')
        .eq('is_published', true)
        .lte('publish_at', now);

      if (annError) throw annError;

      const { data: reads } = await supabase
        .from('help_announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id);

      const readIds = new Set(reads?.map(r => r.announcement_id) || []);
      const unreadCount = (announcements || []).filter(a => !readIds.has(a.id)).length;
      
      return unreadCount;
    },
  });
}

// ADMIN
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<HelpAnnouncement>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const insertData = {
        title: data.title || '',
        content: data.content || '',
        announcement_type: data.announcement_type || 'feature',
        is_published: data.is_published ?? false,
        publish_at: data.publish_at,
        expire_at: data.expire_at,
        audience: data.audience,
        affected_modules: data.affected_modules,
        is_breaking_change: data.is_breaking_change,
        version: data.version,
        image_url: data.image_url,
        video_url: data.video_url,
        learn_more_url: data.learn_more_url,
        summary: data.summary,
        is_featured: data.is_featured,
      };

      const { data: result, error } = await supabase
        .from('help_announcements')
        .insert(insertData)
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
      return (data || []) as unknown as HelpSystemStatus[];
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
      return (data || []) as unknown as HelpSystemStatus[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useCreateSystemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<HelpSystemStatus>) => {
      const insertData = {
        component: data.component || '',
        status: data.status || 'operational',
        title: data.title,
        description: data.description,
        impact: data.impact,
        started_at: data.started_at,
        expected_resolution_at: data.expected_resolution_at,
        updates: data.updates ? JSON.parse(JSON.stringify(data.updates)) : undefined,
      };

      const { data: result, error } = await supabase
        .from('help_system_status')
        .insert(insertData)
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
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.component !== undefined) updateData.component = updates.component;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.impact !== undefined) updateData.impact = updates.impact;
      if (updates.started_at !== undefined) updateData.started_at = updates.started_at;
      if (updates.resolved_at !== undefined) updateData.resolved_at = updates.resolved_at;
      if (updates.expected_resolution_at !== undefined) updateData.expected_resolution_at = updates.expected_resolution_at;
      if (updates.updates !== undefined) updateData.updates = JSON.parse(JSON.stringify(updates.updates));

      const { data, error } = await supabase
        .from('help_system_status')
        .update(updateData)
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
