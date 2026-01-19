import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  FileText, 
  ShoppingCart, 
  Sparkles, 
  Calculator, 
  Link as LinkIcon,
  Users,
  Mail,
  Languages
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickAccessButtonProps {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
}

function QuickAccessButton({ icon: Icon, label, href, color }: QuickAccessButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto flex-col gap-2 py-4 hover:border-current transition-colors",
        color
      )}
      asChild
    >
      <Link to={href}>
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </Button>
  );
}

export function QuickAccess() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Accesos Rápidos</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        <QuickAccessButton
          icon={Eye}
          label="Spider"
          href="/app/spider"
          color="text-module-spider hover:text-module-spider"
        />
        <QuickAccessButton
          icon={FileText}
          label="Docket"
          href="/app/docket"
          color="text-module-docket hover:text-module-docket"
        />
        <QuickAccessButton
          icon={Users}
          label="CRM"
          href="/app/crm"
          color="text-module-crm hover:text-module-crm"
        />
        <QuickAccessButton
          icon={ShoppingCart}
          label="Market"
          href="/app/market"
          color="text-module-market hover:text-module-market"
        />
        <QuickAccessButton
          icon={Sparkles}
          label="Genius"
          href="/app/genius"
          color="text-module-genius hover:text-module-genius"
        />
        <QuickAccessButton
          icon={Languages}
          label="Traductor"
          href="/app/genius/translator"
          color="text-module-genius hover:text-module-genius"
        />
        <QuickAccessButton
          icon={Calculator}
          label="Finance"
          href="/app/finance"
          color="text-module-finance hover:text-module-finance"
        />
        <QuickAccessButton
          icon={Mail}
          label="Marketing"
          href="/app/marketing"
          color="text-module-marketing hover:text-module-marketing"
        />
        <QuickAccessButton
          icon={LinkIcon}
          label="IP-Chain"
          href="/app/ip-chain"
          color="text-indigo-500 hover:text-indigo-500"
        />
      </CardContent>
    </Card>
  );
}
