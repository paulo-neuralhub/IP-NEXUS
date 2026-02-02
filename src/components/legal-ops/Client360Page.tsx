// ============================================
// src/components/legal-ops/Client360Page.tsx
// Enhanced Client 360° View - Layout 50/50
// ============================================

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useClientDetail } from '@/hooks/legal-ops/useClientDetail';
import { useCRMAccount } from '@/hooks/crm/v2/accounts';
import { useCRMContacts } from '@/hooks/crm/v2/contacts';
import { useMattersV2 } from '@/hooks/use-matters-v2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import {
  Building2, Mail, Phone, Calendar, User, Star,
  AlertTriangle, Briefcase, Clock,
  ArrowLeft, Plus, Receipt, Users, Wallet, PenLine,
  MessageCircle, MessageSquare, Edit, Globe
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

interface Client360PageProps {
  clientId: string;
}

export function Client360Page({ clientId }: Client360PageProps) {
  const { data, isLoading, error } = useClientDetail(clientId);
  const { data: crmAccount } = useCRMAccount(clientId);
  const { data: contacts } = useCRMContacts({ account_id: clientId });
  const { data: matters } = useMattersV2({ client_id: clientId });
  const navigate = useNavigate();

  const [openEditCompany, setOpenEditCompany] = useState(false);
  const [openInternalNotes, setOpenInternalNotes] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);

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

  const { client, stats, alerts, criticalDocuments } = data;
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
          tax_id: client.tax_id || '',
          email: client.email || '',
          phone: client.phone || '',
          address_line1: client.address_line1 || '',
          city: client.city || '',
          postal_code: client.postal_code || '',
          country: client.country || '',
          website: (crmAccount as any)?.website || '',
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
                    {client.display_name?.substring(0, 2).toUpperCase() || 'CL'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">
                      {client.display_name || client.company_name}
                    </h1>
                    {/* Rating Stars */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={cn(
                            "w-4 h-4",
                            star <= (crmAccount?.rating_stars || 0) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    {crmAccount?.client_type && (
                      <Badge 
                        style={{ backgroundColor: crmAccount.client_type.color + '20', color: crmAccount.client_type.color }}
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {client.responsible_user && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Responsable: {client.responsible_user.full_name}
                      </span>
                    )}
                    {client.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Cliente desde {format(new Date(client.created_at), 'MMM yyyy', { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="flex items-center gap-3">
                <StatChip icon={<Briefcase className="w-4 h-4" />} value={stats.totalMatters} label="Expedientes" />
                <StatChip icon={<MessageSquare className="w-4 h-4" />} value={stats.unreadMessages} label="Sin leer" highlight={stats.unreadMessages > 0} />
                <StatChip icon={<Clock className="w-4 h-4" />} value={stats.upcomingDeadlines} label="Plazos" highlight={stats.upcomingDeadlines > 0} />
                <StatChip icon={<AlertTriangle className="w-4 h-4" />} value={stats.documentAlerts} label="Alertas" highlight={stats.documentAlerts > 0} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT: 50/50 Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 50% - Formulario con Tabs */}
        <div className="w-1/2 overflow-y-auto border-r">
          <div className="p-6">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contacts">
                  Contactos {contacts?.length ? `(${contacts.length})` : ''}
                </TabsTrigger>
                <TabsTrigger value="matters">
                  Expedientes {matters?.length ? `(${matters.length})` : ''}
                </TabsTrigger>
                <TabsTrigger value="documents">
                  Documentos {stats.totalDocuments ? `(${stats.totalDocuments})` : ''}
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="billing">Facturación</TabsTrigger>
              </TabsList>

              {/* TAB: GENERAL */}
              <TabsContent value="general" className="space-y-3">
                {/* Datos de Empresa */}
                <CollapsibleSection
                  title="Datos de Empresa"
                  icon={<Building2 className="w-4 h-4" />}
                  actions={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => setOpenEditCompany(true)}
                      aria-label="Editar datos de empresa"
                    >
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
                        <span className="font-medium">{client.tax_id}</span>
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

                {/* Resumen Financiero */}
                <CollapsibleSection
                  title="Resumen Financiero"
                  icon={<Wallet className="w-4 h-4" />}
                  defaultOpen={false}
                  badge={
                    <Badge variant="outline" className="h-5 text-xs ml-2">
                      €0 pendiente
                    </Badge>
                  }
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

                {/* Alertas Activas */}
                {alerts.length > 0 && (
                  <CollapsibleSection
                    title="Alertas Activas"
                    icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                    badge={
                      <Badge variant="destructive" className="h-5 text-xs ml-2">
                        {alerts.length}
                      </Badge>
                    }
                  >
                    <div className="pt-2">
                      <ClientAlerts alerts={alerts} />
                    </div>
                  </CollapsibleSection>
                )}

                {/* Notas Internas */}
                <CollapsibleSection
                  title="Notas Internas"
                  icon={<PenLine className="w-4 h-4" />}
                  actions={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => setOpenInternalNotes(true)}
                      aria-label="Editar notas internas"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  }
                  defaultOpen={!!client.notes}
                >
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {client.notes || 'Sin notas internas. Haz clic en editar para añadir.'}
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Titulares (PROMPT 26) */}
                <ClientHoldersPanel 
                  accountId={clientId}
                  accountName={client.display_name || client.company_name || 'Cliente'}
                />

                {/* Relaciones */}
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
                      <Button size="sm" variant="outline" className="mt-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir primer contacto
                      </Button>
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
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/app/expedientes/nuevo')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primer expediente
                      </Button>
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
                <ClientDocuments clientId={clientId} />
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

              {/* TAB: WHATSAPP */}
              <TabsContent value="whatsapp" className="space-y-4">
                <ClientWhatsAppTimeline 
                  clientId={clientId} 
                  clientPhone={client.phone || primaryContact?.phone}
                  clientName={client.display_name || client.company_name}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - 50% - Timeline Fijo */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-muted/20">
          {/* Timeline Header Sticky */}
          <div className="sticky top-0 z-10 bg-background border-b px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Timeline</h3>
                <Badge variant="secondary" className="h-5 text-xs">
                  {stats.totalMatters + stats.unreadMessages}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="default" className="h-7 px-2 gap-1">
                  <Plus className="w-3 h-3" />
                  <span className="text-xs">Actividad</span>
                </Button>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 gap-1"
                onClick={() => setOpenAddNote(true)}
              >
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
              <Button size="sm" variant="outline" className="h-7 px-2 gap-1">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">WhatsApp</span>
              </Button>
            </div>
          </div>
          
          {/* Timeline Content - Scroll independiente */}
          <div className="flex-1 overflow-y-auto">
            <ClientTimeline clientId={clientId} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para stat chips en el header
function StatChip({ 
  icon, 
  value, 
  label, 
  highlight 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
      highlight ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400" : "bg-muted/50"
    )}>
      {icon}
      <span className="font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// Skeleton de carga
function Client360Skeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="w-80 border-l p-4 space-y-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
