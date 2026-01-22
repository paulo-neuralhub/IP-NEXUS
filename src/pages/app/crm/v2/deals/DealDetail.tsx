import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMDeals } from "@/hooks/crm/v2/deals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useState, useMemo } from "react";
import { DealFormModal } from "@/components/features/crm/v2/DealFormModal";

function formatEUR(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deals, isLoading } = useCRMDeals();
  const [showEditModal, setShowEditModal] = useState(false);

  const deal = useMemo(() => deals?.find((d: any) => d.id === id), [deals, id]);

  usePageTitle(deal?.name ?? "Deal");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/app/crm/v2/deals")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Deal no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate("/app/crm/v2/deals")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="truncate">{deal.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {deal.account?.name ?? "Sin cuenta"}
              </p>
            </div>
            <Badge variant="secondary">{deal.stage ?? "—"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-lg font-medium mt-1">{formatEUR(deal.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cierre estimado</p>
              <p className="text-base mt-1">{deal.expected_close_date ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contacto</p>
              <p className="text-base mt-1">{deal.contact?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Responsable</p>
              <p className="text-base mt-1">{deal.owner?.full_name ?? "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Próximamente: timeline de interacciones y tareas.</p>
        </CardContent>
      </Card>

      <DealFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        defaultAccountId={deal.account?.id}
      />
    </div>
  );
}
