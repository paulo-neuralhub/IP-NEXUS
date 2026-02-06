// ============================================================
// IP-NEXUS - PHASE F3 PANEL (CONTRATACIÓN)
// PROMPT 21: Panel de contratación y firma electrónica
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  FileText, 
  Send,
  Eye,
  CheckCircle2,
  PenTool,
  Mail,
  MessageCircle,
  Phone,
  CreditCard,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF3Data } from '@/hooks/use-phase-data';
import { toast } from 'sonner';
import { useCreatePaymentLink } from '@/hooks/use-invoice-payment-links';

interface PhaseF3PanelProps {
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

const ENGAGEMENT_TEMPLATES = [
  { id: 'trademark_standard', name: 'Encargo estándar de marca' },
  { id: 'patent_standard', name: 'Encargo estándar de patente' },
  { id: 'design_standard', name: 'Encargo estándar de diseño' },
  { id: 'general', name: 'Encargo general PI' },
];

export function PhaseF3Panel({
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
}: PhaseF3PanelProps) {
  const data = phaseData as PhaseF3Data;
  const checklistItems = PHASE_CHECKLISTS.F3;
  
  // State for modals and loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [manualPaymentAmount, setManualPaymentAmount] = useState(data.advance_amount?.toString() || '504.25');
  const [manualPaymentDate, setManualPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualPaymentNotes, setManualPaymentNotes] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSendingPaymentLink, setIsSendingPaymentLink] = useState(false);

