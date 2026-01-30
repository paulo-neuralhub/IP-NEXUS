// =============================================
// COMPONENTE: ClientDocumentsTab
// Pestaña de documentos en la ficha del cliente
// =============================================

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Folder,
  FolderOpen,
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  MoreHorizontal,
  Eye,
  File,
  Image,
  FileSpreadsheet,
  FileArchive,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fromTable, supabase } from '@/lib/supabase';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { cn, formatFileSize } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientDocumentsTabProps {
  clientId: string;
}

interface ClientFolder {
  id: string;
  name: string;
  folder_type: string;
  description?: string | null;
  document_count?: number;
}

interface FolderDocument {
  id: string;
  name: string;
  file_type: string | null;
  file_url: string | null;
  file_size: number | null;
  source_type: string | null;
  description?: string | null;
  created_at: string;
}

const FOLDER_ICONS: Record<string, string> = {
  'contratos': '📝',
  'cartas': '✉️',
  'informes': '📊',
  'facturas': '🧾',
  'documentos_oficiales': '🏛️',
  'otros': '📁',
};

const FILE_ICONS: Record<string, typeof FileText> = {
  'pdf': FileText,
  'docx': FileText,
  'doc': FileText,
  'xlsx': FileSpreadsheet,
  'xls': FileSpreadsheet,
  'csv': FileSpreadsheet,
  'png': Image,
  'jpg': Image,
  'jpeg': Image,
  'gif': Image,
  'webp': Image,
  'zip': FileArchive,
  'rar': FileArchive,
};

export function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDoc, setDeleteDoc] = useState<FolderDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch folders with document counts
  const { data: folders = [], isLoading: isLoadingFolders } = useQuery({
    queryKey: ['client-folders', clientId],
    queryFn: async () => {
      const { data: foldersData, error } = await fromTable('client_folders')
        .select('id, name, folder_type, description')
        .eq('client_id', clientId)
        .order('name');
      
      if (error) throw error;
      if (!foldersData?.length) return [];

      // Get document counts
      const folderIds = foldersData.map((f: any) => f.id);
      const { data: counts } = await fromTable('client_folder_documents')
        .select('folder_id')
        .in('folder_id', folderIds);

      const countMap = (counts || []).reduce((acc: Record<string, number>, doc: any) => {
        acc[doc.folder_id] = (acc[doc.folder_id] || 0) + 1;
        return acc;
      }, {});

      return foldersData.map((folder: any) => ({
        ...folder,
        document_count: countMap[folder.id] || 0,
      })) as ClientFolder[];
    },
    enabled: !!clientId,
  });

  // Auto-select first folder
  const selectedFolder = folders.find(f => f.id === selectedFolderId) || folders[0];

  // Fetch documents for selected folder
  const { data: documents = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['folder-documents', selectedFolder?.id],
    queryFn: async () => {
      if (!selectedFolder?.id) return [];
      
      const { data, error } = await fromTable('client_folder_documents')
        .select('id, name, file_type, file_url, file_size, source_type, description, created_at')
        .eq('folder_id', selectedFolder.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as FolderDocument[];
    },
    enabled: !!selectedFolder?.id,
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await fromTable('client_folder_documents')
        .delete()
        .eq('id', docId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Documento eliminado');
      queryClient.invalidateQueries({ queryKey: ['folder-documents'] });
      queryClient.invalidateQueries({ queryKey: ['client-folders'] });
      setDeleteDoc(null);
    },
    onError: () => {
      toast.error('Error al eliminar el documento');
    },
  });

  // Upload file
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedFolder || !currentOrganization) return;

    setIsUploading(true);
    try {
      // Upload to storage
      const filePath = `${currentOrganization.id}/${clientId}/${selectedFolder.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('client-documents')
        .getPublicUrl(filePath);

      // Create document record
      const { error: insertError } = await fromTable('client_folder_documents')
        .insert({
          organization_id: currentOrganization.id,
          folder_id: selectedFolder.id,
          client_id: clientId,
          name: file.name,
          file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          file_url: urlData.publicUrl,
          file_size: file.size,
          source_type: 'uploaded',
        });

      if (insertError) throw insertError;

      toast.success('Documento subido correctamente');
      queryClient.invalidateQueries({ queryKey: ['folder-documents'] });
      queryClient.invalidateQueries({ queryKey: ['client-folders'] });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir el documento');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string | null) => {
    const IconComponent = FILE_ICONS[fileType?.toLowerCase() || ''] || File;
    return <IconComponent className="w-5 h-5 text-muted-foreground" />;
  };

  // Filter documents by search
  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDocs = folders.reduce((acc, f) => acc + (f.document_count || 0), 0);

  return (
    <div className="flex h-[600px] gap-4">
      {/* Sidebar de carpetas */}
      <Card className="w-[240px] flex flex-col">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">Carpetas</h3>
          <p className="text-xs text-muted-foreground">{totalDocs} documentos</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoadingFolders ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-9 w-full" />
              ))
            ) : (
              folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedFolder?.id === folder.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted"
                  )}
                >
                  <span>{FOLDER_ICONS[folder.folder_type] || '📁'}</span>
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  {(folder.document_count || 0) > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {folder.document_count}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Contenido de la carpeta */}
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold">{selectedFolder?.name || 'Selecciona una carpeta'}</h3>
              <p className="text-xs text-muted-foreground">
                {documents.length} documento{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={!selectedFolder || isUploading}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedFolder || isUploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {isUploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </div>
        </div>

        {/* Lista de documentos */}
        <ScrollArea className="flex-1">
          {isLoadingDocs ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-medium">No hay documentos en esta carpeta</p>
              <p className="text-sm text-muted-foreground/70 text-center mt-1 max-w-xs">
                Los documentos generados en expedientes aparecerán aquí automáticamente
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  {getFileIcon(doc.file_type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(doc.created_at), "d MMM yyyy", { locale: es })}</span>
                      {doc.file_size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                        </>
                      )}
                      {doc.source_type && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {doc.source_type === 'generated_document' ? 'Generado' : 
                             doc.source_type === 'uploaded' ? 'Subido' : 
                             doc.source_type === 'email_attachment' ? 'Email' : 
                             doc.source_type}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.file_url && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.file_url!, '_blank')}
                          title="Ver documento"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                          title="Descargar"
                        >
                          <a href={doc.file_url} download={doc.name}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {doc.file_url && (
                          <>
                            <DropdownMenuItem onClick={() => window.open(doc.file_url!, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Abrir en nueva pestaña
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDoc(doc)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El documento "{deleteDoc?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteDoc && deleteMutation.mutate(deleteDoc.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
