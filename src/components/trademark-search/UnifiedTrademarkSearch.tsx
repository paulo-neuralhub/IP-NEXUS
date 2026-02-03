import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { useUnifiedTrademarkSearch, type TrademarkSource, type UnifiedTrademarkResult } from '@/hooks/use-external-search';
import { NiceClassSelector } from '@/components/nice-class-selector';

interface UnifiedTrademarkSearchProps {
  onSelectResult?: (result: UnifiedTrademarkResult) => void;
  initialQuery?: string;
  compact?: boolean;
}

export function UnifiedTrademarkSearch({ 
  onSelectResult, 
  initialQuery = '',
  compact = false 
}: UnifiedTrademarkSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<TrademarkSource[]>(['euipo', 'tmview']);
  const [niceClasses, setNiceClasses] = useState<number[]>([]);
  const [offices, setOffices] = useState<string[]>([]);

  const { results, isLoading, error, sources } = useUnifiedTrademarkSearch({
    query: searchQuery,
    sources: selectedSources,
    nice_classes: niceClasses.length > 0 ? niceClasses : undefined,
    offices: offices.length > 0 ? offices : undefined,
  });

  const handleSearch = () => {
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };

  const toggleSource = (source: TrademarkSource) => {
    setSelectedSources(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const sourceLabels: Record<TrademarkSource, { label: string; icon: string; description: string }> = {
    euipo: { label: 'EUIPO', icon: '🇪🇺', description: 'Unión Europea' },
    tmview: { label: 'TMview', icon: '🌍', description: '70+ oficinas' },
    wipo: { label: 'WIPO Madrid', icon: '🌐', description: 'Sistema Madrid' },
    oepm: { label: 'OEPM', icon: '🇪🇸', description: 'España' },
  };

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase() || '';
    if (normalized.includes('registered') || normalized.includes('registrada')) return 'bg-emerald-600';
    if (normalized.includes('pending') || normalized.includes('pendiente')) return 'bg-amber-500';
    if (normalized.includes('expired') || normalized.includes('expirada')) return 'bg-destructive';
    if (normalized.includes('applied') || normalized.includes('solicitud')) return 'bg-primary';
    return 'bg-muted-foreground';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className={compact ? 'pb-2' : ''}>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Búsqueda Unificada de Marcas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <Input 
              placeholder="Nombre de marca a buscar..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>

          {/* Source Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Buscar en:</span>
            {(Object.entries(sourceLabels) as [TrademarkSource, typeof sourceLabels['euipo']][]).map(
              ([source, config]) => (
                <Toggle 
                  key={source}
                  pressed={selectedSources.includes(source)}
                  onPressedChange={() => toggleSource(source)}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </Toggle>
              )
            )}
          </div>

          {/* Nice Class Filter */}
          {!compact && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Clases Nice:</span>
              <div className="flex-1">
                <NiceClassSelector
                  value={niceClasses}
                  onChange={setNiceClasses}
                  multiple
                  placeholder="Filtrar por clases Nice (opcional)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Error en la búsqueda: {(error as Error).message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results by Source */}
      {searchQuery && !isLoading && results.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Resultados ({results.length})</span>
              <div className="flex gap-2">
                {sources.euipo && (
                  <Badge variant="outline">🇪🇺 EUIPO: {sources.euipo.trademarks?.length || 0}</Badge>
                )}
                {sources.tmview && (
                  <Badge variant="outline">🌍 TMview: {sources.tmview.trademarks?.length || 0}</Badge>
                )}
                {sources.wipo && (
                  <Badge variant="outline">🌐 WIPO: {sources.wipo.marks?.length || 0}</Badge>
                )}
                {sources.oepm && (
                  <Badge variant="outline">🇪🇸 OEPM: {sources.oepm.trademarks?.length || 0}</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Fuente</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead className="w-[120px]">Nº Solicitud</TableHead>
                    <TableHead className="w-[100px]">Clases</TableHead>
                    <TableHead className="w-[100px]">Estado</TableHead>
                    {onSelectResult && <TableHead className="w-[80px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow 
                      key={`${result.source}-${result.application_number || result.tm_number || result.int_reg_number || idx}`}
                      className={onSelectResult ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={() => onSelectResult?.(result)}
                    >
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {sourceLabels[result.source]?.icon} {sourceLabels[result.source]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.image_url && (
                          <img 
                            src={result.image_url} 
                            alt={result.mark_name}
                            className="w-8 h-8 object-contain inline-block mr-2"
                          />
                        )}
                        {result.mark_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.applicant_name || result.applicant || result.holder_name || '-'}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {result.application_number || result.tm_number || result.int_reg_number || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {result.nice_classes?.slice(0, 3).map(c => (
                            <Badge key={c} variant="secondary" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                          {(result.nice_classes?.length || 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(result.nice_classes?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(result.status)} text-white text-xs`}>
                          {result.status}
                        </Badge>
                      </TableCell>
                      {onSelectResult && (
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Seleccionar
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && !isLoading && results.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron resultados para "{searchQuery}"</p>
            <p className="text-sm mt-2">Prueba con otros términos o selecciona más fuentes de búsqueda</p>
          </CardContent>
        </Card>
      )}

      {/* WIPO Global Brand Database Widget */}
      {searchQuery && (
        <WIPOBrandDatabaseWidget searchTerm={searchQuery} />
      )}
    </div>
  );
}

// Widget para WIPO Global Brand Database (sin API pública)
function WIPOBrandDatabaseWidget({ searchTerm }: { searchTerm: string }) {
  const wipoSearchUrl = `https://branddb.wipo.int/en/quicksearch/brand?` +
    `brandName_value=${encodeURIComponent(searchTerm)}&brandName_type=C`;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🌐 WIPO Global Brand Database
          <Badge variant="outline">50+ países</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Búsqueda manual - WIPO no permite consultas automáticas a esta base de datos
        </p>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={() => window.open(wipoSearchUrl, '_blank')}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Buscar "{searchTerm}" en WIPO Global Brand Database
        </Button>
      </CardContent>
    </Card>
  );
}

export { WIPOBrandDatabaseWidget };
