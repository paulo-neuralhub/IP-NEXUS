// =============================================
// COMPONENTE: Header
// Header principal con badges de módulos
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
import { ModuleBadgesRow } from "@/components/modules/ModuleBadgesRow";
import { NotificationBell } from "@/components/notifications";
import { GlobalSearchTrigger } from "@/components/search";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { currentOrganization } = useOrganization();

  // Get plan badge text
  const planBadge = React.useMemo(() => {
    const planCode = (currentOrganization as { plan_code?: string })?.plan_code;
    if (!planCode) return 'Free';
    return planCode.charAt(0).toUpperCase() + planCode.slice(1);
  }, [currentOrganization]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex flex-col border-b border-border bg-background-card/95 backdrop-blur supports-[backdrop-filter]:bg-background-card/80">
        {/* Main row */}
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Mobile menu + Tenant info */}
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9 shrink-0 md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex min-w-0 items-center gap-2.5">
              {/* Tenant avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                {currentOrganization?.name?.charAt(0) || 'IP'}
              </div>

              {/* Tenant name + plan */}
              <div className="hidden min-w-0 flex-col sm:flex">
                <span className="truncate text-sm font-semibold text-foreground">
                  {currentOrganization?.name || 'IP-NEXUS'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {planBadge}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearchTrigger className="max-w-md" />
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            {/* Mobile search button */}
            <div className="md:hidden">
              <GlobalSearchTrigger variant="compact" />
            </div>
            
            {/* Notifications */}
            <NotificationBell />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                      {getInitials(profile?.full_name || profile?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-foreground sm:inline">
                    {profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Usuario'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

        {/* Module badges row */}
        <ModuleBadgesRow />
      </header>
    </TooltipProvider>
  );
}

