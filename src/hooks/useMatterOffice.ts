import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OfficeStatus {
  hasOffice: boolean;
  officeCode?: string;
  officeName?: string;
  officeFlag?: string;
  applicationNumber?: string;
  registrationNumber?: string;
  status?: string;
  statusNormalized?: string;
  statusDate?: string;
  filingDate?: string;
  publicationDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  priorityDate?: string;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  nextSyncAt?: string;
  supportsAutoSync: boolean;
  metadata?: Record<string, unknown>;
}

export interface ManualUpdateData {
  status?: string;
  statusNormalized?: string;
  filingDate?: string;
  publicationDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  source?: string;
  notes?: string;
  recalculateDeadlines?: boolean;
}

export interface CheckResult {
  success: boolean;
  hasChanges: boolean;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  documentsDownloaded?: number;
  deadlinesCreated?: number;
  error?: string;
}

const OFFICE_INFO: Record<string, { name: string; flag: string; supportsAutoSync: boolean }> = {
  'ES': { name: 'OEPM', flag: '🇪🇸', supportsAutoSync: true },
  'EUIPO': { name: 'EUIPO', flag: '🇪🇺', supportsAutoSync: true },
  'USPTO': { name: 'USPTO', flag: '🇺🇸', supportsAutoSync: true },
  'WIPO': { name: 'WIPO', flag: '🌐', supportsAutoSync: true },
  'EPO': { name: 'EPO', flag: '🇪🇺', supportsAutoSync: true },
  'UKIPO': { name: 'UKIPO', flag: '🇬🇧', supportsAutoSync: false },
  'DPMA': { name: 'DPMA', flag: '🇩🇪', supportsAutoSync: false },
  'INPI': { name: 'INPI', flag: '🇫🇷', supportsAutoSync: false },
  'CNIPA': { name: 'CNIPA', flag: '🇨🇳', supportsAutoSync: false },
  'JPO': { name: 'JPO', flag: '🇯🇵', supportsAutoSync: true },
};

