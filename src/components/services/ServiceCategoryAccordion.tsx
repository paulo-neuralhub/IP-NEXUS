/**
 * Service Category Accordion
 * Collapsible section showing services grouped by subcategory
 * Supports both ActiveService and PreconfiguredService with inline actions
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Plus, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ServiceEditModal } from './ServiceEditModal';
import { ServiceActivateModal } from './ServiceActivateModal';
import { 
  useDeactivateService, 
  useReactivateService, 
  type ActiveService,
  type PreconfiguredService 
} from '@/hooks/useServiceCatalogManagement';
import { toast } from 'sonner';

type ServiceItem = ActiveService | PreconfiguredService;

interface SubcategoryGroup {
  key: string;
  label: string;
  services: ServiceItem[];
}

interface ServiceCategoryAccordionProps {
  category: string;
  label: string;
  icon: string;
  subcategories: SubcategoryGroup[];
  activatedCodes?: Set<string>;
  showAvailableActions?: boolean;
}

export function ServiceCategoryAccordion({
  category,
  label,
  icon,
  subcategories,
  activatedCodes = new Set(),
  showAvailableActions = false,
}: ServiceCategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingService, setEditingService] = useState<ActiveService | null>(null);
  const [activatingService, setActivatingService] = useState<PreconfiguredService | null>(null);
  
  const deactivate = useDeactivateService();
  const reactivate = useReactivateService();
  
  // Helper to check if service is an active service (belongs to organization)
  const isActiveService = (service: ServiceItem): service is ActiveService => {
    return 'organization_id' in service && service.organization_id !== null && service.organization_id !== undefined;
  };
  
  // Helper to check if a preconfigured service is already activated
  const isServiceActivated = (service: ServiceItem): boolean => {
    if (isActiveService(service)) return true;
    return activatedCodes.has((service as PreconfiguredService).preconfigured_code);
  };
  
  const totalActive = subcategories
    .flatMap(s => s.services)
    .filter(s => {
      if (isActiveService(s)) return s.is_active;
      return activatedCodes.has((s as PreconfiguredService).preconfigured_code);
    }).length;
  const totalServices = subcategories.flatMap(s => s.services).length;
  
  const handleToggleActive = async (service: ServiceItem) => {
    if (!isActiveService(service)) return;
    
    try {
      if (service.is_active) {
        await deactivate.mutateAsync(service.id);
        toast.success('Servicio desactivado');
      } else {
        await reactivate.mutateAsync(service.id);
        toast.success('Servicio reactivado');
      }
    } catch (error) {
      toast.error('Error al cambiar estado del servicio');
    }
  };
  
  const formatPrice = (price: number) => {
    if (price === 0) return 'A consultar';
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
                {showAvailableActions ? totalServices : `${totalActive}/${totalServices}`}
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
                  <div className="space-y-3">
                    {subcategory.services.map((service) => {
                      const isOrg = isActiveService(service);
                      const isActivated = isServiceActivated(service);
                      const isActive = isOrg && service.is_active;
                      
                      return (
                        <div
                          key={service.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-colors",
                            isActive
                              ? "bg-background border-border hover:border-primary/50" 
                              : isActivated
                                ? "bg-accent/50 border-accent"
                                : "bg-muted/30 border-muted hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Toggle for org services */}
                            {isOrg && (
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => handleToggleActive(service)}
                                disabled={deactivate.isPending || reactivate.isPending}
                              />
                            )}
                            <div>
                              <p className={cn(
                                "font-medium",
                                !isActive && isOrg && "text-muted-foreground"
                              )}>
                                {service.name}
                              </p>
                              {service.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {service.description}
                                </p>
                              )}
                              {service.includes_official_fees && service.official_fees_note && (
                                <p className="text-xs text-muted-foreground">
                                  + {service.official_fees_note}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "font-semibold tabular-nums text-sm",
                              service.base_price === 0 && "text-warning"
                            )}>
                              {formatPrice(service.base_price)}
                            </span>
                            
                            {/* Actions based on service state */}
                            {isOrg ? (
                              // Edit button for organization services
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingService(service as ActiveService)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            ) : showAvailableActions && isActivated ? (
                              // Already activated badge
                              <Badge variant="secondary">
                                <Check className="mr-1 h-3 w-3" />
                                Activo
                              </Badge>
                            ) : showAvailableActions ? (
                              // Activate button for preconfigured services
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActivatingService(service as PreconfiguredService)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Activar
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Edit Modal for active services */}
      <ServiceEditModal
        service={editingService}
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
      />
      
      {/* Activate Modal for preconfigured services */}
      <ServiceActivateModal
        service={activatingService}
        open={!!activatingService}
        onOpenChange={(open) => !open && setActivatingService(null)}
      />
    </>
  );
}
