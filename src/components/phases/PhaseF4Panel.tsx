// ============================================================
// IP-NEXUS - PHASE F4 PANEL (PREPARACIÓN)
// PROMPT 21: Panel de preparación de documentación
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
  FileText, 
  CheckCircle2,
  Upload,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  Image,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHASE_CHECKLISTS, type PhaseF4Data } from '@/hooks/use-phase-data';

interface PhaseF4PanelProps {
  matterId: string;
  phaseData: Record<string, unknown>;
  checklist: Record<string, boolean>;
  onDataChange: (key: string, value: unknown) => void;
  onChecklistChange: (key: string, checked: boolean) => void;
}

const REQUIRED_DOCUMENTS = [
  { type: 'application_form', name: 'Formulario de solicitud', required: true },
  { type: 'mark_representation', name: 'Representación de la marca', required: true },
  { type: 'power_of_attorney', name: 'Poder de representación', required: false },
  { type: 'goods_services_list', name: 'Lista de productos/servicios', required: true },
  { type: 'payment_receipt', name: 'Justificante de pago de tasas', required: true },
  { type: 'priority_doc', name: 'Documento de prioridad', required: false },
];

export function PhaseF4Panel({
  matterId,
  phaseData,
  checklist,
  onDataChange,
  onChecklistChange,
}: PhaseF4PanelProps) {
  const data = phaseData as PhaseF4Data;
  const checklistItems = PHASE_CHECKLISTS.F4;

  const documentsChecklist = data.documents_checklist || REQUIRED_DOCUMENTS.map(doc => ({
    document_type: doc.type,
    required: doc.required,
    status: 'pending' as const,
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'uploaded':
      case 'generated':
        return <FileCheck className="w-4 h-4 text-blue-500" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'uploaded': return 'Subido';
      case 'generated': return 'Generado';
      case 'pending':
      default: return 'Pendiente';
    }
  };

  const updateDocumentStatus = (docType: string, status: string) => {
    const updated = documentsChecklist.map(doc => 
      doc.document_type === docType ? { ...doc, status } : doc
    );
    onDataChange('documents_checklist', updated);
  };

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            Checklist de Preparación
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

      {/* Documents Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-500" />
            Checklist de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Documentos requeridos para OEPM - Marca Nacional:
          </p>
          
          <div className="space-y-3">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const docData = documentsChecklist.find(d => d.document_type === doc.type);
              const status = docData?.status || 'pending';
              
              return (
                <div
                  key={doc.type}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    status === 'verified' && 'bg-green-50 border-green-200',
                    status === 'uploaded' && 'bg-blue-50 border-blue-200',
                    status === 'generated' && 'bg-blue-50 border-blue-200',
                    status === 'pending' && 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      {!doc.required && (
                        <p className="text-xs text-muted-foreground">(Opcional)</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getStatusLabel(status)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <FileText className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Applicant Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            Datos del Solicitante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">Datos verificados:</span>
            <Badge className={data.applicant_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {data.applicant_verified ? '✅ Verificado' : '⏳ Pendiente'}
            </Badge>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
            <p><strong>Nombre:</strong> Atlas Logistics Europe S.L.</p>
            <p><strong>NIF:</strong> B12345678</p>
            <p><strong>Dirección:</strong> Calle Principal 123, 28001 Madrid</p>
            <p><strong>País:</strong> España</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar datos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDataChange('applicant_verified', true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verificar con registro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mark Representation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="w-4 h-4 text-purple-500" />
            Representación de la Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo de marca</Label>
            <RadioGroup
              value={data.mark_type || 'word'}
              onValueChange={(value) => onDataChange('mark_type', value)}
              className="flex flex-wrap gap-4"
            >
              {[
                { value: 'word', label: 'Denominativa' },
                { value: 'combined', label: 'Mixta' },
                { value: 'figurative', label: 'Gráfica' },
                { value: '3d', label: '3D' },
                { value: 'sound', label: 'Sonora' },
              ].map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <RadioGroupItem value={type.value} id={`mark-${type.value}`} />
                  <Label htmlFor={`mark-${type.value}`} className="cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {(data.mark_type === 'combined' || data.mark_type === 'figurative') && (
            <div className="flex gap-4">
              <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                {data.mark_image_url ? (
                  <img 
                    src={data.mark_image_url} 
                    alt="Marca" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground text-sm">
                    <Image className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm"><strong>Formato:</strong> PNG</p>
                <p className="text-sm"><strong>Tamaño:</strong> 800x600px</p>
                <p className="text-sm"><strong>Color:</strong> Sí</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Cambiar imagen
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm mb-2 block">Descripción de la marca</Label>
            <Textarea
              placeholder="Marca mixta compuesta por el elemento denominativo ACME en letras mayúsculas de color azul..."
              value={data.mark_description || ''}
              onChange={(e) => onDataChange('mark_description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Prioridad (si aplica)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="priority"
              checked={data.priority_claimed || false}
              onCheckedChange={(checked) => onDataChange('priority_claimed', !!checked)}
            />
            <Label htmlFor="priority" className="cursor-pointer">
              Solicitar prioridad unionista
            </Label>
          </div>

          {data.priority_claimed && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-sm mb-2 block">Solicitud anterior</Label>
                <Input
                  placeholder="Número de solicitud"
                  value={data.priority_application_number || ''}
                  onChange={(e) => onDataChange('priority_application_number', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">País</Label>
                <Input
                  placeholder="País de la solicitud"
                  value={data.priority_country || ''}
                  onChange={(e) => onDataChange('priority_country', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Fecha</Label>
                <Input
                  type="date"
                  value={data.priority_date || ''}
                  onChange={(e) => onDataChange('priority_date', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Application */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generar Solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generar borrador de solicitud
            </Button>
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Vista previa del formulario oficial
            </Button>
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validar datos antes de presentar
            </Button>
          </div>

          {data.application_validated && (
            <Badge className="mt-3 bg-green-100 text-green-700">
              ✅ Solicitud validada y lista para presentar
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
