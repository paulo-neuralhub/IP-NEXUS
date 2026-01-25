// ============================================================
// IP-NEXUS - HOLIDAYS TAB
// Tab for managing holiday calendars
// ============================================================

import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useHolidayCalendar, useToggleHoliday, useDeleteHoliday, COUNTRIES } from '@/hooks/useHolidayCalendars';
import { HolidayModal } from './HolidayModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function HolidaysTab() {
  const currentYear = new Date().getFullYear();
  const [selectedCountry, setSelectedCountry] = useState('ES');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: holidays, isLoading } = useHolidayCalendar(selectedCountry, selectedYear);
  const toggleHoliday = useToggleHoliday();
  const deleteHoliday = useDeleteHoliday();

  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  const country = COUNTRIES.find(c => c.code === selectedCountry);

  const handleToggle = (id: string, currentState: boolean | null) => {
    toggleHoliday.mutate({ id, isActive: !currentState });
  };

  const handleDelete = (id: string) => {
    deleteHoliday.mutate(id, { onSuccess: () => setDeleteId(null) });
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Calendarios de Festivos</h3>
          <p className="text-sm text-muted-foreground">
            Los festivos se excluyen del cálculo de plazos con días hábiles.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Festivo
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4 mb-4">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(holidays || []).map(h => (
                <TableRow key={h.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(h.date), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell>
                    <Badge variant={h.type === 'custom' ? 'outline' : 'secondary'}>
                      {h.type === 'national' ? 'Nacional' : h.type === 'regional' ? 'Regional' : 'Personalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={h.is_active ?? true}
                      onCheckedChange={() => handleToggle(h.id, h.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {h.type === 'custom' && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(h.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(holidays || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay festivos para {country?.name} en {selectedYear}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <HolidayModal
        open={showModal}
        onClose={() => setShowModal(false)}
        defaultCountry={selectedCountry}
        defaultYear={selectedYear}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Eliminar festivo"
        description="¿Eliminar este festivo personalizado?"
        confirmText="Eliminar"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        variant="destructive"
      />
    </div>
  );
}
