import { useEffect, useState } from "react";
import { Plus, Search, Settings2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type KbConfidenceTier,
  type KbPlan,
  type KbDisclaimer,
  type KbJurisdiction,
  type KbLegalArea,
  useDeleteKbJurisdiction,
  useKbDisclaimers,
  useKbJurisdictions,
  useKbLegalAreas,
  useUpsertKbDisclaimer,
  useUpsertKbJurisdiction,
  useUpsertKbLegalArea,
  useDeleteKbLegalArea,
} from "@/hooks/backoffice/useKnowledgeBases";

const TIER_LABEL: Record<KbConfidenceTier, string> = {
  tier_1: "Tier 1",
  tier_2: "Tier 2",
  tier_3: "Tier 3",
};

const PLAN_LABEL: Record<KbPlan, string> = {
  basic: "Basic",
  professional: "Professional",
  enterprise: "Enterprise",
};

function tierBadgeClass(tier: KbConfidenceTier) {
  switch (tier) {
    case "tier_1":
      return "bg-success/15 text-success border-success/30";
    case "tier_2":
      return "bg-warning/15 text-warning-foreground border-warning/30";
    case "tier_3":
    default:
      return "bg-info/15 text-info border-info/30";
  }
}

function planBadgeClass(plan: KbPlan) {
  switch (plan) {
    case "enterprise":
      return "bg-secondary/20 text-secondary-foreground border-border";
    case "professional":
      return "bg-primary/15 text-primary border-primary/30";
    case "basic":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function asArrayFromText(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toTextFromArray(value: string[] | null | undefined): string {
  return (value || []).join("\n");
}

function JurisdictionDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: KbJurisdiction | null;
  onSave: (payload: Partial<KbJurisdiction> & { id?: string }) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [nameLocal, setNameLocal] = useState(initial?.name_local ?? "");
  const [lang, setLang] = useState(initial?.language_code ?? "es");
  const [flag, setFlag] = useState(initial?.flag_emoji ?? "");
  const [tier, setTier] = useState<KbConfidenceTier>(initial?.confidence_tier ?? "tier_3");
  const [plan, setPlan] = useState<KbPlan>(initial?.requires_plan ?? "basic");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [isBeta, setIsBeta] = useState<boolean>(initial?.is_beta ?? false);

  const [scoreOverall, setScoreOverall] = useState<number>(initial?.score_overall ?? 0);
  const [scoreDepth, setScoreDepth] = useState<number>(initial?.score_knowledge_depth ?? 0);
  const [scoreAvail, setScoreAvail] = useState<number>(initial?.score_data_availability ?? 0);
  const [scoreRecency, setScoreRecency] = useState<number>(initial?.score_update_recency ?? 0);
  const [scoreQuality, setScoreQuality] = useState<number>(initial?.score_source_quality ?? 0);

  const [sources, setSources] = useState<string>(toTextFromArray(initial?.data_sources));
  const [registryUrl, setRegistryUrl] = useState(initial?.official_registry_url ?? "");
  const [knownLimits, setKnownLimits] = useState<string>(toTextFromArray(initial?.known_limitations));
  const [coverageGaps, setCoverageGaps] = useState<string>(toTextFromArray(initial?.coverage_gaps));
  const [legalDisclaimer, setLegalDisclaimer] = useState<string>(
    initial?.legal_disclaimer ??
      "Esta información es orientativa y no constituye asesoramiento legal. Consulte siempre con un profesional cualificado."
  );

  // reset when changing initial/open
  useEffect(() => {
    if (!open) return;
    setCode(initial?.code ?? "");
    setName(initial?.name ?? "");
    setNameLocal(initial?.name_local ?? "");
    setLang(initial?.language_code ?? "es");
    setFlag(initial?.flag_emoji ?? "");
    setTier(initial?.confidence_tier ?? "tier_3");
    setPlan(initial?.requires_plan ?? "basic");
    setIsActive(initial?.is_active ?? true);
    setIsBeta(initial?.is_beta ?? false);
    setScoreOverall(initial?.score_overall ?? 0);
    setScoreDepth(initial?.score_knowledge_depth ?? 0);
    setScoreAvail(initial?.score_data_availability ?? 0);
    setScoreRecency(initial?.score_update_recency ?? 0);
    setScoreQuality(initial?.score_source_quality ?? 0);
    setSources(toTextFromArray(initial?.data_sources));
    setRegistryUrl(initial?.official_registry_url ?? "");
    setKnownLimits(toTextFromArray(initial?.known_limitations));
    setCoverageGaps(toTextFromArray(initial?.coverage_gaps));
    setLegalDisclaimer(
      initial?.legal_disclaimer ??
        "Esta información es orientativa y no constituye asesoramiento legal. Consulte siempre con un profesional cualificado."
    );
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar jurisdicción" : "Nueva jurisdicción"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ES / EU / US / GLOBAL" />
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="España" />
          </div>
          <div className="space-y-2">
            <Label>Nombre local</Label>
            <Input value={nameLocal} onChange={(e) => setNameLocal(e.target.value)} placeholder="España / Deutschland" />
          </div>
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="es" />
          </div>
          <div className="space-y-2">
            <Label>Bandera (emoji)</Label>
            <Input value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="🇪🇸" />
          </div>

          <div className="space-y-2">
            <Label>Tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as KbConfidenceTier)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tier_1">Tier 1</SelectItem>
                <SelectItem value="tier_2">Tier 2</SelectItem>
                <SelectItem value="tier_3">Tier 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan mínimo</Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as KbPlan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Activa</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isBeta} onCheckedChange={setIsBeta} />
            <Label>Beta</Label>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="space-y-2">
            <Label>Overall</Label>
            <Input type="number" value={scoreOverall} onChange={(e) => setScoreOverall(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Input type="number" value={scoreDepth} onChange={(e) => setScoreDepth(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <Input type="number" value={scoreAvail} onChange={(e) => setScoreAvail(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Recency</Label>
            <Input type="number" value={scoreRecency} onChange={(e) => setScoreRecency(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Quality</Label>
            <Input type="number" value={scoreQuality} onChange={(e) => setScoreQuality(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fuentes (1 por línea)</Label>
            <Textarea value={sources} onChange={(e) => setSources(e.target.value)} rows={5} />
          </div>
          <div className="space-y-2">
            <Label>URL registro oficial</Label>
            <Input value={registryUrl} onChange={(e) => setRegistryUrl(e.target.value)} placeholder="https://..." />
            <Label className="mt-2 block">Disclaimer legal</Label>
            <Textarea value={legalDisclaimer} onChange={(e) => setLegalDisclaimer(e.target.value)} rows={3} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Limitaciones conocidas (1 por línea)</Label>
            <Textarea value={knownLimits} onChange={(e) => setKnownLimits(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Gaps de cobertura (1 por línea)</Label>
            <Textarea value={coverageGaps} onChange={(e) => setCoverageGaps(e.target.value)} rows={4} />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() =>
              onSave({
                id: initial?.id,
                code,
                name,
                name_local: nameLocal || null,
                language_code: lang || null,
                flag_emoji: flag || null,
                confidence_tier: tier,
                requires_plan: plan,
                is_active: isActive,
                is_beta: isBeta,
                score_overall: scoreOverall,
                score_knowledge_depth: scoreDepth,
                score_data_availability: scoreAvail,
                score_update_recency: scoreRecency,
                score_source_quality: scoreQuality,
                data_sources: asArrayFromText(sources),
                official_registry_url: registryUrl || null,
                known_limitations: asArrayFromText(knownLimits),
                coverage_gaps: asArrayFromText(coverageGaps),
                legal_disclaimer: legalDisclaimer,
              })
            }
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LegalAreasPanel({ jurisdiction }: { jurisdiction: KbJurisdiction }) {
  const { data: areas = [], isLoading } = useKbLegalAreas(jurisdiction.id);
  const upsert = useUpsertKbLegalArea(jurisdiction.id);
  const del = useDeleteKbLegalArea(jurisdiction.id);

  const [editing, setEditing] = useState<KbLegalArea | null>(null);
  const [open, setOpen] = useState(false);

  const [code, setCode] = useState("trademarks");
  const [name, setName] = useState("Marcas");
  const [icon, setIcon] = useState("®️");
  const [score, setScore] = useState(0);
  const [docs, setDocs] = useState(0);
  const [plan, setPlan] = useState<KbPlan>("basic");
  const [active, setActive] = useState(true);
  const [limits, setLimits] = useState("");

  useEffect(() => {
    if (!open) return;
    setCode(editing?.area_code ?? "trademarks");
    setName(editing?.area_name ?? "Marcas");
    setIcon(editing?.area_icon ?? "");
    setScore(editing?.area_score ?? 0);
    setDocs(editing?.documents_indexed ?? 0);
    setPlan((editing?.requires_plan ?? "basic") as KbPlan);
    setActive(editing?.is_active ?? true);
    setLimits(toTextFromArray(editing?.area_limitations));
  }, [open, editing]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Áreas legales</CardTitle>
          <CardDescription>{jurisdiction.code} · {jurisdiction.name}</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva área
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar área" : "Nueva área"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Icono</Label>
                <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="®️" />
              </div>
              <div className="space-y-2">
                <Label>Score</Label>
                <Input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Docs indexados</Label>
                <Input type="number" value={docs} onChange={(e) => setDocs(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Plan mínimo</Label>
                <Select value={plan} onValueChange={(v) => setPlan(v as KbPlan)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={active} onCheckedChange={setActive} />
                <Label>Activa</Label>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Limitaciones (1 por línea)</Label>
                <Textarea value={limits} onChange={(e) => setLimits(e.target.value)} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() =>
                  upsert.mutate({
                    id: editing?.id,
                    area_code: code,
                    area_name: name,
                    area_icon: icon || null,
                    area_score: score,
                    documents_indexed: docs,
                    requires_plan: plan,
                    is_active: active,
                    area_limitations: asArrayFromText(limits),
                  })
                }
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : areas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay áreas todavía.</p>
        ) : (
          <div className="space-y-2">
            {areas.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3",
                  !a.is_active && "opacity-70"
                )}
              >
                <div className="w-8 text-center">{a.area_icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{a.area_name}</p>
                    <Badge variant="outline" className={planBadgeClass(a.requires_plan)}>
                      {PLAN_LABEL[a.requires_plan]}
                    </Badge>
                    {!a.is_active && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">Inactiva</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{a.area_code} · Score {a.area_score} · Docs {a.documents_indexed}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(a);
                    setOpen(true);
                  }}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="ghost" size="icon" onClick={() => del.mutate(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DisclaimersPanel() {
  const { data = [], isLoading } = useKbDisclaimers();
  const upsert = useUpsertKbDisclaimer();

  const [editing, setEditing] = useState<KbDisclaimer | null>(null);
  const [open, setOpen] = useState(false);

  const [badgeText, setBadgeText] = useState("");
  const [badgeColor, setBadgeColor] = useState("");
  const [shortMsg, setShortMsg] = useState("");
  const [longMsg, setLongMsg] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setBadgeText(editing?.badge_text ?? "");
    setBadgeColor(editing?.badge_color ?? "");
    setShortMsg(editing?.short_message ?? "");
    setLongMsg(editing?.long_message ?? "");
    setShowVerify(editing?.show_verification_prompt ?? false);
    setVerifyMsg(editing?.verification_message ?? "");
  }, [open, editing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disclaimers por Tier</CardTitle>
        <CardDescription>Mensajes que verá el usuario según el nivel de confianza.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                <Badge variant="outline" className={tierBadgeClass(d.tier)}>
                  {TIER_LABEL[d.tier]}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{d.badge_text}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.short_message}</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(d);
                      }}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Editar disclaimer {d.tier}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Badge text</Label>
                        <Input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Badge color</Label>
                        <Input value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} placeholder="green/yellow/orange" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Mensaje corto</Label>
                        <Input value={shortMsg} onChange={(e) => setShortMsg(e.target.value)} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Mensaje largo</Label>
                        <Textarea value={longMsg} onChange={(e) => setLongMsg(e.target.value)} rows={6} />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={showVerify} onCheckedChange={setShowVerify} />
                        <Label>Mostrar “Verifica con experto”</Label>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Mensaje de verificación</Label>
                        <Textarea value={verifyMsg} onChange={(e) => setVerifyMsg(e.target.value)} rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() =>
                          upsert.mutate({
                            id: d.id,
                            badge_text: badgeText,
                            badge_color: badgeColor,
                            short_message: shortMsg,
                            long_message: longMsg,
                            show_verification_prompt: showVerify,
                            verification_message: verifyMsg || null,
                          })
                        }
                      >
                        Guardar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function KnowledgeBasesPage() {
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<KbConfidenceTier | "all">("all");
  const [plan, setPlan] = useState<KbPlan | "all">("all");
  const [active, setActive] = useState<boolean | "all">("all");

  const { data: jurisdictions = [], isLoading } = useKbJurisdictions({ search, tier, plan, active });
  const upsert = useUpsertKbJurisdiction();
  const del = useDeleteKbJurisdiction();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<KbJurisdiction | null>(null);
  const [selected, setSelected] = useState<KbJurisdiction | null>(null);

  const selectedForAreas = selected ?? jurisdictions[0] ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Bases</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona Jurisdicciones, cobertura y disclaimers de confianza.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva jurisdicción
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Jurisdicciones</CardTitle>
          <CardDescription>Filtro rápido + edición de scoring y requisitos de plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ES / Europa / Global…" />
            </div>

            <Select value={tier} onValueChange={(v) => setTier(v as KbConfidenceTier | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tiers</SelectItem>
                <SelectItem value="tier_1">Tier 1</SelectItem>
                <SelectItem value="tier_2">Tier 2</SelectItem>
                <SelectItem value="tier_3">Tier 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={plan} onValueChange={(v) => setPlan(v as KbPlan | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={active === "all" ? "all" : active ? "active" : "inactive"}
              onValueChange={(v) => setActive(v === "all" ? "all" : v === "active")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : jurisdictions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay jurisdicciones con esos filtros.</p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {jurisdictions.map((j) => {
                const isSelected = selectedForAreas?.id === j.id;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setSelected(j)}
                    className={cn(
                      "text-left rounded-lg border p-4 transition-colors",
                      isSelected ? "bg-muted" : "hover:bg-muted/50",
                      !j.is_active && "opacity-70"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl leading-none">{j.flag_emoji || "🌐"}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{j.code} · {j.name}</p>
                          {j.is_beta && (
                            <Badge variant="outline" className="bg-accent text-accent-foreground">BETA</Badge>
                          )}
                          {!j.is_active && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">Inactiva</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={tierBadgeClass(j.confidence_tier)}>
                            {TIER_LABEL[j.confidence_tier]}
                          </Badge>
                          <Badge variant="outline" className={planBadgeClass(j.requires_plan)}>
                            {PLAN_LABEL[j.requires_plan]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Score {j.score_overall}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{j.legal_disclaimer}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditing(j);
                            setDialogOpen(true);
                          }}
                        >
                          <Settings2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            del.mutate(j.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="areas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="areas">Áreas</TabsTrigger>
          <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
        </TabsList>
        <TabsContent value="areas">
          {selectedForAreas ? (
            <LegalAreasPanel jurisdiction={selectedForAreas} />
          ) : (
            <Card>
              <CardContent className="py-10 text-sm text-muted-foreground">No hay jurisdicciones todavía.</CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="disclaimers">
          <DisclaimersPanel />
        </TabsContent>
      </Tabs>

      <JurisdictionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={(payload) => upsert.mutate(payload)}
      />
    </div>
  );
}