  const getSignatureStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-amber-500" />;
      case 'signed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSignatureStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendiente de firma';
      case 'sent': return 'Enviado para firma';
      case 'viewed': return 'Documento visualizado';
      case 'signed': return 'Firmado';
      case 'rejected': return 'Rechazado';
      default: return 'Sin estado';
    }
  };

  const getSignatureStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'viewed': return 'bg-amber-100 text-amber-700';
      case 'signed': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Generate engagement document HTML based on selected template
  const generateEngagementHtml = () => {
    const templateId = data.engagement_template_used || 'general';
    const template = ENGAGEMENT_TEMPLATES.find(t => t.id === templateId);
    const templateName = template?.name || 'Documento de Encargo';
    const ref = matterReference || matterId.slice(0, 8);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #7c3aed; padding-bottom: 15px; }
          .title { font-size: 18pt; font-weight: bold; color: #7c3aed; }
          .subtitle { font-size: 12pt; color: #666; margin-top: 5px; }
          .ref { font-size: 10pt; color: #666; margin-top: 5px; }
          .section { margin: 25px 0; }
          .section-title { font-weight: bold; color: #7c3aed; margin-bottom: 10px; text-transform: uppercase; font-size: 11pt; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .info-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .clause { margin: 15px 0; text-align: justify; }
          .clause-number { font-weight: bold; color: #7c3aed; }
          .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #333; margin-top: 80px; padding-top: 10px; font-size: 9pt; }
          .footer { margin-top: 40px; text-align: center; font-size: 8pt; color: #666; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          .highlight { background: #f3e8ff; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">DOCUMENTO DE ENCARGO PROFESIONAL</div>
          <div class="subtitle">${templateName}</div>
          <div class="ref">Ref: ${ref} | Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
        </div>
        
        <div class="section">
          <div class="section-title">1. Partes</div>
          <div class="info-box">
            <p><strong>CLIENTE:</strong> ${clientName || 'Nombre del Cliente'}</p>
            <p><strong>Expediente:</strong> ${matterTitle || 'Sin título'}</p>
            <p><strong>Referencia:</strong> ${ref}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">2. Objeto del Encargo</div>
          <div class="clause">
            <span class="clause-number">2.1</span> El presente documento tiene por objeto formalizar el encargo de servicios profesionales
            relacionados con ${templateId.includes('trademark') ? 'el registro y protección de marca' : templateId.includes('patent') ? 'la solicitud y tramitación de patente' : templateId.includes('design') ? 'el registro de diseño industrial' : 'servicios de propiedad industrial'}.
          </div>
          <div class="clause">
            <span class="clause-number">2.2</span> Los servicios incluirán la asesoría, gestión y representación ante las oficinas 
            de propiedad industrial correspondientes.
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">3. Honorarios y Forma de Pago</div>
          <div class="clause">
            <span class="clause-number">3.1</span> Los honorarios profesionales y tasas oficiales se detallan en el presupuesto 
            adjunto o previamente aceptado, que forma parte integral del presente encargo.
          </div>
          <div class="clause">
            <span class="clause-number">3.2</span> El pago se realizará conforme a las condiciones establecidas en dicho presupuesto.
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">4. Obligaciones de las Partes</div>
          <div class="clause">
            <span class="clause-number">4.1</span> <strong>El Profesional</strong> se compromete a actuar con diligencia, 
            mantener informado al Cliente sobre el estado de los procedimientos y guardar confidencialidad.
          </div>
          <div class="clause">
            <span class="clause-number">4.2</span> <strong>El Cliente</strong> se compromete a facilitar la documentación necesaria, 
            responder en los plazos indicados y realizar los pagos acordados.
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">5. Aceptación</div>
          <div class="clause">
            La firma del presente documento implica la aceptación íntegra de sus términos y del presupuesto asociado.
          </div>
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">EL PROFESIONAL<br/>Fecha: _______________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">EL CLIENTE<br/>${clientName || 'Nombre del Cliente'}<br/>Fecha: _______________</div>
          </div>
        </div>
        
        <div class="footer">
          Documento generado por IP-NEXUS | ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </body>
      </html>
    `;
  };

  // Handler: Preview Document
  const handlePreviewDocument = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!data.engagement_template_used) {
      toast.warning('Por favor, selecciona una plantilla primero');
      return;
    }
    
    if (isPreviewing) return;
    setIsPreviewing(true);
    
    try {
      const htmlContent = generateEngagementHtml();
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
      setIsPreviewing(false);
    }
  };

  // Handler: Generate Document PDF
  const handleGenerateDocument = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!data.engagement_template_used) {
      toast.warning('Por favor, selecciona una plantilla primero');
      return;
    }
    
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const { jsPDF } = await import('jspdf');
      const htmlContent = generateEngagementHtml();
      
      // Create temporary element for PDF generation
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.cssText = 'position: absolute; left: -9999px; width: 210mm;';
      document.body.appendChild(container);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      await pdf.html(container, {
        callback: function(doc) {
          const fileName = `Encargo_${matterReference || matterId.slice(0, 8)}.pdf`;
          doc.save(fileName);
          
          onDataChange('engagement_generated', true);
          onDataChange('engagement_generated_date', new Date().toISOString());
          toast.success('Documento de encargo generado correctamente');
        },
        x: 0,
        y: 0,
        width: 210,
        windowWidth: 800,
      });
      
      document.body.removeChild(container);
    } catch (err) {
      console.error('Generate error:', err);
      toast.error('Error al generar documento PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Send Payment Link
  const handleSendPaymentLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isSendingPaymentLink) return;
    setIsSendingPaymentLink(true);
    
    try {
      // For now, show the payment link generation flow
      // This would integrate with Stripe when configured
      const paymentUrl = `${window.location.origin}/pago/${matterId}?amount=${data.advance_amount || 504.25}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(paymentUrl);
      
      onDataChange('payment_link_sent', true);
      onDataChange('payment_link_sent_date', new Date().toISOString());
      
      toast.success('Enlace de pago copiado al portapapeles', {
        description: 'Puedes enviarlo por email o WhatsApp al cliente',
      });
    } catch (err) {
      console.error('Payment link error:', err);
      toast.error('Error al generar enlace de pago');
    } finally {
      setIsSendingPaymentLink(false);
    }
  };

  // Handler: Register Manual Payment
  const handleRegisterManualPayment = async () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    
    try {
      // Save manual payment data
      onDataChange('advance_paid', true);
      onDataChange('advance_paid_date', manualPaymentDate);
      onDataChange('advance_paid_amount', parseFloat(manualPaymentAmount));
      onDataChange('advance_payment_method', 'manual');
      onDataChange('advance_payment_notes', manualPaymentNotes);
      
      setShowPaymentModal(false);
      toast.success('Pago registrado correctamente', {
        description: `€${manualPaymentAmount} recibido el ${new Date(manualPaymentDate).toLocaleDateString('es-ES')}`,
      });
    } catch (err) {
      console.error('Register payment error:', err);
      toast.error('Error al registrar el pago');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-violet-500" />
            Checklist de Contratación
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

      {/* Engagement Document */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-500" />
            Documento de Encargo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Plantilla</Label>
            <Select
              value={data.engagement_template_used || ''}
              onValueChange={(value) => onDataChange('engagement_template_used', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p><strong>Cliente:</strong> {clientName || 'Sin cliente asignado'}</p>
            <p><strong>Expediente:</strong> {matterTitle || 'Sin título'}</p>
            <p><strong>Referencia:</strong> {matterReference || matterId.slice(0, 8)}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGenerateDocument}
              disabled={isGenerating || !data.engagement_template_used}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Generar documento de encargo
            </Button>
            <Button 
              variant="ghost" 
              onClick={handlePreviewDocument}
              disabled={isPreviewing || !data.engagement_template_used}
            >
              {isPreviewing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Vista previa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Electronic Signature */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PenTool className="w-4 h-4 text-violet-500" />
            Firma Electrónica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">Estado:</span>
            <Badge className={cn('flex items-center gap-1', getSignatureStatusColor(data.signature_status))}>
              {getSignatureStatusIcon(data.signature_status)}
              {getSignatureStatusLabel(data.signature_status)}
            </Badge>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Método de firma</Label>
            <RadioGroup
              value={data.signature_method || 'simple_otp'}
              onValueChange={(value) => onDataChange('signature_method', value)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="advanced" id="sig-advanced" />
                <Label htmlFor="sig-advanced" className="cursor-pointer text-sm">
                  Firma electrónica avanzada (Certificado digital)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="simple_otp" id="sig-otp" />
                <Label htmlFor="sig-otp" className="cursor-pointer text-sm">
                  Firma electrónica simple (Email + código OTP)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="sig-manual" />
                <Label htmlFor="sig-manual" className="cursor-pointer text-sm">
                  Firma manuscrita digitalizada
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Email</Label>
              <Input placeholder="juan.garcia@atlaslogistics.com" />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Móvil (para OTP)</Label>
              <Input placeholder="+34 600 123 456" />
            </div>
          </div>

          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Enviar para firma
          </Button>

          {/* Signature Events History */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-2">Historial de envíos</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                01/02/2026 10:30 - Enviado por email
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                01/02/2026 10:31 - Email abierto
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                01/02/2026 10:35 - Documento visualizado
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Confirmation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            Confirmación Alternativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si el cliente confirma por otro medio:
          </p>

          <RadioGroup
            value={data.confirmation_type || ''}
            onValueChange={(value) => {
              onDataChange('confirmation_type', value);
              onDataChange('alternative_confirmation', true);
            }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="email" id="conf-email" />
              <Label htmlFor="conf-email" className="cursor-pointer text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email con "Acepto" o "Conforme"
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="whatsapp" id="conf-whatsapp" />
              <Label htmlFor="conf-whatsapp" className="cursor-pointer text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp con confirmación
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="call" id="conf-call" />
              <Label htmlFor="conf-call" className="cursor-pointer text-sm flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Llamada grabada (con consentimiento)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="payment" id="conf-payment" />
              <Label htmlFor="conf-payment" className="cursor-pointer text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pago del anticipo (aceptación tácita)
              </Label>
            </div>
          </RadioGroup>

          {data.alternative_confirmation && (
            <div className="space-y-3 pt-3 border-t">
              <div>
                <Label className="text-sm mb-2 block">Adjuntar evidencia de aceptación</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir archivo
                </Button>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Fecha de confirmación</Label>
                <Input type="date" />
              </div>

              <div>
                <Label className="text-sm mb-2 block">Notas</Label>
                <Textarea
                  placeholder="Cliente confirmó por email el día..."
                  value={data.confirmation_notes || ''}
                  onChange={(e) => onDataChange('confirmation_notes', e.target.value)}
                  rows={2}
                />
              </div>

              <Button variant="secondary" className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Registrar aceptación manual
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advance Payment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-500" />
            Pago del Anticipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Importe requerido</p>
              <p className="text-2xl font-bold">€{data.advance_amount || 504.25}</p>
              <p className="text-sm text-muted-foreground">50% del presupuesto</p>
            </div>
            <Badge className={data.advance_paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {data.advance_paid ? '✅ Pagado' : '⏳ Pendiente'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleSendPaymentLink}
              disabled={isSendingPaymentLink || data.advance_paid}
            >
              {isSendingPaymentLink ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar enlace de pago
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowPaymentModal(true);
              }}
              disabled={data.advance_paid}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Registrar pago manual
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="no-advance"
              checked={!data.advance_required}
              onCheckedChange={(checked) => onDataChange('advance_required', !checked)}
            />
            <Label htmlFor="no-advance" className="cursor-pointer text-sm">
              No requiere anticipo
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Manual Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Registrar Pago Manual
            </DialogTitle>
            <DialogDescription>
              Registra un pago recibido por transferencia, cheque u otro medio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="payment-amount" className="text-sm mb-2 block">
                Importe recibido (€)
              </Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={manualPaymentAmount}
                onChange={(e) => setManualPaymentAmount(e.target.value)}
                placeholder="504.25"
              />
            </div>
            
            <div>
              <Label htmlFor="payment-date" className="text-sm mb-2 block">
                Fecha del pago
              </Label>
              <Input
                id="payment-date"
                type="date"
                value={manualPaymentDate}
                onChange={(e) => setManualPaymentDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="payment-notes" className="text-sm mb-2 block">
                Notas (opcional)
              </Label>
              <Textarea
                id="payment-notes"
                value={manualPaymentNotes}
                onChange={(e) => setManualPaymentNotes(e.target.value)}
                placeholder="Ej: Transferencia bancaria ref. 12345"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRegisterManualPayment}
              disabled={isProcessingPayment || !manualPaymentAmount}
            >
              {isProcessingPayment ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
