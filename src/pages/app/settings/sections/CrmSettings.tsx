import { useMemo, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import {
  useCreatePipeline,
  useCreateStage,
  useDeleteStage,
  usePipelines,
  useReorderStages,
  useUpdatePipeline,
  useUpdateStage,
} from '@/hooks/crm/use-pipelines';

import { SortableStageRow } from './crm/SortableStageRow';

export default function CrmSettings() {
  const { data: pipelines = [], isLoading } = usePipelines();
  const updatePipeline = useUpdatePipeline();
  const createPipeline = useCreatePipeline();

  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const reorderStages = useReorderStages();

  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const selectedPipeline = useMemo(
    () => pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0],
    [pipelines, selectedPipelineId],
  );

  const stages = useMemo(
    () => [...(selectedPipeline?.stages || [])].sort((a, b) => a.position - b.position),
    [selectedPipeline?.stages],
  );

  // DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = async ({ active, over }: { active: any; over: any }) => {
    if (!over || !selectedPipeline) return;
    if (active.id === over.id) return;

    const oldIndex = stages.findIndex((s: any) => s.id === active.id);
    const newIndex = stages.findIndex((s: any) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(stages, oldIndex, newIndex).map((s: any, idx: number) => ({
      id: s.id,
      position: idx,
    }));

    try {
      await reorderStages.mutateAsync(next);
      toast.success('Etapas reordenadas');
    } catch {
      toast.error('No se pudieron reordenar las etapas');
    }
  };

  // Create pipeline dialog
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState('');

  // Create stage dialog
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageProbability, setStageProbability] = useState(50);
  const [stageColor, setStageColor] = useState('#3B82F6');

  const canSaveStage = stageName.trim().length > 1 && stageProbability >= 0 && stageProbability <= 100;

  const handleCreatePipeline = async () => {
    if (!pipelineName.trim()) return;
    try {
      await createPipeline.mutateAsync({
        name: pipelineName.trim(),
        stages: [
          { name: 'Nuevo', color: '#94A3B8', probability: 10, position: 0 },
          { name: 'En proceso', color: '#60A5FA', probability: 50, position: 1 },
          { name: 'Ganado', color: '#22C55E', probability: 100, position: 2, is_won_stage: true },
          { name: 'Perdido', color: '#EF4444', probability: 0, position: 3, is_lost_stage: true },
        ],
      });
      toast.success('Pipeline creado');
      setPipelineDialogOpen(false);
      setPipelineName('');
    } catch {
      toast.error('No se pudo crear el pipeline');
    }
  };

  const handleSetDefault = async (pipelineId: string) => {
    try {
      await updatePipeline.mutateAsync({ id: pipelineId, is_default: true });
      toast.success('Pipeline predeterminado actualizado');
    } catch {
      toast.error('No se pudo actualizar el pipeline predeterminado');
    }
  };

  const handleCreateStage = async () => {
    if (!selectedPipeline) return;
    if (!canSaveStage) return;

    try {
      await createStage.mutateAsync({
        pipeline_id: selectedPipeline.id,
        name: stageName.trim(),
        color: stageColor,
        probability: stageProbability,
        position: stages.length,
        is_won_stage: false,
        is_lost_stage: false,
      });
      toast.success('Etapa creada');
      setStageDialogOpen(false);
      setStageName('');
      setStageProbability(50);
    } catch {
      toast.error('No se pudo crear la etapa');
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('¿Eliminar esta etapa?')) return;
    try {
      await deleteStage.mutateAsync(stageId);
      toast.success('Etapa eliminada');
    } catch {
      toast.error('No se pudo eliminar la etapa');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CRM · Pipelines y etapas</CardTitle>
          <CardDescription>
            Crea pipelines, añade etapas, reordénalas y define cuál es el pipeline predeterminado.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Pipelines */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pipelines</CardTitle>
              <CardDescription>Gestiona tus pipelines</CardDescription>
            </div>
            <Button size="sm" onClick={() => setPipelineDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : pipelines.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aún no hay pipelines.</div>
            ) : (
              pipelines.map((p: any) => {
                const active = selectedPipeline?.id === p.id;
                return (
                  <button
                    key={p.id}
                    className={cn(
                      'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                      active ? 'bg-muted' : 'hover:bg-muted/60',
                    )}
                    onClick={() => setSelectedPipelineId(p.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(p.stages?.length || 0).toString()} etapas
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.is_default ? <Badge variant="secondary">Default</Badge> : null}
                      </div>
                    </div>

                    {!p.is_default && (
                      <div className="mt-2 flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Predeterminado</Label>
                        <Switch
                          checked={false}
                          onCheckedChange={() => handleSetDefault(p.id)}
                          aria-label="Establecer como predeterminado"
                        />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Stages */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Etapas</CardTitle>
              <CardDescription>
                {selectedPipeline ? `Pipeline: ${selectedPipeline.name}` : 'Selecciona un pipeline'}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedPipeline}
              onClick={() => setStageDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva etapa
            </Button>
          </CardHeader>
          <CardContent>
            {!selectedPipeline ? (
              <div className="text-sm text-muted-foreground">Selecciona un pipeline para editar sus etapas.</div>
            ) : stages.length === 0 ? (
              <div className="text-sm text-muted-foreground">Este pipeline no tiene etapas.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={stages.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {stages.map((stage: any) => (
                      <SortableStageRow
                        key={stage.id}
                        id={stage.id}
                        stage={stage}
                        onUpdate={async (updates) => {
                          try {
                            await updateStage.mutateAsync({ id: stage.id, ...updates });
                          } catch {
                            toast.error('No se pudo actualizar la etapa');
                          }
                        }}
                        onDelete={() => handleDeleteStage(stage.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            <Separator className="my-4" />
          </CardContent>
        </Card>
      </div>

      {/* Create pipeline */}
      <Dialog open={pipelineDialogOpen} onOpenChange={setPipelineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo pipeline</DialogTitle>
            <DialogDescription>Crea un pipeline con etapas base (luego puedes editarlo).</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="pipelineName">Nombre</Label>
            <Input id="pipelineName" value={pipelineName} onChange={(e) => setPipelineName(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPipelineDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePipeline} disabled={!pipelineName.trim() || createPipeline.isPending}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create stage */}
      <Dialog open={stageDialogOpen} onOpenChange={setStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva etapa</DialogTitle>
            <DialogDescription>Añade una nueva etapa al pipeline seleccionado.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <Label htmlFor="stageName">Nombre</Label>
              <Input id="stageName" value={stageName} onChange={(e) => setStageName(e.target.value)} />
            </div>
            <div className="col-span-6">
              <Label htmlFor="stageProb">Probabilidad (0-100)</Label>
              <Input
                id="stageProb"
                type="number"
                min={0}
                max={100}
                value={stageProbability}
                onChange={(e) => setStageProbability(Number(e.target.value))}
              />
            </div>
            <div className="col-span-6">
              <Label htmlFor="stageColor">Color (hex)</Label>
              <Input id="stageColor" value={stageColor} onChange={(e) => setStageColor(e.target.value)} />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm border" style={{ backgroundColor: stageColor }} />
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateStage} disabled={!canSaveStage || createStage.isPending}>
              Crear etapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
