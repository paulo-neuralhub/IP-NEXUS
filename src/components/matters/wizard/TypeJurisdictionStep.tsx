// ============================================================
// IP-NEXUS - TYPE + JURISDICTION COMBINED STEP (SILK Design)
// L135: Premium selection cards with SILK neumorphic design
// ============================================================

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { MatterType } from '@/hooks/use-matters-v2';
import { TrademarkTypeSelector, type TrademarkType } from './TrademarkTypeSelector';

// Type configuration with icons and descriptions - SILK colors
const TYPE_CONFIG: Record<string, { icon: string; description: string; popular: boolean; gradient: string; bgGradient: string }> = {
  TM: { icon: '®️', description: 'Protege nombres, logos, eslóganes y signos distintivos', popular: true, gradient: 'from-cyan-500 to-cyan-600', bgGradient: 'from-cyan-50 to-cyan-100' },
  TM_NAT: { icon: '®️', description: 'Marca nacional', popular: false, gradient: 'from-cyan-500 to-cyan-600', bgGradient: 'from-cyan-50 to-cyan-100' },
  TM_EU: { icon: '®️', description: 'Marca de la Unión Europea', popular: false, gradient: 'from-cyan-500 to-cyan-600', bgGradient: 'from-cyan-50 to-cyan-100' },
  TM_INT: { icon: '®️', description: 'Marca internacional (Madrid)', popular: false, gradient: 'from-cyan-500 to-cyan-600', bgGradient: 'from-cyan-50 to-cyan-100' },
  PT: { icon: '⚙️', description: 'Protege invenciones técnicas y procesos innovadores', popular: true, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
  PT_NAT: { icon: '⚙️', description: 'Patente nacional', popular: false, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
  PT_EU: { icon: '⚙️', description: 'Patente europea (EPO)', popular: false, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
  PT_PCT: { icon: '⚙️', description: 'Solicitud PCT internacional', popular: false, gradient: 'from-blue-500 to-blue-600', bgGradient: 'from-blue-50 to-blue-100' },
  UM: { icon: '🔧', description: 'Protege mejoras técnicas y funcionales', popular: true, gradient: 'from-purple-500 to-purple-600', bgGradient: 'from-purple-50 to-purple-100' },
  DS: { icon: '✏️', description: 'Protege la apariencia estética de productos', popular: true, gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100' },
  DS_NAT: { icon: '✏️', description: 'Diseño nacional', popular: false, gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100' },
  DS_EU: { icon: '✏️', description: 'Diseño comunitario', popular: false, gradient: 'from-amber-500 to-amber-600', bgGradient: 'from-amber-50 to-amber-100' },
  NC: { icon: '📜', description: 'Nombre comercial', popular: false, gradient: 'from-violet-500 to-violet-600', bgGradient: 'from-violet-50 to-violet-100' },
  DOM: { icon: '🌐', description: 'Nombres de dominio', popular: false, gradient: 'from-emerald-500 to-emerald-600', bgGradient: 'from-emerald-50 to-emerald-100' },
  OPO: { icon: '⚖️', description: 'Oposiciones y defensas', popular: false, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-50 to-red-100' },
  VIG: { icon: '👁️', description: 'Vigilancia de marcas', popular: false, gradient: 'from-indigo-500 to-indigo-600', bgGradient: 'from-indigo-50 to-indigo-100' },
  LIT: { icon: '🏛️', description: 'Litigios y procedimientos', popular: false, gradient: 'from-slate-500 to-slate-600', bgGradient: 'from-slate-50 to-slate-100' },
};

// Jurisdictions configuration
const JURISDICTIONS = [
  // Popular
  { code: 'ES', name: 'España', flag: '🇪🇸', office: 'OEPM', region: 'Europa', popular: true },
  { code: 'EU', name: 'Unión Europea', flag: '🇪🇺', office: 'EUIPO', region: 'Europa', popular: true },
  { code: 'WO', name: 'Internacional', flag: '🌍', office: 'OMPI/WIPO', region: 'Internacional', popular: true },
  { code: 'EP', name: 'Patente Europea', flag: '🇪🇺', office: 'EPO', region: 'Regional', popular: true },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', office: 'USPTO', region: 'América', popular: true },
  // Europa
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', office: 'UKIPO', region: 'Europa', popular: false },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', office: 'DPMA', region: 'Europa', popular: false },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', office: 'INPI-FR', region: 'Europa', popular: false },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', office: 'UIBM', region: 'Europa', popular: false },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', office: 'INPI-PT', region: 'Europa', popular: false },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', office: 'BOIP', region: 'Europa', popular: false },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', office: 'BOIP', region: 'Europa', popular: false },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭', office: 'IGE', region: 'Europa', popular: false },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', office: 'ÖPA', region: 'Europa', popular: false },
  { code: 'SE', name: 'Suecia', flag: '🇸🇪', office: 'PRV', region: 'Europa', popular: false },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰', office: 'DKPTO', region: 'Europa', popular: false },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴', office: 'NIPO', region: 'Europa', popular: false },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮', office: 'PRH', region: 'Europa', popular: false },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱', office: 'UPRP', region: 'Europa', popular: false },
  { code: 'CZ', name: 'Rep. Checa', flag: '🇨🇿', office: 'ÚPVČR', region: 'Europa', popular: false },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪', office: 'IPOI', region: 'Europa', popular: false },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷', office: 'OBI', region: 'Europa', popular: false },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷', office: 'TÜRKPATENT', region: 'Europa', popular: false },
  { code: 'RU', name: 'Rusia', flag: '🇷🇺', office: 'ROSPATENT', region: 'Europa', popular: false },
  // América
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', office: 'CIPO', region: 'América', popular: false },
  { code: 'MX', name: 'México', flag: '🇲🇽', office: 'IMPI', region: 'América', popular: false },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', office: 'INPI-BR', region: 'América', popular: false },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', office: 'INPI-AR', region: 'América', popular: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', office: 'INAPI', region: 'América', popular: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', office: 'SIC', region: 'América', popular: false },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', office: 'INDECOPI', region: 'América', popular: false },
  // Asia-Pacífico
  { code: 'CN', name: 'China', flag: '🇨🇳', office: 'CNIPA', region: 'Asia', popular: false },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', office: 'JPO', region: 'Asia', popular: false },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', office: 'KIPO', region: 'Asia', popular: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', office: 'CGPDTM', region: 'Asia', popular: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', office: 'IP Australia', region: 'Oceanía', popular: false },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', office: 'IPONZ', region: 'Oceanía', popular: false },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', office: 'IPOS', region: 'Asia', popular: false },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', office: 'HKIPD', region: 'Asia', popular: false },
];

