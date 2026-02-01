// ============================================================
// IP-NEXUS - LOCARNO CLASSIFICATION SELECTOR
// International Design Classification selector
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Loader2, Palette, Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocarnoClasses, useLocarnoSearch, type LocarnoClass, type LocarnoSearchResult } from '@/hooks/use-classifications';

interface LocarnoSelectorProps {
  selectedClasses: number[];
  selectedItems: string[];
  onClassesChange: (classes: number[]) => void;
  onItemsChange: (items: string[]) => void;
  className?: string;
}

export function LocarnoSelector({ 
  selectedClasses, 
  selectedItems,
  onClassesChange, 
  onItemsChange,
  className 
}: LocarnoSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClass, setActiveClass] = useState<number | null>(null);
  
  const { data: classes, isLoading: loadingClasses } = useLocarnoClasses();
  const { data: searchResults, isLoading: searching } = useLocarnoSearch(searchQuery, activeClass || undefined);
  
  const toggleClass = (classNumber: number) => {
    if (selectedClasses.includes(classNumber)) {
      onClassesChange(selectedClasses.filter(c => c !== classNumber));
    } else {
      onClassesChange([...selectedClasses, classNumber]);
    }
  };
  
  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onItemsChange(selectedItems.filter(i => i !== itemId));
    } else {
      onItemsChange([...selectedItems, itemId]);
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Clasificación de Locarno
          </h3>
          <p className="text-sm text-muted-foreground">
            Clasificación Internacional para Diseños Industriales (32 clases)
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5">
          {selectedClasses.length} clases
        </Badge>
      </div>
      
      {/* Selected classes */}
      <AnimatePresence>
        {selectedClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedClasses.sort((a, b) => a - b).map(classNum => {
              const classInfo = classes?.find(c => c.class_number === classNum);
              return (
                <motion.div
                  key={classNum}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge variant="secondary" className="pl-2 pr-1 gap-1 bg-violet-100 text-violet-700 border-violet-300">
                    <span className="font-medium">Clase {classNum}</span>
                    <span className="text-xs opacity-75 max-w-[150px] truncate">
                      {classInfo?.title_es}
                    </span>
                    <button
                      onClick={() => toggleClass(classNum)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos de diseño..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {/* Search Results */}
      <AnimatePresence mode="wait">
        {searchQuery.length >= 2 && searchResults && searchResults.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ScrollArea className="h-64 rounded-lg border bg-card">
              <div className="p-2 space-y-1">
                {searchResults.map(result => {
                  const isSelected = selectedItems.includes(result.id);
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => toggleItem(result.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                        "hover:bg-muted/50",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                        <span className="text-violet-700 font-bold text-sm">
                          {result.class_number}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            {result.item_number}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">
                          {result.term}
                        </p>
                      </div>
                      
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        ) : searchQuery.length >= 2 && !searching && searchResults?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No se encontraron productos para "{searchQuery}"</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Classes Grid */}
      {searchQuery.length < 2 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Clases de Locarno (32)
          </h4>
          
          {loadingClasses ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {classes?.map(cls => {
                const isSelected = selectedClasses.includes(cls.class_number);
                const isActive = activeClass === cls.class_number;
                
                return (
                  <motion.button
                    key={cls.id}
                    onClick={() => {
                      toggleClass(cls.class_number);
                      setActiveClass(isActive ? null : cls.class_number);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={cls.title_es}
                    className={cn(
                      "aspect-square rounded-lg border font-bold transition-all",
                      "flex items-center justify-center",
                      isSelected
                        ? "bg-violet-500 text-white border-violet-600 shadow-lg shadow-violet-500/30"
                        : "bg-card hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {cls.class_number}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
