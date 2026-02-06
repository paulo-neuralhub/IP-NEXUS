import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { cn } from "@/lib/utils";
import { MODULE_COLORS } from "@/lib/constants";
import {
  LayoutDashboard, FileText, Database, Radar, Users, Megaphone,
  Globe, Brain, DollarSign, HelpCircle, Settings, LogOut, ChevronDown, Lock, Shield,
  Users2, Bell, MessageSquare, Check, Calendar
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { path: "/app/expedientes", label: "Expedientes", icon: FileText, module: "docket" },
  { path: "/app/calendario", label: "Calendario", icon: Calendar, module: "calendar" },
  { path: "/app/data-hub", label: "Data Hub", icon: Database, module: "datahub" },
  { path: "/app/spider", label: "Spider", icon: Radar, module: "spider" },
  { separator: true },
  { path: "/app/crm", label: "CRM", icon: Users, module: "crm", addon: "crm" },
  { path: "/app/marketing", label: "Marketing", icon: Megaphone, module: "marketing", addon: "marketing" },
  { path: "/app/collab", label: "Colaboración", icon: Users2, module: "collab" },
  { path: "/app/market", label: "Market", icon: Globe, module: "market" },
  { path: "/app/genius", label: "Genius", icon: Brain, module: "genius", addon: "genius" },
  { separator: true },
  { path: "/app/communications", label: "Comunicaciones", icon: MessageSquare, module: "communications" },
  { separator: true },
  { path: "/app/alerts", label: "Alertas IA", icon: Bell, module: "alerts" },
  { path: "/app/finance", label: "Finance", icon: DollarSign, module: "finance" },
  { path: "/app/help", label: "Ayuda", icon: HelpCircle, module: "help" },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentOrganization, hasAddon, memberships, setCurrentOrganization } = useOrganization();

  const handleSwitchOrganization = (membership: typeof memberships[0]) => {
    if (membership.organization) {
      setCurrentOrganization(membership.organization);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 ip-sidebar-gradient flex flex-col z-50">
      {/* Logo + Nombre empresa */}
      <div className="p-4 pb-2">
        <Link to="/app" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg ip-sidebar-accent flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">IP-NEXUS</span>
        </Link>
        
        {/* Nombre empresa */}
        {currentOrganization?.name && (
          <div className="mt-3 silk-company-badge">
            <div className="silk-dot-glow" />
            <span className="text-xs text-white/80 truncate">
              {currentOrganization.name}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto py-2">
        {navItems.map((item, idx) => {
          if (item.separator) {
            return <div key={idx} className="my-2 border-t border-white/10" />;
          }

          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          const moduleColor = MODULE_COLORS[item.module as keyof typeof MODULE_COLORS];
          const isLocked = item.addon && !hasAddon(item.addon);
          const Icon = item.icon!;

          return (
            <Link
              key={item.path}
              to={isLocked ? "#" : item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 my-0.5 text-sm relative",
                isActive
                  ? "silk-menu-active text-slate-800 font-medium"
                  : isLocked
                  ? "text-white/40 cursor-not-allowed rounded-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              {isActive && <span className="silk-accent-bar" />}
              
              <Icon 
                className="h-5 w-5" 
                style={{ color: isActive ? moduleColor : undefined }} 
              />
              <span className="flex-1">{item.label}</span>
              
              {isLocked && <Lock className="h-4 w-4" />}
              {item.addon && !isLocked && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  isActive ? "silk-badge-active" : "silk-badge-inactive"
                )}>
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-2 border-t border-white/10">
        <Link
          to="/app/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm relative",
            location.pathname.startsWith("/app/settings")
              ? "silk-menu-active text-slate-800 font-medium"
              : "text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
          )}
        >
          {location.pathname.startsWith("/app/settings") && (
            <span className="silk-accent-bar" />
          )}
          <Settings className="h-5 w-5" />
          Configuración
        </Link>
      </div>

      {/* User Menu */}
      <div className="p-4 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <div className="silk-avatar">
              {profile?.avatar_url ? (
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-transparent text-xs text-white">
                    {getInitials(profile?.full_name || profile?.email || "U")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                getInitials(profile?.full_name || profile?.email || "U")
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-white truncate">{profile?.full_name || "Usuario"}</p>
              <p className="text-xs text-white/60 truncate">{currentOrganization?.name}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-72 bg-popover">
            <DropdownMenuItem asChild>
              <Link to="/app/settings">Mi perfil</Link>
            </DropdownMenuItem>
            
            {/* Organization Switcher */}
            {memberships.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Cambiar organización ({memberships.length})
                </p>
                <ScrollArea className="max-h-[240px]">
                  {memberships.map((m) => (
                    <DropdownMenuItem 
                      key={m.organization_id}
                      onClick={() => handleSwitchOrganization(m)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-semibold text-primary">
                        {m.organization?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{m.organization?.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {m.organization?.plan || 'free'} • {m.role}
                        </p>
                      </div>
                      {m.organization_id === currentOrganization?.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
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
