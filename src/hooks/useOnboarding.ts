import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// TIPOS
// =============================================

export interface OnboardingProgress {
  id: string;
  organization_id: string;
  status: string;
  current_step: number;
  total_steps: number;
  steps_completed: Record<string, { completed: boolean; completed_at?: string; skipped?: boolean }>;
  collected_data: Record<string, any>;
  tour_completed: boolean;
  tour_progress: Record<string, boolean>;
  started_at: string;
  completed_at: string | null;
  last_activity_at: string;
  started_by: string | null;
}

export interface OnboardingTip {
  id: string;
  tip_key: string;
  title: string;
  content: string;
  module: string | null;
  trigger_type: string | null;
  position: string;
  highlight_selector: string | null;
  tour_order: number | null;
  is_tour_step: boolean;
  dismissible: boolean;
  show_once: boolean;
}

// =============================================
// PROGRESO DEL ONBOARDING
// =============================================

export function useOnboardingProgress() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['onboarding-progress', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as OnboardingProgress | null;
    },
    enabled: !!currentOrganization?.id
  });
}

export function useInitializeOnboarding() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id || !user?.id) throw new Error('No organization or user');
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('onboarding_progress')
        .select('id')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();
      
      if (existing) return existing;
      
      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert({
          organization_id: currentOrganization.id,
          status: 'in_progress',
          current_step: 1,
          started_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    }
  });
}

export function useUpdateOnboardingProgress() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (updates: {
      current_step?: number;
      steps_completed?: Record<string, any>;
      collected_data?: Record<string, any>;
      tour_completed?: boolean;
      tour_progress?: Record<string, boolean>;
      status?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          ...updates,
          steps_completed: updates.steps_completed as Json,
          collected_data: updates.collected_data as Json,
          tour_progress: updates.tour_progress as Json,
          last_activity_at: new Date().toISOString()
        })
        .eq('organization_id', currentOrganization.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    }
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('organization_id', currentOrganization.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      toast.success('¡Configuración completada!');
    }
  });
}

// =============================================
// DATA IMPORTS
// =============================================

export function useDataImports() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['data-imports', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateDataImport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      source_type: string;
      source_file_id?: string;
      source_file_name?: string;
      data_type: string;
      column_mapping?: Record<string, string>;
      options?: Record<string, any>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data: result, error } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          source_type: data.source_type,
          source_file_id: data.source_file_id,
          source_file_name: data.source_file_name,
          data_type: data.data_type,
          column_mapping: data.column_mapping as Json,
          options: data.options as Json,
          status: 'pending',
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports'] });
    }
  });
}

export function useUpdateDataImport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: {
        status?: string;
        validation_results?: Record<string, any>;
        import_results?: Record<string, any>;
        column_mapping?: Record<string, string>;
      };
    }) => {
      const { error } = await supabase
        .from('data_imports')
        .update({
          ...updates,
          validation_results: updates.validation_results as Json,
          import_results: updates.import_results as Json,
          column_mapping: updates.column_mapping as Json
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports'] });
    }
  });
}

// =============================================
// IMPORT TEMPLATES (using existing table)
// =============================================

export function useImportTemplates(dataType?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['import-templates', currentOrganization?.id, dataType],
    queryFn: async () => {
      let query = supabase
        .from('import_templates')
        .select('*');
      
      // Filter by org or system templates
      if (currentOrganization?.id) {
        query = query.or(`organization_id.eq.${currentOrganization.id},is_system.eq.true`);
      } else {
        query = query.eq('is_system', true);
      }
      
      if (dataType) {
        query = query.eq('import_type', dataType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

// =============================================
// ONBOARDING TIPS & TOUR
// =============================================

export function useTourSteps() {
  return useQuery({
    queryKey: ['tour-steps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tips')
        .select('*')
        .eq('is_tour_step', true)
        .eq('is_active', true)
        .order('tour_order', { ascending: true });
      
      if (error) throw error;
      return data as OnboardingTip[];
    }
  });
}

export function useContextualTips(module?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contextual-tips', user?.id, module],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get seen tips
      const { data: seenTips } = await supabase
        .from('user_tip_progress')
        .select('tip_id')
        .eq('user_id', user.id)
        .in('status', ['seen', 'dismissed', 'completed']);
      
      const seenIds = seenTips?.map(t => t.tip_id) || [];
      
      let query = supabase
        .from('onboarding_tips')
        .select('*')
        .eq('is_active', true)
        .eq('is_tour_step', false);
      
      if (seenIds.length > 0) {
        query = query.not('id', 'in', `(${seenIds.join(',')})`);
      }
      
      if (module) {
        query = query.or(`module.eq.${module},module.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OnboardingTip[];
    },
    enabled: !!user?.id
  });
}

export function useMarkTipSeen() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ tipId, status = 'seen' }: { tipId: string; status?: 'seen' | 'dismissed' | 'completed' }) => {
      if (!user?.id) throw new Error('No user');
      
      const { error } = await supabase
        .from('user_tip_progress')
        .upsert({
          user_id: user.id,
          tip_id: tipId,
          status,
          seen_at: status === 'seen' ? new Date().toISOString() : undefined,
          dismissed_at: status === 'dismissed' ? new Date().toISOString() : undefined
        }, { onConflict: 'user_id,tip_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contextual-tips'] });
    }
  });
}

// =============================================
// ORGANIZATION OFFICES
// =============================================

export function useOrganizationOffices() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['organization-offices', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('organization_offices')
        .select(`
          *,
          office:ipo_offices(*)
        `)
        .eq('organization_id', currentOrganization.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

export function useSetFavoriteOffices() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (officeIds: string[]) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      // Delete existing
      await supabase
        .from('organization_offices')
        .delete()
        .eq('organization_id', currentOrganization.id);
      
      // Insert new
      if (officeIds.length > 0) {
        const { error } = await supabase
          .from('organization_offices')
          .insert(
            officeIds.map(officeId => ({
              organization_id: currentOrganization.id,
              office_id: officeId,
              is_favorite: true
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-offices'] });
      toast.success('Oficinas favoritas actualizadas');
    }
  });
}
