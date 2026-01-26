// =============================================
// COMPONENTE: RecentActivity
// Timeline de actividad reciente
// =============================================

import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'matter_created' | 'matter_updated' | 'client_added' | 'email_sent' | 'call_made' | 'alert' | 'task_completed';
  title: string;
  description?: string;
  timestamp: Date;
  user?: string;
  link?: string;
}

export function RecentActivity() {
  // TODO: Reemplazar con datos reales
  const activities: Activity[] = [
    {
      id: '1',
      type: 'alert',
      title: 'Alerta Spider: marca similar detectada',
      description: 'NEXUS vs NEXIUS - Similitud 87%',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: '2',
      type: 'matter_created',
      title: 'Nuevo expediente creado',
      description: 'Marca ACME - Solicitud nacional',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      user: 'María G.',
    },
    {
      id: '3',
      type: 'task_completed',
      title: 'Tarea completada',
      description: 'Revisar documentación patente PCT',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'Carlos R.',
    },
    {
      id: '4',
      type: 'email_sent',
      title: 'Email enviado',
      description: 'Informe mensual a García Industries',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      user: 'María G.',
    },
    {
      id: '5',
      type: 'client_added',
      title: 'Nuevo cliente añadido',
      description: 'TechStart Solutions S.L.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      user: 'Admin',
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      matter_created: <Plus className="h-4 w-4" />,
      matter_updated: <Edit className="h-4 w-4" />,
      client_added: <User className="h-4 w-4" />,
      email_sent: <Mail className="h-4 w-4" />,
      call_made: <Phone className="h-4 w-4" />,
      alert: <AlertTriangle className="h-4 w-4" />,
      task_completed: <CheckCircle className="h-4 w-4" />,
    };
    return icons[type];
  };

  const getActivityColor = (type: Activity['type']) => {
    const colors = {
      matter_created: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      matter_updated: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      client_added: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
      email_sent: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
      call_made: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      alert: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
      task_completed: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    };
    return colors[type];
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">
          Actividad reciente
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          Ver todo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              {/* Icono */}
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                getActivityColor(activity.type)
              )}>
                {getActivityIcon(activity.type)}
              </div>

              {/* Contenido */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                  {activity.user && (
                    <>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
