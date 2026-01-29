/**
 * ScheduleMeetingModal - Modal para programar reunión vinculada al expediente
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2, Info, Video, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

interface MatterContact {
  id: string;
  name: string;
  email?: string;
}

interface ScheduleMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
  contacts?: MatterContact[];
}

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
];

const MEETING_TYPES = [
  { value: 'video', label: 'Videollamada', icon: Video },
  { value: 'in_person', label: 'Presencial', icon: MapPin },
  { value: 'phone', label: 'Llamada telefónica', icon: Users },
];

export function ScheduleMeetingModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  contacts = [],
}: ScheduleMeetingModalProps) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [meetingType, setMeetingType] = useState('video');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  // Mutation para programar reunión
  const scheduleMeetingMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');
      if (!title.trim()) throw new Error('El título es requerido');
      if (!date || !time) throw new Error('Fecha y hora son requeridas');

      const meetingStart = new Date(`${date}T${time}`);
      const meetingEnd = new Date(meetingStart.getTime() + parseInt(duration) * 60000);

      // Insertar en activities como tipo 'meeting'
      const { error } = await supabase
        .from('activities')
        .insert({
          organization_id: currentOrganization.id,
          matter_id: matterId,
          type: 'meeting',
          owner_type: 'tenant',
          subject: title.trim(),
          content: notes.trim() || undefined,
          meeting_start: meetingStart.toISOString(),
          meeting_end: meetingEnd.toISOString(),
          meeting_location: location.trim() || undefined,
          meeting_attendees: selectedAttendees.length > 0 ? selectedAttendees : undefined,
          created_by: user?.id,
          metadata: {
            meeting_type: meetingType,
            duration_minutes: parseInt(duration),
          },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Reunión programada');
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', matterId] });
      queryClient.invalidateQueries({ queryKey: ['activities', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-activities', matterId] });
      resetAndClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al programar reunión');
    },
  });

  const resetAndClose = () => {
    setTitle('');
    setDate('');
    setTime('');
    setDuration('30');
    setMeetingType('video');
    setLocation('');
    setNotes('');
    setSelectedAttendees([]);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Añade un título para la reunión');
      return;
    }
    if (!date || !time) {
      toast.error('Selecciona fecha y hora');
      return;
    }
    scheduleMeetingMutation.mutate();
  };

  const toggleAttendee = (id: string) => {
    setSelectedAttendees(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  // Default title based on matter reference
  const defaultTitle = matterReference 
    ? `Reunión - ${matterReference}` 
    : 'Reunión de seguimiento';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Programar Reunión
            {matterReference && (
              <Badge variant="outline" className="font-mono text-xs">
                {matterReference}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            La reunión quedará vinculada al expediente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="meeting-title">Título</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitle}
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">Fecha</Label>
              <Input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-time">Hora</Label>
              <Input
                id="meeting-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Duración y tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duración</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={meetingType} onValueChange={setMeetingType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ubicación (solo si no es videollamada) */}
          {meetingType !== 'video' && (
            <div className="space-y-2">
              <Label htmlFor="meeting-location">
                {meetingType === 'in_person' ? 'Ubicación' : 'Teléfono'}
              </Label>
              <Input
                id="meeting-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={meetingType === 'in_person' ? 'Oficina, dirección...' : 'Número de teléfono'}
              />
            </div>
          )}

          {/* Asistentes */}
          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label>Asistentes</Label>
              <div className="flex flex-wrap gap-2">
                {contacts.map((contact) => (
                  <Badge
                    key={contact.id}
                    variant={selectedAttendees.includes(contact.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAttendee(contact.id)}
                  >
                    {contact.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="meeting-notes">Notas (opcional)</Label>
            <Textarea
              id="meeting-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agenda, temas a tratar..."
              rows={3}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta reunión aparecerá en el timeline del expediente
              {date && time && (
                <> programada para el {format(new Date(`${date}T${time}`), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</>
              )}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={scheduleMeetingMutation.isPending}
          >
            {scheduleMeetingMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Programando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Programar reunión
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScheduleMeetingModal;
