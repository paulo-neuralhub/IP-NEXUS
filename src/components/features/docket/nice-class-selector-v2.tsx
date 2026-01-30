/**
 * L107: Nice Class Selector V2 - Con productos por clase
 * Selector mejorado que permite elegir clases Y productos específicos
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, Plus, Search, ChevronDown, ChevronRight, Star, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Iconos por clase Nice
const CLASS_ICONS: Record<number, string> = {
  1: '🧪', 2: '🎨', 3: '💄', 4: '⛽', 5: '💊',
  6: '🔩', 7: '⚙️', 8: '🔧', 9: '💻', 10: '🏥',
  11: '💡', 12: '🚗', 13: '🎯', 14: '💎', 15: '🎸',
  16: '📄', 17: '🧱', 18: '👜', 19: '🏗️', 20: '🪑',
  21: '🍽️', 22: '🪢', 23: '🧵', 24: '🛏️', 25: '👕',
  26: '🪡', 27: '🧶', 28: '⚽', 29: '🥩', 30: '🍞',
  31: '🌾', 32: '🥤', 33: '🍷', 34: '🚬', 35: '📢',
  36: '🏦', 37: '🔨', 38: '📡', 39: '🚚', 40: '♻️',
  41: '🎓', 42: '🔬', 43: '🏨', 44: '⚕️', 45: '⚖️',
};

// Descripciones de clases Nice
const NICE_CLASSES = [
  { number: 1, description: 'Productos químicos' },
  { number: 2, description: 'Pinturas, barnices' },
  { number: 3, description: 'Cosméticos, tocador' },
  { number: 4, description: 'Aceites, grasas' },
  { number: 5, description: 'Farmacéuticos' },
  { number: 6, description: 'Metales comunes' },
  { number: 7, description: 'Máquinas' },
  { number: 8, description: 'Herramientas' },
  { number: 9, description: 'Informática, electrónica' },
  { number: 10, description: 'Aparatos médicos' },
  { number: 11, description: 'Iluminación, calefacción' },
  { number: 12, description: 'Vehículos' },
  { number: 13, description: 'Armas de fuego' },
  { number: 14, description: 'Joyería, relojes' },
  { number: 15, description: 'Instrumentos musicales' },
  { number: 16, description: 'Papel, oficina' },
  { number: 17, description: 'Caucho, plásticos' },
  { number: 18, description: 'Cuero, viaje' },
  { number: 19, description: 'Construcción' },
  { number: 20, description: 'Muebles' },
  { number: 21, description: 'Utensilios cocina' },
  { number: 22, description: 'Cuerdas, redes' },
  { number: 23, description: 'Hilos textiles' },
  { number: 24, description: 'Tejidos' },
  { number: 25, description: 'Ropa, calzado' },
  { number: 26, description: 'Encajes, bordados' },
  { number: 27, description: 'Alfombras' },
  { number: 28, description: 'Juegos, deportes' },
  { number: 29, description: 'Carnes, conservas' },
  { number: 30, description: 'Café, pastelería' },
  { number: 31, description: 'Agrícola, animales' },
  { number: 32, description: 'Bebidas sin alcohol' },
  { number: 33, description: 'Bebidas alcohólicas' },
  { number: 34, description: 'Tabaco' },
  { number: 35, description: 'Publicidad, negocios' },
  { number: 36, description: 'Finanzas, seguros' },
  { number: 37, description: 'Construcción (serv.)' },
  { number: 38, description: 'Telecomunicaciones' },
  { number: 39, description: 'Transporte' },
  { number: 40, description: 'Tratamiento materiales' },
  { number: 41, description: 'Educación, entretenimiento' },
  { number: 42, description: 'Tecnología, I+D' },
  { number: 43, description: 'Hostelería' },
  { number: 44, description: 'Servicios médicos' },
  { number: 45, description: 'Jurídico, seguridad' },
];

export interface NiceSelection {
  classNumber: number;
  products: string[];
  customProducts: string[];
}

interface NiceClassSelectorV2Props {
  value: NiceSelection[];
  onChange: (selections: NiceSelection[]) => void;
  /** Modo simple (solo clases, sin productos) */
  simpleMode?: boolean;
}

