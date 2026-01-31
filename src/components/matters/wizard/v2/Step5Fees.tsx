// ============================================================
// IP-NEXUS - STEP 5: FEES & BILLING (V2)
// L132: Fee breakdown and billing options
// ============================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, Receipt, PlusCircle, Trash2, Calculator, AlertCircle,
  Building, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  TableFooter,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { MatterWizardState, WizardFeeLine } from './types';

interface Step5FeesProps {
  data: MatterWizardState['step5'];
  onChange: (data: Partial<MatterWizardState['step5']>) => void;
  matterType: string;
  jurisdiction: string;
  niceClassCount: number;
}

// VAT rate (Spain default)
const VAT_RATE = 0.21;

// Currency options
const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'Dólar USA' },
  { code: 'GBP', symbol: '£', label: 'Libra' },
  { code: 'CHF', symbol: 'Fr', label: 'Franco suizo' },
];

// Default fee templates by jurisdiction
const FEE_TEMPLATES: Record<string, WizardFeeLine[]> = {
  ES_TM: [
    { id: '1', type: 'official', description: 'Tasa de solicitud (OEPM)', amount: 150, currency: 'EUR', quantity: 1 },
    { id: '2', type: 'official', description: 'Tasa por clase adicional', amount: 50, currency: 'EUR', quantity: 0 },
    { id: '3', type: 'professional', description: 'Estudio previo', amount: 200, currency: 'EUR', quantity: 1 },
    { id: '4', type: 'professional', description: 'Preparación y presentación', amount: 400, currency: 'EUR', quantity: 1 },
  ],
  EU_TM: [
    { id: '1', type: 'official', description: 'Tasa de solicitud (EUIPO) - 1 clase', amount: 850, currency: 'EUR', quantity: 1 },
    { id: '2', type: 'official', description: 'Tasa 2ª clase', amount: 50, currency: 'EUR', quantity: 0 },
    { id: '3', type: 'official', description: 'Tasa 3ª clase y siguientes', amount: 150, currency: 'EUR', quantity: 0 },
    { id: '4', type: 'professional', description: 'Preparación y presentación', amount: 600, currency: 'EUR', quantity: 1 },
  ],
  US_TM: [
    { id: '1', type: 'official', description: 'USPTO filing fee (per class)', amount: 250, currency: 'USD', quantity: 1 },
    { id: '2', type: 'professional', description: 'Preparation and filing', amount: 800, currency: 'USD', quantity: 1 },
  ],
};

