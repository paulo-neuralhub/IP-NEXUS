/**
 * CRM Clients List - Grid de tarjetas profesionales estilo Odoo/Bitrix
 * Estadísticas mini-cards, badges tipo, rating, clasificación pago
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Mail,
  Star,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditClientCompanyDialog } from "@/components/legal-ops/modals/EditClientCompanyDialog";

type AccountRow = {
  id: string;
  name?: string | null;
  legal_name?: string | null;
  status?: string | null;
  tier?: string | null;
  health_score?: number | null;
  rating_stars?: number | null;
  tags?: string[] | null;
  last_interaction_at?: string | null;
  client_type?: { id: string; name?: string | null; color?: string | null } | null;
  payment_classification?: { 
    id: string; 
    name?: string | null; 
    color?: string | null; 
    alert_level?: string | null;
  } | null;
};

// Colores PASTEL suaves para clasificación de pago
const PAYMENT_COLORS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  excelente: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400", dot: "bg-green-400", border: "border-green-200 dark:border-green-800" },
  bueno: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-400", border: "border-blue-200 dark:border-blue-800" },
  regular: { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400", border: "border-slate-200 dark:border-slate-700" },
  malo: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-400", border: "border-orange-200 dark:border-orange-800" },
  moroso: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-400", border: "border-red-200 dark:border-red-800" },
  litigio: { bg: "bg-red-100 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", dot: "bg-red-500", border: "border-red-300 dark:border-red-800" },
};

// Colores PASTEL para tipo de cliente + borde lateral
const CLIENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; leftBorder: string }> = {
  directo: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", leftBorder: "border-l-blue-500" },
  agente: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", leftBorder: "border-l-purple-500" },
  grupo: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", leftBorder: "border-l-green-500" },
  partner: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", leftBorder: "border-l-orange-500" },
  prospecto: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", leftBorder: "border-l-slate-400" },
  default: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", leftBorder: "border-l-slate-400" },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function ClientCard({ account, onClick }: { account: AccountRow; onClick: () => void }) {
  const clientTypeName = account.client_type?.name?.toLowerCase() ?? "directo";
  const clientTypeStyle = CLIENT_TYPE_COLORS[clientTypeName] || CLIENT_TYPE_COLORS.default;
  const paymentName = account.payment_classification?.name?.toLowerCase() ?? "regular";
  const paymentStyle = PAYMENT_COLORS[paymentName] || PAYMENT_COLORS.regular;
  const rating = account.rating_stars ?? 0;

  // Mock stats - TODO: connect to real data via RPC
  const stats = {
    contacts: Math.floor(Math.random() * 5) + 1,
    matters: Math.floor(Math.random() * 8) + 1,
    deals: Math.floor(Math.random() * 3),
    invoiced: Math.floor(Math.random() * 100000),
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-l-4 rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200",
        "hover:border-[rgba(0,180,216,0.15)]",
        clientTypeStyle.leftBorder // Borde izquierdo según tipo de cliente
      )}
    >
      <div className="p-3">
        {/* Header: Avatar + Name + Rating */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 shrink-0">
            {getInitials(account.name || "?")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate text-sm">
              {account.name || account.legal_name || "Sin nombre"}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {account.legal_name || "—"}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn("w-3 h-3", i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20")}
              />
            ))}
          </div>
        </div>

        {/* Badges Row: Type + Payment */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge 
            variant="outline"
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 border",
              clientTypeStyle.bg, 
              clientTypeStyle.text, 
              clientTypeStyle.border
            )}
          >
            {account.client_type?.name || "Cliente"}
          </Badge>
          <Badge 
            variant="outline"
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 border flex items-center gap-1",
              paymentStyle.bg, 
              paymentStyle.text,
              paymentStyle.border
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", paymentStyle.dot)} />
            {account.payment_classification?.name || "Sin clasificar"}
          </Badge>
        </div>

        {/* Stats Row - Compact Horizontal */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-md px-2 py-1.5 text-center">
            <span className="text-sm font-semibold text-foreground">{stats.contacts}</span>
            <p className="text-[9px] text-muted-foreground">Contactos</p>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-md px-2 py-1.5 text-center">
            <span className="text-sm font-semibold text-foreground">{stats.matters}</span>
            <p className="text-[9px] text-muted-foreground">Expedientes</p>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-md px-2 py-1.5 text-center">
            <span className="text-sm font-semibold text-foreground">{stats.deals}</span>
            <p className="text-[9px] text-muted-foreground">Negociaciones</p>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-md px-2 py-1.5 text-center">
            <span className="text-sm font-semibold text-green-600">€{Math.round(stats.invoiced / 1000)}K</span>
            <p className="text-[9px] text-muted-foreground">Facturado</p>
          </div>
        </div>

        {/* Actions Row - Iconos CON COLOR */}
        <div className="flex items-center justify-between pt-2 border-t">
          <TooltipProvider>
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Llamar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white dark:bg-green-950/50 dark:text-green-400 dark:hover:bg-green-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>WhatsApp</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Email</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Ver ficha
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CRMV2AccountsList() {
  usePageTitle("Clientes");
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const { data, isLoading } = useCRMAccounts({ search: search || undefined });

  const rows = useMemo(() => {
    let filtered = (data ?? []) as AccountRow[];
    if (typeFilter !== "all") {
      filtered = filtered.filter(a => 
        a.client_type?.name?.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (paymentFilter !== "all") {
      filtered = filtered.filter(a => 
        a.payment_classification?.name?.toLowerCase() === paymentFilter.toLowerCase()
      );
    }
    return filtered;
  }, [data, typeFilter, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Modal Nuevo Cliente */}
      <EditClientCompanyDialog 
        open={showNewClientModal} 
        onOpenChange={setShowNewClientModal}
        clientId={null}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tus clientes y empresas</p>
        </div>
        <Button onClick={() => setShowNewClientModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="directo">Directo</SelectItem>
            <SelectItem value="agente">Agente PI</SelectItem>
            <SelectItem value="grupo">Grupo</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="prospecto">Prospecto</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Clasificación pago" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="excelente">Excelente</SelectItem>
            <SelectItem value="bueno">Bueno</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="malo">Malo</SelectItem>
            <SelectItem value="moroso">Moroso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 px-6 text-center border rounded-xl bg-muted/30">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg">Sin clientes</p>
          <p className="text-sm text-muted-foreground mb-4">No se encontraron clientes con estos filtros.</p>
          <Button onClick={() => setShowNewClientModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear primer cliente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rows.map((account) => (
            <ClientCard
              key={account.id}
              account={account}
              onClick={() => navigate(`/app/crm/clients/${account.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
