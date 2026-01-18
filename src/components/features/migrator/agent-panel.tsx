import { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Monitor,
  Download,
  RefreshCw,
  XCircle,
  Clock,
  Server,
  Database,
  Wifi,
  WifiOff,
  Settings,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Laptop
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import type { MigrationAgent, AgentStatus } from '@/types/migration-advanced';

interface AgentPanelProps {
  agents: MigrationAgent[];
  onRefresh: () => void;
  onDeleteAgent: (agentId: string) => void;
}

const OS_ICONS: Record<string, typeof Laptop> = {
  windows: Laptop,
  macos: Laptop,
  linux: Server
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
  online: { label: 'Online', color: 'bg-green-500', icon: Wifi },
  offline: { label: 'Offline', color: 'bg-gray-500', icon: WifiOff },
  busy: { label: 'Ocupado', color: 'bg-blue-500', icon: RefreshCw },
  error: { label: 'Error', color: 'bg-red-500', icon: XCircle },
  disabled: { label: 'Deshabilitado', color: 'bg-gray-400', icon: XCircle },
};

export function AgentPanel({ agents, onRefresh, onDeleteAgent }: AgentPanelProps) {
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [showAgentKey, setShowAgentKey] = useState<string | null>(null);
  const [selectedOs, setSelectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');

  const downloadLinks = {
    windows: 'https://releases.ip-nexus.com/agent/latest/nexus-agent-setup.exe',
    macos: 'https://releases.ip-nexus.com/agent/latest/nexus-agent.dmg',
    linux: 'https://releases.ip-nexus.com/agent/latest/nexus-agent.deb'
  };

  const handleCopyAgentKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Clave copiada al portapapeles');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agentes de Migración</h3>
          <p className="text-sm text-muted-foreground">
            Instala un agente en tu red para acceder a sistemas on-premise
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button size="sm" onClick={() => setShowInstallDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            Instalar Agente
          </Button>
        </div>
      </div>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-medium mb-2">Sin agentes instalados</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Instala un agente para conectar a sistemas locales como IPAN, FileMaker o bases de datos internas.
            </p>
            <Button onClick={() => setShowInstallDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Instalar primer agente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agents.map(agent => {
            const statusConfig = STATUS_CONFIG[agent.status];
            const OsIcon = OS_ICONS[agent.os_type || 'windows'] || Laptop;
            const StatusIcon = statusConfig?.icon || Clock;

            return (
              <Card key={agent.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <OsIcon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs")}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig?.label || agent.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Host:</span> {agent.hostname || 'Desconocido'}
                        </p>
                        <p>
                          <span className="font-medium">SO:</span> {agent.os_type} {agent.os_version}
                        </p>
                        <p>
                          <span className="font-medium">Versión:</span> {agent.agent_version || 'N/A'}
                        </p>
                        {agent.last_heartbeat && (
                          <p>
                            <span className="font-medium">Última conexión:</span>{' '}
                            {formatDistanceToNow(new Date(agent.last_heartbeat), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </p>
                        )}
                      </div>

                      {/* Capacidades */}
                      {agent.capabilities && agent.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.capabilities.map((cap, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {cap.type === 'database' && <Database className="mr-1 h-3 w-3" />}
                              {cap.type}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {agent.last_error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950 rounded text-xs text-red-600">
                          {agent.last_error}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowAgentKey(showAgentKey === agent.id ? null : agent.id)}
                      >
                        {showAgentKey === agent.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar agente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esto desconectará el agente permanentemente. Deberás reinstalarlo si quieres volver a usarlo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteAgent(agent.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Agent Key */}
                  {showAgentKey === agent.id && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Clave del agente</p>
                          <code className="text-sm font-mono">{agent.agent_key}</code>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleCopyAgentKey(agent.agent_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de instalación */}
      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Instalar Nexus Agent</DialogTitle>
            <DialogDescription>
              El agente permite conectar a sistemas locales y bases de datos en tu red
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">1. Selecciona tu sistema operativo</p>
              <div className="grid grid-cols-3 gap-2">
                {(['windows', 'macos', 'linux'] as const).map(os => {
                  const Icon = OS_ICONS[os];
                  return (
                    <Card
                      key={os}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedOs === os && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedOs(os)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium capitalize">{os}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">2. Descarga e instala</p>
              <Button className="w-full" asChild>
                <a href={downloadLinks[selectedOs]} download>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Nexus Agent para {selectedOs}
                </a>
              </Button>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">3. Configura el agente</p>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="mb-2">Durante la instalación, introduce:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>URL del servidor: <code>https://api.ip-nexus.com</code></li>
                  <li>Tu clave de organización (disponible en Configuración)</li>
                  <li>Nombre para identificar este agente</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Requisitos:</strong> El agente necesita acceso de red al servidor de IP-NEXUS 
                y a los sistemas locales que quieras conectar.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
