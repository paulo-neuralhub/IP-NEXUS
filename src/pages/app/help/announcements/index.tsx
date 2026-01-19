// ============================================================
// IP-NEXUS APP - ANNOUNCEMENTS / CHANGELOG PAGE
// ============================================================

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, ExternalLink, Sparkles, AlertTriangle, Info, Star, Wrench, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHelpAnnouncements, useMarkAnnouncementRead, useSystemStatus, useActiveIncidents } from '@/hooks/help';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const typeConfig = {
  feature: { label: 'Nueva Función', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: Sparkles },
  improvement: { label: 'Mejora', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Star },
  fix: { label: 'Corrección', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: Wrench },
  maintenance: { label: 'Mantenimiento', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: Info },
  security: { label: 'Seguridad', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: Shield },
  deprecation: { label: 'Deprecación', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: AlertTriangle },
};

const systemStatusConfig = {
  operational: { label: 'Operativo', color: 'bg-green-500' },
  degraded: { label: 'Rendimiento Degradado', color: 'bg-amber-500' },
  partial_outage: { label: 'Interrupción Parcial', color: 'bg-orange-500' },
  major_outage: { label: 'Interrupción Mayor', color: 'bg-red-500' },
  maintenance: { label: 'Mantenimiento', color: 'bg-blue-500' },
};

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState('changelog');
  
  const { data: announcements = [], isLoading: loadingAnnouncements } = useHelpAnnouncements();
  const { data: systemStatuses = [], isLoading: loadingStatus } = useSystemStatus();
  const { data: incidents = [] } = useActiveIncidents();
  const markAsRead = useMarkAnnouncementRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Active Incidents Banner */}
      {incidents.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Hay {incidents.length} incidencia(s) activa(s)
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {incidents[0]?.component}: {incidents[0]?.description || incidents[0]?.title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="changelog">Novedades</TabsTrigger>
          <TabsTrigger value="status">Estado del Sistema</TabsTrigger>
        </TabsList>

        {/* Changelog Tab */}
        <TabsContent value="changelog" className="space-y-4 mt-6">
          {loadingAnnouncements ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState
              icon={<Bell className="h-12 w-12" />}
              title="Sin novedades"
              description="Aún no hay anuncios o actualizaciones publicadas."
            />
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const type = typeConfig[announcement.announcement_type as keyof typeof typeConfig] || typeConfig.feature;
                const TypeIcon = type.icon;
                const isRead = announcement.is_read;

                return (
                  <Card
                    key={announcement.id}
                    className={cn(
                      'transition-all cursor-pointer',
                      !isRead && 'border-primary/50 bg-primary/5',
                      announcement.is_featured && 'ring-2 ring-primary/20'
                    )}
                    onClick={() => !isRead && handleMarkAsRead(announcement.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn('gap-1', type.color)} variant="secondary">
                              <TypeIcon className="h-3 w-3" />
                              {type.label}
                            </Badge>
                            {announcement.is_featured && (
                              <Badge variant="outline" className="border-primary text-primary">
                                Destacado
                              </Badge>
                            )}
                            {!isRead && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(announcement.publish_at), "d MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground">{announcement.summary || announcement.content}</p>
                      {announcement.learn_more_url && (
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href={announcement.learn_more_url} target="_blank" rel="noopener noreferrer">
                            Saber más
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-4 mt-6">
          {loadingStatus ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : systemStatuses.length === 0 ? (
            <EmptyState
              icon={<Info className="h-12 w-12" />}
              title="Sin información de estado"
              description="No hay información del estado del sistema disponible."
            />
          ) : (
            <div className="space-y-3">
              {systemStatuses.map((service) => {
                const statusInfo = systemStatusConfig[service.status as keyof typeof systemStatusConfig] || systemStatusConfig.operational;
                
                return (
                  <Card key={service.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-3 w-3 rounded-full', statusInfo.color)} />
                          <div>
                            <p className="font-medium">{service.component}</p>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">{statusInfo.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
