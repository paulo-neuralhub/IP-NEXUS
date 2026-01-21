/**
 * Portal Matters List
 * Lista de expedientes del cliente
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Tag
} from 'lucide-react';

// Mock data
const mockMatters = [
  {
    id: '1',
    reference: 'TM-2025-001',
    title: 'Marca NEXUS',
    type: 'trademark',
    status: 'active',
    jurisdiction: 'ES',
    filingDate: '2025-01-15',
    classes: [9, 42],
    nextDeadline: '2026-01-15',
  },
  {
    id: '2',
    reference: 'PT-2025-003',
    title: 'Patente IoT Device',
    type: 'patent',
    status: 'pending',
    jurisdiction: 'EP',
    filingDate: '2025-02-20',
    classes: [],
    nextDeadline: '2026-02-20',
  },
  {
    id: '3',
    reference: 'TM-2024-089',
    title: 'Marca ACME Corp',
    type: 'trademark',
    status: 'active',
    jurisdiction: 'US',
    filingDate: '2024-06-10',
    classes: [25, 35],
    nextDeadline: null,
  },
  {
    id: '4',
    reference: 'DS-2024-012',
    title: 'Diseño Industrial Widget',
    type: 'design',
    status: 'granted',
    jurisdiction: 'ES',
    filingDate: '2024-03-05',
    classes: [],
    nextDeadline: '2029-03-05',
  },
];

export default function PortalMatters() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMatters = mockMatters.filter((matter) => {
    const matchesSearch = 
      matter.title.toLowerCase().includes(search.toLowerCase()) ||
      matter.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || matter.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      trademark: { label: 'Marca', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      patent: { label: 'Patente', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      design: { label: 'Diseño', className: 'bg-green-100 text-green-700 border-green-200' },
    };
    const c = config[type] || { label: type, className: '' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-700 border-green-200' },
      pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700 border-amber-200' },
      granted: { label: 'Concedido', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const c = config[status] || { label: status, className: '' };
    return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
  };

  const stats = {
    total: mockMatters.length,
    trademarks: mockMatters.filter(m => m.type === 'trademark').length,
    patents: mockMatters.filter(m => m.type === 'patent').length,
    designs: mockMatters.filter(m => m.type === 'design').length,
  };

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
      <div className="grid grid-cols-4 gap-4">
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
              <SelectTrigger className="w-[180px]">
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
          </div>
        </CardHeader>
        <CardContent>
          {/* Matters List */}
          <div className="space-y-3">
            {filteredMatters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron expedientes
              </div>
            ) : (
              filteredMatters.map((matter) => (
                <Link
                  key={matter.id}
                  to={`/portal/${slug}/matters/${matter.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      matter.type === 'trademark' ? 'bg-blue-100' :
                      matter.type === 'patent' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      <Briefcase className={`w-6 h-6 ${
                        matter.type === 'trademark' ? 'text-blue-600' :
                        matter.type === 'patent' ? 'text-purple-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {matter.title}
                        </h3>
                        {getTypeBadge(matter.type)}
                        {getStatusBadge(matter.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{matter.reference}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {matter.jurisdiction}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(matter.filingDate).toLocaleDateString('es')}
                        </span>
                        {matter.classes.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Clases: {matter.classes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-auto">
                    {matter.nextDeadline && (
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">Próximo plazo</p>
                        <p className="font-medium">{new Date(matter.nextDeadline).toLocaleDateString('es')}</p>
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
