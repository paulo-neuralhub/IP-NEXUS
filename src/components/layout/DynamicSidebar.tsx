/**
 * DYNAMIC SIDEBAR
 * PROMPT 50 Phase 4: Sidebar that adapts based on module licenses
 */

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { useOrganizationLicenses } from "@/hooks/use-module-access";
import { usePendingSignaturesCount } from "@/hooks/signatures";
import { useAlertStats } from "@/hooks/usePredictiveAlerts";
import { MODULE_REGISTRY, type ModuleCode } from "@/lib/modules/module-registry";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Database, Radar, Users, Megaphone,
  Globe, Brain, DollarSign, HelpCircle, Settings, LogOut, ChevronDown, 
  Lock, Shield, ArrowRightLeft, Store, BarChart3, Scale, Sparkles,
  Code, Upload, Wallet, Briefcase, GitBranch, PenTool, Clock, Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalTimer } from "@/components/timetracking";

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Briefcase,
  FileText,
  Database,
  Radar,
  Users,
  Megaphone,
  Globe,
  Store,
  Brain,
  Sparkles,
  Wallet,
  DollarSign,
  BarChart3,
  Scale,
  Upload,
  ArrowRightLeft,
  Code,
  HelpCircle,
  PenTool,
  Clock,
};

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  moduleCode: ModuleCode;
  color: string;
  requiresLicense: boolean;
  badgeKey?: string; // Key for dynamic badge count
}

// Core navigation items (always visible)
const CORE_NAV: NavItem[] = [
  {
    path: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    moduleCode: "core",
    color: "#3B82F6",
    requiresLicense: false,
  },
];

// Module-based navigation items
const MODULE_NAV: NavItem[] = [
  {
    path: "/app/docket",
    label: "Docket",
    icon: Briefcase,
    moduleCode: "docket",
    color: MODULE_REGISTRY.docket.color,
    requiresLicense: true,
  },
  {
    path: "/app/data-hub",
    label: "Data Hub",
    icon: Database,
    moduleCode: "datahub",
    color: MODULE_REGISTRY.datahub.color,
    requiresLicense: true,
  },
  {
    path: "/app/spider",
    label: "Spider",
    icon: Radar,
    moduleCode: "spider",
    color: MODULE_REGISTRY.spider.color,
    requiresLicense: true,
  },
  {
    path: "/app/crm",
    label: "CRM",
    icon: Users,
    moduleCode: "crm",
    color: MODULE_REGISTRY.crm.color,
    requiresLicense: true,
  },
  {
    path: "/app/marketing",
    label: "Marketing",
    icon: Megaphone,
    moduleCode: "marketing",
    color: MODULE_REGISTRY.marketing.color,
    requiresLicense: true,
  },
  {
    path: "/app/market",
    label: "Market",
    icon: Store,
    moduleCode: "market",
    color: MODULE_REGISTRY.market.color,
    requiresLicense: true,
  },
  {
    path: "/app/genius",
    label: "Genius",
    icon: Sparkles,
    moduleCode: "genius",
    color: MODULE_REGISTRY.genius.color,
    requiresLicense: true,
  },
  {
    path: "/app/finance",
    label: "Finance",
    icon: Wallet,
    moduleCode: "finance",
    color: MODULE_REGISTRY.finance.color,
    requiresLicense: true,
  },
  {
    path: "/app/timetracking",
    label: "Tiempo",
    icon: Clock,
    moduleCode: "finance", // Uses finance module access
    color: "#06B6D4",
    requiresLicense: true,
  },
  {
    path: "/app/legal-ops",
    label: "Legal Ops",
    icon: Scale,
    moduleCode: "legalops",
    color: MODULE_REGISTRY.legalops.color,
    requiresLicense: true,
  },
  {
    path: "/app/legal-ops/signatures",
    label: "Firmas",
    icon: PenTool,
    moduleCode: "legalops",
    color: "#10B981",
    requiresLicense: true,
    badgeKey: "pendingSignatures",
  },
  {
    path: "/app/workflow",
    label: "Workflow",
    icon: GitBranch,
    moduleCode: "core",
    color: "#06B6D4",
    requiresLicense: false,
  },
];

// Utility items (always visible)
const UTILITY_NAV: NavItem[] = [
  {
    path: "/app/alerts",
    label: "Alertas IA",
    icon: Bell,
    moduleCode: "core",
    color: "#EF4444",
    requiresLicense: false,
    badgeKey: "predictiveAlerts",
  },
  {
    path: "/app/migrator",
    label: "Migrator",
    icon: ArrowRightLeft,
    moduleCode: "migrator",
    color: MODULE_REGISTRY.migrator.color,
    requiresLicense: false,
  },
  {
    path: "/app/help",
    label: "Ayuda",
    icon: HelpCircle,
    moduleCode: "core",
    color: "#6B7280",
    requiresLicense: false,
  },
];

