/**
 * CRM Tasks - Grid de tarjetas profesionales con urgencia
 * Estilo Odoo/Monday con border lateral color, avatar, información contextual
 */

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/contexts/page-context";
import { useCRMTasks, useCompleteCRMTask } from "@/hooks/crm/v2/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { TaskFormModal } from "@/components/features/crm/v2/TaskFormModal";
import {
  CheckSquare,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Mail,
  User,
  Building2,
  Briefcase,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type TaskRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  account?: { id: string; name?: string | null } | null;
  contact?: { id: string; full_name?: string | null; phone?: string | null; email?: string | null } | null;
  deal?: { id: string; name?: string | null } | null;
  assigned_to?: { id: string; full_name?: string | null } | null;
};

type UrgencyLevel = "overdue" | "today" | "tomorrow" | "week" | "later";
type FilterTab = "all" | "overdue" | "today" | "week" | "completed";

// Colores de urgencia con border lateral
const URGENCY_CONFIG: Record<UrgencyLevel, { 
  border: string; 
  badge: string; 
  badgeText: string; 
  dot: string;
  label: string;
}> = {
  overdue: { 
    border: "border-l-red-500", 
    badge: "bg-red-100 dark:bg-red-950/50", 
    badgeText: "text-red-700 dark:text-red-400", 
    dot: "bg-red-500",
    label: "VENCIDA"
  },
  today: { 
    border: "border-l-red-500", 
    badge: "bg-red-100 dark:bg-red-950/50", 
    badgeText: "text-red-700 dark:text-red-400", 
    dot: "bg-red-500",
    label: "HOY"
  },
  tomorrow: { 
    border: "border-l-orange-500", 
    badge: "bg-orange-100 dark:bg-orange-950/50", 
    badgeText: "text-orange-700 dark:text-orange-400", 
    dot: "bg-orange-500",
    label: "MAÑANA"
  },
  week: { 
    border: "border-l-yellow-500", 
    badge: "bg-yellow-100 dark:bg-yellow-950/50", 
    badgeText: "text-yellow-700 dark:text-yellow-400", 
    dot: "bg-yellow-500",
    label: "ESTA SEMANA"
  },
  later: { 
    border: "border-l-green-500", 
    badge: "bg-green-100 dark:bg-green-950/50", 
    badgeText: "text-green-700 dark:text-green-400", 
    dot: "bg-green-500",
    label: "PRÓXIMA"
  },
};

