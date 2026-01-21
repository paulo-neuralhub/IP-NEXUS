/**
 * Portal Matter Detail
 * Vista detallada de un expediente para el cliente
 */

import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
  History
} from 'lucide-react';

// Mock data
const mockMatter = {
  id: '1',
  reference: 'TM-2025-001',
  title: 'Marca NEXUS',
  type: 'trademark',
  status: 'active',
  jurisdiction: 'ES',
  filingDate: '2025-01-15',
  applicationNumber: '4.123.456',
  registrationNumber: null,
  classes: [9, 42],
  description: 'Marca denominativa para software de gestión de propiedad intelectual y servicios relacionados.',
  owner: 'NEXUS Technologies S.L.',
  documents: [
    { id: '1', name: 'Solicitud de registro', date: '2025-01-15', type: 'application' },
    { id: '2', name: 'Poder de representación', date: '2025-01-14', type: 'power' },
    { id: '3', name: 'Acuse de recibo OEPM', date: '2025-01-16', type: 'receipt' },
  ],
  timeline: [
    { id: '1', date: '2025-01-16', action: 'Solicitud presentada', status: 'completed' },
    { id: '2', date: '2025-02-01', action: 'Examen formal completado', status: 'completed' },
    { id: '3', date: '2025-03-15', action: 'Publicación en BOPI', status: 'pending' },
    { id: '4', date: '2025-05-15', action: 'Fin período oposición', status: 'upcoming' },
    { id: '5', date: '2025-06-01', action: 'Concesión esperada', status: 'upcoming' },
  ],
  deadlines: [
    { id: '1', date: '2026-01-15', title: 'Renovación', type: 'renewal' },
  ],
};

export default function PortalMatterDetail() {
  const { slug, id } = useParams<{ slug: string; id: string }>();

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      trademark: { label: 'Marca', className: 'bg-blue-100 text-blue-700 border-blue-200' },
      patent: { label: 'Patente', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      design: { label: 'Diseño', className: 'bg-green-100 text-green-700 border-green-200' },
    };
    const c = config[type] || { label: type, className: '' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
      granted: { label: 'Concedido', className: 'bg-blue-100 text-blue-700' },
    };
    const c = config[status] || { label: status, className: '' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

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
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            mockMatter.type === 'trademark' ? 'bg-blue-100' :
            mockMatter.type === 'patent' ? 'bg-purple-100' : 'bg-green-100'
          }`}>
            <Briefcase className={`w-7 h-7 ${
              mockMatter.type === 'trademark' ? 'text-blue-600' :
              mockMatter.type === 'patent' ? 'text-purple-600' : 'text-green-600'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{mockMatter.title}</h1>
              {getTypeBadge(mockMatter.type)}
              {getStatusBadge(mockMatter.status)}
            </div>
            <p className="text-muted-foreground">{mockMatter.reference}</p>
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
            <p className="font-semibold">{mockMatter.jurisdiction}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Fecha solicitud</span>
            </div>
            <p className="font-semibold">{new Date(mockMatter.filingDate).toLocaleDateString('es')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Nº Solicitud</span>
            </div>
            <p className="font-semibold">{mockMatter.applicationNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Próximo plazo</span>
            </div>
            <p className="font-semibold">
              {mockMatter.deadlines[0] 
                ? new Date(mockMatter.deadlines[0].date).toLocaleDateString('es')
                : 'Sin plazos'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="timeline">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del expediente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Titular</p>
                  <p className="font-medium">{mockMatter.owner}</p>
                </div>
                {mockMatter.classes.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Clases Niza</p>
                    <p className="font-medium">{mockMatter.classes.join(', ')}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                <p>{mockMatter.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Progreso
              </CardTitle>
              <CardDescription>Estado actual del trámite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {mockMatter.timeline.map((item, index) => (
                  <div key={item.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        item.status === 'completed' ? 'bg-green-100' :
                        item.status === 'pending' ? 'bg-amber-100' : 'bg-muted'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : item.status === 'pending' ? (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      {index < mockMatter.timeline.length - 1 && (
                        <div className={`absolute top-8 w-0.5 h-full ${
                          item.status === 'completed' ? 'bg-green-200' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString('es', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Documentos asociados al expediente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMatter.documents.map((doc) => (
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
                          {new Date(doc.date).toLocaleDateString('es')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Historial completo</CardTitle>
              <CardDescription>Todas las acciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMatter.timeline.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-start gap-4 p-4 rounded-lg border"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      item.status === 'completed' ? 'bg-green-100' :
                      item.status === 'pending' ? 'bg-amber-100' : 'bg-muted'
                    }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : item.status === 'pending' ? (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{item.action}</p>
                        <Badge variant="outline" className={
                          item.status === 'completed' ? 'bg-green-50' :
                          item.status === 'pending' ? 'bg-amber-50' : ''
                        }>
                          {item.status === 'completed' ? 'Completado' :
                           item.status === 'pending' ? 'En proceso' : 'Pendiente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(item.date).toLocaleDateString('es', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
