// src/layouts/backoffice-layout.tsx
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Brain,
  Users,
  CreditCard,
  BarChart3,
  Target,
  Megaphone,
  Calendar,
  FileText,
  Settings,
  AlertTriangle,
  ChevronLeft,
  Globe,
  Flag,
  Key,
  ShieldCheck,
  Scale,
  MessageSquare,
  Power,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useIsSuperadmin } from '@/hooks/use-admin';
import { Spinner } from '@/components/ui/spinner';

const sidebarSections = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', path: '/backoffice', icon: LayoutDashboard },
      { label: 'Tenants', path: '/backoffice/tenants', icon: Building2 },
      { label: 'Users', path: '/backoffice/users', icon: Users },
      { label: 'Billing', path: '/backoffice/billing', icon: CreditCard },
    ],
  },
  {
    label: 'Registry',
    items: [
      { label: 'IPO Registry', path: '/backoffice/ipo', icon: Globe },
      { label: 'AI Brain', path: '/backoffice/ai', icon: Brain },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Feature Flags', path: '/backoffice/feature-flags', icon: Flag },
      { label: 'API Keys', path: '/backoffice/api-keys', icon: Key },
      { label: 'Announcements', path: '/backoffice/announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'KYC Review', path: '/backoffice/kyc-review', icon: ShieldCheck },
      { label: 'Moderation', path: '/backoffice/moderation', icon: AlertTriangle },
      { label: 'Compliance', path: '/backoffice/compliance', icon: Scale },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Logs', path: '/backoffice/audit', icon: FileText },
      { label: 'Feedback', path: '/backoffice/feedback', icon: MessageSquare },
      { label: 'Settings', path: '/backoffice/settings', icon: Settings },
      { label: 'Kill Switch', path: '/backoffice/kill-switch', icon: Power, danger: true },
    ],
  },
];

export default function BackofficeLayout() {
  const location = useLocation();
  const { data: isSuperadmin, isLoading } = useIsSuperadmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isSuperadmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BO</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm">IP-NEXUS</h1>
              <p className="text-xs text-muted-foreground">Backoffice</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-4">
            {sidebarSections.map((section) => (
              <div key={section.label}>
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {section.label}
                </p>
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path || 
                      (item.path !== '/backoffice' && location.pathname.startsWith(item.path));
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : item.danger
                            ? 'text-destructive hover:bg-destructive/10'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/app/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver a la App
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
