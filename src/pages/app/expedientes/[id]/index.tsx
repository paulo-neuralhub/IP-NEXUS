// ============================================================
// IP-NEXUS - Matter Detail Page (Matters V2)
// ============================================================

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Pencil, MoreHorizontal, Trash2, Archive,
  Tag, Clock, Building2, User, FileText, Users, History,
  Mail, Phone, Calendar, CheckSquare, Receipt, FolderOpen,
  ExternalLink, MessageSquare
} from 'lucide-react';
import { useMatterV2, useMatterFilings, useMatterTimeline, useMatterParties, useMatterTypes } from '@/hooks/use-matters-v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePageTitle } from '@/contexts/page-context';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MatterDocumentsTab } from '@/components/matters/MatterDocumentsTab';
import { MatterDeadlinesTab } from '@/components/matters/MatterDeadlinesTab';
import { MatterTasksTab } from '@/components/matters/MatterTasksTab';
import { MatterInvoicesTab } from '@/components/matters/MatterInvoicesTab';
import { MatterCommunicationsTab } from '@/components/matters/MatterCommunicationsTab';
import { EmailComposeModal } from '@/components/matters/EmailComposeModal';
import { LogCallModal } from '@/components/matters/LogCallModal';
import { MatterChatModal } from '@/components/matters/MatterChatModal';
import { WorkflowProgressBar } from '@/components/features/matters/WorkflowProgressBar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  filed: { label: 'Presentado', color: 'bg-blue-100 text-blue-700' },
  published: { label: 'Publicado', color: 'bg-purple-100 text-purple-700' },
  granted: { label: 'Concedido', color: 'bg-green-100 text-green-700' },
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
  opposed: { label: 'En oposición', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-500' },
  abandoned: { label: 'Abandonado', color: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function MatterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  
  const { data: matter, isLoading, error } = useMatterV2(id!);
  const { data: filings } = useMatterFilings(id!);
  const { data: timeline } = useMatterTimeline(id!);
  const { data: parties } = useMatterParties(id!);
  const { data: matterTypes } = useMatterTypes();
  
  usePageTitle(matter?.matter_number || 'Expediente');
  
  // Handler para abrir WhatsApp modal contextual
  const handleWhatsApp = () => {
    setShowWhatsAppModal(true);
  };
  
  // Handler para click-to-call
  const handleCall = () => {
    if (window.softphoneCall && matter?.client_name) {
      // Si hay teléfono del cliente, llamar
      // Por ahora solo abrimos el modal de log
      setShowCallModal(true);
    } else {
      setShowCallModal(true);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (error || !matter) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar el expediente</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/expedientes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const typeConfig = matterTypes?.find(t => t.code === matter.matter_type) || {
    name_es: matter.matter_type,
    color: '#6B7280',
    icon: 'File'
  };
  const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.draft;
  
  return (
    <div className="p-6 space-y-6">
      {/* Workflow Progress Bar - Metro Map */}
      <WorkflowProgressBar
        currentPhase={(matter as any).current_phase || 'F0'}
        phaseHistory={(matter as any).phase_history || []}
        className="mb-4"
      />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/expedientes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{matter.matter_number}</h1>
              <Badge 
                variant="outline"
                style={{ 
                  backgroundColor: `${typeConfig.color}20`,
                  color: typeConfig.color,
                  borderColor: `${typeConfig.color}40`
                }}
              >
                {typeConfig.name_es}
              </Badge>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
              {matter.is_urgent && (
                <Badge variant="destructive">Urgente</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground mt-1">{matter.title}</p>
            {/* Client link */}
            {matter.client_id && matter.client_name && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Link 
                  to={`/app/crm/clients/${matter.client_id}`}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {matter.client_name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="flex items-center gap-1 mr-2 border-r pr-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowEmailModal(true)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar Email</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleWhatsApp}
                  className="text-[#25D366] hover:bg-[#25D366]/10"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>WhatsApp</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleCall}
                  className="text-success hover:bg-success/10"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Llamar</TooltipContent>
            </Tooltip>
          </div>
          
          <Button variant="outline" onClick={() => navigate(`/app/expedientes/${id}/editar`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archivar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general" className="gap-2">
            <FileText className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="filings" className="gap-2">
            <Building2 className="h-4 w-4" />
            Presentaciones ({filings?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="parties" className="gap-2">
            <Users className="h-4 w-4" />
            Partes ({parties?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="gap-2">
            <Calendar className="h-4 w-4" />
            Plazos
          </TabsTrigger>
          <TabsTrigger value="communications" className="gap-2">
            <Mail className="h-4 w-4" />
            Comunicaciones
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <History className="h-4 w-4" />
            Timeline ({timeline?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Información del Derecho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matter.mark_name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marca</label>
                    <p className="text-lg font-semibold">{matter.mark_name}</p>
                  </div>
                )}
                {matter.invention_title && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Título de invención</label>
                    <p className="text-lg">{matter.invention_title}</p>
                  </div>
                )}
                {matter.nice_classes && matter.nice_classes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clases Nice</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {matter.nice_classes.map(c => (
                        <Badge key={c} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {matter.goods_services && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Productos/Servicios</label>
                    <p className="text-sm mt-1">{matter.goods_services}</p>
                  </div>
                )}
                {matter.internal_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notas internas</label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{matter.internal_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Fechas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creado</span>
                    <span>{format(new Date(matter.created_at), 'dd/MM/yyyy')}</span>
                  </div>
                  {matter.instruction_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instrucción</span>
                      <span>{format(new Date(matter.instruction_date), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                  {matter.priority_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioridad</span>
                      <span>{format(new Date(matter.priority_date), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Costs */}
              {(matter.estimated_official_fees || matter.estimated_professional_fees) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Costes estimados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {matter.estimated_official_fees && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tasas oficiales</span>
                        <span>{matter.estimated_official_fees.toLocaleString('es-ES')} {matter.currency}</span>
                      </div>
                    )}
                    {matter.estimated_professional_fees && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Honorarios</span>
                        <span>{matter.estimated_professional_fees.toLocaleString('es-ES')} {matter.currency}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Tags */}
              {matter.tags && matter.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Etiquetas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {matter.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Filings Tab */}
        <TabsContent value="filings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Presentaciones por Jurisdicción</CardTitle>
              <Button size="sm">
                Añadir presentación
              </Button>
            </CardHeader>
            <CardContent>
              {!filings?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay presentaciones registradas
                </p>
              ) : (
                <div className="space-y-4">
                  {filings.map(filing => (
                    <div key={filing.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {filing.jurisdiction_code}
                          </Badge>
                          <Badge className={STATUS_CONFIG[filing.status]?.color || 'bg-gray-100'}>
                            {STATUS_CONFIG[filing.status]?.label || filing.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {filing.application_number && (
                          <div>
                            <span className="text-muted-foreground">Nº Solicitud</span>
                            <p className="font-medium">{filing.application_number}</p>
                          </div>
                        )}
                        {filing.registration_number && (
                          <div>
                            <span className="text-muted-foreground">Nº Registro</span>
                            <p className="font-medium">{filing.registration_number}</p>
                          </div>
                        )}
                        {filing.filing_date && (
                          <div>
                            <span className="text-muted-foreground">Fecha presentación</span>
                            <p>{format(new Date(filing.filing_date), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                        {filing.expiry_date && (
                          <div>
                            <span className="text-muted-foreground">Vencimiento</span>
                            <p>{format(new Date(filing.expiry_date), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parties Tab */}
        <TabsContent value="parties">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partes del Expediente</CardTitle>
              <Button size="sm">
                Añadir parte
              </Button>
            </CardHeader>
            <CardContent>
              {!parties?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay partes registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {parties.map(party => (
                    <div key={party.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{party.name}</p>
                          <p className="text-sm text-muted-foreground">{party.company}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{party.party_role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <MatterDocumentsTab matterId={id!} />
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines">
          <MatterDeadlinesTab matterId={id!} />
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <MatterCommunicationsTab 
            matterId={id!} 
            matterTitle={matter.title}
            clientId={matter.client_id}
          />
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <MatterTasksTab matterId={id!} />
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <MatterInvoicesTab matterId={id!} clientId={matter.client_id} />
        </TabsContent>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              {!timeline?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  Sin actividad registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event, index) => {
                    // Determine tab to open based on event type
                    const getEventTab = (): string | null => {
                      const type = event.event_type?.toLowerCase() || '';
                      
                      // Email/Communication events -> Communications tab
                      if (type.includes('email') || type.includes('whatsapp') || type.includes('call') || type.includes('phone') || type.includes('communication')) {
                        return 'communications';
                      }
                      // Document events -> Documents tab
                      if (type.includes('document')) {
                        return 'documents';
                      }
                      // Filing events -> Filings tab
                      if (type === 'filing' || type.includes('presentation') || type.includes('solicitud')) {
                        return 'filings';
                      }
                      // Deadline/Plazo events -> Deadlines tab
                      if (type.includes('deadline') || type.includes('plazo') || type.includes('vencimiento') || type.includes('renovación') || type.includes('renewal')) {
                        return 'deadlines';
                      }
                      // Invoice/Finance events -> Invoices tab
                      if (type.includes('invoice') || type.includes('payment') || type.includes('factura') || type.includes('pago')) {
                        return 'invoices';
                      }
                      // Task events -> Tasks tab
                      if (type.includes('task') || type.includes('tarea')) {
                        return 'tasks';
                      }
                      // Party events -> Parties tab
                      if (type.includes('party') || type.includes('parte') || type.includes('titular') || type.includes('representante')) {
                        return 'parties';
                      }
                      return null;
                    };
                    
                    const targetTab = getEventTab();
                    const isClickable = !!targetTab;
                    
                    const getEventIcon = () => {
                      const type = event.event_type?.toLowerCase() || '';
                      if (type.includes('email')) return '✉️';
                      if (type.includes('whatsapp')) return '💬';
                      if (type.includes('call') || type.includes('phone')) return '📞';
                      if (type.includes('document') || type === 'filing') return '📄';
                      if (type.includes('deadline') || type.includes('plazo')) return '📅';
                      if (type.includes('notification') || type.includes('alert')) return '🔔';
                      if (type.includes('invoice') || type.includes('payment')) return '💰';
                      if (type.includes('status') || type.includes('grant')) return '✅';
                      if (type.includes('examination')) return '🔍';
                      if (type.includes('receipt')) return '📨';
                      if (type.includes('note')) return '📝';
                      if (type.includes('task') || type.includes('tarea')) return '✅';
                      if (type.includes('party') || type.includes('parte')) return '👤';
                      return '📌';
                    };
                    
                    const handleEventClick = () => {
                      if (targetTab) {
                        setActiveTab(targetTab);
                        // Scroll to top after changing tab
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    };
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`flex gap-4 ${isClickable ? 'cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                        onClick={handleEventClick}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                      >
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                            {getEventIcon()}
                          </div>
                          {index < timeline.length - 1 && (
                            <div className="w-px h-full bg-border flex-1 mt-2" />
                          )}
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-medium ${isClickable ? 'text-primary hover:underline' : ''}`}>
                              {event.title}
                            </p>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(event.event_date), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                          {isClickable && (
                            <p className="text-xs text-primary/70 mt-2">
                              Clic para ir a {targetTab === 'deadlines' ? 'Plazos' : 
                                             targetTab === 'documents' ? 'Documentos' :
                                             targetTab === 'communications' ? 'Comunicaciones' :
                                             targetTab === 'invoices' ? 'Facturas' :
                                             targetTab === 'tasks' ? 'Tareas' :
                                             targetTab === 'filings' ? 'Presentaciones' :
                                             targetTab === 'parties' ? 'Partes' : targetTab} →
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Modals */}
      <EmailComposeModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        matterId={id!}
        matterTitle={matter?.title}
        recipientEmail={undefined}
        recipientName={matter?.client_name || undefined}
      />
      
      <LogCallModal
        open={showCallModal}
        onOpenChange={setShowCallModal}
        matterId={id!}
        contactName={matter?.client_name || undefined}
      />
      
      <MatterChatModal
        open={showWhatsAppModal}
        onOpenChange={setShowWhatsAppModal}
        matterId={id!}
        matterTitle={matter?.title}
        matterReference={matter?.matter_number}
        clientId={matter?.client_id}
        clientName={matter?.client_name}
        clientPhone={matter?.client_phone}
        clientEmail={matter?.client_email}
      />
    </div>
  );
}
