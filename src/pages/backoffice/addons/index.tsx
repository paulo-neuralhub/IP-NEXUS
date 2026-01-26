// =============================================
// PÁGINA: AddonsManagementPage (Admin)
// CRUD de add-ons
// src/pages/backoffice/addons/index.tsx
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface Addon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  icon: string | null;
  flag_emoji: string | null;
  price_monthly: number;
  price_yearly: number;
  applies_to_modules: string[] | null;
  is_popular: boolean;
  is_included_free: boolean;
  is_visible: boolean;
  display_order: number;
}

const ADDON_CATEGORIES = [
  { value: 'jurisdictions', label: '🌍 Jurisdicciones' },
  { value: 'communications', label: '📞 Comunicaciones' },
  { value: 'integrations', label: '🔌 Integraciones' },
  { value: 'storage', label: '💾 Almacenamiento' },
  { value: 'support', label: '🎯 Soporte' },
];

const SUBCATEGORIES = [
  { value: 'ip', label: 'Propiedad Intelectual' },
  { value: 'legal', label: 'Marco Legal (Genius)' },
  { value: 'spider', label: 'Territorios Spider' },
];

export default function AdminAddonsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Fetch addons
  const { data: addons, isLoading } = useQuery({
    queryKey: ['admin-addons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_addons')
        .select('*')
        .order('category')
        .order('display_order');
      if (error) throw error;
      return data as Addon[];
    },
  });

  // Fetch modules for selection
  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('code, name, icon')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
  });

  // Save mutation
  const saveAddon = useMutation({
    mutationFn: async (addon: Partial<Addon>) => {
      if (addon.id) {
        const { error } = await fromTable('platform_addons')
          .update(addon)
          .eq('id', addon.id);
        if (error) throw error;
      } else {
        const { error } = await fromTable('platform_addons')
          .insert(addon);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-addons'] });
      setIsDialogOpen(false);
      setEditingAddon(null);
      toast.success('Add-on guardado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  // Delete mutation
  const deleteAddon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('platform_addons')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-addons'] });
      toast.success('Add-on eliminado');
    },
  });

  // Toggle visibility
  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('platform_addons')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-addons'] });
    },
  });

  // Filtrar addons
  const filteredAddons = addons?.filter(a => 
    filterCategory === 'all' || a.category === filterCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add-ons</h1>
          <p className="text-muted-foreground">Gestiona los add-ons disponibles</p>
        </div>
        <Button onClick={() => { setEditingAddon(null); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Add-on
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Tabs value={filterCategory} onValueChange={setFilterCategory}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            {ADDON_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Add-on</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Aplica a</TableHead>
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
              filteredAddons?.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{addon.flag_emoji || addon.icon}</span>
                      <div>
                        <span className="font-medium">{addon.name}</span>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline">{addon.category}</Badge>
                      {addon.subcategory && (
                        <Badge variant="secondary" className="text-xs">
                          {addon.subcategory}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {addon.price_monthly === 0 ? (
                      <Badge variant="secondary">Incluido</Badge>
                    ) : (
                      <span className="font-medium">€{addon.price_monthly}/mes</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {addon.applies_to_modules?.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {addon.applies_to_modules.slice(0, 2).map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                        ))}
                        {addon.applies_to_modules.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{addon.applies_to_modules.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Todos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {addon.is_popular && (
                        <Badge variant="default" className="text-xs">Popular</Badge>
                      )}
                      {addon.is_included_free && (
                        <Badge variant="secondary" className="text-xs">Free</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibility.mutate({ 
                        id: addon.id, 
                        is_visible: !addon.is_visible 
                      })}
                    >
                      {addon.is_visible ? (
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
                        onClick={() => { setEditingAddon(addon); setIsDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('¿Eliminar este add-on?')) {
                            deleteAddon.mutate(addon.id);
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
      <AddonEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        addon={editingAddon}
        modules={modules}
        onSave={(a) => saveAddon.mutate(a)}
        isSaving={saveAddon.isPending}
      />
    </div>
  );
}

// =============================================
// Dialog de edición
// =============================================

function AddonEditDialog({ 
  open, 
  onOpenChange, 
  addon, 
  modules,
  onSave,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: Addon | null;
  modules: { code: string; name: string; icon: string | null }[];
  onSave: (a: Partial<Addon>) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Addon>>({
    code: '',
    name: '',
    description: '',
    category: 'jurisdictions',
    subcategory: null,
    icon: '🌍',
    flag_emoji: null,
    price_monthly: 0,
    price_yearly: 0,
    applies_to_modules: [],
    is_popular: false,
    is_included_free: false,
    is_visible: true,
    display_order: 0,
  });

  useEffect(() => {
    if (addon) {
      setFormData(addon);
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        category: 'jurisdictions',
        subcategory: null,
        icon: '🌍',
        flag_emoji: null,
        price_monthly: 0,
        price_yearly: 0,
        applies_to_modules: [],
        is_popular: false,
        is_included_free: false,
        is_visible: true,
        display_order: 0,
      });
    }
  }, [addon, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{addon ? 'Editar Add-on' : 'Nuevo Add-on'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!addon}
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

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
              <Label>Flag (emoji)</Label>
              <Input
                value={formData.flag_emoji || ''}
                onChange={(e) => setFormData({ ...formData, flag_emoji: e.target.value })}
                placeholder="🇪🇸"
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
                  {ADDON_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Subcategoría</Label>
              <Select
                value={formData.subcategory || 'none'}
                onValueChange={(v) => setFormData({ ...formData, subcategory: v === 'none' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {SUBCATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Precio Mensual (€)</Label>
              <Input
                type="number"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Precio Anual (€)</Label>
              <Input
                type="number"
                value={formData.price_yearly}
                onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Módulos aplicables */}
          <div>
            <Label>Aplica a módulos (vacío = todos)</Label>
            <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg bg-muted/50">
              {modules.map((mod) => (
                <Badge
                  key={mod.code}
                  variant={formData.applies_to_modules?.includes(mod.code) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = formData.applies_to_modules || [];
                    const updated = current.includes(mod.code)
                      ? current.filter((c) => c !== mod.code)
                      : [...current, mod.code];
                    setFormData({ ...formData, applies_to_modules: updated });
                  }}
                >
                  {mod.icon} {mod.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
              <span className="text-sm">Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={formData.is_included_free}
                onCheckedChange={(checked) => setFormData({ ...formData, is_included_free: checked })}
              />
              <span className="text-sm">Incluido gratis</span>
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
