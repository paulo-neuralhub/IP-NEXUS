// ============================================
// src/pages/app/legal-ops/assistant.tsx
// AI Assistant Page
// ============================================

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import { AssistantChat } from '@/components/legal-ops';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Search, FileText } from 'lucide-react';
import { useRAGSearch } from '@/hooks/legal-ops';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AssistantPage() {
  const { setTitle } = usePageTitle();
  const [searchParams] = useSearchParams();
  
  const clientId = searchParams.get('client') || undefined;
  const matterId = searchParams.get('matter') || undefined;

  useEffect(() => {
    setTitle('Asistente IA');
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Asistente Legal IA</h1>
          <p className="text-sm text-muted-foreground">
            Búsqueda inteligente y asistencia con documentos
          </p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="w-4 h-4" />
            Chat Asistente
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Búsqueda RAG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AssistantChat 
                context={{ client_id: clientId, matter_id: matterId }}
                title="Asistente Legal"
              />
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Contexto Activo</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {clientId || matterId ? (
                    <div className="space-y-2">
                      {clientId && (
                        <div className="flex items-center justify-between">
                          <span>Cliente:</span>
                          <Badge variant="outline">{clientId.slice(0, 8)}...</Badge>
                        </div>
                      )}
                      {matterId && (
                        <div className="flex items-center justify-between">
                          <span>Expediente:</span>
                          <Badge variant="outline">{matterId.slice(0, 8)}...</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>
                      El asistente buscará en todos los documentos de tu organización.
                      Para filtrar por cliente o expediente, accede desde su ficha.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Capacidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 text-primary" />
                      <span>Búsqueda en documentos con OCR</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Search className="w-4 h-4 mt-0.5 text-primary" />
                      <span>Análisis de comunicaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bot className="w-4 h-4 mt-0.5 text-primary" />
                      <span>Resúmenes y sugerencias</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <RAGSearchPanel clientId={clientId} matterId={matterId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// RAG Search Panel
function RAGSearchPanel({ clientId, matterId }: { clientId?: string; matterId?: string }) {
  const [query, setQuery] = useState('');
  const ragSearch = useRAGSearch();

  const handleSearch = () => {
    if (!query.trim()) return;
    ragSearch.mutate({
      query,
      client_id: clientId,
      matter_id: matterId,
      limit: 20
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5" />
          Búsqueda en Documentos (RAG)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en documentos, comunicaciones..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={ragSearch.isPending || !query.trim()}>
            {ragSearch.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {ragSearch.data && ragSearch.data.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {ragSearch.data.length} resultados encontrados
            </p>
            
            {ragSearch.data.map((result) => (
              <Card key={result.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {result.source_type}
                      </Badge>
                      {result.metadata.doc_type && (
                        <Badge variant="secondary" className="text-xs">
                          {result.metadata.doc_type}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm truncate">
                      {result.metadata.title || 'Sin título'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                      {result.chunk_text}
                    </p>
                    {result.metadata.client_name && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Cliente: {result.metadata.client_name}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={result.relevance >= 0.8 ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {Math.round(result.relevance * 100)}%
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {ragSearch.data && ragSearch.data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
