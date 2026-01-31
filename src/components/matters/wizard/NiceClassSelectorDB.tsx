// ============================================================
// IP-NEXUS - NICE CLASS SELECTOR (DB BACKED)
// L131: Enhanced selector loading from database with scroll fix
// ============================================================

import { useState, useMemo } from 'react';
import { Check, Search, X, Package, Briefcase, ChevronRight, ChevronDown, Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNiceClassesWithProducts } from '@/hooks/use-nice-classes';
import { NiceIcon } from './NiceIconMap';

// Selected products structure: { classNumber: string[] }
export interface NiceSelection {
  [classNumber: number]: string[];
}

interface NiceClassSelectorDBProps {
  value: NiceSelection;
  onChange: (value: NiceSelection) => void;
  disabled?: boolean;
}

export function NiceClassSelectorDB({ value, onChange, disabled }: NiceClassSelectorDBProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'products' | 'services'>('all');
  const [expandedClasses, setExpandedClasses] = useState<number[]>([]);
  const [tempSelected, setTempSelected] = useState<NiceSelection>(value || {});
  const [customTermInput, setCustomTermInput] = useState<{ [key: number]: string }>({});

  // Fetch from DB
  const { data: niceClasses, isLoading } = useNiceClassesWithProducts();

  // Open modal
  const handleOpen = () => {
    setTempSelected(value || {});
    setSearch('');
    setSelectedTab('all');
    setExpandedClasses(Object.keys(value || {}).map(Number).filter(k => (value || {})[k]?.length > 0));
    setOpen(true);
  };

  // Count totals
  const totalClasses = useMemo(() => 
    Object.keys(tempSelected).filter(k => tempSelected[Number(k)]?.length > 0).length, 
    [tempSelected]
  );
  const totalProducts = useMemo(() => 
    Object.values(tempSelected).reduce((acc, arr) => acc + (arr?.length || 0), 0), 
    [tempSelected]
  );
  
  const valueClasses = useMemo(() => 
    Object.keys(value || {}).filter(k => (value || {})[Number(k)]?.length > 0).length, 
    [value]
  );
  const valueProducts = useMemo(() => 
    Object.values(value || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0), 
    [value]
  );

  // Filter classes
  const filteredClasses = useMemo(() => {
    if (!niceClasses) return [];
    
    let classes = niceClasses;
    
    if (selectedTab !== 'all') {
      classes = classes.filter(c => c.category === selectedTab);
    }
    
    if (search.trim()) {
      const s = search.toLowerCase();
      classes = classes.filter(c =>
        c.class_number.toString().includes(s) ||
        c.title_es.toLowerCase().includes(s) ||
        c.products.some(p => p.name_es.toLowerCase().includes(s))
      );
    }
    
    return classes;
  }, [niceClasses, search, selectedTab]);

  // Toggle class expansion
  const toggleExpanded = (classNum: number) => {
    setExpandedClasses(prev =>
      prev.includes(classNum)
        ? prev.filter(n => n !== classNum)
        : [...prev, classNum]
    );
  };

  // Toggle product selection
  const toggleProduct = (classNum: number, product: string) => {
    setTempSelected(prev => {
      const current = prev[classNum] || [];
      const updated = current.includes(product)
        ? current.filter(p => p !== product)
        : [...current, product];
      
      if (updated.length === 0) {
        const { [classNum]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [classNum]: updated };
    });
  };

  // Select all products in a class
  const selectAllInClass = (classNum: number) => {
    const clase = niceClasses?.find(c => c.class_number === classNum);
    if (!clase) return;
    
    setTempSelected(prev => ({
      ...prev,
      [classNum]: clase.products.map(p => p.name_es)
    }));
  };

  // Clear all in class
  const clearClass = (classNum: number) => {
    setTempSelected(prev => {
      const { [classNum]: _, ...rest } = prev;
      return rest;
    });
  };

  // Add custom term
  const addCustomTerm = (classNum: number) => {
    const term = customTermInput[classNum]?.trim();
    if (!term) return;
    
    setTempSelected(prev => ({
      ...prev,
      [classNum]: [...(prev[classNum] || []), term]
    }));
    setCustomTermInput(prev => ({ ...prev, [classNum]: '' }));
  };

  // Confirm
  const handleConfirm = () => {
    onChange(tempSelected);
    setOpen(false);
  };

  // Get class info for display
  const getClassInfo = (classNum: number) => {
    const clase = niceClasses?.find(c => c.class_number === classNum);
    return {
      iconName: clase?.icon || null,
      title: clase?.title_es || `Clase ${classNum}`,
    };
  };

  return (
    <>
      {/* Trigger */}
      <div
        onClick={disabled ? undefined : handleOpen}
        className={cn(
          'min-h-[60px] p-4 rounded-xl border-2 border-dashed transition-all',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
        )}
      >
        {valueClasses === 0 ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Package className="h-5 w-5" />
            <div>
              <p className="font-medium">Seleccionar clases y productos Nice</p>
              <p className="text-xs">Haz clic para elegir clases y sus productos específicos</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="default" className="gap-1">
                <Package className="h-3 w-3" />
                {valueClasses} clase(s), {valueProducts} producto(s)
              </Badge>
              <span className="text-xs text-muted-foreground">Haz clic para editar</span>
            </div>
            <div className="space-y-2">
              {Object.entries(value || {})
                .filter(([_, products]) => products?.length > 0)
                .slice(0, 3)
                .map(([classNum, products]) => {
                  const info = getClassInfo(Number(classNum));
                  return (
                    <div key={classNum} className="text-sm bg-muted/50 rounded-lg p-2">
                      <div className="flex items-center gap-2 font-medium">
                        <NiceIcon iconName={info.iconName} classNumber={Number(classNum)} className="h-4 w-4 text-muted-foreground" />
                        <span>Clase {classNum}: {info.title}</span>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {products.length} productos
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {products.join('; ')}
                      </p>
                    </div>
                  );
                })}
              {valueClasses > 3 && (
                <p className="text-xs text-muted-foreground">+{valueClasses - 3} clase(s) más...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Clasificación Nice - Clases y Productos
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona las clases y los productos/servicios específicos para tu marca
            </p>
          </DialogHeader>

          {/* Controls */}
          <div className="px-6 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clase o producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'all' | 'products' | 'services')}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">Todas (45)</TabsTrigger>
                <TabsTrigger value="products" className="flex-1">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  Productos (1-34)
                </TabsTrigger>
                <TabsTrigger value="services" className="flex-1">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  Servicios (35-45)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Summary */}
            {totalProducts > 0 && (
              <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {totalClasses} clase(s) con {totalProducts} producto(s) seleccionado(s)
                </span>
                <Button variant="ghost" size="sm" onClick={() => setTempSelected({})}>
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>

          {/* Class List - ScrollArea with fixed height */}
          <ScrollArea className="flex-1 px-6 mt-3">
            <div className="space-y-2 pb-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Cargando clasificación Nice...</span>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No se encontraron clases con "{search}"
                </div>
              ) : (
                filteredClasses.map((clase) => {
                  const selectedProducts = tempSelected[clase.class_number] || [];
                  const isExpanded = expandedClasses.includes(clase.class_number);
                  const hasSelection = selectedProducts.length > 0;
                  const isProduct = clase.category === 'products';

                  return (
                    <Collapsible 
                      key={clase.class_number} 
                      open={isExpanded} 
                      onOpenChange={() => toggleExpanded(clase.class_number)}
                    >
                      <CollapsibleTrigger asChild>
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                            hasSelection
                              ? isProduct
                                ? "border-blue-300 bg-blue-50 dark:bg-blue-950/30"
                                : "border-green-300 bg-green-50 dark:bg-green-950/30"
                              : "border-transparent hover:bg-muted/50"
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <NiceIcon iconName={clase.icon} classNumber={clase.class_number} className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs shrink-0">
                                {clase.class_number}
                              </Badge>
                              <span className="font-medium truncate">{clase.title_es}</span>
                            </div>
                            {clase.products.length > 0 && !isExpanded && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {clase.products.length} productos disponibles
                              </p>
                            )}
                          </div>
                          {hasSelection && (
                            <Badge variant={isProduct ? "default" : "secondary"} className="bg-primary shrink-0">
                              {selectedProducts.length} seleccionado(s)
                            </Badge>
                          )}
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="ml-8 mr-2 mt-2 p-4 bg-muted/30 rounded-lg space-y-3">
                          {/* Quick actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); selectAllInClass(clase.class_number); }}
                              disabled={clase.products.length === 0}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Seleccionar todos ({clase.products.length})
                            </Button>
                            {hasSelection && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); clearClass(clase.class_number); }}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Limpiar
                              </Button>
                            )}
                          </div>

                          {/* Products grid */}
                          {clase.products.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                              {clase.products.map((product) => {
                                const isSelected = selectedProducts.includes(product.name_es);
                                return (
                                  <label
                                    key={product.id}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                                      isSelected
                                        ? "bg-primary/10 border border-primary/30"
                                        : "hover:bg-muted"
                                    )}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleProduct(clase.class_number, product.name_es)}
                                    />
                                    <span className="text-sm">{product.name_es}</span>
                                    {product.is_common && (
                                      <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                                        común
                                      </Badge>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No hay productos precargados. Añade términos personalizados.
                            </p>
                          )}

                          {/* Custom terms display */}
                          {selectedProducts.filter(p => !clase.products.some(cp => cp.name_es === p)).length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Términos personalizados:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {selectedProducts
                                  .filter(p => !clase.products.some(cp => cp.name_es === p))
                                  .map(term => (
                                    <Badge key={term} variant="secondary" className="gap-1">
                                      {term}
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          toggleProduct(clase.class_number, term); 
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Add custom term */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Input
                              placeholder="Añadir término personalizado..."
                              value={customTermInput[clase.class_number] || ''}
                              onChange={(e) => setCustomTermInput(prev => ({ 
                                ...prev, 
                                [clase.class_number]: e.target.value 
                              }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addCustomTerm(clase.class_number);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                addCustomTerm(clase.class_number); 
                              }}
                              disabled={!customTermInput[clase.class_number]?.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {totalClasses} clase(s), {totalProducts} producto(s)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar selección
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