function getUrgencyLevel(dueDate: string | null | undefined): UrgencyLevel {
  if (!dueDate) return "later";
  const date = parseISO(dueDate);
  if (isPast(date) && !isToday(date)) return "overdue";
  if (isToday(date)) return "today";
  if (isTomorrow(date)) return "tomorrow";
  if (differenceInDays(date, new Date()) <= 7) return "week";
  return "later";
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function TaskCard({ task, onComplete }: { task: TaskRow; onComplete: () => void }) {
  const [completing, setCompleting] = useState(false);
  const isCompleted = task.status === "completed";
  const urgency = getUrgencyLevel(task.due_date);
  const config = URGENCY_CONFIG[urgency];

  const handleComplete = () => {
    setCompleting(true);
    onComplete();
  };

  const dueDate = task.due_date ? parseISO(task.due_date) : null;
  const phone = task.contact?.phone;
  const email = task.contact?.email;

  return (
    <div
      className={cn(
        "bg-card border rounded-xl overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.01]",
        isCompleted && "opacity-50",
        completing && "scale-95 opacity-50"
      )}
    >
      {/* Colored Left Border */}
      <div className={cn("border-l-4", config.border)}>
        <div className="p-4">
          {/* Row 1: Urgency Badge + Date */}
          <div className="flex items-center justify-between mb-4">
            <Badge className={cn("text-xs font-bold px-2.5 py-1", config.badge, config.badgeText)}>
              <span className={cn("w-2 h-2 rounded-full mr-2", config.dot)} />
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-xs font-mono gap-1.5">
              <Calendar className="w-3 h-3" />
              {dueDate ? format(dueDate, "d MMM HH:mm", { locale: es }) : "Sin fecha"}
            </Badge>
          </div>

          {/* Row 2: Checkbox + Title */}
          <div className="flex items-start gap-3 mb-4">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleComplete}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-semibold text-foreground leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title || "Tarea sin título"}
              </h4>
            </div>
          </div>

          {/* Row 3: Description */}
          {task.description && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-4">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground">📝</span>
                <p className="line-clamp-2">{task.description}</p>
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="h-px bg-border mb-4" />

          {/* Row 4: Related Info */}
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            {task.account?.name && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="truncate font-medium text-foreground">{task.account.name}</span>
              </div>
            )}
            {task.contact?.full_name && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{task.contact.full_name}</span>
                {phone && (
                  <span className="text-xs text-muted-foreground">• {phone}</span>
                )}
              </div>
            )}
            {task.deal?.name && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 shrink-0" />
                <span className="truncate">{task.deal.name}</span>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-px bg-border mb-4" />

          {/* Row 5: Avatar + Actions */}
          <div className="flex items-center justify-between">
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {task.assigned_to?.full_name 
                  ? getInitials(task.assigned_to.full_name) 
                  : "—"
                }
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {task.assigned_to?.full_name || "Sin asignar"}
              </span>
            </div>

            {/* Actions - Iconos con COLORES */}
            <TooltipProvider>
              <div className="flex items-center gap-1.5">
                {phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-600 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Llamar</TooltipContent>
                  </Tooltip>
                )}
                {phone && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white dark:bg-green-950/50 dark:text-green-400 dark:hover:bg-green-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>WhatsApp</TooltipContent>
                  </Tooltip>
                )}
                {email && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-600 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CRMV2TasksList() {
  usePageTitle("Tareas");
  const [params] = useSearchParams();
  const accountId = params.get("account") ?? undefined;
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Fetch all tasks (including completed for the completed tab)
  const { data: allTasks, isLoading } = useCRMTasks({
    account_id: accountId,
    status: tab === "completed" ? ["completed"] : ["pending", "in_progress"],
  });

  const complete = useCompleteCRMTask();

  // Count tasks by urgency for tab badges
  const counts = useMemo(() => {
    const tasks = (allTasks ?? []) as TaskRow[];
    return {
      overdue: tasks.filter(t => getUrgencyLevel(t.due_date) === "overdue" && t.status !== "completed").length,
      today: tasks.filter(t => getUrgencyLevel(t.due_date) === "today" && t.status !== "completed").length,
      week: tasks.filter(t => ["today", "tomorrow", "week"].includes(getUrgencyLevel(t.due_date)) && t.status !== "completed").length,
    };
  }, [allTasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let tasks = (allTasks ?? []) as TaskRow[];

    // Tab filter
    if (tab === "overdue") {
      tasks = tasks.filter(t => getUrgencyLevel(t.due_date) === "overdue");
    } else if (tab === "today") {
      tasks = tasks.filter(t => getUrgencyLevel(t.due_date) === "today");
    } else if (tab === "week") {
      tasks = tasks.filter(t => ["today", "tomorrow", "week"].includes(getUrgencyLevel(t.due_date)));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.account?.name?.toLowerCase().includes(q)
      );
    }

    return tasks;
  }, [allTasks, tab, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-muted-foreground">Gestiona tus pendientes y seguimientos</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Vencidas
            {counts.overdue > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0 h-5">
                {counts.overdue}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Hoy
            {counts.today > 0 && (
              <Badge className="ml-1 text-xs px-1.5 py-0 h-5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                {counts.today}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="week" className="gap-1.5">
            Esta semana
            {counts.week > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0 h-5">
                {counts.week}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            Completadas
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tarea..."
            className="pl-9"
          />
        </div>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Asignado a" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="me">Mis tareas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[320px] rounded-xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-14 px-6 text-center border rounded-xl bg-muted/30">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg">
            {tab === "completed" ? "Sin tareas completadas" : "Sin tareas pendientes"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {tab === "completed" ? "Las tareas completadas aparecerán aquí." : "¡Excelente! No tienes tareas pendientes."}
          </p>
          {tab !== "completed" && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear tarea
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => complete.mutate(task.id)}
            />
          ))}
        </div>
      )}

      <TaskFormModal open={showForm} onClose={() => setShowForm(false)} defaultAccountId={accountId} />
    </div>
  );
}
