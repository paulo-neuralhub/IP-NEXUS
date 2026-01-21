/**
 * Add Time Entry Dialog
 * Manual time entry form
 * P57: Time Tracking Module
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MatterSelect } from '@/components/features/docket/MatterSelect';
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateTimeEntry, useApplicableRate } from '@/hooks/timetracking';
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

interface AddTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date | null;
  defaultMatter?: { id: string; reference: string; title: string } | null;
}

export function AddTimeEntryDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultMatter,
}: AddTimeEntryDialogProps) {
  const [selectedMatter, setSelectedMatter] = useState<{ id: string; reference: string; title: string } | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  const createMutation = useCreateTimeEntry();
  const { data: applicableRate } = useApplicableRate(selectedMatter?.id);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMatter(defaultMatter || null);
      setDate(defaultDate || new Date());
      setHours('');
      setMinutes('');
      setStartTime('');
      setEndTime('');
      setDescription('');
      setActivityType('');
      setIsBillable(true);
    }
  }, [open, defaultDate, defaultMatter]);

  // Calculate duration from start/end times
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      if (endMinutes > startMinutes) {
        const diff = endMinutes - startMinutes;
        setHours(Math.floor(diff / 60).toString());
        setMinutes((diff % 60).toString());
      }
    }
  }, [startTime, endTime]);

  const handleSubmit = async () => {
    if (!selectedMatter) {
      toast.error('Selecciona un expediente');
      return;
    }

    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalMinutes <= 0) {
      toast.error('La duración debe ser mayor a 0');
      return;
    }

    if (!description.trim()) {
      toast.error('Añade una descripción');
      return;
    }

    try {
      await createMutation.mutateAsync({
        matter_id: selectedMatter.id,
        date: format(date, 'yyyy-MM-dd'),
        duration_minutes: totalMinutes,
        description: description.trim(),
        activity_type: activityType || undefined,
        is_billable: isBillable,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
      });
      toast.success('Entrada de tiempo registrada');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al guardar la entrada');
    }
  };

  const estimatedAmount = applicableRate && isBillable
    ? ((parseInt(hours) || 0) + (parseInt(minutes) || 0) / 60) * applicableRate
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Añadir entrada de tiempo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Matter */}
          <div className="space-y-2">
            <Label>Expediente *</Label>
            <MatterSelect
              value={selectedMatter}
              onChange={setSelectedMatter}
              placeholder="Seleccionar expediente..."
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duración *</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">h</span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">m</span>
              </div>
            </div>
          </div>

          {/* Optional: Start/End times */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Hora inicio/fin (opcional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="Inicio"
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="Fin"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <Textarea
              placeholder="Describe el trabajo realizado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label>Tipo de actividad</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
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

          {/* Billable */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="billable"
                checked={isBillable}
                onCheckedChange={(checked) => setIsBillable(checked as boolean)}
              />
              <Label htmlFor="billable">Facturable</Label>
            </div>
            {applicableRate !== null && isBillable && (
              <div className="text-sm text-muted-foreground">
                {applicableRate}€/h = <span className="font-medium text-foreground">{estimatedAmount.toFixed(2)}€</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
