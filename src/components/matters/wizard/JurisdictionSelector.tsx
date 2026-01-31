// ============================================================
// IP-NEXUS - JURISDICTION SELECTOR COMPONENT
// L127: Multi-jurisdiction selection with flags for wizard step 2
// ============================================================

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Jurisdictions configuration
const JURISDICTIONS = [
  { code: 'ES', name: 'España', flag: '🇪🇸', office: 'OEPM', popular: true },
  { code: 'EU', name: 'Unión Europea', flag: '🇪🇺', office: 'EUIPO', popular: true },
  { code: 'WO', name: 'Internacional (WIPO)', flag: '🌍', office: 'OMPI', popular: true },
  { code: 'EP', name: 'Patente Europea', flag: '🇪🇺', office: 'EPO', popular: true },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', office: 'USPTO', popular: true },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', office: 'UKIPO', popular: false },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', office: 'DPMA', popular: false },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', office: 'INPI', popular: false },
  { code: 'CN', name: 'China', flag: '🇨🇳', office: 'CNIPA', popular: false },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', office: 'JPO', popular: false },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', office: 'INPI-BR', popular: false },
  { code: 'MX', name: 'México', flag: '🇲🇽', office: 'IMPI', popular: false },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', office: 'INPI-PT', popular: false },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', office: 'UIBM', popular: false },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', office: 'BOIP', popular: false },
  { code: 'GL', name: 'Global (Pre-depósito)', flag: '🌐', office: 'Evaluación', popular: false },
];

interface JurisdictionSelectorProps {
  selectedJurisdictions: string[];
  onSelect: (jurisdictions: string[]) => void;
  typeLabel?: string;
  singleSelect?: boolean;
}

export function JurisdictionSelector({
  selectedJurisdictions,
  onSelect,
  typeLabel = 'expediente',
  singleSelect = false,
}: JurisdictionSelectorProps) {
  const popularJurisdictions = JURISDICTIONS.filter((j) => j.popular);
  const otherJurisdictions = JURISDICTIONS.filter((j) => !j.popular);

  const toggleJurisdiction = (code: string) => {
    if (singleSelect) {
      onSelect([code]);
    } else {
      const newSelection = selectedJurisdictions.includes(code)
        ? selectedJurisdictions.filter((j) => j !== code)
        : [...selectedJurisdictions, code];
      onSelect(newSelection);
    }
  };

  const removeJurisdiction = (code: string) => {
    onSelect(selectedJurisdictions.filter((j) => j !== code));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">
          ¿Dónde quieres proteger tu {typeLabel}?
        </h2>
        <p className="text-muted-foreground">
          {singleSelect
            ? 'Selecciona la jurisdicción principal'
            : 'Puedes seleccionar múltiples jurisdicciones'}
        </p>
      </div>

      {/* Selected Jurisdictions Pills */}
      {selectedJurisdictions.length > 0 && !singleSelect && (
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
          {selectedJurisdictions.map((code) => {
            const j = JURISDICTIONS.find((x) => x.code === code);
            return (
              <Badge
                key={code}
                variant="secondary"
                className="text-sm py-1 px-3 gap-2"
              >
                {j?.flag} {j?.name}
                <button
                  type="button"
                  onClick={() => removeJurisdiction(code)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Popular Jurisdictions */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-muted-foreground">⭐ Más utilizadas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularJurisdictions.map((j) => {
            const isSelected = selectedJurisdictions.includes(j.code);
            return (
              <motion.button
                key={j.code}
                type="button"
                onClick={() => toggleJurisdiction(j.code)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                  'hover:border-primary/50 hover:shadow-sm',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                )}
              >
                <span className="text-3xl">{j.flag}</span>
                <div className="flex-1">
                  <p className="font-medium">{j.name}</p>
                  <p className="text-sm text-muted-foreground">{j.office}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Other Jurisdictions */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">🌍 Otras jurisdicciones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {otherJurisdictions.map((j) => {
            const isSelected = selectedJurisdictions.includes(j.code);
            return (
              <button
                key={j.code}
                type="button"
                onClick={() => toggleJurisdiction(j.code)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-all text-left text-sm',
                  'hover:border-primary/50',
                  isSelected
                    ? 'border-primary bg-primary/5 font-medium'
                    : 'border-border'
                )}
              >
                <span className="text-xl">{j.flag}</span>
                <span className="truncate">{j.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Helper to get jurisdiction info
export function getJurisdictionInfo(code: string) {
  return JURISDICTIONS.find((j) => j.code === code);
}
