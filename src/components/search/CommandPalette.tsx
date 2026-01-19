import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuickSearch, useLogSearch } from '@/hooks/use-search';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import {
  FileText,
  User,
  Handshake,
  Search,
  Plus,
  Clock,
  Briefcase,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const entityIcons: Record<string, React.ElementType> = {
  matter: FileText,
  contact: User,
  deal: Handshake,
  company: Building2,
};

const actionIcons: Record<string, React.ElementType> = {
  'file-plus': Plus,
  'user-plus': User,
  handshake: Handshake,
  search: Search,
  'calendar-clock': Calendar,
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);

  const { data, isLoading } = useQuickSearch(
    currentOrganization?.id || '',
    debouncedQuery,
    user?.id || ''
  );

  const logSearch = useLogSearch();

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Reset query when closing
  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSelect = useCallback(
    (type: string, value: string) => {
      onOpenChange(false);

      // Log search if there was a query
      if (query && currentOrganization?.id && user?.id) {
        logSearch.mutate({
          organizationId: currentOrganization.id,
          userId: user.id,
          query,
          filters: {},
          entityTypes: [],
          totalResults: data?.results?.length || 0,
          source: 'command_palette',
        });
      }

      if (type === 'action') {
        navigate(value);
      } else if (type === 'matter') {
        navigate(`/app/docket/${value}`);
      } else if (type === 'contact') {
        navigate(`/app/crm/contacts/${value}`);
      } else if (type === 'deal') {
        navigate(`/app/crm/deals/${value}`);
      } else if (type === 'recent') {
        setQuery(value);
      }
    },
    [navigate, onOpenChange, query, currentOrganization?.id, user?.id, logSearch, data?.results?.length]
  );

  const handleAdvancedSearch = () => {
    onOpenChange(false);
    navigate(`/app/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl">
        <Command className="rounded-lg border-0" shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput
              placeholder="Buscar expedientes, contactos, deals..."
              value={query}
              onValueChange={setQuery}
              className="border-0 focus:ring-0"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-6 text-center text-sm">
              {query.length < 2 ? (
                <span className="text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </span>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-muted-foreground">No se encontraron resultados</span>
                  <button
                    onClick={handleAdvancedSearch}
                    className="text-primary hover:underline text-sm"
                  >
                    Búsqueda avanzada →
                  </button>
                </div>
              )}
            </CommandEmpty>

            {/* Results */}
            {data?.results && data.results.length > 0 && (
              <CommandGroup heading="Resultados">
                {data.results.map((result) => {
                  const Icon = entityIcons[result.entity_type] || FileText;
                  return (
                    <CommandItem
                      key={`${result.entity_type}-${result.entity_id}`}
                      value={`${result.entity_type}-${result.entity_id}`}
                      onSelect={() => handleSelect(result.entity_type, result.entity_id)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg',
                          result.entity_type === 'matter' && 'bg-module-docket/10 text-module-docket',
                          result.entity_type === 'contact' && 'bg-module-crm/10 text-module-crm',
                          result.entity_type === 'deal' && 'bg-primary/10 text-primary'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-medium truncate">{result.title}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {result.entity_type === 'matter'
                          ? 'Expediente'
                          : result.entity_type === 'contact'
                          ? 'Contacto'
                          : result.entity_type === 'deal'
                          ? 'Deal'
                          : result.entity_type}
                      </span>
                    </CommandItem>
                  );
                })}
                {query.length >= 2 && (
                  <CommandItem
                    onSelect={handleAdvancedSearch}
                    className="justify-center text-primary"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Ver todos los resultados
                  </CommandItem>
                )}
              </CommandGroup>
            )}

            {/* Recent searches */}
            {data?.recent && data.recent.length > 0 && !query && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Búsquedas recientes">
                  {data.recent.map((recent, idx) => (
                    <CommandItem
                      key={`recent-${idx}`}
                      value={`recent-${recent.query}`}
                      onSelect={() => handleSelect('recent', recent.query)}
                      className="flex items-center gap-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{recent.query}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {recent.total_results} resultados
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Quick actions */}
            {data?.actions && data.actions.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Acciones rápidas">
                  {data.actions.map((action) => {
                    const Icon = actionIcons[action.icon] || Briefcase;
                    return (
                      <CommandItem
                        key={action.id}
                        value={action.id}
                        onSelect={() => handleSelect('action', action.action)}
                        className="flex items-center gap-3"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{action.label}</span>
                        {action.shortcut && (
                          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            ⌘{action.shortcut}
                          </kbd>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>
              <kbd className="bg-muted px-1.5 py-0.5 rounded">↑↓</kbd> navegar
              <kbd className="bg-muted px-1.5 py-0.5 rounded ml-2">↵</kbd> seleccionar
              <kbd className="bg-muted px-1.5 py-0.5 rounded ml-2">esc</kbd> cerrar
            </span>
            <span className="text-muted-foreground/60">⌘K para abrir</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
