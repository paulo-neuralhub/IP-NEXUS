import { useMemo } from "react";
import { usePageTitle } from "@/contexts/page-context";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Building2, CheckSquare, Percent } from "lucide-react";
import { useCRMDashboardKPIs } from "@/hooks/crm/v2/dashboard";
import { usePipelineSummary } from "@/hooks/crm/v2/deals";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CRMV2Dashboard() {
  usePageTitle("CRM");

  const { data, isLoading } = useCRMDashboardKPIs();
  const { data: pipelineSummary, isLoading: isLoadingPipelineSummary } = usePipelineSummary();

  const cards = useMemo(() => {
    const kpis = data;
    if (!kpis) return [];
    return [
      {
        label: "Cuentas",
        value: kpis.total_accounts,
        icon: Building2,
      },
      {
        label: "Contactos",
        value: kpis.total_contacts,
        icon: Users,
      },
      {
        label: "Pipeline (€)",
        value: Math.round(kpis.total_pipeline_value).toLocaleString("es-ES"),
        icon: TrendingUp,
      },
      {
        label: "Tareas pendientes",
        value: kpis.pending_tasks,
        icon: CheckSquare,
      },
      {
        label: "Win rate",
        value: `${kpis.win_rate}%`,
        icon: Percent,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CRM V2</h1>
        <p className="text-muted-foreground">Visión global (Accounts · Contacts · Deals · Interactions · Tasks)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold truncate">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Etapas (pipeline)</h2>
              <p className="text-sm text-muted-foreground">Distribución de deals por etapa</p>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {pipelineSummary?.total_amount != null ? Math.round(pipelineSummary.total_amount).toLocaleString("es-ES") : "—"} €
            </div>
          </div>

          {isLoadingPipelineSummary ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !pipelineSummary || (pipelineSummary.by_stage?.length ?? 0) === 0 ? (
            <div className="mt-6 text-sm text-muted-foreground">Aún no hay datos de etapas para este pipeline.</div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead className="text-right">Deals</TableHead>
                    <TableHead className="text-right">Valor (€)</TableHead>
                    <TableHead className="w-[220px]">Peso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelineSummary.by_stage.map((s) => {
                    const total = pipelineSummary.total_amount || 0;
                    const pct = total > 0 ? Math.round((s.amount / total) * 100) : 0;

                    return (
                      <TableRow key={s.stage}>
                        <TableCell className="font-medium">{s.stage}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{s.count}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(s.amount).toLocaleString("es-ES")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={pct} className="h-2" />
                            <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
