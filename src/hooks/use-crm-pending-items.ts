/**
 * useCRMPendingItems - Hook para tareas y llamadas pendientes CRM (datos reales)
 * Reemplaza datos mock de CRMDashboardNew
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export interface PendingCall {
  id: string;
  name: string;
  company: string;
  phone: string;
  time: string;
}

export interface UrgentTask {
  id: string;
  title: string;
  urgency: 'high' | 'medium' | 'low';
  dueDate: string;
}

export interface RecentActivity {
  id: string;
  type: 'email' | 'call' | 'convert' | 'won' | 'lead' | 'note';
  text: string;
  user: string;
  time: string;
}

export function useCRMPendingCalls() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['crm-pending-calls', organizationId],
    queryFn: async (): Promise<PendingCall[]> => {
      if (!organizationId) return [];

      try {
        const today = new Date();
        const todayStart = startOfDay(today).toISOString();
        const todayEnd = endOfDay(today).toISOString();

        // Buscar tareas de tipo llamada pendientes para hoy
        const { data, error } = await (supabase
          .from('crm_tasks') as any)
          .select(`
            id, title, due_date,
            contact:crm_contacts(id, full_name, phone, account:crm_accounts(name))
          `)
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .gte('due_date', todayStart)
          .lte('due_date', todayEnd)
          .order('due_date', { ascending: true })
          .limit(5);

        if (error) {
          console.warn('[useCRMPendingCalls] Error:', error.message);
          return [];
        }

        return (data || []).map((t: any) => ({
          id: t.id,
          name: t.contact?.full_name || 'Sin asignar',
          company: t.contact?.account?.name || 'Sin empresa',
          phone: t.contact?.phone || '',
          time: t.due_date ? format(new Date(t.due_date), 'HH:mm', { locale: es }) : '--:--',
        }));
      } catch {
        return [];
      }
    },
    enabled: !!organizationId,
  });
}

export function useCRMUrgentTasks() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['crm-urgent-tasks', organizationId],
    queryFn: async (): Promise<UrgentTask[]> => {
      if (!organizationId) return [];

      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Buscar tareas urgentes (vencen hoy o mañana)
        const { data, error } = await supabase
          .from('crm_tasks')
          .select('id, title, status, due_date')
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .lte('due_date', endOfDay(tomorrow).toISOString())
          .order('due_date', { ascending: true })
          .limit(5);

        if (error) {
          console.warn('[useCRMUrgentTasks] Error:', error.message);
          return [];
        }

        return (data || []).map((t: any) => {
          const due = t.due_date ? new Date(t.due_date) : null;
          const isToday = due && startOfDay(due).getTime() === startOfDay(today).getTime();
          const isTomorrow = due && startOfDay(due).getTime() === startOfDay(tomorrow).getTime();
          // Determine urgency based on due date proximity
          const urgency = isToday ? 'high' : isTomorrow ? 'medium' : 'low';

          return {
            id: t.id,
            title: t.title || 'Tarea sin título',
            urgency,
            dueDate: isToday ? 'Hoy' : isTomorrow ? 'Mañana' : due ? format(due, 'd MMM', { locale: es }) : 'Sin fecha',
          };
        });
      } catch {
        return [];
      }
    },
    enabled: !!organizationId,
  });
}

export function useCRMRecentActivity() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['crm-recent-activity', organizationId],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!organizationId) return [];

      try {
        // Buscar últimas interacciones
        const { data, error } = await supabase
          .from('crm_interactions')
          .select(`
            id, channel, subject, created_at,
            created_by_user:users!crm_interactions_created_by_fkey(full_name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.warn('[useCRMRecentActivity] Error:', error.message);
          return [];
        }

        return (data || []).map((i: any) => {
          let type: RecentActivity['type'] = 'note';
          if (i.channel === 'email') type = 'email';
          else if (i.channel === 'phone' || i.channel === 'call') type = 'call';

          return {
            id: i.id,
            type,
            text: i.subject || 'Actividad registrada',
            user: i.created_by_user?.full_name || 'Sistema',
            time: i.created_at ? format(new Date(i.created_at), 'HH:mm', { locale: es }) : '',
          };
        });
      } catch {
        return [];
      }
    },
    enabled: !!organizationId,
  });
}

export function useCRMAverageTicket() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['crm-avg-ticket', organizationId],
    queryFn: async (): Promise<number> => {
      if (!organizationId) return 0;

      try {
        // Calcular ticket medio de deals ganados
        const { data, error } = await supabase
          .from('crm_deals')
          .select('amount')
          .eq('organization_id', organizationId)
          .eq('stage', 'won')
          .not('amount', 'is', null);

        if (error || !data || data.length === 0) return 0;

        const total = data.reduce((sum, d) => sum + (d.amount || 0), 0);
        return Math.round(total / data.length);
      } catch {
        return 0;
      }
    },
    enabled: !!organizationId,
  });
}