interface TypeJurisdictionStepProps {
  types: MatterType[];
  selectedType: string;
  onSelectType: (typeCode: string) => void;
  selectedJurisdictions: string[];
  onSelectJurisdictions: (jurisdictions: string[]) => void;
  isLoading?: boolean;
  singleJurisdiction?: boolean;
  // NEW: Trademark type selection
  trademarkType?: TrademarkType;
  onSelectTrademarkType?: (type: TrademarkType) => void;
}

export function TypeJurisdictionStep({
  types,
  selectedType,
  onSelectType,
  selectedJurisdictions,
  onSelectJurisdictions,
  isLoading,
  singleJurisdiction = true,
  trademarkType,
  onSelectTrademarkType,
}: TypeJurisdictionStepProps) {
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [showJurisModal, setShowJurisModal] = useState(false);

  // Separate popular and other types
  const popularTypes = types.filter(t => TYPE_CONFIG[t.code]?.popular);
  const otherTypes = types.filter(t => !TYPE_CONFIG[t.code]?.popular);
  
  // Separate popular jurisdictions
  const popularJurisdictions = JURISDICTIONS.filter(j => j.popular);
  const otherJurisdictions = JURISDICTIONS.filter(j => !j.popular);

  // Check if current type is a trademark type
  const isTrademarkType = selectedType?.startsWith('TM') || selectedType === 'NC';

  const toggleJurisdiction = (code: string) => {
    if (singleJurisdiction) {
      onSelectJurisdictions([code]);
    } else {
      const newSelection = selectedJurisdictions.includes(code)
        ? selectedJurisdictions.filter(j => j !== code)
        : [...selectedJurisdictions, code];
      onSelectJurisdictions(newSelection);
    }
  };

  const removeJurisdiction = (code: string) => {
    onSelectJurisdictions(selectedJurisdictions.filter(j => j !== code));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">¿Qué tipo de expediente vas a crear?</h2>
          <p className="text-muted-foreground">Cargando tipos disponibles...</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Tipo y Jurisdicción</h2>
        <p className="text-muted-foreground">Selecciona el tipo de expediente y dónde quieres protegerlo</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: TYPE SELECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/30">1</span>
            Tipo de expediente
          </div>

          {/* Popular Types Grid - EFECTO WOW */}
          <div className="grid grid-cols-2 gap-3">
            {popularTypes.map((type, index) => {
              const config = TYPE_CONFIG[type.code] || { icon: '📁', description: '', popular: false, gradient: 'from-slate-500 to-gray-600' };
              const isSelected = selectedType === type.code;

              return (
                <motion.button
                  key={type.code}
                  type="button"
                  onClick={() => onSelectType(type.code)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden group",
                    isSelected
                      ? "border-primary bg-white/80 ring-2 ring-primary/30 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.35)]"
                      : "border-white/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:border-primary/40"
                  )}
                >
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  
                  {/* Selection check badge */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/40"
                    >
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Icon with gradient background when selected */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
                      isSelected 
                        ? `bg-gradient-to-br ${config.gradient} shadow-lg` 
                        : "bg-slate-100"
                    )}>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
                      )}
                      <span className="text-2xl relative z-10">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold text-sm truncate",
                        isSelected && "text-primary"
                      )}>{type.name_es}</h3>
                      <p className="text-xs text-muted-foreground truncate">{config.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Other Types - Collapsible */}
          <AnimatePresence>
            {showAllTypes && otherTypes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                {otherTypes.map((type) => {
                  const config = TYPE_CONFIG[type.code] || { icon: '📁', description: '', popular: false, gradient: 'from-slate-500 to-gray-600' };
                  const isSelected = selectedType === type.code;

                  return (
                    <motion.button
                      key={type.code}
                      type="button"
                      onClick={() => onSelectType(type.code)}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left text-sm",
                        "hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-white/60 bg-white/50 hover:bg-white/70"
                      )}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <span className="font-medium truncate">{type.name_es}</span>
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          {otherTypes.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full bg-white/50 hover:bg-white/70"
              onClick={() => setShowAllTypes(!showAllTypes)}
            >
              {showAllTypes ? (
                <>Ver menos <ChevronUp className="h-3 w-3 ml-1" /></>
              ) : (
                <>Ver más tipos ({otherTypes.length}) <ChevronDown className="h-3 w-3 ml-1" /></>
              )}
            </Button>
          )}
        </div>

        {/* RIGHT COLUMN: JURISDICTION SELECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/30">2</span>
            Jurisdicción
          </div>

          {/* Popular Jurisdictions - EFECTO WOW */}
          <div className="space-y-3">
            {popularJurisdictions.map((j, index) => {
              const isSelected = selectedJurisdictions.includes(j.code);
              return (
                <motion.div
                  key={j.code}
                  onClick={() => toggleJurisdiction(j.code)}
                  whileHover={{ scale: 1.02, x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden group",
                    isSelected
                      ? "border-emerald-500 bg-white/80 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30"
                      : "border-white/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:border-emerald-400/50"
                  )}
                >
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                  
                  {/* Selection check badge */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40"
                    >
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                  
                  {singleJurisdiction ? (
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected 
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/40" 
                        : "border-slate-300 bg-white"
                    )}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 rounded-full bg-white"
                        />
                      )}
                    </div>
                  ) : (
                    <Checkbox checked={isSelected} className="data-[state=checked]:bg-emerald-500" />
                  )}
                  
                  <span className="text-3xl">{j.flag}</span>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className={cn(
                      "font-semibold text-sm",
                      isSelected && "text-emerald-700"
                    )}>{j.name}</p>
                    <p className="text-xs text-muted-foreground">{j.office}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* More Jurisdictions Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-white/50 hover:bg-white/70 border-white/60"
            onClick={() => setShowJurisModal(true)}
          >
            <Globe className="h-4 w-4 mr-2" />
            Más jurisdicciones ({otherJurisdictions.length})
          </Button>

          {/* Selected Jurisdictions Pills */}
          {selectedJurisdictions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/60 space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground">Seleccionadas:</p>
              <div className="flex flex-wrap gap-2">
                {selectedJurisdictions.map((code) => {
                  const j = JURISDICTIONS.find(x => x.code === code);
                  return (
                    <Badge 
                      key={code} 
                      className="gap-1.5 pr-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-md shadow-emerald-500/30"
                    >
                      {j?.flag} {j?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJurisdiction(code);
                        }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* TRADEMARK TYPE SELECTOR - Full width below both columns */}
      <AnimatePresence>
        {isTrademarkType && onSelectTrademarkType && (
          <TrademarkTypeSelector
            value={trademarkType}
            onChange={onSelectTrademarkType}
          />
        )}
      </AnimatePresence>

      <Dialog open={showJurisModal} onOpenChange={setShowJurisModal}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Jurisdicción</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-2">
              {/* Group by region */}
              {['Europa', 'América', 'Asia', 'Oceanía'].map(region => {
                const regionJuris = otherJurisdictions.filter(j => j.region === region);
                if (regionJuris.length === 0) return null;
                
                return (
                  <div key={region}>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{region}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {regionJuris.map((j) => {
                        const isSelected = selectedJurisdictions.includes(j.code);
                        return (
                          <button
                            key={j.code}
                            type="button"
                            onClick={() => {
                              toggleJurisdiction(j.code);
                              if (singleJurisdiction) setShowJurisModal(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border text-left text-sm transition-all",
                              "hover:border-primary/50",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <span className="text-lg">{j.flag}</span>
                            <span className="truncate">{j.name}</span>
                            {isSelected && <Check className="h-3 w-3 text-primary shrink-0 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Helper to get jurisdiction info (exported for use in other components)
export function getJurisdictionInfo(code: string) {
  return JURISDICTIONS.find(j => j.code === code);
}
