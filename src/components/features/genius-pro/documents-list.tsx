import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  FileText, Search, Filter, Download, Copy, Eye, Check, 
  AlertTriangle, Clock, CheckCircle, XCircle, Scale
} from 'lucide-react';
import { useGeneratedDocuments, useGeneratedDocument, useApproveDocument } from '@/hooks/genius/useGeniusPro';
import { DOCUMENT_TYPES, GENIUS_PRO_DISCLAIMERS } from '@/lib/constants/genius-pro';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
    draft: { label: 'Borrador', variant: 'secondary', icon: Clock },
    reviewed: { label: 'Revisado', variant: 'default', icon: Eye },
    approved: { label: 'Aprobado', variant: 'default', icon: CheckCircle },
    rejected: { label: 'Rechazado', variant: 'destructive', icon: XCircle },
  };
  
  const { label, variant, icon: Icon } = config[status] || config.draft;
  
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function DocumentCard({ document, onClick }: { document: any; onClick: () => void }) {
  const docType = DOCUMENT_TYPES.find(t => t.id === document.document_type);
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium truncate">{document.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {docType?.label || document.document_type}
                </p>
              </div>
              <StatusBadge status={document.status} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(document.created_at), { addSuffix: true, locale: es })}
              </span>
              {document.jurisdiction && (
                <Badge variant="outline" className="text-xs">{document.jurisdiction}</Badge>
              )}
              {document.user_approved && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Check className="h-3 w-3" />
                  Aprobado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: document, isLoading } = useGeneratedDocument(id);
  const approveMutation = useApproveDocument();
  
  if (isLoading || !document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(document.content_markdown);
    toast.success('Documento copiado al portapapeles');
  };
  
  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{document.title}</h2>
          <p className="text-muted-foreground">
            Generado {formatDistanceToNow(new Date(document.created_at), { addSuffix: true, locale: es })}
          </p>
        </div>
        <StatusBadge status={document.status} />
      </div>
      
      {/* Disclaimer */}
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          {GENIUS_PRO_DISCLAIMERS.general.es}
        </AlertDescription>
      </Alert>
      
      {/* Verification Warnings */}
      {document.verification_warnings && document.verification_warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Advertencias de verificación:</strong>
            <ul className="list-disc list-inside mt-1">
              {document.verification_warnings.map((w: any, i: number) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Content Tabs */}
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          {document.citations && <TabsTrigger value="citations">Citas ({document.citations.length})</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: document.content_html }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="markdown" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-x-auto">
                {document.content_markdown}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        {document.citations && (
          <TabsContent value="citations" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {document.citations.map((citation: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <div>
                        <p className="font-medium">{citation.reference}</p>
                        {citation.quote && (
                          <p className="text-sm text-muted-foreground mt-1 italic">"{citation.quote}"</p>
                        )}
                        {citation.url && (
                          <a 
                            href={citation.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 block"
                          >
                            Ver fuente →
                          </a>
                        )}
                        {!citation.verified && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            No verificado
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copiar
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Descargar
        </Button>
        {!document.user_approved && (
          <Button onClick={handleApprove} disabled={approveMutation.isPending}>
            <Check className="h-4 w-4 mr-2" />
            Aprobar documento
          </Button>
        )}
      </div>
    </div>
  );
}

export function DocumentsList() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('__all__');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { data: documents = [], isLoading } = useGeneratedDocuments(
    typeFilter !== '__all__' ? typeFilter : undefined
  );
  
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los tipos</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No hay documentos"
          description="Los documentos generados con IP-GENIUS PRO aparecerán aquí"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredDocs.map((doc) => (
            <DocumentCard 
              key={doc.id} 
              document={doc} 
              onClick={() => setSelectedId(doc.id)}
            />
          ))}
        </div>
      )}
      
      {/* Detail Sheet */}
      <Sheet open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>Detalle del documento</SheetTitle>
            <SheetDescription>Vista detallada del documento generado</SheetDescription>
          </SheetHeader>
          {selectedId && (
            <DocumentDetail id={selectedId} onClose={() => setSelectedId(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
