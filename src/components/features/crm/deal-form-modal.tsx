import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDeal, useUpdateDeal, usePipelines, useContacts } from '@/hooks/use-crm';
import { DEAL_PRIORITIES } from '@/lib/constants/crm';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Deal, Pipeline } from '@/types/crm';
import { ScrollArea } from '@/components/ui/scroll-area';

const dealSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  pipeline_id: z.string().min(1, 'Selecciona un pipeline'),
  stage_id: z.string().min(1, 'Selecciona una etapa'),
  value: z.number().optional(),
  currency: z.string().default('EUR'),
  expected_close_date: z.string().optional(),
  priority: z.string().default('medium'),
  contact_id: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
  defaultPipelineId?: string;
  defaultStageId?: string;
}

export function DealFormModal({ open, onClose, deal, defaultPipelineId, defaultStageId }: Props) {
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: pipelines = [] } = usePipelines();
  const { data: contacts = [] } = useContacts();
  const isEditing = !!deal;
  
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '',
      description: '',
      pipeline_id: '',
      stage_id: '',
      currency: 'EUR',
      priority: 'medium',
    },
  });

  // Reset form when deal changes or modal opens
  useEffect(() => {
    if (deal) {
      setSelectedPipelineId(deal.pipeline_id);
      form.reset({
        title: deal.title,
        description: deal.description || '',
        pipeline_id: deal.pipeline_id,
        stage_id: deal.stage_id,
        value: deal.value || undefined,
        currency: deal.currency,
        expected_close_date: deal.expected_close_date || '',
        priority: deal.priority,
        contact_id: deal.contact_id || '',
      });
    } else {
      const pipelineId = defaultPipelineId || pipelines[0]?.id || '';
      setSelectedPipelineId(pipelineId);
      const pipeline = pipelines.find(p => p.id === pipelineId);
      const stageId = defaultStageId || pipeline?.stages?.[0]?.id || '';
      
      form.reset({
        title: '',
        description: '',
        pipeline_id: pipelineId,
        stage_id: stageId,
        currency: 'EUR',
        priority: 'medium',
      });
    }
  }, [deal, defaultPipelineId, defaultStageId, pipelines, form]);

  // Update stage options when pipeline changes
  useEffect(() => {
    if (selectedPipelineId && !deal) {
      form.setValue('pipeline_id', selectedPipelineId);
      const pipeline = pipelines.find(p => p.id === selectedPipelineId);
      if (pipeline?.stages?.[0]) {
        form.setValue('stage_id', pipeline.stages[0].id);
      }
    }
  }, [selectedPipelineId, pipelines, form, deal]);

  const onSubmit = async (values: DealFormValues) => {
    try {
      const data = {
        ...values,
        value: values.value || null,
        expected_close_date: values.expected_close_date || null,
        contact_id: values.contact_id || null,
      };

      if (isEditing && deal) {
        await updateDeal.mutateAsync({ id: deal.id, data });
        toast.success('Deal actualizado');
      } else {
        await createDeal.mutateAsync(data as Parameters<typeof createDeal.mutateAsync>[0]);
        toast.success('Deal creado');
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(isEditing ? 'Error al actualizar el deal' : 'Error al crear el deal');
    }
  };

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditing ? 'Editar Deal' : 'Nuevo Deal'}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Implementación CRM" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pipeline_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline *</FormLabel>
                      <Select 
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedPipelineId(value);
                        }}
                        disabled={isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pipelines.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etapa *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedPipeline?.stages?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: s.color }} 
                                />
                                {s.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="15000" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expected_close_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha cierre esperado</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DEAL_PRIORITIES).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: config.color }} 
                                />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contacto</FormLabel>
                    <Select
                      value={field.value ? field.value : '__none__'}
                      onValueChange={(v) => field.onChange(v === '__none__' ? '' : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar contacto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sin contacto</SelectItem>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.company_name && `(${c.company_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detalles del deal..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? 'Guardar cambios' : 'Crear deal'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
