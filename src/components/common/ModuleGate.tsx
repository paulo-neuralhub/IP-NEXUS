import { ReactNode } from 'react';
import { useModuleAccess, ModuleCode, TierCode } from '@/hooks/use-module-access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModuleGateProps {
  module: ModuleCode;
  requiredTier?: TierCode;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

const MODULE_NAMES: Record<ModuleCode, string> = {
  core: 'Core',
  docket: 'Docket',
  spider: 'Spider Pro',
  crm: 'CRM',
  marketing: 'Marketing',
  market: 'Market',
  genius: 'Genius AI',
  finance: 'Finance',
};

const TIER_NAMES: Record<TierCode, string> = {
  basic: 'Basic',
  pro: 'Professional',
  enterprise: 'Enterprise',
};

export function ModuleGate({
  module,
  requiredTier,
  children,
  fallback,
  showUpgrade = true,
}: ModuleGateProps) {
  const { hasAccess, isLoading, tier } = useModuleAccess(module);

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  // Verificar acceso básico
  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    if (!showUpgrade) return null;

    return <ModuleUpgradePrompt module={module} />;
  }

  // Verificar tier requerido
  if (requiredTier && tier) {
    const tierOrder: TierCode[] = ['basic', 'pro', 'enterprise'];
    const currentIndex = tierOrder.indexOf(tier);
    const requiredIndex = tierOrder.indexOf(requiredTier);

    if (currentIndex < requiredIndex) {
      if (fallback) return <>{fallback}</>;
      if (!showUpgrade) return null;

      return <TierUpgradePrompt module={module} requiredTier={requiredTier} currentTier={tier} />;
    }
  }

  return <>{children}</>;
}

function ModuleUpgradePrompt({ module }: { module: ModuleCode }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Desbloquea {MODULE_NAMES[module]}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Esta funcionalidad requiere el módulo {MODULE_NAMES[module]}.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to={`/pricing?module=${module}`}>
              Ver planes
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/app/settings/modules/${module}/trial`}>
              <Sparkles className="w-4 h-4 mr-2" />
              Probar gratis
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TierUpgradePrompt({
  module,
  requiredTier,
  currentTier,
}: {
  module: ModuleCode;
  requiredTier: TierCode;
  currentTier: TierCode;
}) {
  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <CardTitle>Actualiza a {TIER_NAMES[requiredTier]}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Tu plan actual ({TIER_NAMES[currentTier]}) no incluye esta funcionalidad.
          Actualiza a {TIER_NAMES[requiredTier]} para desbloquearla.
        </p>
        <Button asChild>
          <Link to={`/app/settings/modules/${module}/upgrade?to=${requiredTier}`}>
            Actualizar ahora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
