/**
 * DYNAMIC SIDEBAR
 * Sidebar dinámico que consume get_tenant_sidebar_menu()
 * Organiza módulos en secciones colapsables
 */

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { useSidebarMenu, type SidebarModule, type SidebarSection } from "@/hooks/use-sidebar-menu";
import { usePendingSignaturesCount } from "@/hooks/signatures";
import { useAlertStats } from "@/hooks/usePredictiveAlerts";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Database, Radar, Users, Megaphone,
  Globe, Brain, DollarSign, HelpCircle, Settings, LogOut, ChevronDown, ChevronRight,
  Lock, Shield, ArrowRightLeft, Store, BarChart3, Scale, Sparkles,
  Code, Upload, Wallet, Briefcase, GitBranch, PenTool, Clock, Bell, MessageSquare, 
  Calendar, Folder, FolderKanban, CheckSquare, Phone, Receipt, CreditCard, Coins,
  Eye, FileBarChart, Bot, History, Building2, Handshake, Activity, Cog, ShoppingBag,
  Search, Package, Circle, Puzzle, Columns3, UserPlus, ListTodo, Send, Wrench,
  Users2, KanbanSquare
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DynamicSidebarProps {
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}

// Icon mapping - extensible
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  LayoutDashboard,
  LayoutKanban: KanbanSquare,
  KanbanSquare,
  Columns3,
  Briefcase,
  FileText,
  Database,
  Radar,
  Users,
  UserPlus,
  Users2,
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
  MessageSquare,
  Calendar,
  Folder,
  FolderKanban,
  CheckSquare,
  ListTodo,
  Phone,
  Receipt,
  CreditCard,
  Coins,
  Eye,
  FileBarChart,
  Bot,
  History,
  Building2,
  Handshake,
  Activity,
  Cog,
  ShoppingBag,
  Search,
  Package,
  Circle,
  Puzzle,
  Bell,
  Settings,
  GitBranch,
  Lock,
  Shield,
  Send,
  Wrench,
};

function getIcon(iconName: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  return ICON_MAP[iconName] || Package;
}

