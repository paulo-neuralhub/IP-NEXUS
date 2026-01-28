/**
 * PipelineDetailSheet - Sheet lateral estilo Bitrix24
 * Header con color de etapa, barra de stages clicable, tabs con info completa
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Calendar,
  FileText,
  User,
  Clock,
  Plus,
  Edit2,
  Check,
  X,
  DollarSign,
  Target,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Lead } from '@/hooks/crm/useLeads';
import type { Deal } from '@/hooks/crm/useDeals';
import type { CRMPipelineStage } from '@/hooks/crm/v2/pipelines';
import { toast } from 'sonner';
import { fromTable } from '@/lib/supabase';

interface PipelineDetailSheetProps {
  item: Lead | Deal | null;
  type: 'lead' | 'deal';
  stages: CRMPipelineStage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange?: (newStageId: string) => Promise<void>;
  onRefetch?: () => void;
}

export function PipelineDetailSheet({
  item,
  type,
  stages,
  open,
  onOpenChange,
  onStageChange,
  onRefetch,
}: PipelineDetailSheetProps) {
  const [isChangingStage, setIsChangingStage] = useState(false);

  if (!item) return null;

  // Get current stage info
  const currentStage = stages.find(s => s.id === (item as any).stage_id) || stages[0];
  const stageColor = currentStage?.color || '#3B82F6';

  // Extract common data
  const isLead = type === 'lead';
  const lead = isLead ? (item as Lead) : null;
  const deal = !isLead ? (item as Deal) : null;

  const title = lead?.title || lead?.contact_name || deal?.name || 'Sin título';
  const company = lead?.company_name || (deal?.client as any)?.name || '';
  const value = lead?.estimated_value || deal?.amount || 0;
  const contactName = lead?.contact_name || '';
  const contactEmail = lead?.contact_email || (deal?.client as any)?.email || '';
  const contactPhone = lead?.contact_phone || (deal?.client as any)?.phone || '';
  const notes = lead?.notes || (deal as any)?.notes || '';
  const createdAt = item.created_at;

  const initials = (contactName || title)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??';

  // Handle stage change
  const handleStageClick = async (stageId: string) => {
    if (stageId === currentStage?.id || isChangingStage) return;
    
    setIsChangingStage(true);
    try {
      if (onStageChange) {
        await onStageChange(stageId);
      } else {
        // Default implementation
        const table = isLead ? 'crm_leads' : 'crm_deals';
        const { error } = await fromTable(table)
          .update({ stage_id: stageId })
          .eq('id', item.id);
        
        if (error) throw error;
        toast.success('Etapa actualizada');
        onRefetch?.();
      }
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error('Error al cambiar etapa');
    } finally {
      setIsChangingStage(false);
    }
  };

  // Quick actions handlers
  const handleCall = () => {
    if (contactPhone) {
      window.open(`tel:${contactPhone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (contactPhone) {
      const cleanPhone = contactPhone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (contactEmail) {
      window.open(`mailto:${contactEmail}`, '_self');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-0 overflow-hidden flex flex-col">
        
        {/* HEADER con color de etapa */}
        <div 
          className="p-6 text-white shrink-0"
          style={{ backgroundColor: stageColor }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Badge 
                variant="secondary" 
                className="mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {currentStage?.name || 'Sin etapa'}
              </Badge>
              <h2 className="text-xl font-bold truncate">{title}</h2>
              {company && (
                <p className="text-white/80 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {company}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-bold">
                €{value.toLocaleString('es-ES')}
              </p>
              <p className="text-sm text-white/70">Valor {isLead ? 'estimado' : ''}</p>
            </div>
          </div>
          
          {/* Barra de etapas clicable */}
          <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-thin">
            {stages.map((stage, idx) => {
              const isCurrent = stage.id === currentStage?.id;
              const isPast = stages.findIndex(s => s.id === currentStage?.id) > idx;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageClick(stage.id)}
                  disabled={isChangingStage}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    flex items-center gap-1 shrink-0
                    ${isCurrent 
                      ? 'bg-white text-slate-900 shadow-md scale-105' 
                      : isPast
                        ? 'bg-white/40 text-white'
                        : 'bg-white/20 text-white/80 hover:bg-white/30'}
                    ${isChangingStage ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                  `}
                >
                  {isPast && <Check className="w-3 h-3" />}
                  {stage.name}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* CONTENIDO con tabs */}
        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start px-4 py-2 h-auto border-b rounded-none bg-transparent shrink-0">
            <TabsTrigger value="general" className="text-sm">General</TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Actividad</TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm">Tareas</TabsTrigger>
            <TabsTrigger value="docs" className="text-sm">Documentos</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            {/* TAB GENERAL */}
            <TabsContent value="general" className="p-4 space-y-4 m-0">
              
              {/* Contacto principal */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" /> Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contactName && (
                    <p className="font-medium">{contactName}</p>
                  )}
                  {contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${contactPhone}`} className="hover:text-primary hover:underline">
                        {contactPhone}
                      </a>
                    </div>
                  )}
                  {contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${contactEmail}`} className="hover:text-primary hover:underline">
                        {contactEmail}
                      </a>
                    </div>
                  )}
                  {!contactName && !contactPhone && !contactEmail && (
                    <p className="text-sm text-muted-foreground">Sin datos de contacto</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Acciones rápidas */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-3 hover:bg-primary/5 hover:border-primary/30"
                  onClick={handleCall}
                  disabled={!contactPhone}
                >
                  <Phone className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-xs">Llamar</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-3 hover:bg-accent hover:border-accent"
                  onClick={handleWhatsApp}
                  disabled={!contactPhone}
                >
                  <MessageCircle className="w-5 h-5 mb-1 text-[hsl(var(--ip-success-text))]" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col h-auto py-3 hover:bg-secondary/10 hover:border-secondary/30"
                  onClick={handleEmail}
                  disabled={!contactEmail}
                >
                  <Mail className="w-5 h-5 mb-1 text-secondary" />
                  <span className="text-xs">Email</span>
                </Button>
              </div>

              {/* Información adicional */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" /> Detalles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-semibold text-primary">€{value.toLocaleString('es-ES')}</span>
                  </div>
                  {lead?.source && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Origen</span>
                      <Badge variant="outline">{lead.source}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{format(new Date(createdAt), "d MMM yyyy", { locale: es })}</span>
                  </div>
                  {deal?.expected_close_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cierre esperado</span>
                      <span>{format(new Date(deal.expected_close_date), "d MMM yyyy", { locale: es })}</span>
                    </div>
                  )}
                  {currentStage?.probability !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Probabilidad</span>
                      <span className="font-semibold">{currentStage.probability}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notas */}
              {notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Responsable */}
              {(item as any).assigned_to && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" /> Responsable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {((item as any).assigned_user?.full_name || '??')
                            .split(' ').map((n: string) => n[0]).join('').slice(0,2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {(item as any).assigned_user?.full_name || 'Sin asignar'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB ACTIVIDAD */}
            <TabsContent value="activity" className="p-4 space-y-4 m-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Historial</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir nota
                </Button>
              </div>
              
              {/* Timeline mock */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(createdAt), "d/MM/yy HH:mm", { locale: es })}
                      </span>
                      <span className="mx-2">—</span>
                      {isLead ? 'Lead creado' : 'Negociación creada'}
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground py-8">
                Las interacciones (llamadas, emails, WhatsApp) aparecerán aquí
              </p>
            </TabsContent>

            {/* TAB TAREAS */}
            <TabsContent value="tasks" className="p-4 space-y-4 m-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Tareas Pendientes</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva tarea
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground py-8">
                No hay tareas asociadas
              </p>
            </TabsContent>

            {/* TAB DOCUMENTOS */}
            <TabsContent value="docs" className="p-4 space-y-4 m-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Documentos</h3>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Subir
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground py-8">
                No hay documentos adjuntos
              </p>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-muted/30 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              {!currentStage?.is_won_stage && !currentStage?.is_lost_stage && (
                <>
                  <Button 
                    size="sm" 
                    className="bg-[hsl(var(--ip-success-text))] hover:bg-[hsl(var(--ip-success-text))]/90"
                    onClick={() => {
                      const wonStage = stages.find(s => s.is_won_stage);
                      if (wonStage) handleStageClick(wonStage.id);
                    }}
                  >
                    ✅ Ganado
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      const lostStage = stages.find(s => s.is_lost_stage);
                      if (lostStage) handleStageClick(lostStage.id);
                    }}
                  >
                    ❌ Perdido
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
