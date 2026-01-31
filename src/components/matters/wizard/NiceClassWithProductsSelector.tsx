// ============================================================
// IP-NEXUS - NICE CLASS WITH PRODUCTS SELECTOR
// L132: Expandable classes with selectable products from DB
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, ChevronRight, Plus, X, AlertCircle,
  Package, Wrench, Sparkles, Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useNiceClasses, useNiceProducts, NICE_CLASS_ICONS } from '@/hooks/use-nice-classes';

// Selection type: classNumber -> array of product names (strings)
export interface NiceSelection {
  [classNumber: number]: string[];
}

interface NiceClassWithProductsSelectorProps {
  value: NiceSelection;
  onChange: (selection: NiceSelection) => void;
  maxHeight?: string;
}

export function NiceClassWithProductsSelector({
  value,
  onChange,
  maxHeight = '500px',
}: NiceClassWithProductsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
  const [customTermInputs, setCustomTermInputs] = useState<Record<number, string>>({});

  // Fetch data from DB
  const { data: classes = [], isLoading: loadingClasses } = useNiceClasses();
  const { data: allProducts = [], isLoading: loadingProducts } = useNiceProducts();

  // Group products by class
  const productsByClass = useMemo(() => {
    const grouped: Record<number, typeof allProducts> = {};
    allProducts.forEach(p => {
      if (!grouped[p.class_number]) grouped[p.class_number] = [];
      grouped[p.class_number].push(p);
    });
    return grouped;
  }, [allProducts]);

  // Split classes into products and services
  const productClasses = useMemo(() => classes.filter(c => c.class_number <= 34), [classes]);
  const serviceClasses = useMemo(() => classes.filter(c => c.class_number > 34), [classes]);

  // Calculate totals
  const totalClasses = Object.keys(value).filter(k => value[parseInt(k)]?.length > 0).length;
  const totalTerms = Object.values(value).reduce((sum, terms) => sum + terms.length, 0);

  // Filter classes and products by search
  const filterResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    const matchingClasses: number[] = [];
    const matchingProducts: { classNumber: number; product: string }[] = [];

    classes.forEach(cls => {
      if (
        cls.class_number.toString().includes(query) ||
        cls.title_es.toLowerCase().includes(query) ||
        cls.title_en?.toLowerCase().includes(query)
      ) {
        matchingClasses.push(cls.class_number);
      }
    });

    allProducts.forEach(p => {
      if (
        p.name_es.toLowerCase().includes(query) ||
        p.name_en?.toLowerCase().includes(query)
      ) {
        matchingProducts.push({ classNumber: p.class_number, product: p.name_es });
      }
    });

    return { matchingClasses, matchingProducts };
  }, [searchQuery, classes, allProducts]);

  // Handlers
  const toggleClass = useCallback((classNumber: number) => {
    setExpandedClasses(prev =>
      prev.includes(classNumber)
        ? prev.filter(c => c !== classNumber)
        : [...prev, classNumber]
    );
  }, []);

  const toggleProduct = useCallback((classNumber: number, productName: string) => {
    const current = value[classNumber] || [];
    const updated = current.includes(productName)
      ? current.filter(p => p !== productName)
      : [...current, productName];

    onChange({
      ...value,
      [classNumber]: updated,
    });
  }, [value, onChange]);

  const addCustomTerm = useCallback((classNumber: number) => {
    const term = customTermInputs[classNumber]?.trim();
    if (!term) return;

    const current = value[classNumber] || [];
    if (!current.includes(term)) {
      onChange({
        ...value,
        [classNumber]: [...current, term],
      });
    }
    setCustomTermInputs(prev => ({ ...prev, [classNumber]: '' }));
  }, [value, onChange, customTermInputs]);

  const clearAll = useCallback(() => {
    onChange({});
    setExpandedClasses([]);
  }, [onChange]);

  const selectAllInClass = useCallback((classNumber: number) => {
    const products = productsByClass[classNumber] || [];
    const allNames = products.map(p => p.name_es);
    onChange({
      ...value,
      [classNumber]: allNames,
    });
  }, [value, onChange, productsByClass]);

  const clearClass = useCallback((classNumber: number) => {
    const updated = { ...value };
    delete updated[classNumber];
    onChange(updated);
  }, [value, onChange]);

  if (loadingClasses || loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clase, producto o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Selection summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3" />
              {totalClasses} {totalClasses === 1 ? 'clase' : 'clases'}, {totalTerms} {totalTerms === 1 ? 'término' : 'términos'}
            </Badge>
          </div>
          {totalTerms > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea style={{ maxHeight }} className="p-4">
        {/* Search results */}
        {filterResults && filterResults.matchingProducts.length > 0 && (
          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Resultados ({filterResults.matchingProducts.length})
              </p>
              <div className="space-y-1">
                {filterResults.matchingProducts.slice(0, 20).map((result, idx) => {
                  const isSelected = value[result.classNumber]?.includes(result.product);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      )}
                      onClick={() => toggleProduct(result.classNumber, result.product)}
                    >
                      <Checkbox checked={isSelected} />
                      <span className="text-sm">{result.product}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Clase {result.classNumber}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator />
          </div>
        )}

        {/* PRODUCTS Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Package className="h-4 w-4" />
            PRODUCTOS (Clases 1-34)
          </div>

          <div className="space-y-1">
            {productClasses.map(cls => (
              <ClassAccordion
                key={cls.class_number}
                classNumber={cls.class_number}
                title={cls.title_es}
                products={productsByClass[cls.class_number] || []}
                selectedProducts={value[cls.class_number] || []}
                isExpanded={expandedClasses.includes(cls.class_number)}
                onToggle={() => toggleClass(cls.class_number)}
                onProductToggle={(product) => toggleProduct(cls.class_number, product)}
                onSelectAll={() => selectAllInClass(cls.class_number)}
                onClearClass={() => clearClass(cls.class_number)}
                customTermInput={customTermInputs[cls.class_number] || ''}
                onCustomTermChange={(val) => setCustomTermInputs(prev => ({ ...prev, [cls.class_number]: val }))}
                onAddCustomTerm={() => addCustomTerm(cls.class_number)}
                highlighted={filterResults?.matchingClasses.includes(cls.class_number)}
              />
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* SERVICES Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Wrench className="h-4 w-4" />
            SERVICIOS (Clases 35-45)
          </div>

          <div className="space-y-1">
            {serviceClasses.map(cls => (
              <ClassAccordion
                key={cls.class_number}
                classNumber={cls.class_number}
                title={cls.title_es}
                products={productsByClass[cls.class_number] || []}
                selectedProducts={value[cls.class_number] || []}
                isExpanded={expandedClasses.includes(cls.class_number)}
                onToggle={() => toggleClass(cls.class_number)}
                onProductToggle={(product) => toggleProduct(cls.class_number, product)}
                onSelectAll={() => selectAllInClass(cls.class_number)}
                onClearClass={() => clearClass(cls.class_number)}
                customTermInput={customTermInputs[cls.class_number] || ''}
                onCustomTermChange={(val) => setCustomTermInputs(prev => ({ ...prev, [cls.class_number]: val }))}
                onAddCustomTerm={() => addCustomTerm(cls.class_number)}
                highlighted={filterResults?.matchingClasses.includes(cls.class_number)}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer summary */}
      {totalTerms > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {Object.entries(value)
              .filter(([, terms]) => terms.length > 0)
              .map(([classNum, terms]) => (
                <Badge key={classNum} variant="secondary" className="gap-1">
                  Clase {classNum} ({terms.length})
                  <button
                    onClick={() => clearClass(parseInt(classNum))}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: Accordion for each class
interface ClassAccordionProps {
  classNumber: number;
  title: string;
  products: { name_es: string; name_en: string | null; is_common: boolean }[];
  selectedProducts: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onProductToggle: (product: string) => void;
  onSelectAll: () => void;
  onClearClass: () => void;
  customTermInput: string;
  onCustomTermChange: (val: string) => void;
  onAddCustomTerm: () => void;
  highlighted?: boolean;
}

function ClassAccordion({
  classNumber,
  title,
  products,
  selectedProducts,
  isExpanded,
  onToggle,
  onProductToggle,
  onSelectAll,
  onClearClass,
  customTermInput,
  onCustomTermChange,
  onAddCustomTerm,
  highlighted,
}: ClassAccordionProps) {
  const icon = NICE_CLASS_ICONS[classNumber] || '📦';
  const selectedCount = selectedProducts.length;
  const hasSelection = selectedCount > 0;

  // Separate common (Fast Track) and regular products
  const commonProducts = products.filter(p => p.is_common);
  const regularProducts = products.filter(p => !p.is_common);

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all",
        highlighted && "ring-2 ring-primary",
        hasSelection && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="font-medium">Clase {classNumber}</span>
          <span className="text-muted-foreground ml-2 text-sm truncate">{title}</span>
        </div>
        {hasSelection && (
          <Badge variant="default" className="shrink-0">
            {selectedCount} {selectedCount === 1 ? 'término' : 'términos'}
          </Badge>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-4">
              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onSelectAll}>
                  Seleccionar todos
                </Button>
                {hasSelection && (
                  <Button variant="ghost" size="sm" onClick={onClearClass}>
                    Limpiar clase
                  </Button>
                )}
              </div>

              {/* Fast Track products */}
              {commonProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-warning-foreground">
                    <Sparkles className="h-3 w-3" />
                    Términos pre-aprobados (Fast Track)
                  </div>
                  <div className="grid gap-1">
                    {commonProducts.map((product) => {
                      const isSelected = selectedProducts.includes(product.name_es);
                      return (
                        <label
                          key={product.name_es}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onProductToggle(product.name_es)}
                          />
                          <span className="text-sm">{product.name_es}</span>
                          <Badge variant="outline" className="ml-auto text-xs bg-warning/10 text-warning-foreground border-warning/30">
                            Fast Track
                          </Badge>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Regular products */}
              {regularProducts.length > 0 && (
                <div className="space-y-2">
                  {commonProducts.length > 0 && (
                    <div className="text-xs font-medium text-muted-foreground">
                      Otros términos
                    </div>
                  )}
                  <div className="grid gap-1 max-h-[200px] overflow-y-auto">
                    {regularProducts.map((product) => {
                      const isSelected = selectedProducts.includes(product.name_es);
                      return (
                        <label
                          key={product.name_es}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onProductToggle(product.name_es)}
                          />
                          <span className="text-sm">{product.name_es}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom term input */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs text-muted-foreground">Término personalizado:</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribir término específico..."
                    value={customTermInput}
                    onChange={(e) => onCustomTermChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAddCustomTerm()}
                    className="flex-1 h-9"
                  />
                  <Button
                    size="sm"
                    onClick={onAddCustomTerm}
                    disabled={!customTermInput.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
                <p className="text-xs text-warning-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Términos personalizados pueden retrasar el examen
                </p>
              </div>

              {/* Show custom terms */}
              {selectedProducts.some(p => !products.find(prod => prod.name_es === p)) && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Términos personalizados añadidos:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedProducts
                      .filter(p => !products.find(prod => prod.name_es === p))
                      .map(term => (
                        <Badge key={term} variant="outline" className="gap-1">
                          {term}
                          <button
                            onClick={() => onProductToggle(term)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
