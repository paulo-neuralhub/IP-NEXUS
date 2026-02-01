// ============================================================
// IP-NEXUS - PHASE F9 PANEL (MANTENIMIENTO)
// PROMPT 21: Panel de mantenimiento del derecho
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Wrench,
  Calendar,
  RefreshCw,
  Edit,
  ArrowRightLeft,
  FileText,
  Search,
  XCircle,
  Plus,
  Clock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF9Data } from '@/hooks/use-phase-data';

interface PhaseF9PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

export function PhaseF9Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF9PanelProps) {
  const data = phaseData as PhaseF9Data;
  const checklistItems = PHASE_CHECKLISTS.F9;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'transferred': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'VIGENTE';
      case 'expired': return 'EXPIRADA';
      case 'cancelled': return 'CANCELADA';
      case 'transferred': return 'TRANSFERIDA';
      default: return 'DESCONOCIDO';
    }
  };

  // Calculate days until next renewal
  const calculateDaysUntilRenewal = () => {
    if (!data.next_renewal_date) return null;
    const renewalDate = new Date(data.next_renewal_date);
    const now = new Date();
    const diff = renewalDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilRenewal = calculateDaysUntilRenewal();

  const availableActions = [
    { id: 'renewal', icon: RefreshCw, label: 'Renovar marca', color: 'text-blue-500' },
    { id: 'modify', icon: Edit, label: 'Modificar datos', color: 'text-amber-500' },
    { id: 'transfer', icon: ArrowRightLeft, label: 'Ceder/Transferir', color: 'text-purple-500' },
    { id: 'license', icon: FileText, label: 'Licenciar', color: 'text-green-500' },
    { id: 'watch', icon: Search, label: 'Vigilancia de infracciones', color: 'text-indigo-500' },
    { id: 'cancel', icon: XCircle, label: 'Cancelar/Renunciar', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            Checklist de Mantenimiento
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

      {/* Registration Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-teal-500" />
            Estado del Registro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            'flex items-center gap-4 p-4 rounded-lg border-2',
            getStatusColor(data.status || 'active')
          )}>
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="text-lg font-bold">
                Estado: {getStatusLabel(data.status || 'active')}
              </p>
              <p className="text-sm opacity-75">
                La marca está en vigor y protegida.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Deadlines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-500" />
            Plazos Activos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Renovación</p>
                  <p className="text-xs text-muted-foreground">
                    {data.next_renewal_date || '02/02/2036'}
                  </p>
                </div>
              </div>
              {daysUntilRenewal !== null && (
                <Badge variant="outline">
                  {daysUntilRenewal > 365 
                    ? `${Math.round(daysUntilRenewal / 365)} años`
                    : `${daysUntilRenewal} días`
                  }
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">Uso obligatorio</p>
                  <p className="text-xs text-muted-foreground">
                    {data.mandatory_use_date || '02/02/2031'} (5 años)
                  </p>
                </div>
              </div>
              <Badge variant="outline">5 años</Badge>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Añadir plazo personalizado
          </Button>
        </CardContent>
      </Card>

      {/* Available Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-start h-auto py-3"
              >
                <action.icon className={cn('w-4 h-4 mr-2', action.color)} />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de Cambios</CardTitle>
        </CardHeader>
        <CardContent>
          {data.actions && data.actions.length > 0 ? (
            <div className="space-y-2">
              {data.actions.map((action) => (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{action.date}</span>
                    <span>-</span>
                    <span>{action.description}</span>
                  </div>
                  <Badge variant="outline" className={
                    action.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }>
                    {action.status === 'completed' ? 'Completado' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>15/07/2026 - Concesión inicial</span>
              </div>
              <p className="mt-2 text-xs italic">(Sin más cambios registrados)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
