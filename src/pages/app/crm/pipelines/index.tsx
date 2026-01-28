// ============================================================
// IP-NEXUS CRM - PIPELINE MANAGEMENT PAGE
// Prompt: CRM Pipelines con etapas preconfiguradas
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Settings, Plus, GripVertical, Edit2, Trash2, 
  Check, X, Users, FileText, AlertTriangle, RefreshCw,
  Target, Loader2, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePipelines, useCreatePipeline, useUpdatePipeline, useDeletePipeline } from '@/hooks/crm/use-pipelines';
import { toast } from 'sonner';

// Preconfigurados según el documento
const PIPELINE_TEMPLATES = [
  {
    id: 'captacion',
    name: 'Captación de Clientes',
    icon: Users,
    color: '#3B82F6',
    stages: [
      { name: 'Lead Entrante', color: '#94A3B8', probability: 10, position: 0 },
      { name: 'Contacto Inicial', color: '#60A5FA', probability: 20, position: 1 },
      { name: 'Análisis de Necesidades', color: '#818CF8', probability: 30, position: 2 },
      { name: 'Propuesta Enviada', color: '#A78BFA', probability: 50, position: 3 },
      { name: 'Negociación', color: '#C084FC', probability: 70, position: 4 },
      { name: 'Cliente Ganado', color: '#22C55E', probability: 100, position: 5, is_won_stage: true },
      { name: 'Perdido', color: '#EF4444', probability: 0, position: 6, is_lost_stage: true },
    ]
  },
  {
    id: 'registro-marca',
    name: 'Registro de Marca',
    icon: FileText,
    color: '#8B5CF6',
    stages: [
      { name: 'Solicitud Recibida', color: '#94A3B8', probability: 10, position: 0 },
      { name: 'Búsqueda Anterioridades', color: '#60A5FA', probability: 25, position: 1 },
      { name: 'Preparación Docs', color: '#818CF8', probability: 40, position: 2 },
      { name: 'Presentación Oficina', color: '#A78BFA', probability: 60, position: 3 },
      { name: 'En Examen', color: '#C084FC', probability: 75, position: 4 },
      { name: 'Publicación', color: '#F59E0B', probability: 85, position: 5 },
      { name: 'Concedida', color: '#22C55E', probability: 100, position: 6, is_won_stage: true },
      { name: 'Denegada', color: '#EF4444', probability: 0, position: 7, is_lost_stage: true },
    ]
  },
  {
    id: 'oposiciones',
    name: 'Oposiciones/Litigios',
    icon: AlertTriangle,
    color: '#EF4444',
    stages: [
      { name: 'Alerta Recibida', color: '#EF4444', probability: 10, position: 0 },
      { name: 'Análisis Riesgo', color: '#F59E0B', probability: 25, position: 1 },
      { name: 'Consulta Cliente', color: '#818CF8', probability: 40, position: 2 },
      { name: 'Acción Iniciada', color: '#A78BFA', probability: 55, position: 3 },
      { name: 'Intercambio Escritos', color: '#C084FC', probability: 70, position: 4 },
      { name: 'Vista/Audiencia', color: '#60A5FA', probability: 85, position: 5 },
      { name: 'Resolución', color: '#22C55E', probability: 100, position: 6, is_won_stage: true },
      { name: 'Archivado', color: '#6B7280', probability: 0, position: 7, is_lost_stage: true },
    ]
  },
  {
    id: 'renovaciones',
    name: 'Renovaciones',
    icon: RefreshCw,
    color: '#10B981',
    stages: [
      { name: 'Próxima a Vencer', color: '#F59E0B', probability: 20, position: 0 },
      { name: 'Cliente Notificado', color: '#60A5FA', probability: 40, position: 1 },
      { name: 'Confirmación', color: '#818CF8', probability: 60, position: 2 },
      { name: 'Pago Procesado', color: '#A78BFA', probability: 80, position: 3 },
      { name: 'Renovación Presentada', color: '#C084FC', probability: 90, position: 4 },
      { name: 'Completada', color: '#22C55E', probability: 100, position: 5, is_won_stage: true },
    ]
  },
];

interface Stage {
  id?: string;
  name: string;
  color: string;
  probability: number;
  position: number;
  is_won_stage?: boolean;
  is_lost_stage?: boolean;
  pipeline_id?: string;
}

interface PipelineLocal {
  id: string;
  name: string;
  is_default: boolean;
  stages?: Stage[];
}

