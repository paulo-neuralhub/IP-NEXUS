// =====================================================
// IP-NEXUS - CLIENT HOLDERS TAB (PROMPT 28)
// Muestra titulares de los expedientes del cliente
// Solo lectura - edición con aviso de impacto
// =====================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  User,
  Search,
  FileText,
  ExternalLink,
  Info,
  Globe,
  Briefcase,
  Edit,
  AlertTriangle,
  Save,
  Plus,
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientHoldersTabProps {
  clientId: string;
  clientName: string;
}

interface HolderWithMatters {
  id: string;
  code: string;
  legal_name: string;
  trade_name: string | null;
  holder_type: string;
  tax_id: string | null;
  tax_id_type: string | null;
  country: string | null;
  address_line1: string | null;
  city: string | null;
  email: string | null;
  phone: string | null;
  matters_count: number;
  matters: Array<{
    id: string;
    reference: string;
    title: string;
  }>;
}

export function ClientHoldersTab({ clientId, clientName }: ClientHoldersTabProps) {
  const [holders, setHolders] = useState<HolderWithMatters[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estado para edición
  const [editingHolder, setEditingHolder] = useState<HolderWithMatters | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHolders();
  }, [clientId]);

  const loadHolders = async () => {
    setLoading(true);
    try {
      // Obtener titulares únicos de los expedientes de este cliente
      // usando matter_parties -> matters (filtrado por client_id)
      const { data: matterParties, error } = await fromTable('matter_parties')
        .select(`
          party_id,
          role,
          share_percentage,
          party:parties!party_id(
            id, code, legal_name, trade_name, party_type, 
            tax_id, tax_id_type, country, address_line1, city, email, phone
          ),
          matter:matter_id(
            id, reference, title, client_id
          )
        `)
        .eq('is_current', true)
        .in('role', ['holder', 'co_holder', 'applicant']);

      if (error) throw error;

      // Filtrar solo los expedientes de este cliente y agrupar por titular
      const holdersMap = new Map<string, HolderWithMatters>();
      
      (matterParties || []).forEach((mp: any) => {
        // Verificar que el expediente pertenece a este cliente
        if (!mp.matter || mp.matter.client_id !== clientId) return;
        if (!mp.party) return;
        
        const partyId = mp.party.id;
        if (!holdersMap.has(partyId)) {
          holdersMap.set(partyId, {
            id: mp.party.id,
            code: mp.party.code || '',
            legal_name: mp.party.legal_name || '',
            trade_name: mp.party.trade_name,
            holder_type: mp.party.party_type || 'company',
            tax_id: mp.party.tax_id,
            tax_id_type: mp.party.tax_id_type,
            country: mp.party.country,
            address_line1: mp.party.address_line1,
            city: mp.party.city,
            email: mp.party.email,
            phone: mp.party.phone,
            matters_count: 0,
            matters: [],
          });
        }
        
        const holder = holdersMap.get(partyId)!;
        // Solo añadir el expediente si no está ya
        if (!holder.matters.find(m => m.id === mp.matter.id)) {
          holder.matters_count++;
          holder.matters.push({
            id: mp.matter.id,
            reference: mp.matter.reference,
            title: mp.matter.title,
          });
        }
      });

      setHolders(Array.from(holdersMap.values()));
    } catch (error) {
      console.error('Error loading holders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (holder: HolderWithMatters) => {
    setEditingHolder(holder);
    setEditFormData({ ...holder });
    setConfirmDialogOpen(true); // Primero mostrar aviso de impacto
  };

  const handleConfirmEdit = () => {
    setConfirmDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleSaveHolder = async () => {
    if (!editingHolder) return;
    
    setSaving(true);
    try {
      const { error } = await fromTable('parties')
        .update({
          legal_name: editFormData.legal_name,
          trade_name: editFormData.trade_name || null,
          tax_id: editFormData.tax_id || null,
          tax_id_type: editFormData.tax_id_type || null,
          country: editFormData.country || null,
          address_line1: editFormData.address_line1 || null,
          city: editFormData.city || null,
          email: editFormData.email || null,
          phone: editFormData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingHolder.id);

      if (error) throw error;

      toast({ title: 'Titular actualizado' });
      setEditDialogOpen(false);
      setEditingHolder(null);
      loadHolders();
    } catch (error) {
      console.error('Error saving holder:', error);
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filteredHolders = holders.filter(h => {
    const searchLower = search.toLowerCase();
    return (
      h.legal_name?.toLowerCase().includes(searchLower) ||
      h.tax_id?.toLowerCase().includes(searchLower) ||
      h.code?.toLowerCase().includes(searchLower) ||
      h.country?.toLowerCase().includes(searchLower)
    );
  });

  // Estadísticas
  const stats = {
    total: holders.length,
    totalMatters: holders.reduce((sum, h) => sum + h.matters_count, 0),
    countries: new Set(holders.map(h => h.country).filter(Boolean)).size,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
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
      {/* Info box explicativo */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Los titulares se añaden desde los expedientes
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Para añadir un nuevo titular, crea un expediente y asígnale el titular. 
                Aquí puedes ver y editar los datos de titulares existentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
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
                <p className="text-xs text-muted-foreground">Expedientes</p>
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

      {/* Búsqueda */}
      {holders.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar titular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Tabla de titulares */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titular</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Expedientes</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHolders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="py-12 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="font-medium">No hay titulares</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                      {search 
                        ? 'No se encontraron resultados para tu búsqueda' 
                        : 'Los titulares aparecerán automáticamente cuando crees expedientes para este cliente'}
                    </p>
                    {!search && (
                      <Button 
                        className="mt-4" 
                        size="sm"
                        onClick={() => navigate('/app/docket/matters/new')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear expediente
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredHolders.map((holder) => (
                <TableRow key={holder.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {holder.holder_type === 'individual' ? (
                            <User className="w-4 h-4" />
                          ) : (
                            holder.legal_name?.substring(0, 2).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{holder.legal_name}</p>
                        {holder.trade_name && holder.trade_name !== holder.legal_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {holder.trade_name}
                          </p>
                        )}
                        {holder.code && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {holder.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {holder.tax_id_type && (
                        <span className="text-xs text-muted-foreground mr-1">{holder.tax_id_type}:</span>
                      )}
                      <span className="font-mono text-sm">{holder.tax_id || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{holder.country || '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{holder.matters_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(holder)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog de confirmación (aviso de impacto) */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Editar titular
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  El titular <strong>"{editingHolder?.legal_name}"</strong> está vinculado a{' '}
                  <strong>{editingHolder?.matters_count} expediente(s)</strong>.
                </p>
                <p className="text-sm">
                  Los cambios que realices se aplicarán a la ficha del titular y se reflejarán 
                  en futuros documentos generados para estos expedientes.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEdit}>
              Entendido, continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar titular</DialogTitle>
            <DialogDescription>
              Los cambios afectarán a {editingHolder?.matters_count} expediente(s).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre / Razón social</Label>
                <Input
                  value={editFormData.legal_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, legal_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre comercial</Label>
                <Input
                  value={editFormData.trade_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, trade_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo ID</Label>
                <Select
                  value={editFormData.tax_id_type || 'CIF'}
                  onValueChange={(v) => setEditFormData({ ...editFormData, tax_id_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="NIF">NIF</SelectItem>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="EIN">EIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número ID</Label>
                <Input
                  value={editFormData.tax_id || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, tax_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Input
                  value={editFormData.country || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value.toUpperCase() })}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={editFormData.address_line1 || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address_line1: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={editFormData.city || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveHolder} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
