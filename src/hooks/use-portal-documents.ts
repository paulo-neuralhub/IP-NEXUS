/**
 * Hook para documentos compartidos del Portal Cliente
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';
import { toast } from 'sonner';

// =============================================
// TYPES
// =============================================

export interface PortalDocument {
  id: string;
  document_id: string;
  name: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  matter_id: string | null;
  matter_reference: string | null;
  matter_title: string | null;
  category: string | null;
  can_download: boolean;
  expires_at: string | null;
  shared_at: string;
  viewed_at: string | null;
  downloaded_at: string | null;
  download_count: number;
}

// =============================================
// HOOKS
// =============================================

/**
 * Hook para obtener documentos compartidos con el cliente
 */
export function usePortalDocuments(categoryFilter?: string) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-documents', user?.id, categoryFilter],
    queryFn: async (): Promise<PortalDocument[]> => {
      if (!user?.portal?.id) return [];

      // Obtener documentos compartidos a través de portal_shared_content
      const { data: sharedContent, error } = await supabase
        .from('portal_shared_content')
        .select(`
          id,
          content_id,
          permissions,
          expires_at,
          shared_at,
          is_active
        `)
        .eq('portal_id', user.portal.id)
        .eq('content_type', 'document')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching shared content:', error);
        return [];
      }

      if (!sharedContent || sharedContent.length === 0) return [];

      // Obtener detalles de los documentos
      const documentIds = sharedContent.map(sc => sc.content_id);
      
      // Usar fromTable helper para evitar errores de tipos
      const { data: documents, error: docsError } = await supabase
        .from('matter_documents')
        .select(`
          id,
          name,
          mime_type,
          file_size,
          file_path,
          matter_id,
          category,
          matter:matters(reference, title)
        `)
        .in('id', documentIds);

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        return [];
      }

      // Combinar datos
      const result: PortalDocument[] = [];
      
      for (const sc of sharedContent) {
        const doc = (documents as any[])?.find((d: any) => d.id === sc.content_id);
        if (!doc) continue;

        // Verificar expiración
        if (sc.expires_at && new Date(sc.expires_at) < new Date()) continue;

        // Filtrar por categoría si se especifica
        if (categoryFilter && categoryFilter !== 'all' && doc.category !== categoryFilter) continue;

        const permissions = sc.permissions as { can_download?: boolean; viewed_at?: string; downloaded_at?: string; download_count?: number } || {};
        const matter = doc.matter as { reference: string; title: string } | null;

        result.push({
          id: sc.id,
          document_id: doc.id,
          name: doc.name,
          mime_type: doc.mime_type || 'application/octet-stream',
          file_size: doc.file_size || 0,
          file_path: doc.file_path,
          matter_id: doc.matter_id,
          matter_reference: matter?.reference || null,
          matter_title: matter?.title || null,
          category: doc.category,
          can_download: permissions.can_download !== false,
          expires_at: sc.expires_at,
          shared_at: sc.shared_at,
          viewed_at: permissions.viewed_at || null,
          downloaded_at: permissions.downloaded_at || null,
          download_count: permissions.download_count || 0,
        });
      }

      return result.sort((a, b) => 
        new Date(b.shared_at).getTime() - new Date(a.shared_at).getTime()
      );
    },
    enabled: !!user?.portal?.id,
    staleTime: 60000,
  });
}

/**
 * Hook para registrar visualización de documento
 */
export function useViewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sharedContentId: string) => {
      // Obtener permisos actuales
      const { data: current } = await supabase
        .from('portal_shared_content')
        .select('permissions')
        .eq('id', sharedContentId)
        .single();

      const updatedPermissions = {
        ...(current?.permissions as object || {}),
        viewed_at: new Date().toISOString()
      };

      await supabase
        .from('portal_shared_content')
        .update({ permissions: updatedPermissions })
        .eq('id', sharedContentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] });
    },
  });
}

/**
 * Hook para registrar descarga de documento
 */
export function useDownloadDocument() {
  const queryClient = useQueryClient();
  const { user } = usePortalAuth();

  return useMutation({
    mutationFn: async ({ sharedContentId, filePath, fileName }: { 
      sharedContentId: string; 
      filePath: string; 
      fileName: string;
    }) => {
      // Actualizar contador de descargas
      const { data: current } = await supabase
        .from('portal_shared_content')
        .select('permissions')
        .eq('id', sharedContentId)
        .single();

      const currentPermissions = current?.permissions as { download_count?: number } || {};
      const updatedPermissions = {
        ...currentPermissions,
        downloaded_at: new Date().toISOString(),
        download_count: (currentPermissions.download_count || 0) + 1
      };

      await supabase
        .from('portal_shared_content')
        .update({ permissions: updatedPermissions })
        .eq('id', sharedContentId);

      // Log de actividad
      if (user?.portal?.id) {
        await (supabase as any).from('portal_activity_log').insert({
          portal_id: user.portal.id,
          actor_type: 'portal_user',
          actor_external_id: user.id,
          actor_name: user.name || user.email,
          action: 'document_download',
          details: { document_name: fileName }
        });
      }

      // Obtener URL de descarga del storage
      const { data: urlData } = await supabase.storage
        .from('matter-documents')
        .createSignedUrl(filePath, 3600); // 1 hora

      if (urlData?.signedUrl) {
        // Iniciar descarga
        const link = document.createElement('a');
        link.href = urlData.signedUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('No se pudo generar enlace de descarga');
      }
    },
    onSuccess: () => {
      toast.success('Documento descargado');
      queryClient.invalidateQueries({ queryKey: ['portal-documents'] });
    },
    onError: (error) => {
      console.error('Error downloading document:', error);
      toast.error('Error al descargar el documento');
    },
  });
}

/**
 * Hook para obtener documentos de un expediente específico
 */
export function usePortalMatterDocuments(matterId: string | undefined) {
  const { user } = usePortalAuth();

  return useQuery({
    queryKey: ['portal-matter-documents', matterId],
    queryFn: async (): Promise<PortalDocument[]> => {
      if (!user?.portal?.id || !matterId) return [];

      const { data: sharedContent, error } = await supabase
        .from('portal_shared_content')
        .select(`
          id,
          content_id,
          permissions,
          expires_at,
          shared_at
        `)
        .eq('portal_id', user.portal.id)
        .eq('content_type', 'document')
        .eq('is_active', true);

      if (error || !sharedContent) return [];

      const documentIds = sharedContent.map(sc => sc.content_id);

      const { data: documents } = await supabase
        .from('matter_documents')
        .select(`
          id,
          name,
          mime_type,
          file_size,
          file_path,
          matter_id,
          category
        `)
        .in('id', documentIds)
        .eq('matter_id', matterId);

      if (!documents) return [];

      return (documents as any[]).map((doc: any) => {
        const sc = sharedContent.find(s => s.content_id === doc.id)!;
        const permissions = sc.permissions as any || {};
        
        return {
          id: sc.id,
          document_id: doc.id,
          name: doc.name,
          mime_type: doc.mime_type || 'application/octet-stream',
          file_size: doc.file_size || 0,
          file_path: doc.file_path,
          matter_id: doc.matter_id,
          matter_reference: null,
          matter_title: null,
          category: doc.category,
          can_download: permissions.can_download !== false,
          expires_at: sc.expires_at,
          shared_at: sc.shared_at,
          viewed_at: permissions.viewed_at || null,
          downloaded_at: permissions.downloaded_at || null,
          download_count: permissions.download_count || 0,
        };
      });
    },
    enabled: !!user?.portal?.id && !!matterId,
    staleTime: 60000,
  });
}
