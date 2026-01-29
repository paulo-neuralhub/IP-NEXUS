/**
 * LeadDetailPage - Página de detalle de Lead con layout 50/50
 * Similar a Client360Page pero con campos específicos de Lead
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useCRMLead, useUpdateCRMLead } from '@/hooks/crm/v2/lead';
import { useCRMPipelines, CRMPipelineStage } from '@/hooks/crm/v2/pipelines';
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
import {
  Building2, Mail, Phone, Calendar, User,
  AlertTriangle, ArrowLeft, Edit, Tag,
  MessageSquare, DollarSign, Target, Clock,
  CheckCircle, XCircle, PenLine, Sparkles,
  FileText, ListTodo, Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Source config for display
const SOURCE_CONFIG: Record<string, { label: string; emoji: string }> = {
  web: { label: 'Sitio Web', emoji: '🌐' },
  referral: { label: 'Referido', emoji: '👥' },
  linkedin: { label: 'LinkedIn', emoji: '💼' },
  cold_call: { label: 'Llamada en frío', emoji: '📞' },
  event: { label: 'Evento', emoji: '📅' },
  partner: { label: 'Partner', emoji: '🤝' },
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(value);
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  usePageTitle('Detalle de Lead');

  const { data: lead, isLoading, error } = useCRMLead(id);
  const { data: pipelines = [] } = useCRMPipelines();
  const updateLead = useUpdateCRMLead();

  // Get stages for this lead's pipeline
  const pipeline = pipelines.find(p => p.id === lead?.pipeline_id);
  const stages = pipeline?.stages || [];

  // Handle stage change from progress bar
  const handleStageChange = async (newStageId: string) => {
    if (!lead) return;
    const stage = stages.find(s => s.id === newStageId);
    if (!stage) return;
    
    // Don't allow changing to won/lost via progress bar - use buttons
    if (stage.is_won_stage || stage.is_lost_stage) return;

    await updateLead.mutateAsync({
      id: lead.id,
      stage_id: newStageId,
    });
  };

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Lead no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información del lead.
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

  const sourceInfo = SOURCE_CONFIG[lead.source || 'other'] || SOURCE_CONFIG.other;

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
                    {getInitials(lead.contact_name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">
                      {lead.title || lead.contact_name}
                    </h1>
                    {lead.company_name && (
                      <Badge variant="outline" className="font-normal">
                        <Building2 className="w-3 h-3 mr-1" />
                        {lead.company_name}
                      </Badge>
                    )}
                    <Badge 
                      variant={lead.status === 'converted' ? 'default' : 'secondary'}
                      className={cn(
                        lead.status === 'converted' && 'bg-emerald-500',
                        lead.status === 'standby' && 'bg-amber-500'
                      )}
                    >
                      {lead.status === 'new' ? 'Nuevo' : 
                       lead.status === 'contacted' ? 'Contactado' :
                       lead.status === 'standby' ? 'Stand By' :
                       lead.status === 'converted' ? 'Convertido' : lead.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {lead.assigned_user && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {lead.assigned_user.full_name || 'Sin asignar'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Creado {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="flex items-center gap-3">
                {lead.estimated_value && lead.estimated_value > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(lead.estimated_value)}
                    </p>
                    <p className="text-xs text-muted-foreground">Valor estimado</p>
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
                  <Button variant="default" size="sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Convertir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Progress Bar */}
        {stages.length > 0 && lead.stage_id && (
          <div className="bg-muted/30 border-b px-4 py-2">
            <PipelineProgressBar
              stages={stages}
              currentStageId={lead.stage_id}
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
                {/* Datos de Contacto */}
                <CollapsibleSection
                  title="Datos de Contacto"
                  icon={<User className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre</span>
                      <span className="font-medium">{lead.contact_name}</span>
                    </div>
                    {lead.contact_email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <a href={`mailto:${lead.contact_email}`} className="font-medium text-primary hover:underline">
                          {lead.contact_email}
                        </a>
                      </div>
                    )}
                    {lead.contact_phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono</span>
                        <a href={`tel:${lead.contact_phone}`} className="font-medium hover:underline">
                          {lead.contact_phone}
                        </a>
                      </div>
                    )}
                    {lead.company_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empresa</span>
                        <span className="font-medium">{lead.company_name}</span>
                      </div>
                    )}
                    {lead.company_tax_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CIF/NIF</span>
                        <span className="font-medium">{lead.company_tax_id}</span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Datos Comerciales */}
                <CollapsibleSection
                  title="Datos Comerciales"
                  icon={<Target className="w-4 h-4" />}
                  badge={
                    lead.estimated_value ? (
                      <Badge variant="outline" className="h-5 text-xs ml-2">
                        {formatCurrency(lead.estimated_value)}
                      </Badge>
                    ) : undefined
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
                        {lead.stage && (
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: lead.stage.color }}
                          />
                        )}
                        {lead.stage?.name || 'Sin etapa'}
                      </span>
                    </div>
                    {lead.stage?.probability !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Probabilidad</span>
                        <span className="font-medium">{lead.stage.probability}%</span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Intereses */}
                {lead.interested_in && lead.interested_in.length > 0 && (
                  <CollapsibleSection
                    title="Intereses"
                    icon={<Tag className="w-4 h-4" />}
                    badge={
                      <Badge variant="secondary" className="h-5 text-xs ml-2">
                        {lead.interested_in.length}
                      </Badge>
                    }
                  >
                    <div className="flex flex-wrap gap-2 pt-2">
                      {lead.interested_in.map((interest, i) => (
                        <Badge key={i} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Próxima Acción */}
                <CollapsibleSection
                  title="Próxima Acción"
                  icon={<Clock className="w-4 h-4" />}
                  defaultOpen={!!lead.next_action}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                >
                  <div className="pt-2">
                    {lead.next_action ? (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-medium">{lead.next_action}</p>
                        {lead.next_action_date && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📅 {format(new Date(lead.next_action_date), "PPP 'a las' HH:mm", { locale: es })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin próxima acción programada</p>
                    )}
                  </div>
                </CollapsibleSection>

                {/* Stand By Info */}
                {lead.status === 'standby' && lead.standby_until && (
                  <CollapsibleSection
                    title="Stand By"
                    icon={<Clock className="w-4 h-4 text-amber-500" />}
                    badge={
                      <Badge variant="outline" className="h-5 text-xs ml-2 border-amber-500 text-amber-600">
                        Hasta {format(new Date(lead.standby_until), 'dd/MM/yyyy')}
                      </Badge>
                    }
                  >
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-400">
                        Reactivación: {format(new Date(lead.standby_until), "PPP", { locale: es })}
                      </p>
                      {lead.standby_reason && (
                        <p className="text-muted-foreground mt-1">{lead.standby_reason}</p>
                      )}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Notas Internas */}
                <CollapsibleSection
                  title="Notas Internas"
                  icon={<PenLine className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                  defaultOpen={!!lead.notes}
                >
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {lead.notes || 'Sin notas internas. Haz clic en editar para añadir.'}
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                  <CollapsibleSection
                    title="Etiquetas"
                    icon={<Tag className="w-4 h-4" />}
                    defaultOpen={false}
                  >
                    <div className="flex flex-wrap gap-2 pt-2">
                      {lead.tags.map((tag, i) => (
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
                title="Lead creado"
                description={`Por ${lead.assigned_user?.full_name || 'Sistema'}`}
                time={lead.created_at}
              />
              {lead.updated_at !== lead.created_at && (
                <TimelineItem
                  type="system"
                  title="Lead actualizado"
                  description="Última modificación"
                  time={lead.updated_at}
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
function LeadDetailSkeleton() {
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
