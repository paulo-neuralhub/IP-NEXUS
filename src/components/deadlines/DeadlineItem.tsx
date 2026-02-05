// ============================================================
// IP-NEXUS - DEADLINE ITEM COMPONENT
// SILK Design System - NeoBadge with line-defined containers
// ============================================================

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle2,
  CalendarPlus,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NeoBadge } from '@/components/ui/neo-badge';
import type { MatterDeadline } from '@/hooks/useDeadlines';

export interface UrgencyInfo {
  status: string;
  label: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'slate';
  priority: number;
}

export interface DeadlineItemProps {
  deadline: MatterDeadline;
  urgency: UrgencyInfo;
  onComplete: () => void;
  onPostpone: (days: number) => void;
  onView: () => void;
}

// Calculate days remaining for badge
function calcularDiasRestantes(fechaLimite: string): number {
  const hoy = new Date();
  const limite = new Date(fechaLimite);
  const diff = differenceInDays(limite, hoy);
  return Math.max(0, diff);
}

// Get color based on days remaining
function getUrgencyColor(dias: number, isCompleted: boolean): string {
  if (isCompleted) return '#22c55e';
  if (dias <= 0) return '#ef4444';
  if (dias <= 5) return '#ef4444';
  if (dias <= 15) return '#f59e0b';
  return '#64748b';
}

export function DeadlineItem({
  deadline,
  urgency,
  onComplete,
  onPostpone,
  onView,
}: DeadlineItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = deadline.status === 'completed';
  const diasRestantes = calcularDiasRestantes(deadline.deadline_date);
  const esUrgente = diasRestantes <= 5 && !isCompleted;
  const color = getUrgencyColor(diasRestantes, isCompleted);

  // Determine left border color based on urgency
  const getBorderLeftStyle = () => {
    if (isCompleted) return {};
    if (diasRestantes <= 3) return { 
      borderLeft: '3px solid #ef4444',
      boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)'
    };
    if (diasRestantes <= 7) return { 
      borderLeft: '3px solid #f59e0b',
      boxShadow: '0 0 0 1px rgba(245, 158, 11, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)'
    };
    return { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' };
  };

  return (
    <div
      className="group cursor-pointer transition-all duration-200"
      style={{
        padding: '15px 16px',
        borderRadius: '14px',
        border: isHovered 
          ? '1px solid rgba(0, 180, 216, 0.15)' 
          : '1px solid rgba(0, 0, 0, 0.06)',
        background: '#f1f4f9',
        marginBottom: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: isCompleted ? 0.6 : 1,
        ...getBorderLeftStyle(),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      {/* NeoBadge with days remaining */}
      <NeoBadge 
        value={isCompleted ? '✓' : diasRestantes} 
        label={isCompleted ? '' : 'días'} 
        color={color} 
        size="md" 
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span 
            style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#0a2540',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
            className="truncate"
          >
            {deadline.title}
          </span>
          
          {esUrgente && (
            <span 
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#ef44440a',
                color: '#ef4444',
                flexShrink: 0,
              }}
            >
              URGENTE
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <span style={{ fontSize: '12px', color: '#64748b' }} className="truncate">
            {deadline.matter?.reference || 'Sin expediente'}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Vence: {format(new Date(deadline.deadline_date), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
        </div>
      </div>
      
      {/* Actions - visible on hover */}
      <div 
        className="flex items-center gap-1 transition-opacity duration-200"
        style={{ opacity: isHovered ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isCompleted && (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs"
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                color: '#22c55e',
                borderRadius: '8px',
              }}
              onClick={onComplete}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs"
                  style={{
                    background: 'rgba(0, 180, 216, 0.08)',
                    color: '#00b4d8',
                    borderRadius: '8px',
                  }}
                >
                  <CalendarPlus className="h-3 w-3 mr-1" />
                  Posponer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onPostpone(1)}>+1 día</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPostpone(3)}>+3 días</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPostpone(7)}>+1 semana</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPostpone(14)}>+2 semanas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 text-xs"
          style={{
            background: 'rgba(100, 116, 139, 0.08)',
            color: '#64748b',
            borderRadius: '8px',
          }}
          onClick={onView}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </Button>
      </div>
      
      {/* Chevron indicator */}
      <ChevronRight 
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        style={{ 
          color: '#d0d5dd',
          transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
        }} 
      />
    </div>
  );
}
