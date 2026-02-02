// =====================================================
// IP-NEXUS - CLIENT HOLDERS TAB (PROMPT 27)
// Gestión de titulares vinculados al cliente
// =====================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  User,
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  Briefcase,
  TrendingUp,
  Link2,
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ClientHolder {
  id: string;
  relationship_type: string;
  client_reference: string;
  jurisdictions: string[];
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  holder: {
    id: string;
    holder_code: string;
    legal_name: string;
    trade_name: string;
    holder_type: string;
    tax_id: string;
    country: string;
    city: string;
    email: string;
    phone: string;
  };
  matters_count?: number;
  active_matters?: number;
}

interface ClientHoldersTabProps {
  clientId: string;
  clientName: string;
}

export function ClientHoldersTab({ clientId, clientName }: ClientHoldersTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedHolder, setSelectedHolder] = useState<ClientHolder | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data: holders = [], isLoading } = useQuery({
    queryKey: ['client-holders', clientId],
    queryFn: async () => {
      const { data, error } = await fromTable('client_holders')
        .select(`
          id,
          relationship_type,
          client_reference,
          jurisdictions,
          effective_from,
          effective_to,
          is_active,
          holder:holder_id(
            id, holder_code, legal_name, trade_name, holder_type, 
            tax_id, country, city, email, phone
          )
        `)
        .eq('account_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ClientHolder[];
    },
    enabled: !!clientId,
  });

  const unlinkMutation = useMutation({
    mutationFn: async (clientHolderId: string) => {
      const { error } = await fromTable('client_holders')
        .update({ is_active: false })
        .eq('id', clientHolderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-holders'] });
      toast({ title: 'Titular desvinculado' });
    },
  });

  const handleUnlinkHolder = (clientHolderId: string) => {
    if (!confirm('¿Desvincular este titular del cliente?')) return;
    unlinkMutation.mutate(clientHolderId);
  };

  const filteredHolders = holders.filter(ch => {
    if (!ch.holder) return false;
    const searchLower = search.toLowerCase();
    return (
      ch.holder.legal_name?.toLowerCase().includes(searchLower) ||
      ch.holder.trade_name?.toLowerCase().includes(searchLower) ||
      ch.holder.tax_id?.toLowerCase().includes(searchLower) ||
      ch.holder.holder_code?.toLowerCase().includes(searchLower) ||
      ch.holder.country?.toLowerCase().includes(searchLower)
    );
  });

  const relationshipLabels: Record<string, { label: string; color: string }> = {
    representation: { label: 'Representación', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    subsidiary: { label: 'Subsidiaria', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    affiliate: { label: 'Afiliada', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    licensor: { label: 'Licenciante', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    licensee: { label: 'Licenciatario', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' },
  };

  // Estadísticas
  const stats = {
    total: holders.length,
    totalMatters: holders.reduce((sum, h) => sum + (h.matters_count || 0), 0),
    activeMatters: holders.reduce((sum, h) => sum + (h.active_matters || 0), 0),
    countries: new Set(holders.map(h => h.holder?.country).filter(Boolean)).size,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Titulares</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMatters}</p>
                <p className="text-xs text-muted-foreground">Expedientes totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeMatters}</p>
                <p className="text-xs text-muted-foreground">Expedientes activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.countries}</p>
                <p className="text-xs text-muted-foreground">Países</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar titular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Link2 className="w-4 h-4 mr-2" />
            Vincular existente
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo titular
          </Button>
        </div>
      </div>

      {/* Tabla de titulares */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titular</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Relación</TableHead>
              <TableHead>Jurisdicciones</TableHead>
              <TableHead>Expedientes</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-medium">No hay titulares vinculados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {search ? 'No se encontraron resultados para tu búsqueda' : 'Añade titulares para este cliente'}
                    </p>
                    {!search && (
                      <Button className="mt-4" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir primer titular
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredHolders.map((ch) => {
                if (!ch.holder) return null;
                const rel = relationshipLabels[ch.relationship_type] || relationshipLabels.representation;
                
                return (
                  <TableRow key={ch.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {ch.holder.holder_type === 'individual' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              ch.holder.legal_name?.substring(0, 2).toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ch.holder.legal_name}</p>
                          {ch.holder.trade_name && ch.holder.trade_name !== ch.holder.legal_name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {ch.holder.trade_name}
                            </p>
                          )}
                          {ch.client_reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {ch.client_reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{ch.holder.holder_code}</p>
                        <p className="text-sm">{ch.holder.tax_id || '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ch.holder.country || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", rel.color)}>{rel.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ch.jurisdictions?.slice(0, 3).map((j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {j}
                          </Badge>
                        ))}
                        {ch.jurisdictions && ch.jurisdictions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{ch.jurisdictions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{ch.matters_count || 0}</span>
                        {(ch.active_matters || 0) > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({ch.active_matters} activos)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ch.effective_from ? format(new Date(ch.effective_from), 'dd/MM/yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelectedHolder(ch); setDetailDialogOpen(true); }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar relación
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Ver expedientes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUnlinkHolder(ch.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Desvincular
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog detalle titular */}
      {selectedHolder && selectedHolder.holder && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedHolder.holder.legal_name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedHolder.holder.legal_name}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedHolder.holder.holder_code}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Razón social</p>
                  <p className="text-sm font-medium">{selectedHolder.holder.legal_name}</p>
                </div>
                {selectedHolder.holder.trade_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nombre comercial</p>
                    <p className="text-sm font-medium">{selectedHolder.holder.trade_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Identificación fiscal</p>
                  <p className="text-sm font-medium">{selectedHolder.holder.tax_id || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">País</p>
                  <p className="text-sm font-medium">{selectedHolder.holder.country}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium">{selectedHolder.holder.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                  <p className="text-sm font-medium">{selectedHolder.holder.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Relación con {clientName}</p>
                  <Badge className={cn(relationshipLabels[selectedHolder.relationship_type]?.color)}>
                    {relationshipLabels[selectedHolder.relationship_type]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expedientes</p>
                  <p className="text-sm font-medium">
                    {selectedHolder.matters_count || 0} total ({selectedHolder.active_matters || 0} activos)
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => navigate(`/app/expedientes?holder=${selectedHolder.holder.id}`)}>
                <FileText className="w-4 h-4 mr-2" />
                Ver expedientes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
