import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Plus, FileText, Globe, Building, Trash2, Eye, 
  Upload, CheckCircle, Clock, XCircle, Settings, Search
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useRAGKnowledgeBases,
  useRAGKnowledgeBase,
  useRAGDocuments,
  useCreateRAGKnowledgeBase,
  useDeleteRAGKnowledgeBase,
  useCreateRAGDocument,
  useDeleteRAGDocument,
  type RAGKnowledgeBase,
  type RAGKnowledgeBaseFormData,
  type RAGDocumentFormData,
} from '@/hooks/ai-brain/useRAGKnowledgeBases';

const STATUS_CONFIG: Record<string, { bg: string; icon: typeof Clock }> = {
  pending: { bg: 'bg-muted text-muted-foreground', icon: Clock },
  processing: { bg: 'bg-blue-100 text-blue-700', icon: Clock },
  ready: { bg: 'bg-green-100 text-green-700', icon: CheckCircle },
  error: { bg: 'bg-red-100 text-red-700', icon: XCircle },
};

const DEFAULT_KB_FORM: RAGKnowledgeBaseFormData = {
  code: '',
  name: '',
  description: '',
  type: 'general',
  jurisdictions: [],
  languages: ['es'],
  visibility: 'global',
};

const DEFAULT_DOC_FORM: Omit<RAGDocumentFormData, 'knowledge_base_id'> = {
  title: '',
  source_url: '',
  source_type: 'manual',
  jurisdiction: '',
  language: 'es',
  document_type: '',
  raw_content: '',
};

