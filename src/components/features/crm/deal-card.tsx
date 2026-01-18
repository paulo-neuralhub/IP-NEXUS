import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Deal, DealPriority } from '@/types/crm';
import { formatDate, cn } from '@/lib/utils';
import { User, Calendar, AlertCircle } from 'lucide-react';
import { DEAL_PRIORITIES } from '@/lib/constants/crm';

interface Props {
  deal: Deal;
  onClick?: () => void;
  isDragging?: boolean;
}

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}

export function DealCard({ deal, onClick, isDragging }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: deal.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const isOverdue = deal.expected_close_date && 
    new Date(deal.expected_close_date) < new Date() &&
    deal.status === 'open';

  const priorityConfig = DEAL_PRIORITIES[deal.priority as DealPriority];
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-card rounded-lg p-3 shadow-sm border cursor-pointer",
        "hover:shadow-md hover:border-border/80 transition-all",
        (isDragging || isSorting) && "opacity-50 shadow-lg rotate-2",
        isOverdue && "border-l-2 border-l-destructive"
      )}
    >
      {/* Título y prioridad */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-foreground text-sm line-clamp-2">
          {deal.title}
        </h4>
        {deal.priority !== 'medium' && priorityConfig && (
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: priorityConfig.color }}
            title={priorityConfig.label}
          />
        )}
      </div>
      
      {/* Valor */}
      {deal.value && (
        <p className="text-lg font-semibold text-foreground mb-2">
          {formatCurrency(deal.value, deal.currency)}
        </p>
      )}
      
      {/* Contacto */}
      {deal.contact && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <User className="w-3 h-3" />
          <span className="truncate">{deal.contact.name}</span>
        </div>
      )}
      
      {/* Fecha esperada */}
      {deal.expected_close_date && (
        <div className={cn(
          "flex items-center gap-1 text-xs",
          isOverdue ? "text-destructive" : "text-muted-foreground"
        )}>
          {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          <span>{formatDate(deal.expected_close_date)}</span>
        </div>
      )}
    </div>
  );
}
