import * as React from "react";

import { JurisdictionSelect } from "@/components/genius/JurisdictionSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentSubscription } from "@/hooks/use-subscription";
import {
  getAllowedGeniusJurisdictionsByPlan,
  normalizePlanCode,
} from "@/lib/genius/jurisdictions";

export default function GeniusAnalysisPage() {
  const { data: subscription } = useCurrentSubscription();
  const planCode = normalizePlanCode(
    (subscription as unknown as { plan?: { code?: string; name?: string } })?.plan?.code ??
      (subscription as unknown as { plan?: { code?: string; name?: string } })?.plan?.name,
  );

  const allowedJurisdictions = React.useMemo(
    () => getAllowedGeniusJurisdictionsByPlan(planCode),
    [planCode],
  );

  const [jurisdiction, setJurisdiction] = React.useState<string>(allowedJurisdictions[0] ?? "");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Análisis</h1>
        <p className="text-sm text-muted-foreground">
          Borrador generado por IA. Revisar antes de usar.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input placeholder="Ej: NEXUS" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select defaultValue="marca">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marca">Marca</SelectItem>
                <SelectItem value="patente">Patente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Jurisdicción</label>
            <JurisdictionSelect
              value={jurisdiction}
              allowedJurisdictions={allowedJurisdictions}
              onSelect={(j) => setJurisdiction(j)}
              showUpsell
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Clases (Nice)</label>
            <Input placeholder="Ej: 35, 41" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button type="button">Analizar</Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="text-sm text-muted-foreground">
          Resultado: pendiente de conexión de IA (scoring 0-100, factores, riesgos y
          recomendaciones).
        </div>
      </section>
    </div>
  );
}
