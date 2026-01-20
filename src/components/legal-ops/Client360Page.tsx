// ============================================
// src/components/legal-ops/Client360Page.tsx
// ============================================

import { useClientDetail } from '@/hooks/legal-ops/useClientDetail';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2, Mail, Phone, MapPin, Calendar, User, Star,
  AlertTriangle, FileText, MessageSquare, Briefcase, Clock,
  Edit, ExternalLink, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClientTimeline } from './ClientTimeline';
import { ClientDocuments } from './ClientDocuments';
import { ClientAlerts } from './ClientAlerts';
import { DocumentValidityBadge } from './DocumentValidityBadge';
import { DocValidityStatus } from '@/types/legal-ops';
import { useNavigate } from 'react-router-dom';

interface Client360PageProps {
  clientId: string;
}

export function Client360Page({ clientId }: Client360PageProps) {
  const { data, isLoading, error } = useClientDetail(clientId);
  const navigate = useNavigate();

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

  return (
    <div className="p-6 space-y-6">
      {/* Header del cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* Info principal */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {client.display_name?.substring(0, 2).toUpperCase() || 'CL'}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {client.display_name || client.company_name}
                  </h1>
                  {client.lifecycle_stage === 'customer' && (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      VIP
                    </Badge>
                  )}
                </div>

                {client.tax_id && (
                  <p className="text-muted-foreground">CIF/NIF: {client.tax_id}</p>
                )}

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {client.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Cliente desde {format(new Date(client.created_at), 'MMMM yyyy', { locale: es })}
                    </span>
                  )}
                  {client.responsible_user && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Responsable: {client.responsible_user.full_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Asuntos"
                value={stats.activeMatters}
                subvalue={`${stats.totalMatters} total`}
              />
              <StatCard
                icon={<MessageSquare className="w-5 h-5" />}
                label="Sin leer"
                value={stats.unreadMessages}
                highlight={stats.unreadMessages > 0}
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Vencimientos"
                value={stats.upcomingDeadlines}
                highlight={stats.upcomingDeadlines > 0}
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Alertas docs"
                value={stats.documentAlerts}
                highlight={stats.documentAlerts > 0}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <div className="grid grid-cols-12 gap-6">
        {/* Panel izquierdo - Info y alertas */}
        <div className="col-span-4 space-y-6">
          {/* Información de contacto */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Información de contacto
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="hover:underline text-primary">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.address_line1 && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>
                    {client.address_line1}
                    {client.city && `, ${client.city}`}
                    {client.postal_code && ` ${client.postal_code}`}
                  </span>
                </div>
              )}
              {!client.email && !client.phone && !client.address_line1 && (
                <p className="text-sm text-muted-foreground">
                  Sin información de contacto
                </p>
              )}
            </CardContent>
          </Card>

          {/* Alertas activas */}
          {alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alertas activas ({alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClientAlerts alerts={alerts} />
              </CardContent>
            </Card>
          )}

          {/* Documentos críticos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Documentos críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay documentos críticos
                  </p>
                ) : (
                  criticalDocuments.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{doc.title}</span>
                      </div>
                      <DocumentValidityBadge
                        status={doc.validity_status as DocValidityStatus}
                        daysRemaining={doc.days_remaining}
                        verified={doc.verified}
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Timeline y contenido */}
        <div className="col-span-8">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="matters">
                Asuntos ({stats.totalMatters})
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documentos ({stats.totalDocuments})
              </TabsTrigger>
              <TabsTrigger value="communications">
                Comunicaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <ClientTimeline clientId={clientId} />
            </TabsContent>

            <TabsContent value="matters" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Lista de asuntos del cliente</p>
                  <p className="text-sm">Funcionalidad próximamente</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <ClientDocuments clientId={clientId} />
            </TabsContent>

            <TabsContent value="communications" className="mt-4">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Historial de comunicaciones</p>
                  <p className="text-sm">Funcionalidad próximamente</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para estadísticas
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subvalue?: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, subvalue, highlight }: StatCardProps) {
  return (
    <div className={`
      p-3 rounded-lg border
      ${highlight ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-muted/50'}
    `}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-amber-700 dark:text-amber-400' : ''}`}>
        {value}
      </div>
      {subvalue && (
        <div className="text-xs text-muted-foreground">{subvalue}</div>
      )}
    </div>
  );
}

// Skeleton de carga
function Client360Skeleton() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <div className="col-span-8">
          <Skeleton className="h-96" />
        </div>
      </div>
    </div>
  );
}
