import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  ChevronLeft, FileText, Edit, Download, Copy, 
  CheckCircle2, Clock, Archive, Star, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { GeneratedDocument, GeneratedDocumentStatus } from '@/types/document-generation';

const STATUS_CONFIG: Record<GeneratedDocumentStatus, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: 'Borrador', icon: Clock, color: 'bg-muted text-muted-foreground' },
  reviewing: { label: 'En revisión', icon: Edit, color: 'bg-warning/20 text-warning' },
  approved: { label: 'Aprobado', icon: CheckCircle2, color: 'bg-success/20 text-success' },
  exported: { label: 'Exportado', icon: Download, color: 'bg-primary/20 text-primary' },
  archived: { label: 'Archivado', icon: Archive, color: 'bg-muted text-muted-foreground' },
};

export default function DocumentViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const { data: document, isLoading } = useQuery({
    queryKey: ['generated-document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select(`
          *,
          template:document_templates(id, name, category),
          matter:matters(id, title, reference)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as GeneratedDocument & {
        template: { id: string; name: string; category: string } | null;
        matter: { id: string; title: string; reference: string } | null;
      };
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ content, status }: { content?: string; status?: GeneratedDocumentStatus }) => {
      const { error } = await supabase
        .from('generated_documents')
        .update({ 
          ...(content && { content }),
          ...(status && { status }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-document', id] });
      toast.success('Documento actualizado');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleStartEdit = () => {
    setEditContent(document?.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ content: editContent });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">Documento no encontrado</h3>
        <Button onClick={() => navigate('/app/genius/documents')}>
          Volver a documentos
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[document.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/genius/documents')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {document.template && (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{document.template.name}</span>
                  <span>•</span>
                </>
              )}
              <span>
                Creado {format(new Date(document.created_at), 'PPP', { locale: es })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={cn("flex items-center gap-1", statusConfig.color)}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>

          <Select 
            value={document.status} 
            onValueChange={(val) => updateMutation.mutate({ status: val as GeneratedDocumentStatus })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="reviewing">En revisión</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="exported">Exportado</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Contenido</CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(document.content);
                      toast.success('Copiado al portapapeles');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
              />
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{document.content}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Versión</p>
                <p className="font-medium">v{document.version}</p>
              </div>
              
              {document.matter && (
                <div>
                  <p className="text-muted-foreground">Expediente</p>
                  <p className="font-medium">{document.matter.reference || document.matter.title}</p>
                </div>
              )}

              {document.ai_model_used && (
                <div>
                  <p className="text-muted-foreground">Modelo IA</p>
                  <p className="font-medium">{document.ai_model_used}</p>
                </div>
              )}

              {document.ai_tokens_used && (
                <div>
                  <p className="text-muted-foreground">Tokens usados</p>
                  <p className="font-medium">{document.ai_tokens_used.toLocaleString()}</p>
                </div>
              )}

              {document.generation_time_ms && (
                <div>
                  <p className="text-muted-foreground">Tiempo generación</p>
                  <p className="font-medium">{(document.generation_time_ms / 1000).toFixed(1)}s</p>
                </div>
              )}

              {document.user_rating && (
                <div>
                  <p className="text-muted-foreground">Valoración</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= document.user_rating! 
                            ? "fill-warning text-warning" 
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variables Used */}
          {document.variables_resolved && Object.keys(document.variables_resolved).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variables utilizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm max-h-[300px] overflow-y-auto">
                {Object.entries(document.variables_resolved).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">{key}</span>
                    <span className="font-medium truncate max-w-[150px]" title={String(value)}>
                      {String(value).slice(0, 30)}{String(value).length > 30 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