export default function PipelineList() {
  usePageTitle('Pipelines');
  const navigate = useNavigate();
  
  const { data: pipelines, isLoading } = usePipelines();
  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();
  const deletePipeline = useDeletePipeline();

  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<PipelineLocal | null>(null);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PIPELINE_TEMPLATES[0] | null>(null);

  const handleCreateFromTemplate = async (template: typeof PIPELINE_TEMPLATES[0]) => {
    try {
      await createPipeline.mutateAsync({
        name: template.name,
        stages: template.stages,
      });
      toast.success(`Pipeline "${template.name}" creado`);
      setShowTemplateDialog(false);
    } catch (error) {
      toast.error('Error al crear pipeline');
    }
  };

  const handleCreateCustom = async () => {
    if (!newPipelineName.trim()) return;
    
    try {
      await createPipeline.mutateAsync({
        name: newPipelineName,
        stages: [
          { name: 'Nuevo', color: '#94A3B8', probability: 0, position: 0 },
          { name: 'En Progreso', color: '#60A5FA', probability: 50, position: 1 },
          { name: 'Completado', color: '#22C55E', probability: 100, position: 2, is_won_stage: true },
        ],
      });
      toast.success(`Pipeline "${newPipelineName}" creado`);
      setShowCreateDialog(false);
      setNewPipelineName('');
    } catch (error) {
      toast.error('Error al crear pipeline');
    }
  };

  const handleSetDefault = async (pipelineId: string) => {
    try {
      await updatePipeline.mutateAsync({ id: pipelineId, is_default: true });
      toast.success('Pipeline establecido como predeterminado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (pipelineId: string) => {
    if (!confirm('¿Eliminar este pipeline? Los deals asociados se moverán al pipeline predeterminado.')) return;
    
    try {
      await deletePipeline.mutateAsync(pipelineId);
      toast.success('Pipeline eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
          <p className="text-muted-foreground">Gestiona pipelines y etapas del CRM</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/crm/kanban')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Kanban
          </Button>
          <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
            <Target className="w-4 h-4 mr-2" />
            Desde Plantilla
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pipeline
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : pipelines && pipelines.length > 0 ? (
        <div className="grid gap-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                    {pipeline.is_default && (
                      <Badge variant="secondary">Predeterminado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!pipeline.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(pipeline.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Predeterminar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPipeline(pipeline)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!pipeline.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(pipeline.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stage Flow */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {pipeline.stages?.sort((a, b) => a.position - b.position).map((stage, idx) => (
                    <div key={stage.id || idx} className="flex items-center">
                      <div
                        className={cn(
                          'px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap',
                          'border-2 transition-colors'
                        )}
                        style={{ 
                          borderColor: stage.color,
                          backgroundColor: `${stage.color}15`
                        }}
                      >
                        <span style={{ color: stage.color }}>{stage.name}</span>
                        <span className="ml-2 text-muted-foreground">
                          {stage.probability}%
                        </span>
                      </div>
                      {idx < (pipeline.stages?.length || 0) - 1 && (
                        <div className="w-4 h-0.5 bg-border mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No hay pipelines configurados</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Crea tu primer pipeline desde una plantilla o personalizado.
            </p>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Target className="w-4 h-4 mr-2" />
              Comenzar con Plantilla
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecciona una Plantilla</DialogTitle>
            <DialogDescription>
              Elige una plantilla preconfigurada para PI o crea uno personalizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {PIPELINE_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedTemplate?.id === template.id && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <template.icon className="h-5 w-5" style={{ color: template.color }} />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {template.stages.length} etapas
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.stages.slice(0, 4).map((stage, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: stage.color, color: stage.color }}
                      >
                        {stage.name}
                      </Badge>
                    ))}
                    {template.stages.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.stages.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedTemplate && handleCreateFromTemplate(selectedTemplate)}
              disabled={!selectedTemplate || createPipeline.isPending}
            >
              {createPipeline.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Crear Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Custom Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Pipeline</DialogTitle>
            <DialogDescription>
              Crea un pipeline personalizado con etapas básicas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pipeline-name">Nombre del Pipeline</Label>
              <Input
                id="pipeline-name"
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                placeholder="Ej: Ventas B2B"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCustom}
              disabled={!newPipelineName.trim() || createPipeline.isPending}
            >
              {createPipeline.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
