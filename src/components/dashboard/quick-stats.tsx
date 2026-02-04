import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, AlertTriangle, FileText, Eye, Handshake, Users, Calendar } from "lucide-react";
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
      "transition-all border border-[rgba(0,0,0,0.06)] rounded-[14px] hover:border-[rgba(0,180,216,0.15)]",
      link && "cursor-pointer"
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
        icon={FileText}
        link="/app/docket"
        color="text-module-docket"
      />
      <StatCard
        title="Vigilancias"
        value={activeWatchlists}
        icon={Eye}
        link="/app/spider"
        color="text-module-spider"
      />
      <StatCard
        title="Deals Abiertos"
        value={pendingDeals}
        icon={Handshake}
        link="/app/crm/deals"
        badge={pendingDeals > 0 ? "Activos" : undefined}
        color="text-module-crm"
      />
      <StatCard
        title="Contactos"
        value={totalContacts}
        icon={Users}
        link="/app/crm/contacts"
        color="text-module-crm"
      />
      <StatCard
        title="Plazos"
        value={upcomingDeadlines}
        icon={Calendar}
        link="/app/docket"
        badge={upcomingDeadlines > 5 ? "⚠️" : undefined}
        color="text-module-finance"
      />
      <StatCard
        title="Alertas"
        value={criticalAlerts}
        icon={AlertTriangle}
        link="/app/spider"
        badge={criticalAlerts > 0 ? "Críticas" : undefined}
        badgeVariant={criticalAlerts > 0 ? "destructive" : "secondary"}
        color={criticalAlerts > 0 ? "text-destructive" : "text-module-spider"}
      />
    </div>
  );
}