interface NiceProduct {
  id: string;
  class_number: number;
  name_es: string;
  name_en: string | null;
  is_common: boolean;
}

export const NiceClassSelectorV2 = React.forwardRef<HTMLDivElement, NiceClassSelectorV2Props>(
  function NiceClassSelectorV2({ value, onChange, simpleMode = false }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Merge refs
  const setRefs = (el: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  // Fetch products from DB
  const { data: products = [] } = useQuery({
    queryKey: ['nice-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nice_products')
        .select('*')
        .order('is_common', { ascending: false })
        .order('name_es');
      
      if (error) throw error;
      return data as NiceProduct[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  // Group products by class
  const productsByClass = useMemo(() => {
    return products.reduce((acc, p) => {
      if (!acc[p.class_number]) acc[p.class_number] = [];
      acc[p.class_number].push(p);
      return acc;
    }, {} as Record<number, NiceProduct[]>);
  }, [products]);

  // Filter classes by search
  const filteredClasses = useMemo(() => {
    if (!search) return NICE_CLASSES;
    const term = search.toLowerCase();
    return NICE_CLASSES.filter(c =>
      c.number.toString().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  }, [search]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selection for a class
  const getClassSelection = (classNum: number): NiceSelection | undefined => {
    return value.find(s => s.classNumber === classNum);
  };

  // Check if class is selected
  const isClassSelected = (classNum: number): boolean => {
    return value.some(s => s.classNumber === classNum);
  };

  // Toggle class selection
  const toggleClass = (classNum: number) => {
    if (isClassSelected(classNum)) {
      // Remove class
      onChange(value.filter(s => s.classNumber !== classNum));
      if (expandedClass === classNum) setExpandedClass(null);
    } else {
      // Add class
      const newSelection: NiceSelection = {
        classNumber: classNum,
        products: [],
        customProducts: [],
      };
      onChange([...value, newSelection].sort((a, b) => a.classNumber - b.classNumber));
      if (!simpleMode) setExpandedClass(classNum);
    }
  };

  // Toggle product selection
  const toggleProduct = (classNum: number, productName: string) => {
    const selection = getClassSelection(classNum);
    if (!selection) return;

    const products = selection.products.includes(productName)
      ? selection.products.filter(p => p !== productName)
      : [...selection.products, productName];

    onChange(value.map(s =>
      s.classNumber === classNum ? { ...s, products } : s
    ));
  };

  // Add custom product
  const addCustomProduct = (classNum: number) => {
    if (!customInput.trim()) return;
    
    const selection = getClassSelection(classNum);
    if (!selection) return;

    if (!selection.customProducts.includes(customInput.trim())) {
      onChange(value.map(s =>
        s.classNumber === classNum
          ? { ...s, customProducts: [...s.customProducts, customInput.trim()] }
          : s
      ));
    }
    setCustomInput('');
  };

  // Remove custom product
  const removeCustomProduct = (classNum: number, product: string) => {
    const selection = getClassSelection(classNum);
    if (!selection) return;

    onChange(value.map(s =>
      s.classNumber === classNum
        ? { ...s, customProducts: s.customProducts.filter(p => p !== product) }
        : s
    ));
  };

  // Count products for a class
  const getProductCount = (classNum: number): number => {
    const selection = getClassSelection(classNum);
    if (!selection) return 0;
    return selection.products.length + selection.customProducts.length;
  };

  return (
    <div className="space-y-3" ref={setRefs}>
      {/* Selected classes badges */}
      <div className="flex flex-wrap gap-2">
        {value.map(selection => (
          <Badge
            key={selection.classNumber}
            variant="secondary"
            className="pl-2 pr-1 gap-1 h-7"
          >
            <span className="mr-1">{CLASS_ICONS[selection.classNumber]}</span>
            Clase {selection.classNumber}
            {!simpleMode && getProductCount(selection.classNumber) > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                {getProductCount(selection.classNumber)}
              </span>
            )}
            <button
              type="button"
              onClick={() => toggleClass(selection.classNumber)}
              className="ml-1 hover:text-destructive p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Añadir clase
        </Button>
      </div>

      {/* Dropdown selector */}
      {isOpen && (
        <div className="border rounded-lg bg-card shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clase..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[350px]">
            <div className="p-2">
              {/* Grid of classes */}
              {simpleMode ? (
                <div className="grid grid-cols-9 gap-1">
                  {filteredClasses.map(c => (
                    <button
                      key={c.number}
                      type="button"
                      onClick={() => toggleClass(c.number)}
                      className={cn(
                        "flex flex-col items-center p-1.5 rounded-lg text-center transition-all",
                        "hover:bg-muted",
                        isClassSelected(c.number) && "bg-primary/10 ring-1 ring-primary"
                      )}
                      title={c.description}
                    >
                      <span className="text-lg">{CLASS_ICONS[c.number]}</span>
                      <span className="text-xs font-medium">{c.number}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredClasses.map(c => {
                    const isExpanded = expandedClass === c.number;
                    const isSelected = isClassSelected(c.number);
                    const classProducts = productsByClass[c.number] || [];
                    const selection = getClassSelection(c.number);

                    return (
                      <Collapsible
                        key={c.number}
                        open={isExpanded && isSelected}
                        onOpenChange={(open) => {
                          if (open) {
                            if (!isSelected) toggleClass(c.number);
                            setExpandedClass(c.number);
                          } else {
                            setExpandedClass(null);
                          }
                        }}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg transition-all",
                            "hover:bg-muted cursor-pointer",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          {/* Checkbox area */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleClass(c.number);
                            }}
                            className={cn(
                              "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/30"
                            )}
                          >
                            {isSelected && <span className="text-xs">✓</span>}
                          </button>

                          {/* Class info */}
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="flex-1 flex items-center gap-2 text-left"
                            >
                              <span className="text-lg">{CLASS_ICONS[c.number]}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Clase {c.number}</span>
                                  {getProductCount(c.number) > 0 && (
                                    <Badge variant="outline" className="h-5 text-xs">
                                      <Package className="w-3 h-3 mr-1" />
                                      {getProductCount(c.number)}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate block">
                                  {c.description}
                                </span>
                              </div>
                              {isSelected && (
                                isExpanded
                                  ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </CollapsibleTrigger>
                        </div>

                        {/* Products panel */}
                        <CollapsibleContent>
                          <div className="ml-7 mt-1 p-3 bg-muted/50 rounded-lg space-y-3">
                            {/* Common products */}
                            {classProducts.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                  <Star className="w-3 h-3" />
                                  Productos frecuentes
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {classProducts.map(product => {
                                    const isProductSelected = selection?.products.includes(product.name_es);
                                    return (
                                      <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => toggleProduct(c.number, product.name_es)}
                                        className={cn(
                                          "px-2 py-1 text-xs rounded-md transition-colors",
                                          isProductSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background border hover:bg-muted"
                                        )}
                                      >
                                        {product.name_es}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Custom products */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Plus className="w-3 h-3" />
                                Productos personalizados
                              </div>
                              
                              {/* List custom products */}
                              {selection?.customProducts && selection.customProducts.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {selection.customProducts.map(product => (
                                    <Badge
                                      key={product}
                                      variant="secondary"
                                      className="pr-1"
                                    >
                                      {product}
                                      <button
                                        type="button"
                                        onClick={() => removeCustomProduct(c.number, product)}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Add custom */}
                              <div className="flex gap-2">
                                <Input
                                  value={customInput}
                                  onChange={e => setCustomInput(e.target.value)}
                                  placeholder="Añadir producto..."
                                  className="h-8 text-sm flex-1"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addCustomProduct(c.number);
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-8"
                                  onClick={() => addCustomProduct(c.number)}
                                >
                                  Añadir
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}

              {filteredClasses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No se encontraron clases
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
});

// Helper to convert legacy format to new format
export function convertLegacyNiceClasses(classes: number[]): NiceSelection[] {
  return classes.map(classNumber => ({
    classNumber,
    products: [],
    customProducts: [],
  }));
}

// Helper to extract just class numbers
export function extractClassNumbers(selections: NiceSelection[]): number[] {
  return selections.map(s => s.classNumber);
}
