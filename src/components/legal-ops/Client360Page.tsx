// ============================================
// src/components/legal-ops/Client360Page.tsx
// PROMPT 27 - Enterprise Client Detail Page
// ============================================

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClientDetail } from '@/hooks/legal-ops/useClientDetail';
import { useCRMAccount } from '@/hooks/crm/v2/accounts';
import { useCRMContacts } from '@/hooks/crm/v2/contacts';
import { useMattersV2 } from '@/hooks/use-matters-v2';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2, Mail, Phone, Calendar, User, Star, StarOff,
  AlertTriangle, Briefcase, Clock, FileText, Users, CheckSquare, Settings,
  ArrowLeft, Plus, Receipt, Wallet, PenLine, Archive, Trash2,
  MessageCircle, MessageSquare, Edit, Globe, MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClientTimeline } from './ClientTimeline';
import { ClientDocuments } from './ClientDocuments';
import { ClientAlerts } from './ClientAlerts';
import { ClientRelationshipsSection } from './ClientRelationshipsSection';
import { ClientWhatsAppTimeline } from '@/components/clients/ClientWhatsAppTimeline';
import { cn } from '@/lib/utils';
import { EditClientCompanyDialog } from '@/components/legal-ops/modals/EditClientCompanyDialog';
import { EditClientInternalNotesDialog } from '@/components/legal-ops/modals/EditClientInternalNotesDialog';
import { AddClientNoteDialog } from '@/components/legal-ops/modals/AddClientNoteDialog';
import { ClientHoldersPanel } from '@/components/holders/ClientHoldersPanel';
import { ClientQuickMetrics } from '@/components/clients/ClientQuickMetrics';
import { ClientCommunicationsTab } from '@/components/clients/ClientCommunicationsTab';
import { ClientDocumentsTab } from '@/components/clients/ClientDocumentsTab';
import { ClientTasksTab } from '@/components/clients/tabs/ClientTasksTab';
import { ClientSettingsTab } from '@/components/clients/tabs/ClientSettingsTab';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';

interface Client360PageProps {
  clientId: string;
}

