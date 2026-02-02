// ============================================
// src/hooks/legal-ops/useClientDetail.ts
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

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
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useQuery({
    queryKey: ['client-detail', clientId],
    queryFn: async (): Promise<ClientDetailData> => {
      if (!organizationId) throw new Error('No organization');

      // DEBUG logging removed for production
      
      // 1. Datos del cliente - buscar en crm_accounts (empresas), no en contacts
      const { data: client, error: clientError } = await supabase
        .from('crm_accounts')
        .select(`
          *,
          assigned_user:users!assigned_to(id, full_name, avatar_url)
        `)
        .eq('id', clientId)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (clientError) throw clientError;
      if (!client) throw new Error('Client not found');

      // 2. Estadísticas (en paralelo) - using match() to avoid deep type instantiation
      const mattersRes = await supabase
        .from('matters')
        .select('id, status', { count: 'exact' })
        .match({ client_id: clientId, organization_id: organizationId });
      
      const commsRes = await supabase
        .from('communications')
        .select('id', { count: 'exact' })
        .match({ client_id: clientId, is_read: false, organization_id: organizationId });
      
      const docsRes = await supabase
        .from('client_documents')
        .select(`
          *,
          validity_alerts:document_validity_alerts(*)
        `)
        .match({ client_id: clientId, organization_id: organizationId })
        .is('deleted_at', null);

      const matters = (mattersRes.data || []) as unknown[];
      const docs = (docsRes.data || []) as unknown[];
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
      (docs as Array<{ id: string; title?: string; file_name: string; validity_status?: string; valid_until?: string }>).forEach(doc => {
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
      type DocItem = { id: string; title?: string; file_name: string; doc_type?: string; validity_status?: string; valid_until?: string; validity_verified?: boolean };
      const criticalDocuments: ClientDocumentWithValidity[] = (docs as DocItem[])
        .filter(d => d.doc_type && criticalDocTypes.includes(d.doc_type))
        .map(d => ({
          id: d.id,
          title: d.title || d.file_name,
          doc_type: d.doc_type || 'otro',
          validity_status: (d.validity_status || 'pending_verification') as ClientDocumentWithValidity['validity_status'],
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

      // assigned_user puede venir como objeto o array (depende de PostgREST)
      const rawAssignedUser = (client as unknown as Record<string, unknown>).assigned_user;
      const assignedUser = Array.isArray(rawAssignedUser)
        ? (rawAssignedUser[0] as { id: string; full_name: string; avatar_url?: string } | undefined) ?? null
        : (rawAssignedUser as { id: string; full_name: string; avatar_url?: string } | null);
      
      // Cast to any to access all dynamic fields from crm_accounts
      const clientData = client as Record<string, unknown>;

      return {
        // Pass the entire client object so ClientGeneralTab has all fields
        client: {
          ...clientData,
          id: client.id,
          name: client.name || '',
          display_name: client.name || '',
          company_name: client.name,
          legal_name: (clientData.legal_name as string) || undefined,
          trade_name: (clientData.trade_name as string) || undefined,
          account_type: (clientData.account_type as string) || 'direct',
          tier: (clientData.tier as string) || undefined,
          status: (clientData.status as string) || 'active',
          tax_id: (clientData.tax_id as string) || undefined,
          tax_id_type: (clientData.tax_id_type as string) || 'CIF',
          tax_country: (clientData.tax_country as string) || 'ES',
          email: (clientData.email as string) || undefined,
          phone: (clientData.phone as string) || undefined,
          fax: (clientData.fax as string) || undefined,
          website: (clientData.website as string) || undefined,
          address_line1: (clientData.address_line1 as string) || undefined,
          address_line2: (clientData.address_line2 as string) || undefined,
          city: (clientData.city as string) || undefined,
          state_province: (clientData.state_province as string) || undefined,
          postal_code: (clientData.postal_code as string) || undefined,
          country: (clientData.country as string) || 'ES',
          industry: (clientData.industry as string) || undefined,
          agent_license_number: (clientData.agent_license_number as string) || undefined,
          agent_jurisdictions: (clientData.agent_jurisdictions as string[]) || undefined,
          notes: (clientData.notes as string) || (client.internal_notes as string) || undefined,
          tags: (clientData.tags as string[]) || undefined,
          // Billing fields (PROMPT 28)
          billing_email: (clientData.billing_email as string) || undefined,
          payment_terms: (clientData.payment_terms as number) || 30,
          credit_limit: (clientData.credit_limit as number) || undefined,
          currency: (clientData.currency as string) || 'EUR',
          created_at: client.created_at,
          responsible_user: assignedUser || undefined
        } as ClientFull,
        stats: {
          activeMatters: (matters as Array<{ status?: string }>).filter(m => m.status === 'active').length,
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
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  return useMutation({
    mutationFn: async ({ clientId, updates }: { clientId: string; updates: Partial<ClientFull> }) => {
      const { error } = await supabase
        .from('crm_accounts')
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
