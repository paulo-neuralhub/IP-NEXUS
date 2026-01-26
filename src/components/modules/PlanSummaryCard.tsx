// =============================================
// COMPONENTE: PlanSummaryCard
// Resumen visual del plan actual
// =============================================

import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Check, 
  ArrowUpRight,
  Package,
  Puzzle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';

export function PlanSummaryCard() {
  const navigate = useNavigate();
  const { currentPlan, modulesSummary, subscription } = useModulesContext();

  if (!currentPlan) return null;

  const isEnterprise = currentPlan.is_enterprise;
  
  // Calcular uso
  const modulesUsed = modulesSummary.total_active;
  const modulesLimit = currentPlan.modules_to_choose === -1 ? -1 : (currentPlan.modules_to_choose || 1);
  const addonsUsed = modulesSummary.total_addons;
  const addonsLimit = modulesSummary.max_addons_allowed === -1 ? -1 : modulesSummary.max_addons_allowed;

  const modulesPercent = modulesLimit > 0 ? Math.min(100, (modulesUsed / modulesLimit) * 100) : 0;
  const addonsPercent = addonsLimit > 0 ? Math.min(100, (addonsUsed / addonsLimit) * 100) : 0;

  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {currentPlan.name}
            </span>
            {subscription?.billing_cycle === 'yearly' && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs">
                Anual -20%
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {isEnterprise 
              ? 'Acceso completo a todas las funcionalidades'
              : `€${currentPlan.price_monthly}/mes · Facturación ${subscription?.billing_cycle === 'yearly' ? 'anual' : 'mensual'}`
            }
          </p>
        </div>
        
        {!isEnterprise && (
          <Button
            size="sm"
            onClick={() => navigate('/configuraciones/suscripcion')}
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <Zap className="h-4 w-4 mr-1" />
            Mejorar plan
          </Button>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Módulos */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Package className="h-3.5 w-3.5" />
            Módulos
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-white">
              {modulesUsed}
            </span>
            <span className="text-slate-400 text-sm">
              /{modulesLimit === -1 ? '∞' : modulesLimit}
            </span>
          </div>
          {modulesLimit > 0 && (
            <Progress value={modulesPercent} className="h-1.5 bg-white/10" />
          )}
        </div>

        {/* Add-ons */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Puzzle className="h-3.5 w-3.5" />
            Add-ons
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-white">
              {addonsUsed}
            </span>
            <span className="text-slate-400 text-sm">
              /{addonsLimit === -1 ? '∞' : addonsLimit}
            </span>
          </div>
          {addonsLimit > 0 && (
            <Progress value={addonsPercent} className="h-1.5 bg-white/10" />
          )}
        </div>

        {/* Coste add-ons */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            Coste add-ons
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">
              €{modulesSummary.monthly_addon_cost}
            </span>
            <span className="text-slate-400 text-sm">
              /mes
            </span>
          </div>
        </div>
      </div>

      {/* Incluido en el plan */}
      {currentPlan.included_modules && currentPlan.included_modules.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-slate-400 text-xs mb-2">Incluido en tu plan:</p>
          <div className="flex flex-wrap gap-2">
            {currentPlan.included_modules.slice(0, 4).map((module, idx) => (
              <span key={idx} className="flex items-center gap-1 text-xs text-white/80 bg-white/10 px-2 py-1 rounded">
                <Check className="h-3 w-3 text-emerald-400" />
                {module}
              </span>
            ))}
            {currentPlan.included_modules.length > 4 && (
              <span className="text-xs text-slate-400">
                +{currentPlan.included_modules.length - 4} más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
