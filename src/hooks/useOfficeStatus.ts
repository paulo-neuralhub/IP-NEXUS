// =====================================================
// Office Status Check Hook
// =====================================================

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StatusCheckResult {
  success: boolean;
  hasChanges: boolean;
  previousStatus?: string;
  currentStatus?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  documentsFound?: number;
  deadlinesCreated?: number;
  error?: string;
}

export function useOfficeStatus() {
  const [isChecking, setIsChecking] = useState(false);
  const queryClient = useQueryClient();
  
  const checkStatus = useMutation({
    mutationFn: async ({ 
      matterId, 
      forceRefresh = false 
    }: { 
      matterId: string; 
      forceRefresh?: boolean 
    }): Promise<StatusCheckResult> => {
      setIsChecking(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('office-check-status', {
          body: { matterId, forceRefresh },
        });
        
        if (error) throw error;
        return data as StatusCheckResult;
      } finally {
        setIsChecking(false);
      }
    },
    onSuccess: (result) => {
      if (result.hasChanges) {
        toast.success('Estado actualizado', {
          description: `Nuevo estado: ${result.currentStatus}`,
        });
      } else {
        toast.info('Sin cambios', {
          description: 'El expediente está actualizado',
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.invalidateQueries({ queryKey: ['office-documents'] });
    },
    onError: (error) => {
      toast.error('Error al verificar estado', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    },
  });
  
  return {
    checkStatus: checkStatus.mutate,
    checkStatusAsync: checkStatus.mutateAsync,
    isChecking: isChecking || checkStatus.isPending,
    result: checkStatus.data,
    error: checkStatus.error,
  };
}

export function useBatchStatusCheck() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();
  
  const batchCheck = useMutation({
    mutationFn: async (matterIds: string[]) => {
      setProgress({ current: 0, total: matterIds.length });
      
      const results: StatusCheckResult[] = [];
      
      for (let i = 0; i < matterIds.length; i++) {
        const { data, error } = await supabase.functions.invoke('office-check-status', {
          body: { matterId: matterIds[i], forceRefresh: true },
        });
        
        if (error) {
          results.push({ success: false, hasChanges: false, error: error.message });
        } else {
          results.push(data as StatusCheckResult);
        }
        
        setProgress({ current: i + 1, total: matterIds.length });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return results;
    },
    onSuccess: (results) => {
      const updated = results.filter(r => r.hasChanges).length;
      const errors = results.filter(r => !r.success).length;
      
      toast.success('Verificación completada', {
        description: `${updated} actualizados, ${errors} errores`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['matters'] });
    },
  });
  
  return {
    batchCheck: batchCheck.mutate,
    isChecking: batchCheck.isPending,
    progress,
    results: batchCheck.data,
  };
}
