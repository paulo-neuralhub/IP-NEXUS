import * as React from "react";

import { JurisdictionSelect } from "@/components/genius/JurisdictionSelect";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentSubscription } from "@/hooks/use-subscription";
import {
  getAllowedGeniusJurisdictionsByPlan,
  normalizePlanCode,
} from "@/lib/genius/jurisdictions";

export default function GeniusDocumentsGenPage() {
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
        <h1 className="text-xl font-semibold">Documentos</h1>
        <p className="text-sm text-muted-foreground">
          Borrador generado por IA. Revisar antes de usar.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de escrito</label>
            <Select defaultValue="oposicion">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oposicion">Oposición</SelectItem>
                <SelectItem value="oa_response">Respuesta OA</SelectItem>
                <SelectItem value="client_report">Informe cliente</SelectItem>
                <SelectItem value="contract">Contrato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma</label>
            <Select defaultValue="es">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
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

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Contexto adicional</label>
            <Textarea
              placeholder="Hechos, fechas, productos/servicios, argumentos, etc."
              className="min-h-28"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button type="button">Generar borrador</Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <div className="text-sm text-muted-foreground">
          Editor rich text: pendiente (se mostrará aquí el borrador generado).
        </div>
      </section>
    </div>
  );
}
