// src/layouts/backoffice-layout.tsx
import { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  Globe,
  Library,
  Flag,
  Plug,
  ShieldCheck,
  Scale,
  MessageSquare,
  Power,
  Database,
  PhoneCall,
  ScrollText,
  GitBranch,
  DollarSign,
  Activity,
  Play,
  FlaskConical,
  Home,
  Briefcase,
  Building,
  Tags,
  Bot,
  LineChart,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsBackofficeStaff } from '@/hooks/backoffice/useBackofficeAccess';
import { usePendingEventsCount } from '@/hooks/useSystemEvents';
import { Spinner } from '@/components/ui/spinner';
import { SoftphoneWidget } from '@/components/voip/SoftphoneWidget';
import { AiAgentFloatingButton } from '@/components/backoffice/AiAgent/AiAgentFloatingButton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// LocalStorage key para guardar estado de secciones
const STORAGE_KEY = 'backoffice-sidebar-expanded';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
  badge?: number;
}

interface SidebarSection {
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SidebarItem[];
}

// Nueva estructura con secciones colapsables
const sidebarSections: SidebarSection[] = [
  {
    code: 'inicio',
    label: 'Inicio',
    icon: Home,
    items: [
      { label: 'Dashboard', path: '/backoffice', icon: LayoutDashboard },
    ],
  },
  {
    code: 'negocio',
    label: 'Negocio',
    icon: Briefcase,
    items: [
      { label: 'Productos', path: '/backoffice/stripe/products', icon: BarChart3 },
      { label: 'Suscripciones', path: '/backoffice/stripe/subscriptions', icon: Users },
      { label: 'Facturas', path: '/backoffice/stripe/invoices', icon: FileText },
      { label: 'Webhooks', path: '/backoffice/stripe/webhooks', icon: Activity },
    ],
  },
  {
    code: 'oficinas',
    label: 'Oficinas PI',
    icon: Building,
    items: [
      { label: 'Dashboard', path: '/backoffice/ipo', icon: LayoutDashboard },
      { label: 'Lista', path: '/backoffice/ipo/lista', icon: Globe },
      { label: 'Mappings', path: '/backoffice/ipo/mappings', icon: GitBranch },
      { label: 'Tasas', path: '/backoffice/ipo/fees', icon: DollarSign },
      { label: 'Monitor', path: '/backoffice/ipo/monitor', icon: Activity },
      { label: 'Logs', path: '/backoffice/ipo/logs', icon: FileText },
    ],
  },
  {
    code: 'marcas',
    label: 'Marcas',
    icon: Tags,
    items: [
      { label: 'Clases Nice', path: '/backoffice/nice-classes', icon: Target },
    ],
  },
  {
    code: 'ai',
    label: 'AI & Knowledge',
    icon: Bot,
    items: [
      { label: 'AI Brain', path: '/backoffice/ai', icon: Brain },
      { label: 'Knowledge Bases', path: '/backoffice/knowledge-bases', icon: Library },
    ],
  },
  {
    code: 'analytics',
    label: 'Analytics',
    icon: LineChart,
    items: [
      { label: 'Overview', path: '/backoffice/analytics', icon: BarChart3 },
      { label: 'Ingresos', path: '/backoffice/analytics/revenue', icon: DollarSign },
      { label: 'Suscripciones', path: '/backoffice/analytics/subscriptions', icon: Users },
      { label: 'Uso', path: '/backoffice/analytics/usage', icon: Activity },
      { label: 'Cohortes', path: '/backoffice/analytics/cohorts', icon: Calendar },
      { label: 'Tenants', path: '/backoffice/analytics/tenants', icon: Building2 },
    ],
  },
  {
    code: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    items: [
      { label: 'Landings', path: '/backoffice/landings', icon: Globe },
    ],
  },
  {
    code: 'herramientas',
    label: 'Herramientas',
    icon: Wrench,
    items: [
      { label: 'Calendar', path: '/backoffice/calendar', icon: Calendar },
      { label: 'Settings', path: '/backoffice/settings', icon: Settings },
    ],
  },
  {
    code: 'demo',
    label: 'Demo',
    icon: Play,
    items: [
      { label: 'Demo Mode', path: '/backoffice/demo-mode', icon: Play },
      { label: 'Demo Data', path: '/backoffice/demo-data', icon: Database },
    ],
  },
  {
    code: 'compliance',
    label: 'Compliance',
    icon: ShieldCheck,
    items: [
      { label: 'KYC Review', path: '/backoffice/kyc-review', icon: ShieldCheck },
      { label: 'Moderation', path: '/backoffice/moderation', icon: AlertTriangle },
      { label: 'Compliance', path: '/backoffice/compliance', icon: Scale },
      { label: 'Textos Legales', path: '/backoffice/legal-documents', icon: ScrollText },
    ],
  },
  {
    code: 'sistema',
    label: 'Sistema',
    icon: Settings,
    items: [
      { label: 'Alertas', path: '/backoffice/alerts', icon: AlertTriangle },
      { label: 'Logs', path: '/backoffice/logs', icon: ScrollText },
      { label: 'Audit Logs', path: '/backoffice/audit', icon: FileText },
      { label: 'Event Log', path: '/backoffice/events', icon: ScrollText },
      { label: 'System Tests', path: '/backoffice/system-tests', icon: FlaskConical },
      { label: 'Feedback', path: '/backoffice/feedback', icon: MessageSquare },
      { label: 'Kill Switch', path: '/backoffice/kill-switch', icon: Power, danger: true },
    ],
  },
];

