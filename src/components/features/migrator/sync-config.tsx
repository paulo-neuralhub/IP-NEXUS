import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Clock,
  Calendar,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MigrationConnection, SyncType, SyncDirection, ConflictResolution } from '@/types/migration-advanced';

interface SyncConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: MigrationConnection;
  onSave: (config: SyncConfiguration) => void;
}

interface EntityConfig {
  enabled: boolean;
  direction: SyncDirection;
  conflictResolution: ConflictResolution;
  filters?: Record<string, unknown>;
}

export interface SyncConfiguration {
  name: string;
  syncType: SyncType;
  scheduleCron?: string;
  scheduleTimezone: string;
  entities: Record<string, EntityConfig>;
}

const CRON_PRESETS = [
  { label: 'Cada hora', value: '0 * * * *' },
  { label: 'Cada 6 horas', value: '0 */6 * * *' },
  { label: 'Diario a las 2am', value: '0 2 * * *' },
  { label: 'Diario a las 8am', value: '0 8 * * *' },
  { label: 'Lunes a Viernes 9am', value: '0 9 * * 1-5' },
  { label: 'Semanal (Domingo 3am)', value: '0 3 * * 0' },
  { label: 'Mensual (día 1 a las 4am)', value: '0 4 1 * *' },
];

const ENTITIES = [
  { key: 'matters', label: 'Expedientes', icon: '📁' },
  { key: 'contacts', label: 'Contactos', icon: '👥' },
  { key: 'deadlines', label: 'Plazos', icon: '📅' },
  { key: 'documents', label: 'Documentos', icon: '📄' },
  { key: 'costs', label: 'Costes', icon: '💰' },
  { key: 'renewals', label: 'Renovaciones', icon: '🔄' },
];

const DIRECTION_OPTIONS: { value: SyncDirection; label: string; icon: typeof ArrowDownToLine; description: string }[] = [
  { 
    value: 'pull', 
    label: 'Solo importar', 
    icon: ArrowDownToLine,
    description: 'Traer datos del sistema origen a IP-NEXUS'
  },
  { 
    value: 'push', 
    label: 'Solo exportar', 
    icon: ArrowUpFromLine,
    description: 'Enviar datos de IP-NEXUS al sistema origen'
  },
  { 
    value: 'bidirectional', 
    label: 'Bidireccional', 
    icon: ArrowLeftRight,
    description: 'Sincronizar en ambas direcciones'
  },
];

const CONFLICT_OPTIONS: { value: ConflictResolution; label: string; description: string }[] = [
  { value: 'source_wins', label: 'Sistema origen gana', description: 'Los datos del origen sobrescriben' },
  { value: 'target_wins', label: 'IP-NEXUS gana', description: 'Se mantienen los datos de IP-NEXUS' },
  { value: 'newest_wins', label: 'Más reciente gana', description: 'Se usa el dato modificado más recientemente' },
  { value: 'manual', label: 'Revisión manual', description: 'Se marca para revisión manual' },
];

