/**
 * Portal Deadlines
 * Plazos y renovaciones del cliente
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortalMatters } from '@/hooks/use-portal-matters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  List
} from 'lucide-react';
import { format, differenceInDays, isAfter, isBefore, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Simular plazos - en producción vendría de un hook específico
interface Deadline {
  id: string;
  matter_id: string;
  matter_reference: string;
  matter_title: string;
  date: string;
  title: string;
  type: 'renewal' | 'response' | 'payment' | 'other';
  status: 'pending' | 'completed' | 'overdue';
}

export default function PortalDeadlines() {
  const { slug } = useParams<{ slug: string }>();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  
  const { data: matters, isLoading } = usePortalMatters();

  // Generar plazos simulados basados en expedientes
  const deadlines = useMemo<Deadline[]>(() => {
    if (!matters) return [];
    
    const result: Deadline[] = [];
    const now = new Date();
    
    matters.forEach((matter, idx) => {
      if (matter.deadline_count > 0) {
        // Simular un plazo por cada expediente con deadline_count > 0
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (idx + 1) * 15);
        
        result.push({
          id: `deadline-${matter.id}`,
          matter_id: matter.id,
          matter_reference: matter.reference,
          matter_title: matter.title,
          date: futureDate.toISOString(),
          title: matter.type === 'trademark' ? 'Renovación de marca' : 'Plazo administrativo',
          type: 'renewal',
          status: 'pending',
        });
      }
    });
    
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [matters]);

  const now = new Date();

  // Agrupar plazos
  const groupedDeadlines = useMemo(() => {
    const thisWeek = deadlines.filter(d => {
      const date = new Date(d.date);
      return isAfter(date, now) && isBefore(date, endOfWeek(now, { locale: es }));
    });
    
    const thisMonth = deadlines.filter(d => {
      const date = new Date(d.date);
      return isAfter(date, endOfWeek(now, { locale: es })) && isBefore(date, endOfMonth(now));
    });
    
    const nextMonths = deadlines.filter(d => {
      const date = new Date(d.date);
      return isAfter(date, endOfMonth(now));
    });
    
    const overdue = deadlines.filter(d => {
      const date = new Date(d.date);
      return isBefore(date, now) && d.status !== 'completed';
    });
    
    return { thisWeek, thisMonth, nextMonths, overdue };
  }, [deadlines, now]);

  const getUrgencyBadge = (date: string) => {
    const days = differenceInDays(new Date(date), now);
    
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Vencido</Badge>;
    }
    if (days <= 7) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Urgente</Badge>;
    }
    if (days <= 30) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Próximo</Badge>;
    }
    return null;
  };

  const DeadlineCard = ({ deadline }: { deadline: Deadline }) => {
    const days = differenceInDays(new Date(deadline.date), now);
    
    return (
      <Link
        to={`/portal/${slug}/matters/${deadline.matter_id}`}
        className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
          days < 0 ? 'bg-red-100' : days <= 7 ? 'bg-red-100' : days <= 30 ? 'bg-amber-100' : 'bg-blue-100'
        }`}>
          <Calendar className={`w-6 h-6 ${
            days < 0 ? 'text-red-600' : days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-blue-600'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium group-hover:text-primary transition-colors">
              {deadline.title}
            </h3>
            {getUrgencyBadge(deadline.date)}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {deadline.matter_title} • {deadline.matter_reference}
          </p>
          <p className="text-sm font-medium mt-1">
            {format(new Date(deadline.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          {days >= 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`}
            </p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </Link>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-12" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plazos y Renovaciones</h1>
          <p className="text-muted-foreground">
            Fechas importantes de tus expedientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="w-4 h-4 mr-1" />
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <CalendarDays className="w-4 h-4 mr-1" />
            Calendario
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total plazos</span>
            </div>
            <p className="text-2xl font-bold mt-1">{deadlines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Esta semana</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{groupedDeadlines.thisWeek.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Este mes</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-600">{groupedDeadlines.thisMonth.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Próximos</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{groupedDeadlines.nextMonths.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="space-y-6">
          {/* Vencidos */}
          {groupedDeadlines.overdue.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Vencidos
                </CardTitle>
                <CardDescription>Plazos que requieren atención inmediata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedDeadlines.overdue.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Esta semana */}
          {groupedDeadlines.thisWeek.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Esta semana
                </CardTitle>
                <CardDescription>Plazos que vencen en los próximos 7 días</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedDeadlines.thisWeek.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Este mes */}
          {groupedDeadlines.thisMonth.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Este mes
                </CardTitle>
                <CardDescription>Plazos durante el resto del mes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedDeadlines.thisMonth.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Próximos meses */}
          {groupedDeadlines.nextMonths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Próximos meses
                </CardTitle>
                <CardDescription>Plazos a más largo plazo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedDeadlines.nextMonths.map((deadline) => (
                  <DeadlineCard key={deadline.id} deadline={deadline} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sin plazos */}
          {deadlines.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 opacity-50 mb-4" />
                <h3 className="font-medium text-lg">Sin plazos pendientes</h3>
                <p className="text-muted-foreground">
                  No tienes plazos próximos en tus expedientes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-medium text-lg">Vista calendario</h3>
            <p className="text-muted-foreground">
              Próximamente disponible
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
