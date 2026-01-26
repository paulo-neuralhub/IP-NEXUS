// ============================================================
// IP-NEXUS - RULE CATEGORY ACCORDION
// Groups rules by category and subcategory
// ============================================================

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Tag, FileText, Palette, Users, CreditCard, Settings } from 'lucide-react';
import { AutomationRule } from '@/hooks/useAutomationRules';
import { RuleCard } from './RuleCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  trademarks: { label: 'Marcas', icon: Tag, color: 'text-purple-600 bg-purple-50' },
  patents: { label: 'Patentes', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  designs: { label: 'Diseños', icon: Palette, color: 'text-pink-600 bg-pink-50' },
  clients: { label: 'Clientes', icon: Users, color: 'text-green-600 bg-green-50' },
  billing: { label: 'Facturación', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  general: { label: 'General', icon: Settings, color: 'text-gray-600 bg-gray-50' },
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  opposition: 'Oposición',
  renewal: 'Renovación',
  declaration: 'Declaración',
  response: 'Respuesta',
  annuity: 'Anualidad',
  general: 'General',
};

interface RuleCategoryAccordionProps {
  category: string;
  subcategory: string;
  rules: AutomationRule[];
}

export function RuleCategoryAccordion({ category, subcategory, rules }: RuleCategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  const Icon = config.icon;
  const subcategoryLabel = SUBCATEGORY_LABELS[subcategory] || subcategory;
  
  const activeCount = rules.filter(r => r.is_active).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg transition-colors",
          "hover:bg-muted/50",
          config.color.split(' ')[1]
        )}>
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5", config.color.split(' ')[0])} />
            <span className="font-semibold">
              {config.label} - {subcategoryLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              {activeCount}/{rules.length} activas
            </Badge>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 mt-3 pl-8">
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
