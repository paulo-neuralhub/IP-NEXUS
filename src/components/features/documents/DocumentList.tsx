import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  Image,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  File,
  Award,
  Mail,
  Receipt,
  FileSignature,
  Scale,
  Search,
  Building2,
  Reply,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocuments, useDeleteDocument, useDownloadDocument, getDocumentUrl } from '@/hooks/use-documents';
import type { Document, DocumentType, EntityType } from '@/types/documents';
import { DOCUMENT_TYPE_LABELS, formatFileSize } from '@/types/documents';
import { DocumentPreviewModal } from './DocumentPreviewModal';

const ICON_MAP: Record<DocumentType, React.ComponentType<{ className?: string }>> = {
  application: FileText,
  certificate: Award,
  logo: Image,
  correspondence: Mail,
  invoice: Receipt,
  contract: FileSignature,
  power_of_attorney: Scale,
  search_report: Search,
  office_action: Building2,
  response: Reply,
  other: File,
};

interface DocumentListProps {
  entityType: EntityType;
  entityId: string;
  showUploader?: boolean;
}

export function DocumentList({ entityType, entityId }: DocumentListProps) {
  const { data: documents, isLoading } = useDocuments(entityType, entityId);
  const deleteMutation = useDeleteDocument();
  const { download, isDownloading } = useDownloadDocument();
  
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePreview = async (doc: Document) => {
    const url = await getDocumentUrl(doc);
    if (url) {
      setPreviewUrl(url);
      setPreviewDoc(doc);
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    await deleteMutation.mutateAsync({ 
      document: deleteDoc, 
      entityType, 
      entityId 
    });
    setDeleteDoc(null);
  };

  const canPreview = (doc: Document) => {
    const type = doc.mime_type || '';
    return type.startsWith('image/') || type === 'application/pdf';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No hay documentos</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y rounded-lg border">
        {documents.map((doc) => {
          const IconComponent = ICON_MAP[doc.document_type] || File;
          
          return (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
            >
              {/* Icon */}
              <div className="shrink-0 h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {doc.title || doc.original_filename}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                  </span>
                  {doc.file_size && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </>
                  )}
                  {doc.uploader?.full_name && (
                    <>
                      <span>•</span>
                      <span>{doc.uploader.full_name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Type badge */}
              <Badge variant="secondary" className="shrink-0 text-xs">
                {DOCUMENT_TYPE_LABELS[doc.document_type]}
              </Badge>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPreview(doc) && (
                    <DropdownMenuItem onClick={() => handlePreview(doc)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => download(doc)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Descargar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteDoc(doc)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente "{deleteDoc?.original_filename}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview modal */}
      {previewDoc && previewUrl && (
        <DocumentPreviewModal
          open={!!previewDoc}
          onClose={() => {
            setPreviewDoc(null);
            setPreviewUrl(null);
          }}
          document={previewDoc}
          url={previewUrl}
        />
      )}
    </>
  );
}
