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
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { NexusGuideButton } from "@/components/nexus-guide";
import { GlobalTimer } from "@/components/timetracking";
import { usePresence } from "@/hooks/use-realtime-collab";
import { PageContainer } from "@/components/layout/PageContainer";
import { SoftphoneWidget } from "@/components/voip/SoftphoneWidget";
import { CallManager } from "@/components/telephony/CallManager";
import { ModuleActivationDialog } from "@/components/modules";
import { DemoTourNavigator, DemoScreenAnnotation } from "@/components/demo";
import { useOrganization } from "@/contexts/organization-context";
import { useIsDemoMode } from "@/hooks/backoffice/useDemoMode";
import { SuperAdminBar } from "@/components/super-admin";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

export function AppLayout() {
  const isMobile = useIsMobile();
  const { isOnline } = useNetworkStatus();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [annotationActive, setAnnotationActive] = React.useState(false);
  
  // Super Admin check
  const { isSuperAdmin } = useSuperAdmin();
  
  // Demo mode check - detectar por config O por slug "demo-*"
  const { currentOrganization } = useOrganization();
  const { isDemoMode, config } = useIsDemoMode(currentOrganization?.id, currentOrganization?.slug);
  
  // Track user presence for real-time collaboration
  usePresence();
  
  // Adjust viewport height for mobile
  useViewportHeight();
  
  // Offset for super admin bar (40px)
  const superAdminOffset = isSuperAdmin ? 'pt-10' : '';

  return (
    <AuthGuard>
      <OrgGuard>
        <PageProvider>
          <ContextualHelpProvider>
            {/* Super Admin Bar - Always on top */}
            <SuperAdminBar />
            
            {isMobile ? (
              // Mobile Layout
              <div 
                className={`h-screen-mobile flex flex-col bg-background overflow-hidden ${superAdminOffset}`}
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
                
                {/* Demo Mode Components */}
                {isDemoMode && (
                  <>
                    <DemoTourNavigator 
                      onToggleAnnotation={() => setAnnotationActive(v => !v)}
                      isAnnotationActive={annotationActive}
                    />
                    <DemoScreenAnnotation 
                      isActive={annotationActive} 
                      onClose={() => setAnnotationActive(false)} 
                    />
                  </>
                )}
              </div>
            ) : (
              // SILK Desktop Shell
              <div 
                className={`min-h-screen ${superAdminOffset}`}
                style={{
                  background: 'linear-gradient(180deg, #f1f4f9, #ebeef5)',
                }}
              >
                <DynamicSidebar
                  variant="desktop"
                  collapsed={sidebarCollapsed}
                  onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
                />
                {/* SILK: Content area with proper margin for sidebar */}
                <div 
                  className={sidebarCollapsed ? "ml-16" : "ml-[230px]"}
                  style={{ minHeight: '100vh' }}
                >
                  <AlertBanner />
                  <TrialBanner />
                  <Header />
                  {/* SILK: Main content area */}
                  <main 
                    className="overflow-auto"
                    style={{ 
                      padding: '24px',
                      background: '#f1f4f9',
                    }}
                  >
                    <Outlet />
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
                
                {/* Demo Mode Components */}
                {isDemoMode && (
                  <>
                    <DemoTourNavigator 
                      onToggleAnnotation={() => setAnnotationActive(v => !v)}
                      isAnnotationActive={annotationActive}
                    />
                    <DemoScreenAnnotation 
                      isActive={annotationActive} 
                      onClose={() => setAnnotationActive(false)} 
                    />
                  </>
                )}
              </div>
            )}
          </ContextualHelpProvider>
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}