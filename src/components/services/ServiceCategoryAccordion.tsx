/**
 * Service Category Accordion
 * Collapsible section showing services grouped by subcategory
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ServiceEditModal } from './ServiceEditModal';
import { useDeactivateService, useReactivateService, type ActiveService } from '@/hooks/useServiceCatalogManagement';
import { toast } from 'sonner';

interface SubcategoryGroup {
  key: string;
  label: string;
  services: ActiveService[];
}

interface ServiceCategoryAccordionProps {
  category: string;
  label: string;
  icon: string;
  subcategories: SubcategoryGroup[];
}

export function ServiceCategoryAccordion({
  category,
  label,
  icon,
  subcategories,
}: ServiceCategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingService, setEditingService] = useState<ActiveService | null>(null);
  
  const deactivate = useDeactivateService();
  const reactivate = useReactivateService();
  
  const totalActive = subcategories.flatMap(s => s.services).filter(s => s.is_active).length;
  const totalServices = subcategories.flatMap(s => s.services).length;
  
  const handleToggleActive = async (service: ActiveService) => {
    try {
      if (service.is_active) {
        await deactivate.mutateAsync(service.id);
        toast.success('Servicio desactivado');
      } else {
        await reactivate.mutateAsync(service.id);
        toast.success('Servicio activado');
      }
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };
  
  const formatPrice = (price: number) => {
    if (price === 0) return '---';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <>
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-xl">{icon}</span>
              <span className="font-semibold text-lg">{label}</span>
              <Badge variant="secondary">
                {totalActive}/{totalServices}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {isOpen && (
          <CardContent className="pt-0">
            <div className="divide-y">
              {subcategories.map((subcategory) => (
                <div key={subcategory.key} className="py-4 first:pt-0 last:pb-0">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    {subcategory.label}
                  </h4>
                  <div className="space-y-2">
                    {subcategory.services.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors",
                          service.is_active 
                            ? "bg-background border-border hover:border-primary/50" 
                            : "bg-muted/30 border-muted"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={() => handleToggleActive(service)}
                            disabled={deactivate.isPending || reactivate.isPending}
                          />
                          <div>
                            <p className={cn(
                              "font-medium",
                              !service.is_active && "text-muted-foreground"
                            )}>
                              {service.name}
                            </p>
                            {service.includes_official_fees && service.official_fees_note && (
                              <p className="text-xs text-muted-foreground">
                                + {service.official_fees_note}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "font-semibold tabular-nums",
                            service.base_price === 0 && "text-warning"
                          )}>
                            {formatPrice(service.base_price)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Edit Modal */}
      <ServiceEditModal
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      />
    </>
  );
}
