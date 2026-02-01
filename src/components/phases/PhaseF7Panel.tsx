// ============================================================
// IP-NEXUS - PHASE F7 PANEL (PUBLICACIÓN)
// PROMPT 21: Panel de publicación y oposiciones
// ============================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2,
  Newspaper,
  Clock,
  Swords,
  Plus,
  Upload,
  Mail,
  ExternalLink
} from 'lucide-react';
import { PHASE_CHECKLISTS, type PhaseF7Data } from '@/hooks/use-phase-data';

interface PhaseF7PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

export function PhaseF7Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF7PanelProps) {
  const data = phaseData as PhaseF7Data;
  const checklistItems = PHASE_CHECKLISTS.F7;

  // Calculate opposition period progress
  const calculateOppositionProgress = () => {
    if (!data.opposition_period_start || !data.opposition_period_end) return 0;
    const start = new Date(data.opposition_period_start).getTime();
    const end = new Date(data.opposition_period_end).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const oppositionProgress = calculateOppositionProgress();

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Checklist de Publicación
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

      {/* Publication Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-500" />
            Datos de Publicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">BOPI número</Label>
              <Input
                placeholder="2026/1234"
                value={data.publication_number || ''}
                onChange={(e) => onDataChange('publication_number', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Fecha de publicación</Label>
              <Input
                type="date"
                value={data.publication_date || ''}
                onChange={(e) => onDataChange('publication_date', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Adjuntar publicación
            </Button>
            {data.publication_url && (
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver en BOPI
              </Button>
            )}
          </div>

          <Button variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Notificar cliente
          </Button>
        </CardContent>
      </Card>

      {/* Opposition Period */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            Período de Oposición
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Inicio</Label>
              <Input
                type="date"
                value={data.opposition_period_start || ''}
                onChange={(e) => onDataChange('opposition_period_start', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm mb-2 block">Fin</Label>
              <Input
                type="date"
                value={data.opposition_period_end || ''}
                onChange={(e) => onDataChange('opposition_period_end', e.target.value)}
              />
            </div>
          </div>

          {data.opposition_period_start && data.opposition_period_end && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progreso del período</span>
                <span className="font-medium">{Math.round(oppositionProgress)}% transcurrido</span>
              </div>
              <Progress value={oppositionProgress} className="h-2" />
              
              {oppositionProgress < 100 ? (
                <p className="text-xs text-muted-foreground">
                  Días restantes: {Math.ceil((new Date(data.opposition_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días
                </p>
              ) : (
                <Badge className="bg-green-100 text-green-700">
                  ✅ Período de oposición finalizado
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oppositions Received */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-500" />
            Oposiciones Recibidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.oppositions && data.oppositions.length > 0 ? (
            <div className="space-y-3">
              {data.oppositions.map((opposition) => (
                <div 
                  key={opposition.id}
                  className="p-3 rounded-lg border bg-red-50 border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{opposition.opponent_name}</span>
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      {opposition.status === 'pending' && 'Pendiente'}
                      {opposition.status === 'in_progress' && 'En trámite'}
                      {opposition.status === 'resolved' && 'Resuelta'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fecha de presentación: {opposition.filing_date}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Swords className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No se han recibido oposiciones</p>
            </div>
          )}

          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Registrar oposición
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