function CollapsibleSidebarSection({
  section,
  isExpanded,
  onToggle,
  currentPath,
  pendingEventsCount = 0,
}: {
  section: SidebarSection;
  isExpanded: boolean;
  onToggle: () => void;
  currentPath: string;
  pendingEventsCount?: number;
}) {
  const SectionIcon = section.icon;
  
  // Detectar si hay algún item activo en esta sección
  const hasActiveItem = section.items.some(item => 
    currentPath === item.path || 
    (item.path !== '/backoffice' && currentPath.startsWith(item.path))
  );

  // Sección "Inicio" no es colapsable, es link directo
  if (section.code === 'inicio') {
    const item = section.items[0];
    const isActive = currentPath === item.path;
    
    return (
      <div className="mb-1">
        <Link
          to={item.path}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <SectionIcon className="h-4 w-4" />
          <span>{section.label}</span>
        </Link>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle} className="mb-1">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            hasActiveItem
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <SectionIcon className="h-4 w-4" />
          <span className="flex-1 text-left">{section.label}</span>
          <ChevronDown 
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded ? 'rotate-0' : '-rotate-90'
            )} 
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="pl-4 mt-1 space-y-0.5 border-l-2 border-muted ml-5">
          {section.items.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path !== '/backoffice' && currentPath.startsWith(item.path));
            const showBadge = item.path === '/backoffice/events' && pendingEventsCount > 0;
            
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
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning">
                    {pendingEventsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function BackofficeLayout() {
  const location = useLocation();
  const { data: isBackofficeStaff, isLoading } = useIsBackofficeStaff();
  const { data: pendingEventsCount = 0 } = usePendingEventsCount();

  // Estado de secciones expandidas
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {}
    return new Set<string>();
  });

  // Detectar sección activa y expandirla automáticamente
  const activeSectionCode = useMemo(() => {
    for (const section of sidebarSections) {
      const hasActiveItem = section.items.some(item => 
        location.pathname === item.path || 
        (item.path !== '/backoffice' && location.pathname.startsWith(item.path))
      );
      if (hasActiveItem) return section.code;
    }
    return null;
  }, [location.pathname]);

  // Expandir sección activa automáticamente al cambiar de ruta
  useEffect(() => {
    if (activeSectionCode && !expandedSections.has(activeSectionCode)) {
      setExpandedSections(prev => {
        const next = new Set(prev);
        next.add(activeSectionCode);
        return next;
      });
    }
  }, [activeSectionCode]);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(expandedSections)));
  }, [expandedSections]);

  const toggleSection = (code: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

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

  if (!isBackofficeStaff) {
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

        <ScrollArea className="flex-1 py-3">
          <nav className="px-2">
            {sidebarSections.map((section) => (
              <CollapsibleSidebarSection
                key={section.code}
                section={section}
                isExpanded={expandedSections.has(section.code)}
                onToggle={() => toggleSection(section.code)}
                currentPath={location.pathname}
                pendingEventsCount={pendingEventsCount}
              />
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

      {/* Softphone Widget (VoIP) */}
      <SoftphoneWidget />

      {/* Backoffice AI Agent */}
      <AiAgentFloatingButton />
    </div>
  );
}
