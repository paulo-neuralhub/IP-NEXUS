// =============================================
// InvoiceEditorPage - Editor completo de facturas
// Con líneas editables, totales en tiempo real, preview
// =============================================

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { InvoiceType, InvoiceStatus } from '@/types/finance';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useInvoice, useCreateInvoice, useUpdateInvoice, useBillingClients } from '@/hooks/use-finance';
import { useInvoiceSeries, useFiscalSettings } from '@/hooks/finance/useFiscalSettings';
import { InvoiceLineEditor, calculateTotals, type InvoiceLine } from '@/components/features/finance/invoices';
import { formatCurrency } from '@/lib/constants/finance';
import { toast } from 'sonner';

export default function InvoiceEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  // Rectification params
  const rectifyId = searchParams.get('rectify');
  const correctionReason = searchParams.get('reason');
  const correctionDescription = searchParams.get('description');
  const isRectificative = !!rectifyId;

  // Queries
  const invoiceQuery = useInvoice(id || '');
  const { data: clients = [] } = useBillingClients();
  const { data: series = [] } = useInvoiceSeries();
  const { data: fiscalSettings } = useFiscalSettings();
  
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('F');
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [withholdingPercent, setWithholdingPercent] = useState(0);

  // Load existing invoice data
  useEffect(() => {
    if (invoiceQuery.data && isEditing) {
      const inv = invoiceQuery.data;
      setSelectedClientId(inv.billing_client_id);
      setSelectedSeries(inv.invoice_series || 'F');
      setInvoiceDate(new Date(inv.invoice_date));
      setDueDate(inv.due_date ? new Date(inv.due_date) : undefined);
      setNotes(inv.notes || '');
      setInternalNotes(inv.internal_notes || '');
      setWithholdingPercent(inv.withholding_percent || 0);
      
      // Convert invoice items to lines
      if (inv.items && inv.items.length > 0) {
        const loadedLines: InvoiceLine[] = inv.items.map((item) => ({
          id: item.id,
          description: item.description,
          notes: item.notes,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          discount_percent: item.discount_percent || 0,
          vat_rate: item.tax_rate ?? 21,
          subtotal: item.subtotal || 0,
          vat_amount: item.tax_amount || 0,
          total: item.total || item.subtotal || 0,
          matter_id: item.matter_id,
        }));
        setLines(loadedLines);
      }
    }
  }, [invoiceQuery.data, isEditing]);

  // Load fiscal settings defaults
  useEffect(() => {
    if (fiscalSettings && !isEditing) {
      setWithholdingPercent(fiscalSettings.default_withholding || 0);
    }
  }, [fiscalSettings, isEditing]);

  // Calculate totals
  const totals = useMemo(() => calculateTotals(lines, withholdingPercent), [lines, withholdingPercent]);

  // Selected client data
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleSave = async (send = false) => {
    if (!selectedClientId) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (lines.length === 0) {
      toast.error('Añade al menos una línea a la factura');
      return;
    }

    const invoiceData = {
      billing_client_id: selectedClientId,
      client_name: selectedClient?.legal_name || '',
      client_tax_id: selectedClient?.tax_id,
      client_address: [
        selectedClient?.billing_address,
        selectedClient?.billing_postal_code,
        selectedClient?.billing_city,
      ].filter(Boolean).join(', '),
      invoice_series: selectedSeries,
      invoice_date: format(invoiceDate, 'yyyy-MM-dd'),
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      subtotal: totals.subtotal,
      tax_amount: totals.totalVat,
      total: totals.total,
      tax_rate: 21, // Default, actual rates are per-line
      notes,
      internal_notes: internalNotes,
      withholding_percent: withholdingPercent,
      total_withholding: totals.withholdingAmount,
      status: (send ? 'sent' : 'draft') as InvoiceStatus,
      invoice_type: (isRectificative ? 'FR' : 'FC') as InvoiceType,
      corrected_invoice_id: rectifyId || undefined,
      correction_reason: correctionReason || undefined,
      correction_description: correctionDescription || undefined,
    };

    const itemsData = lines.map((line, index) => ({
      line_number: index + 1,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      discount_percent: line.discount_percent,
      subtotal: line.subtotal,
      tax_rate: line.vat_rate,
      tax_amount: line.vat_amount,
      total: line.total,
      matter_id: line.matter_id,
      notes: line.notes,
    }));

    try {
      if (isEditing && id) {
        await updateInvoice.mutateAsync({ id, data: invoiceData });
        toast.success('Factura actualizada');
      } else {
        await createInvoice.mutateAsync({ invoice: invoiceData, items: itemsData });
        toast.success(send ? 'Factura creada y enviada' : 'Factura guardada como borrador');
      }
      navigate('/app/finance/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error al guardar la factura');
    }
  };

  const isLoading = createInvoice.isPending || updateInvoice.isPending;

  if (isEditing && invoiceQuery.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button variant="ghost" asChild className="-ml-2">
            <Link to="/app/finance/invoices" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar factura' : isRectificative ? 'Nueva factura rectificativa' : 'Nueva factura'}
          </h1>
          {isRectificative && (
            <p className="text-sm text-muted-foreground">
              Rectificando factura original. Motivo: {correctionReason}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar borrador
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Guardar y enviar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General data */}
          <Card>
            <CardHeader>
              <CardTitle>Datos generales</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serie</Label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona serie" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.length > 0 ? (
                      series.map((s) => (
                        <SelectItem key={s.id} value={s.code}>
                          {s.code} - {s.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="F">F - Facturas</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.legal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha emisión</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !invoiceDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {invoiceDate ? format(invoiceDate, 'PPP', { locale: es }) : 'Selecciona fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={invoiceDate}
                      onSelect={(date) => date && setInvoiceDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Fecha vencimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP', { locale: es }) : 'Selecciona fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Invoice lines */}
          <Card>
            <CardHeader>
              <CardTitle>Líneas de factura</CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceLineEditor lines={lines} onChange={setLines} />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Condiciones y notas</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notas para el cliente</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Estas notas aparecerán en la factura"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Notas internas</Label>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Solo visibles internamente"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Totals and preview */}
        <div className="space-y-6">
          {/* Totals card */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>
              
              {totals.vatBreakdown.map((vat) => (
                <div key={vat.rate} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA {vat.rate}%</span>
                  <span className="font-medium">{formatCurrency(vat.amount)}</span>
                </div>
              ))}

              {withholdingPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retención IRPF ({withholdingPercent}%)</span>
                  <span className="font-medium text-destructive">-{formatCurrency(totals.withholdingAmount)}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatCurrency(totals.total)}</span>
              </div>

              {/* Withholding input */}
              <div className="pt-4 space-y-2">
                <Label>Retención IRPF (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={withholdingPercent}
                  onChange={(e) => setWithholdingPercent(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* Client info card */}
          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Datos del cliente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{selectedClient.legal_name}</p>
                {selectedClient.tax_id && (
                  <p className="text-muted-foreground">{selectedClient.tax_id}</p>
                )}
                {selectedClient.billing_address && (
                  <p className="text-muted-foreground">{selectedClient.billing_address}</p>
                )}
                {(selectedClient.billing_postal_code || selectedClient.billing_city) && (
                  <p className="text-muted-foreground">
                    {[selectedClient.billing_postal_code, selectedClient.billing_city].filter(Boolean).join(' ')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
