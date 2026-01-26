/**
 * Portal Matter Detail
 * Vista detallada de un expediente para el cliente - DATOS REALES
 */

import { useParams, Link } from 'react-router-dom';
import { usePortalMatterDetail } from '@/hooks/use-portal-matters';
import { usePortalMatterDocuments } from '@/hooks/use-portal-documents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  History,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MATTER_STATUSES } from '@/lib/constants/matters';

export default function PortalMatterDetail() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  
  const { data: matter, isLoading, error } = usePortalMatterDetail(id);
  const { data: documents } = usePortalMatterDocuments(id);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trademark': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'patent': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'design': return { bg: 'bg-green-100', text: 'text-green-600' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-4"><Skeleton className="h-12" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/portal/${slug}/matters`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a expedientes
          </Link>
        </Button>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive opacity-50 mb-4" />
          <p className="text-lg font-medium">No se pudo cargar el expediente</p>
          <p className="text-muted-foreground">Es posible que no tengas acceso o no exista</p>
        </div>
      </div>
    );
  }

  const colors = getTypeColor(matter.type);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/portal/${slug}/matters`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a expedientes
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <Briefcase className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{matter.title}</h1>
              {getStatusBadge(matter.status)}
            </div>
            <p className="text-muted-foreground">{matter.reference}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Jurisdicción</span>
            </div>
            <p className="font-semibold">{matter.jurisdiction || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fecha solicitud</span>
            </div>
            <p className="font-semibold">
              {matter.filing_date 
                ? format(new Date(matter.filing_date), 'd MMM yyyy', { locale: es })
                : 'Sin fecha'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Hash className="w-4 h-4" />
              <span className="text-sm">Nº Solicitud</span>
            </div>
            <p className="font-semibold">{matter.application_number || 'Pendiente'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Próximo plazo</span>
            </div>
            <p className="font-semibold">
              {matter.next_deadline 
                ? format(new Date(matter.next_deadline.date), 'd MMM yyyy', { locale: es })
                : 'Sin plazos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="documents">
            Documentos
            {matter.documents_count && matter.documents_count > 0 && (
              <Badge variant="secondary" className="ml-2">{matter.documents_count}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="timeline">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del expediente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {matter.owner_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Titular</p>
                    <p className="font-medium">{matter.owner_name}</p>
                  </div>
                )}
                {matter.mark_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Denominación</p>
                    <p className="font-medium">{matter.mark_name}</p>
                  </div>
                )}
                {matter.registration_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nº Registro</p>
                    <p className="font-medium">{matter.registration_number}</p>
                  </div>
                )}
                {matter.registration_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Registro</p>
                    <p className="font-medium">{format(new Date(matter.registration_date), 'd MMM yyyy', { locale: es })}</p>
                  </div>
                )}
                {matter.expiry_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha Expiración</p>
                    <p className="font-medium">{format(new Date(matter.expiry_date), 'd MMM yyyy', { locale: es })}</p>
                  </div>
                )}
              </div>
              {matter.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notas</p>
                    <p>{matter.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Próximo plazo destacado */}
          {matter.next_deadline && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                  Próximo plazo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{matter.next_deadline.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(matter.next_deadline.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/portal/${slug}/deadlines`}>Ver plazos</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Documentos asociados al expediente</CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(doc.shared_at), 'd MMM yyyy', { locale: es })}
                            {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(0)} KB`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!doc.viewed_at && (
                          <Badge className="bg-amber-100 text-amber-700">Nuevo</Badge>
                        )}
                        {doc.can_download && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p>No hay documentos compartidos para este expediente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial
              </CardTitle>
              <CardDescription>Actividad del expediente ({matter.activities_count || 0} registros)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p>El historial detallado estará disponible próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
