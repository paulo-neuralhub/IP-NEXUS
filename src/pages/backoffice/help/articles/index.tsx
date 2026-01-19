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
import { useAllHelpArticles, useHelpCategories, useCreateHelpArticle, useUpdateHelpArticle, useDeleteHelpArticle } from '@/hooks/help/useHelpArticles';
import { HelpArticle, CreateArticleForm } from '@/types/help';
import { toast } from 'sonner';

const articleTypes: Array<HelpArticle['article_type']> = ['guide', 'tutorial', 'faq', 'troubleshooting', 'reference', 'video'];

export default function ArticlesManagementPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  
  const { data: articles = [], isLoading } = useAllHelpArticles();
  const { data: categories = [] } = useHelpCategories();
  const createArticle = useCreateHelpArticle();
  const updateArticle = useUpdateHelpArticle();
  const deleteArticle = useDeleteHelpArticle();

  const [form, setForm] = useState<CreateArticleForm & { is_published: boolean }>({
    title: '',
    slug: '',
    content: '',
    summary: '',
    category_id: '',
    article_type: 'guide',
    is_featured: false,
    is_published: false,
  });

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (article?: HelpArticle) => {
    if (article) {
      setEditingArticle(article);
      setForm({
        title: article.title,
        slug: article.slug,
        content: article.content,
        summary: article.summary || '',
        category_id: article.category_id || '',
        article_type: article.article_type,
        is_featured: article.is_featured,
        is_published: article.is_published,
      });
    } else {
      setEditingArticle(null);
      setForm({
        title: '',
        slug: '',
        content: '',
        summary: '',
        category_id: '',
        article_type: 'guide',
        is_featured: false,
        is_published: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.content) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      if (editingArticle) {
        await updateArticle.mutateAsync({ 
          id: editingArticle.id, 
          title: form.title,
          slug: form.slug,
          content: form.content,
          summary: form.summary,
          category_id: form.category_id || null,
          article_type: form.article_type,
          is_featured: form.is_featured,
          is_published: form.is_published,
        });
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

  const handleTogglePublish = async (article: HelpArticle) => {
    try {
      await updateArticle.mutateAsync({ 
        id: article.id, 
        is_published: !article.is_published,
        published_at: !article.is_published ? new Date().toISOString() : null,
      });
      toast.success(`Artículo ${article.is_published ? 'despublicado' : 'publicado'}`);
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
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vistas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      <Badge variant="outline" className="capitalize">
                        {article.article_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.is_published ? 'default' : 'secondary'}>
                        {article.is_published ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.view_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(article)}
                        >
                          {article.is_published ? (
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
                <Label>Categoría</Label>
                <Select
                  value={form.category_id || ''}
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
                <Label>Tipo</Label>
                <Select
                  value={form.article_type}
                  onValueChange={(v: HelpArticle['article_type']) => setForm({ ...form, article_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {articleTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumen</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
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

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
                <span className="text-sm">Destacado</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                />
                <span className="text-sm">Publicado</span>
              </label>
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
