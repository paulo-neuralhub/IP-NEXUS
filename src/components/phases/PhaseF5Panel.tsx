// ============================================================
// IP-NEXUS - PHASE F5 PANEL (PRESENTACIÓN)
// PROMPT 21: Panel de presentación ante la oficina
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Send,
  ExternalLink,
  Upload,
  CheckCircle2,
  CheckCircle,
  Building2,
  FileText,
  Mail,
  Calendar
} from 'lucide-react';
import { PHASE_CHECKLISTS, type PhaseF5Data } from '@/hooks/use-phase-data';

interface PhaseF5PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

export function PhaseF5Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF5PanelProps) {
  const data = phaseData as PhaseF5Data;
  const checklistItems = PHASE_CHECKLISTS.F5;

  const documentsToFile = [
    { name: 'Formulario de solicitud', status: 'ready' },
    { name: 'Representación de la marca', status: 'ready' },
    { name: 'Lista de productos/servicios', status: 'ready' },
    { name: 'Justificante de pago', status: 'ready' },
  ];

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
            Checklist de Presentación
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

      {/* Filing at Office */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            Presentación ante la Oficina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium text-sm">Oficina: OEPM - Oficina Española de Patentes y Marcas</p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Método de presentación</Label>
            <RadioGroup
              value={data.filing_method || 'electronic'}
              onValueChange={(value) => onDataChange('filing_method', value)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="electronic" id="method-electronic" />
                <Label htmlFor="method-electronic" className="cursor-pointer text-sm">
                  Electrónico (recomendado)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="in_person" id="method-person" />
                <Label htmlFor="method-person" className="cursor-pointer text-sm">
                  Presencial
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir portal de presentación OEPM
          </Button>

          <div>
            <p className="text-sm font-medium mb-2">Documentos a presentar:</p>
            <div className="space-y-2">
              {documentsToFile.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{doc.name}</span>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Presentar solicitud
          </Button>
        </CardContent>
      </Card>

      {/* Filing Registration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            Registro de Presentación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Número de solicitud</Label>
              <Input
                placeholder="M 4.123.456"
                value={data.application_number || ''}
                onChange={(e) => onDataChange('application_number', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Fecha de presentación</Label>
              <Input
                type="date"
                value={data.filing_date || ''}
                onChange={(e) => onDataChange('filing_date', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Hora</Label>
              <Input
                type="time"
                value={data.filing_time || ''}
                onChange={(e) => onDataChange('filing_time', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Adjuntar acuse de recibo</Label>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Subir archivo
            </Button>
            {data.receipt_url && (
              <Badge className="mt-2 bg-green-100 text-green-700">
                ✓ acuse_OEPM_M4123456.pdf
              </Badge>
            )}
          </div>

          <Button 
            className="w-full"
            disabled={!data.application_number || !data.filing_date}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirmar presentación
          </Button>
        </CardContent>
      </Card>

      {/* Notify Client */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-500" />
            Notificar al Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[
              { id: 'number', label: 'Número de solicitud' },
              { id: 'date', label: 'Fecha de presentación' },
              { id: 'receipt', label: 'Copia del acuse de recibo' },
              { id: 'next_steps', label: 'Próximos pasos' },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox id={`include-${item.id}`} defaultChecked />
                <Label htmlFor={`include-${item.id}`} className="cursor-pointer text-sm">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar confirmación de presentación
          </Button>

          {data.client_notified && (
            <Badge className="bg-green-100 text-green-700">
              ✅ Cliente notificado el {data.client_notified_date}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Automatic Deadlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            Plazos Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Se crearán automáticamente los siguientes plazos:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Examen de forma</span>
              <span className="text-muted-foreground">+2 meses (02/04/2026)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Publicación estimada</span>
              <span className="text-muted-foreground">+3 meses (02/05/2026)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Período de oposición</span>
              <span className="text-muted-foreground">+2 meses desde publicación</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span>Concesión estimada</span>
              <span className="text-muted-foreground">+6-8 meses</span>
            </div>
          </div>

          {data.deadlines_created && (
            <Badge className="mt-3 bg-green-100 text-green-700">
              ✅ Plazos creados automáticamente
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
