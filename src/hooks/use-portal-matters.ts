/**
 * Hook para expedientes del Portal Cliente
 * Usa las funciones RPC del servidor para seguridad
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase';
import { usePortalAuth } from './usePortalAuth';

// =============================================
// TYPES
// =============================================

export interface PortalMatter {
  id: string;
  reference: string;
  title: string;
  status: string;
  type: string;
  jurisdiction: string | null;
  created_at: string;
  deadline_count: number;
}

export interface PortalMatterDetail extends PortalMatter {
  notes?: string;
  application_number?: string;
  registration_number?: string;
  filing_date?: string;
  registration_date?: string;
  expiry_date?: string;
  mark_name?: string;
  owner_name?: string;
  next_deadline?: {
    date: string;
    description: string;
  };
  documents_count?: number;
  activities_count?: number;
}

// =============================================
// HOOKS
// =============================================

/**
 * Hook para obtener los expedientes del cliente
 */
export function usePortalMatters() {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-matters', user?.id],
    queryFn: async (): Promise<PortalMatter[]> => {
      if (!user?.contactId) return [];

      // Usar la función RPC del servidor
      const { data, error } = await (supabase as any).rpc('get_portal_user_matters', {
        p_portal_user_id: user.id
      });

      if (error) {
        console.error('Error fetching portal matters via RPC:', error);
        
        // Fallback: consulta directa con client_id usando fromTable helper
        const { data: fallbackData, error: fallbackError } = await fromTable('matters')
          .select(`
            id,
            reference,
            title,
            status,
            type,
            jurisdiction,
            created_at
          `)
          .eq('client_id', user.contactId)
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        
        return (fallbackData || []).map((m: any) => ({
          id: m.id,
          reference: m.reference || '',
          title: m.title || '',
          status: m.status || '',
          type: m.type || '',
          jurisdiction: m.jurisdiction || null,
          created_at: m.created_at || '',
          deadline_count: 0
        }));
      }

      // Mapear campos de RPC (que usa ip_type) a type
      return (data || []).map((m: any) => ({
        id: m.id,
        reference: m.reference || '',
        title: m.title || '',
        status: m.status || '',
        type: m.ip_type || m.type || '',
        jurisdiction: m.jurisdiction || null,
        created_at: m.created_at || '',
        deadline_count: m.deadline_count || 0
      }));
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener detalle de un expediente
 */
export function usePortalMatterDetail(matterId: string | undefined) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-matter-detail', matterId],
    queryFn: async (): Promise<PortalMatterDetail | null> => {
      if (!user?.id || !matterId) return null;

      // Verificar acceso
      const { data: hasAccess } = await (supabase as any).rpc('portal_user_can_access_matter', {
        p_portal_user_id: user.id,
        p_matter_id: matterId
      });

      if (!hasAccess) {
        throw new Error('No tienes acceso a este expediente');
      }

      // Obtener detalle usando fromTable para evitar errores de tipos
      const { data, error } = await fromTable('matters')
        .select(`
          id,
          reference,
          title,
          status,
          type,
          jurisdiction,
          created_at,
          notes,
          application_number,
          registration_number,
          filing_date,
          registration_date,
          expiry_date,
          mark_name,
          owner_name
        `)
        .eq('id', matterId)
        .single();

      if (error) throw error;

      // Obtener próximo deadline
      const { data: nextDeadline } = await fromTable('matter_events')
        .select('event_date, title')
        .eq('matter_id', matterId)
        .eq('event_type', 'deadline')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Contar documentos
      const { count: docsCount } = await supabase
        .from('matter_documents')
        .select('id', { count: 'exact', head: true })
        .eq('matter_id', matterId);

      // Contar actividades
      const activitiesResult = await fromTable('activities')
        .select('id', { count: 'exact', head: true })
        .eq('matter_id', matterId);
      const activitiesCount = activitiesResult.count || 0;

      return {
        id: data.id,
        reference: data.reference || '',
        title: data.title || '',
        status: data.status || '',
        type: data.type || '',
        jurisdiction: data.jurisdiction || null,
        created_at: data.created_at || '',
        notes: data.notes || undefined,
        application_number: data.application_number || undefined,
        registration_number: data.registration_number || undefined,
        filing_date: data.filing_date || undefined,
        registration_date: data.registration_date || undefined,
        expiry_date: data.expiry_date || undefined,
        mark_name: data.mark_name || undefined,
        owner_name: data.owner_name || undefined,
        deadline_count: 0,
        next_deadline: nextDeadline ? {
          date: nextDeadline.event_date,
          description: nextDeadline.title || ''
        } : undefined,
        documents_count: docsCount || 0,
        activities_count: activitiesCount || 0,
      };
    },
    enabled: !!user?.id && !!matterId,
    staleTime: 60000,
  });
}

/**
 * Hook para verificar acceso a un expediente
 */
export function useCanAccessMatter(matterId: string | undefined) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-can-access-matter', user?.id, matterId],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id || !matterId) return false;

      const { data, error } = await (supabase as any).rpc('portal_user_can_access_matter', {
        p_portal_user_id: user.id,
        p_matter_id: matterId
      });

      if (error) {
        console.error('Error checking matter access:', error);
        return false;
      }

      return data === true;
    },
    enabled: !!user?.id && !!matterId,
    staleTime: 300000, // 5 minutos
  });
}
