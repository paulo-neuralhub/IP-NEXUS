/**
 * IP-SPIDER - Result Card con diseño SILK
 * Tarjeta de resultado con barra de similitud neumórfica
 */

import { useState } from 'react';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  X,
  Eye,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RESULT_TYPES, RESULT_STATUSES } from '@/lib/constants/spider';
import type { WatchResult, WatchResultStatus } from '@/types/spider';
import { useMarkResultReviewed } from '@/hooks/use-spider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  result: WatchResult;
  onViewDetail?: () => void;
}

function getSimilarityConfig(score: number) {
  if (score >= 86) return {
    label: 'Crítica',
    bgGradient: 'linear-gradient(135deg, #fef2f2, #ffffff)',
    borderColor: '#fca5a5',
    textColor: '#dc2626',
    barColor: 'linear-gradient(90deg, #ef4444, #dc2626)',
    isUrgent: true
  };
  if (score >= 76) return {
    label: 'Alta',
    bgGradient: 'linear-gradient(135deg, #fff7ed, #ffffff)',
    borderColor: '#fdba74',
    textColor: '#ea580c',
    barColor: 'linear-gradient(90deg, #f97316, #ea580c)',
    isUrgent: false
  };
  if (score >= 61) return {
    label: 'Media',
    bgGradient: 'linear-gradient(135deg, #fffbeb, #ffffff)',
    borderColor: '#fcd34d',
    textColor: '#d97706',
    barColor: 'linear-gradient(90deg, #f59e0b, #d97706)',
    isUrgent: false
  };
  return {
    label: 'Baja',
    bgGradient: 'linear-gradient(135deg, #f0fdf4, #ffffff)',
    borderColor: '#bbf7d0',
    textColor: '#16a34a',
    barColor: 'linear-gradient(90deg, #22c55e, #16a34a)',
    isUrgent: false
  };
}

export function SilkResultCard({ result, onViewDetail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const markReviewed = useMarkResultReviewed();
  
  const typeConfig = RESULT_TYPES[result.result_type];
  const statusConfig = RESULT_STATUSES[result.status];
  const similarityScore = result.similarity_score ?? 0;
  const similarityConfig = getSimilarityConfig(similarityScore);
  
  const handleMarkStatus = async (status: WatchResultStatus) => {
    await markReviewed.mutateAsync({ id: result.id, status });
  };

  return (
    <div 
      className="rounded-[14px] border border-black/[0.06] p-5 hover:border-[rgba(0,180,216,0.15)] transition-all"
      style={{ background: '#f1f4f9' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0a2540] truncate">{result.title}</h3>
            <span 
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide"
              style={{ 
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color 
              }}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{typeConfig?.label}</p>
        </div>
        
        {/* Similarity Badge */}
        <div className="relative flex-shrink-0">
          {/* LED para similitud crítica */}
          {similarityConfig.isUrgent && (
            <>
              <div 
                className="absolute -inset-1.5 rounded-[12px] animate-[led-pulse_2s_ease-in-out_infinite]"
                style={{
                  background: `${similarityConfig.textColor}15`,
                  border: `2px solid ${similarityConfig.textColor}30`
                }}
              />
              <div 
                className="absolute -inset-1.5 rounded-[12px] animate-[led-ping_1.5s_ease-out_infinite]"
                style={{
                  border: `2px solid ${similarityConfig.textColor}20`
                }}
              />
            </>
          )}
          <div 
            className="relative px-3 py-2 rounded-[10px] border text-center min-w-[60px]"
            style={{ 
              background: similarityConfig.bgGradient,
              borderColor: similarityConfig.borderColor
            }}
          >
            <p 
              className="text-lg font-bold leading-none"
              style={{ color: similarityConfig.textColor }}
            >
              {similarityScore}%
            </p>
            <p 
              className="text-[9px] font-medium mt-0.5"
              style={{ color: similarityConfig.textColor }}
            >
              {similarityConfig.label}
            </p>
          </div>
        </div>
      </div>

      {/* Similarity Bar - Neumorphic */}
      <div className="mt-4">
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{
            background: '#e2e8f0',
            boxShadow: 'inset 2px 2px 4px #cdd1dc, inset -2px -2px 4px #ffffff'
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${similarityScore}%`,
              background: similarityConfig.barColor,
              boxShadow: `0 0 8px ${similarityConfig.textColor}40`
            }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && result.similarity_details && (
        <div className="mt-4 pt-4 border-t border-black/[0.06] grid grid-cols-3 gap-4">
          {result.similarity_details.phonetic_score && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fonética</p>
              <p className="text-sm font-semibold text-[#0a2540]">{result.similarity_details.phonetic_score}%</p>
            </div>
          )}
          {result.similarity_details.visual_score && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Visual</p>
              <p className="text-sm font-semibold text-[#0a2540]">{result.similarity_details.visual_score}%</p>
            </div>
          )}
          {result.similarity_details.conceptual_score && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Conceptual</p>
              <p className="text-sm font-semibold text-[#0a2540]">{result.similarity_details.conceptual_score}%</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        <span>
          Detectado {formatDistanceToNow(new Date(result.detected_at), { 
            addSuffix: true, 
            locale: es 
          })}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-black/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-1">
          {result.source_url && (
            <a
              href={result.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Ver fuente <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-2 p-1 text-muted-foreground hover:text-foreground rounded"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {result.status === 'new' && (
          <div className="flex items-center gap-2">
            {/* Descartar - Ghost SILK */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-black/[0.04]"
              onClick={() => handleMarkStatus('dismissed')}
              disabled={markReviewed.isPending}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Descartar
            </Button>
            
            {/* Amenaza - Outline Red SILK */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleMarkStatus('threat')}
              disabled={markReviewed.isPending}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Amenaza
            </Button>
            
            {/* Revisar - Primary SILK */}
            <button
              className="h-8 px-4 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 transition-all hover:shadow-lg relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
                boxShadow: '0 2px 8px rgba(0, 180, 216, 0.3)'
              }}
              onClick={onViewDetail}
            >
              {/* White line bottom */}
              <span 
                className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.4)' }}
              />
              <Eye className="w-3.5 h-3.5" />
              Revisar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
