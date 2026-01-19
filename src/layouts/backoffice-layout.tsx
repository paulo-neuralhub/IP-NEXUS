// src/layouts/backoffice-layout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const sidebarItems = [
  { label: 'Dashboard', path: '/backoffice', icon: LayoutDashboard },
  { label: 'AI Brain', path: '/backoffice/ai', icon: Brain },
  { label: 'IPO Registry', path: '/backoffice/ipo', icon: Building2 },
  { label: 'Tenants', path: '/backoffice/tenants', icon: Users },
  { label: 'Billing', path: '/backoffice/billing', icon: CreditCard },
  { label: 'Analytics', path: '/backoffice/analytics', icon: BarChart3 },
  { label: 'CRM', path: '/backoffice/crm', icon: Target },
  { label: 'Marketing', path: '/backoffice/marketing', icon: Megaphone },
  { label: 'Calendar', path: '/backoffice/calendar', icon: Calendar },
  { label: 'Documentation', path: '/backoffice/docs', icon: FileText },
  { label: 'Settings', path: '/backoffice/settings', icon: Settings },
  { label: 'Kill Switch', path: '/backoffice/kill-switch', icon: AlertTriangle, danger: true },
];

export default function BackofficeLayout() {
  const location = useLocation();

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
          <nav className="space-y-1 px-2">
            {sidebarItems.map((item) => {
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
