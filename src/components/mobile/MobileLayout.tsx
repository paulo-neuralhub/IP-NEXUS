import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile, useNetworkStatus, useViewportHeight } from '@/hooks/use-mobile';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { OfflineBanner } from './OfflineBanner';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface MobileLayoutProps {
  children: ReactNode;
  hideBottomNav?: boolean;
  hideHeader?: boolean;
  title?: string;
}

export function MobileLayout({ 
  children, 
  hideBottomNav: forceHideBottomNav, 
  hideHeader: forceHideHeader,
  title 
}: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  const location = useLocation();

  useViewportHeight();

  // Rutas que no muestran bottom nav
  const hideBottomNavRoutes = ['/auth', '/onboarding', '/app/menu'];
  const hideBottomNav = forceHideBottomNav || hideBottomNavRoutes.some(path =>
    location.pathname.startsWith(path)
  );

  // Rutas que no muestran header
  const hideHeaderRoutes = ['/auth', '/onboarding'];
  const hideHeader = forceHideHeader || hideHeaderRoutes.some(path =>
    location.pathname.startsWith(path)
  );

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
    >
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}

      {/* Mobile Header */}
      {!hideHeader && <MobileHeader title={title} />}

      {/* Main Content */}
      <main className={`flex-1 ${!hideBottomNav ? 'pb-[72px]' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideBottomNav && <BottomNavigation />}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
