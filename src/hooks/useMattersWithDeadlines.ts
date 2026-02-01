// ============================================================
// IP-NEXUS - Matters with Deadlines Hook
// Fetches matters with their next deadline for urgency calculations
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { differenceInDays } from 'date-fns';

export interface MatterWithDeadline {
  id: string;
  organization_id: string;
  matter_number: string;
  reference: string | null;
  title: string;
  matter_type: string;
  status: string;
  current_phase: string | null;
  client_id: string | null;
  client_name: string | null;
  jurisdiction_code: string | null;
  application_number: string | null;
  registration_number: string | null;
  mark_name: string | null;
  mark_type: string | null;
  is_urgent: boolean;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  // Deadline info
  next_deadline: {
    id: string;
    title: string;
    due_date: string;
    deadline_type: string;
    priority: string | null;
  } | null;
  // Computed urgency
  urgency_level: 'overdue' | 'today' | 'week' | 'month' | 'ok';
  days_until_deadline: number | null;
}

export interface MattersWithDeadlinesFilters {
  search?: string;
  matter_type?: string;
  status?: string;
  jurisdiction?: string;
  urgency?: 'overdue' | 'next7Days' | 'next30Days' | 'ok' | 'all';
  phase?: string;
}

export interface UrgencyStats {
  overdue: number;
  today: number;
  next7Days: number;
  next30Days: number;
  ok: number;
  total: number;
}

export function useMattersWithDeadlines(filters?: MattersWithDeadlinesFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['matters-with-deadlines', currentOrganization?.id, filters],
    queryFn: async () => {
      // Fetch matters with client info
      let query = supabase
        .from('matters')
        .select(`
          id,
          organization_id,
          reference,
          title,
          type,
          status,
          current_phase,
          client_id,
          jurisdiction,
          jurisdiction_code,
          application_number,
          registration_number,
          mark_name,
          mark_type,
          risk_score,
          created_at,
          updated_at,
          client:contacts!matters_client_id_fkey(id, name)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      // Apply search filter
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`title.ilike.${searchTerm},reference.ilike.${searchTerm},mark_name.ilike.${searchTerm},application_number.ilike.${searchTerm}`);
      }
      
      // Apply type filter
      if (filters?.matter_type && filters.matter_type !== 'all') {
        query = query.eq('type', filters.matter_type);
      }
      
      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply jurisdiction filter
      if (filters?.jurisdiction && filters.jurisdiction !== 'all') {
        query = query.or(`jurisdiction.eq.${filters.jurisdiction},jurisdiction_code.eq.${filters.jurisdiction}`);
      }
      
      // Apply phase filter
      if (filters?.phase && filters.phase !== 'all') {
        query = query.eq('current_phase', filters.phase);
      }
      
      const { data: matters, error: mattersError } = await query;
      if (mattersError) throw mattersError;
      
      if (!matters || matters.length === 0) {
        return [];
      }
      
      // Fetch next deadlines for all matters
      const matterIds = matters.map(m => m.id);
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('matter_deadlines')
        .select('id, matter_id, title, deadline_date, deadline_type, priority, status')
        .in('matter_id', matterIds)
        .neq('status', 'completed')
        .order('deadline_date', { ascending: true });
      
      if (deadlinesError) {
        console.warn('Error fetching deadlines:', deadlinesError);
      }
      
      // Group deadlines by matter_id, take the earliest one
      const nextDeadlineByMatter = new Map<string, typeof deadlines extends (infer T)[] ? T : never>();
      if (deadlines) {
        for (const deadline of deadlines) {
          if (!nextDeadlineByMatter.has(deadline.matter_id)) {
            nextDeadlineByMatter.set(deadline.matter_id, deadline);
          }
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Map matters with deadline info
      const mattersWithDeadlines: MatterWithDeadline[] = matters.map((m: any) => {
        const deadline = nextDeadlineByMatter.get(m.id);
        let urgencyLevel: MatterWithDeadline['urgency_level'] = 'ok';
        let daysUntil: number | null = null;
        
        if (deadline?.deadline_date) {
          const dueDate = new Date(deadline.deadline_date);
          dueDate.setHours(0, 0, 0, 0);
          daysUntil = differenceInDays(dueDate, today);
          
          if (daysUntil < 0) {
            urgencyLevel = 'overdue';
          } else if (daysUntil === 0) {
            urgencyLevel = 'today';
          } else if (daysUntil <= 7) {
            urgencyLevel = 'week';
          } else if (daysUntil <= 30) {
            urgencyLevel = 'month';
          } else {
            urgencyLevel = 'ok';
          }
        }
        
        return {
          id: m.id,
          organization_id: m.organization_id,
          matter_number: m.reference || m.id.substring(0, 8).toUpperCase(),
          reference: m.reference,
          title: m.title || m.mark_name || 'Sin título',
          matter_type: m.type || 'TM_NAT',
          status: m.status || 'active',
          current_phase: m.current_phase || 'F0',
          client_id: m.client_id,
          client_name: m.client?.name || null,
          jurisdiction_code: m.jurisdiction_code || m.jurisdiction || null,
          application_number: m.application_number,
          registration_number: m.registration_number,
          mark_name: m.mark_name,
          mark_type: m.mark_type,
          is_urgent: (m.risk_score && m.risk_score >= 80) || urgencyLevel === 'overdue' || urgencyLevel === 'today',
          is_starred: false,
          created_at: m.created_at,
          updated_at: m.updated_at,
          next_deadline: deadline ? {
            id: deadline.id,
            title: deadline.title,
            due_date: deadline.deadline_date,
            deadline_type: deadline.deadline_type || 'internal',
            priority: deadline.priority,
          } : null,
          urgency_level: urgencyLevel,
          days_until_deadline: daysUntil,
        };
      });
      
      // Filter by urgency if specified
      if (filters?.urgency && filters.urgency !== 'all') {
        return mattersWithDeadlines.filter(m => {
          switch (filters.urgency) {
            case 'overdue':
              return m.urgency_level === 'overdue' || m.urgency_level === 'today';
            case 'next7Days':
              return m.urgency_level === 'week';
            case 'next30Days':
              return m.urgency_level === 'month';
            case 'ok':
              return m.urgency_level === 'ok';
            default:
              return true;
          }
        });
      }
      
      return mattersWithDeadlines;
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to calculate urgency statistics
export function useUrgencyStats(matters: MatterWithDeadline[] | undefined): UrgencyStats {
  if (!matters) {
    return { overdue: 0, today: 0, next7Days: 0, next30Days: 0, ok: 0, total: 0 };
  }
  
  return matters.reduce((acc, m) => {
    acc.total++;
    switch (m.urgency_level) {
      case 'overdue':
        acc.overdue++;
        break;
      case 'today':
        acc.today++;
        acc.overdue++; // Count today as part of overdue for KPI
        break;
      case 'week':
        acc.next7Days++;
        break;
      case 'month':
        acc.next30Days++;
        break;
      case 'ok':
      default:
        acc.ok++;
        break;
    }
    return acc;
  }, { overdue: 0, today: 0, next7Days: 0, next30Days: 0, ok: 0, total: 0 });
}
