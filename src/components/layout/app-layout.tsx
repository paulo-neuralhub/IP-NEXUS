import { Outlet } from "react-router-dom";
import { AuthGuard } from "@/components/layout/auth-guard";
import { OrgGuard } from "@/components/layout/org-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageProvider } from "@/contexts/page-context";

export function AppLayout() {
  return (
    <AuthGuard>
      <OrgGuard>
        <PageProvider>
          <div className="min-h-screen bg-background">
            <Sidebar />
            <div className="ml-64">
              <Header />
              <main className="p-6">
                <Outlet />
              </main>
            </div>
          </div>
        </PageProvider>
      </OrgGuard>
    </AuthGuard>
  );
}
