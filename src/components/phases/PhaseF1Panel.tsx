// ============================================================
// IP-NEXUS - PHASE F1 PANEL (ANÁLISIS)
// PROMPT 21: Panel de análisis de viabilidad
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  ExternalLink,
  FileDown,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF1Data } from '@/hooks/use-phase-data';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PhaseF1PanelProps {
  matterId: string;
  matterReference?: string;
  matterTitle?: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

const SEARCH_DATABASES = [
  { id: 'tmview', name: 'TMView', description: 'Base de datos europea' },
  { id: 'euipo', name: 'EUIPO', description: 'Oficina de PI de la UE' },
  { id: 'oepm', name: 'OEPM', description: 'Oficina Española' },
  { id: 'wipo', name: 'WIPO', description: 'Organización Mundial PI' },
];

export function PhaseF1Panel({
  matterId,
  matterReference,
  matterTitle,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF1PanelProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const data = phaseData as PhaseF1Data;
  const checklistItems = PHASE_CHECKLISTS.F1;

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Generate PDF report
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header
      doc.setFillColor(59, 130, 246); // Blue-500
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME DE ANÁLISIS', margin, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Expediente: ${matterReference || matterId}`, margin, 28);

      // Reset colors
      doc.setTextColor(31, 41, 55);
      y = 45;

      // Matter info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Expediente', margin, y);
      y += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Referencia: ${matterReference || 'N/A'}`, margin, y);
      y += 5;
      doc.text(`Título: ${matterTitle || 'N/A'}`, margin, y);
      y += 5;
      doc.text(`Fecha: ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`, margin, y);
      y += 12;

      // Risk Assessment
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Evaluación de Riesgo', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const riskLevelText = {
        low: '🟢 Bajo',
        medium: '🟡 Medio', 
        high: '🔴 Alto',
      }[data.risk_level || ''] || 'No evaluado';
      
      doc.text(`Nivel de riesgo: ${riskLevelText}`, margin, y);
      y += 5;
      doc.text(`Distintividad: ${data.distinctiveness_score || 0}%`, margin, y);
      y += 12;

      // Search Results
      if (data.search_performed && data.search_results) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Resultados de Búsqueda', margin, y);
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Marcas encontradas: ${data.search_results.total_found}`, margin, y);
        y += 5;
        doc.text(`Alto riesgo: ${data.search_results.high_risk}`, margin, y);
        y += 5;
        doc.text(`Riesgo medio: ${data.search_results.medium_risk}`, margin, y);
        y += 5;
        doc.text(`Bajo riesgo: ${data.search_results.low_risk}`, margin, y);
        y += 12;
      }

      // Recommendation
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Recomendación', margin, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const recommendationText = {
        proceed: '✅ Proceder con el registro',
        proceed_with_changes: '⚠️ Proceder con modificaciones',
        not_recommended: '❌ No recomendado',
      }[data.recommendation || ''] || 'Sin recomendación';
      
      doc.text(recommendationText, margin, y);
      y += 8;

      // Recommendation notes
      if (data.recommendation_notes) {
        const lines = doc.splitTextToSize(data.recommendation_notes, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 10;
      }

      // Footer
      const footerY = 280;
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Este documento es confidencial y de uso interno.', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Generado por IP-NEXUS · ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, footerY + 4, { align: 'center' });

      // Save
      const fileName = `Informe_Analisis_${matterReference || matterId}_${format(new Date(), 'yyyyMMdd')}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF generado correctamente', {
        description: fileName,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Checklist Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Checklist de Análisis
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

      {/* Prior Art Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            Búsqueda de Anterioridades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SEARCH_DATABASES.map((db) => (
              <div key={db.id} className="flex items-center gap-2">
                <Checkbox
                  id={`db-${db.id}`}
                  checked={(data.search_databases || []).includes(db.id)}
                  onCheckedChange={(checked) => {
                    const current = data.search_databases || [];
                    const updated = checked
                      ? [...current, db.id]
                      : current.filter(d => d !== db.id);
                    onDataChange('search_databases', updated);
                  }}
                />
                <Label htmlFor={`db-${db.id}`} className="text-sm cursor-pointer">
                  {db.name}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Ejecutar búsqueda automática
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {data.search_performed && data.search_results && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-3">
                Resultados encontrados: {data.search_results.total_found} marcas similares
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">{data.search_results.high_risk} Alto riesgo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">{data.search_results.medium_risk} Medio riesgo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">{data.search_results.low_risk} Bajo riesgo</span>
                </div>
              </div>
              <Button variant="link" className="mt-2 p-0 h-auto">
                Ver detalle de resultados →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viability Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Evaluación de Viabilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Nivel de riesgo general</Label>
            <RadioGroup
              value={data.risk_level || ''}
              onValueChange={(value) => onDataChange('risk_level', value)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="low" id="risk-low" />
                <Label htmlFor="risk-low" className="cursor-pointer flex items-center gap-2">
                  <Badge className={cn('border', getRiskColor('low'))}>Bajo</Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="medium" id="risk-medium" />
                <Label htmlFor="risk-medium" className="cursor-pointer flex items-center gap-2">
                  <Badge className={cn('border', getRiskColor('medium'))}>Medio</Badge>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="high" id="risk-high" />
                <Label htmlFor="risk-high" className="cursor-pointer flex items-center gap-2">
                  <Badge className={cn('border', getRiskColor('high'))}>Alto</Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Distintividad de la marca: {data.distinctiveness_score || 0}%
            </Label>
            <Progress value={data.distinctiveness_score || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {(data.distinctiveness_score || 0) >= 70 ? 'Buena distintividad' : 
               (data.distinctiveness_score || 0) >= 40 ? 'Distintividad media' : 
               'Baja distintividad'}
            </p>
          </div>

          {data.class_availability && data.class_availability.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Disponibilidad por clases</Label>
              <div className="space-y-2">
                {data.class_availability.map((cls, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Clase {cls.class_number}:</span>
                    {cls.status === 'available' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✅ Disponible
                      </Badge>
                    )}
                    {cls.status === 'conflict' && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        ❌ Conflicto
                      </Badge>
                    )}
                    {cls.status === 'partial' && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        ⚠️ Conflicto potencial
                      </Badge>
                    )}
                    {cls.notes && <span className="text-muted-foreground">({cls.notes})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Report */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Informe de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Recomendación</Label>
            <RadioGroup
              value={data.recommendation || ''}
              onValueChange={(value) => onDataChange('recommendation', value)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="proceed" id="rec-proceed" />
                <Label htmlFor="rec-proceed" className="cursor-pointer">
                  ✅ Proceder con el registro
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="proceed_with_changes" id="rec-changes" />
                <Label htmlFor="rec-changes" className="cursor-pointer">
                  ⚠️ Proceder con modificaciones
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="not_recommended" id="rec-no" />
                <Label htmlFor="rec-no" className="cursor-pointer">
                  ❌ No recomendado
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="recommendation_notes" className="text-sm font-medium mb-2 block">
              Notas de recomendación
            </Label>
            <Textarea
              id="recommendation_notes"
              placeholder="Se recomienda proceder con el registro con las siguientes consideraciones..."
              value={data.recommendation_notes || ''}
              onChange={(e) => onDataChange('recommendation_notes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              {isGeneratingPdf ? 'Generando...' : 'Generar informe PDF'}
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Enviar al cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            Notas Internas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Añadir notas para el equipo..."
            value={data.internal_notes || ''}
            onChange={(e) => onDataChange('internal_notes', e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Estas notas solo son visibles para el equipo interno.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