export function Step5Fees({ data, onChange, matterType, jurisdiction, niceClassCount }: Step5FeesProps) {
  const currency = CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];

  // Initialize with template fees if empty
  useMemo(() => {
    if (data.feeLines.length === 0) {
      const templateKey = `${jurisdiction}_${matterType?.substring(0, 2) || 'TM'}`;
      const template = FEE_TEMPLATES[templateKey] || FEE_TEMPLATES['ES_TM'];
      onChange({ feeLines: template.map(f => ({ ...f, currency: data.currency })) });
    }
  }, []);

  // Auto-update class-based fees
  useMemo(() => {
    if (niceClassCount > 1) {
      const updated = data.feeLines.map(line => {
        if (line.description.toLowerCase().includes('clase adicional') || 
            line.description.toLowerCase().includes('per class')) {
          return { ...line, quantity: Math.max(0, niceClassCount - 1) };
        }
        if (line.description.toLowerCase().includes('2ª clase')) {
          return { ...line, quantity: niceClassCount >= 2 ? 1 : 0 };
        }
        if (line.description.toLowerCase().includes('3ª clase')) {
          return { ...line, quantity: Math.max(0, niceClassCount - 2) };
        }
        return line;
      });
      if (JSON.stringify(updated) !== JSON.stringify(data.feeLines)) {
        onChange({ feeLines: updated });
      }
    }
  }, [niceClassCount]);

  // Calculate totals
  const totals = useMemo(() => {
    const officialFees = data.feeLines
      .filter(f => f.type === 'official')
      .reduce((sum, f) => sum + (f.amount * f.quantity), 0);
    
    const professionalFees = data.feeLines
      .filter(f => f.type === 'professional')
      .reduce((sum, f) => sum + (f.amount * f.quantity), 0);
    
    const subtotal = officialFees + professionalFees;
    const vat = professionalFees * VAT_RATE; // VAT only on professional fees
    const total = subtotal + vat;

    return { officialFees, professionalFees, subtotal, vat, total };
  }, [data.feeLines]);

  // Handlers
  const addFeeLine = (type: 'official' | 'professional') => {
    const newLine: WizardFeeLine = {
      id: Date.now().toString(),
      type,
      description: '',
      amount: 0,
      currency: data.currency,
      quantity: 1,
    };
    onChange({ feeLines: [...data.feeLines, newLine] });
  };

  const updateFeeLine = (id: string, updates: Partial<WizardFeeLine>) => {
    const updated = data.feeLines.map(line => 
      line.id === id ? { ...line, ...updates } : line
    );
    onChange({ feeLines: updated });
  };

  const removeFeeLine = (id: string) => {
    onChange({ feeLines: data.feeLines.filter(f => f.id !== id) });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.currency,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Presupuesto y Facturación</h2>
        <p className="text-muted-foreground">Desglose de costes y configuración de facturación</p>
      </div>

      {/* FEE BREAKDOWN */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Desglose de Costes
            </CardTitle>
            <Select
              value={data.currency}
              onValueChange={(val) => onChange({ currency: val })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Concepto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center w-[80px]">Cant.</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Official fees */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="font-medium">
                  TASAS OFICIALES
                </TableCell>
              </TableRow>
              {data.feeLines.filter(f => f.type === 'official').map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Input
                      value={line.description}
                      onChange={(e) => updateFeeLine(line.id, { description: e.target.value })}
                      className="h-8 border-0 bg-transparent p-0"
                      placeholder="Descripción"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={line.amount}
                      onChange={(e) => updateFeeLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                      className="h-8 w-24 text-right ml-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={line.quantity}
                      onChange={(e) => updateFeeLine(line.id, { quantity: parseInt(e.target.value) || 0 })}
                      className="h-8 w-16 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(line.amount * line.quantity)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFeeLine(line.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}>
                  <Button variant="ghost" size="sm" onClick={() => addFeeLine('official')}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Añadir tasa
                  </Button>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totals.officialFees)}
                </TableCell>
                <TableCell />
              </TableRow>

              {/* Professional fees */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={5} className="font-medium">
                  HONORARIOS PROFESIONALES
                </TableCell>
              </TableRow>
              {data.feeLines.filter(f => f.type === 'professional').map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Input
                      value={line.description}
                      onChange={(e) => updateFeeLine(line.id, { description: e.target.value })}
                      className="h-8 border-0 bg-transparent p-0"
                      placeholder="Descripción"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={line.amount}
                      onChange={(e) => updateFeeLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                      className="h-8 w-24 text-right ml-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={line.quantity}
                      onChange={(e) => updateFeeLine(line.id, { quantity: parseInt(e.target.value) || 0 })}
                      className="h-8 w-16 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(line.amount * line.quantity)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFeeLine(line.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}>
                  <Button variant="ghost" size="sm" onClick={() => addFeeLine('professional')}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Añadir honorario
                  </Button>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totals.professionalFees)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>TOTAL (sin IVA)</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.subtotal)}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}>IVA (21% sobre honorarios)</TableCell>
                <TableCell className="text-right">{formatCurrency(totals.vat)}</TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="font-bold text-lg">
                <TableCell colSpan={3}>TOTAL</TableCell>
                <TableCell className="text-right text-primary">{formatCurrency(totals.total)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* BILLING OPTIONS */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Generar factura</Label>
            <RadioGroup
              value={data.invoiceTiming}
              onValueChange={(val) => onChange({ invoiceTiming: val as 'on_create' | 'on_filing' | 'manual' })}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on_create" id="invoice-create" />
                <Label htmlFor="invoice-create" className="cursor-pointer">
                  Al crear el expediente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on_filing" id="invoice-filing" />
                <Label htmlFor="invoice-filing" className="cursor-pointer">
                  Al presentar la solicitud
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="invoice-manual" />
                <Label htmlFor="invoice-manual" className="cursor-pointer">
                  Manualmente
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Contacto facturación</Label>
            <Select
              value={data.billingContactId || 'client'}
              onValueChange={(val) => onChange({ billingContactId: val === 'client' ? undefined : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Usar datos del cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Usar datos del cliente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
