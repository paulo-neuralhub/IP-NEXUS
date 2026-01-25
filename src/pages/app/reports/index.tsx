import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  useGeneratedReports, 
  useScheduledReports,
  useDeleteReport 
} from '@/hooks/use-reports';
import { REPORT_TYPES, REPORT_STATUSES } from '@/lib/constants/reports';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { InlineHelp } from '@/components/help';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'generated' | 'scheduled'>('generated');
  const { data: generatedReports = [], isLoading } = useGeneratedReports();
  const { data: scheduledReports = [] } = useScheduledReports();
  const deleteMutation = useDeleteReport();
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este informe?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Informe eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Informes
            <InlineHelp text="Genera informes personalizados de tu cartera de PI. Programa envíos automáticos y exporta en múltiples formatos (PDF, Excel)." />
          </h1>
          <p className="text-muted-foreground">Genera y programa informes de tu cartera</p>
        </div>
        <Link
          to="/app/reports/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo informe
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('generated')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'generated'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Informes Generados ({generatedReports.length})
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={cn(
            "pb-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'scheduled'
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Programados ({scheduledReports.length})
        </button>
      </div>
      
      {/* Contenido */}
      {activeTab === 'generated' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : generatedReports.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {generatedReports.map(report => (
                    <ReportRow 
                      key={report.id} 
                      report={report}
                      onDelete={() => handleDelete(report.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          {scheduledReports.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No hay informes programados</p>
              <Link 
                to="/app/reports/new"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                Programar informe
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledReports.map(scheduled => (
                <ScheduledReportCard key={scheduled.id} scheduled={scheduled} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ReportRowProps {
  report: {
    id: string;
    name: string;
    report_type: string;
    status: string;
    created_at: string;
    file_url?: string;
    template?: { name: string };
  };
  onDelete: () => void;
}

function ReportRow({ report, onDelete }: ReportRowProps) {
  const typeConfig = REPORT_TYPES[report.report_type as keyof typeof REPORT_TYPES];
  const statusConfig = REPORT_STATUSES[report.status as keyof typeof REPORT_STATUSES];
  
  const StatusIcon = report.status === 'completed' ? CheckCircle :
                     report.status === 'failed' ? XCircle :
                     report.status === 'generating' ? Loader2 : Clock;
  
  return (
    <tr className="hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">{report.name}</p>
            {report.template && (
              <p className="text-xs text-muted-foreground">Plantilla: {report.template.name}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {typeConfig?.label || report.report_type}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
      </td>
      <td className="px-4 py-3 text-center">
        <span 
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
            report.status === 'generating' && "animate-pulse"
          )}
          style={{ 
            backgroundColor: statusConfig ? `${statusConfig.color}15` : '#6B728015',
            color: statusConfig?.color || '#6B7280',
          }}
        >
          <StatusIcon className={cn("w-3 h-3", report.status === 'generating' && "animate-spin")} />
          {statusConfig?.label || report.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          {report.status === 'completed' && report.file_url && (
            <a
              href={report.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onDelete}
            className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ScheduledReportCardProps {
  scheduled: {
    id: string;
    name: string;
    is_active: boolean;
    next_run_at?: string;
    template?: { name: string };
    recipients?: unknown[];
  };
}

function ScheduledReportCard({ scheduled }: ScheduledReportCardProps) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            scheduled.is_active ? "bg-green-100" : "bg-muted"
          )}>
            <Calendar className={cn(
              "w-5 h-5",
              scheduled.is_active ? "text-green-600" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="font-medium text-foreground">{scheduled.name}</p>
            <p className="text-sm text-muted-foreground">
              {scheduled.template?.name}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>
                Próximo: {scheduled.next_run_at 
                  ? format(new Date(scheduled.next_run_at), 'dd/MM/yyyy HH:mm', { locale: es })
                  : 'No programado'}
              </span>
              <span>
                Destinatarios: {scheduled.recipients?.length || 0}
              </span>
            </div>
          </div>
        </div>
        
        <span className={cn(
          "px-2 py-1 text-xs font-medium rounded-full",
          scheduled.is_active 
            ? "bg-green-100 text-green-700"
            : "bg-muted text-muted-foreground"
        )}>
          {scheduled.is_active ? 'Activo' : 'Pausado'}
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-card rounded-xl border">
      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
      <h3 className="font-semibold text-foreground mb-1">Sin informes</h3>
      <p className="text-muted-foreground text-sm mb-4">
        Genera tu primer informe para analizar tu cartera
      </p>
      <Link
        to="/app/reports/new"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        <Plus className="w-4 h-4" /> Crear informe
      </Link>
    </div>
  );
}
