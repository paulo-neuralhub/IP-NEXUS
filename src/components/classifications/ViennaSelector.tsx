// ============================================================
// IP-NEXUS - VIENNA CLASSIFICATION SELECTOR
// Figurative Elements Classification selector for trademarks
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, X, Loader2, Shapes, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useViennaCategories, useViennaSearch, type ViennaCategory, type ViennaSearchResult } from '@/hooks/use-classifications';

interface ViennaSelectorProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  maxSelections?: number;
  className?: string;
}

// Category colors (grouped by theme)
const CATEGORY_COLORS: Record<string, string> = {
  '01': 'bg-sky-100 text-sky-700',      // Celestial
  '02': 'bg-rose-100 text-rose-700',    // Human beings
  '03': 'bg-amber-100 text-amber-700',  // Animals
  '04': 'bg-purple-100 text-purple-700', // Fantasy
  '05': 'bg-green-100 text-green-700',  // Plants
  '06': 'bg-emerald-100 text-emerald-700', // Landscapes
  '07': 'bg-slate-100 text-slate-700',  // Constructions
  '08': 'bg-orange-100 text-orange-700', // Foodstuffs
  '09': 'bg-pink-100 text-pink-700',    // Textiles
  '10': 'bg-yellow-100 text-yellow-700', // Tobacco
};

export function ViennaSelector({ 
  selectedCodes, 
  onChange, 
  maxSelections = 20,
  className 
}: ViennaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { data: categories, isLoading: loadingCategories } = useViennaCategories();
  const { data: searchResults, isLoading: searching } = useViennaSearch(searchQuery, activeCategory || undefined);
  
  const toggleCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter(c => c !== code));
    } else if (selectedCodes.length < maxSelections) {
      onChange([...selectedCodes, code]);
    }
  };
  
  const getColorClass = (code: string) => {
    const prefix = code.slice(0, 2);
    return CATEGORY_COLORS[prefix] || 'bg-muted text-foreground';
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Shapes className="w-5 h-5 text-primary" />
            Clasificación de Viena
          </h3>
          <p className="text-sm text-muted-foreground">
            Elementos figurativos de marcas (29 categorías)
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5">
          {selectedCodes.length} / {maxSelections}
        </Badge>
      </div>
      
      {/* Selected codes */}
      <AnimatePresence>
        {selectedCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedCodes.map(code => (
              <motion.div
                key={code}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Badge 
                  variant="secondary"
                  className={cn("pl-2 pr-1 gap-1", getColorClass(code))}
                >
                  <span className="font-mono">{code}</span>
                  <button
                    onClick={() => toggleCode(code)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar elementos figurativos (ej: león, estrella, círculo)..."
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
                  const isSelected = selectedCodes.includes(result.section_code);
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => toggleCode(result.section_code)}
                      disabled={!isSelected && selectedCodes.length >= maxSelections}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                        "hover:bg-muted/50 disabled:opacity-50",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        getColorClass(result.section_code)
                      )}>
                        <Eye className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">
                            {result.section_code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Cat. {result.category_code}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.title}
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
            <p>No se encontraron elementos para "{searchQuery}"</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Categories Grid */}
      {searchQuery.length < 2 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Categorías de Viena
          </h4>
          
          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-4">
                {categories?.map(cat => {
                  const isActive = activeCategory === cat.code;
                  
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => setActiveCategory(isActive ? null : cat.code)}
                      whileHover={{ scale: 1.01 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                        "hover:shadow-md",
                        isActive 
                          ? "ring-2 ring-primary bg-primary/5"
                          : "bg-card hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold",
                        CATEGORY_COLORS[cat.code] || 'bg-muted'
                      )}>
                        {cat.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {cat.title_es}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <p className="text-sm text-muted-foreground">
                Escribe en el buscador para encontrar elementos en la Categoría {activeCategory}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