export function Client360Page({ clientId }: Client360PageProps) {
  const { data, isLoading, error } = useClientDetail(clientId);
  const { data: crmAccount } = useCRMAccount(clientId);
  const { data: contacts } = useCRMContacts({ account_id: clientId });
  const { data: matters } = useMattersV2({ client_id: clientId });
  const { organizationId } = useOrganization();
  const navigate = useNavigate();

  const [openEditCompany, setOpenEditCompany] = useState(false);
  const [openInternalNotes, setOpenInternalNotes] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch enhanced metrics
  const { data: metrics } = useQuery({
    queryKey: ['client-metrics', clientId],
    queryFn: async () => {
      const [mattersRes, holdersRes, contactsRes] = await Promise.all([
        fromTable('matters')
          .select('id, status')
          .eq('client_id', clientId),
        fromTable('client_holders')
          .select('id')
          .eq('account_id', clientId)
          .eq('is_active', true),
        fromTable('crm_contacts')
          .select('id')
          .eq('account_id', clientId),
      ]);

      const matterIds = (mattersRes.data || []).map((m: any) => m.id);
      const activeMatters = (mattersRes.data || []).filter((m: any) => m.status === 'active').length;

      // Get documents count
      let docsCount = 0;
      if (matterIds.length > 0) {
        const docsRes = await fromTable('matter_documents')
          .select('id', { count: 'exact', head: true })
          .in('matter_id', matterIds);
        docsCount = docsRes.count || 0;
      }

      // Get deadlines
      let pendingDeadlines = 0;
      let overdueDeadlines = 0;
      if (matterIds.length > 0) {
        const pendingRes = await fromTable('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .in('matter_id', matterIds)
          .eq('status', 'pending')
          .gte('due_date', new Date().toISOString());
        pendingDeadlines = pendingRes.count || 0;

        const overdueRes = await fromTable('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .in('matter_id', matterIds)
          .eq('status', 'pending')
          .lt('due_date', new Date().toISOString());
        overdueDeadlines = overdueRes.count || 0;
      }

      return {
        total_matters: mattersRes.data?.length || 0,
        active_matters: activeMatters,
        total_documents: docsCount,
        pending_deadlines: pendingDeadlines,
        overdue_deadlines: overdueDeadlines,
        total_alerts: overdueDeadlines,
        total_holders: holdersRes.data?.length || 0,
        total_contacts: contactsRes.data?.length || 0,
        total_invoiced: 0,
        total_pending: 0,
        total_paid: 0,
      };
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return <Client360Skeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Cliente no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información del cliente.
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

  const { client, stats, alerts } = data;
  const primaryContact = contacts?.find((c: any) => c.is_primary) || contacts?.[0];

  return (
    <div className="flex flex-col h-full">
      {/* Modales */}
      <EditClientCompanyDialog
        open={openEditCompany}
        onOpenChange={setOpenEditCompany}
        clientId={clientId}
        initialValues={{
          name: client.display_name || client.company_name || '',
          legal_name: (crmAccount as any)?.legal_name || '',
          tax_id: client.tax_id || '',
          account_type: (crmAccount as any)?.account_type || 'direct',
          status: (crmAccount as any)?.status || 'active',
          tier: (crmAccount as any)?.tier || '',
          rating_stars: (crmAccount as any)?.rating_stars || 0,
          assigned_to: (crmAccount as any)?.assigned_to || '',
          email: client.email || '',
          phone: client.phone || '',
          website: (crmAccount as any)?.website || '',
          address_line1: client.address_line1 || '',
          address_line2: (crmAccount as any)?.address_line2 || '',
          city: client.city || '',
          state_province: (crmAccount as any)?.state_province || '',
          postal_code: client.postal_code || '',
          country: client.country || '',
          notes: client.notes || (crmAccount as any)?.metadata?.notes || '',
        }}
      />

      <EditClientInternalNotesDialog
        open={openInternalNotes}
        onOpenChange={setOpenInternalNotes}
        clientId={clientId}
        initialNotes={client.notes || ''}
      />

      <AddClientNoteDialog
        open={openAddNote}
        onOpenChange={setOpenAddNote}
        clientId={clientId}
        clientDisplayName={client.display_name || client.company_name || 'Cliente'}
      />

      {/* HEADER - Enterprise Style */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Left: Back + Info */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
              
              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                  {client.display_name?.substring(0, 2).toUpperCase() || 'CL'}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {client.display_name || client.company_name}
                  </h1>
                  {crmAccount?.client_type && (
                    <Badge 
                      style={{ 
                        backgroundColor: crmAccount.client_type.color + '20', 
                        color: crmAccount.client_type.color,
                        borderColor: crmAccount.client_type.color 
                      }}
                      variant="outline"
                    >
                      {crmAccount.client_type.name}
                    </Badge>
                  )}
                  {crmAccount?.status && (
                    <Badge variant={crmAccount.status === 'active' ? 'default' : 'secondary'}>
                      {crmAccount.status === 'active' ? 'Activo' : crmAccount.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  {client.tax_id && (
                    <span className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      {client.tax_id}
                    </span>
                  )}
                  {client.responsible_user && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {client.responsible_user.full_name}
                    </span>
                  )}
                  {client.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Cliente desde {format(new Date(client.created_at), 'MMMM yyyy', { locale: es })}
                    </span>
                  )}
                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= (crmAccount?.rating_stars || 0) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
                className={cn(isFavorite && "text-yellow-500")}
              >
                {isFavorite ? <Star className="w-5 h-5 fill-yellow-500" /> : <StarOff className="w-5 h-5" />}
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setOpenEditCompany(true)}>
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archivar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK METRICS BAR */}
      {metrics && <ClientQuickMetrics metrics={metrics} />}

      {/* MAIN CONTENT: Tabs + Timeline */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tabs */}
        <div className="flex-1 overflow-y-auto border-r">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full justify-start bg-muted/50 h-auto flex-wrap p-1">
                <TabsTrigger value="general" className="gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  General
                </TabsTrigger>
                <TabsTrigger value="contacts" className="gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Contactos
                  {contacts?.length ? (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{contacts.length}</Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="holders" className="gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Titulares
                  {metrics?.total_holders ? (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{metrics.total_holders}</Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="matters" className="gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Expedientes
                  {matters?.length ? (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{matters.length}</Badge>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Documentos
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Facturación
                </TabsTrigger>
                <TabsTrigger value="communications" className="gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comunicaciones
                </TabsTrigger>
                <TabsTrigger value="tasks" className="gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Tareas
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Configuración
                </TabsTrigger>
              </TabsList>

              {/* TAB: GENERAL */}
              <TabsContent value="general" className="space-y-3">
                <CollapsibleSection
                  title="Datos de Empresa"
                  icon={<Building2 className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setOpenEditCompany(true)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nombre</span>
                      <span className="font-medium">{client.display_name || client.company_name}</span>
                    </div>
                    {client.tax_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CIF/NIF</span>
                        <span className="font-medium font-mono">{client.tax_id}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <a href={`mailto:${client.email}`} className="font-medium text-primary hover:underline">
                          {client.email}
                        </a>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Teléfono</span>
                        <a href={`tel:${client.phone}`} className="font-medium hover:underline">
                          {client.phone}
                        </a>
                      </div>
                    )}
                    {client.address_line1 && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Dirección</span>
                        <span className="font-medium text-right">
                          {client.address_line1}
                          {client.city && `, ${client.city}`}
                          {client.country && ` (${client.country})`}
                        </span>
                      </div>
                    )}
                    {crmAccount?.website && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-muted-foreground">Web</span>
                        <a 
                          href={crmAccount.website.startsWith('http') ? crmAccount.website : `https://${crmAccount.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          {crmAccount.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Resumen Financiero"
                  icon={<Wallet className="w-4 h-4" />}
                  defaultOpen={false}
                >
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-lg font-semibold">€0</p>
                      <p className="text-xs text-muted-foreground">Facturado</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">€0</p>
                      <p className="text-xs text-muted-foreground">Cobrado</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">€0</p>
                      <p className="text-xs text-muted-foreground">Pendiente</p>
                    </div>
                  </div>
                </CollapsibleSection>

                {alerts?.length > 0 && (
                  <CollapsibleSection
                    title="Alertas Activas"
                    icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                    badge={<Badge variant="destructive" className="h-5 text-xs ml-2">{alerts.length}</Badge>}
                  >
                    <div className="pt-2">
                      <ClientAlerts alerts={alerts} />
                    </div>
                  </CollapsibleSection>
                )}

                <CollapsibleSection
                  title="Notas Internas"
                  icon={<PenLine className="w-4 h-4" />}
                  actions={
                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setOpenInternalNotes(true)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                  defaultOpen={!!client.notes}
                >
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {client.notes || 'Sin notas internas.'}
                    </p>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Relaciones"
                  icon={<Users className="w-4 h-4" />}
                  defaultOpen={false}
                >
                  <div className="pt-2">
                    <ClientRelationshipsSection clientId={clientId} />
                  </div>
                </CollapsibleSection>
              </TabsContent>

              {/* TAB: CONTACTS */}
              <TabsContent value="contacts" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Contactos del cliente</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo contacto
                  </Button>
                </div>
                
                {!contacts?.length ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay contactos registrados</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {contacts.map((contact: any) => (
                      <Card key={contact.id} className={cn(
                        "hover:shadow-md transition-shadow cursor-pointer",
                        contact.is_primary && "ring-2 ring-primary"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {contact.full_name?.substring(0, 2).toUpperCase() || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{contact.full_name}</p>
                                {contact.is_primary && (
                                  <Badge variant="outline" className="text-xs">Principal</Badge>
                                )}
                              </div>
                              {contact.email && (
                                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            {contact.phone && (
                              <Button size="sm" variant="outline" className="flex-1 h-8">
                                <Phone className="w-3 h-3 mr-1" />
                                Llamar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="flex-1 h-8">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              WhatsApp
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* TAB: HOLDERS */}
              <TabsContent value="holders" className="space-y-4">
                <ClientHoldersPanel 
                  accountId={clientId}
                  accountName={client.display_name || client.company_name || 'Cliente'}
                />
              </TabsContent>

              {/* TAB: EXPEDIENTES */}
              <TabsContent value="matters" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Expedientes del cliente</h3>
                  <Button size="sm" onClick={() => navigate('/app/expedientes/nuevo')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo expediente
                  </Button>
                </div>
                
                {!matters?.length ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay expedientes registrados</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {matters.map((matter) => (
                          <button
                            key={matter.id}
                            type="button"
                            onClick={() => navigate(`/app/expedientes/${matter.id}`)}
                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center gap-4"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {matter.reference || matter.matter_number}
                                </span>
                                <Badge variant={matter.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {matter.status}
                                </Badge>
                              </div>
                              <p className="font-medium truncate">{matter.title}</p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>{matter.jurisdiction_primary}</p>
                              <p>{format(new Date(matter.created_at), 'dd/MM/yyyy')}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB: DOCUMENTS */}
              <TabsContent value="documents" className="space-y-4">
                <ClientDocumentsTab clientId={clientId} />
              </TabsContent>

              {/* TAB: BILLING */}
              <TabsContent value="billing" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Facturación</h3>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva factura
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay facturas registradas</p>
                    <p className="text-sm mt-1">El historial de facturación aparecerá aquí</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: COMMUNICATIONS */}
              <TabsContent value="communications" className="space-y-4">
                <ClientCommunicationsTab clientId={clientId} />
              </TabsContent>

              {/* TAB: TASKS */}
              <TabsContent value="tasks" className="space-y-4">
                <ClientTasksTab clientId={clientId} />
              </TabsContent>

              {/* TAB: SETTINGS */}
              <TabsContent value="settings" className="space-y-4">
                <ClientSettingsTab clientId={clientId} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Timeline */}
        <div className="w-[400px] flex flex-col overflow-hidden bg-muted/20">
          <div className="sticky top-0 z-10 bg-background border-b px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Timeline</h3>
              </div>
              <Button size="sm" variant="default" className="h-7 px-2 gap-1">
                <Plus className="w-3 h-3" />
                <span className="text-xs">Actividad</span>
              </Button>
            </div>
            <div className="flex gap-1 mt-2">
              <Button size="sm" variant="outline" className="h-7 px-2 gap-1" onClick={() => setOpenAddNote(true)}>
                <PenLine className="w-3 h-3" />
                <span className="text-xs">Nota</span>
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 gap-1">
                <Phone className="w-3 h-3" />
                <span className="text-xs">Llamada</span>
              </Button>
              <Button size="sm" variant="outline" className="h-7 px-2 gap-1">
                <Mail className="w-3 h-3" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <ClientTimeline clientId={clientId} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton
function Client360Skeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="grid grid-cols-8 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="w-[400px] border-l p-4 space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
