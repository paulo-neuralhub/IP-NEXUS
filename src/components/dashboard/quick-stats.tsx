import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  link?: string;
  badge?: string;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
  color?: string;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  link,
  badge,
  badgeVariant = "secondary",
  color = "text-primary",
  description,
}: StatCardProps) {
  const content = (
    <Card className={cn(
      "transition-all hover:shadow-md",
      link && "cursor-pointer hover:border-primary/50"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {badge && (
            <Badge variant={badgeVariant} className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

interface QuickStatsProps {
  totalMatters: number;
  activeWatchlists: number;
  pendingDeals: number;
  upcomingDeadlines: number;
  criticalAlerts: number;
  totalContacts: number;
}

export function QuickStats({
  totalMatters,
  activeWatchlists,
  pendingDeals,
  upcomingDeadlines,
  criticalAlerts,
  totalContacts,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        title="Expedientes"
        value={totalMatters}
        icon={require("lucide-react").FileText}
        link="/app/docket"
        color="text-module-docket"
      />
      <StatCard
        title="Vigilancias"
        value={activeWatchlists}
        icon={require("lucide-react").Eye}
        link="/app/spider"
        color="text-module-spider"
      />
      <StatCard
        title="Deals Abiertos"
        value={pendingDeals}
        icon={require("lucide-react").Handshake}
        link="/app/crm/deals"
        badge={pendingDeals > 0 ? "Activos" : undefined}
        color="text-module-crm"
      />
      <StatCard
        title="Contactos"
        value={totalContacts}
        icon={require("lucide-react").Users}
        link="/app/crm/contacts"
        color="text-module-crm"
      />
      <StatCard
        title="Plazos"
        value={upcomingDeadlines}
        icon={require("lucide-react").Calendar}
        link="/app/docket"
        badge={upcomingDeadlines > 5 ? "⚠️" : undefined}
        color="text-module-finance"
      />
      <StatCard
        title="Alertas"
        value={criticalAlerts}
        icon={require("lucide-react").AlertTriangle}
        link="/app/spider"
        badge={criticalAlerts > 0 ? "Críticas" : undefined}
        badgeVariant={criticalAlerts > 0 ? "destructive" : "secondary"}
        color={criticalAlerts > 0 ? "text-destructive" : "text-module-spider"}
      />
    </div>
  );
}
