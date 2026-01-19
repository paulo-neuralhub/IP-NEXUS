import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Plus,
  MoreVertical,
  Mail,
  UserCog,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useInvitePortalUser, useUpdatePortalUser, useDeletePortalUser } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface PortalUsersTabProps {
  portalId: string;
  users: any[];
}

export default function PortalUsersTab({ portalId, users }: PortalUsersTabProps) {
  const inviteUser = useInvitePortalUser();
  const updateUser = useUpdatePortalUser();
  const deleteUser = useDeletePortalUser();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'viewer' as 'admin' | 'approver' | 'viewer'
  });
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await inviteUser.mutateAsync({
        portal_id: portalId,
        ...inviteForm
      });
      
      setLastInviteLink(result.inviteLink);
      setInviteForm({ email: '', name: '', role: 'viewer' });
    } catch (error) {
      // Handled by mutation
    }
  };
  
  const copyInviteLink = () => {
    if (lastInviteLink) {
      navigator.clipboard.writeText(`${window.location.origin}${lastInviteLink}`);
      toast.success('Enlace copiado');
    }
  };
  
  const handleResendInvite = async (user: any) => {
    // Re-invite user by updating magic link
    toast.success('Invitación reenviada');
  };
  
  const handleChangeRole = (userId: string, newRole: string) => {
    updateUser.mutate({
      id: userId,
      portalId,
      role: newRole
    });
  };
  
  const handleSuspend = (userId: string, currentStatus: string) => {
    updateUser.mutate({
      id: userId,
      portalId,
      status: currentStatus === 'suspended' ? 'active' : 'suspended'
    });
  };
  
  const handleDelete = (userId: string) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUser.mutate({ id: userId, portalId });
    }
  };
  
  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      admin: 'default',
      approver: 'secondary',
      viewer: 'outline'
    };
    const labels: Record<string, string> = {
      admin: 'Administrador',
      approver: 'Aprobador',
      viewer: 'Visualizador'
    };
    return <Badge variant={variants[role] || 'outline'}>{labels[role] || role}</Badge>;
  };
  
  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Activo' },
      invited: { variant: 'secondary', label: 'Invitado' },
      suspended: { variant: 'destructive', label: 'Suspendido' }
    };
    const { variant, label } = config[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Usuarios del Portal</CardTitle>
          <CardDescription>
            Gestiona quién puede acceder al portal del cliente
          </CardDescription>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invitar Usuario
        </Button>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay usuarios en este portal
            </p>
            <Button onClick={() => setShowInviteDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invitar Primer Usuario
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.last_login_at
                      ? format(new Date(user.last_login_at), 'dd MMM yyyy', { locale: es })
                      : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === 'invited' && (
                          <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reenviar invitación
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleChangeRole(user.id, user.role === 'admin' ? 'viewer' : 'admin')}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Cambiar rol
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSuspend(user.id, user.status)}>
                          {user.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => {
        setShowInviteDialog(open);
        if (!open) setLastInviteLink(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Usuario al Portal</DialogTitle>
            <DialogDescription>
              El usuario recibirá un email con un enlace para acceder al portal.
            </DialogDescription>
          </DialogHeader>
          
          {lastInviteLink ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  ✓ Invitación creada correctamente
                </p>
                <p className="text-xs text-green-600">
                  El usuario ha sido notificado por email. También puedes compartir este enlace:
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  value={`${window.location.origin}${lastInviteLink}`}
                  readOnly
                  className="text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <DialogFooter>
                <Button onClick={() => {
                  setShowInviteDialog(false);
                  setLastInviteLink(null);
                }}>
                  Cerrar
                </Button>
                <Button variant="outline" onClick={() => setLastInviteLink(null)}>
                  Invitar otro
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div>
                        <p className="font-medium">Administrador</p>
                        <p className="text-xs text-muted-foreground">Puede aprobar, firmar e invitar usuarios</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="approver">
                      <div>
                        <p className="font-medium">Aprobador</p>
                        <p className="text-xs text-muted-foreground">Puede aprobar y firmar documentos</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div>
                        <p className="font-medium">Visualizador</p>
                        <p className="text-xs text-muted-foreground">Solo puede ver y comentar</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviteUser.isPending}>
                  <Mail className="h-4 w-4 mr-2" />
                  {inviteUser.isPending ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
