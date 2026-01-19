import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Users,
  FolderOpen,
  CheckCircle,
  PenTool,
  MessageSquare,
  Activity,
  Settings,
  Copy,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useClientPortal, usePortalUsers, useSharedContent } from '@/hooks/collab';
import { usePortalApprovals, usePortalSignatures, usePortalActivity } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import PortalUsersTab from './tabs/PortalUsersTab';
import PortalApprovalsTab from './tabs/PortalApprovalsTab';
import PortalSignaturesTab from './tabs/PortalSignaturesTab';
import PortalSharedContentTab from './tabs/PortalSharedContentTab';

export default function PortalDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: portal, isLoading } = useClientPortal(id);
  const { data: users = [] } = usePortalUsers(id);
  const { data: sharedContent = [] } = useSharedContent(id);
  const { data: approvals = [] } = usePortalApprovals({ portalId: id });
  const { data: signatures = [] } = usePortalSignatures({ portalId: id });
  const { data: activity = [] } = usePortalActivity(id, 20);
  
  const [activeTab, setActiveTab] = useState('users');
  
  const portalUrl = portal?.portal_slug 
    ? `${window.location.origin}/portal/${portal.portal_slug}`
    : null;
  
  const copyPortalUrl = () => {
    if (portalUrl) {
      navigator.clipboard.writeText(portalUrl);
      toast.success('URL copiada al portapapeles');
    }
  };
  
  const pendingApprovals = approvals.filter(a => a.status === 'pending').length;
  const pendingSignatures = signatures.filter(s => ['pending', 'partially_signed'].includes(s.status)).length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }
  
  if (!portal) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Portal no encontrado</p>
        <Button variant="link" asChild>
          <Link to="/app/collab">Volver a Portales</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/collab">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{portal.portal_name || 'Portal'}</h1>
              <Badge variant={portal.is_active ? 'default' : 'secondary'}>
                {portal.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Cliente: {(portal.client as any)?.name}
            </p>
          </div>
        </div>
        
        {portalUrl && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-2">
              <Input
                value={portalUrl}
                readOnly
                className="border-0 bg-transparent w-64 text-sm"
              />
              <Button variant="ghost" size="icon" onClick={copyPortalUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" asChild>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Portal
              </a>
            </Button>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios</p>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">{activeUsers} activos</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprobaciones</p>
                <p className="text-2xl font-bold">{approvals.length}</p>
                <p className="text-xs text-amber-600">{pendingApprovals} pendientes</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Firmas</p>
                <p className="text-2xl font-bold">{signatures.length}</p>
                <p className="text-xs text-purple-600">{pendingSignatures} pendientes</p>
              </div>
              <PenTool className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contenido</p>
                <p className="text-2xl font-bold">{sharedContent.length}</p>
                <p className="text-xs text-muted-foreground">elementos compartidos</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
            {users.length > 0 && <Badge variant="secondary">{users.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprobaciones
            {pendingApprovals > 0 && <Badge variant="destructive">{pendingApprovals}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="signatures" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Firmas
            {pendingSignatures > 0 && <Badge variant="destructive">{pendingSignatures}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <PortalUsersTab portalId={id!} users={users} />
        </TabsContent>
        
        <TabsContent value="content" className="mt-6">
          <PortalSharedContentTab portalId={id!} sharedContent={sharedContent} />
        </TabsContent>
        
        <TabsContent value="approvals" className="mt-6">
          <PortalApprovalsTab portalId={id!} approvals={approvals} />
        </TabsContent>
        
        <TabsContent value="signatures" className="mt-6">
          <PortalSignaturesTab portalId={id!} signatures={signatures} />
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el portal</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay actividad registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {activity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p>
                          <span className="font-medium">{log.actor_name}</span>
                          {' '}
                          <span className="text-muted-foreground">{log.action}</span>
                          {log.resource_name && (
                            <> · <span>{log.resource_name}</span></>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
