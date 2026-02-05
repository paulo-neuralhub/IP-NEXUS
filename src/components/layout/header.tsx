// =============================================
// COMPONENTE: Header
// Header principal con badges de módulos + Dark Mode Toggle
// =============================================

import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { Menu, ChevronDown, Settings, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/notifications";
import { GlobalSearchTrigger } from "@/components/search";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { currentOrganization } = useOrganization();

  // Get plan badge text - check both plan_code and plan fields
  const planBadge = React.useMemo(() => {
    const org = currentOrganization as { plan_code?: string; plan?: string };
    const planValue = org?.plan_code || org?.plan;
    if (!planValue) return 'Free';
    return planValue.charAt(0).toUpperCase() + planValue.slice(1);
  }, [currentOrganization]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex flex-col">
        {/* Barra superior compacta - Solo logo IP-NEXUS */}
        <div className="flex h-10 items-center justify-between px-4 sm:px-6 border-b border-border bg-background-card/95 backdrop-blur supports-[backdrop-filter]:bg-background-card/80 dark:bg-slate-900/95 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#00b4d8] to-[#00d4aa] text-[10px] font-bold text-white shadow-sm">
              IP
            </div>
            <span className="text-sm font-bold text-foreground">IP-NEXUS</span>
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-8 w-8 shrink-0 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Barra inferior azul oscuro - Con búsqueda + notificaciones + perfil */}
        <div className="flex h-12 items-center justify-between gap-3 px-4 sm:px-6 bg-[#334155] dark:bg-slate-800">
          {/* Lado izquierdo: Info contextual */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 hidden sm:inline">
              {planBadge} Plan
            </span>
          </div>

          {/* Centro: Global Search */}
          <div className="hidden flex-1 justify-center md:flex max-w-md mx-auto">
            <GlobalSearchTrigger className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50" />
          </div>

          {/* Lado derecho: Mobile search + Theme + Notifications + User */}
          <div className="flex items-center gap-1.5">
            {/* Mobile search button */}
            <div className="md:hidden">
              <GlobalSearchTrigger variant="compact" />
            </div>
            
            {/* Dark Mode Toggle */}
            <ThemeToggle />
            
            {/* Notifications */}
            <NotificationBell />

            {/* User menu compacto */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-1.5 px-1.5 hover:bg-white/10">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#00b4d8] to-[#00d4aa] text-[10px] text-white">
                      {getInitials(profile?.full_name || profile?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-xs font-medium text-white sm:inline">
                    {profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Usuario'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

