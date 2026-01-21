/**
 * Portal Dashboard
 * Vista principal del cliente en el portal
 */

import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp
} from 'lucide-react';

export default function PortalDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = usePortalAuth();

  // Mock data for demo - en producción vendría de hooks con Supabase
  const stats = {
    activeMatters: 12,
    pendingDocuments: 3,
    pendingInvoices: 2,
    unreadMessages: 5,
    upcomingDeadlines: 4,
  };

  const recentMatters = [
    { id: '1', reference: 'TM-2025-001', title: 'Marca NEXUS', status: 'active', type: 'trademark' },
    { id: '2', reference: 'PT-2025-003', title: 'Patente IoT Device', status: 'pending', type: 'patent' },
    { id: '3', reference: 'TM-2024-089', title: 'Marca ACME Corp', status: 'active', type: 'trademark' },
  ];

  const pendingActions = [
    { id: '1', type: 'document', title: 'Firmar poder de representación', matter: 'TM-2025-001' },
    { id: '2', type: 'approval', title: 'Aprobar respuesta a oposición', matter: 'TM-2024-089' },
    { id: '3', type: 'payment', title: 'Pago tasas renovación', matter: 'PT-2025-003' },
  ];

  const upcomingDeadlines = [
    { id: '1', date: '2026-02-15', title: 'Renovación marca NEXUS', matter: 'TM-2025-001' },
    { id: '2', date: '2026-03-01', title: 'Respuesta examen de fondo', matter: 'PT-2025-003' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user?.name || 'Cliente'}
        </h1>
        <p className="text-muted-foreground">
          Resumen de tu cartera de propiedad intelectual
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
                <p className="text-xs text-muted-foreground">Expedientes</p>
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
                <p className="text-xs text-muted-foreground">Docs pendientes</p>
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
                <p className="text-xs text-muted-foreground">Facturas</p>
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
                <p className="text-xs text-muted-foreground">Mensajes</p>
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
                <p className="text-xs text-muted-foreground">Plazos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Acciones Pendientes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Acciones Pendientes
              </CardTitle>
              <CardDescription>Requieren tu atención</CardDescription>
            </div>
            <Badge variant="outline">{pendingActions.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div 
                  key={action.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      action.type === 'payment' ? 'bg-red-500' : 
                      action.type === 'document' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.matter}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Plazos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Próximos Plazos
            </CardTitle>
            <CardDescription>Vencimientos importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {new Date(deadline.date).getDate()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {new Date(deadline.date).toLocaleDateString('es', { month: 'short' })}
                    </p>
                  </div>
                  <div className="flex-1 border-l pl-3">
                    <p className="font-medium text-sm">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">{deadline.matter}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4" asChild>
              <Link to={`/portal/${slug}/matters`}>Ver todos los plazos</Link>
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
              Expedientes Recientes
            </CardTitle>
            <CardDescription>Últimos expedientes activos</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/portal/${slug}/matters`}>Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMatters.map((matter) => (
              <Link 
                key={matter.id}
                to={`/portal/${slug}/matters/${matter.id}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    matter.type === 'trademark' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <CheckCircle2 className={`w-5 h-5 ${
                      matter.type === 'trademark' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
