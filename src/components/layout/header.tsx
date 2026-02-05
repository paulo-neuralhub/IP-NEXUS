// =============================================
// COMPONENTE: Header
// Header superior blanco vacío + header inferior azul con saludo/búsqueda/notificaciones/perfil
// =============================================

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
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

// Helper para obtener saludo según hora
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Helper para formatear fecha actual
function getCurrentDate(): string {
  const now = new Date();
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userName = profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Usuario';

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="h-16 px-6 flex items-center justify-between">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-8 w-8 shrink-0 mr-3"
              aria-label="Abrir menú"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Lado izquierdo: Saludo */}
          <div className="hidden sm:block">
            <h2 className="text-slate-800 font-semibold text-base">
              {getGreeting()}, {userName}
            </h2>
            <p className="text-slate-500 text-xs">
              {getCurrentDate()}
            </p>
          </div>

          {/* Lado derecho: Búsqueda + Theme + Notificaciones + Perfil */}
          <div className="flex items-center gap-4 ml-auto">
            
            {/* Búsqueda - Desktop */}
            <div className="hidden md:block">
              <GlobalSearchTrigger className="w-64 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white" />
            </div>
            
            {/* Mobile search button */}
            <div className="md:hidden">
              <GlobalSearchTrigger variant="compact" />
            </div>
            
            {/* Dark Mode Toggle */}
            <ThemeToggle />
            
            {/* Notificaciones */}
            <NotificationBell />

            {/* Separador */}
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-2 hover:bg-slate-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-emerald-400 text-xs text-white font-semibold">
                      {getInitials(profile?.full_name || profile?.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                    {userName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
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
