import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts, useDeleteContact } from '@/hooks/use-crm';
import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { ContactFormModal, LifecycleStageBadge } from '@/components/features/crm';
import { LIFECYCLE_STAGES, CONTACT_SOURCES } from '@/lib/constants/crm';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Plus, Search, MoreHorizontal, User, Building2,
  Users, TrendingUp, UserCheck, Calendar, X, Pencil, Trash2, Eye
} from 'lucide-react';
import type { Contact, ContactType, LifecycleStage } from '@/types/crm';

export default function ContactList() {
  usePageTitle('Contactos');
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContactType>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  // Queries
  const { data: contacts = [], isLoading } = useContacts({
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    lifecycle_stage: stageFilter === 'all' ? undefined : stageFilter as LifecycleStage,
    source: sourceFilter === 'all' ? undefined : sourceFilter,
  });
  const deleteContact = useDeleteContact();

  // Stats
  const stats = useMemo(() => {
    const all = contacts;
    const leads = all.filter(c => c.lifecycle_stage === 'lead');
    const customers = all.filter(c => c.lifecycle_stage === 'customer');
    const thisMonth = all.filter(c => {
      const date = new Date(c.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    return {
      total: all.length,
      leads: leads.length,
      customers: customers.length,
      thisMonth: thisMonth.length,
    };
  }, [contacts]);

  const handleDelete = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact.mutateAsync(deletingContact.id);
      toast.success('Contacto eliminado');
      setDeletingContact(null);
    } catch (error) {
      toast.error('Error al eliminar el contacto');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStageFilter('all');
    setSourceFilter('all');
  };

  const hasActiveFilters = search || typeFilter !== 'all' || stageFilter !== 'all' || sourceFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground">Gestiona tus contactos y relaciones comerciales</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.leads}</p>
                <p className="text-sm text-muted-foreground">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.customers}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Calendar className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">+{stats.thisMonth}</p>
                <p className="text-sm text-muted-foreground">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="person" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Personas
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              Empresas
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las etapas</SelectItem>
              {Object.entries(LIFECYCLE_STAGES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fuentes</SelectItem>
              {CONTACT_SOURCES.map((src) => (
                <SelectItem key={src.value} value={src.value}>{src.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No hay contactos"
              description={hasActiveFilters 
                ? "No se encontraron contactos con los filtros aplicados" 
                : "Crea tu primer contacto para empezar a gestionar tus relaciones"
              }
              action={!hasActiveFilters ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear contacto
                </Button>
              ) : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Última actividad</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/app/crm/contacts/${contact.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={contact.avatar_url || undefined} />
                          <AvatarFallback className={contact.type === 'company' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                            {contact.type === 'company' ? <Building2 className="w-4 h-4" /> : getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          {contact.job_title && (
                            <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contact.email || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.company_name || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.phone || contact.mobile || '-'}</TableCell>
                    <TableCell>
                      <LifecycleStageBadge stage={contact.lifecycle_stage} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {contact.last_contacted_at 
                        ? formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true, locale: es })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/crm/contacts/${contact.id}`);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingContact(contact);
                            setShowForm(true);
                          }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingContact(contact);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contact Form Modal */}
      <ContactFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        contact={editingContact}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contacto
              "{deletingContact?.name}" y toda su información asociada.
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
