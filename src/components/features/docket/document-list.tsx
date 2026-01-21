import { useState } from 'react';
import { FileText, Download, Trash2, Eye, Plus, Shield, Calendar, PenTool } from 'lucide-react';
import { useMatterDocuments } from '@/hooks/use-matters';
import { useDeleteDocument, useDownloadDocument } from '@/hooks/use-matter-files';
import { DOCUMENT_CATEGORIES } from '@/lib/constants/matters';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DocumentUploadModal } from './document-upload-modal';
import { DocumentPreviewModal } from './document-preview-modal';
import { RequestSignatureDialog } from '@/components/signatures/RequestSignatureDialog';
import type { MatterDocument } from '@/types/matters';
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

interface Props {
  matterId: string;
}

export function DocumentList({ matterId }: Props) {
  const { data: documents, isLoading } = useMatterDocuments(matterId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<MatterDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<MatterDocument | null>(null);
  const [signatureDoc, setSignatureDoc] = useState<MatterDocument | null>(null);
  const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();
  
  const handleDelete = async () => {
    if (!deleteDoc) return;
    await deleteMutation.mutateAsync({
      docId: deleteDoc.id,
      filePath: deleteDoc.file_path,
      matterId,
    });
    setDeleteDoc(null);
  };
  
  const handleDownload = (doc: MatterDocument) => {
    downloadMutation.mutate({ filePath: doc.file_path, fileName: doc.name });
  };
  
  // Group by category
  const grouped = (documents as MatterDocument[] | undefined)?.reduce((acc, doc) => {
    const cat = doc.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, MatterDocument[]>) || {};
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Documentos</h3>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Subir documento
        </Button>
      </div>
      
      {/* List */}
      {!documents?.length ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="Sin documentos"
          description="Aún no hay documentos adjuntos a este expediente."
          action={
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              Subir el primer documento
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, docs]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {DOCUMENT_CATEGORIES[category as keyof typeof DOCUMENT_CATEGORIES]?.label || 'Otros'}
              </h4>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.file_size || 0)}</span>
                        <span>·</span>
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.is_official && (
                          <>
                            <span>·</span>
                            <Badge variant="secondary" className="text-xs h-5">
                              <Shield className="h-3 w-3 mr-1" />
                              Oficial
                            </Badge>
                          </>
                        )}
                        {doc.document_date && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(doc.document_date)}
                            </span>
                          </>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{doc.description}</p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {/* Request Signature */}
                      {doc.mime_type === 'application/pdf' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setSignatureDoc(doc)}
                              className="text-primary hover:text-primary"
                            >
                              <PenTool className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Solicitar firma</TooltipContent>
                        </Tooltip>
                      )}
                      {(doc.mime_type?.startsWith('image/') || doc.mime_type === 'application/pdf') && (
                        <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(doc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDownload(doc)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteDoc(doc)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Modal */}
      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        matterId={matterId}
      />
      
      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{deleteDoc?.name}" permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Signature Request Modal */}
      {signatureDoc && (
        <RequestSignatureDialog
          open={!!signatureDoc}
          onOpenChange={() => setSignatureDoc(null)}
          document={{
            id: signatureDoc.id,
            name: signatureDoc.name,
            url: signatureDoc.file_path,
          }}
          matter={{
            id: matterId,
            reference: '',
          }}
        />
      )}
    </div>
  );
}
