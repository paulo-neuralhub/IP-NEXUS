// ============================================================
// IP-NEXUS - IPC CLASSIFICATION SELECTOR
// International Patent Classification selector for patents
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Check, X, Loader2, Cpu, Zap, FlaskConical, Factory, Building2, Cog, Atom, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIPCSections, useIPCSearch, type IPCSection, type IPCSearchResult } from '@/hooks/use-classifications';

interface IPCSelectorProps {
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  maxSelections?: number;
  className?: string;
}

// Section icons mapping
const SECTION_ICONS: Record<string, typeof Cpu> = {
  'A': FlaskConical,  // Human Necessities
  'B': Factory,       // Operations/Transport
  'C': Atom,          // Chemistry
  'D': Building2,     // Textiles
  'E': Building2,     // Fixed Constructions
  'F': Cog,           // Mechanical Engineering
  'G': Cpu,           // Physics
  'H': Zap,           // Electricity
};

const SECTION_COLORS: Record<string, string> = {
  'A': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  'B': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'C': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  'D': 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  'E': 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'F': 'bg-slate-500/10 text-slate-600 border-slate-500/30',
  'G': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
  'H': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
};

export function IPCSelector({ 
  selectedCodes, 
  onChange, 
  maxSelections = 10,
  className 
}: IPCSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const { data: sections, isLoading: loadingSections } = useIPCSections();
  const { data: searchResults, isLoading: searching } = useIPCSearch(searchQuery, activeSection || undefined);
  
  const toggleCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      onChange(selectedCodes.filter(c => c !== code));
    } else if (selectedCodes.length < maxSelections) {
      onChange([...selectedCodes, code]);
    }
  };
  
  const removeCode = (code: string) => {
    onChange(selectedCodes.filter(c => c !== code));
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Clasificación IPC
          </h3>
          <p className="text-sm text-muted-foreground">
            Clasificación Internacional de Patentes (74,000+ códigos)
          </p>
        </div>
        <Badge variant="outline" className={cn(
          selectedCodes.length >= maxSelections 
            ? "bg-amber-50 text-amber-700 border-amber-300" 
            : "bg-primary/5"
        )}>
          {selectedCodes.length} / {maxSelections} seleccionados
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
            {selectedCodes.map(code => {
              const section = code.charAt(0);
              return (
                <motion.div
                  key={code}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "pl-2 pr-1 gap-1 border",
                      SECTION_COLORS[section] || "bg-muted"
                    )}
                  >
                    <span className="font-mono">{code}</span>
                    <button
                      onClick={() => removeCode(code)}
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
          placeholder="Buscar por código o descripción (ej: H04L, telecomunicaciones)..."
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
                  const isSelected = selectedCodes.includes(result.full_code);
                  const SectionIcon = SECTION_ICONS[result.section_code] || Lightbulb;
                  
                  return (
                    <button
                      key={result.id}
                      onClick={() => toggleCode(result.full_code)}
                      disabled={!isSelected && selectedCodes.length >= maxSelections}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                        "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                        isSelected && "bg-primary/10 ring-1 ring-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                        SECTION_COLORS[result.section_code] || "bg-muted"
                      )}>
                        <SectionIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm">
                            {result.full_code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Sección {result.section_code}
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
            <p>No se encontraron códigos IPC para "{searchQuery}"</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Sections Grid */}
      {searchQuery.length < 2 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Secciones IPC
          </h4>
          
          {loadingSections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {sections?.map(section => {
                const SectionIcon = SECTION_ICONS[section.code] || Lightbulb;
                const isActive = activeSection === section.code;
                
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(isActive ? null : section.code)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      "hover:shadow-md",
                      isActive 
                        ? cn("ring-2 ring-primary shadow-lg", SECTION_COLORS[section.code])
                        : "bg-card hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2 border",
                      SECTION_COLORS[section.code] || "bg-muted"
                    )}>
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold">{section.code}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        isActive && "rotate-90"
                      )} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {section.title_es}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
          
          {/* Section detail hint */}
          {activeSection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <p className="text-sm text-muted-foreground">
                Escribe en el buscador para encontrar códigos en la Sección {activeSection}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
