import { Outlet } from "react-router-dom";
import { AuthGuard } from "@/components/layout/auth-guard";
import { OrgGuard } from "@/components/layout/org-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageProvider } from "@/contexts/page-context";
import { useIsMobile, useNetworkStatus, useViewportHeight } from "@/hooks/use-mobile";
import { BottomNavigation, MobileHeader, OfflineBanner, PWAInstallPrompt } from "@/components/mobile";
import { ContextualHelpProvider } from "@/components/help/ContextualHelpProvider";

export function AppLayout() {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  
  // Adjust viewport height for mobile
  useViewportHeight();

  return (
    <AuthGuard>
      <OrgGuard>
        <PageProvider>
          <ContextualHelpProvider>
            {isMobile ? (
              // Mobile Layout
              <div 
                className="min-h-screen flex flex-col bg-background" 
                style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
              >
                {!isOnline && <OfflineBanner />}
                <MobileHeader />
                <main className="flex-1 pb-[72px] overflow-auto">
                  <Outlet />
                </main>
                <BottomNavigation />
                <PWAInstallPrompt />
              </div>
            ) : (
              // Desktop Layout
              <div className="min-h-screen bg-background">
                <Sidebar />
                <div className="ml-64">
                  <Header />
                  <main className="p-6">
                    <Outlet />
                  </main>
                </div>
              </div>
            )}
          </ContextualHelpProvider>
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}