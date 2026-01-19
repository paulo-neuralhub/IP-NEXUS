import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Edit,
  Plus,
  ArrowUpDown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ActivityItem } from "@/hooks/use-dashboard-home";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, any> = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle,
  stage_change: ArrowUpDown,
  create: Plus,
  update: Edit,
  default: FileText,
};

const ACTIVITY_COLORS: Record<string, string> = {
  note: "bg-blue-100 text-blue-700",
  call: "bg-green-100 text-green-700",
  email: "bg-purple-100 text-purple-700",
  meeting: "bg-amber-100 text-amber-700",
  task: "bg-teal-100 text-teal-700",
  stage_change: "bg-indigo-100 text-indigo-700",
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-orange-100 text-orange-700",
  default: "bg-gray-100 text-gray-700",
};

const MODULE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  docket: { label: "Docket", variant: "default" },
  crm: { label: "CRM", variant: "secondary" },
  spider: { label: "Spider", variant: "outline" },
  finance: { label: "Finance", variant: "secondary" },
  system: { label: "Sistema", variant: "outline" },
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/crm">Ver todo</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItemRow key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No hay actividad reciente</p>
                <p className="text-sm text-muted-foreground/70">
                  Las acciones en expedientes, CRM y otros módulos aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityItemRow({ activity }: { activity: ActivityItem }) {
  const Icon = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
  const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;
  const moduleBadge = MODULE_BADGES[activity.module] || MODULE_BADGES.system;

  const content = (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg transition-colors",
      activity.link && "hover:bg-muted/50 cursor-pointer"
    )}>
      <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{activity.title}</p>
          <Badge variant={moduleBadge.variant} className="text-xs shrink-0">
            {moduleBadge.label}
          </Badge>
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { 
            addSuffix: true, 
            locale: es 
          })}
        </p>
      </div>
    </div>
  );

  if (activity.link) {
    return <Link to={activity.link}>{content}</Link>;
  }

  return content;
}
