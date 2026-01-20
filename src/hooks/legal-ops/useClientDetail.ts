// ============================================
// src/hooks/legal-ops/useClientDetail.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganizationId } from '@/hooks/useOrganizationId';

interface ClientDetailData {
  client: ClientFull;
  stats: {
    activeMatters: number;
    totalMatters: number;
    unreadMessages: number;
    upcomingDeadlines: number;
    documentAlerts: number;
    totalDocuments: number;
    lastActivity: string | null;
  };
  alerts: ClientAlert[];
  criticalDocuments: ClientDocumentWithValidity[];
}

interface ClientFull {
  id: string;
  name: string;
  display_name?: string;
  company_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address_line1?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at?: string;
  tags?: string[];
  notes?: string;
  assigned_to?: string;
  lifecycle_stage?: string;
  responsible_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ClientAlert {
  id: string;
  type: 'deadline' | 'document_expiry' | 'pending_response' | 'document_awaiting';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  due_date?: string;
  days_remaining?: number;
  reference_type?: string;
  reference_id?: string;
  action_url?: string;
}

export interface ClientDocumentWithValidity {
  id: string;
  title: string;
  doc_type: string;
  validity_status: 'valid' | 'expiring_soon' | 'expired' | 'pending_verification' | 'revoked';
  valid_until?: string;
  days_remaining?: number | null;
  verified: boolean;
}

export function useClientDetail(clientId: string) {
  const organizationId = useOrganizationId();

  return useQuery({
    queryKey: ['client-detail', clientId],
    queryFn: async (): Promise<ClientDetailData> => {
      if (!organizationId) throw new Error('No organization');
      
      // 1. Datos del cliente
      const { data: client, error: clientError } = await supabase
        .from('contacts')
        .select(`
          *,
          responsible_user:users!contacts_assigned_to_fkey(id, full_name, avatar_url)
        `)
        .eq('id', clientId)
        .eq('organization_id', organizationId)
        .single();

      if (clientError) throw clientError;

      // 2. Estadísticas (en paralelo)
      const [mattersRes, commsRes, docsRes] = await Promise.all([
        // Asuntos
        supabase
          .from('matters')
          .select('id, status', { count: 'exact' })
          .eq('client_id', clientId)
          .eq('organization_id', organizationId),
        
        // Comunicaciones sin leer
        supabase
          .from('communications')
          .select('id', { count: 'exact' })
          .eq('client_id', clientId)
          .eq('is_read', false)
          .eq('organization_id', organizationId),
        
        // Documentos y alertas de vigencia
        supabase
          .from('client_documents')
          .select(`
            *,
            validity_alerts:document_validity_alerts(*)
          `)
          .eq('client_id', clientId)
          .eq('organization_id', organizationId)
          .is('deleted_at', null)
      ]);

      const matters = mattersRes.data || [];
      const docs = docsRes.data || [];
      const deadlines: Array<{ id: string; title: string; due_date: string }> = [];

      // 3. Construir alertas factuales
      const alerts: ClientAlert[] = [];

      // Alertas de deadlines
      deadlines.forEach(d => {
        const daysRemaining = Math.ceil(
          (new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        alerts.push({
          id: `deadline-${d.id}`,
          type: 'deadline',
          severity: daysRemaining <= 7 ? 'high' : daysRemaining <= 14 ? 'medium' : 'low',
          title: d.title,
          description: `Vence en ${daysRemaining} días`,
          due_date: d.due_date,
          days_remaining: daysRemaining,
          reference_type: 'deadline',
          reference_id: d.id
        });
      });

      // Alertas de documentos por caducar
      docs.forEach(doc => {
        if (doc.validity_status === 'expiring_soon' && doc.valid_until) {
          const daysRemaining = Math.ceil(
            (new Date(doc.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          alerts.push({
            id: `doc-expiry-${doc.id}`,
            type: 'document_expiry',
            severity: daysRemaining <= 30 ? 'high' : 'medium',
            title: `${doc.title || doc.file_name} caduca pronto`,
            description: `Caduca en ${daysRemaining} días`,
            due_date: doc.valid_until,
            days_remaining: daysRemaining,
            reference_type: 'document',
            reference_id: doc.id
          });
        }
      });

      // Ordenar alertas por severidad y fecha
      alerts.sort((a, b) => {
        const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return (a.days_remaining || 999) - (b.days_remaining || 999);
      });

      // 4. Documentos críticos
      const criticalDocTypes = [
        'poder_general', 'poder_especial', 'escritura_constitucion', 'certificado_registro'
      ];
      const criticalDocuments: ClientDocumentWithValidity[] = docs
        .filter(d => d.doc_type && criticalDocTypes.includes(d.doc_type))
        .map(d => ({
          id: d.id,
          title: d.title || d.file_name,
          doc_type: d.doc_type || 'otro',
          validity_status: d.validity_status || 'pending_verification',
          valid_until: d.valid_until,
          days_remaining: d.valid_until 
            ? Math.ceil((new Date(d.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null,
          verified: d.validity_verified || false
        }));

      // 5. Última actividad
      const { data: lastComm } = await supabase
        .from('communications')
        .select('received_at')
        .eq('client_id', clientId)
        .order('received_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const responsibleUser = client.responsible_user as { id: string; full_name: string; avatar_url?: string } | null;

      return {
        client: {
          ...client,
          display_name: client.name || client.company_name,
          responsible_user: responsibleUser || undefined
        } as ClientFull,
        stats: {
          activeMatters: matters.filter(m => m.status === 'active').length,
          totalMatters: mattersRes.count || 0,
          unreadMessages: commsRes.count || 0,
          upcomingDeadlines: deadlines.length,
          documentAlerts: alerts.filter(a => a.type === 'document_expiry').length,
          totalDocuments: docs.length,
          lastActivity: lastComm?.received_at || null
        },
        alerts,
        criticalDocuments
      };
    },
    enabled: !!clientId && !!organizationId
  });
}

// Hook para actualizar cliente
export function useUpdateClient() {
  const queryClient = useQueryClient();
  const organizationId = useOrganizationId();

  return useMutation({
    mutationFn: async ({ clientId, updates }: { clientId: string; updates: Partial<ClientFull> }) => {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', clientId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client-detail', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });
}
