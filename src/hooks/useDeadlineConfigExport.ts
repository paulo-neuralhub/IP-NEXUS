// ============================================================
// IP-NEXUS - DEADLINE CONFIG EXPORT/IMPORT HOOK
// Export and import deadline configuration via automation_rules
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface ExportOptions {
  includeRules: boolean;
  includeTypes: boolean;
  includeHolidays: boolean;
}

export interface ImportOptions {
  mode: 'add' | 'replace';
  file: File;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const TEMPLATES: ConfigTemplate[] = [
  {
    id: 'spain',
    name: 'Despacho España',
    description: 'Reglas OEPM + festivos nacionales ES',
    icon: '🇪🇸',
  },
  {
    id: 'eu',
    name: 'Despacho UE',
    description: 'Reglas EUIPO + festivos EU',
    icon: '🇪🇺',
  },
  {
    id: 'international',
    name: 'Despacho Internacional',
    description: 'Reglas multi-jurisdicción (ES, EU, US, WIPO)',
    icon: '🌍',
  },
  {
    id: 'patents',
    name: 'Solo Patentes',
    description: 'Reglas especializadas para patentes',
    icon: '📜',
  },
  {
    id: 'trademarks',
    name: 'Solo Marcas',
    description: 'Reglas especializadas para marcas',
    icon: '®️',
  },
];

// Export configuration
export function useExportConfig() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (options: ExportOptions) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const exportData: Record<string, unknown> = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        organizationId: currentOrganization.id,
      };

      // Export custom automation rules
      if (options.includeRules) {
        const { data: rules } = await supabase
          .from('automation_rules')
          .select('*')
          .eq('tenant_id', currentOrganization.id);

        exportData.rules = rules || [];
      }

      // Export custom types
      if (options.includeTypes) {
        const { data: types } = await supabase
          .from('deadline_types')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .eq('is_system', false);

        exportData.types = types || [];
      }

      // Export custom holidays
      if (options.includeHolidays) {
        const { data: holidays } = await supabase
          .from('holiday_calendars')
          .select('*')
          .eq('organization_id', currentOrganization.id);

        exportData.holidays = holidays || [];
      }

      return exportData;
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ip-nexus-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Configuración exportada');
    },
    onError: (error: Error) => {
      toast.error('Error al exportar: ' + error.message);
    },
  });
}

// Import configuration
export function useImportConfig() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ file, mode }: ImportOptions) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version) {
        throw new Error('Formato de archivo inválido');
      }

      const results = {
        rulesImported: 0,
        typesImported: 0,
        holidaysImported: 0,
      };

      // If replace mode, delete existing custom data
      if (mode === 'replace') {
        await supabase
          .from('automation_rules')
          .delete()
          .eq('tenant_id', currentOrganization.id);

        await supabase
          .from('deadline_types')
          .delete()
          .eq('organization_id', currentOrganization.id)
          .eq('is_system', false);

        await supabase
          .from('holiday_calendars')
          .delete()
          .eq('organization_id', currentOrganization.id);
      }

      // Import rules (support both old and new format)
      if (data.rules && Array.isArray(data.rules)) {
        const rulesToInsert = data.rules.map((r: Record<string, unknown>) => {
          // Check if it's new format (automation_rules) or old format (deadline_rules)
          if (r.rule_type) {
            // New format
            return {
              tenant_id: currentOrganization.id,
              code: r.code,
              name: r.name,
              description: r.description,
              rule_type: r.rule_type,
              category: r.category || 'general',
              subcategory: r.subcategory,
              trigger_type: r.trigger_type || 'event',
              trigger_event: r.trigger_event,
              trigger_config: r.trigger_config || {},
              conditions: r.conditions || {},
              deadline_config: r.deadline_config,
              notification_config: r.notification_config,
              task_config: r.task_config,
              email_config: r.email_config,
              is_system_rule: false,
              is_active: true,
              is_customized: true,
              display_order: r.display_order || 1000,
            };
          } else {
            // Old format - convert to new
            return {
              tenant_id: currentOrganization.id,
              code: r.code,
              name: r.name,
              description: r.description,
              rule_type: 'deadline',
              category: (r.matter_type as string) === 'patent' ? 'patents' : 'trademarks',
              subcategory: null,
              trigger_type: 'event',
              trigger_event: r.event_type || 'matter_status_changed',
              trigger_config: {},
              conditions: {
                matter_types: r.matter_type ? [r.matter_type] : [],
                offices: r.jurisdiction ? [r.jurisdiction] : [],
              },
              deadline_config: {
                priority: r.priority || 'medium',
                notify_before_days: r.alert_days || [30, 15, 7, 1],
                auto_create_task: r.auto_create_task ?? false,
                calendar_type: r.calendar_type || 'calendar',
                days_from_event: r.days_from_event,
              },
              is_system_rule: false,
              is_active: true,
              is_customized: true,
              display_order: 1000,
            };
          }
        });

        if (rulesToInsert.length > 0) {
          const { data: inserted } = await supabase
            .from('automation_rules')
            .insert(rulesToInsert)
            .select();

          results.rulesImported = inserted?.length || 0;
        }
      }

      // Import types
      if (data.types && Array.isArray(data.types)) {
        const typesToInsert = data.types.map((t: Record<string, unknown>) => ({
          code: t.code,
          name_es: t.name_es,
          name_en: t.name_en,
          description: t.description,
          category: t.category,
          matter_types: t.matter_types,
          organization_id: currentOrganization.id,
          is_system: false,
          is_active: true,
          sort_order: 100,
        }));

        if (typesToInsert.length > 0) {
          const { data: inserted } = await supabase
            .from('deadline_types')
            .insert(typesToInsert)
            .select();

          results.typesImported = inserted?.length || 0;
        }
      }

      // Import holidays
      if (data.holidays && Array.isArray(data.holidays)) {
        const holidaysToInsert = data.holidays.map((h: Record<string, unknown>) => ({
          country_code: h.country_code,
          region: h.region,
          year: h.year,
          date: h.date,
          name: h.name,
          is_national: h.is_national,
          organization_id: currentOrganization.id,
          is_active: true,
        }));

        if (holidaysToInsert.length > 0) {
          const { data: inserted } = await supabase
            .from('holiday_calendars')
            .insert(holidaysToInsert)
            .select();

          results.holidaysImported = inserted?.length || 0;
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['deadline-types-config'] });
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar'] });

      toast.success(
        `Importado: ${results.rulesImported} reglas, ${results.typesImported} tipos, ${results.holidaysImported} festivos`
      );
    },
    onError: (error: Error) => {
      toast.error('Error al importar: ' + error.message);
    },
  });
}

// Load predefined template
export function useLoadTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (templateId: string) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const template = TEMPLATES.find(t => t.id === templateId);
      if (!template) throw new Error('Template no encontrado');

      // Call edge function to load template
      const { data, error } = await supabase.functions.invoke('load-deadline-template', {
        body: {
          organizationId: currentOrganization.id,
          templateId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline-rule-configs'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['holiday-calendar'] });
      toast.success('Plantilla cargada correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al cargar plantilla: ' + error.message);
    },
  });
}
