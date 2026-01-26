// ============================================================
// IP-NEXUS - AUTOMATION RULES LIST
// List and filter automation rules
// ============================================================

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, Filter } from 'lucide-react';
import { useAutomationRules, AutomationRule } from '@/hooks/useAutomationRules';
import { RuleCard } from './RuleCard';
import { RuleCategoryAccordion } from './RuleCategoryAccordion';

const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'trademarks', label: 'Marcas' },
  { value: 'patents', label: 'Patentes' },
  { value: 'designs', label: 'Diseños' },
  { value: 'clients', label: 'Clientes' },
  { value: 'billing', label: 'Facturación' },
  { value: 'general', label: 'General' },
];

const OFFICES = [
  { value: 'all', label: 'Todas las oficinas' },
  { value: 'EUIPO', label: 'EUIPO' },
  { value: 'OEPM', label: 'OEPM (España)' },
  { value: 'USPTO', label: 'USPTO (USA)' },
  { value: 'UKIPO', label: 'UKIPO (UK)' },
  { value: 'WIPO', label: 'WIPO/PCT' },
  { value: 'EPO', label: 'EPO' },
];

export function RulesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryFilter = searchParams.get('category') || 'all';
  const officeFilter = searchParams.get('office') || 'all';

  const { data: rules, isLoading } = useAutomationRules({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  // Filter rules
  const filteredRules = rules?.filter(rule => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        rule.name.toLowerCase().includes(q) ||
        rule.description?.toLowerCase().includes(q) ||
        rule.code.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Office filter (check conditions JSON)
    if (officeFilter !== 'all') {
      const conditions = rule.conditions as Record<string, unknown> | null;
      const offices = conditions?.offices as string[] | undefined;
      if (!offices?.includes(officeFilter)) return false;
    }

    return true;
  }) || [];

  // Group by category and subcategory
  const groupedRules = filteredRules.reduce((acc, rule) => {
    const cat = rule.category || 'general';
    const subcat = rule.subcategory || 'general';
    const key = `${cat}__${subcat}`;
    
    if (!acc[key]) {
      acc[key] = {
        category: cat,
        subcategory: subcat,
        rules: [],
      };
    }
    acc[key].rules.push(rule);
    return acc;
  }, {} as Record<string, { category: string; subcategory: string; rules: AutomationRule[] }>);

  const handleCategoryChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', value);
    }
    setSearchParams(newParams);
  };

  const handleOfficeChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete('office');
    } else {
      newParams.set('office', value);
    }
    setSearchParams(newParams);
  };

  if (isLoading) {
    return <RulesListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reglas de Automatización</h1>
          <p className="text-muted-foreground">
            {filteredRules.length} reglas • {filteredRules.filter(r => r.is_active).length} activas
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva regla
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar reglas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={officeFilter} onValueChange={handleOfficeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Oficina" />
              </SelectTrigger>
              <SelectContent>
                {OFFICES.map(office => (
                  <SelectItem key={office.value} value={office.value}>
                    {office.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      {filteredRules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No se encontraron reglas con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-6">
            {Object.values(groupedRules).map((group) => (
              <RuleCategoryAccordion
                key={`${group.category}__${group.subcategory}`}
                category={group.category}
                subcategory={group.subcategory}
                rules={group.rules}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function RulesListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-14" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
