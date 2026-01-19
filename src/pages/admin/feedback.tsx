import { useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAdminFeedback, useUpdateFeedback } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FEEDBACK_TYPES, FEEDBACK_STATUSES, FEEDBACK_PRIORITIES } from '@/lib/constants/backoffice';

export default function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: feedback = [], isLoading } = useAdminFeedback(statusFilter || undefined);
  const updateMutation = useUpdateFeedback();
  const { toast } = useToast();
  
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { status: status as any }
      });
      toast({ title: 'Estado actualizado' });
    } catch (error) {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    }
  };
  
  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { priority: priority as any }
      });
      toast({ title: 'Prioridad actualizada' });
    } catch (error) {
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback de Usuarios</h1>
          <p className="text-muted-foreground">Gestiona el feedback recibido</p>
        </div>
        
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(FEEDBACK_STATUSES).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        {feedback.map((item: any) => {
          const typeConfig = FEEDBACK_TYPES[item.type as keyof typeof FEEDBACK_TYPES] || FEEDBACK_TYPES.other;
          const statusConfig = FEEDBACK_STATUSES[item.status as keyof typeof FEEDBACK_STATUSES] || FEEDBACK_STATUSES.new;
          const priorityConfig = FEEDBACK_PRIORITIES[item.priority as keyof typeof FEEDBACK_PRIORITIES] || FEEDBACK_PRIORITIES.normal;
          
          return (
            <div key={item.id} className="bg-card rounded-xl border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${typeConfig.color}20` }}
                  >
                    <MessageSquare className="w-4 h-4" style={{ color: typeConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
                      >
                        {typeConfig.label}
                      </span>
                      <h3 className="font-medium text-foreground truncate">{item.subject}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.user?.full_name || item.user?.email || 'Anónimo'}
                      </span>
                      <span>{format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                      {item.page_url && (
                        <span className="truncate max-w-[200px]">{item.page_url}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Select 
                    value={item.priority} 
                    onValueChange={(value) => handlePriorityChange(item.id, value)}
                  >
                    <SelectTrigger className="w-28 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEEDBACK_PRIORITIES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={item.status} 
                    onValueChange={(value) => handleStatusChange(item.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FEEDBACK_STATUSES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
        
        {feedback.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No hay feedback {statusFilter && `con estado "${FEEDBACK_STATUSES[statusFilter as keyof typeof FEEDBACK_STATUSES]?.label}"`}
          </div>
        )}
      </div>
    </div>
  );
}
