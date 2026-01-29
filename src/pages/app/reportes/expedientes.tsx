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
import { ArrowLeft, Briefcase, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import { ExportButton } from '@/components/features/export';
import { useMatters } from '@/hooks/use-matters';
import { format } from 'date-fns';
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
import type { Matter } from '@/types/matters';

export default function ReporteExpedientesPage() {
  const { setTitle } = usePageTitle();
  const { data: matters = [], isLoading } = useMatters();
  
  const [filters, setFilters] = useState({
    status: 'all',
    ipType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    setTitle('Reporte de Expedientes');
  }, [setTitle]);

  const filteredMatters = useMemo(() => {
    return matters.filter((matter: Matter) => {
      if (filters.status !== 'all' && matter.status !== filters.status) return false;
      if (filters.ipType !== 'all' && matter.type !== filters.ipType) return false;
      if (filters.dateFrom && matter.created_at && new Date(matter.created_at) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && matter.created_at && new Date(matter.created_at) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [matters, filters]);

  const exportColumns = [
    { key: 'reference', header: 'Referencia', width: 15 },
    { key: 'title', header: 'Título', width: 30 },
    { key: 'type', header: 'Tipo PI', width: 12 },
    { key: 'status', header: 'Estado', width: 12 },
    { 
      key: 'created_at', 
      header: 'Fecha Creación', 
      width: 15,
      format: (value: unknown) => value ? format(new Date(value as string), 'dd/MM/yyyy', { locale: es }) : '-'
    },
    { key: 'jurisdiction', header: 'Jurisdicción', width: 12 },
  ];

  const uniqueStatuses = [...new Set(matters.map((m: Matter) => m.status).filter(Boolean))];
  const uniqueIpTypes = [...new Set(matters.map((m: Matter) => m.type).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/reportes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="p-2 rounded-lg bg-primary">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reporte de Expedientes</h1>
            <p className="text-sm text-muted-foreground">
              {filteredMatters.length} expedientes encontrados
            </p>
          </div>
        </div>
        <ExportButton
          data={filteredMatters as unknown as Record<string, unknown>[]}
          columns={exportColumns}
          filename={`expedientes_${format(new Date(), 'yyyyMMdd')}`}
          title="Reporte de Expedientes"
          subtitle={`Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`}
        />
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
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status || ''}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo PI</Label>
              <Select
                value={filters.ipType}
                onValueChange={(v) => setFilters({ ...filters, ipType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueIpTypes.map((type) => (
                    <SelectItem key={type} value={type || ''}>
                      {type}
                    </SelectItem>
                  ))}
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
                <TableHead>Referencia</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo PI</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Jurisdicción</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron expedientes
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatters.slice(0, 50).map((matter: Matter) => (
                  <TableRow key={matter.id}>
                    <TableCell className="font-medium">{matter.reference || '-'}</TableCell>
                    <TableCell>{matter.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{matter.type || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{matter.status || '-'}</Badge>
                    </TableCell>
                    <TableCell>{matter.jurisdiction || '-'}</TableCell>
                    <TableCell>
                      {matter.created_at
                        ? format(new Date(matter.created_at), 'dd/MM/yyyy', { locale: es })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredMatters.length > 50 && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              Mostrando 50 de {filteredMatters.length} resultados. Exporta para ver todos.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
