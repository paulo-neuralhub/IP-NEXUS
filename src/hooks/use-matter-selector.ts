/**
 * useMatterSelector - Hook helper para selección de expedientes en modales
 * Maneja auto-selección, validación y estado
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';

export interface MatterOption {
  id: string;
  reference: string;
  title: string;
  matter_type: string;
  status: string;
  client_id?: string | null;
  client_name?: string | null;
}

interface UseMatterSelectorOptions {
  accountId?: string | null;
  autoSelectSingle?: boolean;
  required?: boolean;
  initialMatterId?: string | null;
}

export function useMatterSelector({
  accountId,
  autoSelectSingle = true,
  required = false,
  initialMatterId,
}: UseMatterSelectorOptions) {
  const { organizationId } = useOrganization();
  const [matterId, setMatterId] = useState<string | null>(initialMatterId || null);
  const [autoSelected, setAutoSelected] = useState(false);

  // Fetch matters for this account
  const { data: matters = [], isLoading } = useQuery({
    queryKey: ['matters-for-selector', organizationId, accountId],
    queryFn: async (): Promise<MatterOption[]> => {
      if (!organizationId || !accountId) return [];

      const { data, error } = await fromTable('matters')
        .select(`
          id, reference, title, matter_type, status,
          client_id,
          client:contacts!client_id(full_name)
        `)
        .eq('organization_id', organizationId)
        .eq('client_id', accountId)
        .in('status', ['active', 'pending', 'draft'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        reference: m.reference || 'Sin referencia',
        title: m.title || 'Sin título',
        matter_type: m.matter_type || 'general',
        status: m.status,
        client_id: m.client_id,
        client_name: m.client?.full_name,
      }));
    },
    enabled: !!organizationId && !!accountId,
  });

  // Auto-selección cuando hay exactamente 1 expediente
  useEffect(() => {
    if (autoSelectSingle && matters.length === 1 && !autoSelected && !matterId) {
      setMatterId(matters[0].id);
      setAutoSelected(true);
    }
  }, [matters, autoSelectSingle, autoSelected, matterId]);

  // Reset cuando cambia el account
  useEffect(() => {
    if (!initialMatterId) {
      setMatterId(null);
      setAutoSelected(false);
    }
  }, [accountId, initialMatterId]);

  const selectedMatter = useMemo(
    () => matters.find(m => m.id === matterId) || null,
    [matters, matterId]
  );

  const state = useMemo(() => ({
    matterId,
    setMatterId,
    matters,
    isLoading,
    selectedMatter,

    // Helpers
    hasMatters: matters.length > 0,
    hasMultipleMatters: matters.length > 1,
    hasSingleMatter: matters.length === 1,
    matterCount: matters.length,

    // Validación
    isValid: !required || matters.length === 0 || !!matterId,
    needsSelection: matters.length > 1 && !matterId,
    errorMessage: required && matters.length > 0 && !matterId
      ? 'Debes seleccionar un expediente'
      : null,

    // Para el formulario de envío
    getMatterIdForSubmit: () => {
      if (matters.length === 0) return null;
      return matterId;
    },

    getMatterReferenceForSubmit: () => {
      if (!matterId) return null;
      return selectedMatter?.reference || null;
    },
  }), [matterId, matters, isLoading, selectedMatter, required]);

  return {
    ...state,
    setMatterId: useCallback((id: string | null) => {
      setMatterId(id);
      setAutoSelected(false);
    }, []),
  };
}
