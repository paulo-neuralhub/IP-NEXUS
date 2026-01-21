import { Outlet } from "react-router-dom";
import { AuthGuard } from "@/components/layout/auth-guard";
import { OrgGuard } from "@/components/layout/org-guard";
import { DynamicSidebar } from "@/components/layout/DynamicSidebar";
import { Header } from "@/components/layout/header";
import { PageProvider } from "@/contexts/page-context";
import { useIsMobile, useNetworkStatus, useViewportHeight } from "@/hooks/use-mobile";
import { MobileBottomNav, MobileHeader, OfflineBanner, PWAInstallPrompt } from "@/components/mobile";
import { ContextualHelpProvider } from "@/components/help/ContextualHelpProvider";
import { TrialBanner } from "@/components/upgrade/TrialBanner";
import { NexusGuideButton } from "@/components/nexus-guide";
import { GlobalTimer } from "@/components/timetracking";
import { usePresence } from "@/hooks/use-realtime-collab";

export function AppLayout() {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  
  // Track user presence for real-time collaboration
  usePresence();
  
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
                className="h-screen-mobile flex flex-col bg-background overflow-hidden"
              >
                {/* Offline Banner */}
                {!isOnline && <OfflineBanner />}
                
                {/* Mobile Header */}
                <MobileHeader />
                
                {/* Main Content - scrollable */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
                  <div className="px-4 py-4 pb-20">
                    <Outlet />
                  </div>
                </main>
                
                {/* Bottom Navigation with FAB */}
                <MobileBottomNav />
                
                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
                
                {/* Global Timer for mobile */}
                <GlobalTimer />
              </div>
            ) : (
              // Desktop Layout
              <div className="min-h-screen bg-background">
                <DynamicSidebar />
                <div className="ml-64">
                  <TrialBanner />
                  <Header />
                  <main className="p-6">
                    <Outlet />
                  </main>
                </div>
                {/* Timer stays floating on mobile; on desktop it's embedded in the sidebar */}
                <NexusGuideButton />
              </div>
            )}
          </ContextualHelpProvider>
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}