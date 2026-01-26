/**
 * Portal Matters List
 * Lista de expedientes del cliente - DATOS REALES
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortalMatters } from '@/hooks/use-portal-matters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Briefcase,
  ArrowRight,
  Calendar,
  MapPin,
  Tag,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MATTER_STATUSES, MATTER_TYPES } from '@/lib/constants/matters';

export default function PortalMatters() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: matters, isLoading, error } = usePortalMatters();

  const filteredMatters = useMemo(() => {
    if (!matters) return [];
    
    return matters.filter((matter) => {
      const matchesSearch = 
        matter.title.toLowerCase().includes(search.toLowerCase()) ||
        matter.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || matter.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || matter.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [matters, search, typeFilter, statusFilter]);

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = { trademark: 'Marca', patent: 'Patente', design: 'Diseño' };
    const colors: Record<string, string> = { trademark: 'blue', patent: 'purple', design: 'green' };
    return <Badge className={`bg-${colors[type] || 'gray'}-100 text-${colors[type] || 'gray'}-700`}>{labels[type] || type}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = MATTER_STATUSES[status as keyof typeof MATTER_STATUSES];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge 
        variant="outline"
        style={{ 
          backgroundColor: `${config.color}20`, 
          color: config.color,
          borderColor: `${config.color}40`
        }}
      >
        {config.label}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trademark': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'patent': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'design': return { bg: 'bg-green-100', text: 'text-green-600' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: matters?.length || 0,
    trademarks: matters?.filter(m => m.type === 'trademark').length || 0,
    patents: matters?.filter(m => m.type === 'patent').length || 0,
    designs: matters?.filter(m => m.type === 'design').length || 0,
  }), [matters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-4 pb-4"><Skeleton className="h-12" /></CardContent></Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 mb-3" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar expedientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Expedientes</h1>
        <p className="text-muted-foreground">
          Gestiona y consulta todos tus expedientes de propiedad intelectual
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Marcas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.trademarks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">Patentes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.patents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Diseños</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.designs}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o referencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="trademark">Marcas</SelectItem>
                <SelectItem value="patent">Patentes</SelectItem>
                <SelectItem value="design">Diseños</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="granted">Concedidos</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Matters List */}
          <div className="space-y-3">
            {filteredMatters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto opacity-30 mb-4" />
                <p className="font-medium">No se encontraron expedientes</p>
                <p className="text-sm">Prueba ajustando los filtros de búsqueda</p>
              </div>
            ) : (
              filteredMatters.map((matter) => {
                const colors = getTypeColor(matter.type);
                return (
                  <Link
                    key={matter.id}
                    to={`/portal/${slug}/matters/${matter.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                        <Briefcase className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {matter.title}
                          </h3>
                          {getStatusBadge(matter.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{matter.reference}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {matter.jurisdiction && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {matter.jurisdiction}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(matter.created_at), 'd MMM yyyy', { locale: es })}
                          </span>
                          {matter.deadline_count > 0 && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-3 h-3" />
                              {matter.deadline_count} plazos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
