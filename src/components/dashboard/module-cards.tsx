import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  FileText, 
  ShoppingCart, 
  Users,
  Calculator,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  stats?: { label: string; value: string | number }[];
  badge?: string;
}

function ModuleCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color, 
  stats,
  badge 
}: ModuleCardProps) {
  return (
    <Card className={cn("border border-[rgba(0,0,0,0.06)] rounded-[14px] hover:border-[rgba(0,180,216,0.15)] transition-colors border-l-4", color)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {stats && stats.length > 0 && (
          <div className="flex gap-4 mb-4">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full" asChild>
          <Link to={href}>
            Ir a {title}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ModuleCardsProps {
  mattersCount: number;
  watchlistsCount: number;
  contactsCount: number;
  dealsCount: number;
  portfolioValue: number;
}

export function ModuleCards({
  mattersCount,
  watchlistsCount,
  contactsCount,
  dealsCount,
  portfolioValue,
}: ModuleCardsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ModuleCard
        title="IP-DOCKET"
        description="Gestión de expedientes de PI"
        icon={FileText}
        href="/app/docket"
        color="border-l-module-docket"
        stats={[
          { label: "Expedientes", value: mattersCount },
        ]}
      />
      <ModuleCard
        title="IP-SPIDER"
        description="Vigilancia de marcas y dominios"
        icon={Eye}
        href="/app/spider"
        color="border-l-module-spider"
        stats={[
          { label: "Vigilancias", value: watchlistsCount },
        ]}
      />
      <ModuleCard
        title="IP-CRM"
        description="Gestión de clientes y deals"
        icon={Users}
        href="/app/crm"
        color="border-l-module-crm"
        stats={[
          { label: "Contactos", value: contactsCount },
          { label: "Deals", value: dealsCount },
        ]}
      />
      <ModuleCard
        title="IP-MARKET"
        description="Marketplace de activos PI"
        icon={ShoppingCart}
        href="/app/market"
        color="border-l-module-market"
        badge="Premium"
      />
      <ModuleCard
        title="IP-FINANCE"
        description="Valoración de cartera IP"
        icon={Calculator}
        href="/app/finance"
        color="border-l-module-finance"
        stats={[
          { label: "Valor Portfolio", value: `€${(portfolioValue / 1000).toFixed(0)}k` },
        ]}
      />
      <ModuleCard
        title="IP-GENIUS"
        description="Asistente IA especializado"
        icon={Sparkles}
        href="/app/genius"
        color="border-l-module-genius"
        badge="IA"
      />
    </div>
  );
}
