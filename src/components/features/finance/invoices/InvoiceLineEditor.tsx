// =============================================
// InvoiceLineEditor - Editor de líneas de factura
// Tabla editable con cálculo automático de totales
// Incluye búsqueda de servicios del catálogo
// =============================================

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/constants/finance';
import { ServiceSearchInput } from '../ServiceSearchInput';
import type { ServiceCatalogItem } from '@/types/service-catalog';

export interface InvoiceLine {
  id: string;
  description: string;
  notes?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  matter_id?: string;
  time_entry_id?: string;
  expense_id?: string;
  service_id?: string;  // Link to service catalog
}

interface InvoiceLineEditorProps {
  lines: InvoiceLine[];
  onChange: (lines: InvoiceLine[]) => void;
  currency?: string;
  readOnly?: boolean;
}

const VAT_RATES = [
  { value: 21, label: '21% (General)' },
  { value: 10, label: '10% (Reducido)' },
  { value: 4, label: '4% (Superreducido)' },
  { value: 0, label: '0% (Exento)' },
];

function calculateLine(line: Partial<InvoiceLine>): InvoiceLine {
  const quantity = line.quantity || 1;
  const unitPrice = line.unit_price || 0;
  const discountPercent = line.discount_percent || 0;
  const vatRate = line.vat_rate ?? 21;
  
  const grossAmount = quantity * unitPrice;
  const discountAmount = grossAmount * (discountPercent / 100);
  const subtotal = grossAmount - discountAmount;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;
  
  return {
    id: line.id || crypto.randomUUID(),
    description: line.description || '',
    notes: line.notes,
    quantity,
    unit_price: unitPrice,
    discount_percent: discountPercent,
    vat_rate: vatRate,
    subtotal,
    vat_amount: vatAmount,
    total,
    matter_id: line.matter_id,
    time_entry_id: line.time_entry_id,
    expense_id: line.expense_id,
  };
}

export function InvoiceLineEditor({ 
  lines, 
  onChange, 
  currency = 'EUR',
  readOnly = false 
}: InvoiceLineEditorProps) {
  const [expandedLine, setExpandedLine] = useState<string | null>(null);

  const addLine = () => {
    const newLine = calculateLine({
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      vat_rate: 21,
    });
    onChange([...lines, newLine]);
  };

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    onChange(
      lines.map(line => 
        line.id === id ? calculateLine({ ...line, ...updates }) : line
      )
    );
  };

  // Handle service selection - auto-fill price
  const handleServiceSelect = (lineId: string, service: ServiceCatalogItem) => {
    updateLine(lineId, {
      unit_price: service.base_price,
      vat_rate: (service as any).tax_rate ?? 21,
      service_id: service.id,
    });
  };

  const removeLine = (id: string) => {
    onChange(lines.filter(line => line.id !== id));
  };

  const duplicateLine = (line: InvoiceLine) => {
    const newLine = calculateLine({
      ...line,
      id: crypto.randomUUID(),
    });
    const index = lines.findIndex(l => l.id === line.id);
    const newLines = [...lines];
    newLines.splice(index + 1, 0, newLine);
    onChange(newLines);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="min-w-[200px]">Concepto</TableHead>
              <TableHead className="w-20 text-center">Cant.</TableHead>
              <TableHead className="w-28 text-right">Precio</TableHead>
              <TableHead className="w-20 text-center">Dto.%</TableHead>
              <TableHead className="w-28 text-center">IVA</TableHead>
              <TableHead className="w-28 text-right">Subtotal</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay líneas. Añade la primera línea a la factura.
                </TableCell>
              </TableRow>
            ) : (
              lines.map((line, index) => (
                <>
                  <TableRow key={line.id}>
                    <TableCell className="text-center">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm">{line.description}</span>
                      ) : (
                        <ServiceSearchInput
                          value={line.description}
                          onChange={(value) => updateLine(line.id, { description: value })}
                          onServiceSelect={(service) => handleServiceSelect(line.id, service)}
                          placeholder="Escriba o busque un servicio..."
                          className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm text-center block">{line.quantity}</span>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, { quantity: parseFloat(e.target.value) || 0 })}
                          className="text-center border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm text-right block">{formatCurrency(line.unit_price, currency)}</span>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={line.unit_price}
                          onChange={(e) => updateLine(line.id, { unit_price: parseFloat(e.target.value) || 0 })}
                          className="text-right border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm text-center block">{line.discount_percent}%</span>
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={line.discount_percent}
                          onChange={(e) => updateLine(line.id, { discount_percent: parseFloat(e.target.value) || 0 })}
                          className="text-center border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <span className="text-sm text-center block">{line.vat_rate}%</span>
                      ) : (
                        <Select
                          value={String(line.vat_rate)}
                          onValueChange={(v) => updateLine(line.id, { vat_rate: parseFloat(v) })}
                        >
                          <SelectTrigger className="border-0 shadow-none focus:ring-0 h-auto py-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VAT_RATES.map((rate) => (
                              <SelectItem key={rate.value} value={String(rate.value)}>
                                {rate.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(line.subtotal, currency)}
                    </TableCell>
                    <TableCell>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {/* Expanded row for notes */}
                  {expandedLine === line.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30 py-3">
                        <Textarea
                          placeholder="Notas adicionales para esta línea..."
                          value={line.notes || ''}
                          onChange={(e) => updateLine(line.id, { notes: e.target.value })}
                          rows={2}
                          className="text-sm"
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addLine}>
            <Plus className="w-4 h-4 mr-2" />
            Añadir línea
          </Button>
        </div>
      )}
    </div>
  );
}

export function calculateTotals(lines: InvoiceLine[], withholdingPercent = 0) {
  const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const totalVat = lines.reduce((sum, line) => sum + line.vat_amount, 0);
  const withholdingAmount = subtotal * (withholdingPercent / 100);
  const total = subtotal + totalVat - withholdingAmount;
  
  // Group VAT by rate
  const vatBreakdown = lines.reduce((acc, line) => {
    const rate = line.vat_rate;
    if (!acc[rate]) {
      acc[rate] = { rate, base: 0, amount: 0 };
    }
    acc[rate].base += line.subtotal;
    acc[rate].amount += line.vat_amount;
    return acc;
  }, {} as Record<number, { rate: number; base: number; amount: number }>);
  
  return {
    subtotal,
    totalVat,
    withholdingAmount,
    total,
    vatBreakdown: Object.values(vatBreakdown),
  };
}
