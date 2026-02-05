/**
 * PipelineKanbanColumn - Columna del pipeline con header SILK
 * NeoBadges para contadores, gradientes por estado, dots con glow
 */

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PipelineKanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  totalValue?: number;
  children: React.ReactNode;
  isWon?: boolean;
  isLost?: boolean;
  probability?: number;
  onAddItem?: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

// Helper to get SILK gradient styles based on column color
function getColumnStyles(color: string, isWon?: boolean, isLost?: boolean) {
  // Won = green, Lost = red
  if (isWon) {
    return {
      headerGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      headerBorder: '1px solid #86efac',
      headerBorderBottom: '2px solid #4ade80',
      dotGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      dotGlow: '0 0 8px rgba(34, 197, 94, 0.6)',
      titleColor: '#166534',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
      counterBorder: '#bbf7d0',
      counterColor: '#15803d',
      valueBg: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
      valueBorder: '#bbf7d0',
      valueColor: '#15803d',
      valueShadow: '0 2px 6px rgba(34, 197, 94, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }
  
  if (isLost) {
    return {
      headerGradient: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
      headerBorder: '1px solid #fca5a5',
      headerBorderBottom: '2px solid #f87171',
      dotGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      dotGlow: '0 0 8px rgba(239, 68, 68, 0.6)',
      titleColor: '#991b1b',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      counterBorder: '#fecaca',
      counterColor: '#b91c1c',
      valueBg: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
      valueBorder: '#fecaca',
      valueColor: '#b91c1c',
      valueShadow: '0 2px 6px rgba(239, 68, 68, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }

  // Map common colors to SILK gradients
  const colorLower = color.toLowerCase();
  
  // Cyan / Blue tones (Contactado, etc.)
  if (colorLower.includes('cyan') || colorLower.includes('#06b6d4') || colorLower.includes('#0ea5e9') || colorLower.includes('#00b4d8')) {
    return {
      headerGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      headerBorder: '1px solid #a5f3fc',
      headerBorderBottom: '2px solid #67e8f9',
      dotGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      dotGlow: '0 0 8px rgba(6, 182, 212, 0.6)',
      titleColor: '#164e63',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 100%)',
      counterBorder: '#a5f3fc',
      counterColor: '#0e7490',
      valueBg: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)',
      valueBorder: '#a5f3fc',
      valueColor: '#0e7490',
      valueShadow: '0 2px 6px rgba(0, 180, 216, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }
  
  // Orange tones (Propuesta, etc.)
  if (colorLower.includes('orange') || colorLower.includes('#f97316') || colorLower.includes('#ea580c') || colorLower.includes('#fb923c')) {
    return {
      headerGradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
      headerBorder: '1px solid #fdba74',
      headerBorderBottom: '2px solid #fb923c',
      dotGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      dotGlow: '0 0 8px rgba(249, 115, 22, 0.6)',
      titleColor: '#7c2d12',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #ffedd5 100%)',
      counterBorder: '#fed7aa',
      counterColor: '#c2410c',
      valueBg: 'linear-gradient(135deg, #ffedd5 0%, #ffffff 100%)',
      valueBorder: '#fed7aa',
      valueColor: '#c2410c',
      valueShadow: '0 2px 6px rgba(249, 115, 22, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }
  
  // Purple / Violet tones (Negociación, etc.) - Using blue per SILK spec (no purple)
  if (colorLower.includes('purple') || colorLower.includes('#a855f7') || colorLower.includes('#8b5cf6') || colorLower.includes('violet')) {
    return {
      headerGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      headerBorder: '1px solid #93c5fd',
      headerBorderBottom: '2px solid #60a5fa',
      dotGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      dotGlow: '0 0 8px rgba(59, 130, 246, 0.6)',
      titleColor: '#1e40af',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
      counterBorder: '#bfdbfe',
      counterColor: '#1d4ed8',
      valueBg: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      valueBorder: '#bfdbfe',
      valueColor: '#1d4ed8',
      valueShadow: '0 2px 6px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }
  
  // Blue tones
  if (colorLower.includes('blue') || colorLower.includes('#3b82f6') || colorLower.includes('#2563eb')) {
    return {
      headerGradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      headerBorder: '1px solid #93c5fd',
      headerBorderBottom: '2px solid #60a5fa',
      dotGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      dotGlow: '0 0 8px rgba(59, 130, 246, 0.6)',
      titleColor: '#1e40af',
      counterBg: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
      counterBorder: '#bfdbfe',
      counterColor: '#1d4ed8',
      valueBg: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
      valueBorder: '#bfdbfe',
      valueColor: '#1d4ed8',
      valueShadow: '0 2px 6px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    };
  }
  
  // Default: Slate (Lead, etc.)
  return {
    headerGradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    headerBorder: '1px solid #e2e8f0',
    headerBorderBottom: '2px solid #cbd5e1',
    dotGradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    dotGlow: '0 0 8px rgba(100, 116, 139, 0.4)',
    titleColor: '#1e293b',
    counterBg: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    counterBorder: '#e2e8f0',
    counterColor: '#475569',
    valueBg: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    valueBorder: '#e2e8f0',
    valueColor: '#334155',
    valueShadow: '0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
  };
}

export function PipelineKanbanColumn({
  id,
  title,
  color,
  count,
  totalValue = 0,
  children,
  isWon,
  isLost,
  probability,
  onAddItem,
}: PipelineKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = getColumnStyles(color, isWon, isLost);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl overflow-hidden transition-all w-[320px] flex-shrink-0',
        isOver && 'ring-2 ring-primary scale-[1.01]'
      )}
      style={{ 
        height: '100%',
        background: '#f1f4f9',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* SILK Header with gradient and NeoBadges */}
      <div 
        className="flex items-center justify-between p-4 rounded-t-xl"
        style={{
          background: styles.headerGradient,
          border: styles.headerBorder,
          borderBottom: styles.headerBorderBottom,
        }}
      >
        <div className="flex items-center gap-2">
          {/* Dot with glow */}
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: styles.dotGradient,
              boxShadow: styles.dotGlow,
            }}
          />
          
          <h3 
            className="font-bold text-sm truncate"
            style={{ color: styles.titleColor }}
          >
            {title}
          </h3>
          
          {/* Counter NeoBadge */}
          <div 
            className="px-2 py-0.5 rounded flex-shrink-0"
            style={{
              background: styles.counterBg,
              border: `1px solid ${styles.counterBorder}`,
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <span 
              className="text-xs font-bold"
              style={{ color: styles.counterColor }}
            >
              {count}
            </span>
          </div>
          
          {probability !== undefined && (
            <span 
              className="text-[10px] opacity-70"
              style={{ color: styles.titleColor }}
            >
              {probability}%
            </span>
          )}
        </div>
        
        {/* Value NeoBadge */}
        <div 
          className="px-3 py-1 rounded-lg flex-shrink-0"
          style={{
            background: styles.valueBg,
            border: `1px solid ${styles.valueBorder}`,
            boxShadow: styles.valueShadow,
          }}
        >
          <span 
            className="text-sm font-extrabold"
            style={{ 
              color: styles.valueColor,
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(totalValue)}
          </span>
        </div>
      </div>

      {/* Content - Cards area */}
      <div 
        className="flex-1 p-3 min-h-0 overflow-y-auto"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #e2e8f0',
          maxHeight: 'calc(100% - 80px)',
        }}
      >
        <div className="space-y-3 min-h-[100px]">
          {children}
        </div>

        {count === 0 && (
          <div className="flex flex-col items-center justify-center text-muted-foreground text-sm py-10">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
              }}
            >
              <span className="text-xl">
                {isWon ? '🎉' : isLost ? '😔' : '📭'}
              </span>
            </div>
            <p className="font-medium">Sin elementos</p>
            <p className="text-xs opacity-70 mt-0.5">Arrastra aquí</p>
          </div>
        )}
      </div>

      {/* Add button */}
      {onAddItem && !isWon && !isLost && (
        <div className="p-2 border-t border-slate-200/50 bg-white/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onAddItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir
          </Button>
        </div>
      )}
    </div>
  );
}
