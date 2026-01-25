// =====================================================
// IP OFFICES CONNECTION - Main Hooks
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type { 
  IpoOffice, 
  StatusMapping, 
  OfficeFee, 
  SyncConfig, 
  SyncHistoryEntry,
  FileImport,
  ReviewQueueItem
} from '@/services/offices/types';

// =====================================================
// IP Offices
// =====================================================

export function useIpOffices() {
  return useQuery({
    queryKey: ['ipo-offices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('*')
        .eq('is_active', true)
        .order('priority_score', { ascending: false });
      
      if (error) throw error;
      return data as IpoOffice[];
    },
  });
}

export function useIpOffice(code: string) {
  return useQuery({
    queryKey: ['ipo-office', code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) throw error;
      return data as IpoOffice;
    },
    enabled: !!code,
  });
}

// =====================================================
// Status Mappings
// =====================================================

export function useStatusMappings(officeCode?: string) {
  return useQuery({
    queryKey: ['office-status-mappings', officeCode],
    queryFn: async () => {
      let query = supabase
        .from('office_status_mappings')
        .select('*');
      
      if (officeCode) {
        query = query.eq('office_code', officeCode);
      }
      
      const { data, error } = await query.order('office_status');
      if (error) throw error;
      return data as StatusMapping[];
    },
  });
}

export function useNormalizeStatus(officeCode: string, officeStatus: string) {
  const { data: mappings } = useStatusMappings(officeCode);
  
  const mapping = mappings?.find(m => 
    m.office_status.toLowerCase() === officeStatus.toLowerCase()
  );
  
  return {
    normalizedStatus: mapping?.normalized_status || officeStatus,
    statusCategory: mapping?.status_category,
    createsDeadline: mapping?.creates_deadline || false,
    deadlineTypeCode: mapping?.deadline_type_code,
  };
}

// =====================================================
// Official Fees
// =====================================================

export function useOfficialFees(officeCode?: string, ipType?: string) {
  return useQuery({
    queryKey: ['official-fees', officeCode, ipType],
    queryFn: async () => {
      let query = supabase
        .from('official_fees')
        .select('*')
        .eq('is_current', true);
      
      if (officeCode) {
        query = query.eq('office', officeCode);
      }
      if (ipType) {
        query = query.eq('ip_type', ipType);
      }
      
      const { data, error } = await query.order('fee_type').order('name');
      if (error) throw error;
      return data as OfficeFee[];
    },
  });
}

export function useCalculateFees(officeCode: string, ipType: string, classes: number = 1) {
  const { data: fees } = useOfficialFees(officeCode, ipType);
  
  if (!fees || fees.length === 0) {
    return { total: 0, breakdown: [], currency: 'EUR' };
  }
  
  const breakdown: Array<{ code: string; name: string; amount: number; quantity: number; subtotal: number }> = [];
  let total = 0;
  const currency = fees[0]?.currency || 'EUR';
  
  // Find filing fee
  const filingFee = fees.find(f => f.fee_type === 'filing');
  if (filingFee) {
    const baseClasses = filingFee.base_classes || 1;
    const includedClasses = Math.min(classes, baseClasses);
    breakdown.push({
      code: filingFee.code,
      name: filingFee.name,
      amount: filingFee.amount,
      quantity: 1,
      subtotal: filingFee.amount,
    });
    total += filingFee.amount;
    
    // Extra classes
    if (classes > baseClasses && filingFee.extra_class_fee) {
      const extraClassCount = classes - baseClasses;
      const extraFee = filingFee.extra_class_fee * extraClassCount;
      breakdown.push({
        code: `${filingFee.code}_EXTRA`,
        name: 'Clases adicionales',
        amount: filingFee.extra_class_fee,
        quantity: extraClassCount,
        subtotal: extraFee,
      });
      total += extraFee;
    }
  }
  
  return { total, breakdown, currency };
}

// =====================================================
// Sync Config
// =====================================================

export function useTenantSyncConfig() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['tenant-sync-config', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const { data, error } = await supabase
        .from('tenant_sync_config')
        .select('*')
        .eq('tenant_id', organizationId)
        .maybeSingle();
      
      if (error) throw error;
      return data as SyncConfig | null;
    },
    enabled: !!organizationId,
  });
}

export function useUpdateSyncConfig() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (config: Partial<SyncConfig>) => {
      if (!organizationId) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('tenant_sync_config')
        .upsert({
          tenant_id: organizationId,
          ...config,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-sync-config'] });
    },
  });
}

// =====================================================
// Sync History
// =====================================================

export function useSyncHistory(limit: number = 20) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['sync-history', organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('sync_history')
        .select('*')
        .eq('tenant_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as SyncHistoryEntry[];
    },
    enabled: !!organizationId,
  });
}

// =====================================================
// File Imports
// =====================================================

export function useFileImports() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['office-file-imports', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('office_file_imports')
        .select('*')
        .eq('tenant_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FileImport[];
    },
    enabled: !!organizationId,
  });
}

export function useUploadFileImport() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ officeCode, file }: { officeCode: string; file: File }) => {
      if (!organizationId) throw new Error('No organization');
      
      // Upload file to storage
      const filePath = `${organizationId}/imports/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('matter-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create import record
      const { data, error } = await supabase
        .from('office_file_imports')
        .insert({
          tenant_id: organizationId,
          office_code: officeCode,
          file_name: file.name,
          file_path: filePath,
          file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          file_size: file.size,
          import_status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-file-imports'] });
    },
  });
}

// =====================================================
// Review Queue
// =====================================================

export function useReviewQueue() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['import-review-queue', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('office_import_review_queue')
        .select('*')
        .eq('tenant_id', organizationId)
        .eq('status', 'pending')
        .order('confidence_score', { ascending: true });
      
      if (error) throw error;
      return data as ReviewQueueItem[];
    },
    enabled: !!organizationId,
  });
}

export function useApproveReviewItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, finalData }: { id: string; finalData: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('office_import_review_queue')
        .update({
          status: 'approved',
          final_data: finalData as any,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
    },
  });
}

export function useRejectReviewItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('office_import_review_queue')
        .update({
          status: 'rejected',
          review_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-review-queue'] });
    },
  });
}

// =====================================================
// Office Documents
// =====================================================

export function useOfficeDocuments(matterId?: string) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['office-documents', organizationId, matterId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('office_documents')
        .select('*')
        .eq('tenant_id', organizationId);
      
      if (matterId) {
        query = query.eq('matter_id', matterId);
      }
      
      const { data, error } = await query.order('office_doc_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}
