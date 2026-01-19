// ============================================================
// IP-NEXUS BACKOFFICE - HELP MANAGEMENT LAYOUT
// ============================================================

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Book, 
  FolderOpen, 
  Ticket, 
  Megaphone, 
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/backoffice/help', icon: BarChart3, label: 'Dashboard', end: true },
  { href: '/backoffice/help/articles', icon: Book, label: 'Artículos' },
  { href: '/backoffice/help/categories', icon: FolderOpen, label: 'Categorías' },
  { href: '/backoffice/help/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/backoffice/help/announcements', icon: Megaphone, label: 'Anuncios' },
  { href: '/backoffice/help/status', icon: AlertTriangle, label: 'Estado Sistema' },
];

export default function HelpBackofficeLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Ayuda</h1>
          <p className="text-muted-foreground">
            Administra artículos, tickets y comunicaciones
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-1 border-b border-border overflow-x-auto pb-px">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                "border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Content */}
      <Outlet />
    </div>
  );
}
