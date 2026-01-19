// ============================================================
// IP-NEXUS BACKOFFICE - ARTICLES MANAGEMENT
// ============================================================

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useHelpArticles, useHelpCategories, useCreateHelpArticle, useUpdateHelpArticle, useDeleteHelpArticle } from '@/hooks/help/useHelpArticles';
import { toast } from 'sonner';

export default function ArticlesManagementPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  
  const { data: articles = [], isLoading } = useHelpArticles({});
  const { data: categories = [] } = useHelpCategories();
  const createArticle = useCreateHelpArticle();
  const updateArticle = useUpdateHelpArticle();
  const deleteArticle = useDeleteHelpArticle();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    is_featured: false,
  });

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (article?: any) => {
    if (article) {
      setEditingArticle(article);
      setForm({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || '',
        category_id: article.category_id,
        status: article.status,
        is_featured: article.is_featured,
      });
    } else {
      setEditingArticle(null);
      setForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category_id: '',
        status: 'draft',
        is_featured: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.content || !form.category_id) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      if (editingArticle) {
        await updateArticle.mutateAsync({ id: editingArticle.id, ...form });
        toast.success('Artículo actualizado');
      } else {
        await createArticle.mutateAsync(form);
        toast.success('Artículo creado');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el artículo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
    
    try {
      await deleteArticle.mutateAsync(id);
      toast.success('Artículo eliminado');
    } catch (error) {
      toast.error('Error al eliminar el artículo');
    }
  };

  const handleToggleStatus = async (article: any) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await updateArticle.mutateAsync({ id: article.id, status: newStatus });
      toast.success(`Artículo ${newStatus === 'published' ? 'publicado' : 'despublicado'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vistas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay artículos
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">/{article.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {categories.find(c => c.id === article.category_id)?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.view_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(article)}
                        >
                          {article.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(article)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Título del artículo"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="url-del-articulo"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: any) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Extracto</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Breve descripción del artículo"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Contenido del artículo (Markdown)"
                rows={10}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
              />
              <Label>Artículo destacado</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createArticle.isPending || updateArticle.isPending}>
              {editingArticle ? 'Guardar Cambios' : 'Crear Artículo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