export function SyncConfigDialog({ open, onOpenChange, connection, onSave }: SyncConfigDialogProps) {
  const [config, setConfig] = useState<SyncConfiguration>({
    name: `Sync ${connection.name}`,
    syncType: 'scheduled',
    scheduleCron: '0 2 * * *',
    scheduleTimezone: 'Europe/Madrid',
    entities: {
      matters: { enabled: true, direction: 'pull', conflictResolution: 'source_wins' },
      contacts: { enabled: true, direction: 'pull', conflictResolution: 'source_wins' },
      deadlines: { enabled: true, direction: 'pull', conflictResolution: 'source_wins' },
      documents: { enabled: false, direction: 'pull', conflictResolution: 'source_wins' },
      costs: { enabled: false, direction: 'pull', conflictResolution: 'source_wins' },
      renewals: { enabled: false, direction: 'pull', conflictResolution: 'source_wins' },
    }
  });

  const [customCron, setCustomCron] = useState(false);

  const updateEntityConfig = (entity: string, updates: Partial<EntityConfig>) => {
    setConfig(prev => ({
      ...prev,
      entities: {
        ...prev.entities,
        [entity]: { ...prev.entities[entity], ...updates }
      }
    }));
  };

  const enabledEntities = Object.entries(config.entities).filter(([, e]) => e.enabled);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Configurar Sincronización
          </DialogTitle>
          <DialogDescription>
            Configura la sincronización automática con {connection.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="schedule" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">
              <Clock className="mr-2 h-4 w-4" />
              Programación
            </TabsTrigger>
            <TabsTrigger value="entities">
              <Settings2 className="mr-2 h-4 w-4" />
              Entidades
            </TabsTrigger>
            <TabsTrigger value="conflicts">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Conflictos
            </TabsTrigger>
          </TabsList>

          {/* Tab: Programación */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nombre de la sincronización</Label>
              <Input
                value={config.name}
                onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mi sincronización diaria"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de sincronización</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['manual', 'scheduled', 'realtime'] as SyncType[]).map(type => (
                  <Card
                    key={type}
                    className={cn(
                      "cursor-pointer transition-all",
                      config.syncType === type && "ring-2 ring-primary"
                    )}
                    onClick={() => setConfig(prev => ({ ...prev, syncType: type }))}
                  >
                    <CardContent className="p-3 text-center">
                      {type === 'manual' && <Clock className="h-6 w-6 mx-auto mb-1" />}
                      {type === 'scheduled' && <Calendar className="h-6 w-6 mx-auto mb-1" />}
                      {type === 'realtime' && <Zap className="h-6 w-6 mx-auto mb-1" />}
                      <p className="text-sm font-medium">
                        {type === 'manual' && 'Manual'}
                        {type === 'scheduled' && 'Programada'}
                        {type === 'realtime' && 'Tiempo real'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {config.syncType === 'scheduled' && (
              <>
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  {!customCron ? (
                    <Select
                      value={config.scheduleCron}
                      onValueChange={v => setConfig(prev => ({ ...prev, scheduleCron: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {CRON_PRESETS.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={config.scheduleCron}
                      onChange={e => setConfig(prev => ({ ...prev, scheduleCron: e.target.value }))}
                      placeholder="0 2 * * *"
                    />
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => setCustomCron(!customCron)}
                  >
                    {customCron ? 'Usar presets' : 'Usar expresión cron personalizada'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select
                    value={config.scheduleTimezone}
                    onValueChange={v => setConfig(prev => ({ ...prev, scheduleTimezone: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {config.syncType === 'realtime' && (
              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        Sincronización en tiempo real
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Requiere que el sistema origen soporte webhooks. 
                        Los cambios se sincronizarán automáticamente cuando ocurran.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Entidades */}
          <TabsContent value="entities" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Selecciona qué datos sincronizar y en qué dirección
            </p>

            <div className="space-y-3">
              {ENTITIES.map(entity => {
                const entityConfig = config.entities[entity.key];
                return (
                  <Card key={entity.key} className={cn(!entityConfig?.enabled && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{entity.icon}</span>
                          <div>
                            <p className="font-medium">{entity.label}</p>
                            {entityConfig?.enabled && (
                              <p className="text-xs text-muted-foreground">
                                {entityConfig.direction === 'pull' && 'Importando desde origen'}
                                {entityConfig.direction === 'push' && 'Exportando a origen'}
                                {entityConfig.direction === 'bidirectional' && 'Sincronización bidireccional'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {entityConfig?.enabled && (
                            <Select
                              value={entityConfig.direction}
                              onValueChange={v => updateEntityConfig(entity.key, { direction: v as SyncDirection })}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DIRECTION_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <span className="flex items-center gap-2">
                                      <opt.icon className="h-4 w-4" />
                                      {opt.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Switch
                            checked={entityConfig?.enabled ?? false}
                            onCheckedChange={checked => updateEntityConfig(entity.key, { enabled: checked })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab: Conflictos */}
          <TabsContent value="conflicts" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Define cómo resolver conflictos cuando el mismo registro se modifica en ambos sistemas
            </p>

            {enabledEntities.map(([key, entityConfig]) => {
              const entity = ENTITIES.find(e => e.key === key);
              if (!entity) return null;

              return (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>{entity.icon}</span>
                      {entity.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {CONFLICT_OPTIONS.map(opt => (
                        <Card
                          key={opt.value}
                          className={cn(
                            "cursor-pointer transition-all p-3",
                            entityConfig.conflictResolution === opt.value && "ring-2 ring-primary"
                          )}
                          onClick={() => updateEntityConfig(key, { conflictResolution: opt.value })}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(config)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Guardar sincronización
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
