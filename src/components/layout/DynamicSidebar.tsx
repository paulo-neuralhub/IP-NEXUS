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
import { CompactTimerBadge } from "@/components/timetracking/CompactTimerBadge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/** Tongue connector decorative divs — replaces pseudo-elements for debuggability */
const TongueCurves = ({ hideBottom = false }: { hideBottom?: boolean }) => (
  <>
    <div className="silk-curve-top" />
    {!hideBottom && <div className="silk-curve-bottom" />}
    <span className="silk-accent-bar" />
  </>
);

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

  // Auto-expand modules and sections when a child route is active
  React.useEffect(() => {
    if (!sections) return;
    sections.forEach(section => {
      section.modules.forEach(mod => {
        if (mod.moduleMenuItems.length > 0) {
          const isModActive = mod.moduleMenuItems.some(item => isPathActive(item.path));
          if (isModActive) {
            setExpandedModules(prev => {
              if (prev.has(mod.moduleCode)) return prev;
              const next = new Set(prev);
              next.add(mod.moduleCode);
              return next;
            });
            setExpandedSections(prev => {
              if (prev.has(section.sectionCode)) return prev;
              const next = new Set(prev);
              next.add(section.sectionCode);
              return next;
            });
          }
        }
      });
    });
  }, [location.pathname, sections]);

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

  // Renderizar un item de menú de módulo (sub-item)
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
          // SILK: Sub-item styling
          "flex items-center gap-2 text-[11px] transition-colors",
          collapsed ? "px-2 py-2 justify-center rounded-xl" : "py-[7px] px-3 ml-[26px] rounded-lg",
          isActive
            ? "text-white font-semibold bg-white/10"
            : "text-white/[0.28] hover:text-white/50"
        )}
      >
        <Icon 
          className="h-[9px] w-[9px] shrink-0" 
          style={{ color: isActive ? '#00b4d8' : undefined }} 
        />
        {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
        {!collapsed && badgeCount > 0 && (
          <span className={isActive ? "silk-badge-active" : "silk-badge-inactive"}>
            {badgeCount}
          </span>
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

    // Si está bloqueado
    if (!mod.isLicensed) {
      return (
        <Link
          key={mod.moduleCode}
          to={`/pricing?upgrade=${mod.moduleCode}`}
          onClick={onNavigate}
          title={collapsed ? mod.moduleName : undefined}
          className={cn(
            // SILK: Item inactivo bloqueado
            "flex items-center gap-3 text-[13px] transition-colors relative z-[1]",
            collapsed ? "px-3 py-3 justify-center rounded-xl" : "px-3 py-[10px] rounded-xl mr-4",
            "text-white/[0.28] hover:text-white/40"
          )}
        >
          <Icon className="h-3 w-3 shrink-0 opacity-60" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate font-normal">{mod.moduleShortName || mod.moduleName}</span>
              <Lock className="h-3 w-3 shrink-0" />
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
          className="silk-sidebar-collapsible"
        >
          {/* Tongue target: ONLY the trigger button gets silk-menu-active */}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                // SILK: Item con tongue connector si activo
                "w-full flex items-center gap-3 text-[13px] transition-colors relative",
                "py-[10px] px-3",
                isActive
                  ? cn("silk-menu-active text-[#0a2540] font-bold", isExpanded && "silk-tongue-no-bottom")
                  : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl mr-4"
              )}
            >
              {isActive && <TongueCurves hideBottom={isExpanded} />}
              <Icon 
                className="h-3 w-3 shrink-0" 
                style={isActive ? { 
                  color: '#00b4d8',
                  filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.30))'
                } : { color: 'rgba(255,255,255,0.28)' }} 
              />
              <span className="flex-1 truncate text-left">{mod.moduleShortName || mod.moduleName}</span>
              {mod.isTrial && (
                <span className="silk-badge-inactive text-[9px]">TRIAL</span>
              )}
              <ChevronRight 
                className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} 
              />
            </button>
          </CollapsibleTrigger>
          {/* Sub-items: OUTSIDE the silk-menu-active element, with relative positioning to not overlap curves */}
          <CollapsibleContent className="space-y-0.5 py-1 relative z-[5]">
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
          // SILK: Item con tongue connector si activo
          "flex items-center gap-3 text-[13px] transition-colors relative",
          collapsed ? "px-3 py-3 justify-center" : "py-[10px] px-3",
          isActive
            ? "silk-menu-active text-[#0a2540] font-bold"
            : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl mr-4 z-[1]"
        )}
      >
        {isActive && <TongueCurves />}
        <Icon 
          className="h-3 w-3 shrink-0" 
          style={isActive ? { 
            color: '#00b4d8',
            filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.30))'
          } : { color: 'rgba(255,255,255,0.28)' }} 
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{mod.moduleShortName || mod.moduleName}</span>
            {mod.isTrial && (
              <span className="silk-badge-inactive text-[9px]">TRIAL</span>
            )}
            {mod.modulePopular && !mod.isTrial && (
              <span className="silk-badge-inactive text-[9px]">HOT</span>
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
      const isDashboardActive = isPathActive("/app/dashboard");
      return (
        <div key={section.sectionCode} className="mb-2">
          <Link
            to="/app/dashboard"
            onClick={onNavigate}
            title={collapsed ? "Dashboard" : undefined}
            className={cn(
              // SILK: Dashboard item with tongue connector
              "flex items-center gap-3 text-[13px] transition-colors relative",
              collapsed ? "px-3 py-3 justify-center" : "py-[10px] px-3",
              isDashboardActive
                ? "silk-menu-active text-[#0a2540] font-bold"
                : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl mr-4 z-[1]"
            )}
          >
            {isDashboardActive && <TongueCurves />}
            <LayoutDashboard 
              className="h-3 w-3 shrink-0" 
              style={isDashboardActive ? { 
                color: '#00b4d8',
                filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.30))'
              } : { color: 'rgba(255,255,255,0.28)' }} 
            />
            {!collapsed && <span className="flex-1">Dashboard</span>}
          </Link>
        </div>
      );
    }

    // Sección colapsable con módulos
    return (
      <div key={section.sectionCode} className="mb-1">
        {!collapsed && (
          <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.sectionCode)} className="silk-sidebar-collapsible">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  // SILK: Section header
                  "w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider",
                  "text-white/[0.28] hover:text-white/40 transition-colors"
                )}
              >
                <Icon className="h-3 w-3" />
                <span className="flex-1 text-left">{section.sectionLabel || section.sectionName}</span>
                <ChevronDown 
                  className={cn("h-3 w-3 transition-transform", !isExpanded && "-rotate-90")} 
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-[1px]" style={{ overflow: 'visible' }}>
              {hasModules ? section.modules.map(renderModule) : (
                <p className="text-[11px] text-white/[0.28] px-4 py-2">Sin módulos</p>
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
        // SILK: Width 230px, sin padding-right
        collapsed ? "w-16" : "w-[230px] min-w-[230px]",
        "ip-sidebar-gradient text-white",
        // SILK: Padding especial sin padding-right
        collapsed ? "pt-[22px] pb-[18px] pl-4" : "pt-[22px] pb-[18px] pl-4 pr-0",
      )}
    >
      {/* SILK: Logo + Badge empresa */}
      <div className={cn("mb-7", collapsed ? "px-0" : "px-2")}>
        <Link to="/app" onClick={onNavigate} className="flex items-center gap-2">
          {/* SILK: Icono IP */}
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center ip-sidebar-accent">
            <span className="text-[13px] font-extrabold text-white tracking-[-1px]">IP</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white tracking-[0.5px]">IP-NEXUS</span>
              <span className="text-[8px] font-medium text-white/[0.28] tracking-[2.5px]">PLATAFORMA IP</span>
            </div>
          )}
        </Link>
        
        {/* SILK: Badge empresa */}
        {!collapsed && currentOrganization && (
          <div className="silk-company-badge mt-3">
            <span className="silk-dot-glow" />
            <span className="text-[9px] font-semibold text-white/50 tracking-[1.5px] uppercase truncate">
              {currentOrganization.name}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto overflow-x-visible", collapsed ? "px-2" : "pr-0")}>
        {isLoading ? (
          <div className="space-y-2 pr-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {sections?.map(renderSection)}
            
            {/* SILK: Separator */}
            <div className="my-3 mr-4 border-t border-white/[0.04]" />
            
            {/* SILK: Enlaces de utilidad fijos */}
            {(() => {
              const isAlertsActive = isPathActive("/app/alerts");
              return (
                <Link
                  to="/app/alerts"
                  onClick={onNavigate}
                  title={collapsed ? "Alertas IA" : undefined}
                  className={cn(
                    "flex items-center gap-3 text-[13px] transition-colors relative",
                    collapsed ? "px-3 py-3 justify-center" : "py-[10px] px-3",
                    isAlertsActive
                      ? "silk-menu-active text-[#0a2540] font-bold"
                      : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl mr-4 z-[1]"
                  )}
                >
                  {isAlertsActive && <TongueCurves />}
                  <Bell 
                    className="h-3 w-3 shrink-0" 
                    style={isAlertsActive ? { 
                      color: '#ef4444',
                      filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.30))'
                    } : { color: 'rgba(255,255,255,0.28)' }} 
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Alertas IA</span>
                      {badgeCounts.alerts > 0 && (
                        <span className="silk-badge-active bg-destructive">{badgeCounts.alerts}</span>
                      )}
                    </>
                  )}
                </Link>
              );
            })()}

            {(() => {
              const isHelpActive = isPathActive("/app/help");
              return (
                <Link
                  to="/app/help"
                  onClick={onNavigate}
                  title={collapsed ? "Ayuda" : undefined}
                  className={cn(
                    "flex items-center gap-3 text-[13px] transition-colors relative",
                    collapsed ? "px-3 py-3 justify-center" : "py-[10px] px-3",
                    isHelpActive
                      ? "silk-menu-active text-[#0a2540] font-bold"
                      : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl mr-4 z-[1]"
                  )}
                >
                  {isHelpActive && <TongueCurves />}
                  <HelpCircle 
                    className="h-3 w-3 shrink-0" 
                    style={isHelpActive ? { 
                      color: '#00b4d8',
                      filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.30))'
                    } : { color: 'rgba(255,255,255,0.28)' }} 
                  />
                  {!collapsed && <span className="flex-1">Ayuda</span>}
                </Link>
              );
            })()}
          </>
        )}
      </nav>

      {/* Compact Timer Badge */}
      {!collapsed && (
        <div className="px-3 py-2">
          <CompactTimerBadge />
        </div>
      )}

      {/* SILK: Settings */}
      <div className={cn("py-2", collapsed ? "px-2" : "pr-4")}>
        {(() => {
          const isSettingsActive = location.pathname.startsWith("/app/settings");
          return (
            <Link
              to="/app/settings"
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 text-[13px] transition-colors relative",
                collapsed ? "px-3 py-3 justify-center" : "py-[10px] px-3",
                isSettingsActive
                  ? "silk-menu-active text-[#0a2540] font-bold"
                  : "text-white/[0.48] font-normal hover:text-white/70 rounded-xl z-[1]"
              )}
            >
              {isSettingsActive && <TongueCurves />}
              <Settings 
                className="h-3 w-3" 
                style={isSettingsActive ? { 
                  color: '#00b4d8',
                  filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.30))'
                } : { color: 'rgba(255,255,255,0.28)' }}
              />
              {!collapsed && "Configuración"}
            </Link>
          );
        })()}
      </div>

      {/* SILK: Collapse Button */}
      {variant === "desktop" && onToggleCollapsed && (
        <div className={cn(collapsed ? "px-2" : "pr-4", "py-2 border-t border-white/[0.04]")}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px]",
              "text-white/[0.48] hover:text-white/70",
            )}
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", collapsed && "-rotate-90")} />
            {!collapsed && "Colapsar"}
          </button>
        </div>
      )}

      {/* SILK: User Menu */}
      <div className={cn("border-t border-white/[0.04]", collapsed ? "p-2" : "p-4 pr-4")}>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            {/* SILK: Avatar con gradiente */}
            <div className="silk-avatar">
              {getInitials(profile?.full_name || profile?.email || "U")}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{profile?.full_name || "Usuario"}</p>
                  <p className="text-[9px] text-white/[0.25] truncate">{currentOrganization?.name}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-white/[0.28]" />
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
