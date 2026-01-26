// ============================================================
// IP-NEXUS BACKOFFICE - Pack Card Component
// ============================================================

import { Package, Star, Check, Edit2, Copy, Power, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { TelephonyPack } from '@/hooks/useTelephonyPacks';

interface PackCardProps {
  pack: TelephonyPack;
  salesCount?: number;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleActive: (isActive: boolean) => void;
  onDelete: () => void;
}

export function PackCard({
  pack,
  salesCount = 0,
  onEdit,
  onDuplicate,
  onToggleActive,
  onDelete,
}: PackCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: pack.currency || 'EUR' }).format(value);

  return (
    <Card
      className={cn(
        "relative transition-all",
        pack.is_featured && "ring-2 ring-primary shadow-md",
        !pack.is_active && "opacity-60"
      )}
    >
      {/* Badge */}
      {pack.badge_text && (
        <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground shadow-sm">
          {pack.badge_text}
        </Badge>
      )}

      {/* Featured indicator */}
      {pack.is_featured && (
        <Star className="absolute top-4 right-4 h-5 w-5 text-warning fill-warning" />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            {pack.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={pack.is_active}
              onCheckedChange={onToggleActive}
              title={pack.is_active ? 'Desactivar' : 'Activar'}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {pack.description || 'Sin descripción'}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-success" />
            <span className="font-medium">{pack.minutes_included.toLocaleString()}</span>
            <span className="text-muted-foreground">min</span>
          </div>
          {pack.sms_included > 0 && (
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4 text-success" />
              <span className="font-medium">{pack.sms_included}</span>
              <span className="text-muted-foreground">SMS</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {formatCurrency(Number(pack.price))}
          </span>
          {pack.savings_percentage && pack.savings_percentage > 0 && (
            <Badge variant="secondary" className="bg-success/10 text-success">
              Ahorra {pack.savings_percentage}%
            </Badge>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Validez: {pack.validity_days} días</span>
          {salesCount > 0 && (
            <span className="font-medium text-foreground">
              {salesCount} vendidos este mes
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-1">
            <Badge variant={pack.is_active ? 'default' : 'secondary'}>
              {pack.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
            {pack.min_plan && (
              <Badge variant="outline" className="text-xs">
                {pack.min_plan}+
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              title="Duplicar"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
