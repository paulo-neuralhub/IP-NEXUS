// ============================================================
// IP-NEXUS HELP - FLOATING HELP BUTTON
// ============================================================

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HelpCircle, 
  X, 
  Book, 
  MessageSquare, 
  Ticket,
  Megaphone,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnreadAnnouncementCount, useActiveIncidents } from '@/hooks/help';
import { cn } from '@/lib/utils';

interface HelpFloatingButtonProps {
  basePath?: string;
  className?: string;
}

export function HelpFloatingButton({ 
  basePath = '/app/help',
  className 
}: HelpFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { data: unreadCount = 0 } = useUnreadAnnouncementCount();
  const { data: incidents } = useActiveIncidents();

  // Don't show on help pages
  if (location.pathname.startsWith(basePath)) {
    return null;
  }

  const menuItems = [
    {
      icon: Book,
      label: 'Centro de ayuda',
      description: 'Guías y documentación',
      href: basePath,
    },
    {
      icon: Ticket,
      label: 'Mis tickets',
      description: 'Ver solicitudes de soporte',
      href: `${basePath}/tickets`,
    },
    {
      icon: MessageSquare,
      label: 'Nuevo ticket',
      description: 'Contactar con soporte',
      href: `${basePath}/tickets/new`,
    },
    {
      icon: Megaphone,
      label: 'Novedades',
      description: 'Últimas actualizaciones',
      href: `${basePath}/announcements`,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const hasIssues = incidents && incidents.length > 0;

  return (
    <div className={cn("fixed bottom-24 right-6 z-50", className)}>
      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-background border border-border rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">¿Necesitas ayuda?</h3>
                <p className="text-sm text-muted-foreground">Estamos aquí para ti</p>
              </div>
            </div>
          </div>

          {/* System status warning */}
          {hasIssues && (
            <div className="p-3 bg-destructive/10 border-b border-destructive/20">
              <p className="text-sm text-destructive flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                Hay incidencias activas en el sistema
              </p>
            </div>
          )}

          {/* Menu items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="p-2 rounded-lg bg-muted">
                  <item.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <p className="text-xs text-center text-muted-foreground">
              ¿No encuentras lo que buscas? {' '}
              <Link 
                to={`${basePath}/tickets/new`} 
                className="text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Contacta con nosotros
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "hover:scale-105 transition-transform",
          isOpen && "bg-muted text-foreground hover:bg-muted"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <HelpCircle className="h-6 w-6" />
        )}
        
        {/* Notification dot */}
        {!isOpen && (unreadCount > 0 || hasIssues) && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-[10px] text-white font-medium">
              {unreadCount > 0 ? unreadCount : '!'}
            </span>
          </span>
        )}
      </Button>
    </div>
  );
}
