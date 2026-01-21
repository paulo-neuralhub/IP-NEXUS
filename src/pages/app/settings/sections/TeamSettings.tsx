import { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  MoreVertical,
  Trash2,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useOrganization } from '@/contexts/organization-context';
import { 
  useOrganizationMembers,
  useChangeMemberRole,
  useRemoveMember 
} from '@/hooks/use-organization-members';
import { 
  useInvitations, 
  useCreateInvitation,
  useRevokeInvitation 
} from '@/hooks/use-invitations';
import { useCheckLimit } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLES = {
  owner: { label: 'Propietario', color: 'hsl(var(--module-crm))', description: 'Control total' },
  admin: { label: 'Admin', color: 'hsl(var(--module-genius))', description: 'Gestión completa' },
  member: { label: 'Miembro', color: 'hsl(var(--primary))', description: 'Acceso estándar' },
  viewer: { label: 'Visualizador', color: 'hsl(var(--muted-foreground))', description: 'Solo lectura' },
};

export default function TeamSettings() {
  const { userRole } = useOrganization();
  const { data: members = [], isLoading: loadingMembers } = useOrganizationMembers();
  const { data: invitations = [] } = useInvitations();
  const { checkLimit } = useCheckLimit();
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const usersLimit = checkLimit('max_users');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Equipo</h2>
          <p className="text-muted-foreground">Gestiona los miembros de tu organización</p>
        </div>
        
        {isAdmin && (
          <Button
            onClick={() => {
              if (!usersLimit.allowed && usersLimit.limit > 0) {
                toast.error('Has alcanzado el límite de usuarios de tu plan');
                return;
              }
              setShowInviteModal(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Invitar
          </Button>
        )}
      </div>
      
      {/* Límite de usuarios */}
      {usersLimit.limit > 0 && (
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Usuarios: {usersLimit.current} de {usersLimit.limit}
            </span>
            <span className="text-sm text-muted-foreground">
              {usersLimit.remaining} disponibles
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                usersLimit.percentage >= 90 ? "bg-destructive" :
                usersLimit.percentage >= 70 ? "bg-warning" : "bg-success"
              )}
              style={{ width: `${usersLimit.percentage}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Miembros */}
      <div className="bg-card rounded-xl border">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-foreground">
            Miembros ({members.length})
          </h3>
        </div>
        
        {loadingMembers ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="divide-y">
            {members.map((member: any) => (
              <MemberRow 
                key={member.id} 
                member={member}
                isCurrentUserOwner={isOwner}
                isCurrentUserAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Invitaciones pendientes */}
      {invitations.length > 0 && (
        <div className="bg-card rounded-xl border">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-foreground">
              Invitaciones pendientes ({invitations.length})
            </h3>
          </div>
          
          <div className="divide-y">
            {invitations.map((inv: any) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}
      
      {/* Modal de invitación */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar al equipo</DialogTitle>
          </DialogHeader>
          <InviteForm onClose={() => setShowInviteModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberRow({ member, isCurrentUserOwner, isCurrentUserAdmin }: {
  member: any;
  isCurrentUserOwner: boolean;
  isCurrentUserAdmin: boolean;
}) {
  const changeRoleMutation = useChangeMemberRole();
  const removeMutation = useRemoveMember();
  
  const roleConfig = ROLES[member.role as keyof typeof ROLES] || ROLES.member;
  const canManage = isCurrentUserOwner || (isCurrentUserAdmin && member.role !== 'owner');
  
  const handleChangeRole = async (newRole: string) => {
    try {
      await changeRoleMutation.mutateAsync({ userId: member.user_id, role: newRole });
      toast.success('Rol actualizado');
    } catch {
      toast.error('Error al cambiar rol');
    }
  };
  
  const handleRemove = async () => {
    if (!confirm('¿Eliminar este miembro del equipo?')) return;
    
    try {
      await removeMutation.mutateAsync(member.user_id);
      toast.success('Miembro eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          {member.user?.avatar_url ? (
            <img src={member.user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <span className="text-lg font-medium text-muted-foreground">
              {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
            </span>
          )}
        </div>
        
        <div>
          <p className="font-medium text-foreground">
            {member.user?.full_name || 'Sin nombre'}
          </p>
          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span 
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{ 
            backgroundColor: `${roleConfig.color}20`,
            color: roleConfig.color,
          }}
        >
          {roleConfig.label}
        </span>
        
        {canManage && member.role !== 'owner' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <p className="px-2 py-1 text-xs text-muted-foreground">Cambiar rol</p>
              {Object.entries(ROLES).filter(([k]) => k !== 'owner').map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleChangeRole(key)}
                  className={cn(member.role === key && "bg-muted")}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleRemove}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function InvitationRow({ invitation }: { invitation: any }) {
  const revokeMutation = useRevokeInvitation();
  
  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync(invitation.id);
      toast.success('Invitación revocada');
    } catch {
      toast.error('Error al revocar');
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Mail className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div>
          <p className="font-medium text-foreground">{invitation.email}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expira {format(new Date(invitation.expires_at), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-xs bg-warning/20 text-warning rounded-full">
          Pendiente
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRevoke}
          className="text-muted-foreground hover:text-destructive"
          title="Revocar"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const createMutation = useCreateInvitation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ email, role });
      toast.success('Invitación enviada');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al invitar');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@empresa.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLES).filter(([k]) => k !== 'owner').map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label} - {config.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Enviando...' : 'Enviar invitación'}
        </Button>
      </div>
    </form>
  );
}
