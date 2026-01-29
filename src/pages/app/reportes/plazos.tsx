import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Clock, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import { ExportButton } from '@/components/features/export';
import { useDeadlines, type MatterDeadline } from '@/hooks/useDeadlines';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ReportePlazosPage() {
  const { setTitle } = usePageTitle();
  const { deadlines = [], isLoading } = useDeadlines();
  
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    setTitle('Reporte de Plazos');
  }, [setTitle]);

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter((deadline: MatterDeadline) => {
      const dueDate = deadline.deadline_date;
      if (!dueDate) return false;
      if (filters.status === 'overdue' && !isPast(new Date(dueDate))) return false;
      if (filters.status === 'upcoming' && (isPast(new Date(dueDate)) || !isBefore(new Date(dueDate), addDays(new Date(), 30)))) return false;
      if (filters.status === 'today' && !isToday(new Date(dueDate))) return false;
      if (filters.priority !== 'all' && deadline.priority !== filters.priority) return false;
      if (filters.dateFrom && new Date(dueDate) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(dueDate) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [deadlines, filters]);

  const stats = useMemo(() => ({
    total: deadlines.length,
    overdue: deadlines.filter((d: MatterDeadline) => d.deadline_date && isPast(new Date(d.deadline_date)) && d.status !== 'completed').length,
    today: deadlines.filter((d: MatterDeadline) => d.deadline_date && isToday(new Date(d.deadline_date))).length,
    upcoming: deadlines.filter((d: MatterDeadline) => d.deadline_date && isBefore(new Date(d.deadline_date), addDays(new Date(), 7)) && !isPast(new Date(d.deadline_date))).length,
  }), [deadlines]);

  const exportColumns = [
    { key: 'title', header: 'Título', width: 25 },
    { key: 'deadline_type', header: 'Tipo', width: 15 },
    { 
      key: 'deadline_date', 
      header: 'Fecha Vencimiento', 
      width: 15,
      format: (value: unknown) => value ? format(new Date(value as string), 'dd/MM/yyyy', { locale: es }) : '-'
    },
    { key: 'priority', header: 'Prioridad', width: 10 },
    { key: 'status', header: 'Estado', width: 12 },
  ];

  const getStatusBadge = (dueDate: string | null, status: string | null) => {
    if (status === 'completed') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
    }
    if (dueDate && isPast(new Date(dueDate))) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
    }
    if (dueDate && isToday(new Date(dueDate))) {
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Hoy</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/reportes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2 rounded-lg bg-warning text-warning-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reporte de Plazos</h1>
            <p className="text-sm text-muted-foreground">
              {filteredDeadlines.length} plazos encontrados
            </p>
          </div>
        </div>
        <ExportButton
          data={filteredDeadlines as unknown as Record<string, unknown>[]}
          columns={exportColumns}
          filename={`plazos_${format(new Date(), 'yyyyMMdd')}`}
          title="Reporte de Plazos"
          subtitle={`Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-sm text-muted-foreground">Vencidos</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.today}</div>
            <p className="text-sm text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-sm text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="upcoming">Próximos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={filters.priority}
                onValueChange={(v) => setFilters({ ...filters, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredDeadlines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron plazos
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeadlines.slice(0, 50).map((deadline: MatterDeadline) => (
                  <TableRow 
                    key={deadline.id}
                    className={cn(
                      deadline.deadline_date && isPast(new Date(deadline.deadline_date)) && deadline.status !== 'completed' && 'bg-destructive/10'
                    )}
                  >
                    <TableCell className="font-medium">{deadline.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deadline.deadline_type || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      {deadline.deadline_date ? format(new Date(deadline.deadline_date), 'dd/MM/yyyy', { locale: es }) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={deadline.priority === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {deadline.priority || 'normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(deadline.deadline_date, deadline.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredDeadlines.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Mostrando 50 de {filteredDeadlines.length} resultados. Exporta para ver todos.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
