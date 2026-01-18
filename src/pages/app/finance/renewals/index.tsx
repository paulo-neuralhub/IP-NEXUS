import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Send,
  RefreshCw
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRenewalSchedule, useInstructRenewal } from '@/hooks/use-finance';
import { RENEWAL_STATUSES, RENEWAL_TYPES, formatCurrency } from '@/lib/constants/finance';
import { MATTER_TYPES } from '@/lib/constants/matters';
import type { RenewalSchedule, RenewalStatus } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function RenewalRow({ renewal, onInstruct }: {
  renewal: RenewalSchedule;
  onInstruct: (id: string, instruction: 'renew' | 'abandon') => void;
}) {
  const statusConfig = RENEWAL_STATUSES[renewal.status];
  const daysUntil = differenceInDays(new Date(renewal.due_date), new Date());
  
  const matterType = renewal.matter?.type ? MATTER_TYPES[renewal.matter.type as keyof typeof MATTER_TYPES] : null;
  
  return (
    <div className="p-4 hover:bg-muted/50">
      <div className="flex items-start gap-4">
        {/* Fecha */}
        <div className="text-center w-16 flex-shrink-0">
          <p className="text-2xl font-bold text-foreground">
            {format(new Date(renewal.due_date), 'd')}
          </p>
          <p className="text-xs text-muted-foreground uppercase">
            {format(new Date(renewal.due_date), 'MMM', { locale: es })}
          </p>
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {matterType && (
                  <span 
                    className="text-lg"
                    style={{ color: matterType.color }}
                  >
                    {matterType.icon}
                  </span>
                )}
                <Link 
                  to={`/app/docket/${renewal.matter_id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {renewal.matter?.reference}
                </Link>
                <span className="text-muted-foreground">
                  {renewal.matter?.mark_name || renewal.matter?.title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {RENEWAL_TYPES[renewal.renewal_type]?.label || renewal.renewal_type}
                {renewal.matter?.jurisdiction && ` · ${renewal.matter.jurisdiction}`}
              </p>
            </div>
            
            {/* Status & Cost */}
            <div className="text-right">
              <span 
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
              {renewal.total_estimate && (
                <p className="text-lg font-bold text-foreground mt-1">
                  {formatCurrency(renewal.total_estimate)}
                </p>
              )}
            </div>
          </div>
          
          {/* Days indicator */}
          <div className="flex items-center gap-4 mt-3">
            <span className={cn(
              "text-sm font-medium",
              daysUntil < 0 && "text-destructive",
              daysUntil >= 0 && daysUntil <= 30 && "text-orange-500",
              daysUntil > 30 && "text-muted-foreground"
            )}>
              {daysUntil < 0 
                ? `Vencido hace ${Math.abs(daysUntil)} días`
                : daysUntil === 0 
                  ? 'Vence hoy'
                  : `Vence en ${daysUntil} días`
              }
            </span>
            
            {renewal.grace_period_end && renewal.status === 'in_grace' && (
              <span className="text-sm text-destructive">
                Gracia hasta: {format(new Date(renewal.grace_period_end), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
          
          {/* Actions */}
          {!renewal.client_instruction && ['upcoming', 'due', 'in_grace'].includes(renewal.status) && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => onInstruct(renewal.id, 'renew')}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Renovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInstruct(renewal.id, 'abandon')}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <XCircle className="w-4 h-4 mr-1" /> Abandonar
              </Button>
              <Button size="sm" variant="outline">
                <Send className="w-4 h-4 mr-1" /> Solicitar instrucción
              </Button>
            </div>
          )}
          
          {renewal.client_instruction && (
            <div className="mt-3">
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                renewal.client_instruction === 'renew' && "bg-green-100 text-green-700",
                renewal.client_instruction === 'abandon' && "bg-red-100 text-red-700"
              )}>
                {renewal.client_instruction === 'renew' ? '✓ Instrucción: Renovar' : '✗ Instrucción: Abandonar'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RenewalSchedulePage() {
  const [statusFilter, setStatusFilter] = useState<RenewalStatus[]>(['upcoming', 'due', 'in_grace']);
  
  const { data: renewals = [], isLoading } = useRenewalSchedule({ status: statusFilter });
  const instructMutation = useInstructRenewal();
  
  // Agrupar por mes
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, RenewalSchedule[]> = {};
    
    renewals.forEach(r => {
      const monthKey = r.due_date.slice(0, 7);
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(r);
    });
    
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [renewals]);
  
  // Stats
  const stats = {
    total: renewals.length,
    totalCost: renewals.reduce((sum, r) => sum + (r.total_estimate || 0), 0),
    awaitingInstruction: renewals.filter(r => !r.client_instruction).length,
    inGrace: renewals.filter(r => r.status === 'in_grace').length,
  };
  
  const handleInstruct = async (id: string, instruction: 'renew' | 'abandon') => {
    try {
      await instructMutation.mutateAsync({ id, instruction });
      toast.success(instruction === 'renew' ? 'Instrucción de renovación registrada' : 'Instrucción de abandono registrada');
    } catch {
      toast.error('Error al registrar instrucción');
    }
  };

  const toggleStatusFilter = (status: RenewalStatus) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(prev => prev.filter(s => s !== status));
    } else {
      setStatusFilter(prev => [...prev, status]);
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Renovaciones</h1>
          <p className="text-muted-foreground">Calendario de vencimientos y renovaciones</p>
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" /> Vista calendario
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Próximos 90 días</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Coste estimado</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalCost)}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Esperando instrucción</p>
          <p className="text-2xl font-bold text-orange-500">{stats.awaitingInstruction}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">En periodo de gracia</p>
          <p className="text-2xl font-bold text-destructive">{stats.inGrace}</p>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex gap-2">
        {Object.entries(RENEWAL_STATUSES).slice(0, 5).map(([key, config]) => (
          <button
            key={key}
            onClick={() => toggleStatusFilter(key as RenewalStatus)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              statusFilter.includes(key as RenewalStatus)
                ? "text-white"
                : "bg-muted hover:bg-muted/80"
            )}
            style={statusFilter.includes(key as RenewalStatus) ? { backgroundColor: config.color } : undefined}
          >
            {config.label}
          </button>
        ))}
      </div>
      
      {/* Timeline */}
      <div className="space-y-6">
        {groupedByMonth.map(([month, items]) => (
          <div key={month} className="bg-card rounded-xl border overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 border-b">
              <h3 className="font-semibold text-foreground capitalize">
                {format(new Date(month + '-01'), 'MMMM yyyy', { locale: es })}
              </h3>
            </div>
            <div className="divide-y">
              {items.map(renewal => (
                <RenewalRow 
                  key={renewal.id} 
                  renewal={renewal}
                  onInstruct={handleInstruct}
                />
              ))}
            </div>
          </div>
        ))}
        
        {renewals.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay renovaciones en el periodo seleccionado</p>
          </div>
        )}
      </div>
    </div>
  );
}
