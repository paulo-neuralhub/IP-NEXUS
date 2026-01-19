// src/components/backoffice/ipo/IPODashboard.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Globe,
  Activity,
  AlertTriangle,
  Key,
  RefreshCw,
  Search,
  ChevronRight,
  Circle,
  Plus,
  Loader2,
} from 'lucide-react';
import { useIPOStats, useIPOOffices } from '@/hooks/backoffice/useIPORegistry';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OFFICE_TIERS, REGIONS, CONNECTION_METHOD_TYPES } from '@/lib/constants/ipo-registry';

export function IPODashboard() {
  const { data: stats, isLoading: statsLoading } = useIPOStats();
  const [filters, setFilters] = useState({
    tier: '',
    healthStatus: '',
    region: '',
    search: '',
  });
  
  const { data: offices, isLoading: officesLoading, refetch } = useIPOOffices({
    tier: filters.tier ? parseInt(filters.tier) : undefined,
    healthStatus: filters.healthStatus || undefined,
    region: filters.region || undefined,
    search: filters.search || undefined,
  });

  const healthColors: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            IPO Master Registry
          </h1>
          <p className="text-muted-foreground">
            Gestión global de oficinas de propiedad intelectual
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={officesLoading}>
            {officesLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button asChild>
            <Link to="/backoffice/ipo/new">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Oficina
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-12 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-green-600">{stats.byHealth.healthy}</p>
                </div>
                <Circle className="h-6 w-6 fill-green-500 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Degradadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.byHealth.degraded}</p>
                </div>
                <Circle className="h-6 w-6 fill-yellow-500 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={stats.connectionsDown > 0 ? 'border-red-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Caídas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.connectionsDown}</p>
                </div>
                <AlertTriangle className={`h-6 w-6 ${stats.connectionsDown > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className={stats.credentialsExpiring > 0 ? 'border-amber-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credenciales</p>
                  <p className="text-2xl font-bold">{stats.credentialsExpiring}</p>
                  <p className="text-xs text-muted-foreground">por expirar</p>
                </div>
                <Key className={`h-6 w-6 ${stats.credentialsExpiring > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tier 1</p>
                  <p className="text-2xl font-bold">{stats.byTier.tier1}</p>
                  <p className="text-xs text-muted-foreground">críticas</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700">T1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sync 24h</p>
                  <p className="text-2xl font-bold">{stats.syncSuccessRate24h.toFixed(0)}%</p>
                </div>
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={filters.tier} 
              onValueChange={(v) => setFilters({ ...filters, tier: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los Tiers</SelectItem>
                <SelectItem value="1">Tier 1 (Críticas)</SelectItem>
                <SelectItem value="2">Tier 2 (Importantes)</SelectItem>
                <SelectItem value="3">Tier 3 (Secundarias)</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.healthStatus} 
              onValueChange={(v) => setFilters({ ...filters, healthStatus: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="healthy">🟢 Online</SelectItem>
                <SelectItem value="degraded">🟡 Degradadas</SelectItem>
                <SelectItem value="unhealthy">🔴 Caídas</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.region} 
              onValueChange={(v) => setFilters({ ...filters, region: v })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todas las regiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las regiones</SelectItem>
                {REGIONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Oficinas ({offices?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {officesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Estado</TableHead>
                  <TableHead className="w-[80px]">Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[80px]">Tier</TableHead>
                  <TableHead className="w-[100px]">Método</TableHead>
                  <TableHead>Última Sync</TableHead>
                  <TableHead className="w-[100px]">Éxito 7d</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron oficinas
                    </TableCell>
                  </TableRow>
                ) : (
                  offices?.map((office) => (
                    <TableRow key={office.id}>
                      <TableCell>
                        <div 
                          className={`w-3 h-3 rounded-full ${healthColors[office.traffic_light]}`} 
                          title={office.health_status || 'unknown'}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {office.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{office.name_short || office.name_official}</p>
                          {office.name_short && (
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {office.name_official}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={office.tier === 1 ? 'default' : office.tier === 2 ? 'secondary' : 'outline'}
                          className={office.tier === 1 ? 'bg-purple-600' : ''}
                        >
                          T{office.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {office.method_type ? CONNECTION_METHOD_TYPES[office.method_type]?.label : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {office.last_successful_sync 
                          ? formatDistanceToNow(new Date(office.last_successful_sync), { 
                              addSuffix: true, 
                              locale: es 
                            })
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        {office.success_rate_7d !== null && office.success_rate_7d !== undefined ? (
                          <span className={
                            office.success_rate_7d >= 95 ? 'text-green-600' :
                            office.success_rate_7d >= 80 ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {office.success_rate_7d.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/backoffice/ipo/${office.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