export function DynamicSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentOrganization, memberships, setCurrentOrganization } = useOrganization();
  const { data: licenses, isLoading } = useOrganizationLicenses();
  const { data: pendingSignaturesCount = 0 } = usePendingSignaturesCount();
  const { data: alertStats } = useAlertStats();

  // Badge counts map
  const badgeCounts: Record<string, number> = {
    pendingSignatures: pendingSignaturesCount,
    predictiveAlerts: (alertStats?.critical || 0) + (alertStats?.high || 0),
  };

  const otherOrgs = memberships.filter(m => m.organization_id !== currentOrganization?.id);
  
  const switchOrganization = (orgId: string) => {
    const membership = memberships.find(m => m.organization_id === orgId);
    if (membership?.organization) {
      setCurrentOrganization(membership.organization);
    }
  };

  // Check if user has access to a module
  const hasModuleAccess = (moduleCode: ModuleCode): boolean => {
    if (!licenses) return false;
    return licenses.some(l => l.module_code === moduleCode);
  };

  // Get license info for a module
  const getModuleLicense = (moduleCode: ModuleCode) => {
    return licenses?.find(l => l.module_code === moduleCode);
  };

  // Render a navigation item
  const renderNavItem = (item: NavItem, idx: number) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
    const hasAccess = !item.requiresLicense || hasModuleAccess(item.moduleCode);
    const license = getModuleLicense(item.moduleCode);
    const isTrialing = license?.trial_ends_at !== null && license?.trial_ends_at !== undefined;
    const Icon = item.icon;
    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;

    const iconColor = hasAccess ? item.color : "hsl(var(--sidebar-foreground) / 0.35)";

    return (
      <Link
        key={item.path}
        to={hasAccess ? item.path : `/pricing?upgrade=${item.moduleCode}`}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors relative group",
          isActive
            ? "bg-white/15 text-white"
            : hasAccess
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-white/40 hover:bg-white/5"
        )}
        style={isActive ? { borderLeft: `3px solid ${item.color}` } : undefined}
      >
        <Icon 
          className={cn(
            "h-5 w-5 shrink-0 transition-opacity",
            hasAccess
              ? isActive
                ? "opacity-100"
                : "opacity-90 group-hover:opacity-100"
              : "opacity-70"
          )}
          style={{ color: iconColor }}
        />
        <span className="flex-1 truncate">{item.label}</span>
        
        {!hasAccess && (
          <Lock className="h-4 w-4 shrink-0" />
        )}
        
        {/* Dynamic badge count (e.g., pending signatures) */}
        {hasAccess && badgeCount > 0 && (
          <Badge 
            variant="destructive" 
            className="text-[10px] px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center"
          >
            {badgeCount}
          </Badge>
        )}
        
        {hasAccess && isTrialing && (
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-400"
          >
            TRIAL
          </Badge>
        )}
        
        {hasAccess && license?.tier_code === 'pro' && !isTrialing && (
          <Badge 
            variant="secondary" 
            className="text-[10px] px-1.5 py-0"
          >
            PRO
          </Badge>
        )}
        
        {/* Removed ENT badge to reduce visual noise */}

        {/* Tooltip on hover for locked modules */}
        {!hasAccess && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-popover border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-muted-foreground">Click para desbloquear</p>
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6">
        <Link to="/app" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-white">IP-NEXUS</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {/* Core navigation */}
            {CORE_NAV.map(renderNavItem)}
            
            {/* Separator */}
            <div className="my-3 border-t border-white/10" />
            
            {/* Module navigation */}
            {MODULE_NAV.map(renderNavItem)}
            
            {/* Separator */}
            <div className="my-3 border-t border-white/10" />
            
            {/* Utility navigation */}
            {UTILITY_NAV.map(renderNavItem)}
          </>
        )}
      </nav>

      {/* Timer (placed below Help and above Settings to avoid overlapping floating widgets) */}
      <div className="px-3 py-3">
        <GlobalTimer placement="sidebar" />
      </div>

      {/* Settings */}
      <div className="px-3 py-2 border-t border-white/10">
        <Link
          to="/app/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white",
            location.pathname.startsWith("/app/settings") && "bg-white/15 text-white"
          )}
        >
          <Settings className="h-5 w-5" />
          Configuración
        </Link>
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-xs">
                {getInitials(profile?.full_name || profile?.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-white truncate">{profile?.full_name || "Usuario"}</p>
              <p className="text-xs text-white/60 truncate">{currentOrganization?.name}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/app/settings">Mi perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings/billing">Suscripción</Link>
            </DropdownMenuItem>
            {otherOrgs.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <p className="px-2 py-1 text-xs text-muted-foreground">Cambiar organización</p>
                {otherOrgs.map((m) => (
                  <DropdownMenuItem 
                    key={m.organization_id}
                    onClick={() => switchOrganization(m.organization_id)}
                  >
                    {m.organization?.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
