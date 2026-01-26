// ============================================================
// IP-NEXUS - Call Initiate Modal Component
// ============================================================

import { useState, useEffect } from "react";
import { Phone, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "@/contexts/organization-context";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface CallInitiateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phone: string;
  name?: string;
  company?: string;
  clientId?: string;
  contactId?: string;
  matterId?: string;
  onStartCall: (options: {
    record: boolean;
    matterId?: string;
  }) => void;
}

interface Matter {
  id: string;
  reference: string;
  title: string;
}

export function CallInitiateModal({
  open,
  onOpenChange,
  phone,
  name,
  company,
  matterId: initialMatterId,
  onStartCall,
}: CallInitiateModalProps) {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [record, setRecord] = useState(false);
  const [selectedMatterId, setSelectedMatterId] = useState<string | undefined>(initialMatterId);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<{
    canCall: boolean;
    minutesAvailable: number;
    estimatedCostPerMinute: number;
    country: string;
  } | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(true);

  // Check balance on mount
  useEffect(() => {
    if (open && currentOrganization?.id) {
      checkBalance();
      loadMatters();
    }
  }, [open, currentOrganization?.id, phone]);

  const checkBalance = async () => {
    setCheckingBalance(true);
    try {
      const { data, error } = await supabase.functions.invoke("telephony-check-balance", {
        body: { tenantId: currentOrganization?.id, destination: phone },
      });

      if (!error && data) {
        setBalance(data);
      } else {
        setBalance({ canCall: false, minutesAvailable: 0, estimatedCostPerMinute: 1, country: "ES" });
      }
    } catch {
      setBalance({ canCall: false, minutesAvailable: 0, estimatedCostPerMinute: 1, country: "ES" });
    } finally {
      setCheckingBalance(false);
    }
  };

  const loadMatters = async () => {
    if (!currentOrganization?.id) return;

    const { data } = await supabase
      .from("matters")
      .select("id, reference, title")
      .eq("organization_id", currentOrganization.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setMatters(data);
    }
  };

  const handleStartCall = () => {
    setLoading(true);
    onStartCall({ record, matterId: selectedMatterId });
  };

  const getCountryLabel = (country: string) => {
    const countries: Record<string, string> = {
      ES: "España (nacional)",
      PT: "Portugal",
      FR: "Francia",
      DE: "Alemania",
      IT: "Italia",
      UK: "Reino Unido",
      GB: "Reino Unido",
      US: "Estados Unidos",
      default: "Internacional",
    };
    return countries[country] || countries.default;
  };

  const noBalance = !checkingBalance && balance && !balance.canCall;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-success" />
            Llamar a {name || "contacto"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phone info */}
          <div className="text-center space-y-1">
            <p className="text-xl font-semibold">{phone}</p>
            {company && <p className="text-sm text-muted-foreground">{company}</p>}
          </div>

          {checkingBalance ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Verificando saldo...</span>
            </div>
          ) : noBalance ? (
            /* No balance warning */
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-warning">No tienes minutos disponibles</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu saldo: <span className="font-semibold">0 minutos</span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Compra un pack de minutos para poder realizar llamadas.
              </p>
            </div>
          ) : (
            /* Balance info */
            <>
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tu saldo:</span>
                  <span className="font-semibold">{balance?.minutesAvailable ?? 0} minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coste estimado:</span>
                  <span>
                    ~{balance?.estimatedCostPerMinute ?? 1} min ({getCountryLabel(balance?.country ?? "ES")})
                  </span>
                </div>
              </div>

              {/* Record checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="record"
                  checked={record}
                  onCheckedChange={(checked) => setRecord(checked === true)}
                />
                <Label htmlFor="record" className="text-sm cursor-pointer">
                  Grabar llamada
                </Label>
              </div>

              {/* Matter selector */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Vincular a expediente (opcional):
                </Label>
                <Select value={selectedMatterId} onValueChange={setSelectedMatterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar expediente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin vincular</SelectItem>
                    {matters.map((matter) => (
                      <SelectItem key={matter.id} value={matter.id}>
                        {matter.reference} - {matter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {noBalance ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/app/settings/telephony/packs");
                }}
              >
                Comprar minutos
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleStartCall}
                disabled={loading || checkingBalance}
                className="bg-success hover:bg-success/90 text-success-foreground gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                Iniciar llamada
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
