import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app-layout';
import { useSearch, useSavedSearches, useSaveSearch, useDeleteSavedSearch, useRecentSearches, useClearSearchHistory } from '@/hooks/use-search';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  FileText,
  User,
  Handshake,
  Clock,
  Bookmark,
  BookmarkPlus,
  Trash2,
  MoreVertical,
  X,
  Filter,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { InlineHelp } from '@/components/help';

const entityConfig = {
  matter: {
    icon: FileText,
    label: 'Expedientes',
    color: 'bg-module-docket/10 text-module-docket',
    path: '/app/docket',
  },
  contact: {
    icon: User,
    label: 'Contactos',
    color: 'bg-module-crm/10 text-module-crm',
    path: '/app/crm/contacts',
  },
  deal: {
    icon: Handshake,
    label: 'Deals',
    color: 'bg-primary/10 text-primary',
    path: '/app/crm/deals',
  },
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  const debouncedQuery = useDebounce(query, 300);
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  const entityTypes = activeTab === 'all' ? undefined : [activeTab];

  const { data: searchData, isLoading } = useSearch(
    currentOrganization?.id || '',
    {
      query: debouncedQuery,
      entityTypes,
      limit: 50,
    }
  );

  const { data: savedSearches } = useSavedSearches(
    currentOrganization?.id || '',
    user?.id || ''
  );

  const { data: recentSearches } = useRecentSearches(
    user?.id || '',
    currentOrganization?.id || ''
  );

  const saveSearch = useSaveSearch();
  const deleteSavedSearch = useDeleteSavedSearch();
  const clearHistory = useClearSearchHistory();

  // Update URL when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setSearchParams({ q: debouncedQuery });
    } else {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  const handleSaveSearch = async () => {
    if (!saveName.trim() || !currentOrganization?.id || !user?.id) return;

    await saveSearch.mutateAsync({
      organizationId: currentOrganization.id,
      userId: user.id,
      data: {
        name: saveName,
        query: debouncedQuery,
        filters: {},
        entityTypes: entityTypes || [],
      },
    });

    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleDeleteSavedSearch = async (id: string) => {
    if (!user?.id) return;
    await deleteSavedSearch.mutateAsync({ savedSearchId: id, userId: user.id });
  };

  const handleClearHistory = async () => {
    if (!user?.id || !currentOrganization?.id) return;
    await clearHistory.mutateAsync({
      userId: user.id,
      organizationId: currentOrganization.id,
    });
  };

  const handleUseSavedSearch = (saved: any) => {
    setQuery(saved.query);
    if (saved.entity_types?.length === 1) {
      setActiveTab(saved.entity_types[0]);
    } else {
      setActiveTab('all');
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-6xl py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Búsqueda Avanzada
            <InlineHelp text="Busca de forma global en expedientes, contactos y deals. Guarda búsquedas frecuentes y accede al historial de búsquedas recientes." />
          </h1>
          <p className="text-muted-foreground">
            Busca en expedientes, contactos y deals
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, referencia, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {debouncedQuery && (
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
            >
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Guardar búsqueda
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Searches */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Búsquedas guardadas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[200px]">
                  {savedSearches?.length ? (
                    <div className="divide-y">
                      {savedSearches.map((saved) => (
                        <div
                          key={saved.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleUseSavedSearch(saved)}
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{saved.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {saved.query}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSavedSearch(saved.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No hay búsquedas guardadas
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recientes
                  </CardTitle>
                  {recentSearches?.length ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={handleClearHistory}
                    >
                      Limpiar
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[150px]">
                  {recentSearches?.length ? (
                    <div className="divide-y">
                      {recentSearches.map((recent, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 cursor-pointer"
                          onClick={() => setQuery(recent.query)}
                        >
                          <span className="text-sm truncate">{recent.query}</span>
                          <span className="text-xs text-muted-foreground">
                            {recent.total_results}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Sin búsquedas recientes
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs with facets */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  Todos
                  {searchData?.total ? (
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {searchData.total}
                    </Badge>
                  ) : null}
                </TabsTrigger>
                {Object.entries(entityConfig).map(([key, config]) => (
                  <TabsTrigger key={key} value={key} className="gap-2">
                    <config.icon className="h-4 w-4" />
                    {config.label}
                    {searchData?.facets?.[key] ? (
                      <Badge variant="secondary" className="h-5 px-1.5">
                        {searchData.facets[key]}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Results list */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !debouncedQuery ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Escribe algo para empezar a buscar</p>
                  </div>
                ) : searchData?.results?.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No se encontraron resultados para "{debouncedQuery}"</p>
                    <p className="text-sm mt-2">Intenta con otros términos o filtros</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchData?.results?.map((result) => {
                      const config = entityConfig[result.entity_type as keyof typeof entityConfig];
                      if (!config) return null;
                      const Icon = config.icon;

                      return (
                        <Link
                          key={`${result.entity_type}-${result.entity_id}`}
                          to={`${config.path}/${result.entity_id}`}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn('p-2 rounded-lg', config.color)}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {result.entity_type === 'matter'
                              ? 'Expediente'
                              : result.entity_type === 'contact'
                              ? 'Contacto'
                              : 'Deal'}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guardar búsqueda</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ej: Marcas pendientes de renovación"
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Búsqueda: "{debouncedQuery}"</p>
                {activeTab !== 'all' && (
                  <p>Filtro: {entityConfig[activeTab as keyof typeof entityConfig]?.label}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSearch} disabled={!saveName.trim()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