export function useMatterOffice(matterId: string) {
  const queryClient = useQueryClient();

  const { data: officeStatus, isLoading } = useQuery({
    queryKey: ['matter-office', matterId],
    queryFn: async (): Promise<OfficeStatus> => {
      const { data, error } = await supabase
        .from('matters')
        .select(`
          office_code,
          office_application_number,
          office_registration_number,
          office_status,
          office_status_normalized,
          office_status_date,
          office_filing_date,
          office_publication_date,
          office_registration_date,
          office_expiry_date,
          office_priority_date,
          office_last_sync_at,
          office_last_sync_status,
          office_metadata
        `)
        .eq('id', matterId)
        .single();

      if (error) throw error;

      const officeCode = data?.office_code;
      const officeInfo = officeCode ? OFFICE_INFO[officeCode] : null;

      // Calculate next sync (every 6 hours from last sync)
      let nextSyncAt: string | undefined;
      if (data?.office_last_sync_at && officeInfo?.supportsAutoSync) {
        const lastSync = new Date(data.office_last_sync_at);
        nextSyncAt = new Date(lastSync.getTime() + 6 * 60 * 60 * 1000).toISOString();
      }

      return {
        hasOffice: !!officeCode && !!data?.office_application_number,
        officeCode,
        officeName: officeInfo?.name,
        officeFlag: officeInfo?.flag,
        applicationNumber: data?.office_application_number || undefined,
        registrationNumber: data?.office_registration_number || undefined,
        status: data?.office_status || undefined,
        statusNormalized: data?.office_status_normalized || undefined,
        statusDate: data?.office_status_date || undefined,
        filingDate: data?.office_filing_date || undefined,
        publicationDate: data?.office_publication_date || undefined,
        registrationDate: data?.office_registration_date || undefined,
        expiryDate: data?.office_expiry_date || undefined,
        priorityDate: data?.office_priority_date || undefined,
        lastSyncAt: data?.office_last_sync_at || undefined,
        lastSyncStatus: data?.office_last_sync_status || undefined,
        nextSyncAt,
        supportsAutoSync: officeInfo?.supportsAutoSync ?? false,
        metadata: data?.office_metadata as Record<string, unknown> || undefined,
      };
    },
    enabled: !!matterId,
  });

  // Check office status (trigger sync)
  const checkOfficeMutation = useMutation({
    mutationFn: async (): Promise<CheckResult> => {
      const response = await supabase.functions.invoke('check-matter-office-status', {
        body: { matterId },
      });

      if (response.error) {
        return { success: false, hasChanges: false, error: response.error.message };
      }

      return response.data as CheckResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['matter-office', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter', matterId] });
      if (result.success) {
        if (result.hasChanges) {
          toast.success('Se detectaron cambios en la oficina');
        } else {
          toast.success('Sin cambios detectados');
        }
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al consultar oficina: ${error.message}`);
    },
  });

  // Manual update
  const updateManuallyMutation = useMutation({
    mutationFn: async (updateData: ManualUpdateData): Promise<void> => {
      const { error } = await supabase
        .from('matters')
        .update({
          office_status: updateData.status,
          office_status_normalized: updateData.statusNormalized,
          office_status_date: new Date().toISOString(),
          office_filing_date: updateData.filingDate || null,
          office_publication_date: updateData.publicationDate || null,
          office_registration_date: updateData.registrationDate || null,
          office_expiry_date: updateData.expiryDate || null,
          office_metadata: {
            ...(officeStatus?.metadata || {}),
            lastManualUpdate: {
              at: new Date().toISOString(),
              source: updateData.source,
              notes: updateData.notes,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', matterId);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_log').insert({
        organization_id: (await supabase.from('matters').select('organization_id').eq('id', matterId).single()).data?.organization_id,
        entity_type: 'matter',
        entity_id: matterId,
        matter_id: matterId,
        action: 'office_manual_update',
        title: 'Datos oficiales actualizados manualmente',
        description: `Estado: ${updateData.statusNormalized || 'N/A'}`,
        metadata: { source: updateData.source, notes: updateData.notes },
      });

      // Recalculate deadlines if requested
      if (updateData.recalculateDeadlines) {
        await supabase.functions.invoke('calculate-deadlines', {
          body: { matterId },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-office', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter', matterId] });
      toast.success('Datos actualizados correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  // Link to office
  const linkToOfficeMutation = useMutation({
    mutationFn: async ({ officeCode, applicationNumber }: { officeCode: string; applicationNumber: string }): Promise<void> => {
      const { error } = await supabase
        .from('matters')
        .update({
          office_code: officeCode,
          office_application_number: applicationNumber,
          office_last_sync_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', matterId);

      if (error) throw error;

      // Log activity
      const matter = (await supabase.from('matters').select('organization_id').eq('id', matterId).single()).data;
      await supabase.from('activity_log').insert({
        organization_id: matter?.organization_id,
        entity_type: 'matter',
        entity_id: matterId,
        matter_id: matterId,
        action: 'office_linked',
        title: 'Expediente vinculado a oficina',
        description: `${OFFICE_INFO[officeCode]?.name || officeCode}: ${applicationNumber}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-office', matterId] });
      toast.success('Expediente vinculado a oficina');
    },
    onError: (error: Error) => {
      toast.error(`Error al vincular: ${error.message}`);
    },
  });

  // Unlink from office
  const unlinkFromOfficeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase
        .from('matters')
        .update({
          office_code: null,
          office_application_number: null,
          office_registration_number: null,
          office_status: null,
          office_status_normalized: null,
          office_status_date: null,
          office_last_sync_at: null,
          office_last_sync_status: null,
          office_metadata: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-office', matterId] });
      toast.success('Expediente desvinculado de oficina');
    },
    onError: (error: Error) => {
      toast.error(`Error al desvincular: ${error.message}`);
    },
  });

  return {
    officeStatus: officeStatus || { hasOffice: false, supportsAutoSync: false },
    isLoading,
    checkOfficeStatus: checkOfficeMutation.mutateAsync,
    isChecking: checkOfficeMutation.isPending,
    updateManually: updateManuallyMutation.mutateAsync,
    isUpdating: updateManuallyMutation.isPending,
    linkToOffice: linkToOfficeMutation.mutateAsync,
    isLinking: linkToOfficeMutation.isPending,
    unlinkFromOffice: unlinkFromOfficeMutation.mutateAsync,
    isUnlinking: unlinkFromOfficeMutation.isPending,
    officeInfo: OFFICE_INFO,
  };
}
