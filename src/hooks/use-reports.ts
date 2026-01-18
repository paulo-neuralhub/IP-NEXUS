import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  ReportTemplate, 
  GeneratedReport, 
  ScheduledReport,
  ReportType
} from '@/types/reports';
import type { Json } from '@/integrations/supabase/types';

// ===== PLANTILLAS =====
export function useReportTemplates(reportType?: ReportType) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['report-templates', currentOrganization?.id, reportType],
    queryFn: async () => {
      let query = supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .or(`organization_id.is.null,organization_id.eq.${currentOrganization!.id}`)
        .order('is_system', { ascending: false })
        .order('name');
      
      if (reportType) {
        query = query.eq('report_type', reportType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ReportTemplate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useReportTemplate(id: string) {
  return useQuery({
    queryKey: ['report-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as ReportTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<ReportTemplate>) => {
      const { data: template, error } = await supabase
        .from('report_templates')
        .insert({
          code: data.code || `custom_${Date.now()}`,
          name: data.name || 'Nueva Plantilla',
          report_type: data.report_type || 'custom',
          organization_id: currentOrganization!.id,
          is_system: false,
          config: (data.config || { sections: [] }) as unknown as Json,
          style: (data.style || {}) as unknown as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return template as unknown as ReportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReportTemplate> }) => {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.config) updateData.config = data.config as unknown as Json;
      if (data.style) updateData.style = data.style as unknown as Json;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      
      const { data: template, error } = await supabase
        .from('report_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return template as unknown as ReportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    },
  });
}

// ===== INFORMES GENERADOS =====
export function useGeneratedReports(limit = 20) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['generated-reports', currentOrganization?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as unknown as GeneratedReport[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async ({ 
      templateId, 
      name,
      parameters,
      format = 'pdf'
    }: {
      templateId?: string;
      name: string;
      parameters: Record<string, unknown>;
      format?: 'pdf' | 'xlsx' | 'csv';
    }) => {
      const { data: report, error: createError } = await supabase
        .from('generated_reports')
        .insert({
          organization_id: currentOrganization!.id,
          template_id: templateId,
          name,
          report_type: (parameters.report_type as string) || 'custom',
          parameters: parameters as unknown as Json,
          file_format: format,
          status: 'pending',
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { report_id: report.id },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('generated_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    },
  });
}

// ===== INFORMES PROGRAMADOS =====
export function useScheduledReports() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['scheduled-reports', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('next_run_at');
      if (error) throw error;
      return data as unknown as ScheduledReport[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<ScheduledReport>) => {
      const nextRun = calculateNextRun(data.schedule_type || 'weekly', data.schedule_config || {});
      
      const { data: scheduled, error } = await supabase
        .from('scheduled_reports')
        .insert({
          organization_id: currentOrganization!.id,
          template_id: data.template_id!,
          name: data.name || 'Informe programado',
          schedule_type: data.schedule_type || 'weekly',
          schedule_config: (data.schedule_config || {}) as unknown as Json,
          parameters: (data.parameters || {}) as unknown as Json,
          recipients: (data.recipients || []) as unknown as Json,
          next_run_at: nextRun.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return scheduled as unknown as ScheduledReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}

export function useToggleScheduledReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
}

function calculateNextRun(
  scheduleType: string,
  config: { day_of_week?: number; day_of_month?: number; time?: string }
): Date {
  const now = new Date();
  const [hours, minutes] = (config.time || '09:00').split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  switch (scheduleType) {
    case 'daily':
      if (next <= now) next.setDate(next.getDate() + 1);
      break;
    case 'weekly': {
      const targetDay = config.day_of_week || 1;
      while (next.getDay() !== targetDay || next <= now) next.setDate(next.getDate() + 1);
      break;
    }
    case 'monthly':
      next.setDate(config.day_of_month || 1);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}
