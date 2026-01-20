import { Outlet } from "react-router-dom";
import { AuthGuard } from "@/components/layout/auth-guard";
import { OrgGuard } from "@/components/layout/org-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageProvider } from "@/contexts/page-context";
import { useIsMobile, useNetworkStatus, useViewportHeight } from "@/hooks/use-mobile";
import { BottomNavigation, MobileHeader, OfflineBanner, PWAInstallPrompt } from "@/components/mobile";

export function AppLayout() {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  
  // Adjust viewport height for mobile
  useViewportHeight();

  return (
    <AuthGuard>
      <OrgGuard>
        <PageProvider>
          {isMobile ? (
            // Mobile Layout
            <div 
              className="min-h-screen flex flex-col bg-background" 
              style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
            >
              {/* Offline Banner */}
              {!isOnline && <OfflineBanner />}
              
              {/* Mobile Header */}
              <MobileHeader />
              
              {/* Main Content */}
              <main className="flex-1 pb-[72px] overflow-auto">
                <Outlet />
              </main>
              
              {/* Bottom Navigation */}
              <BottomNavigation />
              
              {/* PWA Install Prompt */}
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
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}