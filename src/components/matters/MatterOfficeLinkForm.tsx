import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useMatterOffice } from '@/hooks/useMatterOffice';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  matterId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OFFICES = [
  { code: 'ES', name: 'OEPM (España)', flag: '🇪🇸' },
  { code: 'EUIPO', name: 'EUIPO (Unión Europea)', flag: '🇪🇺' },
  { code: 'USPTO', name: 'USPTO (Estados Unidos)', flag: '🇺🇸' },
  { code: 'WIPO', name: 'WIPO (Internacional)', flag: '🌐' },
  { code: 'EPO', name: 'EPO (Patentes Europa)', flag: '🇪🇺' },
  { code: 'UKIPO', name: 'UKIPO (Reino Unido)', flag: '🇬🇧' },
  { code: 'DPMA', name: 'DPMA (Alemania)', flag: '🇩🇪' },
  { code: 'INPI', name: 'INPI (Francia)', flag: '🇫🇷' },
  { code: 'CNIPA', name: 'CNIPA (China)', flag: '🇨🇳' },
  { code: 'JPO', name: 'JPO (Japón)', flag: '🇯🇵' },
];

export function MatterOfficeLinkForm({ matterId, open, onOpenChange }: Props) {
  const { linkToOffice, isLinking } = useMatterOffice(matterId);
  const [officeCode, setOfficeCode] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeCode || !applicationNumber.trim()) return;

    await linkToOffice({ officeCode, applicationNumber: applicationNumber.trim() });
    onOpenChange(false);
    setOfficeCode('');
    setApplicationNumber('');
  };

  const selectedOffice = OFFICES.find(o => o.code === officeCode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Vincular a oficina
          </DialogTitle>
          <DialogDescription>
            Introduce el número de solicitud oficial para activar la sincronización automática.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="office">Oficina</Label>
            <Select value={officeCode} onValueChange={setOfficeCode}>
              <SelectTrigger id="office">
                <SelectValue placeholder="Seleccionar oficina" />
              </SelectTrigger>
              <SelectContent>
                {OFFICES.map(office => (
                  <SelectItem key={office.code} value={office.code}>
                    <span className="flex items-center gap-2">
                      <span>{office.flag}</span>
                      <span>{office.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationNumber">Nº Solicitud</Label>
            <Input
              id="applicationNumber"
              placeholder={selectedOffice?.code === 'EUIPO' ? 'Ej: 018123456' : 'Número de solicitud'}
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Introduce el número tal como aparece en la oficina.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!officeCode || !applicationNumber.trim() || isLinking}>
              {isLinking ? 'Vinculando...' : 'Guardar y sincronizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
