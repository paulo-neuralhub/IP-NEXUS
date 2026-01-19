// ============================================================
// IP-NEXUS APP - HELP LAYOUT
// ============================================================

import { Outlet, NavLink } from 'react-router-dom';
import { Book, Ticket, Bell, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadAnnouncementCount } from '@/hooks/help';

const helpNav = [
  { to: '/app/help', icon: Book, label: 'Centro de Ayuda', end: true },
  { to: '/app/help/tickets', icon: Ticket, label: 'Mis Tickets' },
  { to: '/app/help/announcements', icon: Bell, label: 'Novedades' },
];

export default function HelpLayout() {
  const { data: unreadCount = 0 } = useUnreadAnnouncementCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          <HelpCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Centro de Ayuda</h1>
          <p className="text-muted-foreground">
            Encuentra respuestas, contacta con soporte y mantente informado
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 border-b">
        {helpNav.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
            {label === 'Novedades' && unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Content */}
      <Outlet />
    </div>
  );
}
