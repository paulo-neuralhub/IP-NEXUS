// ============================================================
// IP-NEXUS BACKOFFICE - Pack Form Modal
// ============================================================

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PackPreview } from './PackPreview';
import type { TelephonyPack } from '@/hooks/useTelephonyPacks';

export interface PackFormData {
  code: string;
  name: string;
  description: string | null;
  minutes_included: number;
  sms_included: number;
  price: number;
  currency: string;
  validity_days: number;
  is_active: boolean;
  is_featured: boolean;
  min_plan: string | null;
  display_order: number;
  badge_text: string | null;
  savings_percentage: number | null;
}

export const defaultPackFormData: PackFormData = {
  code: '',
  name: '',
  description: '',
  minutes_included: 60,
  sms_included: 0,
  price: 15,
  currency: 'EUR',
  validity_days: 365,
  is_active: true,
  is_featured: false,
  min_plan: null,
  display_order: 0,
  badge_text: '',
  savings_percentage: null,
};

interface PackFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPack: TelephonyPack | null;
  onSubmit: (data: PackFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PackFormModal({
  open,
  onOpenChange,
  editingPack,
  onSubmit,
  isLoading,
}: PackFormModalProps) {
  const [formData, setFormData] = useState<PackFormData>(defaultPackFormData);

  useEffect(() => {
    if (editingPack) {
      setFormData({
        code: editingPack.code,
        name: editingPack.name,
        description: editingPack.description || '',
        minutes_included: editingPack.minutes_included,
        sms_included: editingPack.sms_included || 0,
        price: Number(editingPack.price),
        currency: editingPack.currency || 'EUR',
        validity_days: editingPack.validity_days,
        is_active: editingPack.is_active,
        is_featured: editingPack.is_featured,
        min_plan: editingPack.min_plan || null,
        display_order: editingPack.display_order,
        badge_text: editingPack.badge_text || '',
        savings_percentage: editingPack.savings_percentage,
      });
    } else {
      setFormData(defaultPackFormData);
    }
  }, [editingPack, open]);

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const generateCode = () => {
    if (formData.name) {
      const code = 'PACK_' + formData.name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 20);
      setFormData({ ...formData, code });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {editingPack ? 'Editar Pack de Minutos' : 'Crear Pack de Minutos'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Left column - Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Información Básica
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del pack *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Pack Premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Código único *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                    placeholder="PACK_PREMIUM"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateCode}
                    title="Generar desde nombre"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Sin espacios, solo mayúsculas y guiones bajos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del pack para mostrar a clientes..."
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contenido del Pack
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minutes">Minutos incluidos *</Label>
                  <Input
                    id="minutes"
                    type="number"
                    min={0}
                    value={formData.minutes_included}
                    onChange={(e) => setFormData({ ...formData, minutes_included: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms">SMS incluidos</Label>
                  <Input
                    id="sms"
                    type="number"
                    min={0}
                    value={formData.sms_included}
                    onChange={(e) => setFormData({ ...formData, sms_included: Number(e.target.value) })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ℹ️ Los minutos se consumen según tarifa de cada destino.
              </p>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Precio y Validez
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => setFormData({ ...formData, currency: v })}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validity">Validez (días)</Label>
                  <Input
                    id="validity"
                    type="number"
                    min={1}
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Marketing */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Marketing
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Etiqueta (badge)</Label>
                  <Input
                    id="badge"
                    value={formData.badge_text || ''}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value || null })}
                    placeholder="Más popular"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">% Ahorro</Label>
                  <Input
                    id="savings"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.savings_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, savings_percentage: e.target.value ? Number(e.target.value) : null })}
                    placeholder="20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Orden de visualización</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Menor = aparece primero</p>
              </div>
            </div>

            <Separator />

            {/* Restrictions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Restricciones
              </h4>
              
              <div className="space-y-2">
                <Label>Plan mínimo requerido</Label>
                <Select
                  value={formData.min_plan || 'none'}
                  onValueChange={(v) => setFormData({ ...formData, min_plan: v === 'none' ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno (todos los planes)</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label htmlFor="active" className="cursor-pointer">
                    Pack activo
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    Destacado ⭐
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="space-y-4">
            <PackPreview
              name={formData.name}
              minutes={formData.minutes_included}
              sms={formData.sms_included}
              price={formData.price}
              currency={formData.currency}
              badgeText={formData.badge_text}
              savingsPercentage={formData.savings_percentage}
              isFeatured={formData.is_featured}
              validityDays={formData.validity_days}
            />

            {/* Quick calculations */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cálculos rápidos
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio por minuto:</span>
                  <span className="font-medium">
                    {formData.minutes_included > 0
                      ? `€${(formData.price / formData.minutes_included).toFixed(4)}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coste est. (€0.017/min):</span>
                  <span className="font-medium">
                    €{(formData.minutes_included * 0.017).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margen estimado:</span>
                  <span className="font-medium text-success">
                    €{(formData.price - formData.minutes_included * 0.017).toFixed(2)}
                    {' '}
                    ({formData.price > 0
                      ? ((1 - (formData.minutes_included * 0.017) / formData.price) * 100).toFixed(0)
                      : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.code || !formData.name || formData.price <= 0}
          >
            {isLoading && <Spinner className="h-4 w-4 mr-2" />}
            {editingPack ? 'Guardar cambios' : 'Crear pack'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
