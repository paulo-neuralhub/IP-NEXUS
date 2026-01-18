import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Globe,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ScrapingSession, ScrapingStatus } from '@/types/migration-advanced';

interface ScrapingMonitorProps {
  session: ScrapingSession;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

const STATUS_CONFIG: Record<ScrapingStatus, { 
  label: string; 
  color: string; 
  icon: typeof Loader2;
  animate?: boolean;
}> = {
  initializing: { label: 'Inicializando', color: 'text-blue-500', icon: Loader2, animate: true },
  authenticating: { label: 'Autenticando', color: 'text-amber-500', icon: Loader2, animate: true },
  authenticated: { label: 'Autenticado', color: 'text-green-500', icon: CheckCircle2 },
  scraping: { label: 'Extrayendo datos', color: 'text-blue-500', icon: RefreshCw, animate: true },
  paused: { label: 'Pausado', color: 'text-amber-500', icon: Pause },
  completed: { label: 'Completado', color: 'text-green-500', icon: CheckCircle2 },
  error: { label: 'Error', color: 'text-red-500', icon: XCircle },
  rate_limited: { label: 'Límite de velocidad', color: 'text-amber-500', icon: Clock },
};

const ENTITY_ICONS: Record<string, typeof FileText> = {
  matters: FileText,
  contacts: Users,
  deadlines: Calendar,
};

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export function ScrapingMonitor({ session, onPause, onResume, onCancel }: ScrapingMonitorProps) {
  const statusConfig = STATUS_CONFIG[session.status];
  const StatusIcon = statusConfig?.icon || Clock;
  const progress = session.items_total 
    ? (session.items_scraped / session.items_total) * 100 
    : 0;

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: session.started_at, type: 'info', message: 'Sesión de scraping iniciada' },
  ]);

  // Simular logs en tiempo real (en producción vendría de WebSocket)
  useEffect(() => {
    if (session.status === 'scraping') {
      const interval = setInterval(() => {
        setLogs(prev => [
          ...prev,
          {
            timestamp: new Date().toISOString(),
            type: 'info',
            message: `Procesando página ${session.current_page || 'lista'}...`
          }
        ]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [session.status, session.current_page]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-gradient-to-br from-blue-500 to-purple-600"
            )}>
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Extracción Web</CardTitle>
              <CardDescription>
                Extrayendo datos del portal web
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn("gap-1", statusConfig?.color)}>
            <StatusIcon className={cn("h-3 w-3", statusConfig?.animate && "animate-spin")} />
            {statusConfig?.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span className="text-muted-foreground">
              {session.items_scraped.toLocaleString()} / {session.items_total?.toLocaleString() || '?'} items
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Entidad actual */}
        {session.current_entity && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            {(() => {
              const EntityIcon = ENTITY_ICONS[session.current_entity] || FileText;
              return <EntityIcon className="h-4 w-4" />;
            })()}
            <span className="text-sm">
              Extrayendo: <strong className="capitalize">{session.current_entity}</strong>
            </span>
            {session.current_page && (
              <span className="text-sm text-muted-foreground">
                — Página {session.current_page}
              </span>
            )}
          </div>
        )}

        {/* Rate limit warning */}
        {session.rate_limit_until && new Date(session.rate_limit_until) > new Date() && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Esperando límite de velocidad. Continúa{' '}
                {formatDistanceToNow(new Date(session.rate_limit_until), { 
                  addSuffix: true,
                  locale: es 
                })}
              </span>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{session.items_scraped}</p>
            <p className="text-xs text-muted-foreground">Extraídos</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{session.requests_made}</p>
            <p className="text-xs text-muted-foreground">Peticiones</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{session.errors.length}</p>
            <p className="text-xs text-muted-foreground">Errores</p>
          </div>
        </div>

        {/* Log de actividad */}
        <div>
          <h4 className="text-sm font-medium mb-2">Actividad</h4>
          <ScrollArea className="h-32 rounded border">
            <div className="p-2 space-y-1 text-xs font-mono">
              {logs.slice(-20).map((log, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-2",
                    log.type === 'error' && "text-red-500",
                    log.type === 'warning' && "text-amber-500",
                    log.type === 'success' && "text-green-500"
                  )}
                >
                  <span className="text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Errores */}
        {session.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-destructive">
              Errores ({session.errors.length})
            </h4>
            <ScrollArea className="h-24 rounded border border-red-200">
              <div className="p-2 space-y-1 text-xs">
                {session.errors.map((error, i) => (
                  <div key={i} className="text-red-600">
                    <span className="text-muted-foreground">
                      [{error.page}]
                    </span>{' '}
                    {error.error}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          {session.status === 'scraping' && (
            <Button variant="outline" onClick={onPause} className="flex-1">
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </Button>
          )}
          {session.status === 'paused' && (
            <Button onClick={onResume} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          )}
          {!['completed', 'error'].includes(session.status) && (
            <Button variant="destructive" onClick={onCancel}>
              <Square className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
