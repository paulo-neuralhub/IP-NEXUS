/**
 * IP-NEXUS Marketing Automation Templates
 * Pre-configured workflows for IP firms
 */

import type { AutomationAction } from '@/types/marketing';

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'onboarding' | 'renewals' | 'alerts' | 'follow-up' | 'custom';
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  actions: Omit<AutomationAction, 'id'>[];
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  // ============================================================
  // ONBOARDING AUTOMATIONS
  // ============================================================
  {
    id: 'welcome-sequence',
    name: 'Bienvenida a Nuevos Clientes',
    description: 'Secuencia de 3 emails para onboarding de nuevos clientes',
    icon: 'hand-wave',
    color: 'hsl(var(--primary))',
    category: 'onboarding',
    trigger_type: 'contact_created',
    trigger_config: { tags: ['new-client'] },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'bienvenida-cliente',
          subject: '¡Bienvenido a {{organization.name}}!' 
        }
      },
      {
        type: 'wait',
        config: { duration: 2, unit: 'days' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'servicios-overview',
          subject: 'Descubre nuestros servicios de PI' 
        }
      },
      {
        type: 'wait',
        config: { duration: 3, unit: 'days' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'agendar-consulta',
          subject: '¿Programamos una consulta gratuita?' 
        }
      },
      {
        type: 'add_tag',
        config: { tag: 'onboarding-complete' }
      }
    ]
  },
  {
    id: 'lead-nurture',
    name: 'Nurturing de Leads',
    description: 'Secuencia para convertir leads en clientes',
    icon: 'target',
    color: 'hsl(var(--module-crm))',
    category: 'onboarding',
    trigger_type: 'contact_created',
    trigger_config: { source: 'website' },
    actions: [
      {
        type: 'add_tag',
        config: { tag: 'lead' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'gracias-contacto',
          subject: 'Gracias por contactarnos' 
        }
      },
      {
        type: 'wait',
        config: { duration: 1, unit: 'days' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'recursos-pi',
          subject: 'Recursos útiles sobre Propiedad Intelectual' 
        }
      },
      {
        type: 'notify_team',
        config: { 
          message: 'Lead pendiente de seguimiento: {{contact.name}}',
          channel: 'sales'
        }
      }
    ]
  },

  // ============================================================
  // RENEWAL AUTOMATIONS
  // ============================================================
  {
    id: 'renewal-reminder-90',
    name: 'Recordatorio Renovación (90 días)',
    description: 'Notifica al cliente 90 días antes del vencimiento',
    icon: 'calendar-clock',
    color: 'hsl(var(--warning))',
    category: 'renewals',
    trigger_type: 'matter_expiring',
    trigger_config: { days_before: 90 },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'alerta-vencimiento',
          subject: '⏰ Renovación próxima: {{matter.title}}' 
        }
      },
      {
        type: 'add_tag',
        config: { tag: 'renewal-notified-90' }
      }
    ]
  },
  {
    id: 'renewal-reminder-30',
    name: 'Recordatorio Renovación (30 días)',
    description: 'Recordatorio urgente 30 días antes',
    icon: 'alarm-clock',
    color: 'hsl(var(--destructive))',
    category: 'renewals',
    trigger_type: 'matter_expiring',
    trigger_config: { days_before: 30 },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'alerta-vencimiento-urgente',
          subject: '🚨 URGENTE: Renovación en 30 días - {{matter.title}}' 
        }
      },
      {
        type: 'notify_team',
        config: { 
          message: 'Renovación urgente pendiente: {{matter.reference}}',
          channel: 'operations'
        }
      },
      {
        type: 'create_task',
        config: { 
          title: 'Gestionar renovación {{matter.reference}}',
          priority: 'high',
          due_in_days: 7
        }
      }
    ]
  },
  {
    id: 'renewal-confirmed',
    name: 'Confirmación de Renovación',
    description: 'Notifica al cliente cuando se completa la renovación',
    icon: 'check-circle',
    color: 'hsl(var(--success))',
    category: 'renewals',
    trigger_type: 'matter_renewed',
    trigger_config: {},
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'renovacion-confirmada',
          subject: '✅ Renovación completada: {{matter.title}}' 
        }
      },
      {
        type: 'remove_tag',
        config: { tag: 'renewal-pending' }
      },
      {
        type: 'add_tag',
        config: { tag: 'renewed-' + new Date().getFullYear() }
      }
    ]
  },

  // ============================================================
  // ALERT AUTOMATIONS
  // ============================================================
  {
    id: 'vigilance-alert',
    name: 'Alerta de Vigilancia',
    description: 'Notifica cuando Spider detecta una marca similar',
    icon: 'radar',
    color: 'hsl(var(--module-spider))',
    category: 'alerts',
    trigger_type: 'spider_alert',
    trigger_config: { risk_level: ['critical', 'high'] },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'informe-vigilancia',
          subject: '🔍 Alerta de vigilancia: posible conflicto detectado' 
        }
      },
      {
        type: 'create_task',
        config: { 
          title: 'Analizar alerta Spider: {{alert.conflicting_mark}}',
          priority: 'high',
          due_in_days: 3
        }
      }
    ]
  },
  {
    id: 'grant-notification',
    name: 'Notificación de Concesión',
    description: 'Celebra con el cliente cuando se concede su marca',
    icon: 'party-popper',
    color: 'hsl(var(--success))',
    category: 'alerts',
    trigger_type: 'matter_status_change',
    trigger_config: { new_status: 'granted' },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'felicitacion-concesion',
          subject: '🎉 ¡Enhorabuena! Tu marca ha sido concedida' 
        }
      },
      {
        type: 'add_tag',
        config: { tag: 'grant-celebrated' }
      }
    ]
  },
  {
    id: 'opposition-alert',
    name: 'Alerta de Oposición',
    description: 'Notifica cuando hay una oposición contra tu marca',
    icon: 'alert-triangle',
    color: 'hsl(var(--destructive))',
    category: 'alerts',
    trigger_type: 'matter_status_change',
    trigger_config: { new_status: 'opposition' },
    actions: [
      {
        type: 'send_email',
        config: { 
          template_preset: 'alerta-oposicion',
          subject: '⚠️ Oposición recibida: {{matter.title}}' 
        }
      },
      {
        type: 'notify_team',
        config: { 
          message: 'Oposición recibida contra {{matter.reference}}',
          channel: 'legal'
        }
      },
      {
        type: 'create_task',
        config: { 
          title: 'Preparar defensa oposición {{matter.reference}}',
          priority: 'critical',
          due_in_days: 2
        }
      }
    ]
  },

  // ============================================================
  // FOLLOW-UP AUTOMATIONS
  // ============================================================
  {
    id: 'proposal-followup',
    name: 'Seguimiento de Propuesta',
    description: 'Seguimiento automático cuando envías una propuesta',
    icon: 'file-text',
    color: 'hsl(var(--info))',
    category: 'follow-up',
    trigger_type: 'deal_stage_change',
    trigger_config: { stage: 'proposal_sent' },
    actions: [
      {
        type: 'wait',
        config: { duration: 3, unit: 'days' }
      },
      {
        type: 'condition',
        config: { 
          field: 'deal.stage',
          operator: 'equals',
          value: 'proposal_sent'
        }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'seguimiento-propuesta',
          subject: 'Seguimiento: Propuesta de servicios de PI' 
        }
      },
      {
        type: 'wait',
        config: { duration: 5, unit: 'days' }
      },
      {
        type: 'notify_team',
        config: { 
          message: 'Propuesta sin respuesta: {{deal.title}}',
          channel: 'sales'
        }
      }
    ]
  },
  {
    id: 'inactive-client',
    name: 'Reactivación de Clientes',
    description: 'Contacta clientes que llevan tiempo sin actividad',
    icon: 'user-check',
    color: 'hsl(var(--module-marketing))',
    category: 'follow-up',
    trigger_type: 'contact_inactive',
    trigger_config: { days_inactive: 180 },
    actions: [
      {
        type: 'add_tag',
        config: { tag: 'reactivation-campaign' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'te-echamos-de-menos',
          subject: 'Te echamos de menos, {{contact.first_name}}' 
        }
      },
      {
        type: 'wait',
        config: { duration: 7, unit: 'days' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'novedades-pi',
          subject: 'Novedades en Propiedad Intelectual que te interesan' 
        }
      }
    ]
  },
  {
    id: 'nps-survey',
    name: 'Encuesta de Satisfacción',
    description: 'Solicita feedback después de completar un servicio',
    icon: 'star',
    color: 'hsl(var(--module-genius))',
    category: 'follow-up',
    trigger_type: 'matter_status_change',
    trigger_config: { new_status: 'completed' },
    actions: [
      {
        type: 'wait',
        config: { duration: 7, unit: 'days' }
      },
      {
        type: 'send_email',
        config: { 
          template_preset: 'encuesta-satisfaccion',
          subject: '¿Cómo fue tu experiencia con nosotros?' 
        }
      }
    ]
  }
];

// ============================================================
// AUTOMATION CATEGORIES
// ============================================================
export const AUTOMATION_CATEGORIES = {
  onboarding: {
    label: 'Onboarding',
    description: 'Bienvenida y nurturing de leads/clientes',
    icon: 'hand-wave',
    color: 'hsl(var(--primary))'
  },
  renewals: {
    label: 'Renovaciones',
    description: 'Recordatorios y confirmaciones de renovación',
    icon: 'calendar-clock',
    color: 'hsl(var(--warning))'
  },
  alerts: {
    label: 'Alertas',
    description: 'Notificaciones de vigilancia y cambios de estado',
    icon: 'bell',
    color: 'hsl(var(--module-spider))'
  },
  'follow-up': {
    label: 'Seguimiento',
    description: 'Follow-ups automáticos y reactivación',
    icon: 'mail',
    color: 'hsl(var(--module-marketing))'
  },
  custom: {
    label: 'Personalizado',
    description: 'Automatizaciones creadas por ti',
    icon: 'settings',
    color: 'hsl(var(--muted-foreground))'
  }
};
