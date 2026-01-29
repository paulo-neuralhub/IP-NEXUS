// ============================================
// Hook para cargar eventos del calendario
// Agrega datos de matter_deadlines y activities
// ============================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'deadline_fatal' | 'deadline' | 'renewal' | 'task' | 'meeting' | 'call' | 'reminder' | 'appointment';
  color: string;
  matter?: { id: string; reference: string; title: string };
  account?: { id: string; name: string };
  allDay?: boolean;
  description?: string;
  source_table: string;
  source_id: string;
}

export interface EventFilters {
  showDeadlines: boolean;
  showDeadlinesFatal: boolean;
  showRenewals: boolean;
  showTasks: boolean;
  showMeetings: boolean;
  showCalls: boolean;
  showReminders: boolean;
  showOnlyMine: boolean;
}

export interface EventStats {
  deadlinesFatal: number;
  deadlines: number;
  renewals: number;
  tasks: number;
  meetings: number;
  calls: number;
  reminders: number;
}

const EVENT_COLORS = {
  deadline_fatal: '#ef4444', // red
  deadline: '#f97316',       // orange
  renewal: '#a855f7',        // purple
  task: '#3b82f6',           // blue
  meeting: '#22c55e',        // green
  call: '#eab308',           // yellow
  reminder: '#9ca3af',       // gray
  appointment: '#ec4899',    // pink
};

export function useCalendarEvents(startDate: Date, endDate: Date, filters: EventFilters) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['calendar-events', startDate.toISOString(), endDate.toISOString(), filters, currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { items: [], stats: null };
      
      const events: CalendarEvent[] = [];
      
      // 1. Cargar plazos (matter_deadlines)
      if (filters.showDeadlines || filters.showDeadlinesFatal || filters.showRenewals) {
        const { data: deadlines, error: deadlinesError } = await supabase
          .from('matter_deadlines')
          .select(`
            id,
            title,
            description,
            deadline_date,
            priority,
            deadline_type,
            status,
            matter_id,
            matters!inner(
              id,
              reference,
              title,
              account_id,
              crm_accounts(id, name)
            )
          `)
          .gte('deadline_date', startDate.toISOString())
          .lte('deadline_date', endDate.toISOString())
          .eq('status', 'pending');
        
        if (!deadlinesError && deadlines) {
          deadlines.forEach((d: any) => {
            // Determinar tipo
            let type: CalendarEvent['type'] = 'deadline';
            let color = EVENT_COLORS.deadline;
            
            if (d.priority === 'fatal') {
              if (!filters.showDeadlinesFatal) return;
              type = 'deadline_fatal';
              color = EVENT_COLORS.deadline_fatal;
            } else if (d.deadline_type === 'renewal') {
              if (!filters.showRenewals) return;
              type = 'renewal';
              color = EVENT_COLORS.renewal;
            } else {
              if (!filters.showDeadlines) return;
            }
            
            const dueDate = new Date(d.deadline_date);
            
            events.push({
              id: `deadline-${d.id}`,
              title: d.priority === 'fatal' ? `⚠️ ${d.title}` : d.title,
              start: dueDate,
              end: dueDate,
              type,
              color,
              matter: d.matters ? {
                id: d.matters.id,
                reference: d.matters.reference,
                title: d.matters.title,
              } : undefined,
              account: d.matters?.crm_accounts ? {
                id: d.matters.crm_accounts.id,
                name: d.matters.crm_accounts.name,
              } : undefined,
              allDay: true,
              description: d.description,
              source_table: 'matter_deadlines',
              source_id: d.id,
            });
          });
        }
      }
      
      // 2. Cargar actividades (activities)
      if (filters.showTasks || filters.showMeetings || filters.showCalls || filters.showReminders) {
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select(`
            id,
            type,
            subject,
            content,
            due_date,
            meeting_start,
            meeting_end,
            is_completed,
            created_by,
            matter_id,
            contact_id
          `)
          .eq('organization_id', currentOrganization.id)
          .gte('due_date', startDate.toISOString())
          .lte('due_date', endDate.toISOString())
          .neq('is_completed', true);
        
        if (!activitiesError && activities) {
          for (const a of activities) {
            let type: CalendarEvent['type'];
            let color: string;
            let include = false;
            
            switch (a.type) {
              case 'task':
                if (!filters.showTasks) continue;
                type = 'task';
                color = EVENT_COLORS.task;
                include = true;
                break;
              case 'meeting':
                if (!filters.showMeetings) continue;
                type = 'meeting';
                color = EVENT_COLORS.meeting;
                include = true;
                break;
              case 'call':
                if (!filters.showCalls) continue;
                type = 'call';
                color = EVENT_COLORS.call;
                include = true;
                break;
              case 'reminder':
                if (!filters.showReminders) continue;
                type = 'reminder';
                color = EVENT_COLORS.reminder;
                include = true;
                break;
              default:
                continue;
            }
            
            if (!include) continue;
            
            // Filtro "solo mis eventos"
            if (filters.showOnlyMine && a.created_by !== user?.id) continue;
            
            const startTime = a.meeting_start ? new Date(a.meeting_start) : new Date(a.due_date);
            const endTime = a.meeting_end ? new Date(a.meeting_end) : startTime;
            
            events.push({
              id: `activity-${a.id}`,
              title: a.subject || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
              start: startTime,
              end: endTime,
              type,
              color,
              allDay: !a.meeting_start,
              description: a.content,
              source_table: 'activities',
              source_id: a.id,
            });
          }
        }
      }
      
      // Calcular stats
      const stats: EventStats = {
        deadlinesFatal: events.filter(e => e.type === 'deadline_fatal').length,
        deadlines: events.filter(e => e.type === 'deadline').length,
        renewals: events.filter(e => e.type === 'renewal').length,
        tasks: events.filter(e => e.type === 'task').length,
        meetings: events.filter(e => e.type === 'meeting').length,
        calls: events.filter(e => e.type === 'call').length,
        reminders: events.filter(e => e.type === 'reminder').length,
      };
      
      return { items: events, stats };
    },
    enabled: !!currentOrganization?.id,
  });
}
