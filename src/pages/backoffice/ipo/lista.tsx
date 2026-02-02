// src/pages/backoffice/ipo/lista.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Settings, BarChart2, CheckCircle2, AlertTriangle, XCircle, Pause, Circle } from 'lucide-react';
import { IPOSeedingPanel } from '@/components/ipo/IPOSeedingPanel';

interface IPOOffice {
  id: string;
  code: string;
  name_official: string;
  country_code?: string;
  region?: string;
  data_source_type: string;
  operational_status: 'operational' | 'degraded' | 'maintenance' | 'down';
  is_active: boolean;
  avg_response_time_ms?: number;
}

const FLAG_EMOJIS: Record<string, string> = {
  EU: '🇪🇺', ES: '🇪🇸', US: '🇺🇸', GB: '🇬🇧', FR: '🇫🇷', DE: '🇩🇪',
  JP: '🇯🇵', CN: '🇨🇳', BR: '🇧🇷', MX: '🇲🇽', INT: '🌐', KR: '🇰🇷',
  IN: '🇮🇳', AU: '🇦🇺', CA: '🇨🇦', CH: '🇨🇭', IT: '🇮🇹', NL: '🇳🇱',
};

const STATUS_ICONS = {
  operational: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  degraded: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  maintenance: <Pause className="h-4 w-4 text-blue-600" />,
  down: <XCircle className="h-4 w-4 text-red-600" />,
};

const SOURCE_COLORS: Record<string, string> = {
  api: 'bg-green-100 text-green-800',
  scraping: 'bg-yellow-100 text-yellow-800',
  file_import: 'bg-blue-100 text-blue-800',
  manual: 'bg-gray-100 text-gray-800',
  ocr: 'bg-purple-100 text-purple-800',
  mixed: 'bg-orange-100 text-orange-800',
};

export default function OfficeListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('active');

  const { data: offices = [], isLoading } = useQuery({
    queryKey: ['ipo-offices-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('id, code, name_official, country_code, region, data_source_type, operational_status, is_active, avg_response_time_ms')
        .order('region')
        .order('name_official');
      if (error) throw error;
      return data as IPOOffice[];
    }
  });

  // Get unique regions
  const regions = [...new Set(offices.map(o => o.region).filter(Boolean))];

  // Filter offices
  const filteredOffices = offices.filter(office => {
    const matchesSearch = 
      office.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.name_official.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || office.region === filterRegion;
    const matchesSource = filterSource === 'all' || office.data_source_type === filterSource;
    const matchesActive = 
      filterActive === 'all' || 
      (filterActive === 'active' && office.is_active) ||
      (filterActive === 'inactive' && !office.is_active);
    
    return matchesSearch && matchesRegion && matchesSource && matchesActive;
  });

  const formatResponseTime = (ms?: number) => {
    if (!ms) return '-';
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Oficinas de PI</h1>
          <p className="text-muted-foreground">
            Gestiona las conexiones con oficinas de propiedad industrial
          </p>
        </div>
        <Button asChild>
          <Link to="/backoffice/ipo/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oficina
          </Link>
        </Button>
      </div>

      {/* Seeding Panel */}
      <IPOSeedingPanel currentOfficeCount={offices.length} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar oficina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Región" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r!}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="scraping">Scraping</SelectItem>
                <SelectItem value="file_import">Archivo</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filteredOffices.length} oficinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando oficinas...</div>
          ) : filteredOffices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron oficinas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Región</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Resp.</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffices.map((office) => {
                  const flag = FLAG_EMOJIS[office.country_code || 'INT'] || '🏢';
                  const statusIcon = office.is_active 
                    ? STATUS_ICONS[office.operational_status] 
                    : <Circle className="h-4 w-4 text-muted-foreground" />;
                  
                  return (
                    <TableRow key={office.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{flag}</span>
                          <div>
                            <p className="font-medium">{office.code}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                              {office.name_official}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{office.region || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${SOURCE_COLORS[office.data_source_type] || SOURCE_COLORS.manual} border-0`}>
                          {office.data_source_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {statusIcon}
                          {!office.is_active && (
                            <span className="text-xs text-muted-foreground">Inactiva</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatResponseTime(office.avg_response_time_ms)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/backoffice/ipo/${office.id}`}>
                              <Settings className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/backoffice/ipo/logs?office=${office.code}`}>
                              <BarChart2 className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-600" /> Operativo
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-yellow-600" /> Degradado
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-red-600" /> Caído
        </span>
        <span className="flex items-center gap-1">
          <Circle className="h-4 w-4 text-muted-foreground" /> N/A
        </span>
        <span className="flex items-center gap-1">
          <Pause className="h-4 w-4 text-blue-600" /> Mantenimiento
        </span>
      </div>
    </div>
  );
}
