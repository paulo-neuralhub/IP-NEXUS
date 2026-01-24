/**
 * Expandable Service Row Component
 * Shows service with expandable jurisdiction prices
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, MoreHorizontal, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { ServicePricesManager } from './ServicePricesManager';
import { useServicePrices } from '@/hooks/use-service-catalog';
import { 
  SERVICE_TYPES, 
  JURISDICTIONS, 
  type ServiceCatalogItem, 
  type ServiceType,
  type Jurisdiction,
} from '@/types/service-catalog';

interface ExpandableServiceRowProps {
  service: ServiceCatalogItem;
  onEdit: (service: ServiceCatalogItem) => void;
  onDelete: (service: ServiceCatalogItem) => void;
  onToggleActive: (service: ServiceCatalogItem) => void;
}

export function ExpandableServiceRow({
  service,
  onEdit,
  onDelete,
  onToggleActive,
}: ExpandableServiceRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: prices } = useServicePrices(service.id);
  const hasPrices = (prices?.length || 0) > 0;
  
  const typeConfig = SERVICE_TYPES[service.service_type as ServiceType] || SERVICE_TYPES.general;
  const jurisdiction = service.jurisdiction as Jurisdiction;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <TableRow className={!service.is_active ? 'opacity-50' : ''}>
        <TableCell className="w-8">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
            {service.reference_code || '-'}
          </code>
        </TableCell>
        <TableCell>
          <div>
            <span className="font-medium">{service.name}</span>
            {hasPrices && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {prices?.length}
              </Badge>
            )}
            {service.description && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {service.description}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={typeConfig.color} variant="secondary">
            {typeConfig.label}
          </Badge>
        </TableCell>
        <TableCell>
          {jurisdiction && JURISDICTIONS[jurisdiction] ? (
            <span className="flex items-center gap-1">
              <span>{JURISDICTIONS[jurisdiction].flag}</span>
              <span className="text-sm">{jurisdiction}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {service.official_fee > 0 ? `${service.official_fee.toLocaleString()}€` : '-'}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {service.professional_fee > 0 ? `${service.professional_fee.toLocaleString()}€` : '-'}
        </TableCell>
        <TableCell className="text-right font-medium tabular-nums">
          {service.base_price.toLocaleString()}€
        </TableCell>
        <TableCell>
          <Switch
            checked={service.is_active}
            onCheckedChange={() => onToggleActive(service)}
          />
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsExpanded(true)}>
                <Globe className="w-4 h-4 mr-2" />
                Gestionar precios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(service)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      
      {/* Expanded prices section */}
      <CollapsibleContent asChild>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableCell colSpan={10} className="p-4">
            <ServicePricesManager
              serviceId={service.id}
              serviceName={service.name}
              defaultPrice={service.base_price}
            />
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}
