// ============================================================
// IP-NEXUS - PHASE F3 PANEL (CONTRATACIÓN)
// PROMPT 21: Panel de contratación y firma electrónica
// ============================================================

import React from 'react';
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
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF3Data } from '@/hooks/use-phase-data';

interface PhaseF3PanelProps {
  matterId: string;
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
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF3PanelProps) {
  const data = phaseData as PhaseF3Data;
  const checklistItems = PHASE_CHECKLISTS.F3;

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
            <p><strong>Cliente:</strong> Atlas Logistics Europe S.L.</p>
            <p><strong>NIF:</strong> B12345678</p>
            <p><strong>Representante:</strong> Juan García López</p>
            <p><strong>Cargo:</strong> Director General</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generar documento de encargo
            </Button>
            <Button variant="ghost">
              <Eye className="w-4 h-4 mr-2" />
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
            <Button variant="outline" className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Enviar enlace de pago
            </Button>
            <Button variant="outline" className="flex-1">
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
    </div>
  );
}
