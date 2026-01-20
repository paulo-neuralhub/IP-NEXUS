// ============================================================
// IP-NEXUS CRM - PIPELINES HOOKS
// Prompt: CRM Pipelines management
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

interface Stage {
  id?: string;
  name: string;
  color: string;
  probability: number;
  position: number;
  is_won_stage?: boolean;
  is_lost_stage?: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  organization_id: string;
  owner_type: string;
  is_default: boolean;
  position: number;
  stages?: Stage[];
  created_at?: string;
}

interface CreatePipelineData {
  name: string;
  stages: Stage[];
}

export function usePipelines() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['pipelines', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('owner_type', 'tenant')
        .order('position');

      if (error) throw error;
      return data as Pipeline[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select(`
          *,
          stages:pipeline_stages(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Pipeline;
    },
    enabled: !!id,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: CreatePipelineData) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Get current max position
      const { data: existing } = await supabase
        .from('pipelines')
        .select('position')
        .eq('organization_id', currentOrganization.id)
        .order('position', { ascending: false })
        .limit(1);

      const maxPosition = existing?.[0]?.position ?? -1;
      const isFirst = maxPosition === -1;

      // Create pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert({
          name: data.name,
          organization_id: currentOrganization.id,
          owner_type: 'tenant',
          is_default: isFirst,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Create stages
      const stagesWithPipelineId = data.stages.map(stage => ({
        ...stage,
        pipeline_id: pipeline.id,
      }));

      const { error: stagesError } = await supabase
        .from('pipeline_stages')
        .insert(stagesWithPipelineId);

      if (stagesError) throw stagesError;

      return pipeline;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error) => {
      console.error('Create pipeline error:', error);
      toast.error('Error al crear pipeline');
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; is_default?: boolean }) => {
      // If setting as default, unset other defaults first
      if (updates.is_default && currentOrganization?.id) {
        await supabase
          .from('pipelines')
          .update({ is_default: false })
          .eq('organization_id', currentOrganization.id)
          .eq('owner_type', 'tenant');
      }

      const { data, error } = await supabase
        .from('pipelines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error) => {
      console.error('Update pipeline error:', error);
      toast.error('Error al actualizar pipeline');
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pipelines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error) => {
      console.error('Delete pipeline error:', error);
      toast.error('Error al eliminar pipeline');
    },
  });
}

// Stage management
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Stage & { pipeline_id: string }) => {
      const { data: stage, error } = await supabase
        .from('pipeline_stages')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return stage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', variables.pipeline_id] });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Stage>) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stages: { id: string; position: number }[]) => {
      // Update each stage position
      for (const stage of stages) {
        await supabase
          .from('pipeline_stages')
          .update({ position: stage.position })
          .eq('id', stage.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });
}
