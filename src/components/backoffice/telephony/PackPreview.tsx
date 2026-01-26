// ============================================================
// IP-NEXUS BACKOFFICE - Pack Preview Component
// ============================================================

import { Star, Phone, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PackPreviewProps {
  name: string;
  minutes: number;
  sms: number;
  price: number;
  currency?: string;
  badgeText?: string | null;
  savingsPercentage?: number | null;
  isFeatured?: boolean;
  validityDays?: number;
}

export function PackPreview({
  name,
  minutes,
  sms,
  price,
  currency = 'EUR',
  badgeText,
  savingsPercentage,
  isFeatured,
  validityDays = 365,
}: PackPreviewProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Vista previa</p>
      <div
        className={cn(
          "bg-card rounded-xl border p-6 relative max-w-xs mx-auto shadow-sm",
          isFeatured && "ring-2 ring-primary"
        )}
      >
        {/* Badge */}
        {badgeText && (
          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
            {badgeText}
          </Badge>
        )}
        
        {/* Featured star */}
        {isFeatured && (
          <Star className="absolute top-3 right-3 h-5 w-5 text-warning fill-warning" />
        )}

        {/* Pack name */}
        <h3 className="text-lg font-bold text-center mt-2 mb-4">
          {name || 'Nombre del pack'}
        </h3>

        {/* Minutes & SMS */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span className="font-medium">{minutes.toLocaleString()} minutos</span>
          </div>
          {sms > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-medium">{sms} SMS</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(price)}
          </span>
          {savingsPercentage && savingsPercentage > 0 && (
            <Badge variant="secondary" className="ml-2 bg-success/10 text-success">
              Ahorra {savingsPercentage}%
            </Badge>
          )}
        </div>

        {/* Validity */}
        <p className="text-xs text-muted-foreground text-center mb-4">
          Válido por {validityDays} días
        </p>

        {/* CTA */}
        <Button className="w-full" size="sm">
          Comprar
        </Button>
      </div>
    </div>
  );
}
