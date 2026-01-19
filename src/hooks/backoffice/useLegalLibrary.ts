// src/hooks/backoffice/useLegalLibrary.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  LegalDocument, 
  TreatyStatusRecord, 
  OfficialForm, 
  LegalChangeAlert,
  IngestionJob,
  DocumentLevel
} from '@/types/legal-library.types';

// ============================================
// LEGAL DOCUMENTS
// ============================================

export function useLegalDocuments(
  officeId: string,
  options?: {
    level?: DocumentLevel;
    search?: string;
    status?: string;
  }
) {
  return useQuery({
    queryKey: ['legal-documents', officeId, options],
    queryFn: async () => {
      let query = (supabase
        .from('ipo_legal_documents' as any)
        .select('*')
        .eq('office_id', officeId)
        .order('effective_date', { ascending: false }) as any);

      if (options?.level) {
        query = query.eq('document_level', options.level);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,title_english.ilike.%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LegalDocument[];
    },
    enabled: !!officeId,
  });
}

export function useLegalDocument(documentId?: string) {
  return useQuery({
    queryKey: ['legal-document', documentId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ipo_legal_documents' as any)
        .select(`
          *,
          versions:ipo_legal_document_versions(*),
          articles:ipo_legal_articles(*)
        `)
        .eq('id', documentId)
        .single() as any);

      if (error) throw error;
      return data as LegalDocument & {
        versions: any[];
        articles: any[];
      };
    },
    enabled: !!documentId,
  });
}

export function useCreateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: Partial<LegalDocument>) => {
      const { data, error } = await (supabase
        .from('ipo_legal_documents' as any)
        .insert(doc)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', variables.office_id] });
      toast.success('Documento legal creado');
    },
    onError: (error: Error) => {
      toast.error('Error al crear documento: ' + error.message);
    },
  });
}

export function useUpdateLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LegalDocument> & { id: string }) => {
      const { data, error } = await (supabase
        .from('ipo_legal_documents' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', data.office_id] });
      queryClient.invalidateQueries({ queryKey: ['legal-document', data.id] });
      toast.success('Documento actualizado');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

// ============================================
// TREATY STATUS
// ============================================

export function useTreatyStatus(officeId: string) {
  return useQuery({
    queryKey: ['treaty-status', officeId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ipo_treaty_status' as any)
        .select('*')
        .eq('office_id', officeId)
        .order('treaty_name') as any);

      if (error) throw error;
      return (data || []) as TreatyStatusRecord[];
    },
    enabled: !!officeId,
  });
}

export function useUpsertTreatyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (treaty: Partial<TreatyStatusRecord> & { office_id: string; treaty_code: string }) => {
      const { data, error } = await (supabase
        .from('ipo_treaty_status' as any)
        .upsert(treaty, { onConflict: 'office_id,treaty_code' })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treaty-status', variables.office_id] });
      toast.success('Estado de tratado actualizado');
    },
  });
}

// ============================================
// OFFICIAL FORMS
// ============================================

export function useOfficialForms(officeId: string) {
  return useQuery({
    queryKey: ['official-forms', officeId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ipo_official_forms' as any)
        .select('*')
        .eq('office_id', officeId)
        .eq('status', 'active')
        .order('form_type') as any);

      if (error) throw error;
      return (data || []) as OfficialForm[];
    },
    enabled: !!officeId,
  });
}

// ============================================
// CHANGE ALERTS
// ============================================

export function useLegalChangeAlerts(officeId: string, status?: string) {
  return useQuery({
    queryKey: ['legal-alerts', officeId, status],
    queryFn: async () => {
      let query = (supabase
        .from('ipo_legal_change_alerts' as any)
        .select('*')
        .eq('office_id', officeId)
        .order('detected_at', { ascending: false })
        .limit(20) as any);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LegalChangeAlert[];
    },
    enabled: !!officeId,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, userId }: { alertId: string; userId: string }) => {
      const { error } = await (supabase
        .from('ipo_legal_change_alerts' as any)
        .update({
          status: 'acknowledged',
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-alerts'] });
      toast.success('Alerta reconocida');
    },
  });
}

// ============================================
// INGESTION JOBS
// ============================================

export function useIngestionJobs(officeId: string) {
  return useQuery({
    queryKey: ['ingestion-jobs', officeId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ipo_legal_ingestion_jobs' as any)
        .select('*')
        .eq('office_id', officeId)
        .order('created_at', { ascending: false })
        .limit(20) as any);

      if (error) throw error;
      return (data || []) as IngestionJob[];
    },
    enabled: !!officeId,
  });
}

// ============================================
// SYNC ACTIONS
// ============================================

export function useSyncWIPO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (officeId: string) => {
      const { data, error } = await supabase.functions.invoke('legal-sync-wipo', {
        body: { officeId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, officeId) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', officeId] });
      queryClient.invalidateQueries({ queryKey: ['ingestion-jobs', officeId] });
      toast.success(`Sincronización WIPO: ${data?.imported || 0} documentos importados`);
    },
    onError: (error: Error) => {
      toast.error('Error sincronizando con WIPO: ' + error.message);
    },
  });
}

export function useRunCrawler() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (officeId: string) => {
      const { data, error } = await supabase.functions.invoke('legal-run-crawler', {
        body: { officeId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, officeId) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', officeId] });
      queryClient.invalidateQueries({ queryKey: ['legal-alerts', officeId] });
      
      if (data?.changed > 0) {
        toast.warning(`¡Detectados ${data.changed} cambios normativos!`);
      } else {
        toast.success('No hay cambios detectados');
      }
    },
    onError: (error: Error) => {
      toast.error('Error ejecutando crawler: ' + error.message);
    },
  });
}

export function useUploadLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ officeId, file }: { officeId: string; file: File }) => {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('legal-upload-document', {
        body: { 
          officeId, 
          fileName: file.name,
          mimeType: file.type,
          content: base64,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', variables.officeId] });
      toast.success('Documento subido y procesado');
    },
    onError: (error: Error) => {
      toast.error('Error subiendo documento: ' + error.message);
    },
  });
}

// ============================================
// LIBRARY STATS
// ============================================

export function useLegalLibraryStats(officeId: string) {
  return useQuery({
    queryKey: ['legal-library-stats', officeId],
    queryFn: async () => {
      const [documents, alerts, treaties] = await Promise.all([
        (supabase
          .from('ipo_legal_documents' as any)
          .select('document_level, status', { count: 'exact' })
          .eq('office_id', officeId) as any),
        (supabase
          .from('ipo_legal_change_alerts' as any)
          .select('impact_level', { count: 'exact' })
          .eq('office_id', officeId)
          .eq('status', 'active') as any),
        (supabase
          .from('ipo_treaty_status' as any)
          .select('status', { count: 'exact' })
          .eq('office_id', officeId)
          .eq('status', 'member') as any),
      ]);

      const docsByLevel = {
        primary: 0,
        secondary: 0,
        operational: 0,
      };

      (documents.data || []).forEach((d: any) => {
        if (d.document_level in docsByLevel) {
          docsByLevel[d.document_level as keyof typeof docsByLevel]++;
        }
      });

      return {
        totalDocuments: documents.count || 0,
        byLevel: docsByLevel,
        activeAlerts: alerts.count || 0,
        treatiesMember: treaties.count || 0,
      };
    },
    enabled: !!officeId,
  });
}
