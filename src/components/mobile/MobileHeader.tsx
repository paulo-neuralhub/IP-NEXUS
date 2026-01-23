import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  className?: string;
}

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/docket': 'Docket',
  '/app/docket/deadlines': 'Plazos',
  '/app/contacts': 'Contactos',
  '/app/crm': 'CRM',
  '/app/spider': 'Spider',
  '/app/finance': 'Finance',
  '/app/genius': 'Genius',
  '/app/data-hub': 'Data Hub',
  '/app/market': 'Market',
  '/app/marketing': 'Marketing',
  '/app/communications': 'Comunicaciones',
  '/app/communications/whatsapp': 'WhatsApp',
  '/app/communications/email': 'Email',
  '/app/help': 'Ayuda',
  '/app/search': 'Buscar',
  '/app/settings': 'Ajustes',
  '/app/menu': 'Menú',
};

export function MobileHeader({ 
  title,
  showBack,
  rightContent,
  className 
}: MobileHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if back should be shown
  const canGoBack = showBack ?? (
    location.pathname !== '/app/dashboard' && 
    location.pathname !== '/app' &&
    location.pathname !== '/'
  );

  // Get page title
  const pageTitle = title || PAGE_TITLES[location.pathname] || 'IP-NEXUS';

  return (
    <header 
      className={cn(
        'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border',
        className
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center gap-2 min-w-[48px]">
          {canGoBack ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">IP</span>
              </div>
            </div>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="font-semibold text-base truncate max-w-[50%]">
          {pageTitle}
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-1 min-w-[48px] justify-end">
          {rightContent || (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/app/notifications')}
                className="h-10 w-10"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/app/settings/profile')}
                className="h-10 w-10"
              >
                <User className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
