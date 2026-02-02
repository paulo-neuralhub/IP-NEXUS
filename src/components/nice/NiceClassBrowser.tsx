// ============================================================
// IP-NEXUS - Nice Class Browser Component
// Visual browser for exploring Nice classes and items
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package, ChevronRight, Loader2, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NICE_CLASS_ICONS, NICE_CLASS_TITLES_ES } from '@/types/nice-classification';
import { cn } from '@/lib/utils';

interface NiceClassData {
  id: string;
  class_number: number;
  class_type: string;
  title_en: string;
  title_es: string | null;
  items_count: number;
}

interface NiceItemData {
  id: string;
  class_number: number;
  item_code: string;
  item_name_en: string;
  item_name_es: string | null;
  alternate_names: string[] | null;
  is_generic_term: boolean;
}

export function NiceClassBrowser() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'product' | 'service'>('all');

  // Load classes with React Query for auto-refresh
  const { data: classes = [], isLoading: loading, refetch: refetchClasses } = useQuery({
    queryKey: ['nice-classes-browser'],
    queryFn: async (): Promise<NiceClassData[]> => {
      // Get classes
      const { data: classesData } = await supabase
        .from('nice_classes')
        .select('id, class_number, class_type, title_en, title_es')
        .order('class_number');
      
      // Get item counts
      const { data: itemsData } = await supabase
        .from('nice_class_items')
        .select('class_number');
      
      const counts: Record<number, number> = {};
      itemsData?.forEach(item => {
        counts[item.class_number] = (counts[item.class_number] || 0) + 1;
      });
      
      return (classesData || []).map(c => ({
        ...c,
        items_count: counts[c.class_number] || 0
      }));
    },
    staleTime: 0, // Always consider stale to pick up imports
    refetchOnMount: 'always', // Refetch when component mounts (tab switch)
  });

  // Load items when class is selected - also with React Query
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['nice-class-items', selectedClass],
    queryFn: async (): Promise<NiceItemData[]> => {
      if (!selectedClass) return [];
      const { data } = await supabase
        .from('nice_class_items')
        .select('*')
        .eq('class_number', selectedClass)
        .order('item_code');
      return data || [];
    },
    enabled: !!selectedClass,
    staleTime: 0, // Always fresh
    refetchOnMount: 'always',
  });

  // Filter classes
  const filteredClasses = classes.filter(c => {
    if (filter === 'product' && c.class_type !== 'product') return false;
    if (filter === 'service' && c.class_type !== 'service') return false;
    return true;
  });

  // Filter items by search
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.item_name_en.toLowerCase().includes(term) ||
      item.item_name_es?.toLowerCase().includes(term) ||
      item.item_code.includes(term)
    );
  });

  const selectedClassInfo = classes.find(c => c.class_number === selectedClass);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[700px]">
      {/* Classes list */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Clases de Niza
            </span>
            <Button variant="ghost" size="icon" onClick={() => refetchClasses()} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="product" className="text-xs">Productos</TabsTrigger>
              <TabsTrigger value="service" className="text-xs">Servicios</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y">
                {filteredClasses.map((c) => (
                  <button
                    key={c.class_number}
                    onClick={() => setSelectedClass(c.class_number)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 transition-colors',
                      selectedClass === c.class_number && 'bg-muted'
                    )}
                  >
                    <span className="text-xl">{NICE_CLASS_ICONS[c.class_number]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Clase {c.class_number}</span>
                        <Badge 
                          variant={c.items_count > 0 ? 'default' : 'outline'} 
                          className="text-xs"
                        >
                          {c.items_count}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {c.title_es || NICE_CLASS_TITLES_ES[c.class_number] || c.title_en}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Items panel */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedClass ? (
                <span className="flex items-center gap-2">
                  <span className="text-xl">{NICE_CLASS_ICONS[selectedClass]}</span>
                  Clase {selectedClass}
                </span>
              ) : (
                'Selecciona una clase'
              )}
            </CardTitle>
            {selectedClass && (
              <Badge variant="secondary">
                {filteredItems.length} items
              </Badge>
            )}
          </div>
          {selectedClass && (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos o servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p>Selecciona una clase para ver sus items</p>
              </div>
            ) : loadingItems ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-50" />
                <p>
                  {searchTerm 
                    ? 'No hay items que coincidan con la búsqueda' 
                    : 'No hay items importados para esta clase'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {item.is_generic_term && (
                        <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {item.item_code}
                          </code>
                          <span className="font-medium">{item.item_name_en}</span>
                          {item.is_generic_term && (
                            <Badge variant="outline" className="text-xs">
                              Genérico
                            </Badge>
                          )}
                        </div>
                        {item.item_name_es && item.item_name_es !== item.item_name_en && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.item_name_es}
                          </p>
                        )}
                        {item.alternate_names && item.alternate_names.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            También: {item.alternate_names.join(' / ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
