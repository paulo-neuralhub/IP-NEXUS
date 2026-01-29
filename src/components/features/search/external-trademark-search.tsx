import { useState } from 'react';
import { 
  Search, 
  Globe, 
  Filter,
  ExternalLink,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { useUnifiedTrademarkSearch, type TrademarkSource, type UnifiedTrademarkResult } from '@/hooks/use-external-search';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const SOURCES = [
  { id: 'euipo' as TrademarkSource, name: 'EUIPO', color: '#003399' },
  { id: 'oepm' as TrademarkSource, name: 'OEPM', color: '#C60C30' },
  { id: 'tmview' as TrademarkSource, name: 'TMView', color: '#00A651' },
  { id: 'wipo' as TrademarkSource, name: 'WIPO', color: '#0072BC' },
];

const OFFICES = [
  { code: 'EM', name: 'EUIPO', flag: '🇪🇺' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'US', name: 'USPTO', flag: '🇺🇸' },
  { code: 'GB', name: 'UKIPO', flag: '🇬🇧' },
  { code: 'DE', name: 'DPMA', flag: '🇩🇪' },
  { code: 'FR', name: 'INPI', flag: '🇫🇷' },
  { code: 'CN', name: 'CNIPA', flag: '🇨🇳' },
];

interface ExternalTrademarkSearchProps {
  onSelect?: (result: UnifiedTrademarkResult) => void;
  compact?: boolean;
}

export function ExternalTrademarkSearch({ onSelect, compact }: ExternalTrademarkSearchProps) {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState<TrademarkSource[]>(['euipo', 'tmview']);
  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const { results, isLoading, error, sources } = useUnifiedTrademarkSearch({
    query: searchQuery,
    sources: selectedSources,
    nice_classes: selectedClasses.length > 0 ? selectedClasses : undefined,
    offices: selectedOffices.length > 0 ? selectedOffices : undefined,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query.trim());
    }
  };
  
  const toggleSource = (sourceId: TrademarkSource) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };
  
  const clearFilters = () => {
    setSelectedClasses([]);
    setSelectedOffices([]);
  };
  
  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar marcas en bases de datos externas..."
              className="pl-11 h-12 text-lg"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-muted")}
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!query.trim() || selectedSources.length === 0}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="ml-2">Buscar</span>
          </Button>
        </div>
        
        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4 space-y-4">
              {/* Fuentes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fuentes
                </label>
                <div className="flex gap-2">
                  {SOURCES.map(source => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => toggleSource(source.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        selectedSources.includes(source.id)
                          ? "text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      style={selectedSources.includes(source.id) ? { backgroundColor: source.color } : undefined}
                    >
                      {source.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Oficinas */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Oficinas (TMView)
                </label>
                <div className="flex flex-wrap gap-2">
                  {OFFICES.map(office => (
                    <button
                      key={office.code}
                      type="button"
                      onClick={() => setSelectedOffices(prev =>
                        prev.includes(office.code)
                          ? prev.filter(o => o !== office.code)
                          : [...prev, office.code]
                      )}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                        selectedOffices.includes(office.code)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted"
                      )}
                    >
                      {office.flag} {office.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Clases Niza */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Clases Niza
                    {selectedClasses.length > 0 && (
                      <span className="text-muted-foreground ml-2">
                        ({selectedClasses.length} seleccionadas)
                      </span>
                    )}
                  </label>
                  {(selectedClasses.length > 0 || selectedOffices.length > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 45 }, (_, i) => i + 1).map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClasses(prev =>
                        prev.includes(cls)
                          ? prev.filter(c => c !== cls)
                          : [...prev, cls]
                      )}
                      className={cn(
                        "w-8 h-8 rounded text-xs font-medium transition-colors",
                        selectedClasses.includes(cls)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
      
      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error al buscar: {(error as Error).message}</span>
        </div>
      )}
      
      {/* Resultados */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {isLoading ? 'Buscando...' : `${results.length} resultados`}
            </h3>
            <div className="flex gap-2">
              {selectedSources.includes('euipo') && sources.euipo && (
                <Badge style={{ backgroundColor: '#003399' }} className="text-white">
                  EUIPO: {sources.euipo.trademarks?.length || 0}
                </Badge>
              )}
              {selectedSources.includes('tmview') && sources.tmview && (
                <Badge style={{ backgroundColor: '#00A651' }} className="text-white">
                  TMView: {sources.tmview.trademarks?.length || 0}
                </Badge>
              )}
              {selectedSources.includes('wipo') && sources.wipo && (
                <Badge style={{ backgroundColor: '#0072BC' }} className="text-white">
                  WIPO: {sources.wipo.marks?.length || 0}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {results.map((result, index) => (
              <TrademarkResultCard 
                key={`${result.source}-${index}`} 
                result={result}
                onSelect={onSelect}
                compact={compact}
              />
            ))}
          </div>
          
          {!isLoading && results.length === 0 && searchQuery && (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron marcas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TrademarkResultCard({ 
  result,
  onSelect,
  compact
}: { 
  result: UnifiedTrademarkResult;
  onSelect?: (result: UnifiedTrademarkResult) => void;
  compact?: boolean;
}) {
  const source = SOURCES.find(s => s.id === result.source);
  const applicant = result.applicant_name || result.applicant || result.holder_name;
  const number = result.application_number || result.tm_number || result.int_reg_number;
  const filingDate = result.filing_date || result.int_reg_date;
  
  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:border-primary transition-colors"
        onClick={() => onSelect?.(result)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge 
                  style={{ backgroundColor: source?.color }}
                  className="text-white text-xs"
                >
                  {source?.name}
                </Badge>
                <span className="font-medium">{result.mark_name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {applicant} · Clases: {result.nice_classes?.join(', ')}
              </p>
            </div>
            <Badge variant={result.status === 'Registered' ? 'default' : 'secondary'}>
              {result.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:border-muted-foreground/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                style={{ backgroundColor: source?.color }}
                className="text-white"
              >
                {source?.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {number}
              </span>
              {result.similarity_score && (
                <Badge variant="outline">
                  {Math.round(result.similarity_score * 100)}% similar
                </Badge>
              )}
            </div>
            
            <h4 className="font-semibold text-lg">
              {result.mark_name}
            </h4>
            
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                <strong>Titular:</strong> {applicant}
              </span>
              {result.nice_classes && (
                <span>
                  <strong>Clases:</strong> {result.nice_classes.join(', ')}
                </span>
              )}
              <span>
                <strong>Estado:</strong> {result.status}
              </span>
            </div>
          </div>
          
          {result.image_url && (
            <img 
              src={result.image_url} 
              alt={result.mark_name}
              className="w-16 h-16 object-contain border rounded"
            />
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Solicitud: {filingDate}
            {result.expiry_date && ` · Vence: ${result.expiry_date}`}
          </div>
          <div className="flex gap-2">
            {onSelect && (
              <Button size="sm" variant="outline" onClick={() => onSelect(result)}>
                Seleccionar
              </Button>
            )}
            <Button size="sm" variant="ghost" asChild>
              <a href="#" className="flex items-center gap-1">
                Ver detalles <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExternalTrademarkSearch;
