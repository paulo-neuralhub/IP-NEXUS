/**
 * Generate Invoice From Time Dialog
 * P57: Allows generating a Finance invoice from unbilled time entries
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Receipt, Clock, Loader2 } from 'lucide-react';
import { useTimeEntries, useMarkEntriesAsBilled, TimeEntry } from '@/hooks/timetracking';
import { useBillingClients, useCreateInvoice } from '@/hooks/use-finance';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GenerateInvoiceFromTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId?: string;
  matterReference?: string;
  preSelectedEntries?: string[];
}

const ACTIVITY_LABELS: Record<string, string> = {
  research: 'Investigación',
  drafting: 'Redacción',
  review: 'Revisión',
  meeting: 'Reunión',
  call: 'Llamada',
  correspondence: 'Correspondencia',
  filing: 'Presentación',
  court: 'Audiencia',
  travel: 'Desplazamiento',
  admin: 'Administrativo',
  other: 'Otro',
};

export function GenerateInvoiceFromTimeDialog({
  open,
  onOpenChange,
  matterId,
  matterReference,
  preSelectedEntries = [],
}: GenerateInvoiceFromTimeDialogProps) {
  const navigate = useNavigate();
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(
    new Set(preSelectedEntries)
  );
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  // Fetch unbilled time entries
  const { data: entries = [], isLoading: loadingEntries } = useTimeEntries({
    matterId,
    status: 'draft',
  });

  const billableEntries = useMemo(
    () => entries.filter((e) => e.is_billable && e.billing_status !== 'billed'),
    [entries]
  );

  const { data: billingClients = [], isLoading: loadingClients } = useBillingClients();
  const createInvoiceMutation = useCreateInvoice();
  const billEntriesMutation = useMarkEntriesAsBilled();

  // Calculate totals
  const selectedEntriesData = useMemo(
    () => billableEntries.filter((e) => selectedEntries.has(e.id)),
    [billableEntries, selectedEntries]
  );

  const totalMinutes = selectedEntriesData.reduce((sum, e) => sum + e.duration_minutes, 0);
  const totalAmount = selectedEntriesData.reduce((sum, e) => sum + (e.billing_amount || 0), 0);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const toggleEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const toggleAll = () => {
    if (selectedEntries.size === billableEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(billableEntries.map((e) => e.id)));
    }
  };

  const handleGenerateInvoice = async () => {
    if (selectedEntries.size === 0) {
      toast.error('Selecciona al menos una entrada de tiempo');
      return;
    }

    if (!selectedClientId) {
      toast.error('Selecciona un cliente de facturación');
      return;
    }

    try {
      const client = billingClients.find((c) => c.id === selectedClientId);
      
      // Group entries by matter for line items
      const entriesByMatter = selectedEntriesData.reduce((acc, entry) => {
        const matterId = entry.matter_id || 'general';
        if (!acc[matterId]) {
          acc[matterId] = {
            matter: entry.matter,
            entries: [],
            totalMinutes: 0,
            totalAmount: 0,
          };
        }
        acc[matterId].entries.push(entry);
        acc[matterId].totalMinutes += entry.duration_minutes;
        acc[matterId].totalAmount += entry.billing_amount || 0;
        return acc;
      }, {} as Record<string, { matter: any; entries: TimeEntry[]; totalMinutes: number; totalAmount: number }>);

      // Create invoice items
      const items = Object.values(entriesByMatter).map((group) => {
        const matterRef = group.matter?.reference || 'General';
        const description = `Honorarios profesionales - ${matterRef}\n${group.entries
          .map(
            (e) =>
              `• ${format(new Date(e.date), 'dd/MM', { locale: es })}: ${e.description || ACTIVITY_LABELS[e.activity_type || 'other']} (${formatDuration(e.duration_minutes)})`
          )
          .join('\n')}`;

        return {
          description,
          quantity: 1,
          unit_price: group.totalAmount,
          subtotal: group.totalAmount,
          matter_id: group.matter?.id,
        };
      });

      const subtotal = totalAmount;
      const taxRate = 0.21; // 21% IVA
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      // Create the invoice
      const invoice = await createInvoiceMutation.mutateAsync({
        invoice: {
          billing_client_id: selectedClientId,
          client_name: client?.legal_name || '',
          subtotal,
          tax_rate: taxRate * 100,
          tax_amount: taxAmount,
          total,
          status: 'draft',
          notes: `Factura generada desde registro de tiempo. ${selectedEntriesData.length} entradas, ${formatDuration(totalMinutes)} total.`,
        },
        items,
      });

      // Mark time entries as billed
      await billEntriesMutation.mutateAsync({
        entryIds: Array.from(selectedEntries),
        invoiceId: invoice.id,
      });

      toast.success('Factura creada correctamente');
      onOpenChange(false);
      
      // Navigate to the invoice
      navigate(`/app/finance/invoices?id=${invoice.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la factura');
    }
  };

  const isLoading = loadingEntries || loadingClients;
  const isPending = createInvoiceMutation.isPending || billEntriesMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Generar Factura desde Tiempo
          </DialogTitle>
          <DialogDescription>
            Selecciona las entradas de tiempo a incluir en la factura
            {matterReference && ` para ${matterReference}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label>Cliente de facturación</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente..." />
              </SelectTrigger>
              <SelectContent>
                {billingClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.legal_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Time Entries List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Entradas de tiempo</Label>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedEntries.size === billableEntries.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Cargando entradas...
                </div>
              ) : billableEntries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No hay entradas de tiempo facturables
                </div>
              ) : (
                <div className="divide-y">
                  {billableEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleEntry(entry.id)}
                    >
                      <Checkbox
                        checked={selectedEntries.has(entry.id)}
                        onCheckedChange={() => toggleEntry(entry.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {format(new Date(entry.date), 'dd MMM yyyy', {
                              locale: es,
                            })}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(entry.duration_minutes)}
                          </Badge>
                          {entry.matter && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.matter.reference}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.description ||
                            ACTIVITY_LABELS[entry.activity_type || 'other']}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(entry.billing_amount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(entry.billing_rate || 0)}/h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entradas seleccionadas</span>
              <span className="font-medium">{selectedEntries.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiempo total</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(totalMinutes)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>+ IVA (21%)</span>
              <span>{formatCurrency(totalAmount * 0.21)}</span>
            </div>
            <div className="flex justify-between font-bold text-primary">
              <span>Total</span>
              <span>{formatCurrency(totalAmount * 1.21)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateInvoice}
            disabled={selectedEntries.size === 0 || !selectedClientId || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-2" />
                Generar Factura
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
