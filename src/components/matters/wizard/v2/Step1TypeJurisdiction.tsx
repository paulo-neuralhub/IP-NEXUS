// ============================================================
// IP-NEXUS - STEP 1: TYPE & JURISDICTION (V2)
// L132: Combined type + jurisdiction selection in 2 columns
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, FileText, Palette, Globe, Gavel, RefreshCw, 
  Lightbulb, Search, ChevronDown, ChevronUp, Star, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { MatterWizardState } from './types';

interface Step1TypeJurisdictionProps {
  data: MatterWizardState['step1'];
  onChange: (data: Partial<MatterWizardState['step1']>) => void;
}

// Type definitions
const MATTER_TYPES = [
  { code: 'TM', label: 'Marca', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
  { code: 'PT', label: 'Patente', icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-100' },
  { code: 'DS', label: 'Diseño', icon: Palette, color: 'text-pink-600', bg: 'bg-pink-100' },
  { code: 'UM', label: 'Modelo', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { code: 'OPO', label: 'Oposición', icon: Gavel, color: 'text-red-600', bg: 'bg-red-100' },
  { code: 'REN', label: 'Renovación', icon: RefreshCw, color: 'text-green-600', bg: 'bg-green-100' },
];

const MORE_TYPES = [
  { code: 'NC', label: 'Nombre Comercial', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-100' },
  { code: 'DOM', label: 'Dominio', icon: Globe, color: 'text-slate-600', bg: 'bg-slate-100' },
  { code: 'VIG', label: 'Vigilancia', icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { code: 'LIT', label: 'Litigio', icon: Gavel, color: 'text-orange-600', bg: 'bg-orange-100' },
];

// Subtypes for trademarks
const TRADEMARK_SUBTYPES = [
  { code: 'word', label: 'Denominativa', description: 'Solo texto' },
  { code: 'figurative', label: 'Figurativa', description: 'Solo imagen' },
  { code: 'mixed', label: 'Mixta', description: 'Texto + imagen' },
  { code: '3d', label: '3D', description: 'Forma tridimensional' },
  { code: 'sound', label: 'Sonora', description: 'Sonido o melodía' },
  { code: 'other', label: 'Otras', description: 'Patrón, holograma, etc.' },
];

// Main jurisdictions
const MAIN_JURISDICTIONS = [
  { code: 'ES', label: 'España', office: 'OEPM', flag: '🇪🇸' },
  { code: 'EU', label: 'Unión Europea', office: 'EUIPO', flag: '🇪🇺' },
  { code: 'WO', label: 'Internacional', office: 'WIPO', flag: '🌍' },
  { code: 'US', label: 'Estados Unidos', office: 'USPTO', flag: '🇺🇸' },
];

const MORE_JURISDICTIONS = [
  { code: 'EP', label: 'Patente Europea', office: 'EPO', flag: '🇪🇺' },
  { code: 'CN', label: 'China', office: 'CNIPA', flag: '🇨🇳' },
  { code: 'JP', label: 'Japón', office: 'JPO', flag: '🇯🇵' },
  { code: 'KR', label: 'Corea del Sur', office: 'KIPO', flag: '🇰🇷' },
  { code: 'GB', label: 'Reino Unido', office: 'UKIPO', flag: '🇬🇧' },
  { code: 'DE', label: 'Alemania', office: 'DPMA', flag: '🇩🇪' },
  { code: 'FR', label: 'Francia', office: 'INPI', flag: '🇫🇷' },
  { code: 'IT', label: 'Italia', office: 'UIBM', flag: '🇮🇹' },
  { code: 'BR', label: 'Brasil', office: 'INPI', flag: '🇧🇷' },
  { code: 'MX', label: 'México', office: 'IMPI', flag: '🇲🇽' },
  { code: 'IN', label: 'India', office: 'IPO', flag: '🇮🇳' },
  { code: 'AU', label: 'Australia', office: 'IP Australia', flag: '🇦🇺' },
  { code: 'CA', label: 'Canadá', office: 'CIPO', flag: '🇨🇦' },
  { code: 'RU', label: 'Rusia', office: 'ROSPATENT', flag: '🇷🇺' },
  { code: 'CH', label: 'Suiza', office: 'IGE', flag: '🇨🇭' },
];

export function Step1TypeJurisdiction({ data, onChange }: Step1TypeJurisdictionProps) {
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [showMoreJurisdictions, setShowMoreJurisdictions] = useState(false);

  const isTrademarkType = data.matterType?.startsWith('TM') || data.matterType === 'NC';

  const handleTypeSelect = (code: string) => {
    onChange({ 
      matterType: code,
      subType: undefined, // Reset subtype when changing type
    });
  };

  const handleJurisdictionToggle = (code: string) => {
    const current = data.jurisdictions || [];
    if (current.includes(code)) {
      onChange({ jurisdictions: current.filter(j => j !== code) });
    } else {
      // For now, single jurisdiction (can expand to multi later)
      onChange({ jurisdictions: [code] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Tipo y Jurisdicción</h2>
        <p className="text-muted-foreground">Selecciona el tipo de expediente y la jurisdicción</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Matter Type */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tipo de Expediente
          </h3>

          {/* Main types */}
          <div className="grid grid-cols-3 gap-2">
            {MATTER_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = data.matterType === type.code;
              
              return (
                <button
                  key={type.code}
                  type="button"
                  onClick={() => handleTypeSelect(type.code)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-muted hover:border-muted-foreground/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", type.bg)}>
                    <Icon className={cn("h-6 w-6", type.color)} />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* More types */}
          <Collapsible open={showMoreTypes} onOpenChange={setShowMoreTypes}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {showMoreTypes ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                Ver más tipos
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {MORE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = data.matterType === type.code;
                  
                  return (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => handleTypeSelect(type.code)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", type.bg)}>
                        <Icon className={cn("h-4 w-4", type.color)} />
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Subtype for trademarks */}
          {isTrademarkType && (
            <div className="pt-4 border-t space-y-3">
              <Label className="text-sm font-medium">Subtipo de marca</Label>
              <RadioGroup
                value={data.subType || ''}
                onValueChange={(val) => onChange({ subType: val })}
                className="grid grid-cols-2 gap-2"
              >
                {TRADEMARK_SUBTYPES.map((sub) => (
                  <div key={sub.code} className="flex items-center space-x-2">
                    <RadioGroupItem value={sub.code} id={`subtype-${sub.code}`} />
                    <Label htmlFor={`subtype-${sub.code}`} className="text-sm cursor-pointer">
                      {sub.label}
                      <span className="text-xs text-muted-foreground block">{sub.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        {/* RIGHT: Jurisdiction */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Jurisdicción
          </h3>

          {/* Starred jurisdictions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              Principales
            </div>
            <div className="space-y-2">
              {MAIN_JURISDICTIONS.map((jur) => {
                const isSelected = data.jurisdictions?.includes(jur.code);
                
                return (
                  <button
                    key={jur.code}
                    type="button"
                    onClick={() => handleJurisdictionToggle(jur.code)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted hover:border-muted-foreground/30"
                    )}
                  >
                    <span className="text-2xl">{jur.flag}</span>
                    <div className="flex-1">
                      <p className="font-medium">{jur.label}</p>
                      <p className="text-xs text-muted-foreground">{jur.office}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* More jurisdictions */}
          <Collapsible open={showMoreJurisdictions} onOpenChange={setShowMoreJurisdictions}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {showMoreJurisdictions ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                Ver {MORE_JURISDICTIONS.length} más jurisdicciones
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto">
                {MORE_JURISDICTIONS.map((jur) => {
                  const isSelected = data.jurisdictions?.includes(jur.code);
                  
                  return (
                    <button
                      key={jur.code}
                      type="button"
                      onClick={() => handleJurisdictionToggle(jur.code)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      <span className="text-lg">{jur.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{jur.label}</p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Filing route */}
          <div className="pt-4 border-t space-y-3">
            <Label className="text-sm font-medium">Ruta de presentación</Label>
            <RadioGroup
              value={data.filingRoute || 'national'}
              onValueChange={(val) => onChange({ filingRoute: val as 'national' | 'regional' | 'international' })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="national" id="route-national" />
                <Label htmlFor="route-national">Nacional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regional" id="route-regional" />
                <Label htmlFor="route-regional">Regional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="international" id="route-international" />
                <Label htmlFor="route-international">Internacional</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Selected summary */}
          {data.jurisdictions && data.jurisdictions.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">Seleccionadas:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.jurisdictions.map(code => {
                  const jur = [...MAIN_JURISDICTIONS, ...MORE_JURISDICTIONS].find(j => j.code === code);
                  return (
                    <Badge key={code} variant="secondary" className="gap-1">
                      {jur?.flag} {code}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
