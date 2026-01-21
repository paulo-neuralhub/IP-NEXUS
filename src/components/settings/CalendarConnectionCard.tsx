// ============================================
// CALENDAR CONNECTION CARD
// Individual calendar provider connection UI
// ============================================

import { useState } from 'react';
import {
  Check,
  RefreshCw,
  Settings2,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  type CalendarConnection,
  useUpdateCalendarConnection,
  useDeleteCalendarConnection,
  useTriggerCalendarSync,
} from '@/hooks/use-calendar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Provider icons and colors
const PROVIDER_CONFIG: Record<string, { name: string; color: string; icon: string }> = {
  google: {
    name: 'Google Calendar',
    color: 'hsl(217, 91%, 60%)',
    icon: '📅',
  },
  microsoft: {
    name: 'Microsoft Outlook',
    color: 'hsl(207, 90%, 42%)',
    icon: '📆',
  },
  apple: {
    name: 'Apple Calendar',
    color: 'hsl(0, 0%, 0%)',
    icon: '🍎',
  },
};

interface CalendarConnectionCardProps {
  connection: CalendarConnection;
}

export function CalendarConnectionCard({ connection }: CalendarConnectionCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    sync_direction: connection.sync_direction || 'both',
    sync_deadlines: connection.sync_deadlines ?? true,
    sync_tasks: connection.sync_tasks ?? true,
    sync_meetings: connection.sync_meetings ?? true,
  });

  const updateMutation = useUpdateCalendarConnection();
  const deleteMutation = useDeleteCalendarConnection();
  const syncMutation = useTriggerCalendarSync();

  const providerConfig = PROVIDER_CONFIG[connection.provider] || PROVIDER_CONFIG.google;
  const isConnected = connection.sync_status === 'active';
  const hasError = connection.sync_status === 'error';
  const isPaused = connection.sync_status === 'paused';
  const syncEnabled = connection.sync_enabled ?? true;

  const handleSaveSettings = async () => {
    await updateMutation.mutateAsync({
      id: connection.id,
      ...localSettings,
    });
    setShowSettings(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(connection.id);
    setShowDeleteConfirm(false);
  };

  const handleSync = () => {
    syncMutation.mutate(connection.id);
  };

  const handleTogglePause = async () => {
    await updateMutation.mutateAsync({
      id: connection.id,
      sync_status: isPaused ? 'active' : 'paused',
    });
  };

  const getStatusBadge = () => {
    if (isConnected && syncEnabled) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Check className="w-3 h-3 mr-1" /> Conectado
        </Badge>
      );
    }
    if (hasError) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" /> Error
        </Badge>
      );
    }
    if (isPaused || !syncEnabled) {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" /> Pausado
        </Badge>
      );
    }
    return (
      <Badge variant="outline">Desconectado</Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-muted"
              >
                {providerConfig.icon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{providerConfig.name}</CardTitle>
                  {getStatusBadge()}
                </div>
                <CardDescription>
                  {connection.calendar_name || 'Sin configurar'}
                </CardDescription>

                {connection.last_sync_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última sincronización:{' '}
                    {formatDistanceToNow(new Date(connection.last_sync_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                )}

                {connection.last_sync_error && (
                  <p className="text-xs text-destructive mt-1">{connection.last_sync_error}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isConnected && syncEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncMutation.isPending}
                >
                  <RefreshCw className={cn('w-4 h-4 mr-1', syncMutation.isPending && 'animate-spin')} />
                  Sincronizar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {connection.sync_deadlines && <span>📅 Vencimientos</span>}
            {connection.sync_tasks && <span>✅ Tareas</span>}
            {connection.sync_meetings && <span>🤝 Reuniones</span>}
            <span className="ml-auto">
              {connection.sync_direction === 'both'
                ? '↔️ Bidireccional'
                : connection.sync_direction === 'to_calendar'
                ? '→ Hacia calendario'
                : '← Desde calendario'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configuración de {providerConfig.name}</DialogTitle>
            <DialogDescription>
              {connection.calendar_name || 'Ajusta las opciones de sincronización'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Sync Direction */}
            <div className="space-y-2">
              <Label>Dirección de sincronización</Label>
              <Select
                value={localSettings.sync_direction}
                onValueChange={(value) =>
                  setLocalSettings({ ...localSettings, sync_direction: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">↔️ Bidireccional</SelectItem>
                  <SelectItem value="to_calendar">→ Solo hacia calendario externo</SelectItem>
                  <SelectItem value="from_calendar">← Solo desde calendario externo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sync Options */}
            <div className="space-y-4">
              <Label>Sincronizar</Label>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span className="text-sm">Vencimientos (deadlines)</span>
                </div>
                <Switch
                  checked={localSettings.sync_deadlines}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, sync_deadlines: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span className="text-sm">Tareas</span>
                </div>
                <Switch
                  checked={localSettings.sync_tasks}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, sync_tasks: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤝</span>
                  <span className="text-sm">Reuniones</span>
                </div>
                <Switch
                  checked={localSettings.sync_meetings}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, sync_meetings: checked })
                  }
                />
              </div>
            </div>

            {/* Pause/Resume */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <p className="text-sm font-medium">Pausar sincronización</p>
                <p className="text-xs text-muted-foreground">
                  Detener temporalmente la sincronización
                </p>
              </div>
              <Switch checked={isPaused || !syncEnabled} onCheckedChange={handleTogglePause} />
            </div>

            {/* Disconnect */}
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Desconectar calendario
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSettings} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desconectar calendario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la conexión con {providerConfig.name} y se detendrá toda la
              sincronización. Los eventos ya creados en tu calendario externo no se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Desconectando...' : 'Desconectar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
