// ============================================================
// IP-NEXUS APP - ANNOUNCEMENTS / CHANGELOG PAGE
// ============================================================

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bell, ExternalLink, Sparkles, AlertTriangle, Info, Star, Wrench, Shield,
  Rocket, Zap, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHelpAnnouncements, useMarkAnnouncementRead, useSystemStatus, useActiveIncidents } from '@/hooks/help';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

// ── DB announcement type config ──
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

// ── Static releases (changelog) ──
interface ReleaseChange {
  type: 'new' | 'improvement' | 'fix';
  text: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  changes: ReleaseChange[];
}

const STATIC_RELEASES: Release[] = [
  {
    version: '2.4.0',
    date: '5 de febrero 2026',
    title: 'IP-Market: Marketplace de Servicios IP',
    changes: [
      { type: 'new', text: 'IP-Market: Marketplace completo de servicios IP' },
      { type: 'new', text: 'Pago Protegido: Sistema de escrow para transacciones' },
      { type: 'new', text: 'Wizard guiado para particulares' },
      { type: 'improvement', text: 'Dashboard rediseñado con KPIs en tiempo real' },
      { type: 'fix', text: 'Corrección de permisos RLS en documentos compartidos' },
    ],
  },
  {
    version: '2.3.0',
    date: '20 de enero 2026',
    title: 'Data Hub y conexiones con oficinas IP',
    changes: [
      { type: 'new', text: 'Conexión directa con EUIPO para búsqueda de marcas' },
      { type: 'new', text: 'Importación automática desde WIPO Madrid Monitor' },
      { type: 'new', text: 'Directorio global de 190+ oficinas IP' },
      { type: 'improvement', text: 'Rendimiento de búsqueda mejorado 3x' },
    ],
  },
  {
    version: '2.2.0',
    date: '5 de enero 2026',
    title: 'CRM y Pipeline de ventas',
    changes: [
      { type: 'new', text: 'CRM completo con pipeline visual drag-and-drop' },
      { type: 'new', text: 'Portal de cliente para seguimiento de expedientes' },
      { type: 'new', text: 'Firma digital de documentos integrada' },
      { type: 'improvement', text: 'Nuevo diseño de tarjetas de contacto' },
    ],
  },
  {
    version: '2.1.0',
    date: '15 de diciembre 2025',
    title: 'IP-Genius: Asistente de IA',
    changes: [
      { type: 'new', text: 'IP-Genius: Asistente de IA para consultas IP' },
      { type: 'new', text: 'Análisis automático de anterioridades con IA' },
      { type: 'new', text: 'Generación de informes PDF automáticos' },
      { type: 'improvement', text: 'Sistema de plantillas de documentos mejorado' },
      { type: 'fix', text: 'Corrección en cálculo de plazos para patentes' },
    ],
  },
  {
    version: '2.0.0',
    date: '1 de diciembre 2025',
    title: 'IP-NEXUS 2.0 — Rediseño completo',
    changes: [
      { type: 'new', text: 'Nuevo sistema de diseño SILK' },
      { type: 'new', text: 'Automatizaciones sin código' },
      { type: 'new', text: 'Multi-idioma (ES, EN, FR, DE, PT)' },
      { type: 'improvement', text: 'Rendimiento general mejorado 5x' },
      { type: 'improvement', text: 'Nueva experiencia de onboarding' },
      { type: 'fix', text: 'Múltiples correcciones de estabilidad' },
    ],
  },
];

const changeTypeConfig: Record<ReleaseChange['type'], { label: string; icon: typeof Sparkles; dotClass: string }> = {
  new: { label: 'Nuevo', icon: Sparkles, dotClass: 'bg-emerald-500' },
  improvement: { label: 'Mejora', icon: Zap, dotClass: 'bg-blue-500' },
  fix: { label: 'Fix', icon: Wrench, dotClass: 'bg-amber-500' },
};

// ── Release card ──
function ReleaseCard({ release, isLatest }: { release: Release; isLatest: boolean }) {
  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
      {/* Timeline dot */}
      <div className={cn(
        "absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-[3px] flex items-center justify-center",
        isLatest
          ? "border-primary bg-primary"
          : "border-border bg-background"
      )}>
        {isLatest && <Rocket className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>

      <div className="pb-10">
        {/* Version + date */}
        <div className="flex items-center gap-3 mb-1">
          <Badge variant={isLatest ? "default" : "outline"} className="text-xs font-mono">
            v{release.version}
          </Badge>
          <span className="text-xs text-muted-foreground">{release.date}</span>
          {isLatest && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              Última versión
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-foreground mt-2 mb-4">{release.title}</h3>

        {/* Changes */}
        <div className="space-y-2">
          {release.changes.map((change, i) => {
            const cfg = changeTypeConfig[change.type];
            return (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", cfg.dotClass)} />
                <span className="text-foreground/80">{change.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState('changelog');

  const { data: announcements = [], isLoading: loadingAnnouncements } = useHelpAnnouncements();
  const { data: systemStatuses = [], isLoading: loadingStatus } = useSystemStatus();
  const { data: incidents = [] } = useActiveIncidents();
  const markAsRead = useMarkAnnouncementRead();

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  // Merge DB announcements with static releases — static always shown
  const hasDbAnnouncements = announcements.length > 0;

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
        <TabsContent value="changelog" className="mt-6">
          <div className="space-y-8">
            {/* DB announcements (if any) */}
            {loadingAnnouncements ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : hasDbAnnouncements && (
              <div className="space-y-4 mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Anuncios</h2>
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
                                <Badge variant="outline" className="border-primary text-primary">Destacado</Badge>
                              )}
                              {!isRead && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                            </div>
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(announcement.publish_at), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{announcement.summary || announcement.content}</p>
                        {announcement.learn_more_url && (
                          <Button variant="link" className="p-0 h-auto" asChild>
                            <a href={announcement.learn_more_url} target="_blank" rel="noopener noreferrer">
                              Saber más <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Static releases timeline */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                Historial de versiones
              </h2>
              <div className="space-y-0">
                {STATIC_RELEASES.map((release, idx) => (
                  <ReleaseCard key={release.version} release={release} isLatest={idx === 0} />
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" />Nuevo</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" />Mejora</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" />Corrección</div>
            </div>
          </div>
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
