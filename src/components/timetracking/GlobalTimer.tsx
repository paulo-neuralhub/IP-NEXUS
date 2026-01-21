/**
 * Global Timer Widget
 * Floating timer component always visible in AppLayout
 * P57: Time Tracking Module
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MatterSelect } from '@/components/features/docket/MatterSelect';
import {
  Clock,
  Play,
  Square,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveTimer, useStartTimer, useStopTimer } from '@/hooks/timetracking';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  { value: 'research', label: 'Investigación' },
  { value: 'drafting', label: 'Redacción' },
  { value: 'review', label: 'Revisión' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'call', label: 'Llamada' },
  { value: 'email', label: 'Email/Correspondencia' },
  { value: 'filing', label: 'Presentación' },
  { value: 'court', label: 'Tribunal/Vista' },
  { value: 'travel', label: 'Desplazamiento' },
  { value: 'admin', label: 'Administrativo' },
  { value: 'other', label: 'Otro' },
];

export function GlobalTimer({ placement = 'floating' }: { placement?: 'floating' | 'sidebar' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Form state for new timer
  const [selectedMatter, setSelectedMatter] = useState<{ id: string; reference: string; title: string } | null>(null);
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Timer state
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { data: activeTimer, isLoading } = useActiveTimer();
  const startTimerMutation = useStartTimer();
  const stopTimerMutation = useStopTimer();

  // Listen for global start-timer event (from MobileBottomNav quick actions)
  useEffect(() => {
    const handleStartGlobalTimer = () => {
      setIsMinimized(false);
      setIsExpanded(true);
    };
    
    window.addEventListener('start-global-timer', handleStartGlobalTimer);
    return () => window.removeEventListener('start-global-timer', handleStartGlobalTimer);
  }, []);

  // Update elapsed when timer is active
  useEffect(() => {
    if (activeTimer?.timer_started_at) {
      const startTime = new Date(activeTimer.timer_started_at).getTime();
      const updateElapsed = () => {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      };
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
      if (!isExpanded) setIsExpanded(true);
    } else {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer?.timer_started_at]);

  const handleStartTimer = async () => {
    if (!selectedMatter) {
      toast.error('Selecciona un expediente');
      return;
    }

    try {
      await startTimerMutation.mutateAsync({
        matter_id: selectedMatter.id,
        description: description || undefined,
        activity_type: activityType || undefined,
        is_billable: isBillable,
      });
      toast.success('Timer iniciado');
      setDescription('');
      setActivityType('');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar timer');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;

    try {
      await stopTimerMutation.mutateAsync({
        entryId: activeTimer.id,
        description: activeTimer.description === 'En progreso...' ? description || 'Trabajo realizado' : activeTimer.description,
        elapsedSeconds: elapsed,
      });
      toast.success('Tiempo registrado');
      setIsExpanded(false);
    } catch (error) {
      toast.error('Error al detener timer');
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return null;

  const isFloating = placement === 'floating';

  // Minimized state - just a small floating button (floating mode only)
  if (isFloating && isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className={cn(
            'h-12 w-12 rounded-full shadow-lg',
            activeTimer ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'
          )}
          onClick={() => setIsMinimized(false)}
        >
          <Clock className="h-5 w-5" />
        </Button>
        {activeTimer && (
          <span className="absolute -top-1 -right-1 bg-white text-xs font-mono px-1 rounded shadow">
            {formatTime(elapsed)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        isFloating ? 'fixed bottom-6 right-6 z-50' : 'w-full',
      )}
    >
      <Card className={cn(
        'shadow-xl transition-all duration-200',
        isFloating ? (isExpanded ? 'w-80' : 'w-64') : 'w-full'
      )}>
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={cn(
                'h-4 w-4',
                activeTimer ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
              )} />
              <span className="text-sm font-medium">
                {activeTimer ? 'Grabando' : 'Timer'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
              {isFloating && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(true)}
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Timer Display */}
          {activeTimer && (
            <div className="space-y-2 mb-3">
              <div className="text-2xl font-mono text-center font-bold">
                {formatTime(elapsed)}
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {activeTimer.matter?.reference} - {activeTimer.matter?.title}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className={activeTimer.is_billable ? 'text-green-600' : 'text-muted-foreground'}>
                  {activeTimer.is_billable ? 'Facturable' : 'No facturable'}
                </span>
                {activeTimer.billing_rate && (
                  <span className="text-muted-foreground">• {activeTimer.billing_rate}€/h</span>
                )}
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleStopTimer}
                disabled={stopTimerMutation.isPending}
              >
                <Square className="h-4 w-4 mr-2" />
                Parar
              </Button>
            </div>
          )}

          {/* New Timer Form */}
          <Collapsible open={isExpanded && !activeTimer}>
            <CollapsibleContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Expediente *</Label>
                <MatterSelect
                  value={selectedMatter}
                  onChange={setSelectedMatter}
                  placeholder="Seleccionar..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Descripción</Label>
                <Input
                  placeholder="¿En qué estás trabajando?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tipo de actividad</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="billable"
                  checked={isBillable}
                  onCheckedChange={(checked) => setIsBillable(checked as boolean)}
                />
                <Label htmlFor="billable" className="text-xs">Facturable</Label>
              </div>

              <Button
                className="w-full"
                onClick={handleStartTimer}
                disabled={!selectedMatter || startTimerMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar timer
              </Button>
            </CollapsibleContent>
          </Collapsible>

          {/* Collapsed state - just show start button */}
          {!isExpanded && !activeTimer && (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsExpanded(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Nuevo registro
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
