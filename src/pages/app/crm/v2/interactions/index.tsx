/**
 * CRM Timeline Equipo - Timeline visual profesional con filtros completos
 * Vista de supervisión de actividad global del equipo
 */

import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMInteractions } from "@/hooks/crm/v2/interactions";
import { useCRMAccounts } from "@/hooks/crm/v2/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InteractionFormModal } from "@/components/features/crm/v2/InteractionFormModal";
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  FileText,
  Plus,
  Search,
  Building2,
  Briefcase,
  User,
  Paperclip,
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  X,
  Filter,
  ListTodo,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

type InteractionRow = {
  id: string;
  created_at?: string | null;
  channel?: string | null;
  direction?: string | null;
  status?: string | null;
  subject?: string | null;
  content?: string | null;
  duration_seconds?: number | null;
  attachments?: string[] | null;
  created_by_name?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null } | null;
  deal?: { id: string; name?: string | null } | null;
};

type ActivityType = "all" | "call" | "email" | "whatsapp" | "meeting" | "note";

// Configuración de canales
const CHANNEL_CONFIG: Record<string, { icon: typeof Phone; color: string; bgColor: string; label: string }> = {
  call: { icon: Phone, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Llamada" },
  phone: { icon: Phone, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30", label: "Llamada" },
  email: { icon: Mail, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30", label: "Email" },
  whatsapp: { icon: MessageCircle, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30", label: "WhatsApp" },
  meeting: { icon: Calendar, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30", label: "Reunión" },
  note: { icon: FileText, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-800/50", label: "Nota" },
};

// Iconos de dirección
const DIRECTION_ICONS = {
  outbound: { icon: ArrowUpRight, label: "Saliente", color: "text-blue-500" },
  inbound: { icon: ArrowDownLeft, label: "Entrante", color: "text-green-500" },
  completed: { icon: CheckCircle2, label: "Completada", color: "text-emerald-500" },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins} min` : `${secs} seg`;
}

function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "HOY";
  if (isYesterday(date)) return "AYER";
  return format(date, "EEEE d MMMM yyyy", { locale: es }).toUpperCase();
}

function getInitials(name?: string | null): string {
  if (!name) return "S";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

interface ActivityCardProps {
  interaction: InteractionRow;
  onOpenDetail: (interaction: InteractionRow) => void;
}

function ActivityCard({ interaction, onOpenDetail }: ActivityCardProps) {
  const channel = interaction.channel?.toLowerCase() ?? "note";
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.note;
  const Icon = config.icon;
  const time = interaction.created_at ? format(parseISO(interaction.created_at), "HH:mm") : "—";
  
  // Dirección
  const direction = interaction.direction?.toLowerCase();
  const dirConfig = direction && DIRECTION_ICONS[direction as keyof typeof DIRECTION_ICONS];
  const DirIcon = dirConfig?.icon;

  return (
    <div className="bg-card border rounded-xl p-4 transition-all duration-200 hover:shadow-lg group">
      <div className="flex gap-4">
        {/* Time Badge con icono y dirección */}
        <div className="flex flex-col items-center shrink-0 gap-1">
          <div className={cn("w-14 h-14 rounded-xl flex flex-col items-center justify-center", config.bgColor)}>
            <Icon className={cn("w-5 h-5", config.color)} />
            <span className="text-[10px] font-bold mt-0.5 text-muted-foreground">{time}</span>
          </div>
          {DirIcon && (
            <div className={cn("flex items-center gap-0.5 text-[10px]", dirConfig.color)}>
              <DirIcon className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {interaction.subject || `${config.label} con ${interaction.contact?.full_name || "contacto"}`}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                {interaction.account?.name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary/70" />
                    <span className="font-medium">{interaction.account.name}</span>
                  </span>
                )}
                {interaction.deal?.name && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-amber-500" />
                    {interaction.deal.name}
                  </span>
                )}
              </div>
            </div>
            {interaction.duration_seconds && (
              <Badge variant="secondary" className="text-xs shrink-0 font-mono">
                {formatDuration(interaction.duration_seconds)}
              </Badge>
            )}
          </div>

          {/* Content/Notes */}
          {interaction.content && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-3 border-l-2 border-primary/20">
              <p className="whitespace-pre-wrap line-clamp-3">{interaction.content}</p>
            </div>
          )}

          {/* Attachments */}
          {interaction.attachments && interaction.attachments.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/30 rounded-md px-2 py-1.5 w-fit">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="font-medium">{interaction.attachments.length} archivo(s)</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            {/* Usuario que realizó la actividad */}
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                  {getInitials(interaction.created_by_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {interaction.created_by_name || "Sistema"}
              </span>
            </div>
            
            {/* Acciones */}
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 gap-1 text-primary hover:bg-primary/10"
                onClick={() => onOpenDetail(interaction)}
              >
                Ver detalle
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chip de filtro activo
const FilterChip = React.forwardRef<HTMLDivElement, { label: string; onRemove: () => void }>(
  ({ label, onRemove }, ref) => {
    return (
      <Badge ref={ref} variant="secondary" className="gap-1 pr-1 text-xs">
        {label}
        <button onClick={onRemove} className="ml-1 hover:bg-muted rounded-full p-0.5">
          <X className="w-3 h-3" />
        </button>
      </Badge>
    );
  }
);
FilterChip.displayName = 'FilterChip';

// Sheet de detalle de actividad
interface ActivityDetailSheetProps {
  interaction: InteractionRow | null;
  open: boolean;
  onClose: () => void;
}

function ActivityDetailSheet({ interaction, open, onClose }: ActivityDetailSheetProps) {
  if (!interaction) return null;
  
  const channel = interaction.channel?.toLowerCase() ?? "note";
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.note;
  const Icon = config.icon;
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bgColor)}>
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            <div>
              <SheetTitle className="text-left">
                {interaction.subject || `${config.label} con contacto`}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">
                {interaction.created_at 
                  ? format(parseISO(interaction.created_at), "PPp", { locale: es })
                  : "Fecha desconocida"
                }
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Tipo y dirección */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge>{config.label}</Badge>
            {interaction.direction && (
              <Badge variant="outline">
                {interaction.direction === "inbound" ? "⬇️ Entrante" : "⬆️ Saliente"}
              </Badge>
            )}
            {interaction.duration_seconds && (
              <Badge variant="secondary" className="font-mono">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(interaction.duration_seconds)}
              </Badge>
            )}
          </div>

          {/* Cliente */}
          {interaction.account?.name && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Cliente</label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4 text-primary" />
                <p className="font-medium">{interaction.account.name}</p>
              </div>
            </div>
          )}

          {/* Contacto */}
          {interaction.contact?.full_name && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contacto</label>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{interaction.contact.full_name}</p>
              </div>
            </div>
          )}

          {/* Deal */}
          {interaction.deal?.name && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Negociación</label>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <p className="font-medium">{interaction.deal.name}</p>
              </div>
            </div>
          )}

          {/* Descripción / Notas */}
          {interaction.content && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Descripción</label>
              <div className="mt-2 bg-muted/50 rounded-lg p-4 border">
                <p className="whitespace-pre-wrap text-sm">{interaction.content}</p>
              </div>
            </div>
          )}

          {/* Adjuntos */}
          {interaction.attachments && interaction.attachments.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Adjuntos</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {interaction.attachments.map((att, i) => (
                  <Badge key={i} variant="outline" className="gap-1">
                    <Paperclip className="w-3 h-3" />
                    Archivo {i + 1}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Usuario que realizó */}
          <div className="pt-4 border-t">
            <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Realizado por</label>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(interaction.created_by_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{interaction.created_by_name || "Sistema"}</p>
                <p className="text-xs text-muted-foreground">
                  {interaction.created_at 
                    ? format(parseISO(interaction.created_at), "PPp", { locale: es })
                    : ""
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function CRMV2InteractionsList() {
  usePageTitle("Timeline Equipo");
  const [params] = useSearchParams();
  const accountId = params.get("account") ?? undefined;
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<InteractionRow | null>(null);
  const [typeFilter, setTypeFilter] = useState<ActivityType>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");

  const { data, isLoading, refetch } = useCRMInteractions(accountId ? { account_id: accountId } : undefined);
  const { data: accounts = [] } = useCRMAccounts();

  // Contadores por tipo
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, call: 0, email: 0, whatsapp: 0, meeting: 0, note: 0 };
    (data ?? []).forEach((i: InteractionRow) => {
      counts.all++;
      const ch = i.channel?.toLowerCase() ?? "note";
      if (ch === "call" || ch === "phone") counts.call++;
      else if (counts[ch] !== undefined) counts[ch]++;
    });
    return counts;
  }, [data]);

  // Filtros activos
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string }[] = [];
    if (typeFilter !== "all") filters.push({ key: "type", label: CHANNEL_CONFIG[typeFilter]?.label || typeFilter });
    if (dateFilter !== "all") {
      const labels: Record<string, string> = { today: "Hoy", week: "Esta semana", month: "Este mes" };
      filters.push({ key: "date", label: labels[dateFilter] || dateFilter });
    }
    if (directionFilter !== "all") {
      filters.push({ key: "direction", label: directionFilter === "inbound" ? "Entrante" : "Saliente" });
    }
    if (accountFilter !== "all") {
      const acc = (accounts as { id: string; name?: string }[]).find(a => a.id === accountFilter);
      if (acc) filters.push({ key: "account", label: acc.name || "Cliente" });
    }
    return filters;
  }, [typeFilter, dateFilter, directionFilter, accountFilter, accounts]);

  const clearFilter = (key: string) => {
    if (key === "type") setTypeFilter("all");
    if (key === "date") setDateFilter("all");
    if (key === "direction") setDirectionFilter("all");
    if (key === "account") setAccountFilter("all");
  };

  const clearAllFilters = () => {
    setTypeFilter("all");
    setDateFilter("all");
    setDirectionFilter("all");
    setAccountFilter("all");
    setSearch("");
  };

  // Filter and group by date
  const groupedActivities = useMemo(() => {
    let filtered = (data ?? []) as InteractionRow[];
    
    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(i => {
        const channel = i.channel?.toLowerCase() ?? "";
        if (typeFilter === "call") return channel === "call" || channel === "phone";
        return channel === typeFilter;
      });
    }

    // Direction filter
    if (directionFilter !== "all") {
      filtered = filtered.filter(i => i.direction?.toLowerCase() === directionFilter);
    }

    // Account filter
    if (accountFilter !== "all") {
      filtered = filtered.filter(i => i.account?.id === accountFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(i => {
        if (!i.created_at) return false;
        const date = parseISO(i.created_at);
        if (dateFilter === "today") return isToday(date);
        if (dateFilter === "week") return date >= startOfWeek(now, { locale: es });
        if (dateFilter === "month") return date >= startOfMonth(now);
        return true;
      });
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.subject?.toLowerCase().includes(q) ||
        i.content?.toLowerCase().includes(q) ||
        i.account?.name?.toLowerCase().includes(q) ||
        i.contact?.full_name?.toLowerCase().includes(q)
      );
    }

    // Group by date
    const groups: Record<string, InteractionRow[]> = {};
    filtered.forEach(item => {
      if (!item.created_at) return;
      const dayKey = startOfDay(parseISO(item.created_at)).toISOString();
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(item);
    });

    // Sort groups by date descending
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, items]) => ({
        date: dateKey,
        label: getDateLabel(items[0]?.created_at ?? dateKey),
        items,
      }));
  }, [data, typeFilter, directionFilter, accountFilter, dateFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timeline Equipo</h1>
          <p className="text-muted-foreground">Actividad global del equipo • Vista de supervisión</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setShowTaskForm(true)}>
            <ListTodo className="w-4 h-4 mr-2" />
            Tarea
          </Button>
          <Button onClick={() => setShowActivityForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Actividad
          </Button>
        </div>
      </div>

      {/* Type Tabs con contadores */}
      <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType)}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="gap-1.5">
            Todas <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="call" className="gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Llamadas
            {typeCounts.call > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.call}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Emails
            {typeCounts.email > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.email}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            {typeCounts.whatsapp > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.whatsapp}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="meeting" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Reuniones
            {typeCounts.meeting > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.meeting}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="note" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Notas
            {typeCounts.note > 0 && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">{typeCounts.note}</Badge>}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9"
            />
          </div>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[130px]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Dirección" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="inbound">Entrante</SelectItem>
              <SelectItem value="outbound">Saliente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[160px]">
              <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent className="bg-background max-h-[200px]">
              <SelectItem value="all">Todos</SelectItem>
              {(accounts as { id: string; name?: string }[]).map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name || "Sin nombre"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtros:
            </span>
            {activeFilters.map(f => (
              <FilterChip key={f.key} label={f.label} onRemove={() => clearFilter(f.key)} />
            ))}
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={clearAllFilters}>
              Limpiar todo
            </Button>
          </div>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : groupedActivities.length === 0 ? (
        <div className="py-14 px-6 text-center border rounded-xl bg-muted/30">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium text-lg">Sin actividades</p>
          <p className="text-sm text-muted-foreground mb-4">No hay actividades registradas con estos filtros.</p>
          <Button onClick={() => setShowActivityForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Registrar actividad
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map(group => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground bg-primary/10 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                  {group.label}
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="outline" className="text-xs">
                  {group.items.length} actividad{group.items.length !== 1 ? "es" : ""}
                </Badge>
              </div>

              {/* Activities */}
              <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-4">
                {group.items.map(interaction => (
                  <ActivityCard 
                    key={interaction.id} 
                    interaction={interaction} 
                    onOpenDetail={setSelectedInteraction}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <InteractionFormModal 
        open={showActivityForm} 
        onClose={() => setShowActivityForm(false)} 
        defaultAccountId={accountId} 
      />
      
      {/* TODO: TaskFormModal - por ahora reutiliza el mismo modal de actividad */}
      <InteractionFormModal 
        open={showTaskForm} 
        onClose={() => setShowTaskForm(false)} 
        defaultAccountId={accountId} 
      />

      {/* Detail Sheet */}
      <ActivityDetailSheet 
        interaction={selectedInteraction}
        open={!!selectedInteraction}
        onClose={() => setSelectedInteraction(null)}
      />
    </div>
  );
}
