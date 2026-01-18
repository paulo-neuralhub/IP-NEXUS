import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Eye,
  MoreHorizontal,
  Database,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMigrationProjects, useDeleteMigrationProject } from '@/hooks/use-migration';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Iconos de sistemas origen
const SOURCE_SYSTEMS: Record<string, { name: string; color: string }> = {
  patsnap: { name: 'PatSnap', color: 'bg-blue-500' },
  anaqua: { name: 'Anaqua', color: 'bg-purple-500' },
  cpa_global: { name: 'CPA Global', color: 'bg-green-500' },
  dennemeyer: { name: 'Dennemeyer', color: 'bg-orange-500' },
  ipan: { name: 'IPAN', color: 'bg-red-500' },
  thomson_compumark: { name: 'Thomson CompuMark', color: 'bg-indigo-500' },
  corsearch: { name: 'Corsearch', color: 'bg-cyan-500' },
  orbit: { name: 'Questel Orbit', color: 'bg-pink-500' },
  darts_ip: { name: 'Darts-IP', color: 'bg-yellow-500' },
  clarivate: { name: 'Clarivate', color: 'bg-teal-500' },
  spreadsheet: { name: 'Excel/CSV', color: 'bg-emerald-500' },
  custom: { name: 'Personalizado', color: 'bg-slate-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700', icon: Clock },
  mapping: { label: 'Mapeando', color: 'bg-blue-100 text-blue-700', icon: ArrowRightLeft },
  validating: { label: 'Validando', color: 'bg-yellow-100 text-yellow-700', icon: Loader2 },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  migrating: { label: 'Migrando', color: 'bg-purple-100 text-purple-700', icon: Loader2 },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-500', icon: Clock },
};

export default function MigratorPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useMigrationProjects();
  const deleteMutation = useDeleteMigrationProject();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const activeProjects = projects?.filter(p => !['completed', 'cancelled', 'failed'].includes(p.status)) || [];
  const completedProjects = projects?.filter(p => ['completed', 'cancelled', 'failed'].includes(p.status)) || [];

  const getTotalRecords = () => {
    return projects?.reduce((acc, p) => {
      const stats = p.stats || {};
      const migrated = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.migrated || 0), 0);
      return acc + migrated;
    }, 0) || 0;
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            Nexus Migrator
          </h1>
          <p className="text-muted-foreground mt-1">
            Migra tus datos desde otros sistemas de gestión de PI
          </p>
        </div>
        <Button onClick={() => navigate('/app/migrator/new')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Nueva Migración
        </Button>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Migraciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
                <p className="text-sm text-muted-foreground">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects?.filter(p => p.status === 'completed').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getTotalRecords().toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Registros Migrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proyectos activos */}
      {activeProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Migraciones Activas
            </CardTitle>
            <CardDescription>
              Proyectos de migración en curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project) => {
                const StatusIcon = STATUS_CONFIG[project.status]?.icon || Clock;
                const source = SOURCE_SYSTEMS[project.source_system];
                const progress = project.total_steps > 0 
                  ? Math.round((project.current_step / project.total_steps) * 100) 
                  : 0;
                
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/migrator/${project.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full", source?.color || 'bg-slate-400')} />
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source?.name || project.source_system} • Paso {project.current_step} de {project.total_steps}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-1">{progress}%</p>
                      </div>
                      <Badge className={STATUS_CONFIG[project.status]?.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {STATUS_CONFIG[project.status]?.label}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Continuar <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de migraciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Migraciones</CardTitle>
          <CardDescription>
            Todas tus migraciones anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects?.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin migraciones</h3>
              <p className="text-muted-foreground mb-4">
                Aún no has realizado ninguna migración de datos.
              </p>
              <Button onClick={() => navigate('/app/migrator/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Iniciar Primera Migración
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(completedProjects.length > 0 ? completedProjects : projects)?.map((project) => {
                const StatusIcon = STATUS_CONFIG[project.status]?.icon || Clock;
                const source = SOURCE_SYSTEMS[project.source_system];
                const stats = project.stats || {};
                const totalMigrated = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.migrated || 0), 0);
                
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full", source?.color || 'bg-slate-400')} />
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source?.name} • {formatDistanceToNow(new Date(project.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {totalMigrated > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {totalMigrated.toLocaleString()} registros
                        </span>
                      )}
                      <Badge className={STATUS_CONFIG[project.status]?.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {STATUS_CONFIG[project.status]?.label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/app/migrator/${project.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(project.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistemas soportados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sistemas Soportados
          </CardTitle>
          <CardDescription>
            Puedes migrar desde cualquiera de estos sistemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(SOURCE_SYSTEMS).map(([key, { name, color }]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/app/migrator/new?source=${key}`)}
              >
                <div className={cn("w-3 h-3 rounded-full", color)} />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar migración?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los archivos y logs asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
