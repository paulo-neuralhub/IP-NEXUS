import { useState } from 'react';
import { useAllLegalDocuments, LegalDocumentContent } from '@/hooks/legal/useLegalDocumentContent';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Save, Eye, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FullLegalTextModal } from '@/components/legal-ops/FullLegalTextModal';

export default function LegalDocumentsPage() {
  const { data: documents, isLoading } = useAllLegalDocuments();
  const [selectedDoc, setSelectedDoc] = useState<LegalDocumentContent | null>(null);
  const [editForm, setEditForm] = useState<Partial<LegalDocumentContent>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<LegalDocumentContent>) => {
      if (!selectedDoc) throw new Error('No document selected');
      
      const { error } = await supabase
        .from('legal_document_contents')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedDoc.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Documento legal actualizado');
      queryClient.invalidateQueries({ queryKey: ['legal-documents-all'] });
      queryClient.invalidateQueries({ queryKey: ['legal-document-content'] });
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + (error as Error).message);
    },
  });

  const handleSelectDocument = (doc: LegalDocumentContent) => {
    setSelectedDoc(doc);
    setEditForm({
      title: doc.title,
      short_summary: doc.short_summary,
      checkbox_text: doc.checkbox_text,
      full_content: doc.full_content,
      link_text: doc.link_text,
      version: doc.version,
      is_active: doc.is_active,
    });
  };

  const handleSave = () => {
    updateMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Documentos Legales</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los textos legales que se muestran en la aplicación
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Documentos</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {documents?.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{doc.title}</span>
                    <Badge variant={doc.is_active ? 'default' : 'secondary'} className="text-xs">
                      {doc.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{doc.code}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3">
          {selectedDoc ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedDoc.title}</CardTitle>
                    <CardDescription>
                      Código: {selectedDoc.code} | Versión: {editForm.version}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Vista previa
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Resumen y Checkbox</TabsTrigger>
                    <TabsTrigger value="full">Texto Completo</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Título del documento</Label>
                      <Input
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Resumen corto (se muestra en el modal)</Label>
                      <p className="text-xs text-muted-foreground">
                        Usa formato Markdown. Se mostrará en el popup de aceptación.
                      </p>
                      <Textarea
                        value={editForm.short_summary || ''}
                        onChange={(e) => setEditForm({ ...editForm, short_summary: e.target.value })}
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Texto del checkbox de aceptación</Label>
                      <p className="text-xs text-muted-foreground">
                        Este texto aparece junto al checkbox que el usuario debe marcar.
                      </p>
                      <Textarea
                        value={editForm.checkbox_text || ''}
                        onChange={(e) => setEditForm({ ...editForm, checkbox_text: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Texto del enlace a condiciones completas</Label>
                      <Input
                        value={editForm.link_text || ''}
                        onChange={(e) => setEditForm({ ...editForm, link_text: e.target.value })}
                        placeholder="Leer condiciones completas"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="full" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Texto legal completo (Markdown)</Label>
                        <ScrollArea className="h-[500px] border rounded-lg">
                          <Textarea
                            value={editForm.full_content || ''}
                            onChange={(e) => setEditForm({ ...editForm, full_content: e.target.value })}
                            className="min-h-[500px] font-mono text-sm border-0 resize-none"
                          />
                        </ScrollArea>
                      </div>
                      <div className="space-y-2">
                        <Label>Vista previa</Label>
                        <ScrollArea className="h-[500px] border rounded-lg p-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{editForm.full_content || ''}</ReactMarkdown>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Versión</Label>
                      <Input
                        value={editForm.version || ''}
                        onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                        placeholder="1.0"
                        className="w-32"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={editForm.is_active}
                        onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                      />
                      <Label>Documento activo</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Solo los documentos activos se muestran a los usuarios.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Selecciona un documento para editarlo</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Preview Modal */}
      {selectedDoc && (
        <FullLegalTextModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={editForm.title || selectedDoc.title}
          content={editForm.full_content || selectedDoc.full_content}
        />
      )}
    </div>
  );
}
