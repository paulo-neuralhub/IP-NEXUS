import { useState } from 'react';
import { Pencil, Upload, Calendar } from 'lucide-react';
import { useMatterOffice, type OfficeStatus, type ManualUpdateData } from '@/hooks/useMatterOffice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  matterId: string;
  officeStatus: OfficeStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: 'filed', labelEs: 'Presentado', labelDe: 'Angemeldet' },
  { value: 'examination', labelEs: 'En examen', labelDe: 'Geprüft' },
  { value: 'published', labelEs: 'Publicado', labelDe: 'Veröffentlicht' },
  { value: 'registered', labelEs: 'Registrado', labelDe: 'Eingetragen' },
  { value: 'rejected', labelEs: 'Denegado', labelDe: 'Zurückgewiesen' },
  { value: 'expired', labelEs: 'Caducado', labelDe: 'Erloschen' },
];

const SOURCE_OPTIONS = [
  { value: 'web', label: 'Consulta web oficina' },
  { value: 'email', label: 'Email/notificación oficina' },
  { value: 'bulletin', label: 'Boletín oficial' },
  { value: 'certificate', label: 'Certificado recibido' },
  { value: 'other', label: 'Otro' },
];

export function MatterOfficeManualUpdate({ matterId, officeStatus, open, onOpenChange }: Props) {
  const { updateManually, isUpdating } = useMatterOffice(matterId);

  const [statusNormalized, setStatusNormalized] = useState(officeStatus.statusNormalized || '');
  const [filingDate, setFilingDate] = useState(officeStatus.filingDate?.split('T')[0] || '');
  const [publicationDate, setPublicationDate] = useState(officeStatus.publicationDate?.split('T')[0] || '');
  const [registrationDate, setRegistrationDate] = useState(officeStatus.registrationDate?.split('T')[0] || '');
  const [expiryDate, setExpiryDate] = useState(officeStatus.expiryDate?.split('T')[0] || '');
  const [source, setSource] = useState('web');
  const [notes, setNotes] = useState('');
  const [recalculateDeadlines, setRecalculateDeadlines] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedStatus = STATUS_OPTIONS.find(s => s.value === statusNormalized);

    const data: ManualUpdateData = {
      status: selectedStatus?.labelEs,
      statusNormalized,
      filingDate: filingDate || undefined,
      publicationDate: publicationDate || undefined,
      registrationDate: registrationDate || undefined,
      expiryDate: expiryDate || undefined,
      source,
      notes,
      recalculateDeadlines,
    };

    await updateManually(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Actualizar datos oficiales
          </DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-2">
              <span className="text-lg">{officeStatus.officeFlag}</span>
              <span>{officeStatus.officeName} • {officeStatus.applicationNumber}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <Label>Estado oficial *</Label>
            <Select value={statusNormalized} onValueChange={setStatusNormalized}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.labelEs}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filingDate" className="text-xs">Fecha presentación</Label>
                <Input
                  id="filingDate"
                  type="date"
                  value={filingDate}
                  onChange={(e) => setFilingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate" className="text-xs">Fecha publicación</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationDate" className="text-xs">Fecha registro</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-xs">Fecha vencimiento</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <Label>¿De dónde obtuviste estos datos?</Label>
            <RadioGroup value={source} onValueChange={setSource}>
              {SOURCE_OPTIONS.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Ej: Registro confirmado en boletín nº 2025/02"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Recalculate deadlines */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recalculateDeadlines"
              checked={recalculateDeadlines}
              onCheckedChange={(checked) => setRecalculateDeadlines(checked === true)}
            />
            <Label htmlFor="recalculateDeadlines" className="font-normal cursor-pointer">
              Recalcular plazos automáticamente
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!statusNormalized || isUpdating}>
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
