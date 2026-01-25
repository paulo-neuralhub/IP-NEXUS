 /**
  * Service Category Accordion
  * Collapsible section showing services grouped by subcategory
  * Supports both ActiveService and PreconfiguredService
  */
 
 import { useState } from 'react';
 import { ChevronDown, ChevronRight, Edit } from 'lucide-react';
 import { Card, CardContent, CardHeader } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Switch } from '@/components/ui/switch';
 import { cn } from '@/lib/utils';
 import { ServiceEditModal } from './ServiceEditModal';
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
   readOnly?: boolean;
 }
 
 export function ServiceCategoryAccordion({
   category,
   label,
   icon,
   subcategories,
   readOnly = false,
 }: ServiceCategoryAccordionProps) {
   const [isOpen, setIsOpen] = useState(true);
   const [editingService, setEditingService] = useState<ActiveService | null>(null);
   
   const deactivate = useDeactivateService();
   const reactivate = useReactivateService();
   
   // Helper to check if service is an active service (belongs to organization)
   const isActiveService = (service: ServiceItem): service is ActiveService => {
     return 'organization_id' in service && service.organization_id !== null && service.organization_id !== undefined;
   };
   
   const totalActive = subcategories
     .flatMap(s => s.services)
     .filter(s => isActiveService(s) && s.is_active).length;
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
                 {readOnly ? totalServices : `${totalActive}/${totalServices}`}
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
                       const isActive = isActiveService(service) && service.is_active;
                       const canEdit = !readOnly && isActiveService(service);
                       
                       return (
                         <div
                           key={service.id}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-lg border transition-colors",
                             isActive
                               ? "bg-background border-border hover:border-primary/50" 
                               : readOnly
                                 ? "bg-background border-border hover:border-primary/50"
                                 : "bg-muted/30 border-muted"
                           )}
                         >
                           <div className="flex items-center gap-3">
                             {canEdit && (
                               <Switch
                                 checked={isActive}
                                 onCheckedChange={() => handleToggleActive(service)}
                                 disabled={deactivate.isPending || reactivate.isPending}
                               />
                             )}
                             <div>
                               <p className={cn(
                                 "font-medium",
                                 !isActive && !readOnly && "text-muted-foreground"
                               )}>
                                 {service.name}
                               </p>
                               {service.description && readOnly && (
                                 <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                   {service.description}
                                 </p>
                               )}
                               {service.includes_official_fees && service.official_fees_note && !readOnly && (
                                 <p className="text-xs text-muted-foreground">
                                   + {service.official_fees_note}
                                 </p>
                               )}
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                             <span className={cn(
                               "font-semibold tabular-nums",
                               service.base_price === 0 && !readOnly && "text-warning"
                             )}>
                               {formatPrice(service.base_price)}
                             </span>
                             {canEdit && (
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => setEditingService(service as ActiveService)}
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                             )}
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
       
       {!readOnly && (
         <ServiceEditModal
           service={editingService}
           open={!!editingService}
           onOpenChange={(open) => !open && setEditingService(null)}
         />
       )}
     </>
   );
 }