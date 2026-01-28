// ============================================
// src/components/legal-ops/Client360Page.tsx
// Enhanced Client 360° View - Bitrix24 style
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientDetail } from '@/hooks/legal-ops/useClientDetail';
import { useCRMAccount } from '@/hooks/crm/v2/accounts';
import { useCRMContacts } from '@/hooks/crm/v2/contacts';
import { useMattersV2 } from '@/hooks/use-matters-v2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2, Mail, Phone, MapPin, Calendar, User, Star,
  AlertTriangle, FileText, MessageSquare, Briefcase, Clock,
  Edit, ExternalLink, ArrowLeft, ChevronDown, ChevronUp,
  Plus, Receipt, CheckSquare, Users, Wallet, PenLine,
  PhoneCall, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClientTimeline } from './ClientTimeline';
import { ClientActivityTimeline } from '@/components/clients';
import { ClientDocuments } from './ClientDocuments';
import { ClientAlerts } from './ClientAlerts';
import { ClientRelationshipsSection } from './ClientRelationshipsSection';
import { cn } from '@/lib/utils';

interface Client360PageProps {
  clientId: string;
}

export function Client360Page({ clientId }: Client360PageProps) {
  const { data, isLoading, error } = useClientDetail(clientId);
  const { data: crmAccount } = useCRMAccount(clientId);
  const { data: contacts } = useCRMContacts({ account_id: clientId });
  const { data: matters } = useMattersV2({ client_id: clientId });
  const navigate = useNavigate();
  const [timelineOpen, setTimelineOpen] = useState(true);

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

      {/* MAIN CONTENT: 70/30 Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - 70% - Main Content with Tabs */}
        <div className="flex-1 overflow-auto p-6 pr-3">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contacts">
                Contactos {contacts?.length ? `(${contacts.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="matters">
                Expedientes {matters?.length ? `(${matters.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
              <TabsTrigger value="documents">
                Documentos {stats.totalDocuments ? `(${stats.totalDocuments})` : ''}
              </TabsTrigger>
              <TabsTrigger value="tasks">Tareas</TabsTrigger>
              <TabsTrigger value="billing">Facturación</TabsTrigger>
            </TabsList>

            {/* TAB: GENERAL */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Company Data */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Datos de Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dirección</span>
                        <span className="font-medium text-right">
                          {client.address_line1}
                          {client.city && `, ${client.city}`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Resumen Financiero
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total facturado</span>
                      <span className="font-medium">€0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cobrado</span>
                      <span className="font-medium text-green-600">€0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pendiente</span>
                      <span className="font-medium text-amber-600">€0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts & Critical Docs */}
              {alerts.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Alertas Activas ({alerts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ClientAlerts alerts={alerts} />
                  </CardContent>
                </Card>
              )}

              {/* Internal Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PenLine className="w-4 h-4" />
                    Notas Internas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {client.notes || 'Sin notas internas'}
                  </p>
                </CardContent>
              </Card>

              {/* Relationships */}
              <ClientRelationshipsSection clientId={clientId} />
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
                <div className="grid grid-cols-2 gap-3">
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
                            <p>{matter.jurisdiction}</p>
                            <p>{format(new Date(matter.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: COMMUNICATIONS */}
            <TabsContent value="communications" className="space-y-4">
              <ClientActivityTimeline clientId={clientId} />
            </TabsContent>

            {/* TAB: DOCUMENTS */}
            <TabsContent value="documents" className="space-y-4">
              <ClientDocuments clientId={clientId} />
            </TabsContent>

            {/* TAB: TASKS */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Tareas pendientes</h3>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva tarea
                </Button>
              </div>
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay tareas pendientes</p>
                  <p className="text-sm mt-1">Las tareas de CRM y expedientes aparecerán aquí</p>
                </CardContent>
              </Card>
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
          </Tabs>
        </div>

        {/* Right Panel - 30% - Quick Actions (Sticky) */}
        <div className="w-80 shrink-0 border-l overflow-auto p-4 bg-muted/20">
          <div className="sticky top-0 space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <PhoneCall className="w-5 h-5 text-[hsl(var(--ip-action-call-text))]" />
                  <span className="text-xs">Llamar</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <MessageCircle className="w-5 h-5 text-[hsl(var(--ip-action-whatsapp-text))]" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <Mail className="w-5 h-5 text-[hsl(var(--ip-action-email-text))]" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-xs">Reunión</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <CheckSquare className="w-5 h-5 text-[hsl(var(--ip-pending-text))]" />
                  <span className="text-xs">Tarea</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-3 gap-1">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span className="text-xs">Documento</span>
                </Button>
                <Button variant="default" className="col-span-2 gap-2">
                  <Briefcase className="w-4 h-4" />
                  Nuevo Expediente
                </Button>
              </CardContent>
            </Card>

            {/* Primary Contact */}
            {primaryContact && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contacto Principal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {primaryContact.full_name?.substring(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{primaryContact.full_name}</p>
                      <p className="text-xs text-muted-foreground">{primaryContact.role || 'Contacto'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {primaryContact.phone && (
                      <a href={`tel:${primaryContact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{primaryContact.phone}</span>
                      </a>
                    )}
                    {primaryContact.email && (
                      <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{primaryContact.email}</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Activities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Próximas Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.upcomingDeadlines > 0 || alerts.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {alerts.slice(0, 3).map((alert, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          alert.severity === 'high' ? 'bg-red-500' : 
                          alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        <div>
                          <p className="font-medium line-clamp-1">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin actividades próximas</p>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Etiquetas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - Collapsible Timeline */}
      <Collapsible open={timelineOpen} onOpenChange={setTimelineOpen}>
        <div className="border-t bg-background">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-2 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm">Timeline de Actividad</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-7" onClick={(e) => e.stopPropagation()}>
                    <Plus className="w-3 h-3 mr-1" />
                    Nota
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={(e) => e.stopPropagation()}>
                    <Phone className="w-3 h-3 mr-1" />
                    Llamada
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7" onClick={(e) => e.stopPropagation()}>
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats.lastActivity ? 'Última actividad' : 'Sin actividad'}</Badge>
                {timelineOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t max-h-64 overflow-auto">
              <ClientTimeline clientId={clientId} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
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