export function KnowledgeBasesTab() {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null);
  const [isKbDialogOpen, setIsKbDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [kbForm, setKbForm] = useState<RAGKnowledgeBaseFormData>(DEFAULT_KB_FORM);
  const [docForm, setDocForm] = useState(DEFAULT_DOC_FORM);

  // Queries
  const { data: knowledgeBases, isLoading } = useRAGKnowledgeBases();
  const { data: selectedKb } = useRAGKnowledgeBase(selectedKbId || undefined);
  const { data: documents } = useRAGDocuments(selectedKbId || undefined);

  // Mutations
  const createKb = useCreateRAGKnowledgeBase();
  const deleteKb = useDeleteRAGKnowledgeBase();
  const createDoc = useCreateRAGDocument();
  const deleteDoc = useDeleteRAGDocument();

  const globalKbs = knowledgeBases?.filter(kb => !kb.tenant_id) || [];
  const tenantKbs = knowledgeBases?.filter(kb => kb.tenant_id) || [];

  const stats = {
    total: knowledgeBases?.length || 0,
    documents: knowledgeBases?.reduce((s, k) => s + (k.document_count || 0), 0) || 0,
    chunks: knowledgeBases?.reduce((s, k) => s + (k.chunk_count || 0), 0) || 0,
    tokens: knowledgeBases?.reduce((s, k) => s + (k.total_tokens || 0), 0) || 0,
  };

  const handleCreateKb = async () => {
    if (!kbForm.code || !kbForm.name) {
      toast.error('Completa los campos requeridos');
      return;
    }
    await createKb.mutateAsync(kbForm);
    setIsKbDialogOpen(false);
    setKbForm(DEFAULT_KB_FORM);
  };

  const handleDeleteKb = async (id: string) => {
    if (confirm('¿Eliminar esta knowledge base y todos sus documentos?')) {
      await deleteKb.mutateAsync(id);
      if (selectedKbId === id) {
        setSelectedKbId(null);
        setActiveTab('list');
      }
    }
  };

  const handleCreateDoc = async () => {
    if (!docForm.title || !docForm.raw_content || !selectedKbId) {
      toast.error('Completa los campos requeridos');
      return;
    }
    await createDoc.mutateAsync({
      ...docForm,
      knowledge_base_id: selectedKbId,
    });
    setIsDocDialogOpen(false);
    setDocForm(DEFAULT_DOC_FORM);
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm('¿Eliminar este documento?') && selectedKbId) {
      await deleteDoc.mutateAsync({ id, knowledgeBaseId: selectedKbId });
    }
  };

  const openDocuments = (kb: RAGKnowledgeBase) => {
    setSelectedKbId(kb.id);
    setActiveTab('documents');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RAG Knowledge Bases</CardTitle>
          <CardDescription>Bases de conocimiento para retrieval augmented generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Bases</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Documentos</p>
            <p className="text-2xl font-bold">{stats.documents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Chunks</p>
            <p className="text-2xl font-bold">{stats.chunks.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Tokens</p>
            <p className="text-2xl font-bold">{(stats.tokens / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              RAG Knowledge Bases
            </CardTitle>
            <CardDescription>Gestión de bases de conocimiento para RAG</CardDescription>
          </div>
          {activeTab === 'list' && (
            <Button onClick={() => setIsKbDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Base
            </Button>
          )}
          {activeTab === 'documents' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('list')}>
                ← Volver
              </Button>
              <Button onClick={() => setIsDocDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Documento
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">Knowledge Bases</TabsTrigger>
              <TabsTrigger value="documents" disabled={!selectedKbId}>
                Documentos {selectedKb && `(${selectedKb.name})`}
              </TabsTrigger>
            </TabsList>

            {/* List Tab */}
            <TabsContent value="list">
              {/* Global KBs */}
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Bases Globales
              </h3>
              {globalKbs.length === 0 ? (
                <p className="text-muted-foreground text-sm mb-6">No hay bases globales</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {globalKbs.map(kb => (
                    <KnowledgeBaseCard 
                      key={kb.id} 
                      kb={kb} 
                      onOpen={() => openDocuments(kb)}
                      onDelete={() => handleDeleteKb(kb.id)}
                    />
                  ))}
                </div>
              )}

              {/* Tenant KBs */}
              {tenantKbs.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" /> Bases por Tenant
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenantKbs.map(kb => (
                      <KnowledgeBaseCard 
                        key={kb.id} 
                        kb={kb}
                        onOpen={() => openDocuments(kb)}
                        onDelete={() => handleDeleteKb(kb.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              {documents?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No hay documentos en esta base</p>
                  <p className="text-sm">Añade documentos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents?.map(doc => {
                    const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                    const StatusIcon = status.icon;
                    return (
                      <div key={doc.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{doc.title}</p>
                              {doc.document_type && (
                                <Badge variant="outline">{doc.document_type}</Badge>
                              )}
                              {doc.jurisdiction && (
                                <Badge variant="secondary">{doc.jurisdiction}</Badge>
                              )}
                              {doc.language && (
                                <Badge variant="outline" className="text-xs">{doc.language}</Badge>
                              )}
                              <Badge className={status.bg}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {doc.status}
                              </Badge>
                            </div>
                            {doc.source_url && (
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                                {doc.source_url}
                              </p>
                            )}
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{doc.chunk_count} chunks</span>
                              <span>{doc.token_count} tokens</span>
                              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteDoc(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create KB Dialog */}
      <Dialog open={isKbDialogOpen} onOpenChange={setIsKbDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Knowledge Base</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={kbForm.code}
                  onChange={(e) => setKbForm({ ...kbForm, code: e.target.value })}
                  placeholder="legal-es"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={kbForm.type} onValueChange={(v) => setKbForm({ ...kbForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="product">Producto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Nombre *</Label>
              <Input
                value={kbForm.name}
                onChange={(e) => setKbForm({ ...kbForm, name: e.target.value })}
                placeholder="Legislación PI España"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={kbForm.description}
                onChange={(e) => setKbForm({ ...kbForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jurisdicciones (separar por coma)</Label>
                <Input
                  value={kbForm.jurisdictions?.join(', ') || ''}
                  onChange={(e) => setKbForm({ 
                    ...kbForm, 
                    jurisdictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="ES, EU, US"
                />
              </div>
              <div>
                <Label>Idiomas</Label>
                <Input
                  value={kbForm.languages?.join(', ') || ''}
                  onChange={(e) => setKbForm({ 
                    ...kbForm, 
                    languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="es, en"
                />
              </div>
            </div>
            <div>
              <Label>Visibilidad</Label>
              <Select value={kbForm.visibility} onValueChange={(v) => setKbForm({ ...kbForm, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (todos)</SelectItem>
                  <SelectItem value="tenant">Solo tenant</SelectItem>
                  <SelectItem value="restricted">Restringido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKbDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateKb} disabled={createKb.isPending}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Document Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                placeholder="Ley de Marcas España"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo de fuente</Label>
                <Select value={docForm.source_type} onValueChange={(v) => setDocForm({ ...docForm, source_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Jurisdicción</Label>
                <Input
                  value={docForm.jurisdiction}
                  onChange={(e) => setDocForm({ ...docForm, jurisdiction: e.target.value })}
                  placeholder="ES"
                />
              </div>
              <div>
                <Label>Idioma</Label>
                <Input
                  value={docForm.language}
                  onChange={(e) => setDocForm({ ...docForm, language: e.target.value })}
                  placeholder="es"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>URL (opcional)</Label>
                <Input
                  value={docForm.source_url}
                  onChange={(e) => setDocForm({ ...docForm, source_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Tipo de documento</Label>
                <Select 
                  value={docForm.document_type || ''} 
                  onValueChange={(v) => setDocForm({ ...docForm, document_type: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="law">Ley</SelectItem>
                    <SelectItem value="regulation">Reglamento</SelectItem>
                    <SelectItem value="guide">Guía</SelectItem>
                    <SelectItem value="template">Plantilla</SelectItem>
                    <SelectItem value="article">Artículo</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Contenido *</Label>
              <Textarea
                value={docForm.raw_content}
                onChange={(e) => setDocForm({ ...docForm, raw_content: e.target.value })}
                rows={10}
                placeholder="Pega aquí el contenido del documento..."
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateDoc} disabled={createDoc.isPending}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// KB Card Component
function KnowledgeBaseCard({ 
  kb, 
  onOpen, 
  onDelete 
}: { 
  kb: RAGKnowledgeBase; 
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium">{kb.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{kb.code}</p>
          </div>
          <Badge variant="outline">{kb.type}</Badge>
        </div>
        
        {kb.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{kb.description}</p>
        )}
        
        <div className="flex gap-1 flex-wrap mb-3">
          {kb.jurisdictions?.map((j) => (
            <Badge key={j} variant="secondary" className="text-xs">{j}</Badge>
          ))}
          {kb.languages?.map((l) => (
            <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-bold">{kb.document_count || 0}</p>
            <p className="text-xs text-muted-foreground">Docs</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-bold">{kb.chunk_count || 0}</p>
            <p className="text-xs text-muted-foreground">Chunks</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="font-bold">{((kb.total_tokens || 0) / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Tokens</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onOpen}>
            <FileText className="w-4 h-4 mr-1" /> Documentos
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
