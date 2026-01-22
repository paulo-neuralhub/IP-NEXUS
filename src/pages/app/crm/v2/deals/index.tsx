import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMDeals } from "@/hooks/crm/v2/deals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, TrendingUp, Plus } from "lucide-react";
import { DealFormModal } from "@/components/features/crm/v2/DealFormModal";

type DealRow = {
  id: string;
  name?: string | null;
  stage?: string | null;
  amount?: number | null;
  expected_close_date?: string | null;
  account?: { id: string; name?: string | null } | null;
};

export default function CRMV2DealsList() {
  usePageTitle("Deals");
  const [params] = useSearchParams();
  const accountId = params.get("account") ?? undefined;

  const [search, setSearch] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);
  const { data, isLoading } = useCRMDeals({
    search: search || undefined,
    account_id: accountId,
  });

  const rows = useMemo(() => (data ?? []) as DealRow[], [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-muted-foreground">Pipeline y oportunidades</p>
        </div>
        <Button onClick={() => setShowDealForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Deal
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar deals..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Sin deals</p>
              <p className="text-sm text-muted-foreground">No se encontraron deals con estos filtros.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Cuenta</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cierre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name || d.id}</TableCell>
                    <TableCell className="text-muted-foreground">{d.account?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{d.stage ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{d.amount != null ? Number(d.amount).toLocaleString("es-ES") : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{d.expected_close_date ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DealFormModal open={showDealForm} onClose={() => setShowDealForm(false)} defaultAccountId={accountId} />
    </div>
  );
}
