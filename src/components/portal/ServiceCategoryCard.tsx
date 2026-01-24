/**
 * Tarjeta de categoría de servicios
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceCatalogItem } from '@/hooks/use-service-catalog';

interface ServiceCategoryCardProps {
  category: string;
  icon: LucideIcon;
  color: string;
  services: ServiceCatalogItem[];
  onServiceClick: (service: ServiceCatalogItem) => void;
  onViewAll: (category: string) => void;
}

export function ServiceCategoryCard({
  category,
  icon: Icon,
  color,
  services,
  onServiceClick,
  onViewAll,
}: ServiceCategoryCardProps) {
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayServices = services.slice(0, 3);

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            color
          )}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-lg">{category}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3">
          {displayServices.map((service) => (
            <button
              key={service.id}
              onClick={() => onServiceClick(service)}
              className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
            >
              <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                {service.name}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {service.base_price > 0 
                  ? `desde ${formatCurrency(service.base_price, service.currency)}`
                  : 'Consultar precio'
                }
              </p>
            </button>
          ))}

          {services.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay servicios disponibles
            </p>
          )}
        </div>

        {services.length > 3 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 gap-2"
            onClick={() => onViewAll(category)}
          >
            Ver todos ({services.length})
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
