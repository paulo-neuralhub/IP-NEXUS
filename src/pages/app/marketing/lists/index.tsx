import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useContactLists, useDeleteContactList } from '@/hooks/use-marketing';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ContactListPage() {
  const [search, setSearch] = useState('');
  const { data: lists, isLoading } = useContactLists();
  const deleteList = useDeleteContactList();

  const filteredLists = lists?.filter(list =>
    list.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'static': return 'Estática';
      case 'dynamic': return 'Dinámica';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar listas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button asChild>
          <Link to="/app/marketing/lists/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Lista
          </Link>
        </Button>
      </div>

      {/* Lists */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    {list.type === 'dynamic' ? (
                      <Filter className="w-6 h-6 text-primary" />
                    ) : (
                      <Users className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/marketing/lists/${list.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteList.mutate(list.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-medium mb-1">{list.name}</h3>
                {list.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {list.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getTypeLabel(list.type)}</Badge>
                    {!list.is_active && (
                      <Badge variant="secondary">Inactiva</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{list.contact_count || 0}</p>
                    <p className="text-xs text-muted-foreground">contactos</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Actualizada {list.updated_at && format(new Date(list.updated_at), 'dd MMM yyyy', { locale: es })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay listas</h3>
            <p className="text-muted-foreground mb-4">
              Crea listas para segmentar tus contactos
            </p>
            <Button asChild>
              <Link to="/app/marketing/lists/new">
                <Plus className="w-4 h-4 mr-2" />
                Crear Lista
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
