// ============================================================
// IP-NEXUS - TYPE SELECTOR COMPONENT
// L127: Large card-based type selection for wizard step 1
// ============================================================

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MatterType } from '@/hooks/use-matters-v2';

// Extended type config with icons and descriptions
const TYPE_CONFIG: Record<string, { icon: string; description: string; popular: boolean }> = {
  TM: { icon: '®️', description: 'Registro de signos distintivos', popular: true },
  TM_NAT: { icon: '®️', description: 'Marca nacional', popular: false },
  TM_EU: { icon: '®️', description: 'Marca de la Unión Europea', popular: false },
  TM_INT: { icon: '®️', description: 'Marca internacional (Madrid)', popular: false },
  PT: { icon: '⚙️', description: 'Invenciones técnicas', popular: true },
  PT_NAT: { icon: '⚙️', description: 'Patente nacional', popular: false },
  PT_EU: { icon: '⚙️', description: 'Patente europea (EPO)', popular: false },
  PT_PCT: { icon: '⚙️', description: 'Solicitud PCT internacional', popular: false },
  UM: { icon: '🔧', description: 'Mejoras técnicas menores', popular: true },
  DS: { icon: '✏️', description: 'Diseños industriales', popular: true },
  DS_NAT: { icon: '✏️', description: 'Diseño nacional', popular: false },
  DS_EU: { icon: '✏️', description: 'Diseño comunitario', popular: false },
  NC: { icon: '📜', description: 'Nombre comercial', popular: false },
  DOM: { icon: '🌐', description: 'Nombres de dominio', popular: false },
  OPO: { icon: '⚖️', description: 'Oposiciones y defensas', popular: false },
  VIG: { icon: '👁️', description: 'Vigilancia de marcas', popular: false },
  LIT: { icon: '🏛️', description: 'Litigios y procedimientos', popular: false },
};

interface TypeSelectorProps {
  types: MatterType[];
  selectedType: string;
  onSelect: (typeCode: string) => void;
  isLoading?: boolean;
}

export function TypeSelector({ types, selectedType, onSelect, isLoading }: TypeSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  // Separate popular and other types
  const popularTypes = types.filter(t => TYPE_CONFIG[t.code]?.popular);
  const otherTypes = types.filter(t => !TYPE_CONFIG[t.code]?.popular);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">¿Qué tipo de expediente vas a crear?</h2>
          <p className="text-muted-foreground">Selecciona el tipo de derecho de propiedad intelectual</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
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
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">¿Qué tipo de expediente vas a crear?</h2>
        <p className="text-muted-foreground">Selecciona el tipo de derecho de propiedad intelectual</p>
      </div>

      {/* Popular Types - Large Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {popularTypes.map((type) => {
          const config = TYPE_CONFIG[type.code] || { icon: '📁', description: '', popular: false };
          const isSelected = selectedType === type.code;

          return (
            <motion.div
              key={type.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="button"
                onClick={() => onSelect(type.code)}
                className={cn(
                  "w-full p-6 rounded-xl border-2 transition-all text-left relative",
                  "hover:shadow-md hover:border-primary/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                <span className="text-4xl mb-3 block">{config.icon}</span>
                <h3 className="font-semibold text-lg mb-1">{type.name_es}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {config.description}
                </p>
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 mr-1" />
                      Seleccionado
                    </Badge>
                  </div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Other Types - Collapsible */}
      <AnimatePresence>
        {showAll && otherTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4"
          >
            {otherTypes.map((type) => {
              const config = TYPE_CONFIG[type.code] || { icon: '📁', description: '', popular: false };
              const isSelected = selectedType === type.code;

              return (
                <button
                  key={type.code}
                  type="button"
                  onClick={() => onSelect(type.code)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    "hover:border-primary/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="font-medium text-sm">{type.name_es}</span>
                </button>
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
          className="w-full"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? (
            <>
              Ver menos <ChevronUp className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Ver más tipos ({otherTypes.length}) <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
}
