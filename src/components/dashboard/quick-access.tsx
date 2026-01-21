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
  fullWidth?: boolean;
  density?: 'default' | 'compact';
}

function QuickAccessButton({
  icon: Icon,
  label,
  href,
  color,
  fullWidth,
  density = 'default',
}: QuickAccessButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto flex-col gap-2 bg-background hover:bg-warning/10 hover:border-current transition-colors",
        density === 'compact'
          ? "py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          : "py-4",
        fullWidth && "w-full",
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

export function QuickAccess({ variant = 'card' }: { variant?: 'card' | 'bar' }) {
  const content = (
    <div className={cn(
      "grid gap-2",
      variant === 'bar' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-9" : "grid-cols-3"
    )}>
      <QuickAccessButton
        icon={Eye}
        label="Spider"
        href="/app/spider"
        color="text-module-spider hover:text-module-spider"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={FileText}
        label="Docket"
        href="/app/docket"
        color="text-module-docket hover:text-module-docket"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={Users}
        label="CRM"
        href="/app/crm"
        color="text-module-crm hover:text-module-crm"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={ShoppingCart}
        label="Market"
        href="/app/market"
        color="text-module-market hover:text-module-market"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={Sparkles}
        label="Genius"
        href="/app/genius"
        color="text-module-genius hover:text-module-genius"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={Languages}
        label="Traductor"
        href="/app/genius/translator"
        color="text-module-genius hover:text-module-genius"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={Calculator}
        label="Finance"
        href="/app/finance"
        color="text-module-finance hover:text-module-finance"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={Mail}
        label="Marketing"
        href="/app/marketing"
        color="text-module-marketing hover:text-module-marketing"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
      <QuickAccessButton
        icon={LinkIcon}
        label="IP-Chain"
        href="/app/ip-chain"
        color="text-primary hover:text-primary"
        fullWidth={variant === 'bar'}
        density={variant === 'bar' ? 'compact' : 'default'}
      />
    </div>
  );

  if (variant === 'bar') {
    return (
      <section aria-label="Accesos rápidos" className="w-full">
        {content}
      </section>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Accesos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
