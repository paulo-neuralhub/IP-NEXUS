import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Clock, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { format, differenceInDays, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { DeadlineItem } from "@/hooks/use-dashboard-home";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Crítico" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "Alto" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medio" },
  low: { bg: "bg-green-100", text: "text-green-700", label: "Bajo" },
};

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-module-finance" />
          Próximos Plazos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <DeadlineRow key={deadline.id} deadline={deadline} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay plazos próximos
            </p>
          </div>
        )}
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link to="/app/docket">Ver calendario</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DeadlineRow({ deadline }: { deadline: DeadlineItem }) {
  const dueDate = new Date(deadline.dueDate);
  const daysUntil = differenceInDays(dueDate, new Date());
  const isOverdue = isPast(dueDate);
  const priorityStyle = PRIORITY_STYLES[deadline.priority] || PRIORITY_STYLES.medium;

  const content = (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border transition-colors",
      isOverdue && "border-red-300 bg-red-50",
      daysUntil <= 3 && !isOverdue && "border-orange-300 bg-orange-50",
      deadline.matterId && "hover:bg-muted/50 cursor-pointer"
    )}>
      <div className={cn(
        "p-2 rounded-full shrink-0",
        isOverdue ? "bg-red-200 text-red-700" : priorityStyle.bg + " " + priorityStyle.text
      )}>
        {isOverdue ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{deadline.title}</p>
        {deadline.matterRef && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <FileText className="h-3 w-3" />
            <span>{deadline.matterRef}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-xs font-medium",
            isOverdue ? "text-red-600" : daysUntil <= 3 ? "text-orange-600" : "text-muted-foreground"
          )}>
            {isOverdue 
              ? "Vencido" 
              : daysUntil === 0 
                ? "Hoy" 
                : daysUntil === 1 
                  ? "Mañana"
                  : `${daysUntil} días`}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(dueDate, "dd MMM", { locale: es })}
          </span>
          <Badge variant="outline" className={cn("text-xs", priorityStyle.text)}>
            {priorityStyle.label}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (deadline.matterId) {
    return <Link to={`/app/docket/${deadline.matterId}`}>{content}</Link>;
  }

  return content;
}
