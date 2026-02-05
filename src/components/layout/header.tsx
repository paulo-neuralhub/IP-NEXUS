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

  // En desktop no se muestra nada - los controles están en el Dashboard
  // Solo se muestra en móvil para el botón de menú
  return (
    <TooltipProvider>
      {/* Header solo visible en móvil */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 md:hidden">
        <div className="h-14 px-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-8 w-8 shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>
    </TooltipProvider>
  );
}
