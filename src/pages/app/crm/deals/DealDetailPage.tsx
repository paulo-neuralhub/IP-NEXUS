/**
 * DealDetailPage - Página de detalle de Deal con layout 50/50
 * Similar a LeadDetailPage pero con campos específicos de Deal
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useCRMDeal, useUpdateCRMDealDetail } from '@/hooks/crm/v2/deal';
import { useCRMPipelines } from '@/hooks/crm/v2/pipelines';
import { useUpdateDealStage } from '@/hooks/crm/v2/deals';
import { usePageTitle } from '@/contexts/page-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { PipelineProgressBar } from '@/components/features/crm/shared/PipelineProgressBar';
import { TimelineItem } from '@/components/ui/timeline-item';
import { Separator } from '@/components/ui/separator';
import {
  Building2, Mail, Phone, Calendar, User,
  AlertTriangle, ArrowLeft, Edit, Tag,
  MessageSquare, DollarSign, Target, Clock,
  CheckCircle, XCircle, PenLine, Sparkles,
  FileText, ListTodo, Activity, TrendingUp,
  Package, UserPlus, ExternalLink, FolderPlus,
  Percent
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Opportunity type config
const OPPORTUNITY_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  new_business: { label: 'Nuevo Negocio', color: 'bg-blue-100 text-blue-700' },
  upsell: { label: 'Upsell', color: 'bg-emerald-100 text-emerald-700' },
  renewal: { label: 'Renovación', color: 'bg-amber-100 text-amber-700' },
  cross_sell: { label: 'Cross-sell', color: 'bg-purple-100 text-purple-700' },
};

// Source config
const SOURCE_CONFIG: Record<string, { label: string; emoji: string }> = {
  web: { label: 'Sitio Web', emoji: '🌐' },
  referral: { label: 'Referido', emoji: '👥' },
  linkedin: { label: 'LinkedIn', emoji: '💼' },
  cold_call: { label: 'Llamada en frío', emoji: '📞' },
  event: { label: 'Evento', emoji: '📅' },
  partner: { label: 'Partner', emoji: '🤝' },
  lead_conversion: { label: 'Conversión Lead', emoji: '🔄' },
  other: { label: 'Otro', emoji: '📋' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency,
    maximumFractionDigits: 0 
  }).format(value);
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  usePageTitle('Detalle de Negociación');

  const { data: deal, isLoading, error } = useCRMDeal(id);
  const { data: pipelines = [] } = useCRMPipelines();
  const updateDeal = useUpdateCRMDealDetail();
  const updateDealStage = useUpdateDealStage();

  // Get stages for this deal's pipeline
  const pipeline = pipelines.find(p => p.id === deal?.pipeline_id);
  const stages = pipeline?.stages || [];

  // Handle stage change from progress bar
  const handleStageChange = async (newStageId: string) => {
    if (!deal) return;
    const stage = stages.find(s => s.id === newStageId);
    if (!stage) return;
    
    // Don't allow changing to won/lost via progress bar - use buttons
    if (stage.is_won_stage || stage.is_lost_stage) return;

    await updateDealStage.mutateAsync({
      dealId: deal.id,
      newStageId: newStageId,
    });
  };

  if (isLoading) {
    return <DealDetailSkeleton />;
  }

  if (error || !deal) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Negociación no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información de la negociación.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sourceInfo = SOURCE_CONFIG[deal.source || 'other'] || SOURCE_CONFIG.other;
  const opportunityInfo = deal.opportunity_type 
    ? OPPORTUNITY_TYPE_CONFIG[deal.opportunity_type] 
    : null;

  // Calculate weighted value
  const probability = deal.stage_info?.probability ?? deal.probability ?? 50;
  const weightedValue = deal.amount ? Math.round((deal.amount * probability) / 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Sticky */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <Card className="rounded-none border-x-0 border-t-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Left: Back + Avatar + Info */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(deal.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">
                      {deal.name}
                    </h1>
                    {opportunityInfo && (
                      <Badge className={cn("font-normal", opportunityInfo.color)}>
                        {opportunityInfo.label}
                      </Badge>
                    )}
                    {deal.won === true && (
                      <Badge className="bg-emerald-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ganado
                      </Badge>
                    )}
                    {deal.won === false && (
                      <Badge className="bg-red-500 text-white">
                        <XCircle className="w-3 h-3 mr-1" />
                        Perdido
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {deal.account && (
                      <button
                        className="flex items-center gap-1 hover:text-primary hover:underline"
                        onClick={() => navigate(`/app/crm/clients/${deal.account?.id}`)}
                      >
                        <Building2 className="w-3 h-3" />
                        {deal.account.name}
                      </button>
                    )}
                    {deal.assigned_user && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {deal.assigned_user.full_name || 'Sin asignar'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Creado {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Value + Actions */}
              <div className="flex items-center gap-4">
                {deal.amount && deal.amount > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(deal.amount, deal.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ponderado: {formatCurrency(weightedValue, deal.currency)} ({probability}%)
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1" />
                    Llamar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  {deal.won === true && (
                    <Button variant="default" size="sm">
                      <FolderPlus className="w-4 h-4 mr-1" />
                      Crear Expediente
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Progress Bar */}
        {stages.length > 0 && deal.stage_id && (
          <div className="bg-muted/30 border-b px-4 py-2">
            <PipelineProgressBar
              stages={stages}
              currentStageId={deal.stage_id}
              onStageClick={handleStageChange}
            />
          </div>
        )}
      </div>

      {/* MAIN CONTENT: 50/50 Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 50% - Form with Tabs */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="p-6">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="w-4 h-4 mr-1" />
                  Actividad
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <ListTodo className="w-4 h-4 mr-1" />
                  Tareas
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="w-4 h-4 mr-1" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              {/* TAB: GENERAL */}
              <TabsContent value="general" className="space-y-3">
                {/* Cliente Vinculado */}
                <CollapsibleSection
                  title="Cliente Vinculado"
                  icon={<Building2 className="w-4 h-4" />}
                  actions={
                    deal.account && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2"
                        onClick={() => navigate(`/app/crm/clients/${deal.account?.id}`)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )
                  }
                >
                  <div className="pt-2">
                    {deal.account ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {getInitials(deal.account.name || 'C')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{deal.account.name}</p>
                          {deal.account.tier && (
                            <p className="text-xs text-muted-foreground">{deal.account.tier}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/app/crm/clients/${deal.account?.id}`)}
                        >
                          Ver cliente
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Vincular cliente
                        </Button>
                        <Button variant="outline" size="sm">
                          Crear cliente
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Contacto */}
                {deal.contact && (
                  <CollapsibleSection
                    title="Contacto Principal"
                    icon={<User className="w-4 h-4" />}
                  >
                    <div className="pt-2">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="text-sm">
                            {getInitials(deal.contact.full_name || 'C')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{deal.contact.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {deal.contact.email && (
                              <a href={`mailto:${deal.contact.email}`} className="hover:text-primary">
                                {deal.contact.email}
                              </a>
                            )}
                            {deal.contact.phone && (
                              <a href={`tel:${deal.contact.phone}`} className="hover:text-primary">
                                {deal.contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                )}

                {/* Valor y Probabilidad */}
                <CollapsibleSection
                  title="Valor y Probabilidad"
                  icon={<DollarSign className="w-4 h-4" />}
                  badge={
                    deal.amount ? (
                      <Badge variant="outline" className="h-5 text-xs ml-2">
                        {formatCurrency(deal.amount, deal.currency)}
                      </Badge>
                    ) : undefined
                  }
                >
                  <div className="pt-2 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">
                          {deal.amount ? formatCurrency(deal.amount, deal.currency) : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold flex items-center justify-center gap-1">
                          {probability}
                          <Percent className="w-5 h-5 text-muted-foreground" />
                        </p>
                        <p className="text-xs text-muted-foreground">Probabilidad</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(weightedValue, deal.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">Valor Ponderado</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Datos Comerciales */}
                <CollapsibleSection
                  title="Datos Comerciales"
                  icon={<Target className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origen</span>
                      <span className="font-medium">{sourceInfo.emoji} {sourceInfo.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pipeline</span>
                      <span className="font-medium">{pipeline?.name || 'Sin pipeline'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Etapa</span>
                      <span className="font-medium flex items-center gap-1">
                        {deal.stage_info && (
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: deal.stage_info.color }}
                          />
                        )}
                        {deal.stage_info?.name || deal.stage || 'Sin etapa'}
                      </span>
                    </div>
                    {deal.expected_close_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cierre Estimado</span>
                        <span className="font-medium">
                          {format(new Date(deal.expected_close_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                    {deal.actual_close_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha Cierre Real</span>
                        <span className="font-medium">
                          {format(new Date(deal.actual_close_date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Próximo Paso */}
                <CollapsibleSection
                  title="Próximo Paso"
                  icon={<Clock className="w-4 h-4" />}
                  defaultOpen={!!deal.next_step}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                >
                  <div className="pt-2">
                    {deal.next_step ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{deal.next_step}</p>
                        {deal.next_step_date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📅 {format(new Date(deal.next_step_date), "PPP 'a las' HH:mm", { locale: es })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin próximo paso programado</p>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Lost Reason */}
                {deal.won === false && deal.lost_reason && (
                  <CollapsibleSection
                    title="Motivo de Pérdida"
                    icon={<XCircle className="w-4 h-4 text-red-500" />}
                    defaultOpen={true}
                  >
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                      <p className="font-medium text-red-700 dark:text-red-400">
                        {deal.lost_reason}
                      </p>
                      {deal.lost_to_competitor && (
                        <p className="text-muted-foreground mt-1">
                          Perdido ante: {deal.lost_to_competitor}
                        </p>
                      )}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Descripción / Notas */}
                <CollapsibleSection
                  title="Descripción"
                  icon={<PenLine className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                  defaultOpen={!!(deal.description || deal.notes)}
                >
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {deal.description || deal.notes || 'Sin descripción. Haz clic en editar para añadir.'}
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Tags */}
                {deal.tags && deal.tags.length > 0 && (
                  <CollapsibleSection
                    title="Etiquetas"
                    icon={<Tag className="w-4 h-4" />}
                    defaultOpen={false}
                  >
                    <div className="flex flex-wrap gap-2 pt-2">
                      {deal.tags.map((tag, i) => (
                        <Badge key={i} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </TabsContent>

              {/* TAB: ACTIVITY */}
              <TabsContent value="activity" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>El historial de actividades aparecerá aquí</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Añadir nota
                  </Button>
                </div>
              </TabsContent>

              {/* TAB: TASKS */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Las tareas relacionadas aparecerán aquí</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <ListTodo className="w-4 h-4 mr-1" />
                    Crear tarea
                  </Button>
                </div>
              </TabsContent>

              {/* TAB: DOCUMENTS */}
              <TabsContent value="documents" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Los documentos adjuntos aparecerán aquí</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <FileText className="w-4 h-4 mr-1" />
                    Subir documento
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - 50% - Timeline/Activity */}
        <div className="w-1/2 overflow-y-auto bg-muted/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Timeline
              </h2>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-1" />
                Añadir
              </Button>
            </div>

            {/* Mock Timeline Items */}
            <div className="space-y-3">
              <TimelineItem
                type="system"
                title="Deal creado"
                description={`Por ${deal.assigned_user?.full_name || 'Sistema'}`}
                time={deal.created_at}
              />
              {deal.stage_history && Array.isArray(deal.stage_history) && deal.stage_history.length > 0 && (
                deal.stage_history.slice(-3).reverse().map((entry: any, idx) => (
                  <TimelineItem
                    key={idx}
                    type="system"
                    title={`Movido a "${entry.stage}"`}
                    description={entry.days_in_stage ? `${entry.days_in_stage} días en etapa anterior` : ''}
                    time={entry.exited_at || entry.entered_at}
                  />
                ))
              )}
              {deal.updated_at !== deal.created_at && (
                <TimelineItem
                  type="system"
                  title="Deal actualizado"
                  description="Última modificación"
                  time={deal.updated_at}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
function DealDetailSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <Card className="rounded-none border-x-0 border-t-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="bg-muted/30 border-b px-4 py-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="w-1/2 p-6 bg-muted/20 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
