/**
 * Teams Management Page
 * Settings → Team → Teams
 */

import { useState } from 'react';
import { 
  Users, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useOrganizationMembers } from '@/hooks/use-organization-members';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Team {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  member_count: number;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  joined_at: string | null;
  user: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

// Hooks
function useTeams() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['teams', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members(count)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('name');
      
      if (error) throw error;
      
      return (data || []).map(t => ({
        ...t,
        member_count: t.team_members?.[0]?.count || 0,
      })) as Team[];
    },
    enabled: !!currentOrganization?.id,
  });
}

function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          joined_at,
          user:users(full_name, email, avatar_url)
        `)
        .eq('team_id', teamId);
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
}

function useCreateTeam() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (params: { name: string; description?: string; color?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: params.name,
          description: params.description,
          color: params.color || '#3B82F6',
          organization_id: currentOrganization.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { teamId: string; name?: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update({
          name: params.name,
          description: params.description,
          color: params.color,
        })
        .eq('id', params.teamId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

function useAddTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { teamId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: params.teamId,
          user_id: params.userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { teamId: string; memberId: string }) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', params.memberId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export default function TeamsSettingsPage() {
  const { data: teams = [], isLoading } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  return (
    <PermissionGate permission="settings.team" showDenied>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6" />
              Equipos
            </h1>
            <p className="text-muted-foreground">
              Organiza a los miembros en equipos para asignar permisos por grupo
            </p>
          </div>
          
          <PermissionGate permission="settings.team">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Crear equipo
            </Button>
          </PermissionGate>
        </div>
        
        {/* Teams List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : teams.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">
              No hay equipos creados aún
            </p>
            <Button variant="outline" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Crear primer equipo
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onViewMembers={() => {
                  setSelectedTeam(team);
                  setShowMembersModal(true);
                }}
                onEdit={() => {
                  setSelectedTeam(team);
                  setShowEditModal(true);
                }}
              />
            ))}
          </div>
        )}
        
        {/* Create Team Modal */}
        <CreateTeamModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />
        
        {/* Edit Team Modal */}
        {selectedTeam && (
          <EditTeamModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            team={selectedTeam}
          />
        )}
        
        {/* Team Members Modal */}
        {selectedTeam && (
          <TeamMembersModal
            open={showMembersModal}
            onOpenChange={setShowMembersModal}
            team={selectedTeam}
          />
        )}
      </div>
    </PermissionGate>
  );
}

// Team Card
function TeamCard({ team, onViewMembers, onEdit }: {
  team: Team;
  onViewMembers: () => void;
  onEdit: () => void;
}) {
  const deleteMutation = useDeleteTeam();
  
  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el equipo "${team.name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(team.id);
      toast.success('Equipo eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };
  
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-lg border bg-card",
        "hover:border-primary/50 transition-colors cursor-pointer"
      )}
      onClick={onViewMembers}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${team.color}20` }}
        >
          <Users
            className="w-5 h-5"
            style={{ color: team.color || 'hsl(var(--primary))' }}
          />
        </div>
        
        <div>
          <p className="font-medium text-foreground">{team.name}</p>
          <p className="text-sm text-muted-foreground">
            {team.description || `${team.member_count} miembros`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <Badge variant="secondary">
          {team.member_count} {team.member_count === 1 ? 'miembro' : 'miembros'}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewMembers}>
              <Users className="w-4 h-4 mr-2" /> Ver miembros
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Create Team Modal
function CreateTeamModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  
  const createMutation = useCreateTeam();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({ name, description, color });
      toast.success('Equipo creado');
      onOpenChange(false);
      setName('');
      setDescription('');
      setColor('#3B82F6');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear equipo</DialogTitle>
          <DialogDescription>
            Crea un equipo para organizar a los miembros de tu organización.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nombre</Label>
            <Input
              id="team-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Equipo de marcas"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-description">Descripción</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe el propósito de este equipo..."
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="team-color">Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="team-color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear equipo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Team Modal
function EditTeamModal({ open, onOpenChange, team }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');
  const [color, setColor] = useState(team.color || '#3B82F6');
  
  const updateMutation = useUpdateTeam();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({
        teamId: team.id,
        name,
        description,
        color,
      });
      toast.success('Equipo actualizado');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar equipo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Nombre</Label>
            <Input
              id="edit-team-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-team-description">Descripción</Label>
            <Textarea
              id="edit-team-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-team-color">Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="edit-team-color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Team Members Modal
function TeamMembersModal({ open, onOpenChange, team }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
}) {
  const { data: members = [], isLoading } = useTeamMembers(team.id);
  const { data: orgMembers = [] } = useOrganizationMembers();
  const addMemberMutation = useAddTeamMember();
  const removeMemberMutation = useRemoveTeamMember();
  
  const [showAddMember, setShowAddMember] = useState(false);
  
  const teamMemberIds = new Set(members.map(m => m.user_id));
  const availableMembers = orgMembers.filter((m: any) => !teamMemberIds.has(m.user_id));
  
  const handleAddMember = async (userId: string) => {
    try {
      await addMemberMutation.mutateAsync({ teamId: team.id, userId });
      toast.success('Miembro añadido');
    } catch (error: any) {
      toast.error(error.message || 'Error al añadir');
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ teamId: team.id, memberId });
      toast.success('Miembro eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users
              className="w-5 h-5"
              style={{ color: team.color || 'hsl(var(--primary))' }}
            />
            {team.name}
          </DialogTitle>
          <DialogDescription>
            Gestiona los miembros de este equipo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add member button */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMember(!showAddMember)}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Añadir
            </Button>
          </div>
          
          {/* Add member dropdown */}
          {showAddMember && availableMembers.length > 0 && (
            <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
              <p className="text-sm font-medium">Añadir miembro:</p>
              {availableMembers.map((m: any) => (
                <div
                  key={m.user_id}
                  className="flex items-center justify-between p-2 rounded hover:bg-background cursor-pointer"
                  onClick={() => handleAddMember(m.user_id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={m.user?.avatar_url} />
                      <AvatarFallback>
                        {m.user?.full_name?.[0] || m.user?.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {m.user?.full_name || m.user?.email}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
          
          {/* Members list */}
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay miembros en este equipo
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.user?.full_name?.[0] || member.user?.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {member.user?.full_name || 'Sin nombre'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                    {/* Team member badge - all members shown equally */}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