export function DynamicSidebar({
  variant = "desktop",
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
}: DynamicSidebarProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentOrganization, memberships, setCurrentOrganization } = useOrganization();
  const { data: sections, isLoading } = useSidebarMenu();
  const { data: pendingSignaturesCount = 0 } = usePendingSignaturesCount();
  const { data: alertStats } = useAlertStats();

  // Expandir/contraer secciones
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(["dashboard", "gestion"]));
  // Expandir/contraer módulos con sub-items
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set(["docket"]));

  // Badge counts map
  const badgeCounts: Record<string, number> = {
    signatures: pendingSignaturesCount,
    alerts: (alertStats?.critical || 0) + (alertStats?.high || 0),
    deadlines: 0, // Se puede conectar a un hook de deadlines próximos
    tasks: 0,
  };

  const otherOrgs = memberships.filter(m => m.organization_id !== currentOrganization?.id);
  
  const switchOrganization = (orgId: string) => {
    const membership = memberships.find(m => m.organization_id === orgId);
    if (membership?.organization) {
      setCurrentOrganization(membership.organization);
    }
  };

  const toggleSection = (sectionCode: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionCode)) {
        next.delete(sectionCode);
      } else {
        next.add(sectionCode);
      }
      return next;
    });
  };

  const toggleModule = (moduleCode: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleCode)) {
        next.delete(moduleCode);
      } else {
        next.add(moduleCode);
      }
      return next;
    });
  };

  // Verificar si un path está activo
  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Renderizar un item de menú de módulo
  const renderMenuItem = (item: { label: string; path: string; icon: string; badge?: string }, moduleColor: string) => {
    const isActive = isPathActive(item.path);
    const Icon = getIcon(item.icon);
    const badgeCount = item.badge ? badgeCounts[item.badge] || 0 : 0;

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-lg text-xs transition-colors",
          collapsed ? "px-2 py-2 justify-center" : "px-3 py-2 ml-6",
          isActive
            ? "bg-sidebar-accent/20 text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: isActive ? moduleColor : undefined }} />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && badgeCount > 0 && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
            {badgeCount}
          </Badge>
        )}
      </Link>
    );
  };

  // Renderizar un módulo
  const renderModule = (mod: SidebarModule) => {
    const Icon = getIcon(mod.moduleIconLucide || mod.moduleIcon);
    const hasSubItems = mod.moduleMenuItems.length > 0;
    const isExpanded = expandedModules.has(mod.moduleCode);
    const mainPath = mod.moduleMenuItems[0]?.path || `/app/${mod.moduleCode}`;
    const isActive = isPathActive(mainPath) || mod.moduleMenuItems.some(item => isPathActive(item.path));
    const iconColor = mod.isLicensed ? mod.moduleColor : "hsl(var(--sidebar-foreground) / 0.35)";

    // Si está bloqueado
    if (!mod.isLicensed) {
      return (
        <Link
          key={mod.moduleCode}
          to={`/pricing?upgrade=${mod.moduleCode}`}
          onClick={onNavigate}
          title={collapsed ? mod.moduleName : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl text-sm transition-colors relative group",
            collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
            "text-sidebar-foreground/40 hover:bg-sidebar-accent/5"
          )}
        >
          <Icon className="h-5 w-5 shrink-0 opacity-60" style={{ color: iconColor }} />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{mod.moduleShortName || mod.moduleName}</span>
              <Lock className="h-4 w-4 shrink-0" />
            </>
          )}
        </Link>
      );
    }

    // Módulo con sub-items
    if (hasSubItems && !collapsed) {
      return (
        <Collapsible
          key={mod.moduleCode}
          open={isExpanded}
          onOpenChange={() => toggleModule(mod.moduleCode)}
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center gap-3 rounded-xl text-sm transition-colors",
                "px-4 py-2.5",
                isActive
                  ? "bg-sidebar-accent/15 text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
              )}
              style={isActive ? { borderLeft: `3px solid ${mod.moduleColor}` } : undefined}
            >
              <Icon 
                className="h-5 w-5 shrink-0" 
                style={{ color: isActive ? mod.moduleColor : iconColor }} 
              />
              <span className="flex-1 truncate text-left">{mod.moduleShortName || mod.moduleName}</span>
              {mod.isTrial && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-yellow-500/50 text-yellow-400">
                  TRIAL
                </Badge>
              )}
              <ChevronRight 
                className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} 
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0.5 py-1">
            {mod.moduleMenuItems.map(item => renderMenuItem(item, mod.moduleColor))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Módulo simple (sin sub-items o collapsed)
    return (
      <Link
        key={mod.moduleCode}
        to={mainPath}
        onClick={onNavigate}
        title={collapsed ? mod.moduleName : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm transition-colors",
          collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
          isActive
            ? "bg-sidebar-accent/15 text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
        )}
        style={isActive ? { borderLeft: `3px solid ${mod.moduleColor}` } : undefined}
      >
        <Icon 
          className="h-5 w-5 shrink-0" 
          style={{ color: isActive ? mod.moduleColor : iconColor }} 
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{mod.moduleShortName || mod.moduleName}</span>
            {mod.isTrial && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-yellow-500/50 text-yellow-400">
                TRIAL
              </Badge>
            )}
            {mod.modulePopular && !mod.isTrial && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                HOT
              </Badge>
            )}
          </>
        )}
      </Link>
    );
  };

  // Renderizar una sección
  const renderSection = (section: SidebarSection) => {
    const isExpanded = expandedSections.has(section.sectionCode);
    const Icon = getIcon(section.sectionIcon);
    const hasModules = section.modules.length > 0;

    // Dashboard section (special case - no header)
    if (section.sectionCode === "dashboard") {
      return (
        <div key={section.sectionCode} className="mb-2">
          {/* Dashboard link directo */}
          <Link
            to="/app/dashboard"
            onClick={onNavigate}
            title={collapsed ? "Dashboard" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl text-sm transition-colors",
              collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
              isPathActive("/app/dashboard")
                ? "bg-sidebar-accent/15 text-sidebar-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
            )}
            style={isPathActive("/app/dashboard") ? { borderLeft: "3px solid #3B82F6" } : undefined}
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" style={{ color: "#3B82F6" }} />
            {!collapsed && <span className="flex-1">Dashboard</span>}
          </Link>
        </div>
      );
    }

    // Sección colapsable con módulos
    return (
      <div key={section.sectionCode} className="mb-1">
        {!collapsed && (
          <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.sectionCode)}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider",
                  "text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{section.sectionLabel || section.sectionName}</span>
                <ChevronDown 
                  className={cn("h-3.5 w-3.5 transition-transform", !isExpanded && "-rotate-90")} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5">
              {hasModules ? section.modules.map(renderModule) : (
                <p className="text-xs text-sidebar-foreground/40 px-4 py-2">Sin módulos</p>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {collapsed && hasModules && (
          <div className="space-y-1">
            {section.modules.map(renderModule)}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "flex flex-col",
        variant === "desktop" ? "fixed left-0 top-0 z-50 h-screen" : "h-full",
        collapsed ? "w-16" : "w-64",
        "ip-sidebar-gradient text-sidebar-foreground",
      )}
    >
      {/* Logo */}
      <div className={cn(collapsed ? "p-4" : "p-6")}>
        <Link to="/app" onClick={onNavigate} className="flex items-center gap-2">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center ip-sidebar-accent")}>
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight">IP-NEXUS</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {sections?.map(renderSection)}
            
            {/* Separator antes de sistema */}
            <div className="my-3 border-t border-white/10" />
            
            {/* Enlaces de utilidad fijos */}
            <Link
              to="/app/alerts"
              onClick={onNavigate}
              title={collapsed ? "Alertas IA" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm transition-colors",
                collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
                isPathActive("/app/alerts")
                  ? "bg-sidebar-accent/15 text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
              )}
            >
              <Bell className="h-5 w-5 shrink-0" style={{ color: "#EF4444" }} />
              {!collapsed && (
                <>
                  <span className="flex-1">Alertas IA</span>
                  {badgeCounts.alerts > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {badgeCounts.alerts}
                    </Badge>
                  )}
                </>
              )}
            </Link>

            <Link
              to="/app/help"
              onClick={onNavigate}
              title={collapsed ? "Ayuda" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm transition-colors",
                collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
                isPathActive("/app/help")
                  ? "bg-sidebar-accent/15 text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
              )}
            >
              <HelpCircle className="h-5 w-5 shrink-0" style={{ color: "#6B7280" }} />
              {!collapsed && <span className="flex-1">Ayuda</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Timer */}
      {!collapsed && (
        <div className="px-3 py-3">
          <GlobalTimer placement="sidebar" />
        </div>
      )}

      {/* Settings */}
      <div className={cn("py-2 border-t border-sidebar-border", collapsed ? "px-2" : "px-3")}>
        <Link
          to="/app/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl text-sm hover:bg-sidebar-accent/10",
            collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
            location.pathname.startsWith("/app/settings")
              ? "bg-sidebar-accent/15 text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && "Configuración"}
        </Link>
      </div>

      {/* Collapse Button */}
      {variant === "desktop" && onToggleCollapsed && (
        <div className={cn("border-t border-sidebar-border", collapsed ? "px-2" : "px-3", "py-2")}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm",
              "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10",
            )}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed && "-rotate-90")} />
            {!collapsed && "Colapsar"}
          </button>
        </div>
      )}

      {/* User Menu */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-4")}>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-xs">
                {getInitials(profile?.full_name || profile?.email || "U")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm truncate">{profile?.full_name || "Usuario"}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{currentOrganization?.name}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
              </>
            )}
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
