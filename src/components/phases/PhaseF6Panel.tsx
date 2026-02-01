// ============================================================
// IP-NEXUS - PHASE F6 PANEL (EXAMEN)
// PROMPT 21: Panel de seguimiento del examen
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mail,
  FileText,
  Plus,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF6Data } from '@/hooks/use-phase-data';

interface PhaseF6PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

export function PhaseF6Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF6PanelProps) {
  const data = phaseData as PhaseF6Data;
  const checklistItems = PHASE_CHECKLISTS.F6;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'objection': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En examen de forma';
      case 'completed': return 'Examen completado';
      case 'objection': return 'Con objeción';
      default: return 'Sin estado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            Checklist de Examen
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

      {/* Examination Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Estado del Examen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">Estado actual:</span>
            <Badge className={cn(getStatusColor(data.examination_status))}>
              {data.examination_status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
              {getStatusLabel(data.examination_status)}
            </Badge>
          </div>

          {/* Timeline */}
          <div className="relative pl-6 border-l-2 border-muted">
            <div className="mb-4 relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium">Presentación</p>
                <p className="text-xs text-muted-foreground">02/02/2026</p>
              </div>
            </div>
            <div className="mb-4 relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-amber-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium">Examen</p>
                <p className="text-xs text-muted-foreground">Actual</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-gray-300" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publicación</p>
                <p className="text-xs text-muted-foreground">Pendiente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            Notificaciones de la Oficina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Registrar notificación recibida
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Historial:</p>
            {data.notifications && data.notifications.length > 0 ? (
              data.notifications.map((notif, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{notif.date}</span>
                  <span>-</span>
                  <span>{notif.description}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>05/02/2026 - Acuse de recibo</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground italic">
              (Pendiente de más notificaciones)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Objections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Requerimientos / Objeciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.objections && data.objections.length > 0 ? (
            <div className="space-y-3">
              {data.objections.map((objection) => (
                <div 
                  key={objection.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    objection.status === 'pending' && 'bg-amber-50 border-amber-200',
                    objection.status === 'responded' && 'bg-blue-50 border-blue-200',
                    objection.status === 'resolved' && 'bg-green-50 border-green-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{objection.type}</span>
                    <Badge variant="outline">
                      {objection.status === 'pending' && 'Pendiente'}
                      {objection.status === 'responded' && 'Respondido'}
                      {objection.status === 'resolved' && 'Resuelto'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fecha: {objection.date} | Plazo: {objection.deadline}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
              <p>No hay requerimientos pendientes</p>
            </div>
          )}

          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Registrar requerimiento
          </Button>

          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-1">Si se recibe un requerimiento:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
              <li>Registrar fecha y tipo</li>
              <li>Calcular plazo de respuesta</li>
              <li>Preparar y enviar contestación</li>
              <li>Notificar al cliente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
