import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Clock, CheckCircle, XCircle, AlertTriangle,
  Send, Eye, Edit, Trash2, Filter, Search, Download,
  Building2, Calendar, DollarSign, FileCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFilingApplications, useFilingStats, useDeleteFiling } from '@/hooks/filing/useFiling';
import { FILING_TYPES, FILING_STATUS_CONFIG, type FilingStatus } from '@/types/filing.types';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export function FilingDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { data: applications = [], isLoading } = useFilingApplications();
  const { data: stats } = useFilingStats();
  const deleteFiling = useDeleteFiling();

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchQuery || 
      app.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.filing_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
      try {
        await deleteFiling.mutateAsync(id);
        toast.success('Solicitud eliminada');
      } catch (error) {
        toast.error('Error al eliminar la solicitud');
      }
    }
  };

  const getStatusBadge = (status: FilingStatus) => {
    const config = FILING_STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.label}
      </Badge>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Filing Center</h1>
          <p className="text-muted-foreground">
            Gestión de solicitudes electrónicas ante oficinas de PI
          </p>
        </div>
        <Button onClick={() => navigate('/app/filing/new')} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Solicitudes"
          value={stats?.total || 0}
          icon={FileText}
          color="bg-primary"
        />
        <StatCard
          title="En Borrador"
          value={stats?.draft || 0}
          icon={Edit}
          color="bg-slate-500"
        />
        <StatCard
          title="Pendientes"
          value={stats?.pending || 0}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Presentadas"
          value={stats?.submitted || 0}
          icon={Send}
          color="bg-emerald-500"
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="drafts">Borradores</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="submitted">Presentadas</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por referencia o solicitante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[300px]"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {FILING_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <ApplicationsTable 
            applications={filteredApplications}
            onView={(id) => navigate(`/app/filing/${id}`)}
            onEdit={(id) => navigate(`/app/filing/${id}/edit`)}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="drafts">
          <ApplicationsTable 
            applications={filteredApplications.filter(a => a.status === 'draft')}
            onView={(id) => navigate(`/app/filing/${id}`)}
            onEdit={(id) => navigate(`/app/filing/${id}/edit`)}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="pending">
          <ApplicationsTable 
            applications={filteredApplications.filter(a => ['validating', 'pending_payment', 'ready_to_submit'].includes(a.status))}
            onView={(id) => navigate(`/app/filing/${id}`)}
            onEdit={(id) => navigate(`/app/filing/${id}/edit`)}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="submitted">
          <ApplicationsTable 
            applications={filteredApplications.filter(a => ['submitted', 'acknowledged', 'registered', 'rejected'].includes(a.status))}
            onView={(id) => navigate(`/app/filing/${id}`)}
            onEdit={(id) => navigate(`/app/filing/${id}/edit`)}
            onDelete={handleDelete}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos movimientos en tus solicitudes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.slice(0, 5).map(app => (
            <div 
              key={app.id} 
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  app.filing_type === 'trademark' ? 'bg-blue-100' :
                  app.filing_type === 'patent' ? 'bg-purple-100' :
                  'bg-green-100'
                }`}>
                  <FileText className={`h-4 w-4 ${
                    app.filing_type === 'trademark' ? 'text-blue-600' :
                    app.filing_type === 'patent' ? 'text-purple-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium">{app.reference_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.applicant_name} • {app.ipo_offices?.name || 'Sin oficina'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(app.status)}
                <span className="text-sm text-muted-foreground">
                  {format(new Date(app.updated_at), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Separate table component for reuse
function ApplicationsTable({
  applications,
  onView,
  onEdit,
  onDelete,
  getStatusBadge
}: {
  applications: any[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  getStatusBadge: (status: FilingStatus) => React.ReactNode;
}) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No hay solicitudes</h3>
          <p className="text-muted-foreground">
            Crea tu primera solicitud para empezar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referencia</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Oficina</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map(app => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                {app.reference_number}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {FILING_TYPES.find(t => t.value === app.filing_type)?.label || app.filing_type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {app.ipo_offices?.short_name || app.ipo_offices?.name || '-'}
                </div>
              </TableCell>
              <TableCell>{app.applicant_name}</TableCell>
              <TableCell>{getStatusBadge(app.status)}</TableCell>
              <TableCell>
                {format(new Date(app.created_at), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(app.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    {app.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onEdit(app.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {app.status === 'draft' && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(app.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default FilingDashboard;
