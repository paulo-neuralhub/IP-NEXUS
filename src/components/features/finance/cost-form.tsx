import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  useCreateMatterCost, 
  useUpdateMatterCost,
  useOfficialFees,
  useServiceFees,
  calculateFeeWithClasses,
} from '@/hooks/use-finance';
import { useMatters } from '@/hooks/use-matters';
import { COST_TYPES, CURRENCIES } from '@/lib/constants/finance';
import type { MatterCost, CostType } from '@/types/finance';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CostFormProps {
  cost?: MatterCost;
}

export function CostForm({ cost }: CostFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const createMutation = useCreateMatterCost();
  const updateMutation = useUpdateMatterCost();
  
  const { data: matters } = useMatters();
  const { data: officialFees } = useOfficialFees();
  const { data: serviceFees } = useServiceFees();
  
  const [formData, setFormData] = useState({
    matter_id: cost?.matter_id || searchParams.get('matter') || '',
    cost_type: (cost?.cost_type || 'service_fee') as CostType,
    official_fee_id: cost?.official_fee_id || '',
    service_fee_id: cost?.service_fee_id || '',
    description: cost?.description || '',
    notes: cost?.notes || '',
    amount: cost?.amount || 0,
    currency: cost?.currency || 'EUR',
    quantity: cost?.quantity || 1,
    cost_date: cost?.cost_date || new Date().toISOString().split('T')[0],
    due_date: cost?.due_date || '',
    is_billable: cost?.is_billable ?? true,
    status: cost?.status || 'pending',
  });
  
  // Auto-rellenar desde tarifa seleccionada
  useEffect(() => {
    if (formData.cost_type === 'official_fee' && formData.official_fee_id) {
      const fee = officialFees?.find(f => f.id === formData.official_fee_id);
      if (fee) {
        const matter = matters?.find(m => m.id === formData.matter_id);
        const numClasses = matter?.nice_classes?.length || 1;
        
        setFormData(prev => ({
          ...prev,
          description: fee.name,
          amount: calculateFeeWithClasses(fee, numClasses),
          currency: fee.currency,
        }));
      }
    }
  }, [formData.official_fee_id, formData.matter_id, officialFees, matters]);
  
  useEffect(() => {
    if (formData.cost_type === 'service_fee' && formData.service_fee_id) {
      const fee = serviceFees?.find(f => f.id === formData.service_fee_id);
      if (fee) {
        setFormData(prev => ({
          ...prev,
          description: fee.name,
          amount: fee.amount,
          currency: fee.currency,
        }));
      }
    }
  }, [formData.service_fee_id, serviceFees]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (cost) {
        await updateMutation.mutateAsync({ id: cost.id, data: formData });
        toast.success('Coste actualizado');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Coste registrado');
      }
      navigate(-1);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };
  
  const totalAmount = formData.amount * formData.quantity;
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{cost ? 'Editar coste' : 'Nuevo coste'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Expediente */}
          <div className="space-y-2">
            <Label htmlFor="matter_id">Expediente *</Label>
            <Select
              value={formData.matter_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, matter_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar expediente..." />
              </SelectTrigger>
              <SelectContent>
                {matters?.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.reference} - {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tipo de coste */}
          <div className="space-y-2">
            <Label>Tipo de coste</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(COST_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    cost_type: key as CostType,
                    official_fee_id: '',
                    service_fee_id: '',
                  }))}
                  className={cn(
                    "p-3 rounded-lg border text-center text-sm transition-colors",
                    formData.cost_type === key 
                      ? 'border-primary bg-primary/10' 
                      : 'hover:border-muted-foreground/50'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Selector de tarifa oficial */}
          {formData.cost_type === 'official_fee' && (
            <div className="space-y-2">
              <Label>Tarifa oficial</Label>
              <Select
                value={formData.official_fee_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, official_fee_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar o introducir manualmente..." />
                </SelectTrigger>
                <SelectContent>
                  {officialFees?.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.office} - {f.name} ({f.amount} {f.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Selector de tarifa de servicios */}
          {formData.cost_type === 'service_fee' && (
            <div className="space-y-2">
              <Label>Tarifa de servicios</Label>
              <Select
                value={formData.service_fee_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_fee_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar o introducir manualmente..." />
                </SelectTrigger>
                <SelectContent>
                  {serviceFees?.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.amount} {f.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          {/* Importe */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="amount">Importe *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, config]) => (
                    <SelectItem key={code} value={code}>{code} ({config.symbol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Cantidad */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Total</Label>
              <div className="px-3 py-2 bg-muted rounded-lg font-medium">
                {totalAmount.toFixed(2)} {formData.currency}
              </div>
            </div>
          </div>
          
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_date">Fecha del coste *</Label>
              <Input
                id="cost_date"
                type="date"
                value={formData.cost_date}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha de vencimiento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Opciones */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_billable"
              checked={formData.is_billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: checked as boolean }))}
            />
            <Label htmlFor="is_billable" className="font-normal">
              Facturable al cliente
            </Label>
          </div>
          
          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>
          
          {/* Acciones */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {cost ? 'Guardar cambios' : 'Registrar coste'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
