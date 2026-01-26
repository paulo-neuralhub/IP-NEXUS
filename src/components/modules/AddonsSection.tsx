// =============================================
// COMPONENTE: AddonsSection
// Add-ons organizados por categoría (collapsible)
// =============================================

import { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronRight,
  Globe,
  Phone,
  Link2,
  HardDrive,
  HeadphonesIcon,
  Info,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformAddon } from '@/types/modules';

// =============================================
// Iconos por categoría
// =============================================

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'jurisdictions': <Globe className="h-5 w-5" />,
  'communications': <Phone className="h-5 w-5" />,
  'integrations': <Link2 className="h-5 w-5" />,
  'storage': <HardDrive className="h-5 w-5" />,
  'support': <HeadphonesIcon className="h-5 w-5" />,
};

const CATEGORY_LABELS: Record<string, { title: string; description: string }> = {
  'jurisdictions': {
    title: 'Jurisdicciones',
    description: 'Cobertura geográfica para expedientes y vigilancia',
  },
  'communications': {
    title: 'Comunicaciones',
    description: 'Canales de comunicación con clientes',
  },
  'integrations': {
    title: 'Integraciones',
    description: 'Conecta con herramientas externas',
  },
  'storage': {
    title: 'Almacenamiento',
    description: 'Espacio adicional para documentos',
  },
  'support': {
    title: 'Soporte',
    description: 'Niveles de soporte premium',
  },
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  'ip': 'Propiedad Intelectual',
  'legal': 'Marco Legal (Genius)',
  'spider': 'Vigilancia Spider',
};

interface AddonsSectionProps {
  searchQuery?: string;
}

export function AddonsSection({ searchQuery = '' }: AddonsSectionProps) {
  const [addons, setAddons] = useState<PlatformAddon[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar add-ons desde la BD
  useEffect(() => {
    async function fetchAddons() {
      const { data, error } = await supabase
        .from('platform_addons')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');
      
      if (!error && data) {
        setAddons(data as PlatformAddon[]);
      }
      setLoading(false);
    }
    fetchAddons();
  }, []);

  // Filtrar por búsqueda
  const filteredAddons = addons.filter(addon => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      addon.name.toLowerCase().includes(query) ||
      addon.code.toLowerCase().includes(query) ||
      addon.description?.toLowerCase().includes(query)
    );
  });

  // Agrupar por categoría y subcategoría
  const groupedAddons = filteredAddons.reduce((acc, addon) => {
    const key = addon.subcategory 
      ? `${addon.category}-${addon.subcategory}`
      : addon.category;
    
    if (!acc[key]) {
      acc[key] = {
        category: addon.category,
        subcategory: addon.subcategory,
        addons: [],
      };
    }
    acc[key].addons.push(addon);
    return acc;
  }, {} as Record<string, { category: string; subcategory: string | null; addons: PlatformAddon[] }>);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Add-ons</h2>
        <p className="text-sm text-muted-foreground">
          Amplía las capacidades de tus módulos con extensiones adicionales
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedAddons).map(([key, group]) => (
          <AddonCategoryCard
            key={key}
            categoryKey={key}
            category={group.category}
            subcategory={group.subcategory}
            addons={group.addons}
          />
        ))}
      </div>

      {Object.keys(groupedAddons).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron add-ons
        </div>
      )}
    </div>
  );
}

// =============================================
// Subcomponente: AddonCategoryCard
// =============================================

interface AddonCategoryCardProps {
  categoryKey: string;
  category: string;
  subcategory: string | null;
  addons: PlatformAddon[];
}

function AddonCategoryCard({ categoryKey, category, subcategory, addons }: AddonCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Simular estado activo (en producción vendría de tenant_addons)
  const [activeAddons, setActiveAddons] = useState<Set<string>>(() => {
    const active = new Set<string>();
    addons.forEach(a => {
      if (a.is_included_free) active.add(a.code);
    });
    return active;
  });
  
  const activeCount = activeAddons.size;
  const totalCost = addons
    .filter(a => activeAddons.has(a.code) && !a.is_included_free)
    .reduce((sum, a) => sum + a.price_monthly, 0);

  const categoryInfo = CATEGORY_LABELS[category] || { title: category, description: '' };
  const icon = CATEGORY_ICONS[category] || <Globe className="h-5 w-5" />;
  
  const title = subcategory 
    ? `${categoryInfo.title} - ${SUBCATEGORY_LABELS[subcategory] || subcategory}`
    : categoryInfo.title;

  const toggleAddon = (code: string) => {
    setActiveAddons(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">
                  {title}
                </h4>
                {activeCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeCount} activo{activeCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {categoryInfo.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {totalCost > 0 && (
                <span className="text-sm font-medium text-primary">
                  +€{totalCost}/mes
                </span>
              )}
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Contenido */}
        <CollapsibleContent>
          <div className="border-t bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {addons.map(addon => (
                <AddonItemCard
                  key={addon.code}
                  addon={addon}
                  isActive={activeAddons.has(addon.code)}
                  onToggle={() => toggleAddon(addon.code)}
                />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// =============================================
// Subcomponente: AddonItemCard
// =============================================

interface AddonItemCardProps {
  addon: PlatformAddon;
  isActive: boolean;
  onToggle: () => void;
}

function AddonItemCard({ addon, isActive, onToggle }: AddonItemCardProps) {
  const isIncluded = addon.is_included_free;

  return (
    <div 
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        isActive ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
      )}
    >
      {/* Flag/Icon */}
      <span className="text-xl shrink-0">
        {addon.flag_emoji || addon.icon || '📦'}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm text-foreground truncate">
            {addon.name}
          </span>
          {addon.is_popular && (
            <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">
              Popular
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground truncate">
            {addon.description}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 shrink-0 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="text-xs">{addon.description}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Precio y toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {isIncluded ? (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Check className="h-3 w-3" />
            Incluido
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            €{addon.price_monthly}
          </span>
        )}
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={isIncluded}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
}
