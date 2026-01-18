import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRightLeft,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMigrationProject, useMigrationFiles, useMigrationLogs } from '@/hooks/use-migration';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function MigrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useMigrationProject(id!);
  const { data: files } = useMigrationFiles(id!);
  const { data: logs } = useMigrationLogs(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-xl font-bold">Proyecto no encontrado</h1>
        <Button variant="link" onClick={() => navigate('/app/migrator')}>
          Volver al listado
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[project.status]?.icon || Clock;
  const progress = project.total_steps > 0 
    ? Math.round((project.current_step / project.total_steps) * 100) 
    : 0;

  // Calculate stats from project.stats
  const stats = project.stats || {};
  const totalRecords = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.total || 0), 0);
  const migratedRecords = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.migrated || 0), 0);
  const failedRecords = Object.values(stats).reduce((sum: number, s: any) => sum + (s?.failed || 0), 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/migrator')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <Badge className={STATUS_CONFIG[project.status]?.color}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {STATUS_CONFIG[project.status]?.label}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso</span>
            <span className="text-sm text-muted-foreground">
              Paso {project.current_step} de {project.total_steps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Archivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Archivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!files?.length ? (
              <p className="text-sm text-muted-foreground">Sin archivos subidos</p>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.entity_type} • {file.total_rows?.toLocaleString()} filas
                      </p>
                    </div>
                    <Badge variant="outline">
                      {file.validation_status === 'validated' && <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />}
                      {file.validation_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen */}
        {totalRecords > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Migración</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total registros:</dt>
                  <dd className="font-medium">{totalRecords.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Migrados:</dt>
                  <dd className="font-medium text-green-600">{migratedRecords.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Errores:</dt>
                  <dd className="font-medium text-red-600">{failedRecords.toLocaleString()}</dd>
                </div>
                {project.started_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Iniciado:</dt>
                    <dd className="font-medium">
                      {format(new Date(project.started_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </dd>
                  </div>
                )}
                {project.completed_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Completado:</dt>
                    <dd className="font-medium">
                      {format(new Date(project.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {!logs?.length ? (
              <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), 'HH:mm:ss', { locale: es })}
                    </span>
                    <Badge variant={
                      log.log_type === 'error' ? 'destructive' :
                      log.log_type === 'success' ? 'default' : 'secondary'
                    } className="text-xs">
                      {log.log_type}
                    </Badge>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Actions */}
      {project.status === 'completed' && (
        <div className="flex justify-end gap-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>
      )}
    </div>
  );
}
