// ============================================================
// IP-NEXUS - PHASE DATA HOOK
// PROMPT 21: Hook para gestión de datos de fase
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface PhaseData {
  id: string;
  matter_id: string;
  organization_id: string;
  phase_code: string;
  data: Record<string, unknown>;
  checklist: Record<string, boolean>;
  is_complete: boolean;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
}

// F1 Analysis specific data
export interface PhaseF1Data {
  search_performed?: boolean;
  search_date?: string;
  search_databases?: string[];
  search_results?: {
    total_found: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  risk_level?: 'low' | 'medium' | 'high';
  distinctiveness_score?: number;
  class_availability?: Array<{
    class_number: number;
    status: 'available' | 'conflict' | 'partial';
    notes?: string;
  }>;
  recommendation?: 'proceed' | 'proceed_with_changes' | 'not_recommended';
  recommendation_notes?: string;
  report_generated?: boolean;
  report_sent?: boolean;
  internal_notes?: string;
}

// F2 Quote specific data
export interface PhaseF2Data {
  template_used?: string;
  quote_number?: string;
  line_items?: Array<{
    id: string;
    category: 'official_fees' | 'professional_fees' | 'other';
    concept: string;
    quantity: number;
    unit_price: number;
    total: number;
    taxable: boolean;
  }>;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  validity_days?: number;
  payment_method?: string;
  payment_terms?: string;
  additional_notes?: string;
  quote_generated?: boolean;
  quote_sent?: boolean;
  quote_sent_date?: string;
  skipped?: boolean;
  skip_reason?: string;
}

// F3 Contracting specific data
export interface PhaseF3Data {
  engagement_document_id?: string;
  engagement_template_used?: string;
  engagement_generated_date?: string;
  signature_method?: 'advanced' | 'simple_otp' | 'manual' | 'payment';
  signature_status?: 'pending' | 'sent' | 'viewed' | 'signed' | 'rejected';
  signature_sent_date?: string;
  signature_completed_date?: string;
  alternative_confirmation?: boolean;
  confirmation_type?: 'email' | 'whatsapp' | 'call' | 'payment';
  confirmation_evidence_url?: string;
  confirmation_date?: string;
  confirmation_notes?: string;
  advance_required?: boolean;
  advance_amount?: number;
  advance_paid?: boolean;
  advance_payment_date?: string;
  advance_payment_reference?: string;
}

// F4 Preparation specific data
export interface PhaseF4Data {
  documents_checklist?: Array<{
    document_type: string;
    required: boolean;
    status: 'pending' | 'uploaded' | 'generated' | 'verified';
    file_url?: string;
    notes?: string;
  }>;
  applicant_verified?: boolean;
  applicant_data?: Record<string, string>;
  mark_type?: 'word' | 'figurative' | 'combined' | '3d' | 'sound' | 'other';
  mark_image_url?: string;
  mark_description?: string;
  mark_colors?: string[];
  goods_services_final?: Array<{
    class_number: number;
    terms: string[];
  }>;
  priority_claimed?: boolean;
  priority_application_number?: string;
  priority_date?: string;
  priority_country?: string;
  application_draft_generated?: boolean;
  application_draft_url?: string;
  application_validated?: boolean;
}

// F5 Filing specific data
export interface PhaseF5Data {
  filing_method?: 'electronic' | 'in_person';
  application_number?: string;
  filing_date?: string;
  filing_time?: string;
  receipt_url?: string;
  client_notified?: boolean;
  client_notified_date?: string;
  deadlines_created?: boolean;
}

// F6 Examination specific data
export interface PhaseF6Data {
  examination_status?: 'pending' | 'in_progress' | 'completed' | 'objection';
  notifications?: Array<{
    date: string;
    type: string;
    description: string;
    document_url?: string;
  }>;
  objections?: Array<{
    id: string;
    date: string;
    type: string;
    deadline: string;
    response_date?: string;
    status: 'pending' | 'responded' | 'resolved';
  }>;
}

// F7 Publication specific data
export interface PhaseF7Data {
  publication_number?: string;
  publication_date?: string;
  publication_url?: string;
  opposition_period_start?: string;
  opposition_period_end?: string;
  oppositions?: Array<{
    id: string;
    opponent_name: string;
    filing_date: string;
    status: 'pending' | 'in_progress' | 'resolved';
  }>;
  client_notified?: boolean;
}

// F8 Grant specific data
export interface PhaseF8Data {
  grant_status?: 'granted' | 'partially_granted' | 'refused';
  registration_number?: string;
  grant_date?: string;
  expiry_date?: string;
  certificate_url?: string;
  client_notified?: boolean;
  final_invoice_generated?: boolean;
  final_invoice_id?: string;
}

// F9 Maintenance specific data
export interface PhaseF9Data {
  status?: 'active' | 'expired' | 'cancelled' | 'transferred';
  next_renewal_date?: string;
  mandatory_use_date?: string;
  actions?: Array<{
    id: string;
    type: 'renewal' | 'modification' | 'transfer' | 'license' | 'cancellation';
    date: string;
    description: string;
    status: 'pending' | 'completed';
  }>;
}

// Hook to get phase data
export function usePhaseData(matterId: string, phaseCode: string) {
  return useQuery({
    queryKey: ['phase-data', matterId, phaseCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matter_phase_data')
        .select('*')
        .eq('matter_id', matterId)
        .eq('phase_code', phaseCode)
        .maybeSingle();

      if (error) throw error;
      return data as PhaseData | null;
    },
    enabled: !!matterId && !!phaseCode,
  });
}

// Hook to get or create phase data
export function useGetOrCreatePhaseData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matterId, phaseCode }: { matterId: string; phaseCode: string }) => {
      const { data, error } = await supabase.rpc('get_or_create_phase_data', {
        p_matter_id: matterId,
        p_phase_code: phaseCode,
      });

      if (error) throw error;
      return data as PhaseData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phase-data', variables.matterId, variables.phaseCode] });
    },
  });
}

