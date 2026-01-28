// ============================================================
// IP-NEXUS - Super Admin Bar
// Floating bar for super admin controls
// ============================================================

import { useSuperAdmin, SuperAdminModeType } from '@/hooks/useSuperAdmin';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Settings, 
  Play, 
  ChevronDown,
  Eye,
  LogOut,
  Building2,
  Crown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SUBSCRIPTION_OPTIONS = [
  { id: 'starter', name: 'Starter', icon: '🆓' },
  { id: 'professional', name: 'Professional', icon: '⭐' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'enterprise', name: 'Enterprise', icon: '🏆' },
];

export function SuperAdminBar() {
  const navigate = useNavigate();
  const { 
    isSuperAdmin, 
    currentMode, 
    loading,
    enterBackoffice, 
    enterDemo, 
    exitToSuperAdmin,
    simulateSubscription 
  } = useSuperAdmin();

  if (loading || !isSuperAdmin) return null;

  const getModeLabel = () => {
    switch (currentMode?.mode) {
      case 'backoffice': return 'Backoffice';
      case 'demo': return 'Demo';
      case 'simulate': return `Simulando: ${currentMode.subscription}`;
      default: return 'Super Admin';
    }
  };

  const getModeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (currentMode?.mode) {
      case 'backoffice': return 'secondary';
      case 'demo': return 'default';
      case 'simulate': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-sidebar text-sidebar-foreground h-10 flex items-center justify-between px-4 shadow-lg border-b border-border">
      {/* Left: Mode indicator */}
      <div className="flex items-center gap-3">
        <Badge 
          variant="outline" 
          className="border-destructive text-destructive font-bold gap-1"
        >
          <Shield className="h-3 w-3" />
          SUPER ADMIN
        </Badge>
        
        <div className="h-4 w-px bg-border" />
        
        <Badge variant={getModeVariant()}>
          {getModeLabel()}
        </Badge>

        {currentMode?.mode === 'simulate' && currentMode.tenantName && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {currentMode.tenantName}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Backoffice Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            enterBackoffice();
            navigate('/backoffice');
          }}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent h-7 text-xs",
            currentMode?.mode === 'backoffice' && 'bg-sidebar-accent'
          )}
        >
          <Settings className="h-3 w-3 mr-1" />
          Backoffice
        </Button>

        {/* Demo Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            enterDemo();
            navigate('/app');
          }}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent h-7 text-xs",
            currentMode?.mode === 'demo' && 'bg-sidebar-accent'
          )}
        >
          <Play className="h-3 w-3 mr-1" />
          Demo
        </Button>

        {/* Simulate Subscription Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Simular Plan
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="bg-popover border-border text-popover-foreground min-w-[200px]"
          >
            {SUBSCRIPTION_OPTIONS.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => {
                  simulateSubscription(plan.id);
                  navigate('/app');
                }}
                className="cursor-pointer"
              >
                <span className="mr-2">{plan.icon}</span>
                Ver como {plan.name}
                {currentMode?.subscription === plan.id && (
                  <Crown className="h-3 w-3 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                exitToSuperAdmin();
                // Navigate to app after exiting simulation
                setTimeout(() => navigate('/app'), 100);
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Salir de simulación
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
