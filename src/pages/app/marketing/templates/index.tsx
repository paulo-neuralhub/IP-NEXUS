import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTemplates, useDeleteTemplate } from '@/hooks/use-marketing';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Copy, LayoutTemplate } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TEMPLATE_CATEGORIES } from '@/lib/constants/marketing';

export default function TemplateList() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: templates, isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.subject.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Sin categoría';
    const cat = TEMPLATE_CATEGORIES[category as keyof typeof TEMPLATE_CATEGORIES];
    return cat?.label || category;
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTemplate.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar plantillas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/app/marketing/templates/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Link>
        </Button>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{template.name}</CardTitle>
                    <CardDescription className="truncate">{template.subject}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/marketing/templates/${template.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteId(template.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {/* Preview placeholder */}
                <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {template.thumbnail_url ? (
                    <img 
                      src={template.thumbnail_url} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <LayoutTemplate className="w-12 h-12 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {getCategoryLabel(template.category)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {template.updated_at && format(new Date(template.updated_at), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <LayoutTemplate className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay plantillas</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera plantilla de email con nuestro editor visual
            </p>
            <Button asChild>
              <Link to="/app/marketing/templates/new">
                <Plus className="w-4 h-4 mr-2" />
                Crear Plantilla
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
