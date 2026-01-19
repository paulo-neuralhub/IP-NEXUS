// ============================================================
// IP-NEXUS BACKOFFICE - ANNOUNCEMENTS MANAGEMENT
// ============================================================

import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useHelpAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/hooks/help/useHelpAnnouncements';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const typeConfig: Record<string, { label: string; color: string }> = {
  feature: { label: 'Nueva Función', color: 'bg-green-500' },
  improvement: { label: 'Mejora', color: 'bg-blue-500' },
  fix: { label: 'Corrección', color: 'bg-yellow-500' },
  security: { label: 'Seguridad', color: 'bg-red-500' },
  deprecation: { label: 'Deprecación', color: 'bg-orange-500' },
};

export default function AnnouncementsManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  
  const { data: announcements = [], isLoading } = useHelpAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    announcement_type: 'feature' as string,
    is_active: true,
    is_featured: false,
    learn_more_url: '',
  });

  const handleOpenDialog = (announcement?: any) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setForm({
        title: announcement.title,
        summary: announcement.summary || '',
        content: announcement.content || '',
        announcement_type: announcement.announcement_type,
        is_active: announcement.is_active,
        is_featured: announcement.is_featured || false,
        learn_more_url: announcement.learn_more_url || '',
      });
    } else {
      setEditingAnnouncement(null);
      setForm({
        title: '',
        summary: '',
        content: '',
        announcement_type: 'feature',
        is_active: true,
        is_featured: false,
        learn_more_url: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('El título es requerido');
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement.mutateAsync({ id: editingAnnouncement.id, ...form });
        toast.success('Anuncio actualizado');
      } else {
        await createAnnouncement.mutateAsync(form);
        toast.success('Anuncio creado');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al guardar el anuncio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;
    
    try {
      await deleteAnnouncement.mutateAsync(id);
      toast.success('Anuncio eliminado');
    } catch (error) {
      toast.error('Error al eliminar el anuncio');
    }
  };

  const handleToggleActive = async (announcement: any) => {
    try {
      await updateAnnouncement.mutateAsync({ 
        id: announcement.id, 
        is_active: !announcement.is_active 
      });
      toast.success(`Anuncio ${announcement.is_active ? 'desactivado' : 'activado'}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Gestiona anuncios y novedades para los usuarios
        </p>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Anuncio
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Cargando...
            </CardContent>
          </Card>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay anuncios. Crea el primero.
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${typeConfig[announcement.announcement_type]?.color || 'bg-muted'}`}>
                    <Megaphone className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                      <Badge variant="outline">
                        {typeConfig[announcement.announcement_type]?.label || announcement.announcement_type}
                      </Badge>
                      {announcement.is_featured && (
                        <Badge>Destacado</Badge>
                      )}
                    </div>
                    {announcement.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.summary}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(announcement.publish_at || announcement.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Título del anuncio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.announcement_type}
                  onValueChange={(v) => setForm({ ...form, announcement_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL (opcional)</Label>
                <Input
                  value={form.learn_more_url}
                  onChange={(e) => setForm({ ...form, learn_more_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumen</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Breve resumen del anuncio"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Contenido completo (Markdown)"
                rows={6}
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                />
                <span className="text-sm">Activo</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                />
                <span className="text-sm">Destacado</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={createAnnouncement.isPending || updateAnnouncement.isPending}>
              {editingAnnouncement ? 'Guardar Cambios' : 'Crear Anuncio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
