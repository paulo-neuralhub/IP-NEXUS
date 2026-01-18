import { useState } from 'react';
import { 
  Eye, 
  Upload, 
  Loader2, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useCompareTrademark } from '@/hooks/use-vision';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CompareResults {
  similar_marks?: Array<{
    mark_id: string;
    mark_name: string;
    similarity_score: number;
    similarity_type: string;
    image_url?: string;
  }>;
  dominant_colors?: string[];
}

export function TrademarkComparator() {
  const compareMutation = useCompareTrademark();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [markName, setMarkName] = useState('');
  const [niceClasses, setNiceClasses] = useState<string>('');
  const [results, setResults] = useState<CompareResults | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };
  
  const handleCompare = async () => {
    if (!file) return;
    
    try {
      const classes = niceClasses
        .split(',')
        .map(c => parseInt(c.trim()))
        .filter(c => !isNaN(c));
      
      const result = await compareMutation.mutateAsync({
        imageFile: file,
        markName: markName || undefined,
        niceClasses: classes.length > 0 ? classes : undefined,
      });
      
      setResults(result as CompareResults);
    } catch (error) {
      toast.error('Error al comparar');
    }
  };
  
  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return '#EF4444';
    if (score >= 0.6) return '#F59E0B';
    if (score >= 0.4) return '#EAB308';
    return '#22C55E';
  };
  
  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Muy alta';
    if (score >= 0.6) return 'Alta';
    if (score >= 0.4) return 'Media';
    return 'Baja';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Comparador Visual de Marcas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Analiza la similitud visual de tu marca con marcas registradas existentes
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-card rounded-xl border p-4 space-y-4">
          <h3 className="font-medium text-foreground">Tu Marca</h3>
          
          {/* Image Upload */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
              preview ? "border-green-500" : "border-border hover:border-muted-foreground/50"
            )}
          >
            {preview ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-lg"
                />
                <button
                  onClick={() => { setFile(null); setPreview(null); setResults(null); }}
                  className="absolute top-2 right-2 p-1 bg-card rounded-full shadow hover:bg-muted"
                >
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">Sube la imagen de tu marca</p>
                <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, SVG</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          
          {/* Mark Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre de marca (opcional)
            </label>
            <input
              type="text"
              value={markName}
              onChange={(e) => setMarkName(e.target.value)}
              placeholder="Ej: NEXUS"
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
          </div>
          
          {/* Nice Classes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Clases Nice (opcional)
            </label>
            <input
              type="text"
              value={niceClasses}
              onChange={(e) => setNiceClasses(e.target.value)}
              placeholder="Ej: 9, 42, 35"
              className="w-full border rounded-lg px-3 py-2 bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separadas por comas para filtrar resultados
            </p>
          </div>
          
          <button
            onClick={handleCompare}
            disabled={!file || compareMutation.isPending}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {compareMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analizando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Buscar similares
              </>
            )}
          </button>
        </div>
        
        {/* Results */}
        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-medium text-foreground mb-4">Resultados</h3>
          
          {!results && !compareMutation.isPending && (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground/20 mb-2" />
              <p className="text-muted-foreground">Sube una imagen para comparar</p>
            </div>
          )}
          
          {compareMutation.isPending && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
              <p className="text-muted-foreground">Buscando marcas similares...</p>
            </div>
          )}
          
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className={cn(
                "p-4 rounded-lg",
                results.similar_marks && results.similar_marks.length > 0 
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-green-50 border border-green-200"
              )}>
                <div className="flex items-center gap-2">
                  {results.similar_marks && results.similar_marks.length > 0 ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="font-medium text-yellow-800">
                        {results.similar_marks.length} marca(s) similar(es) encontrada(s)
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-medium text-green-800">
                        No se encontraron marcas similares
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Similar Marks */}
              {results.similar_marks?.map((mark, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex gap-3">
                    {mark.image_url && (
                      <img 
                        src={mark.image_url} 
                        alt={mark.mark_name}
                        className="w-16 h-16 object-contain rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground">{mark.mark_name}</p>
                        <span 
                          className="px-2 py-0.5 text-xs font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${getSimilarityColor(mark.similarity_score)}20`,
                            color: getSimilarityColor(mark.similarity_score)
                          }}
                        >
                          {(mark.similarity_score * 100).toFixed(0)}% - {getSimilarityLabel(mark.similarity_score)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Similitud: {mark.similarity_type}
                      </p>
                      {/* Similarity Bar */}
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${mark.similarity_score * 100}%`,
                            backgroundColor: getSimilarityColor(mark.similarity_score)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Analysis Details */}
              {results.dominant_colors && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-foreground mb-2">Colores dominantes</p>
                  <div className="flex gap-2">
                    {results.dominant_colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-lg shadow-inner border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
