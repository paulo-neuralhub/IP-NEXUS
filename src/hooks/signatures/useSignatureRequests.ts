/**
 * Hooks para gestión de solicitudes de firma
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Signer {
  id: string;
  email: string;
  name: string;
  role: 'signer' | 'approver' | 'cc';
  order: number;
  sign_token: string;
  viewed_at: string | null;
  signed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  signature_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface SignatureRequest {
  id: string;
  organization_id: string;
  document_id: string | null;
  document_name: string;
  document_url: string;
  document_hash: string | null;
  matter_id: string | null;
  contact_id: string | null;
  signature_type: 'simple' | 'advanced' | 'qualified';
  provider: 'internal' | 'docusign' | 'adobe_sign';
  signers: Signer[];
  email_subject: string | null;
  email_message: string | null;
  status: 'draft' | 'sent' | 'viewed' | 'partially_signed' | 'completed' | 'declined' | 'expired' | 'voided';
  sent_at: string | null;
  expires_at: string | null;
  completed_at: string | null;
  voided_at: string | null;
  voided_reason: string | null;
  signed_document_url: string | null;
  reminder_sent_count: number;
  last_reminder_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  matter?: {
    id: string;
    reference: string;
    title: string;
  } | null;
  contact?: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  created_by_user?: {
    full_name: string;
  } | null;
}

// Hook para obtener todas las solicitudes de firma
export function useSignatureRequests(options?: {
  status?: string;
  matterId?: string;
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['signature-requests', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('signature_requests')
        .select(`
          *,
          matter:matters(id, reference, title),
          contact:contacts(id, name, email),
          created_by_user:users!created_by(full_name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        if (options.status === 'pending') {
          query = query.in('status', ['sent', 'viewed', 'partially_signed']);
        } else {
          query = query.eq('status', options.status);
        }
      }

      if (options?.matterId) {
        query = query.eq('matter_id', options.matterId);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        signers: (item.signers as unknown as Signer[]) || []
      })) as SignatureRequest[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook para obtener una solicitud específica
export function useSignatureRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['signature-request', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('signature_requests')
        .select(`
          *,
          matter:matters(id, reference, title),
          contact:contacts(id, name, email),
          created_by_user:users!created_by(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        signers: (data.signers as unknown as Signer[]) || []
      } as SignatureRequest;
    },
    enabled: !!id,
  });
}

// Hook para obtener estadísticas de firmas
export function useSignatureStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['signature-stats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;

      const { data, error } = await supabase
        .from('signature_requests')
        .select('status')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const stats = {
        pending: 0,
        completed: 0,
        declined: 0,
        expired: 0,
        voided: 0,
        total: data.length,
      };

      data.forEach(item => {
        if (['sent', 'viewed', 'partially_signed'].includes(item.status)) {
          stats.pending++;
        } else if (item.status === 'completed') {
          stats.completed++;
        } else if (item.status === 'declined') {
          stats.declined++;
        } else if (item.status === 'expired') {
          stats.expired++;
        } else if (item.status === 'voided') {
          stats.voided++;
        }
      });

      return stats;
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook para obtener el audit log de una solicitud
export function useSignatureAuditLog(requestId: string | undefined) {
  return useQuery({
    queryKey: ['signature-audit-log', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('signature_audit_log')
        .select('*')
        .eq('signature_request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });
}

// Hook para crear solicitud de firma
export function useCreateSignatureRequest() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      documentId?: string;
      documentName: string;
      documentUrl: string;
      matterId?: string;
      contactId?: string;
      signers: Array<{ email: string; name: string; role: 'signer' | 'approver' | 'cc' }>;
      emailSubject?: string;
      emailMessage?: string;
      expiresInDays: number;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Generar tokens únicos para cada firmante
      const signersWithTokens: Signer[] = data.signers.map((signer, index) => ({
        id: crypto.randomUUID(),
        email: signer.email,
        name: signer.name,
        role: signer.role,
        order: index + 1,
        sign_token: crypto.randomUUID(),
        viewed_at: null,
        signed_at: null,
        declined_at: null,
        decline_reason: null,
        signature_data: null,
        ip_address: null,
        user_agent: null,
      }));

      const { data: { user } } = await supabase.auth.getUser();

      const { data: result, error } = await supabase
        .from('signature_requests')
        .insert({
          organization_id: currentOrganization.id,
          document_id: data.documentId || null,
          document_name: data.documentName,
          document_url: data.documentUrl,
          matter_id: data.matterId || null,
          contact_id: data.contactId || null,
          signers: signersWithTokens as unknown as Json,
          email_subject: data.emailSubject || `Documento pendiente de firma: ${data.documentName}`,
          email_message: data.emailMessage || null,
          status: 'sent',
          sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Registrar en audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: result.id,
        action: 'sent',
        actor_type: 'staff',
        actor_email: user?.email,
        details: { recipients: data.signers.map(s => s.email) } as unknown as Json,
      });

      // TODO: Enviar emails cuando esté configurado RESEND_API_KEY
      console.log('📧 [DEV] Simulating email send to:', data.signers.map(s => s.email));
      console.log('📧 [DEV] Sign URLs would be:', signersWithTokens.map(s => `/sign/${s.sign_token}`));

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-requests'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      toast.success('Solicitud de firma enviada');
    },
    onError: (error) => {
      console.error('Error creating signature request:', error);
      toast.error('Error al crear la solicitud de firma');
    },
  });
}

// Hook para anular solicitud
export function useVoidSignatureRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('signature_requests')
        .update({
          status: 'voided',
          voided_at: new Date().toISOString(),
          voided_reason: reason || null,
        })
        .eq('id', id);

      if (error) throw error;

      // Audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: id,
        action: 'voided',
        actor_type: 'staff',
        actor_email: user?.email,
        details: { reason } as unknown as Json,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-requests'] });
      queryClient.invalidateQueries({ queryKey: ['signature-stats'] });
      toast.success('Solicitud anulada');
    },
    onError: () => {
      toast.error('Error al anular la solicitud');
    },
  });
}

// Hook para enviar recordatorio
export function useSendReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current count
      const { data: current } = await supabase
        .from('signature_requests')
        .select('reminder_sent_count')
        .eq('id', requestId)
        .single();

      // Actualizar contador de recordatorios
      const { error } = await supabase
        .from('signature_requests')
        .update({
          reminder_sent_count: (current?.reminder_sent_count || 0) + 1,
          last_reminder_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Audit log
      await supabase.from('signature_audit_log').insert({
        signature_request_id: requestId,
        action: 'reminder_sent',
        actor_type: 'staff',
        actor_email: user?.email,
      });

      // TODO: Enviar email de recordatorio
      console.log('📧 [DEV] Simulating reminder email for request:', requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-requests'] });
      toast.success('Recordatorio enviado');
    },
    onError: () => {
      toast.error('Error al enviar recordatorio');
    },
  });
}
