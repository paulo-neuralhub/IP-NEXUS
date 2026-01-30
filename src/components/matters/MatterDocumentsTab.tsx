/**
 * MatterDocumentsTab - Pestaña de documentos del expediente
 * Incluye generador de documentos integrado y lista de documentos generados
 */

import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, Plus, File, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatterDocuments, useDeleteMatterDocument } from '@/hooks/use-matter-documents';
import { DocumentUploader } from '@/components/features/documents/DocumentUploader';
import { DocumentGenerator } from '@/components/documents/DocumentGenerator';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  contrato: { label: 'Contrato', color: 'bg-indigo-100 text-indigo-700' },
  carta: { label: 'Carta', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Otro', color: 'bg-gray-100 text-gray-700' },
};

interface MatterDocumentsTabProps {
  matterId: string;
  matterReference?: string;
  clientId?: string;
  matterData?: Record<string, unknown>;
  clientData?: Record<string, unknown>;
}

export function MatterDocumentsTab({ 
  matterId, 
  matterReference, 
  clientId,
  matterData,
  clientData 
}: MatterDocumentsTabProps) {
  const navigate = useNavigate();
  const [showUploader, setShowUploader] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<any[]>([]);
  const [isLoadingGenerated, setIsLoadingGenerated] = useState(true);
  const { toast } = useToast();
  
  // Uploaded documents
  const { data: uploadedDocuments, isLoading: isLoadingUploaded } = useMatterDocuments(matterId);
  const deleteDoc = useDeleteMatterDocument();

  // Load generated documents
  useEffect(() => {
    loadGeneratedDocuments();
  }, [matterId]);

  const loadGeneratedDocuments = async () => {
    try {
      const { data } = await supabase
        .from('ai_generated_documents')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      
      setGeneratedDocs(data || []);
    } catch (error) {
      console.error('Error loading generated documents:', error);
    } finally {
      setIsLoadingGenerated(false);
    }
  };

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

  const totalDocs = (uploadedDocuments?.length || 0) + generatedDocs.length;
  const isLoading = isLoadingUploaded || isLoadingGenerated;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos del Expediente
          </h3>
          <p className="text-sm text-muted-foreground">
            {totalDocs} documento(s) en total
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowUploader(!showUploader)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Subir
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowDocGenerator(true)}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generar documento
          </Button>
        </div>
      </div>

      {/* Uploader collapsible */}
      <Collapsible open={showUploader} onOpenChange={setShowUploader}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <DocumentUploader
                entityType="matter"
                entityId={matterId}
                onUploadComplete={() => setShowUploader(false)}
              />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Documents list - NO invoice card here, it's inside the modal now */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Cargando documentos...</div>
          </CardContent>
        </Card>
      ) : totalDocs === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <File className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">No hay documentos</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Genera contratos, cartas, informes y más para este expediente
              </p>
              <Button onClick={() => setShowDocGenerator(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar primer documento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Generated documents */}
          {generatedDocs.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Documentos generados ({generatedDocs.length})
                </h4>
                <div className="divide-y">
                  {generatedDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge 
                              variant="secondary"
                              className={doc.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                            >
                              {doc.status === 'approved' ? 'Final' : 'Borrador'}
                            </Badge>
                            {doc.created_at && (
                              <span>
                                {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uploaded documents */}
          {uploadedDocuments && uploadedDocuments.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Documentos subidos ({uploadedDocuments.length})
                </h4>
                <div className="divide-y">
                  {uploadedDocuments.map((doc) => {
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
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
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

      {/* Document Generator Modal */}
      <DocumentGenerator
        isOpen={showDocGenerator}
        onClose={() => {
          setShowDocGenerator(false);
          loadGeneratedDocuments(); // Reload list when closing
        }}
        matterId={matterId}
        clientId={clientId}
      />
    </div>
  );
}
