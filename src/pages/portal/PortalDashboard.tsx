/**
 * Portal Dashboard
 * Vista principal del cliente en el portal - DATOS REALES
 */

import { useTranslation } from 'react-i18next';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { usePortalMatters } from '@/hooks/use-portal-matters';
import { usePortalDocuments } from '@/hooks/use-portal-documents';
import { usePortalThreads } from '@/hooks/use-portal-messages';
import { usePortalInvoices } from '@/hooks/use-portal-invoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, useParams } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Receipt, 
  MessageSquare,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { MATTER_STATUSES } from '@/lib/constants/matters';

export default function PortalDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { user } = usePortalAuth();
  
  // Datos reales
  const { data: matters, isLoading: mattersLoading } = usePortalMatters();
  const { data: documents, isLoading: documentsLoading } = usePortalDocuments();
  const { data: threads, isLoading: messagesLoading } = usePortalThreads();
  const { data: invoices, isLoading: invoicesLoading } = usePortalInvoices();

  const isLoading = mattersLoading || documentsLoading || messagesLoading || invoicesLoading;

  // Stats calculados de datos reales
  const stats = {
    activeMatters: matters?.length || 0,
    pendingDocuments: documents?.filter(d => !d.viewed_at)?.length || 0,
    pendingInvoices: invoices?.filter(i => i.status !== 'paid')?.length || 0,
    unreadMessages: threads?.reduce((acc, t) => acc + t.unread_count, 0) || 0,
    upcomingDeadlines: matters?.reduce((acc, m) => acc + m.deadline_count, 0) || 0,
  };

  // Expedientes recientes
  const recentMatters = matters?.slice(0, 3) || [];

  // Próximos plazos (simulados por ahora - en producción vendría de una query específica)
  const upcomingDeadlines = matters?.filter(m => m.deadline_count > 0).slice(0, 3) || [];

  const getStatusBadge = (status: string) => {
    const config = MATTER_STATUSES[status as keyof typeof MATTER_STATUSES];
    if (!config) return <Badge variant="outline">{status}</Badge>;
    
    return (
      <Badge 
        variant="outline"
        style={{ 
          backgroundColor: `${config.color}20`, 
          color: config.color,
          borderColor: `${config.color}40`
        }}
      >
        {config.label}
      </Badge>
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trademark': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'patent': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'design': return { bg: 'bg-green-100', text: 'text-green-600' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('portal.dashboard.welcome')}, {user?.name || 'Cliente'}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeMatters}</p>
                <p className="text-xs text-muted-foreground">{t('portal.dashboard.active_matters')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingDocuments}</p>
                <p className="text-xs text-muted-foreground">{t('portal.dashboard.new_documents')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                <p className="text-xs text-muted-foreground">{t('portal.nav.invoices')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unreadMessages}</p>
                <p className="text-xs text-muted-foreground">{t('portal.dashboard.unread_messages')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingDeadlines}</p>
                <p className="text-xs text-muted-foreground">{t('portal.dashboard.pending_deadlines')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Documentos nuevos */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Documentos recientes
              </CardTitle>
              <CardDescription>Últimos documentos compartidos contigo</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/portal/${slug}/documents`}>Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.matter_reference || 'General'} • {format(new Date(doc.shared_at), 'd MMM', { locale: es })}
                        </p>
                      </div>
                    </div>
                    {!doc.viewed_at && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">Nuevo</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p>No hay documentos compartidos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos Plazos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('portal.dashboard.upcoming_deadlines')}
            </CardTitle>
            <CardDescription>{t('portal.dashboard.pending_deadlines')}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((matter) => (
                  <Link 
                    key={matter.id} 
                    to={`/portal/${slug}/matters/${matter.id}`}
                    className="flex gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  >
                    <div className="text-center min-w-[40px]">
                      <Calendar className="w-5 h-5 text-primary mx-auto" />
                      <p className="text-xs text-muted-foreground mt-1">{matter.deadline_count}</p>
                    </div>
                    <div className="flex-1 border-l pl-3">
                      <p className="font-medium text-sm">{matter.title}</p>
                      <p className="text-xs text-muted-foreground">{matter.reference}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto opacity-30 mb-2" />
                <p className="text-sm">Sin plazos próximos</p>
              </div>
            )}
            <Button variant="link" className="w-full mt-4" asChild>
              <Link to={`/portal/${slug}/deadlines`}>Ver todos los plazos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Expedientes Recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('portal.dashboard.recent_activity')}
            </CardTitle>
            <CardDescription>Tus expedientes más recientes</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/portal/${slug}/matters`}>{t('common.all')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentMatters.length > 0 ? (
            <div className="space-y-3">
              {recentMatters.map((matter) => {
                const colors = getTypeColor(matter.type);
                return (
                  <Link 
                    key={matter.id}
                    to={`/portal/${slug}/matters/${matter.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
                        <Briefcase className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {matter.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{matter.reference}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(matter.status)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p>No tienes expedientes activos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
