import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, Scale, FileText, Languages, History, FileStack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/contexts/page-context';
import { useEffect, useCallback } from 'react';
import { ModuleGate } from '@/components/common/ModuleGate';

import { useLegalCheck } from '@/hooks/legal/useLegalCheck';

const geniusNav = [
  { path: '/app/genius', label: 'Chat', icon: MessageSquare, exact: true },
  { path: '/app/genius/analysis', label: 'Análisis', icon: Scale },
  { path: '/app/genius/documents-gen', label: 'Documentos', icon: FileText },
  { path: '/app/genius/predictions', label: 'Predicciones', icon: Brain },
  { path: '/app/genius/valuation', label: 'Valoración', icon: History },
  { path: '/app/genius/comparator', label: 'Comparador', icon: Scale },
  { path: '/app/genius/opposition', label: 'Oposición', icon: FileText },
  { path: '/app/genius/translator', label: 'Traductor', icon: Languages },
  { path: '/app/genius/templates', label: 'Plantillas', icon: FileStack },
  { path: '/app/genius/documents', label: 'Historial', icon: History },
];

export default function GeniusLayout() {
  const { setTitle } = usePageTitle();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleDeclineLegal = useCallback(() => {
    navigate('/app/dashboard');
  }, [navigate]);
  
  const { needsAcceptance, modal, isChecking } = useLegalCheck('ai_disclaimer', {
    onDecline: handleDeclineLegal,
  });

  useEffect(() => {
    setTitle('IP-GENIUS PRO');
  }, [setTitle]);

  if (isChecking) return null;
  if (needsAcceptance) return <>{modal}</>;

  return (
    <ModuleGate module="genius">
      {modal}
      <div className="space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">IP-GENIUS PRO</h1>
              <p className="text-sm text-muted-foreground">Asistentes IA especializados en PI</p>
            </div>
          </div>
          
          {/* Sub-navigation */}
          <nav className="flex items-center gap-1 ml-8 border rounded-lg p-1 bg-muted/50">
            {geniusNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </ModuleGate>
  );
}
