/**
 * Compact Timer Badge
 * Minimal timer widget for sidebar - single line, max 40px height
 * P57: Time Tracking Module
 */

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveTimer, useStopTimer } from '@/hooks/timetracking';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { MatterSelect } from '@/components/features/docket/MatterSelect';
import { useStartTimer } from '@/hooks/timetracking';
import { toast } from 'sonner';

const ACTIVITY_TYPES = [
  { value: 'research', label: 'Investigación' },
  { value: 'drafting', label: 'Redacción' },
  { value: 'review', label: 'Revisión' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'call', label: 'Llamada' },
  { value: 'email', label: 'Email' },
  { value: 'filing', label: 'Presentación' },
  { value: 'admin', label: 'Administrativo' },
  { value: 'other', label: 'Otro' },
];

export function CompactTimerBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [selectedMatter, setSelectedMatter] = useState<{ id: string; reference: string; title: string } | null>(null);
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Hooks
  const { data: activeTimer, isLoading } = useActiveTimer();
  const startTimerMutation = useStartTimer();
  const stopTimerMutation = useStopTimer();

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
    } else {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer?.timer_started_at]);

  // Listen for global start-timer event
  useEffect(() => {
    const handleStartGlobalTimer = () => {
      setIsOpen(true);
    };
    window.addEventListener('start-global-timer', handleStartGlobalTimer);
    return () => window.removeEventListener('start-global-timer', handleStartGlobalTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
      setIsOpen(false);
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
    } catch (error) {
      toast.error('Error al detener timer');
    }
  };

  if (isLoading) return null;

  const hasActiveTimer = !!activeTimer;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            "bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08]",
            hasActiveTimer && "border-cyan-500/30 bg-cyan-500/10"
          )}
        >
          {/* Icon */}
          <Clock className={cn(
            "w-4 h-4 shrink-0",
            hasActiveTimer ? "text-cyan-400" : "text-white/40"
          )} />
          
          {/* Text */}
          <span className={cn(
            "text-sm font-medium flex-1 text-left",
            hasActiveTimer ? "text-cyan-400" : "text-white/50"
          )}>
            {hasActiveTimer ? formatTime(elapsed) : 'Timer'}
          </span>
          
          {/* Pulsing dot when active */}
          {hasActiveTimer && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        side="top" 
        align="start" 
        className="w-72 p-4"
        sideOffset={8}
      >
        {hasActiveTimer ? (
          /* Active Timer View */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Timer activo</span>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-center py-2">
              <div className="text-3xl font-mono font-bold text-foreground">
                {formatTime(elapsed)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeTimer.matter?.reference}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {activeTimer.matter?.title}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className={activeTimer.is_billable ? 'text-green-600' : ''}>
                {activeTimer.is_billable ? '✓ Facturable' : 'No facturable'}
              </span>
              {activeTimer.billing_rate && (
                <span>• {activeTimer.billing_rate}€/h</span>
              )}
            </div>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleStopTimer}
              disabled={stopTimerMutation.isPending}
            >
              <Square className="h-4 w-4 mr-2" />
              Parar y guardar
            </Button>
          </div>
        ) : (
          /* New Timer Form */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nuevo registro</span>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

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
                placeholder="¿En qué trabajas?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Actividad</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Tipo..." />
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
                id="billable-compact"
                checked={isBillable}
                onCheckedChange={(checked) => setIsBillable(checked as boolean)}
              />
              <Label htmlFor="billable-compact" className="text-xs">Facturable</Label>
            </div>

            <Button
              className="w-full"
              onClick={handleStartTimer}
              disabled={!selectedMatter || startTimerMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar timer
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
