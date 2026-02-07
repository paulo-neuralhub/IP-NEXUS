/**
 * MatterDeadlinesTab - Pestaña de plazos del expediente
 */

import { useState } from 'react';
import { Calendar, Clock, Plus, Check, AlertTriangle, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMatterDeadlines, useCompleteMatterDeadline } from '@/hooks/use-matter-deadlines';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AddDeadlineModal } from './AddDeadlineModal';
import { useToast } from '@/hooks/use-toast';

const DEADLINE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  official: { label: 'Oficial', icon: <Clock className="h-4 w-4" /> },
  internal: { label: 'Interno', icon: <Calendar className="h-4 w-4" /> },
  renewal: { label: 'Renovación', icon: <Bell className="h-4 w-4" /> },
  response: { label: 'Respuesta', icon: <AlertTriangle className="h-4 w-4" /> },
};

interface MatterDeadlinesTabProps {
  matterId: string;
}

export function MatterDeadlinesTab({ matterId }: MatterDeadlinesTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'overdue' | 'all'>('pending');
  const { toast } = useToast();
  
  const { data: deadlines, isLoading } = useMatterDeadlines(matterId);
  const completeDeadline = useCompleteMatterDeadline();

  const handleComplete = async (id: string) => {
    try {
      await completeDeadline.mutateAsync(id);
      toast({ title: 'Plazo completado' });
    } catch {
      toast({ title: 'Error al completar', variant: 'destructive' });
    }
  };

  const getDeadlineStatus = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return { label: 'Completado', color: 'bg-green-100 text-green-700', urgent: false };
    
    const date = new Date(dueDate);
    const now = new Date();
    
    if (isPast(date)) {
      return { label: 'Vencido', color: 'bg-red-100 text-red-700', urgent: true };
    }
    
    if (isWithinInterval(date, { start: now, end: addDays(now, 7) })) {
      return { label: 'Urgente', color: 'bg-orange-100 text-orange-700', urgent: true };
    }
    
    if (isWithinInterval(date, { start: now, end: addDays(now, 30) })) {
      return { label: 'Próximo', color: 'bg-yellow-100 text-yellow-700', urgent: false };
    }
    
    return { label: 'Programado', color: 'bg-blue-100 text-blue-700', urgent: false };
  };

  const allSorted = [...(deadlines || [])].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const sortedDeadlines = allSorted.filter((d) => {
    if (filter === 'pending') return !d.is_completed;
    if (filter === 'overdue') return !d.is_completed && isPast(new Date(d.due_date));
    return true;
  });

  const pendingCount = (deadlines || []).filter(d => !d.is_completed).length;
  const overdueCount = (deadlines || []).filter(d => !d.is_completed && isPast(new Date(d.due_date))).length;

  return (
    <div className="space-y-3">
      {/* Sub-tabs outside the card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pendientes
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">{pendingCount}</Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant={filter === 'overdue' ? 'destructive' : 'outline'}
            onClick={() => setFilter('overdue')}
          >
            Vencidos
            {overdueCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 px-1.5 text-xs">{overdueCount}</Badge>
            )}
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir plazo
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : !sortedDeadlines?.length ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No hay plazos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === 'overdue' ? 'Sin plazos vencidos' : filter === 'pending' ? 'Añade el primer plazo del expediente' : 'Sin plazos registrados'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDeadlines.map((deadline) => {
                const status = getDeadlineStatus(deadline.due_date, deadline.is_completed);
                const typeConfig = DEADLINE_TYPE_CONFIG[deadline.deadline_type || 'internal'] || DEADLINE_TYPE_CONFIG.internal;
                
                return (
                  <div 
                    key={deadline.id} 
                    className={cn(
                      "flex items-start justify-between p-4 border rounded-lg",
                      deadline.is_completed && "opacity-60",
                      status.urgent && !deadline.is_completed && "border-destructive/50 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        deadline.is_completed ? "bg-primary/20 text-primary" : "bg-muted"
                      )}>
                        {deadline.is_completed ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          typeConfig.icon
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          deadline.is_completed && "line-through"
                        )}>
                          {deadline.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={status.color} variant="secondary">
                            {status.label}
                          </Badge>
                          <Badge variant="outline">{typeConfig.label}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(deadline.due_date), "dd MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        {deadline.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {deadline.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {!deadline.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(deadline.id)}
                        disabled={completeDeadline.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDeadlineModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        matterId={matterId}
      />
    </div>
  );
}
