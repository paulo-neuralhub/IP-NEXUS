// ============================================================
// IP-NEXUS - PHASE F2 PANEL (PRESUPUESTO)
// PROMPT 21: Panel de creación y gestión de presupuestos
// ============================================================

import React, { useState } from 'react';
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
  SkipForward,
  Loader2,
  Download
} from 'lucide-react';
import { PHASE_CHECKLISTS, type PhaseF2Data } from '@/hooks/use-phase-data';
import { EmailComposer } from '@/components/communications/EmailComposer';
import { SendWhatsAppModal } from '@/components/features/crm/v2/SendWhatsAppModal';
import { toast } from 'sonner';

interface PhaseF2PanelProps {
  matterId: string;
  matterReference?: string;
  matterTitle?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
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
  matterReference,
  matterTitle,
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF2PanelProps) {
  const data = phaseData as PhaseF2Data;
  const checklistItems = PHASE_CHECKLISTS.F2;

  // Modal states
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  
  // Separate loading states for each action
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [generatedPdfBase64, setGeneratedPdfBase64] = useState<string | null>(null);
  
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

  // Build quote summary for email/whatsapp
  const getQuoteSummary = () => {
    const ref = matterReference || matterId.slice(0, 8);
    return `Presupuesto ${ref}\n\nConceptos:\n${lineItems.map(item => 
      `- ${item.concept}: €${item.total.toFixed(2)}`
    ).join('\n')}\n\nSubtotal: €${subtotal.toFixed(2)}\nIVA (${taxRate}%): €${taxAmount.toFixed(2)}\nTotal: €${total.toFixed(2)}`;
  };

  // Generate PDF HTML content
  const generateQuoteHtml = () => {
    const ref = matterReference || matterId.slice(0, 8);
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + (data.validity_days || 30));
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 15px; }
          .title { font-size: 18pt; font-weight: bold; color: #3B82F6; }
          .ref { font-size: 10pt; color: #666; margin-top: 5px; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; color: #3B82F6; margin-bottom: 10px; text-transform: uppercase; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 9pt; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 10pt; }
          .amount { text-align: right; }
          .totals { margin-top: 20px; text-align: right; }
          .totals-row { display: flex; justify-content: flex-end; margin: 5px 0; }
          .totals-label { width: 200px; text-align: right; padding-right: 20px; }
          .totals-value { width: 100px; text-align: right; font-weight: bold; }
          .total-final { font-size: 14pt; color: #3B82F6; border-top: 2px solid #3B82F6; padding-top: 10px; margin-top: 10px; }
          .conditions { background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 30px; font-size: 9pt; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; font-size: 9pt; }
          .footer { margin-top: 40px; text-align: center; font-size: 8pt; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PRESUPUESTO</div>
          <div class="ref">Ref: ${ref} | Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Cliente</div>
          <p><strong>${clientName || 'Cliente'}</strong></p>
        </div>
        
        <div class="section">
          <div class="section-title">Detalle del Presupuesto</div>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th class="amount">Cantidad</th>
                <th class="amount">Precio Unit.</th>
                <th class="amount">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.map(item => `
                <tr>
                  <td>${item.concept}</td>
                  <td class="amount">${item.quantity}</td>
                  <td class="amount">€${item.unit_price.toFixed(2)}</td>
                  <td class="amount">€${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <div class="totals-row">
            <span class="totals-label">Subtotal tasas oficiales:</span>
            <span class="totals-value">€${subtotalFees.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">Subtotal honorarios:</span>
            <span class="totals-value">€${subtotalTaxable.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">IVA (${taxRate}%) sobre honorarios:</span>
            <span class="totals-value">€${taxAmount.toFixed(2)}</span>
          </div>
          <div class="totals-row total-final">
            <span class="totals-label">TOTAL:</span>
            <span class="totals-value">€${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="conditions">
          <strong>Condiciones:</strong><br/>
          • Validez del presupuesto: ${data.validity_days || 30} días (hasta ${validityDate.toLocaleDateString('es-ES')})<br/>
          • Forma de pago: ${data.payment_terms === '100_advance' ? '100% anticipado' : data.payment_terms === '50_advance' ? '50% anticipado, 50% a la finalización' : data.payment_terms === 'on_completion' ? 'Al finalizar el servicio' : '30 días desde factura'}<br/>
          ${data.additional_notes ? `• ${data.additional_notes}` : ''}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Firma del Cliente<br/>(Aceptación del presupuesto)</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Fecha de aceptación</div>
          </div>
        </div>
        
        <div class="footer">
          Este presupuesto es válido durante ${data.validity_days || 30} días desde la fecha de emisión.<br/>
          Para su aceptación, por favor firme este documento y devuélvalo escaneado.
        </div>
      </body>
      </html>
    `;
  };

  // Handler: Preview PDF - INDEPENDENT action
  const handlePreviewPdf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isPreviewLoading) return;
    setIsPreviewLoading(true);
    
    try {
      const htmlContent = generateQuoteHtml();
      
      // Open in new window for preview
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.write(htmlContent);
        previewWindow.document.close();
        toast.success('Vista previa abierta en nueva pestaña');
      } else {
        toast.error('El navegador bloqueó la ventana emergente');
      }
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Error al generar vista previa');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handler: Generate/Download Quote - INDEPENDENT action
  const handleGenerateQuote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isGenerateLoading) return;
    setIsGenerateLoading(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const htmlContent = generateQuoteHtml();
      
      // Create temporary element for PDF generation
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.cssText = 'position: absolute; left: -9999px; width: 210mm;';
      document.body.appendChild(container);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      await pdf.html(container, {
        callback: function(doc) {
          const fileName = `Presupuesto_${matterReference || matterId.slice(0, 8)}.pdf`;
          doc.save(fileName);
          
          // Store base64 for email attachment
          const base64 = doc.output('datauristring');
          setGeneratedPdfBase64(base64);
          
          onDataChange('quote_generated', true);
          onDataChange('quote_generated_date', new Date().toISOString());
          toast.success('Presupuesto PDF generado correctamente');
        },
        x: 0,
        y: 0,
        width: 210,
        windowWidth: 800,
      });
      
      document.body.removeChild(container);
    } catch (err) {
      console.error('Generate error:', err);
      toast.error('Error al generar presupuesto PDF');
    } finally {
      setIsGenerateLoading(false);
    }
  };

  // Handler: Send by Email
  const handleSendEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!clientEmail) {
      toast.warning('El cliente no tiene email configurado');
    }
    setShowEmailComposer(true);
  };

  // Handler: Send by WhatsApp
  const handleSendWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!clientPhone) {
      toast.warning('El cliente no tiene teléfono configurado');
    }
    setShowWhatsAppModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
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
            <FileText className="w-4 h-4 text-primary" />
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
            <Button 
              variant="outline" 
              onClick={handlePreviewPdf}
              disabled={isPreviewLoading}
              type="button"
            >
              {isPreviewLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Vista previa
            </Button>
            <Button 
              variant="outline" 
              onClick={handleGenerateQuote}
              disabled={isGenerateLoading}
              type="button"
            >
              {isGenerateLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Descargar PDF
            </Button>
            <Button variant="outline" onClick={handleSendEmail} type="button">
              <Send className="w-4 h-4 mr-2" />
              Enviar por email
            </Button>
            <Button variant="outline" onClick={handleSendWhatsApp} type="button">
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </div>

          {data.quote_sent && (
            <Badge variant="secondary" className="mt-3">
              ✅ Presupuesto enviado el {data.quote_sent_date}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Skip Quote */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SkipForward className="w-4 h-4 text-muted-foreground" />
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

      {/* Email Composer Modal */}
      <EmailComposer
        open={showEmailComposer}
        onOpenChange={setShowEmailComposer}
        matterId={matterId}
        matterName={matterTitle || matterReference}
        defaultTo={clientEmail ? [{ email: clientEmail, name: clientName }] : []}
        defaultSubject={`Presupuesto para aceptación - Ref. ${matterReference || matterTitle || 'Expediente'}`}
        defaultBody={`<p>Estimado/a ${clientName || 'cliente'},</p>

<p>Le enviamos adjunto el presupuesto solicitado para su revisión y aceptación.</p>

<h3 style="color: #3B82F6; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">📋 Resumen del Presupuesto</h3>

<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
  <tbody>
    ${lineItems.map(item => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 8px 0;">${item.concept}</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 500;">€${item.total.toFixed(2)}</td>
      </tr>
    `).join('')}
    <tr style="border-top: 2px solid #e5e7eb;">
      <td style="padding: 12px 0; font-weight: bold;">SUBTOTAL</td>
      <td style="padding: 12px 0; text-align: right; font-weight: bold;">€${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 4px 0; color: #6b7280;">IVA (${taxRate}%) sobre honorarios</td>
      <td style="padding: 4px 0; text-align: right; color: #6b7280;">€${taxAmount.toFixed(2)}</td>
    </tr>
    <tr style="background: #f0f9ff;">
      <td style="padding: 12px 8px; font-weight: bold; font-size: 1.1em; color: #3B82F6;">TOTAL</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 1.1em; color: #3B82F6;">€${total.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

<p><strong>Validez:</strong> ${data.validity_days || 30} días desde la fecha de emisión.</p>

<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
  <p style="margin: 0; font-weight: bold; color: #92400e;">📝 Para aceptar este presupuesto:</p>
  <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
    <li>Descargue el PDF adjunto</li>
    <li>Firme en el espacio indicado</li>
    <li>Envíenoslo escaneado como respuesta a este email</li>
  </ol>
</div>

<p>Quedamos a su disposición para cualquier consulta o aclaración.</p>

<p>Un cordial saludo,</p>`}
        onSuccess={() => {
          onDataChange('quote_sent', true);
          onDataChange('quote_sent_date', new Date().toLocaleDateString('es-ES'));
          toast.success('Presupuesto enviado por email');
        }}
      />

      {/* WhatsApp Modal */}
      <SendWhatsAppModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        contact={clientId ? {
          id: clientId,
          full_name: clientName || 'Cliente',
          phone: clientPhone,
          whatsapp_phone: clientPhone,
        } : undefined}
        matterId={matterId}
        matterReference={matterReference}
      />
    </div>
  );
}
