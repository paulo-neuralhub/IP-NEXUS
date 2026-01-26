import * as React from "react";
import { Outlet } from "react-router-dom";
import { AuthGuard } from "@/components/layout/auth-guard";
import { OrgGuard } from "@/components/layout/org-guard";
import { DynamicSidebar } from "@/components/layout/DynamicSidebar";
import { Header } from "@/components/layout/header";
import { PageProvider } from "@/contexts/page-context";
import { useIsMobile, useNetworkStatus, useViewportHeight } from "@/hooks/use-mobile";
import { MobileBottomNav, OfflineBanner, PWAInstallPrompt } from "@/components/mobile";
import { ContextualHelpProvider } from "@/components/help/ContextualHelpProvider";
import { TrialBanner } from "@/components/upgrade/TrialBanner";
import { NexusGuideButton } from "@/components/nexus-guide";
import { GlobalTimer } from "@/components/timetracking";
import { usePresence } from "@/hooks/use-realtime-collab";
import { PageContainer } from "@/components/layout/PageContainer";
import { SoftphoneWidget } from "@/components/voip/SoftphoneWidget";
import { CallManager } from "@/components/telephony/CallManager";
import { ModuleActivationDialog } from "@/components/modules";
import { DemoBadge } from "@/components/demo";
import { useOrganization } from "@/contexts/organization-context";
import { useIsDemoMode } from "@/hooks/backoffice/useDemoMode";

export function AppLayout() {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  
  // Demo mode check
  const { currentOrganization } = useOrganization();
  const { isDemoMode, config } = useIsDemoMode(currentOrganization?.id);
  
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
                
                {/* Mobile Header (P-UI-03) */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Sidebar - Mobile overlay */}
                {sidebarOpen && (
                  <div className="fixed inset-0 z-50 md:hidden">
                    <button
                      type="button"
                      className="absolute inset-0 bg-foreground/30"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Cerrar menú"
                    />
                    <div className="absolute left-0 top-0 h-full">
                      <DynamicSidebar
                        variant="mobile"
                        collapsed={false}
                        onNavigate={() => setSidebarOpen(false)}
                      />
                    </div>
                  </div>
                )}
                
                {/* Main Content - scrollable */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
                  <PageContainer padding="sm" className="pb-20">
                    <Outlet />
                  </PageContainer>
                </main>
                
                {/* Bottom Navigation with FAB */}
                <MobileBottomNav />
                
                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
                
                {/* Global Timer for mobile */}
                <GlobalTimer />

                {/* Softphone Widget (VoIP) */}
                <SoftphoneWidget />
                
                {/* Demo Badge */}
                {isDemoMode && <DemoBadge prospectCompany={config?.prospect_company} />}
              </div>
            ) : (
              // Desktop Layout
              <div className="min-h-screen bg-background">
                <DynamicSidebar
                  variant="desktop"
                  collapsed={sidebarCollapsed}
                  onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
                />
                <div className={sidebarCollapsed ? "ml-16" : "ml-64"}>
                  <TrialBanner />
                  <Header />
                  <main>
                    <PageContainer padding="md">
                      <Outlet />
                    </PageContainer>
                  </main>
                </div>
                {/* Timer stays floating on mobile; on desktop it's embedded in the sidebar */}
                <NexusGuideButton />

                {/* Softphone Widget (VoIP) */}
                <SoftphoneWidget />
                
                {/* Click-to-Call Manager */}
                <CallManager />
                
                {/* Module Activation Dialog */}
                <ModuleActivationDialog />
                
                {/* Demo Badge */}
                {isDemoMode && <DemoBadge prospectCompany={config?.prospect_company} />}
              </div>
            )}
          </ContextualHelpProvider>
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}