/**
 * Roles Management Page
 * Settings → Team → Roles
 */

import { useState } from 'react';
import { 
  Shield, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Check,
  Users,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  useRoles, 
  usePermissionDefinitions,
  useRolePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useUpdateRolePermissions,
  groupPermissionsByModule,
  type Role,
  type PermissionDefinition
} from '@/hooks/use-roles';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const MODULE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  docket: { label: 'Docket', icon: '📁', color: 'hsl(var(--module-docket))' },
  crm: { label: 'CRM', icon: '👥', color: 'hsl(var(--module-crm))' },
  spider: { label: 'Spider', icon: '🕷️', color: 'hsl(var(--module-spider))' },
  marketing: { label: 'Marketing', icon: '📣', color: 'hsl(var(--module-marketing))' },
  finance: { label: 'Finance', icon: '💰', color: 'hsl(var(--module-finance))' },
  genius: { label: 'Genius', icon: '🧠', color: 'hsl(var(--module-genius))' },
  datahub: { label: 'Data Hub', icon: '🔗', color: 'hsl(var(--module-datahub))' },
  dashboard: { label: 'Dashboard', icon: '📊', color: 'hsl(var(--module-dashboard))' },
  settings: { label: 'Configuración', icon: '⚙️', color: 'hsl(var(--muted-foreground))' },
  organization: { label: 'Organización', icon: '🏢', color: 'hsl(var(--primary))' },
  billing: { label: 'Facturación', icon: '💳', color: 'hsl(var(--module-finance))' },
  reports: { label: 'Reportes', icon: '📈', color: 'hsl(var(--info))' },
};

