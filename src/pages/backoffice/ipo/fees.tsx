// src/pages/backoffice/ipo/fees.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Use the actual database schema
interface OfficialFee {
  id: string;
  office: string;
  office_id?: string;
  code: string;
  name: string;
  description?: string;
  fee_type: string;
  ip_type: string;
  amount: number;
  currency?: string;
  per_class?: boolean;
  base_classes?: number;
  extra_class_fee?: number;
  effective_from: string;
  effective_until?: string;
  is_current?: boolean;
  source_url?: string;
  notes?: string;
}

const FEE_CATEGORIES = ['filing', 'class', 'renewal', 'opposition', 'appeal', 'restoration', 'other'];
const IP_TYPES = ['trademark', 'patent', 'design', 'utility_model', 'all'];
const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CNY', 'BRL', 'MXN'];

export default function OfficeFeesPage() {
  const queryClient = useQueryClient();
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCurrent, setShowCurrent] = useState<boolean>(true);
  const [editingFee, setEditingFee] = useState<OfficialFee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch offices
  const { data: offices = [] } = useQuery({
    queryKey: ['ipo-offices-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('id, code, name_official, currency')
        .eq('is_active', true)
        .order('name_official');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fees
  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['official-fees', selectedOffice, selectedType, showCurrent],
    queryFn: async () => {
      let query = supabase
        .from('official_fees')
        .select('*')
        .order('office')
        .order('fee_type')
        .order('code');
      
      if (selectedOffice !== 'all') {
        query = query.eq('office', selectedOffice);
      }
      if (selectedType !== 'all') {
        query = query.eq('ip_type', selectedType);
      }
      if (showCurrent) {
        query = query.eq('is_current', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as OfficialFee[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (fee: Partial<OfficialFee>) => {
      const payload = {
        office: fee.office!,
        office_id: fee.office_id,
        code: fee.code!,
        name: fee.name!,
        description: fee.description,
        fee_type: fee.fee_type!,
        ip_type: fee.ip_type!,
        amount: fee.amount!,
        currency: fee.currency || 'EUR',
        per_class: fee.per_class,
        base_classes: fee.base_classes,
        extra_class_fee: fee.extra_class_fee,
        effective_from: fee.effective_from!,
        effective_until: fee.effective_until,
        source_url: fee.source_url,
        is_current: true,
        notes: fee.notes,
      };
      
      if (fee.id) {
        const { error } = await supabase
          .from('official_fees')
          .update(payload)
          .eq('id', fee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('official_fees')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['official-fees'] });
      setIsDialogOpen(false);
      setEditingFee(null);
      toast.success('Tasa guardada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSave = (formData: FormData) => {
    const selectedOfficeData = offices.find(o => o.code === formData.get('office'));
    const fee: Partial<OfficialFee> = {
      id: editingFee?.id,
      office: formData.get('office') as string,
      office_id: selectedOfficeData?.id,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
      fee_type: formData.get('fee_type') as string,
      ip_type: formData.get('ip_type') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string,
      per_class: formData.get('per_class') === 'true',
      base_classes: parseInt(formData.get('base_classes') as string) || 1,
      extra_class_fee: parseFloat(formData.get('extra_class_fee') as string) || undefined,
      effective_from: formData.get('effective_from') as string,
      effective_until: formData.get('effective_until') as string || undefined,
      source_url: formData.get('source_url') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    };
    saveMutation.mutate(fee);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasas Oficiales</h1>
          <p className="text-muted-foreground">
            Gestiona las tasas oficiales de cada oficina de PI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Tasas
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFee(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tasa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }}>
                <DialogHeader>
                  <DialogTitle>
                    {editingFee ? 'Editar Tasa' : 'Nueva Tasa'}
                  </DialogTitle>
                  <DialogDescription>
                    Define una tasa oficial de una oficina de PI
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Oficina *</Label>
                      <Select name="office" defaultValue={editingFee?.office}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {offices.map((o) => (
                            <SelectItem key={o.code} value={o.code}>{o.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Código *</Label>
                      <Input 
                        name="code" 
                        defaultValue={editingFee?.code}
                        placeholder="TM_FILING_ONLINE"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input 
                      name="name" 
                      defaultValue={editingFee?.name}
                      placeholder="Solicitud marca online (1 clase)"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input 
                      name="description" 
                      defaultValue={editingFee?.description}
                      placeholder="Descripción adicional..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Tasa *</Label>
                      <Select name="fee_type" defaultValue={editingFee?.fee_type || 'filing'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FEE_CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo IP *</Label>
                      <Select name="ip_type" defaultValue={editingFee?.ip_type || 'trademark'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IP_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Importe *</Label>
                      <Input 
                        name="amount" 
                        type="number"
                        step="0.01"
                        defaultValue={editingFee?.amount}
                        placeholder="850"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Moneda *</Label>
                      <Select name="currency" defaultValue={editingFee?.currency || 'EUR'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Clases incluidas</Label>
                      <Input 
                        name="base_classes" 
                        type="number"
                        defaultValue={editingFee?.base_classes || 1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tasa clase extra</Label>
                      <Input 
                        name="extra_class_fee" 
                        type="number"
                        step="0.01"
                        defaultValue={editingFee?.extra_class_fee}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vigente desde *</Label>
                      <Input 
                        name="effective_from" 
                        type="date"
                        defaultValue={editingFee?.effective_from?.split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vigente hasta</Label>
                      <Input 
                        name="effective_until" 
                        type="date"
                        defaultValue={editingFee?.effective_until?.split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>URL fuente</Label>
                    <Input 
                      name="source_url" 
                      type="url"
                      defaultValue={editingFee?.source_url}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Input 
                      name="notes" 
                      defaultValue={editingFee?.notes}
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label>Oficina:</Label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {offices.map((o) => (
                    <SelectItem key={o.code} value={o.code}>{o.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Tipo:</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {IP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Solo vigentes:</Label>
              <Button 
                variant={showCurrent ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? 'Sí' : 'No'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando tasas...</div>
          ) : fees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay tasas configuradas</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead>Vigente desde</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.office}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{fee.code}</code>
                    </TableCell>
                    <TableCell>{fee.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fee.fee_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatAmount(fee.amount, fee.currency || 'EUR')}
                    </TableCell>
                    <TableCell>{format(new Date(fee.effective_from), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingFee(fee);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {fee.source_url && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(fee.source_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
