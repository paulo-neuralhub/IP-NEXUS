// ============================================================
// IP-NEXUS - PHASE F8 PANEL (CONCESIÓN)
// PROMPT 21: Panel de concesión del derecho
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Trophy,
  FileText,
  Mail,
  Download,
  Upload,
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF8Data } from '@/hooks/use-phase-data';

interface PhaseF8PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

export function PhaseF8Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF8PanelProps) {
  const data = phaseData as PhaseF8Data;
  const checklistItems = PHASE_CHECKLISTS.F8;

  const getGrantStatusIcon = (status?: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'partially_granted':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'refused':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGrantStatusColor = (status?: string) => {
    switch (status) {
      case 'granted': return 'bg-green-100 text-green-700 border-green-200';
      case 'partially_granted': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'refused': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getGrantStatusLabel = (status?: string) => {
    switch (status) {
      case 'granted': return 'CONCEDIDA';
      case 'partially_granted': return 'CONCEDIDA PARCIALMENTE';
      case 'refused': return 'DENEGADA';
      default: return 'PENDIENTE';
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Checklist de Concesión
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

      {/* Resolution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-500" />
            Resolución
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            'flex items-center gap-4 p-4 rounded-lg border-2',
            getGrantStatusColor(data.grant_status)
          )}>
            {getGrantStatusIcon(data.grant_status)}
            <div>
              <p className="text-lg font-bold">
                Estado: {getGrantStatusLabel(data.grant_status)}
              </p>
              {data.grant_status === 'granted' && (
                <p className="text-sm opacity-75">
                  ¡Felicidades! La marca ha sido concedida.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Número de registro</Label>
              <Input
                placeholder="M 4.123.456"
                value={data.registration_number || ''}
                onChange={(e) => onDataChange('registration_number', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Fecha de concesión</Label>
              <Input
                type="date"
                value={data.grant_date || ''}
                onChange={(e) => onDataChange('grant_date', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-sm mb-2 block">Fecha de expiración</Label>
              <Input
                type="date"
                value={data.expiry_date || ''}
                onChange={(e) => onDataChange('expiry_date', e.target.value)}
              />
              {data.expiry_date && (
                <p className="text-xs text-muted-foreground mt-1">
                  Vigencia: 10 años desde la fecha de solicitud
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Adjuntar título
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar certificado
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notify Client */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-green-500" />
            Notificar al Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {[
              { id: 'congrats', label: 'Felicitación' },
              { id: 'certificate', label: 'Copia del certificado' },
              { id: 'renewal_date', label: 'Fecha de renovación' },
              { id: 'usage_instructions', label: 'Instrucciones de uso de ®' },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox id={`notify-${item.id}`} defaultChecked />
                <Label htmlFor={`notify-${item.id}`} className="cursor-pointer text-sm">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar notificación de concesión
          </Button>

          {data.client_notified && (
            <Badge className="bg-green-100 text-green-700">
              ✅ Cliente notificado
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Final Invoice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="w-4 h-4 text-green-500" />
            Facturación Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Importe pendiente:</p>
            <p className="text-2xl font-bold">€504,25</p>
            <p className="text-xs text-muted-foreground">50% restante del presupuesto</p>
          </div>

          <Button className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Generar factura final
          </Button>

          {data.final_invoice_generated && (
            <Badge className="bg-green-100 text-green-700">
              ✅ Factura generada: {data.final_invoice_id}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
