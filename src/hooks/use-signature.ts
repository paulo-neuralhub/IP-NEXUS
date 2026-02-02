// ============================================================
// IP-NEXUS - SIGNATURE HOOKS
// PROMPT 22: Sistema de firma electrónica
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Use database types
type SignatureRequestRow = Database['public']['Tables']['signature_requests']['Row'];
type SignaturePolicyRow = Database['public']['Tables']['signature_policies']['Row'];

// Types
export interface SignaturePolicy {
  policy_id: string | null;
  required_level: 'standard' | 'qualified' | 'manual';
  recommended_level: 'standard' | 'qualified' | 'manual';
  warning_message: string | null;
  info_message: string | null;
  requires_idv: boolean;
}

export interface SignatureSigner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'representative' | 'witness' | 'counterparty';
  order: number;
  auth_method?: 'email_otp' | 'sms_otp' | 'id_document';
  status?: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  signed_at?: string;
  ip_address?: string;
}

// Hook: Evaluar política de firma
export function useSignaturePolicy(
  documentType: string,
  jurisdiction?: string | null,
  officeCode?: string | null
) {
  return useQuery({
    queryKey: ['signature-policy', documentType, jurisdiction, officeCode],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('evaluate_signature_policy', {
        p_document_type: documentType,
        p_jurisdiction: jurisdiction || null,
        p_office_code: officeCode || null,
      });

      if (error) throw error;
      
      // Parse the JSONB response
      const result = data as unknown as SignaturePolicy;
      return result;
    },
    enabled: !!documentType,
  });
}

// Hook: Obtener configuración de firma de la organización
export function useOrganizationSignatureConfig() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['org-signature-config', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_signature_config')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      // Return default config if not exists
      return data || {
        standard_enabled: true,
        qualified_enabled: false,
        qualified_price_per_signature: 10.0,
        currency: 'EUR',
        default_expiration_days: 30,
        auto_send_reminders: true,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook: Obtener solicitudes de firma de un expediente
export function useMatterSignatureRequests(matterId: string) {
  return useQuery({
    queryKey: ['matter-signature-requests', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!matterId,
  });
}

// Tipos de documentos para selector
export const DOCUMENT_TYPES = [
  { value: 'encargo', label: 'Documento de encargo' },
  { value: 'presupuesto', label: 'Presupuesto' },
  { value: 'nda', label: 'Acuerdo de confidencialidad (NDA)' },
  { value: 'instrucciones', label: 'Instrucciones al cliente' },
  { value: 'autorizacion_pago', label: 'Autorización de pago' },
  { value: 'poder', label: 'Poder de representación' },
  { value: 'cesion', label: 'Cesión de derechos' },
  { value: 'licencia_exclusiva', label: 'Licencia exclusiva' },
  { value: 'licencia_no_exclusiva', label: 'Licencia no exclusiva' },
  { value: 'contrato_agente', label: 'Contrato con agente/corresponsal' },
  { value: 'coexistencia', label: 'Acuerdo de coexistencia' },
] as const;

// Roles de firmante
export const SIGNER_ROLES = [
  { value: 'client', label: 'Cliente' },
  { value: 'representative', label: 'Representante' },
  { value: 'witness', label: 'Testigo' },
  { value: 'counterparty', label: 'Contraparte' },
] as const;
