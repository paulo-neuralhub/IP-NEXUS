// Simple Holiday Modal
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddHoliday, COUNTRIES } from '@/hooks/useHolidayCalendars';

interface HolidayModalProps {
  open: boolean;
  onClose: () => void;
  defaultCountry: string;
  defaultYear: number;
}

export function HolidayModal({ open, onClose, defaultCountry, defaultYear }: HolidayModalProps) {
  const [country, setCountry] = useState(defaultCountry);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const addHoliday = useAddHoliday();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return;
    
    addHoliday.mutate({
      country_code: country,
      year: defaultYear,
      date,
      name,
      is_national: false,
    }, {
      onSuccess: () => {
        setDate('');
        setName('');
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Festivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Cierre oficina" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={addHoliday.isPending}>Añadir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
