// ============================================
// src/hooks/legal-ops/useClientTimeline.ts
// ============================================

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { CommChannel } from '@/types/legal-ops';

export interface TimelineFilters {
  channels?: CommChannel[];
  date_from?: string;
  date_to?: string;
  matter_id?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'communication' | 'document' | 'deadline' | 'matter' | 'invoice' | 'note';
  timestamp: string;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  cluster_id?: string;
  cluster_label?: string;
}

export interface TimelineCluster {
  id: string;
  label: string;
  events: TimelineEvent[];
  date_range: { start: string; end: string };
  status: 'active' | 'resolved';
}

const PAGE_SIZE = 30;

export function useClientTimeline(
  clientId: string,
  filters: TimelineFilters = {}
) {
  const organizationId = useOrganizationId();

  return useInfiniteQuery({
    queryKey: ['client-timeline', clientId, filters],
    queryFn: async ({ pageParam = 0 }) => {
      if (!organizationId) throw new Error('No organization');

      // Obtener comunicaciones
      let commQuery = supabase
        .from('communications')
        .select(`
          id, channel, direction, subject, body_preview, received_at,
          ai_category, is_read, attachments
        `)
        .eq('client_id', clientId)
        .eq('organization_id', organizationId)
        .order('received_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (filters.channels?.length) {
        commQuery = commQuery.in('channel', filters.channels);
      }
      if (filters.date_from) {
        commQuery = commQuery.gte('received_at', filters.date_from);
      }
      if (filters.date_to) {
        commQuery = commQuery.lte('received_at', filters.date_to);
      }
      if (filters.matter_id) {
        commQuery = commQuery.eq('matter_id', filters.matter_id);
      }

      const { data: comms } = await commQuery;

      // Obtener documentos del período
      let docsQuery = supabase
        .from('client_documents')
        .select('id, file_name, title, doc_type, created_at, validity_status')
        .eq('client_id', clientId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (filters.date_from) {
        docsQuery = docsQuery.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        docsQuery = docsQuery.lte('created_at', filters.date_to);
      }

      const { data: docs } = await docsQuery;

      // Deadlines placeholder (tabla no existe aún)
      const deadlines: Array<{ id: string; title: string; due_date: string; status: string; matter_id: string }> = [];

      // Convertir a eventos de timeline
      const events: TimelineEvent[] = [];

      // Comunicaciones
      (comms || []).forEach(c => {
        events.push({
          id: `comm-${c.id}`,
          type: 'communication',
          timestamp: c.received_at,
          title: c.subject || `${c.channel} ${c.direction === 'inbound' ? 'recibido' : 'enviado'}`,
          description: c.body_preview || undefined,
          metadata: {
            channel: c.channel,
            direction: c.direction,
            category: c.ai_category,
            is_read: c.is_read,
            has_attachments: Array.isArray(c.attachments) && c.attachments.length > 0,
            has_transcription: false
          }
        });
      });

      // Documentos
      (docs || []).forEach(d => {
        events.push({
          id: `doc-${d.id}`,
          type: 'document',
          timestamp: d.created_at,
          title: d.title || d.file_name,
          metadata: {
            doc_type: d.doc_type,
            validity_status: d.validity_status
          }
        });
      });

      // Deadlines
      (deadlines || []).forEach(d => {
        events.push({
          id: `deadline-${d.id}`,
          type: 'deadline',
          timestamp: d.due_date,
          title: d.title,
          metadata: {
            status: d.status,
            matter_id: d.matter_id
          }
        });
      });

      // Ordenar por timestamp
      events.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        events: events.slice(0, PAGE_SIZE),
        nextCursor: events.length >= PAGE_SIZE ? pageParam + PAGE_SIZE : undefined
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: !!clientId && !!organizationId
  });
}
