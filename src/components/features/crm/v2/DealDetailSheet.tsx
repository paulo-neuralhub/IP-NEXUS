import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit2, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Deal = {
  id: string;
  name?: string | null;
  stage?: string | null;
  amount?: number | null;
  expected_close_date?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null } | null;
  owner?: { id: string; full_name?: string | null } | null;
};

type Props = {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onEdit: (dealId: string) => void;
  onDelete?: (dealId: string) => void;
};

function formatEUR(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

export function DealDetailSheet({ deal, open, onClose, onEdit, onDelete }: Props) {
  const navigate = useNavigate();

  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <SheetTitle className="truncate">{deal.name || deal.id}</SheetTitle>
              <SheetDescription className="truncate">
                {deal.account?.name ?? "Sin cuenta"}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/app/crm/v2/deals/${deal.id}`)}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Etapa</p>
              <Badge variant="secondary" className="mt-1">
                {deal.stage ?? "—"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-base font-medium mt-1">{formatEUR(deal.amount)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Fecha cierre estimada</p>
            <p className="text-base mt-1">{deal.expected_close_date ?? "—"}</p>
          </div>

          {deal.contact && (
            <div>
              <p className="text-sm text-muted-foreground">Contacto</p>
              <p className="text-base mt-1">{deal.contact.full_name ?? "—"}</p>
            </div>
          )}

          {deal.owner && (
            <div>
              <p className="text-sm text-muted-foreground">Responsable</p>
              <p className="text-base mt-1">{deal.owner.full_name ?? "—"}</p>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(deal.id)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {onDelete && (
              <Button variant="outline" className="text-destructive" onClick={() => onDelete(deal.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
