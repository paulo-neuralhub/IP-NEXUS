import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  ExternalLink, 
  Gavel,
  Eye,
  Palette
} from 'lucide-react';
import type { WatchResult, Watchlist } from '@/types/spider';

interface VisualComparisonProps {
  result: WatchResult;
  watchlist: Watchlist;
  onDismiss?: () => void;
  onMarkThreat?: () => void;
  onTakeAction?: () => void;
}

export function VisualComparisonCard({
  result,
  watchlist,
  onDismiss,
  onMarkThreat,
  onTakeAction,
}: VisualComparisonProps) {
  const visualScore = result.visual_similarity ?? 0;
  const colorScore = result.color_similarity ?? 0;
  const combinedScore = result.combined_score ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-destructive';
    if (score >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Crítico';
    if (score >= 0.6) return 'Alto';
    if (score >= 0.4) return 'Medio';
    return 'Bajo';
  };

  const getScoreBadgeVariant = (score: number): 'destructive' | 'secondary' | 'outline' => {
    if (score >= 0.8) return 'destructive';
    if (score >= 0.6) return 'secondary';
    return 'outline';
  };

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Comparación Visual</h3>
        </div>
        <Badge variant={getScoreBadgeVariant(combinedScore)}>
          {getScoreLabel(combinedScore)} · {Math.round(combinedScore * 100)}%
        </Badge>
      </div>

      {/* Side by Side Comparison */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Original Logo */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">
              Tu marca
            </p>
            <div className="aspect-square bg-muted/50 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
              {watchlist.image_url ? (
                <img 
                  src={watchlist.image_url} 
                  alt="Tu logo" 
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Sin imagen</span>
              )}
            </div>
            {/* Original Colors */}
            {watchlist.color_palette && watchlist.color_palette.length > 0 && (
              <div className="flex justify-center gap-1">
                {watchlist.color_palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detected Logo */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">
              Resultado detectado
            </p>
            <div className="aspect-square bg-muted/50 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
              {result.comparison_image_url ? (
                <img 
                  src={result.comparison_image_url} 
                  alt="Logo detectado" 
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : result.screenshot_url ? (
                <img 
                  src={result.screenshot_url} 
                  alt="Screenshot" 
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Sin imagen</span>
              )}
            </div>
            {/* Result Colors */}
            {result.result_colors && result.result_colors.length > 0 && (
              <div className="flex justify-center gap-1">
                {result.result_colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Similarity Scores */}
        <div className="space-y-4 mb-6">
          {/* Visual Similarity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                Similitud Visual
              </span>
              <span className={cn("font-semibold", getScoreColor(visualScore))}>
                {Math.round(visualScore * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  visualScore >= 0.8 ? "bg-destructive" : 
                  visualScore >= 0.6 ? "bg-warning" : "bg-muted-foreground"
                )}
                style={{ width: `${visualScore * 100}%` }}
              />
            </div>
          </div>

          {/* Color Similarity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Palette className="h-4 w-4" />
                Similitud de Colores
              </span>
              <span className={cn("font-semibold", getScoreColor(colorScore))}>
                {Math.round(colorScore * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  colorScore >= 0.8 ? "bg-destructive" : 
                  colorScore >= 0.6 ? "bg-warning" : "bg-muted-foreground"
                )}
                style={{ width: `${colorScore * 100}%` }}
              />
            </div>
          </div>

          {/* Combined Score */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Score Total</span>
              <span className={cn("text-2xl font-bold", getScoreColor(combinedScore))}>
                {Math.round(combinedScore * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis (if available) */}
        {result.similarity_details?.analysis && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Análisis IA</p>
                <p className="text-sm text-muted-foreground">
                  {result.similarity_details.analysis}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result Info */}
        <div className="p-4 bg-muted/30 rounded-xl mb-6 space-y-2">
          <h4 className="font-medium text-foreground">{result.title}</h4>
          {result.applicant_name && (
            <p className="text-sm text-muted-foreground">
              Solicitante: {result.applicant_name}
              {result.applicant_country && ` (${result.applicant_country})`}
            </p>
          )}
          {result.source_url && (
            <a 
              href={result.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver fuente <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onDismiss}
          >
            <X className="h-4 w-4 mr-2" />
            Descartar
          </Button>
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={onMarkThreat}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar Amenaza
          </Button>
          <Button 
            variant="default" 
            className="flex-1"
            onClick={onTakeAction}
          >
            <Gavel className="h-4 w-4 mr-2" />
            Iniciar Acción
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact visual comparison for list views
 */
export function VisualComparisonMini({
  result,
  watchlist,
  onClick,
}: {
  result: WatchResult;
  watchlist?: Watchlist;
  onClick?: () => void;
}) {
  const combinedScore = result.combined_score ?? 0;
  const hasVisualData = result.visual_similarity != null || result.comparison_image_url;

  if (!hasVisualData) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors w-full text-left"
    >
      {/* Thumbnails */}
      <div className="flex -space-x-2">
        {watchlist?.image_url && (
          <div className="w-10 h-10 rounded-lg border-2 border-background overflow-hidden bg-white">
            <img 
              src={watchlist.image_url} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {result.comparison_image_url && (
          <div className="w-10 h-10 rounded-lg border-2 border-background overflow-hidden bg-white">
            <img 
              src={result.comparison_image_url} 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Score */}
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          Similitud visual: {Math.round(combinedScore * 100)}%
        </p>
        <p className="text-xs text-muted-foreground">
          Click para ver comparación
        </p>
      </div>

      <Eye className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
