// ============================================================
// IP-NEXUS - JURISDICTION SELECTOR COMPONENT
// L127: Multi-jurisdiction selection with flags for wizard step 2
// ============================================================

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Jurisdictions configuration - Extended list with 50+ countries
const JURISDICTIONS = [
  // ⭐ Popular
  { code: 'ES', name: 'España', flag: '🇪🇸', office: 'OEPM', region: 'Europa', popular: true },
  { code: 'EU', name: 'Unión Europea', flag: '🇪🇺', office: 'EUIPO', region: 'Europa', popular: true },
  { code: 'WO', name: 'Internacional', flag: '🌍', office: 'OMPI/WIPO', region: 'Internacional', popular: true },
  { code: 'EP', name: 'Patente Europea', flag: '🇪🇺', office: 'EPO', region: 'Regional', popular: true },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', office: 'USPTO', region: 'América', popular: true },
  // 🌍 Europa
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
  // 🌎 América
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', office: 'CIPO', region: 'América', popular: false },
  { code: 'MX', name: 'México', flag: '🇲🇽', office: 'IMPI', region: 'América', popular: false },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', office: 'INPI-BR', region: 'América', popular: false },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', office: 'INPI-AR', region: 'América', popular: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', office: 'INAPI', region: 'América', popular: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', office: 'SIC', region: 'América', popular: false },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', office: 'INDECOPI', region: 'América', popular: false },
  // 🌏 Asia-Pacífico
  { code: 'CN', name: 'China', flag: '🇨🇳', office: 'CNIPA', region: 'Asia', popular: false },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', office: 'JPO', region: 'Asia', popular: false },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', office: 'KIPO', region: 'Asia', popular: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', office: 'CGPDTM', region: 'Asia', popular: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', office: 'IP Australia', region: 'Oceanía', popular: false },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', office: 'IPONZ', region: 'Oceanía', popular: false },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', office: 'IPOS', region: 'Asia', popular: false },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', office: 'HKIPD', region: 'Asia', popular: false },
  { code: 'TW', name: 'Taiwán', flag: '🇹🇼', office: 'TIPO', region: 'Asia', popular: false },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭', office: 'DIP', region: 'Asia', popular: false },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾', office: 'MyIPO', region: 'Asia', popular: false },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', office: 'DGIP', region: 'Asia', popular: false },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭', office: 'IPOPHL', region: 'Asia', popular: false },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', office: 'NOIP', region: 'Asia', popular: false },
  // 🌍 África y Medio Oriente
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦', office: 'CIPC', region: 'África', popular: false },
  { code: 'AE', name: 'Emiratos Árabes', flag: '🇦🇪', office: 'MOE', region: 'Medio Oriente', popular: false },
  { code: 'SA', name: 'Arabia Saudí', flag: '🇸🇦', office: 'SAIP', region: 'Medio Oriente', popular: false },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', office: 'ILPO', region: 'Medio Oriente', popular: false },
  // 🌐 Regionales
  { code: 'OAPI', name: 'OAPI (África)', flag: '🌍', office: 'OAPI', region: 'Regional', popular: false },
  { code: 'ARIPO', name: 'ARIPO (África)', flag: '🌍', office: 'ARIPO', region: 'Regional', popular: false },
  { code: 'EAPO', name: 'Euroasiática', flag: '🌏', office: 'EAPO', region: 'Regional', popular: false },
  { code: 'GCC', name: 'Golfo (GCC)', flag: '🌍', office: 'GCC-PO', region: 'Regional', popular: false },
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
