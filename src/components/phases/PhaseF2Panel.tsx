// ============================================================
// IP-NEXUS - PHASE F2 PANEL (PRESUPUESTO)
// PROMPT 21: Panel de creación y gestión de presupuestos
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { 
  Plus, 
  Trash2, 
  FileText, 
  Send,
  Eye,
  MessageCircle,
  CheckCircle2,
  SkipForward
} from 'lucide-react';
import { PHASE_CHECKLISTS, type PhaseF2Data } from '@/hooks/use-phase-data';

interface PhaseF2PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

const QUOTE_TEMPLATES = [
  { id: 'trademark_es_standard', name: 'Marca Nacional España - Estándar' },
  { id: 'trademark_eu_standard', name: 'Marca Unión Europea - Estándar' },
  { id: 'trademark_int_standard', name: 'Marca Internacional - Estándar' },
  { id: 'patent_es_standard', name: 'Patente Nacional España - Estándar' },
  { id: 'design_eu_standard', name: 'Diseño Comunitario - Estándar' },
];

const DEFAULT_LINE_ITEMS = [
  { id: '1', category: 'official_fees', concept: 'Tasa de solicitud (1 clase)', quantity: 1, unit_price: 127.83, total: 127.83, taxable: false },
  { id: '2', category: 'official_fees', concept: 'Tasa clase adicional', quantity: 2, unit_price: 38.76, total: 77.52, taxable: false },
  { id: '3', category: 'professional_fees', concept: 'Estudio de viabilidad', quantity: 1, unit_price: 150.00, total: 150.00, taxable: true },
  { id: '4', category: 'professional_fees', concept: 'Redacción y presentación', quantity: 1, unit_price: 300.00, total: 300.00, taxable: true },
  { id: '5', category: 'professional_fees', concept: 'Gestión administrativa', quantity: 1, unit_price: 100.00, total: 100.00, taxable: true },
];

export function PhaseF2Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF2PanelProps) {
  const data = phaseData as PhaseF2Data;
  const checklistItems = PHASE_CHECKLISTS.F2;

  const lineItems = data.line_items || DEFAULT_LINE_ITEMS;
  
  // Calculate totals
  const subtotalFees = lineItems
    .filter(item => !item.taxable)
    .reduce((sum, item) => sum + item.total, 0);
  
  const subtotalTaxable = lineItems
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + item.total, 0);
  
  const subtotal = subtotalFees + subtotalTaxable;
  const taxRate = data.tax_rate || 21;
  const taxAmount = (subtotalTaxable * taxRate) / 100;
  const total = subtotal + taxAmount;

  const addLineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      category: 'other' as const,
      concept: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      taxable: true,
    };
    onDataChange('line_items', [...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: string, value: unknown) => {
    const updated = lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    });
    onDataChange('line_items', updated);
  };

  const removeLineItem = (id: string) => {
    onDataChange('line_items', lineItems.filter(item => item.id !== id));
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'official_fees': return 'Tasas oficiales';
      case 'professional_fees': return 'Honorarios';
      case 'other': return 'Otros';
      default: return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            Checklist de Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(checklistItems).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <Checkbox
                id={key}
                checked={checklist[key] || false}
                onCheckedChange={(checked) => onChecklistChange(key, !!checked)}
              />
              <Label htmlFor={key} className="cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Plantilla de Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={data.template_used || ''}
              onValueChange={(value) => onDataChange('template_used', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Seleccionar plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">Usar plantilla</Button>
            <Button variant="ghost">Personalizado</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quote Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Editor de Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-sm font-medium">
              <div className="col-span-5">CONCEPTO</div>
              <div className="col-span-2 text-center">CANTIDAD</div>
              <div className="col-span-2 text-right">P. UNITARIO</div>
              <div className="col-span-2 text-right">IMPORTE</div>
              <div className="col-span-1"></div>
            </div>

            {/* Group by category */}
            {(['official_fees', 'professional_fees', 'other'] as const).map((category) => {
              const categoryItems = lineItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="px-3 py-2 bg-muted/30 text-sm font-medium text-muted-foreground">
                    {getCategoryLabel(category)}
                  </div>
                  {categoryItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-2 border-b items-center">
                      <div className="col-span-5">
                        <Input
                          value={item.concept}
                          onChange={(e) => updateLineItem(item.id, 'concept', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-right"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2 text-right text-sm font-medium">
                        €{item.total.toFixed(2)}
                      </div>
                      <div className="col-span-1 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Add Line */}
            <div className="p-2 border-b">
              <Button variant="ghost" size="sm" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-1" />
                Añadir línea
              </Button>
            </div>

            {/* Totals */}
            <div className="p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal tasas oficiales</span>
                <span>€{subtotalFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal honorarios</span>
                <span>€{subtotalTaxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1">
                <span>SUBTOTAL</span>
                <span className="font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>IVA ({taxRate}%) sobre honorarios</span>
                <span>€{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Validez del presupuesto</Label>
              <Select
                value={String(data.validity_days || 30)}
                onValueChange={(value) => onDataChange('validity_days', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Forma de pago</Label>
              <Select
                value={data.payment_terms || '100_advance'}
                onValueChange={(value) => onDataChange('payment_terms', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100_advance">100% anticipado</SelectItem>
                  <SelectItem value="50_advance">50% anticipado</SelectItem>
                  <SelectItem value="on_completion">Al finalizar</SelectItem>
                  <SelectItem value="30_days">30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Notas adicionales</Label>
            <Textarea
              placeholder="No incluye posibles oposiciones de terceros..."
              value={data.additional_notes || ''}
              onChange={(e) => onDataChange('additional_notes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vista previa PDF
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generar presupuesto
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Enviar por email
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </div>

          {data.quote_sent && (
            <Badge variant="outline" className="mt-3 bg-green-50 text-green-700">
              ✅ Presupuesto enviado el {data.quote_sent_date}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Skip Quote */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SkipForward className="w-4 h-4 text-gray-500" />
            Saltar Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {[
              { id: 'approved', label: 'El cliente ya tiene presupuesto aprobado' },
              { id: 'flat_rate', label: 'Cliente con tarifa plana / abono' },
              { id: 'pro_bono', label: 'Pro-bono / Cortesía' },
            ].map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Checkbox
                  id={`skip-${option.id}`}
                  checked={data.skip_reason === option.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onDataChange('skip_reason', option.id);
                      onDataChange('skipped', true);
                    } else {
                      onDataChange('skip_reason', '');
                      onDataChange('skipped', false);
                    }
                  }}
                />
                <Label htmlFor={`skip-${option.id}`} className="cursor-pointer text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          {data.skipped && (
            <Button variant="secondary" className="w-full">
              Saltar a F3 sin presupuesto
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
