// =============================================
// PÁGINA: ModulesManagementPage (Admin)
// CRUD de módulos principales
// src/pages/backoffice/modules/index.tsx
// =============================================

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye,
  EyeOff,
  GripVertical,
  Star,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Module {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  tagline: string | null;
  category: string;
  section: string | null;
  icon: string | null;
  icon_lucide: string | null;
  color_primary: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  features: unknown;
  requires_modules: string[] | null;
  is_core: boolean;
  is_popular: boolean;
  is_coming_soon: boolean;
  is_visible: boolean;
  display_order: number;
}

const CATEGORIES = [
  { value: 'core', label: 'Core' },
  { value: 'intelligence', label: 'Inteligencia' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'extensions', label: 'Extensiones' },
];

const SECTIONS = [
  { value: 'gestion', label: 'Gestión' },
  { value: 'inteligencia', label: 'Inteligencia' },
  { value: 'operaciones', label: 'Operaciones' },
  { value: 'extensiones', label: 'Extensiones' },
];

export default function AdminModulesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Fetch modules
  const { data: modules, isLoading } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return (data || []) as unknown as Module[];
    },
  });

  // Save mutation
  const saveModule = useMutation({
    mutationFn: async (module: Partial<Module>) => {
      if (module.id) {
        const { error } = await fromTable('platform_modules')
          .update(module)
          .eq('id', module.id);
        if (error) throw error;
      } else {
        const { error } = await fromTable('platform_modules')
          .insert(module);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      setIsDialogOpen(false);
      setEditingModule(null);
      toast.success('Módulo guardado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  // Delete mutation
  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_modules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      toast.success('Módulo eliminado');
    },
  });

  // Toggle visibility
  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('platform_modules')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Módulos</h1>
          <p className="text-muted-foreground">Gestiona los módulos principales de la plataforma</p>
        </div>
        <Button onClick={() => { setEditingModule(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Módulo
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Dependencias</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : (
              modules?.map((mod) => (
                <TableRow key={mod.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mod.icon}</span>
                      <div>
                        <span className="font-medium">{mod.name}</span>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {mod.tagline}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{mod.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">€{mod.price_monthly || 0}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </TableCell>
                  <TableCell>
                    {mod.requires_modules?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {mod.requires_modules.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Ninguna</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mod.is_core && <Badge className="text-xs">Core</Badge>}
                      {mod.is_popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                      {mod.is_coming_soon && <Badge variant="outline" className="text-xs">Próximo</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility.mutate({ id: mod.id, is_visible: !mod.is_visible })}
                    >
                      {mod.is_visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditingModule(mod); setIsDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('¿Eliminar este módulo?')) {
                            deleteModule.mutate(mod.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <ModuleEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        module={editingModule}
        allModules={modules || []}
        onSave={(mod) => saveModule.mutate(mod)}
        isSaving={saveModule.isPending}
      />
    </div>
  );
}

// =============================================
// Subcomponente: Dialog de edición
// =============================================

function ModuleEditDialog({ 
  open, 
  onOpenChange, 
  module, 
  allModules,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
  allModules: Module[];
  onSave: (mod: Partial<Module>) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Module>>({
    code: '',
    name: '',
    short_name: '',
    description: '',
    tagline: '',
    category: 'core',
    section: 'gestion',
    icon: '📦',
    color_primary: '#3B82F6',
    price_monthly: 0,
    price_yearly: 0,
    features: [],
    requires_modules: [],
    is_core: false,
    is_popular: false,
    is_coming_soon: false,
    is_visible: true,
    display_order: 0,
  });

  // Actualizar cuando cambia el módulo
  useEffect(() => {
    if (module) {
      setFormData(module);
    } else {
      setFormData({
        code: '',
        name: '',
        short_name: '',
        description: '',
        tagline: '',
        category: 'core',
        section: 'gestion',
        icon: '📦',
        color_primary: '#3B82F6',
        price_monthly: 0,
        price_yearly: 0,
        features: [],
        requires_modules: [],
        is_core: false,
        is_popular: false,
        is_coming_soon: false,
        is_visible: true,
        display_order: 0,
      });
    }
  }, [module, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!module}
              />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Icono (emoji)</Label>
              <Input
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={formData.color_primary || '#3B82F6'}
                onChange={(e) => setFormData({ ...formData, color_primary: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tagline</Label>
            <Input
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio Mensual (€)</Label>
              <Input
                type="number"
                value={formData.price_monthly || 0}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Precio Anual (€)</Label>
              <Input
                type="number"
                value={formData.price_yearly || 0}
                onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Dependencias */}
          <div>
            <Label>Requiere módulos</Label>
            <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg bg-muted/50">
              {allModules.filter(m => m.code !== formData.code).map((mod) => (
                <Badge
                  key={mod.code}
                  variant={formData.requires_modules?.includes(mod.code) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = formData.requires_modules || [];
                    const updated = current.includes(mod.code)
                      ? current.filter((c) => c !== mod.code)
                      : [...current, mod.code];
                    setFormData({ ...formData, requires_modules: updated });
                  }}
                >
                  {mod.icon} {mod.short_name || mod.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_core}
                onCheckedChange={(checked) => setFormData({ ...formData, is_core: checked })}
              />
              <span className="text-sm">Módulo Core</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
              <span className="text-sm">Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_coming_soon}
                onCheckedChange={(checked) => setFormData({ ...formData, is_coming_soon: checked })}
              />
              <span className="text-sm">Próximamente</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
              <span className="text-sm">Visible</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
