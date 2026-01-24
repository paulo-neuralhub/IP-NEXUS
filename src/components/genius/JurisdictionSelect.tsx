import * as React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const GENIUS_JURISDICTIONS = [
  "ES",
  "EUIPO",
  "EP",
  "US",
  "CN",
  "JP",
  "KR",
  "MX",
  "BR",
  "IN",
  "AU",
  "CA",
  "GB",
  "FR",
  "DE",
  "WIPO",
] as const;

export type GeniusJurisdiction = (typeof GENIUS_JURISDICTIONS)[number];

const JURISDICTION_META: Record<
  GeniusJurisdiction,
  { label: string; flag: string; short?: string }
> = {
  ES: { label: "España (OEPM)", flag: "🇪🇸" },
  EUIPO: { label: "Unión Europea (EUIPO)", flag: "🇪🇺" },
  EP: { label: "Patentes Europeas (EPO)", flag: "⚙️", short: "EP" },
  US: { label: "Estados Unidos (USPTO)", flag: "🇺🇸" },
  CN: { label: "China (CNIPA)", flag: "🇨🇳" },
  JP: { label: "Japón (JPO)", flag: "🇯🇵" },
  KR: { label: "Corea del Sur (KIPO)", flag: "🇰🇷" },
  MX: { label: "México (IMPI)", flag: "🇲🇽" },
  BR: { label: "Brasil (INPI)", flag: "🇧🇷" },
  IN: { label: "India", flag: "🇮🇳" },
  AU: { label: "Australia", flag: "🇦🇺" },
  CA: { label: "Canadá", flag: "🇨🇦" },
  GB: { label: "Reino Unido (UKIPO)", flag: "🇬🇧" },
  FR: { label: "Francia (INPI)", flag: "🇫🇷" },
  DE: { label: "Alemania (DPMA)", flag: "🇩🇪" },
  WIPO: { label: "WIPO (Internacional)", flag: "🌍" },
};

export interface JurisdictionSelectProps {
  allowedJurisdictions: string[];
  onSelect: (jurisdiction: string) => void;
  showUpsell?: boolean;
  value?: string;
  className?: string;
}

export function JurisdictionSelect({
  allowedJurisdictions,
  onSelect,
  showUpsell = true,
  value,
  className,
}: JurisdictionSelectProps) {
  const allowed = React.useMemo(() => new Set(allowedJurisdictions), [allowedJurisdictions]);
  const [blocked, setBlocked] = React.useState<GeniusJurisdiction | null>(null);

  const safeValue = React.useMemo(() => {
    if (!value) return "";
    return allowed.has(value) ? value : "";
  }, [allowed, value]);

  const blockedLabel = blocked ? JURISDICTION_META[blocked]?.label : null;

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={safeValue}
        onValueChange={(v) => {
          // Permitimos seleccionar cualquier opción, pero si no está licenciada,
          // bloqueamos y mostramos upsell sin cambiar el valor.
          if (allowed.has(v)) {
            setBlocked(null);
            onSelect(v);
            return;
          }

          if ((GENIUS_JURISDICTIONS as readonly string[]).includes(v)) {
            setBlocked(v as GeniusJurisdiction);
          } else {
            setBlocked(null);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona jurisdicción" />
        </SelectTrigger>
        <SelectContent>
          {GENIUS_JURISDICTIONS.map((code) => {
            const meta = JURISDICTION_META[code];
            const isAllowed = allowed.has(code);

            return (
              <SelectItem key={code} value={code}>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{meta.flag}</span>
                  <span className="truncate">{meta.label}</span>
                  {!isAllowed && (
                    <span className="ml-2 text-xs text-muted-foreground">(Plan Business)</span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showUpsell && blocked && (
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4"
              >
                Jurisdicción no incluida
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Jurisdicción disponible en plan Business</p>
              {blockedLabel && (
                <p className="text-xs text-muted-foreground">Seleccionaste: {blockedLabel}</p>
              )}
            </TooltipContent>
          </Tooltip>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/settings/billing">Ver planes</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
