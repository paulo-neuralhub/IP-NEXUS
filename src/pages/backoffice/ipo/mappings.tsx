// src/pages/backoffice/ipo/mappings.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Check, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface StatusMapping {
  id: string;
  office_code: string;
  office_status: string;
  normalized_status: string;
  status_category: string;
  description_es?: string;
  description_en?: string;
  creates_deadline: boolean;
  deadline_type_code?: string;
}

const NORMALIZED_STATUSES = [
  'filed', 'examination', 'published', 'opposition', 'registered', 
  'refused', 'withdrawn', 'expired', 'suspended', 'invalidity', 'cancelled', 'other'
];

const STATUS_CATEGORIES = ['pending', 'active', 'granted', 'refused', 'expired', 'other'];

const CATEGORY_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  granted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  other: 'bg-purple-100 text-purple-800',
};

export default function OfficeMappingsPage() {
  const queryClient = useQueryClient();
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [editingMapping, setEditingMapping] = useState<StatusMapping | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch offices
  const { data: offices = [] } = useQuery({
    queryKey: ['ipo-offices-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('code, name_official')
        .eq('is_active', true)
        .order('name_official');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch mappings
  const { data: mappings = [], isLoading } = useQuery({
    queryKey: ['office-status-mappings', selectedOffice],
    queryFn: async () => {
      let query = supabase
        .from('office_status_mappings')
        .select('*')
        .order('office_code')
        .order('office_status');
      
      if (selectedOffice !== 'all') {
        query = query.eq('office_code', selectedOffice);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as StatusMapping[];
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (mapping: Partial<StatusMapping>) => {
      const payload = {
        office_code: mapping.office_code,
        office_status: mapping.office_status,
        normalized_status: mapping.normalized_status,
        status_category: mapping.status_category,
        description_es: mapping.description_es,
        description_en: mapping.description_en,
        creates_deadline: mapping.creates_deadline,
        deadline_type_code: mapping.deadline_type_code,
      };
      if (mapping.id) {
        const { error } = await supabase
          .from('office_status_mappings')
          .update(payload)
          .eq('id', mapping.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('office_status_mappings')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-status-mappings'] });
      setIsDialogOpen(false);
      setEditingMapping(null);
      toast.success('Mapping guardado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('office_status_mappings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office-status-mappings'] });
      toast.success('Mapping eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSave = (formData: FormData) => {
    const mapping: Partial<StatusMapping> = {
      id: editingMapping?.id,
      office_code: formData.get('office_code') as string,
      office_status: formData.get('office_status') as string,
      normalized_status: formData.get('normalized_status') as string,
      status_category: formData.get('status_category') as string,
      description_es: formData.get('description_es') as string || undefined,
      description_en: formData.get('description_en') as string || undefined,
      creates_deadline: formData.get('creates_deadline') === 'on',
      deadline_type_code: formData.get('deadline_type_code') as string || undefined,
    };
    saveMutation.mutate(mapping);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mapeo de Estados</h1>
          <p className="text-muted-foreground">
            Normaliza los estados de cada oficina al sistema IP-NEXUS
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMapping(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(new FormData(e.currentTarget)); }}>
              <DialogHeader>
                <DialogTitle>
                  {editingMapping ? 'Editar Mapping' : 'Nuevo Mapping'}
                </DialogTitle>
                <DialogDescription>
                  Define cómo un estado de oficina se traduce al sistema IP-NEXUS
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="office_code">Oficina *</Label>
                    <Select name="office_code" defaultValue={editingMapping?.office_code}>
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
                    <Label htmlFor="office_status">Estado Oficina *</Label>
                    <Input 
                      name="office_status" 
                      defaultValue={editingMapping?.office_status}
                      placeholder="Application published"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estado Normalizado *</Label>
                    <Select name="normalized_status" defaultValue={editingMapping?.normalized_status || 'other'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NORMALIZED_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría *</Label>
                    <Select name="status_category" defaultValue={editingMapping?.status_category || 'pending'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_es">Descripción (ES)</Label>
                  <Input 
                    name="description_es" 
                    defaultValue={editingMapping?.description_es}
                    placeholder="Descripción en español"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">Descripción (EN)</Label>
                  <Input 
                    name="description_en" 
                    defaultValue={editingMapping?.description_en}
                    placeholder="Description in English"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="creates_deadline" 
                    name="creates_deadline"
                    defaultChecked={editingMapping?.creates_deadline}
                  />
                  <Label htmlFor="creates_deadline">Crear plazo automáticamente</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline_type_code">Tipo de Plazo (si aplica)</Label>
                  <Input 
                    name="deadline_type_code" 
                    defaultValue={editingMapping?.deadline_type_code}
                    placeholder="TM_OPPOSITION_DEADLINE"
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Label>Filtrar por oficina:</Label>
            <Select value={selectedOffice} onValueChange={setSelectedOffice}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las oficinas</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.code} value={o.code}>{o.code} - {o.name_official}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando mappings...</div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay mappings configurados</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Estado Oficina</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Estado IP-NEXUS</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.office_code}</TableCell>
                    <TableCell>{m.office_status}</TableCell>
                    <TableCell><ArrowRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.normalized_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={CATEGORY_COLORS[m.status_category] || CATEGORY_COLORS.other}>
                        {m.status_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.creates_deadline ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          {m.deadline_type_code}
                        </span>
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setEditingMapping(m);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('¿Eliminar este mapping?')) {
                              deleteMutation.mutate(m.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
