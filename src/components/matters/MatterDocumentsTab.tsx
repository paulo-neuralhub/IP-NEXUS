/**
 * MatterDocumentsTab - Pestaña de documentos del expediente
 */

import { useState } from 'react';
import { FileText, Upload, Download, Trash2, Eye, Plus, File, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatterDocuments, useDeleteMatterDocument } from '@/hooks/use-matter-documents';
import { DocumentUploader } from '@/components/features/documents/DocumentUploader';
import { GenerateDocumentModal } from '@/components/documents/GenerateDocumentModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { useToast } from '@/hooks/use-toast';

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  application: { label: 'Solicitud', color: 'bg-blue-100 text-blue-700' },
  certificate: { label: 'Certificado', color: 'bg-green-100 text-green-700' },
  correspondence: { label: 'Correspondencia', color: 'bg-yellow-100 text-yellow-700' },
  invoice: { label: 'Factura', color: 'bg-purple-100 text-purple-700' },
  report: { label: 'Informe', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Otro', color: 'bg-gray-100 text-gray-700' },
};

interface MatterDocumentsTabProps {
  matterId: string;
  matterReference?: string;
  clientId?: string;
}

export function MatterDocumentsTab({ matterId, matterReference, clientId }: MatterDocumentsTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: documents, isLoading } = useMatterDocuments(matterId);
  const deleteDoc = useDeleteMatterDocument();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc.mutateAsync(deleteId);
      toast({ title: 'Documento eliminado' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos
          {documents && documents.length > 0 && (
            <Badge variant="secondary">{documents.length}</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowGenerateModal(true)}>
            <Sparkles className="h-4 w-4 mr-1" />
            Generar documento
          </Button>
          <Button size="sm" onClick={() => setShowUploader(!showUploader)}>
            <Plus className="h-4 w-4 mr-1" />
            Subir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Uploader */}
        <Collapsible open={showUploader} onOpenChange={setShowUploader}>
          <CollapsibleContent className="pb-4">
            <DocumentUploader
              entityType="matter"
              entityId={matterId}
              onUploadComplete={() => setShowUploader(false)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Documents list */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando...</div>
        ) : !documents?.length ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No hay documentos</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sube el primer documento del expediente
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => {
              const categoryConfig = CATEGORY_CONFIG[doc.category || 'other'] || CATEGORY_CONFIG.other;
              
              return (
                <div key={doc.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge className={categoryConfig.color} variant="secondary">
                          {categoryConfig.label}
                        </Badge>
                        {doc.created_at && (
                          <span>
                            {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                          </span>
                        )}
                        {doc.file_size && (
                          <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc.file_url, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Document Modal */}
      <GenerateDocumentModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        matterId={matterId}
        matterReference={matterReference}
        clientId={clientId}
      />
    </Card>
  );
}