export default function RolesSettingsPage() {
  const { data: roles = [], isLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  const systemRoles = roles.filter(r => r.is_system);
  const customRoles = roles.filter(r => !r.is_system);
  
  return (
    <PermissionGate permission="settings.roles" showDenied>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Roles y Permisos
            </h1>
            <p className="text-muted-foreground">
              Gestiona los roles y permisos de tu organización
            </p>
          </div>
          
          <PermissionGate permission="settings.roles">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> Crear rol
            </Button>
          </PermissionGate>
        </div>
        
        {/* System Roles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Roles del sistema
          </h2>
          <p className="text-sm text-muted-foreground">
            Estos roles vienen predefinidos y no pueden ser eliminados.
          </p>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="grid gap-3">
              {systemRoles.map(role => (
                <RoleCard 
                  key={role.id} 
                  role={role}
                  onSelect={() => {
                    setSelectedRole(role);
                    setShowPermissionsModal(true);
                  }}
                  onEdit={() => {
                    if (role.is_editable) {
                      setSelectedRole(role);
                      setShowEditModal(true);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Custom Roles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles personalizados
          </h2>
          <p className="text-sm text-muted-foreground">
            Crea roles personalizados para tu organización.
          </p>
          
          {customRoles.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                No hay roles personalizados aún
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Crear primer rol
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {customRoles.map(role => (
                <RoleCard 
                  key={role.id} 
                  role={role}
                  onSelect={() => {
                    setSelectedRole(role);
                    setShowPermissionsModal(true);
                  }}
                  onEdit={() => {
                    setSelectedRole(role);
                    setShowEditModal(true);
                  }}
                  onDelete={() => {
                    setSelectedRole(role);
                  }}
                  canDelete
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Create Role Modal */}
        <CreateRoleModal 
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />
        
        {/* Edit Role Modal */}
        {selectedRole && (
          <EditRoleModal 
            open={showEditModal}
            onOpenChange={setShowEditModal}
            role={selectedRole}
          />
        )}
        
        {/* Permissions Modal */}
        {selectedRole && (
          <PermissionsModal
            open={showPermissionsModal}
            onOpenChange={setShowPermissionsModal}
            role={selectedRole}
          />
        )}
      </div>
    </PermissionGate>
  );
}

// Role Card Component
function RoleCard({ 
  role, 
  onSelect, 
  onEdit,
  onDelete,
  canDelete = false 
}: { 
  role: Role;
  onSelect: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const deleteMutation = useDeleteRole();
  
  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(role.id);
      toast.success('Rol eliminado');
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
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${role.color}20` }}
        >
          <Shield 
            className="w-5 h-5"
            style={{ color: role.color || 'hsl(var(--primary))' }}
          />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{role.name}</p>
            {role.is_system && (
              <Badge variant="secondary" className="text-xs">Sistema</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {role.description || `Nivel ${role.hierarchy_level}`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <Badge variant="outline" className="text-xs">
          Nivel {role.hierarchy_level}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onSelect}>
              <Shield className="w-4 h-4 mr-2" /> Ver permisos
            </DropdownMenuItem>
            {role.is_editable && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
            )}
            {canDelete && !role.is_system && (
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Create Role Modal
function CreateRoleModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [level, setLevel] = useState(50);
  
  const createMutation = useCreateRole();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        name,
        code: code || name.toLowerCase().replace(/\s+/g, '_'),
        description,
        color,
        level,
      });
      toast.success('Rol creado');
      onOpenChange(false);
      // Reset form
      setName('');
      setCode('');
      setDescription('');
      setColor('#3B82F6');
      setLevel(50);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear rol personalizado</DialogTitle>
          <DialogDescription>
            Crea un nuevo rol con permisos personalizados para tu organización.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Gestor de marcas"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Código (opcional)</Label>
            <Input
              id="code"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ej: trademark_manager"
            />
            <p className="text-xs text-muted-foreground">
              Si no se especifica, se genera automáticamente
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe las responsabilidades de este rol..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="color"
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
            
            <div className="space-y-2">
              <Label htmlFor="level">Nivel (1-100)</Label>
              <Input
                id="level"
                type="number"
                min={1}
                max={100}
                value={level}
                onChange={e => setLevel(parseInt(e.target.value) || 50)}
              />
              <p className="text-xs text-muted-foreground">
                Mayor = más permisos
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Role Modal
function EditRoleModal({ open, onOpenChange, role }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  role: Role;
}) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || '');
  const [color, setColor] = useState(role.color || '#3B82F6');
  const [level, setLevel] = useState(role.hierarchy_level);
  
  const updateMutation = useUpdateRole();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({
        roleId: role.id,
        name,
        description,
        color,
        level,
      });
      toast.success('Rol actualizado');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar rol</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="edit-color"
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
            
            <div className="space-y-2">
              <Label htmlFor="edit-level">Nivel</Label>
              <Input
                id="edit-level"
                type="number"
                min={1}
                max={100}
                value={level}
                onChange={e => setLevel(parseInt(e.target.value) || 50)}
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

// Permissions Modal
function PermissionsModal({ open, onOpenChange, role }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}) {
  const { data: allPermissions = [] } = usePermissionDefinitions();
  const { data: rolePermissions = [], isLoading } = useRolePermissions(role.id);
  const updatePermissionsMutation = useUpdateRolePermissions();
  
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize selected permissions when data loads
  useState(() => {
    if (rolePermissions.length > 0) {
      setSelectedPermissions(new Set(rolePermissions.map((p: any) => p.id)));
    }
  });
  
  const groupedPermissions = groupPermissionsByModule(allPermissions);
  const rolePermissionIds = new Set(rolePermissions.map((p: any) => p.id));
  
  const togglePermission = (permId: string) => {
    if (!role.is_editable) return;
    
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permId)) {
      newSet.delete(permId);
    } else {
      newSet.add(permId);
    }
    setSelectedPermissions(newSet);
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    try {
      await updatePermissionsMutation.mutateAsync({
        roleId: role.id,
        permissions: Array.from(selectedPermissions).map(id => ({
          permissionId: id,
          scope: 'all' as const,
        })),
      });
      toast.success('Permisos actualizados');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield 
              className="w-5 h-5"
              style={{ color: role.color || 'hsl(var(--primary))' }}
            />
            Permisos de {role.name}
          </DialogTitle>
          <DialogDescription>
            {role.is_editable 
              ? 'Selecciona los permisos que tendrá este rol.'
              : 'Este rol del sistema no puede ser modificado.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedPermissions).map(([module, permissions]) => {
                const moduleConfig = MODULE_LABELS[module] || { 
                  label: module, 
                  icon: '📦', 
                  color: 'hsl(var(--muted-foreground))' 
                };
                
                const modulePermCount = permissions.filter(p => 
                  rolePermissionIds.has(p.id) || selectedPermissions.has(p.id)
                ).length;
                
                return (
                  <AccordionItem key={module} value={module}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{moduleConfig.icon}</span>
                        <span className="font-medium">{moduleConfig.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {modulePermCount}/{permissions.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-8">
                        {permissions.map(perm => {
                          const isActive = rolePermissionIds.has(perm.id) || selectedPermissions.has(perm.id);
                          
                          return (
                            <div 
                              key={perm.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-md",
                                role.is_editable && "hover:bg-muted cursor-pointer",
                                isActive && "bg-primary/5"
                              )}
                              onClick={() => togglePermission(perm.id)}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={isActive}
                                  disabled={!role.is_editable}
                                />
                                <div>
                                  <p className="text-sm font-medium">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {perm.code}
                                  </p>
                                </div>
                              </div>
                              {isActive && (
                                <Check className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
        
        {role.is_editable && hasChanges && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedPermissions(new Set(rolePermissions.map((p: any) => p.id)));
                setHasChanges(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updatePermissionsMutation.isPending}
            >
              {updatePermissionsMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
