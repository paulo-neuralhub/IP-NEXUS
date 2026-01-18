import { useState } from 'react';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  X,
  Eye
} from 'lucide-react';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { RESULT_TYPES, RESULT_PRIORITIES, RESULT_STATUSES } from '@/lib/constants/spider';
import type { WatchResult, WatchResultStatus } from '@/types/spider';
import { useMarkResultReviewed } from '@/hooks/use-spider';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface Props {
  result: WatchResult;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onViewDetail?: () => void;
}

export function WatchResultCard({ result, selected, onSelect, onViewDetail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const markReviewed = useMarkResultReviewed();
  
  const typeConfig = RESULT_TYPES[result.result_type];
  const priorityConfig = RESULT_PRIORITIES[result.priority];
  const statusConfig = RESULT_STATUSES[result.status];
  
  const daysToOpposition = result.opposition_deadline
    ? differenceInDays(new Date(result.opposition_deadline), new Date())
    : null;
  
  const handleMarkStatus = async (status: WatchResultStatus) => {
    await markReviewed.mutateAsync({ id: result.id, status });
  };
  
  return (
    <div className={cn(
      "border rounded-xl p-4 transition-all bg-card",
      result.status === 'new' && "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20",
      result.status === 'threat' && "border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/20",
      selected && "ring-2 ring-primary"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {onSelect && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(checked as boolean)}
            className="mt-1"
          />
        )}
        
        {/* Priority indicator */}
        <div 
          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: priorityConfig.color }}
          title={priorityConfig.label}
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{result.title}</h3>
              <p className="text-sm text-muted-foreground">
                {typeConfig.label} · {result.source}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span 
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color 
                }}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
          
          {/* Similarity bar */}
          {result.similarity_score && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  Similitud: {result.similarity_score}%
                </span>
                <span className="text-xs text-muted-foreground">
                  ({getSimilarityLabel(result.similarity_score)})
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${result.similarity_score}%`,
                    backgroundColor: getSimilarityColor(result.similarity_score)
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Detalles expandidos */}
          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {/* Similarity breakdown */}
              {result.similarity_details && (
                <div className="grid grid-cols-3 gap-4">
                  {result.similarity_details.phonetic_score && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fonética</p>
                      <p className="font-medium">{result.similarity_details.phonetic_score}%</p>
                    </div>
                  )}
                  {result.similarity_details.visual_score && (
                    <div>
                      <p className="text-xs text-muted-foreground">Visual</p>
                      <p className="font-medium">{result.similarity_details.visual_score}%</p>
                    </div>
                  )}
                  {result.similarity_details.conceptual_score && (
                    <div>
                      <p className="text-xs text-muted-foreground">Conceptual</p>
                      <p className="font-medium">{result.similarity_details.conceptual_score}%</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Applicant info */}
              {result.applicant_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Solicitante</p>
                  <p className="text-sm">{result.applicant_name} {result.applicant_country && `(${result.applicant_country})`}</p>
                </div>
              )}
              
              {/* Classes */}
              {result.classes && result.classes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Clases Niza</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.classes.map(c => (
                      <span key={c} className="px-2 py-0.5 text-xs bg-muted rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* AI Analysis */}
              {result.similarity_details?.analysis && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Análisis IA</p>
                  <p className="text-sm text-purple-800 dark:text-purple-300">{result.similarity_details.analysis}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Detectado {formatDistanceToNow(new Date(result.detected_at), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
              {daysToOpposition !== null && daysToOpposition > 0 && (
                <span className={cn(
                  "font-medium",
                  daysToOpposition <= 30 && "text-red-500",
                  daysToOpposition > 30 && daysToOpposition <= 60 && "text-orange-500"
                )}>
                  ⏱ Oposición: {daysToOpposition} días
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.source_url && (
                <a
                  href={result.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Ver en fuente <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {result.status === 'new' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkStatus('dismissed')}
                    disabled={markReviewed.isPending}
                  >
                    <X className="w-4 h-4 mr-1" /> Descartar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleMarkStatus('threat')}
                    disabled={markReviewed.isPending}
                  >
                    <AlertTriangle className="w-4 h-4 mr-1" /> Amenaza
                  </Button>
                  <Button
                    size="sm"
                    onClick={onViewDetail}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Revisar
                  </Button>
                </>
              )}
              {result.status === 'threat' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onViewDetail}
                >
                  Tomar acción
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSimilarityColor(score: number): string {
  if (score >= 85) return '#EF4444';
  if (score >= 70) return '#F97316';
  if (score >= 50) return '#F59E0B';
  return '#22C55E';
}

function getSimilarityLabel(score: number): string {
  if (score >= 85) return 'Crítica';
  if (score >= 70) return 'Alta';
  if (score >= 50) return 'Media';
  return 'Baja';
}
