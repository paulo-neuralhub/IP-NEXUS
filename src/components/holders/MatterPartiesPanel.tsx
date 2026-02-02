// =====================================================
// IP-NEXUS - MATTER PARTIES PANEL (PROMPT 26)
// Panel to manage parties (holders, opponents, etc.) in a matter
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  History,
  ArrowRightLeft,
  Building2,
  User,
  Crown,
  UserCheck,
  AlertTriangle,
  Scale,
  Briefcase,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { HolderSelector } from './HolderSelector';
import { formatDate } from '@/lib/utils';
import { PARTY_ROLE_LABELS, type PartyRole } from '@/types/holders';

interface MatterParty {
  id: string;
  matter_id: string;
  holder_id: string | null;
  external_name: string | null;
  party_role: string;
  percentage: number | null;
  share_percentage: number | null;
  is_primary: boolean;
  is_current: boolean;
  effective_from: string | null;
  effective_to: string | null;
  registration_reference: string | null;
  notes: string | null;
  holder?: {
    id: string;
    legal_name: string;
    holder_type: string;
    country: string | null;
    tax_id: string | null;
  } | null;
}

interface Props {
  matterId: string;
  readOnly?: boolean;
}

const roleConfig: Record<string, { color: string; icon: React.ElementType }> = {
  holder: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Crown },
  co_holder: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: Users },
  applicant: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: UserCheck },
  co_applicant: { color: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300', icon: UserCheck },
  assignor: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: ArrowRightLeft },
  assignee: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: ArrowRightLeft },
  previous_holder: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: History },
  licensee: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Briefcase },
  licensor: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Briefcase },
  opponent: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertTriangle },
  petitioner: { color: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300', icon: Scale },
  inventor: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', icon: User },
  designer: { color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', icon: User },
};

export function MatterPartiesPanel({ matterId, readOnly = false }: Props) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showHistory, setShowHistory] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<MatterParty | null>(null);
  const [editingParty, setEditingParty] = useState<MatterParty | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    holder_id: '',
    external_name: '',
    party_role: 'holder' as PartyRole,
    share_percentage: 100,
    is_primary: true,
    effective_from: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Query parties
  const { data: parties = [], isLoading } = useQuery({
    queryKey: ['matter-parties', matterId, showHistory],
    queryFn: async () => {
      let query = fromTable('matter_parties')
        .select(`
          *,
          holder:holders(id, legal_name, holder_type, country, tax_id)
        `)
        .eq('matter_id', matterId)
        .order('is_current', { ascending: false })
        .order('is_primary', { ascending: false })
        .order('effective_from', { ascending: false, nullsFirst: false });

      if (!showHistory) {
        query = query.eq('is_current', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MatterParty[];
    },
    enabled: !!matterId,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const partyData = {
        matter_id: matterId,
        organization_id: organizationId,
        holder_id: data.holder_id || null,
        external_name: data.holder_id ? null : data.external_name || null,
        party_role: data.party_role,
        share_percentage: data.share_percentage,
        percentage: data.share_percentage, // legacy field
        is_primary: data.is_primary,
        effective_from: data.effective_from || null,
        is_current: true,
        notes: data.notes || null,
      };

      if (data.id) {
        const { error } = await fromTable('matter_parties')
          .update({ ...partyData, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await fromTable('matter_parties').insert(partyData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', matterId] });
      setDialogOpen(false);
      setEditingParty(null);
      resetForm();
      toast({ title: editingParty ? 'Parte actualizada' : 'Parte añadida' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable('matter_parties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-parties', matterId] });
      setDeleteConfirm(null);
      toast({ title: 'Parte eliminada' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      holder_id: '',
      external_name: '',
      party_role: 'holder',
      share_percentage: 100,
      is_primary: true,
      effective_from: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const openEditDialog = (party: MatterParty) => {
    setEditingParty(party);
    setFormData({
      holder_id: party.holder_id || '',
      external_name: party.external_name || '',
      party_role: party.party_role as PartyRole,
      share_percentage: party.share_percentage ?? party.percentage ?? 100,
      is_primary: party.is_primary,
      effective_from: party.effective_from || '',
      notes: party.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({
      ...formData,
      id: editingParty?.id,
    });
  };

  // Calculate total share for current holders
  const currentHolders = parties.filter(
    (p) => p.is_current && (p.party_role === 'holder' || p.party_role === 'co_holder')
  );
  const totalShare = currentHolders.reduce(
    (sum, p) => sum + (p.share_percentage ?? p.percentage ?? 0),
    0
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Partes del Expediente
            <Badge variant="secondary" className="ml-2">
              {parties.filter((p) => p.is_current).length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs"
            >
              <History className="h-3 w-3 mr-1" />
              {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
            </Button>
            {!readOnly && (
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setEditingParty(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Share percentage warning */}
          {currentHolders.length > 0 && totalShare !== 100 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Los porcentajes de titularidad suman {totalShare}% (deberían sumar 100%)
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando...</div>
          ) : parties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay partes registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parte</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead>Desde</TableHead>
                  {showHistory && <TableHead>Hasta</TableHead>}
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((party) => {
                  const config = roleConfig[party.party_role] || {
                    color: 'bg-gray-100 text-gray-800',
                    icon: User,
                  };
                  const RoleIcon = config.icon;
                  const partyName = party.holder?.legal_name || party.external_name || 'Sin nombre';
                  const share = party.share_percentage ?? party.percentage;

                  return (
                    <TableRow
                      key={party.id}
                      className={!party.is_current ? 'opacity-50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {party.holder?.holder_type === 'individual' ? (
                            <User className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{partyName}</span>
                              {party.is_primary && party.is_current && (
                                <Crown className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                            {party.holder && (
                              <div className="text-xs text-muted-foreground">
                                {party.holder.tax_id}
                                {party.holder.country && ` · ${party.holder.country}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={config.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {PARTY_ROLE_LABELS[party.party_role as PartyRole] || party.party_role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {share != null ? `${share}%` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {party.effective_from ? formatDate(party.effective_from) : '—'}
                      </TableCell>
                      {showHistory && (
                        <TableCell className="text-sm text-muted-foreground">
                          {party.effective_to ? formatDate(party.effective_to) : '—'}
                        </TableCell>
                      )}
                      <TableCell>
                        {!readOnly && party.is_current && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(party)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteConfirm(party)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingParty ? 'Editar parte' : 'Añadir parte al expediente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Titular registrado</Label>
              <HolderSelector
                value={formData.holder_id}
                onValueChange={(id) => setFormData({ ...formData, holder_id: id || '' })}
                placeholder="Seleccionar titular..."
              />
              <p className="text-xs text-muted-foreground">
                O introduce los datos manualmente:
              </p>
            </div>

            {!formData.holder_id && (
              <div className="space-y-2">
                <Label>Nombre de la parte</Label>
                <Input
                  value={formData.external_name}
                  onChange={(e) => setFormData({ ...formData, external_name: e.target.value })}
                  placeholder="Nombre completo o razón social"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={formData.party_role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, party_role: value as PartyRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holder">Titular</SelectItem>
                    <SelectItem value="co_holder">Co-titular</SelectItem>
                    <SelectItem value="applicant">Solicitante</SelectItem>
                    <SelectItem value="licensee">Licenciatario</SelectItem>
                    <SelectItem value="licensor">Licenciante</SelectItem>
                    <SelectItem value="opponent">Oponente</SelectItem>
                    <SelectItem value="inventor">Inventor</SelectItem>
                    <SelectItem value="designer">Diseñador</SelectItem>
                    <SelectItem value="interested_party">Parte interesada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Porcentaje (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.share_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, share_percentage: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha efectiva</Label>
              <Input
                type="date"
                value={formData.effective_from}
                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="is_primary" className="text-sm font-normal">
                Es la parte principal de su rol
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Guardando...'
                : editingParty
                ? 'Guardar cambios'
                : 'Añadir parte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar parte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará a "{deleteConfirm?.holder?.legal_name || deleteConfirm?.external_name}"
              del expediente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
