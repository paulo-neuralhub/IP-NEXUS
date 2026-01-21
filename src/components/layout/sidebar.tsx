import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { cn } from "@/lib/utils";
import { MODULE_COLORS } from "@/lib/constants";
import {
  LayoutDashboard, FileText, Database, Radar, Users, Megaphone,
  Globe, Brain, DollarSign, HelpCircle, Settings, LogOut, ChevronDown, Lock, Shield,
  Users2, Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

const navItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { path: "/app/docket", label: "Docket", icon: FileText, module: "docket" },
  { path: "/app/data-hub", label: "Data Hub", icon: Database, module: "datahub" },
  { path: "/app/spider", label: "Spider", icon: Radar, module: "spider" },
  { separator: true },
  { path: "/app/crm", label: "CRM", icon: Users, module: "crm", addon: "crm" },
  { path: "/app/marketing", label: "Marketing", icon: Megaphone, module: "marketing", addon: "marketing" },
  { path: "/app/collab", label: "Colaboración", icon: Users2, module: "collab" },
  { path: "/app/market", label: "Market", icon: Globe, module: "market" },
  { path: "/app/genius", label: "Genius", icon: Brain, module: "genius", addon: "genius" },
  { separator: true },
  { path: "/app/alerts", label: "Alertas IA", icon: Bell, module: "alerts" },
  { path: "/app/finance", label: "Finance", icon: DollarSign, module: "finance" },
  { path: "/app/help", label: "Ayuda", icon: HelpCircle, module: "help" },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { currentOrganization, hasAddon, memberships } = useOrganization();

  const otherOrgs = memberships.filter(m => m.organization_id !== currentOrganization?.id);

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
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors relative",
                isActive
                  ? "bg-white/15 text-white"
                  : isLocked
                  ? "text-white/40 cursor-not-allowed"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              style={isActive ? { borderLeft: `3px solid ${moduleColor}` } : undefined}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className="h-5 w-5" style={{ color: isActive ? moduleColor : undefined }} />
              <span className="flex-1">{item.label}</span>
              {isLocked && <Lock className="h-4 w-4" />}
              {item.addon && !isLocked && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">PRO</Badge>
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
            {otherOrgs.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <p className="px-2 py-1 text-xs text-muted-foreground">Cambiar organización</p>
                {otherOrgs.map((m) => (
                  <DropdownMenuItem key={m.organization_id}>
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
