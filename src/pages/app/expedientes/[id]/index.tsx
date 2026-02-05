// ============================================================
// IP-NEXUS - Matter Detail Page (Premium Redesign L119)
// Full-width hero header + 2/3 main + 1/3 sidebar layout
// ============================================================

import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Tag, Clock, Building2, User, FileText, Users, History,
  Mail, Calendar, CheckSquare, Receipt, FolderOpen, Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMatterV2, useMatterFilings, useMatterTimeline, useMatterParties, useMatterTypes, useDeleteMatterV2 } from '@/hooks/use-matters-v2';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { AddNoteModal } from '@/components/matters/AddNoteModal';
import { ScheduleMeetingModal } from '@/components/matters/ScheduleMeetingModal';
import { TimelineProfesional } from '@/components/matters/TimelineProfesional';
import { SendWhatsAppFromMatterModal } from '@/components/matters/SendWhatsAppFromMatterModal';
import { MatterChatModal } from '@/components/matters/MatterChatModal';
import { AddFilingModal } from '@/components/matters/AddFilingModal';
import { FilingDetailModal } from '@/components/matters/FilingDetailModal';
import { AddPartyModal } from '@/components/matters/AddPartyModal';
import { MatterDetailHeader } from '@/components/matters/MatterDetailHeader';
import { MatterDetailSidebar } from '@/components/matters/MatterDetailSidebar';
import { MatterRightsInfoCard } from '@/components/matters/MatterRightsInfoCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCommunication } from '@/hooks/legal-ops/useCommunications';

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
  const { currentOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState('general');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showFilingModal, setShowFilingModal] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState<any>(null);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTimelineCommId, setSelectedTimelineCommId] = useState<string | null>(null);
  
  const deleteMatter = useDeleteMatterV2();
  
  const { data: matter, isLoading, error } = useMatterV2(id!);
  const { data: filings } = useMatterFilings(id!);
  const { data: timeline } = useMatterTimeline(id!);
  const { data: parties } = useMatterParties(id!);
  const { data: matterTypes } = useMatterTypes();
  
  // Fetch selected communication for timeline sheet
  const { data: selectedTimelineComm, isLoading: isLoadingTimelineComm } = useCommunication(selectedTimelineCommId || '');
  
  usePageTitle(matter?.matter_number || 'Expediente');

  // Fetch stats for sidebar
  const { data: stats } = useQuery({
    queryKey: ['matter-stats', id, currentOrganization?.id],
    queryFn: async () => {
      if (!id || !currentOrganization?.id) return null;
      
      const [docsRes, tasksRes, invoicesRes] = await Promise.all([
        supabase.from('matter_documents').select('id', { count: 'exact' }).eq('matter_id', id),
        supabase.from('matter_tasks').select('id, status').eq('matter_id', id),
        supabase.from('invoices').select('id, total, status').eq('matter_id', id),
      ]);

      const tareasPendientes = tasksRes.data?.filter((t: any) => t.status === 'pending' || t.status === 'in_progress').length || 0;
      const facturado = invoicesRes.data?.filter((i: any) => i.status === 'paid').reduce((acc: number, i: any) => acc + (i.total || 0), 0) || 0;
      const pendienteCobro = invoicesRes.data?.filter((i: any) => i.status !== 'paid').reduce((acc: number, i: any) => acc + (i.total || 0), 0) || 0;

      return {
        documentos: docsRes.count || 0,
        comunicaciones: timeline?.filter(t => t.event_type?.includes('email') || t.event_type?.includes('call')).length || 0,
        tareas: tasksRes.data?.length || 0,
        tareasPendientes,
        facturado,
        pendienteCobro
      };
    },
    enabled: !!id && !!currentOrganization?.id,
  });
  
  // Handler para click-to-call
  const handleCall = () => {
    setShowCallModal(true);
  };
  
  // Handler para eliminar expediente
  const handleDelete = async () => {
    try {
      await deleteMatter.mutateAsync(id!);
      toast.success('Expediente eliminado');
      navigate('/app/expedientes');
    } catch (error) {
      toast.error('Error al eliminar expediente');
    }
  };
  
  if (isLoading) {
    return <MatterDetailSkeleton />;
  }
  
  if (error || !matter) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Error al cargar el expediente</p>
            <Button variant="outline" onClick={() => navigate('/app/expedientes')}>
              Volver a expedientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lastActivityDate = timeline?.[0]?.event_date;
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Premium Header with Gradient + Metro Workflow */}
      <MatterDetailHeader
        matter={matter}
        onEmailClick={() => setShowEmailModal(true)}
        onWhatsAppClick={() => setShowWhatsAppModal(true)}
        onCallClick={handleCall}
        onDeleteClick={() => setShowDeleteDialog(true)}
      />

      {/* Main Content Area: 2/3 + 1/3 Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* SILK Tabs - Professional style without overlap */}
              <div 
                className="mb-4 overflow-x-auto"
                style={{
                  padding: '4px',
                  borderRadius: '14px',
                  background: '#f1f4f9',
                  boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
                }}
              >
                <TabsList className="bg-transparent border-0 flex flex-wrap gap-1 h-auto p-0">
                  <TabsTrigger 
                    value="general" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <FileText className="h-4 w-4" />
                    General
                    <span 
                      className="absolute bottom-1 left-1/3 right-1/3 h-0.5 rounded-full data-[state=active]:opacity-100 opacity-0" 
                      style={{ 
                        background: 'linear-gradient(90deg, #00b4d8, #00d4aa)',
                        display: activeTab === 'general' ? 'block' : 'none'
                      }} 
                    />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="filings" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <Building2 className="h-4 w-4" />
                    Presentaciones
                    {filings && filings.length > 0 && (
                      <span 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #f1f4f9, #e8ebf0)',
                          color: '#64748b',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {filings.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="parties" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <Users className="h-4 w-4" />
                    Partes
                    {parties && parties.length > 0 && (
                      <span 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #f1f4f9, #e8ebf0)',
                          color: '#64748b',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {parties.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Documentos
                    {stats?.documentos ? (
                      <span 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #f1f4f9, #e8ebf0)',
                          color: '#64748b',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {stats.documentos}
                      </span>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="deadlines" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <Calendar className="h-4 w-4" />
                    Plazos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="communications" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <Mail className="h-4 w-4" />
                    Comunicaciones
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Tareas
                    {stats?.tareasPendientes ? (
                      <span 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs font-bold rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        {stats.tareasPendientes}
                      </span>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="invoices" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <Receipt className="h-4 w-4" />
                    Facturas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-500 hover:text-slate-700 transition-all relative"
                  >
                    <History className="h-4 w-4" />
                    Timeline
                    {timeline && timeline.length > 0 && (
                      <span 
                        className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'linear-gradient(135deg, #f1f4f9, #e8ebf0)',
                          color: '#64748b',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        {timeline.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4">
                {/* Rights Info Card - Now with trademark type support */}
                <MatterRightsInfoCard matter={matter} />

                {/* Recent Timeline Preview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Actividad Reciente
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('timeline')}>
                      Ver todo
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {!timeline?.length ? (
                      <p className="text-muted-foreground text-center py-4">
                        Sin actividad registrada
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {timeline.slice(0, 5).map((event) => (
                          <div key={event.id} className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0">
                              {getEventIcon(event.event_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.event_date), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Filings Tab */}
              <TabsContent value="filings">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Presentaciones por Jurisdicción</CardTitle>
                    <Button size="sm" onClick={() => setShowFilingModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir
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
                          <div 
                            key={filing.id} 
                            className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setSelectedFiling(filing)}
                          >
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
                    <Button size="sm" onClick={() => setShowPartyModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir
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
                                {party.company && <p className="text-sm text-muted-foreground">{party.company}</p>}
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

              {/* Timeline Tab - Professional style */}
              <TabsContent value="timeline">
                <TimelineProfesional 
                  matterId={id!} 
                  maxHeight="700px"
                  onOpenCommunication={(commId) => setSelectedTimelineCommId(commId)}
                  onOpenDocument={async (docId, filePath) => {
                    if (filePath) {
                      const { data } = await supabase.storage
                        .from('matter-documents')
                        .createSignedUrl(filePath, 3600);
                      if (data?.signedUrl) {
                        window.open(data.signedUrl, '_blank');
                      }
                    } else {
                      setActiveTab('documents');
                    }
                  }}
                  onOpenTask={() => setActiveTab('tasks')}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="lg:col-span-1">
            <MatterDetailSidebar
              matter={matter}
              stats={stats || undefined}
              lastActivityDate={lastActivityDate}
              onEmailClick={() => setShowEmailModal(true)}
              onWhatsAppClick={() => setShowWhatsAppModal(true)}
              onCallClick={handleCall}
              onAddDeadline={() => setActiveTab('deadlines')}
              onUploadDocument={() => setActiveTab('documents')}
              onNewInvoice={() => setActiveTab('invoices')}
            />
          </div>
        </div>
      </div>

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
      
      <AddNoteModal
        open={showNoteModal}
        onOpenChange={setShowNoteModal}
        matterId={id!}
        matterReference={matter?.matter_number}
      />
      
      <ScheduleMeetingModal
        open={showMeetingModal}
        onOpenChange={setShowMeetingModal}
        matterId={id!}
        matterReference={matter?.matter_number}
      />
      
      <AddFilingModal
        open={showFilingModal}
        onOpenChange={setShowFilingModal}
        matterId={id!}
      />
      
      {selectedFiling && (
        <FilingDetailModal
          open={!!selectedFiling}
          onOpenChange={(open) => !open && setSelectedFiling(null)}
          filing={selectedFiling}
        />
      )}
      
      <AddPartyModal
        open={showPartyModal}
        onOpenChange={setShowPartyModal}
        matterId={id!}
        matterType={matter?.matter_type}
      />
      
      {/* Timeline Communication Sheet */}
      <Sheet open={!!selectedTimelineCommId} onOpenChange={(open) => !open && setSelectedTimelineCommId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              {selectedTimelineComm?.channel === 'email' && <Mail className="h-4 w-4" />}
              {selectedTimelineComm?.channel === 'whatsapp' && '💬'}
              {selectedTimelineComm?.channel === 'phone' && '📞'}
              {selectedTimelineComm?.subject || 'Comunicación'}
            </SheetTitle>
          </SheetHeader>
          
          {isLoadingTimelineComm ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : selectedTimelineComm ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedTimelineComm.channel?.toUpperCase()}
                  </Badge>
                  <Badge variant={selectedTimelineComm.direction === 'inbound' ? 'secondary' : 'outline'}>
                    {selectedTimelineComm.direction === 'inbound' ? 'Recibido' : 'Enviado'}
                  </Badge>
                </div>
                
                {selectedTimelineComm.direction === 'inbound' ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">De:</span>{' '}
                    {selectedTimelineComm.email_from || selectedTimelineComm.whatsapp_from || selectedTimelineComm.phone_from || 'Desconocido'}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Para:</span>{' '}
                    {selectedTimelineComm.email_to?.join(', ') || selectedTimelineComm.whatsapp_to || selectedTimelineComm.phone_to || 'Destinatario'}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  {selectedTimelineComm.received_at && format(new Date(selectedTimelineComm.received_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </p>
              </div>
              
              <div className="pt-4 border-t">
                {selectedTimelineComm.body_html ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert break-words overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: selectedTimelineComm.body_html }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {selectedTimelineComm.body || selectedTimelineComm.body_preview || '[Sin contenido]'}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el expediente "{matter?.matter_number}" y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function for event icons
function getEventIcon(eventType?: string): string {
  const type = eventType?.toLowerCase() || '';
  if (type.includes('email')) return '✉️';
  if (type.includes('whatsapp')) return '💬';
  if (type.includes('call') || type.includes('phone')) return '📞';
  if (type.includes('document') || type === 'filing') return '📄';
  if (type.includes('deadline') || type.includes('plazo')) return '📅';
  if (type.includes('notification') || type.includes('alert')) return '🔔';
  if (type.includes('invoice') || type.includes('payment')) return '💰';
  if (type.includes('status') || type.includes('grant')) return '✅';
  if (type.includes('examination')) return '🔍';
  if (type.includes('note')) return '📝';
  if (type.includes('task')) return '✅';
  if (type.includes('party')) return '👤';
  return '📌';
}

// Timeline Event Row Component
function TimelineEventRow({ 
  event, 
  isLast,
  onNavigateTab 
}: { 
  event: any; 
  isLast: boolean;
  onNavigateTab: (tab: string) => void;
}) {
  const getTargetTab = (): string | null => {
    const type = event.event_type?.toLowerCase() || '';
    if (type.includes('email') || type.includes('whatsapp') || type.includes('call')) return 'communications';
    if (type.includes('document')) return 'documents';
    if (type === 'filing' || type.includes('solicitud')) return 'filings';
    if (type.includes('deadline') || type.includes('plazo')) return 'deadlines';
    if (type.includes('invoice') || type.includes('payment')) return 'invoices';
    if (type.includes('task')) return 'tasks';
    if (type.includes('party')) return 'parties';
    return null;
  };
  
  const targetTab = getTargetTab();
  const isClickable = !!targetTab;
  
  return (
    <div 
      className={cn(
        "flex gap-4",
        isClickable && "cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
      )}
      onClick={() => targetTab && onNavigateTab(targetTab)}
    >
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {getEventIcon(event.event_type)}
        </div>
        {!isLast && <div className="w-px h-full bg-border flex-1 mt-2" />}
      </div>
      <div className="pb-4 flex-1">
        <div className="flex items-center justify-between">
          <p className={cn("font-medium", isClickable && "text-primary hover:underline")}>
            {event.title}
          </p>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(event.event_date), { addSuffix: true, locale: es })}
          </span>
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
function MatterDetailSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-32 bg-white/20" />
        </div>
        <div className="flex items-start gap-6">
          <Skeleton className="h-20 w-20 rounded-2xl bg-white/20" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-64 bg-white/20" />
            <Skeleton className="h-6 w-96 bg-white/20" />
            <Skeleton className="h-4 w-48 bg-white/20" />
          </div>
        </div>
        <Skeleton className="h-24 w-full mt-6 rounded-xl bg-white/10" />
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
