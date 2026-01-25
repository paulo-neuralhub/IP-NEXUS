import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export interface WorkflowTemplateDB {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  steps: WorkflowStep[];
  icon: string | null;
  color: string | null;
  tags: string[];
  is_active: boolean;
  is_system: boolean;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  type: 'trigger' | 'delay' | 'send_email' | 'send_notification' | 'create_task' | 'condition' | 'end';
  name: string;
  config?: {
    value?: number;
    unit?: 'minutes' | 'hours' | 'days';
    email_template_code?: string;
    to?: string;
    cc?: string;
    title?: string;
    body?: string;
    due_days?: number;
    priority?: string;
    field?: string;
    operator?: string;
  };
  branches?: {
    yes?: string;
    no?: string;
  };
}

export interface TemplatePreview {
  template: WorkflowTemplateDB;
  emailTemplates: EmailTemplateInfo[];
  stepCount: number;
  emailCount: number;
  taskCount: number;
  delayCount: number;
}

export interface EmailTemplateInfo {
  code: string;
  name: string;
  subject: string;
  category: string;
}

// Fetch all workflow templates (system + custom)
export function useSystemWorkflowTemplates(options?: { 
  category?: string; 
  search?: string;
  includeCustom?: boolean;
}) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['system-workflow-templates', options],
    queryFn: async () => {
      let query = supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_system', true)
        .order('name', { ascending: true });
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      let templates = (data || []).map(t => ({
        ...t,
        steps: Array.isArray(t.steps) ? t.steps : (typeof t.steps === 'string' ? JSON.parse(t.steps as string) : [])
      })) as WorkflowTemplateDB[];
      
      // Filter by search
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        templates = templates.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return templates;
    }
  });
}

// Get single template by code
export function useWorkflowTemplateByCode(code: string | undefined) {
  return useQuery({
    queryKey: ['workflow-template-by-code', code],
    queryFn: async () => {
      if (!code) return null;
      
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        steps: Array.isArray(data.steps) ? data.steps : (typeof data.steps === 'string' ? JSON.parse(data.steps) : [])
      } as WorkflowTemplateDB;
    },
    enabled: !!code
  });
}

// Get template preview with related email templates
export function useWorkflowTemplatePreview(code: string | undefined) {
  return useQuery({
    queryKey: ['workflow-template-preview', code],
    queryFn: async (): Promise<TemplatePreview | null> => {
      if (!code) return null;
      
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      
      if (templateError) throw templateError;
      if (!template) return null;
      
      const parsedTemplate = {
        ...template,
        steps: Array.isArray(template.steps) ? template.steps : (typeof template.steps === 'string' ? JSON.parse(template.steps) : [])
      } as WorkflowTemplateDB;
      
      // Extract email template codes from steps
      const emailCodes: string[] = [];
      parsedTemplate.steps.forEach(step => {
        if (step.type === 'send_email' && step.config?.email_template_code) {
          emailCodes.push(step.config.email_template_code);
        }
      });
      
      // Fetch email templates
      let emailTemplates: EmailTemplateInfo[] = [];
      if (emailCodes.length > 0) {
        const { data: emails } = await supabase
          .from('email_templates')
          .select('code, name, subject, category')
          .in('code', emailCodes);
        
        emailTemplates = (emails || []) as EmailTemplateInfo[];
      }
      
      // Count step types
      const stepCount = parsedTemplate.steps.length;
      const emailCount = parsedTemplate.steps.filter(s => s.type === 'send_email').length;
      const taskCount = parsedTemplate.steps.filter(s => s.type === 'create_task').length;
      const delayCount = parsedTemplate.steps.filter(s => s.type === 'delay').length;
      
      return {
        template: parsedTemplate,
        emailTemplates,
        stepCount,
        emailCount,
        taskCount,
        delayCount
      };
    },
    enabled: !!code
  });
}

// Use a template to create a new workflow
export function useCreateFromTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (templateCode: string) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      // Get template
      const { data: template, error: templateError } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('code', templateCode)
        .single();
      
      if (templateError) throw templateError;
      
      // Create new workflow from template
      const { data: newWorkflow, error: createError } = await supabase
        .from('workflow_templates')
        .insert({
          code: `${template.code}_${Date.now()}`,
          name: `${template.name} (copia)`,
          description: template.description,
          category: template.category,
          trigger_type: template.trigger_type,
          trigger_config: template.trigger_config,
          steps: template.steps,
          icon: template.icon,
          color: template.color,
          tags: template.tags,
          is_active: false,
          is_system: false,
          organization_id: currentOrganization.id,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (createError) throw createError;
      return newWorkflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Workflow creado desde plantilla');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear workflow: ${error.message}`);
    }
  });
}

// Get available categories
export function useWorkflowCategories() {
  return useQuery({
    queryKey: ['workflow-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('category')
        .eq('is_system', true);
      
      if (error) throw error;
      
      // Get unique categories
      const categories = [...new Set(data.map(t => t.category))].filter(Boolean);
      return categories as string[];
    }
  });
}
