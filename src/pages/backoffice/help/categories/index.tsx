// ============================================================
// IP-NEXUS BACKOFFICE - CATEGORIES MANAGEMENT
// ============================================================

import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHelpCategories, useCreateHelpCategory, useUpdateHelpCategory, useDeleteHelpCategory } from '@/hooks/help/useHelpArticles';
import { toast } from 'sonner';

const ICONS = ['📚', '🚀', '💡', '🔧', '📊', '🎯', '💰', '🔒', '📱', '🌐', '⚡', '📝'];

export default function CategoriesManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const { data: categories = [], isLoading } = useHelpCategories();
  const createCategory = useCreateHelpCategory();
  const updateCategory = useUpdateHelpCategory();
  const deleteCategory = useDeleteHelpCategory();

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '📚',
  });

  const handleOpenDialog = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '📚',
      });
    } else {
      setEditingCategory(null);
      setForm({
        name: '',
        slug: '',
        description: '',
        icon: '📚',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast.error('Nombre y slug son requeridos');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...form });
        toast.success('Categoría actualizada');
      } else {
        await createCategory.mutateAsync({ ...form, position: categories.length });
        toast.success('Categoría creada');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar la categoría');
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category?.article_count && category.article_count > 0) {
      toast.error('No puedes eliminar una categoría con artículos');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
      await deleteCategory.mutateAsync(id);
      toast.success('Categoría eliminada');
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Organiza los artículos de ayuda en categorías
        </p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Cargando...
            </CardContent>
          </Card>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay categorías. Crea la primera.
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <span className="text-3xl">{category.icon}</span>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description || 'Sin descripción'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      /{category.slug} • {category.article_count || 0} artículos
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      disabled={!!category.article_count && category.article_count > 0}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`p-2 text-2xl rounded-lg border transition-colors ${
                      form.icon === icon 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="url-de-la-categoria"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción de la categoría"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createCategory.isPending || updateCategory.isPending}>
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
