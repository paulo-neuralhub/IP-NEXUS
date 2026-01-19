import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  ExternalLink,
  Settings,
  Trash2,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useClientPortals, useDeletePortal, useUpdatePortal } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CreatePortalDialog from './CreatePortalDialog';

export default function PortalList() {
  const { data: portals = [], isLoading } = useClientPortals();
  const deletePortal = useDeletePortal();
  const updatePortal = useUpdatePortal();
  
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<string | null>(null);
  
  const filteredPortals = portals.filter(portal => {
    const searchLower = search.toLowerCase();
    return (
      portal.portal_name?.toLowerCase().includes(searchLower) ||
      (portal.client as any)?.name?.toLowerCase().includes(searchLower) ||
      (portal.client as any)?.company_name?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleToggleActive = (id: string, isActive: boolean) => {
    updatePortal.mutate({
      id,
      is_active: !isActive,
      ...(isActive ? { deactivated_at: new Date().toISOString() } : { activated_at: new Date().toISOString() })
    });
  };
  
  const handleDelete = () => {
    if (portalToDelete) {
      deletePortal.mutate(portalToDelete);
      setPortalToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portales de Cliente</h1>
          <p className="text-muted-foreground">
            Gestiona los portales de colaboración con tus clientes
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Portal
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Portal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPortals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay portales</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'No se encontraron portales con ese criterio' : 'Crea tu primer portal de cliente'}
            </p>
            {!search && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Portal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => (
            <Card key={portal.id} className={!portal.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {portal.portal_name || 'Portal sin nombre'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {(portal.client as any)?.name || 'Sin cliente'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={portal.is_active ? 'default' : 'secondary'}>
                      {portal.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/collab/${portal.id}`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/portal/${portal.portal_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Portal
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(portal.id, portal.is_active)}>
                          {portal.is_active ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setPortalToDelete(portal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Usuarios
                    </span>
                    <span className="font-medium">
                      {(portal.users as any)?.[0]?.count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Último acceso</span>
                    <span>
                      {portal.last_accessed_at
                        ? format(new Date(portal.last_accessed_at), 'dd MMM yyyy', { locale: es })
                        : 'Nunca'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total logins</span>
                    <span>{portal.total_logins || 0}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/app/collab/${portal.id}`}>
                      Gestionar Portal
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Dialog */}
      <CreatePortalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!portalToDelete} onOpenChange={() => setPortalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar portal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el portal y todos sus datos asociados (usuarios, aprobaciones, firmas, etc.).
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