// Hook to update phase data
export function useUpdatePhaseData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matterId,
      phaseCode,
      data,
      checklist,
    }: {
      matterId: string;
      phaseCode: string;
      data: Record<string, unknown>;
      checklist?: Record<string, boolean>;
    }) => {
      const { data: result, error } = await supabase.rpc('update_phase_data', {
        p_matter_id: matterId,
        p_phase_code: phaseCode,
        p_data: data as unknown as Record<string, never>,
        p_checklist: (checklist || null) as unknown as Record<string, never>,
      });

      if (error) throw error;
      return result as PhaseData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phase-data', variables.matterId, variables.phaseCode] });
      toast.success('Datos guardados');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Hook to complete a phase
export function useCompletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matterId, phaseCode }: { matterId: string; phaseCode: string }) => {
      const { data, error } = await supabase.rpc('complete_phase', {
        p_matter_id: matterId,
        p_phase_code: phaseCode,
      });

      if (error) throw error;
      return data as PhaseData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phase-data', variables.matterId, variables.phaseCode] });
      toast.success('Fase completada');
    },
  });
}

// Default checklists per phase
export const PHASE_CHECKLISTS: Record<string, Record<string, string>> = {
  F1: {
    search_done: 'Búsqueda de anterioridades realizada',
    report_generated: 'Informe de viabilidad generado',
    risks_documented: 'Riesgos identificados y documentados',
    recommendation_prepared: 'Recomendación al cliente preparada',
  },
  F2: {
    quote_created: 'Presupuesto creado',
    quote_reviewed: 'Presupuesto revisado',
    quote_sent: 'Presupuesto enviado al cliente',
  },
  F3: {
    engagement_generated: 'Documento de encargo generado',
    signature_requested: 'Firma solicitada',
    signature_completed: 'Firma completada',
    advance_received: 'Anticipo recibido (si aplica)',
  },
  F4: {
    documents_complete: 'Documentos completos',
    applicant_verified: 'Datos del solicitante verificados',
    mark_prepared: 'Representación de marca preparada',
    application_validated: 'Solicitud validada',
  },
  F5: {
    application_filed: 'Solicitud presentada',
    receipt_saved: 'Acuse de recibo guardado',
    client_notified: 'Cliente notificado',
    deadlines_set: 'Plazos configurados',
  },
  F6: {
    status_monitored: 'Estado monitoreado',
    objections_handled: 'Objeciones gestionadas',
  },
  F7: {
    publication_recorded: 'Publicación registrada',
    opposition_monitored: 'Período de oposición monitoreado',
    client_notified: 'Cliente notificado',
  },
  F8: {
    grant_recorded: 'Concesión registrada',
    certificate_saved: 'Certificado guardado',
    client_notified: 'Cliente notificado',
    final_invoice_sent: 'Factura final enviada',
  },
  F9: {
    renewal_scheduled: 'Renovación programada',
    status_active: 'Estado vigente',
  },
};
