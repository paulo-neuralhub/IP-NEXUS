// =============================================
// COMPONENTE: ModuleActivationDialog
// Popup para activar módulos (trial o pago)
// =============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  AlertTriangle, 
  Clock, 
  CreditCard,
  ArrowRight,
  Gift,
  Sparkles,
} from 'lucide-react';
import { useModulesContext } from '@/contexts/ModulesContext';
import { cn } from '@/lib/utils';
import type { ModuleWithStatus } from '@/types/modules';

export const ModuleActivationDialog = React.forwardRef<HTMLDivElement, object>(
  function ModuleActivationDialog(_props, ref) {
  const navigate = useNavigate();
  const { 
    activationPopup, 
    hideActivationPopup, 
    modulesWithStatus,
    canActivateModule,
    startModuleTrial,
    isStartingTrial,
    currentPlan,
  } = useModulesContext();

  const [activeTab, setActiveTab] = useState<'trial' | 'subscribe'>('trial');

  // Obtener módulo seleccionado
  const module = modulesWithStatus.find(m => m.code === activationPopup.moduleCode);

  if (!module) return null;

  // Verificar si puede activar
  const canActivate = canActivateModule(module.code);

  // Calcular precio
  const monthlyPrice = module.effective_price || module.price_addon_monthly || 0;
  const yearlyPrice = module.price_addon_yearly || monthlyPrice * 10;
  const yearlyMonthly = yearlyPrice / 12;
  const yearlySavings = monthlyPrice > 0 ? Math.round((1 - yearlyMonthly / monthlyPrice) * 100) : 0;

  // Calcular nuevo total mensual
  const currentMonthlyTotal = currentPlan?.price_monthly || 0;
  const newMonthlyTotal = currentMonthlyTotal + monthlyPrice;

  const handleStartTrial = () => {
    startModuleTrial(module.code);
    hideActivationPopup();
  };

  const handleSubscribe = () => {
    hideActivationPopup();
    navigate(`/pricing?module=${module.code}`);
  };

  const handleClose = () => {
    hideActivationPopup();
  };

  return (
    <Dialog open={activationPopup.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header con gradiente */}
        <DialogHeader className="p-0">
          <div 
            className="p-6 pb-4"
            style={{ 
              background: `linear-gradient(135deg, ${module.color}15 0%, ${module.color}05 100%)`,
              borderBottom: `2px solid ${module.color}30`
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icono grande */}
              <div 
                className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: `${module.color}20` }}
              >
                {module.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-foreground">
                  {module.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {module.tagline || module.description}
                </p>
                
                {/* Badges */}
                <div className="flex gap-2 mt-2">
                  {module.is_popular && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {module.category === 'standalone' ? 'Módulo base' : 
                     module.category === 'addon' ? 'Add-on' : 'Transversal'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Alerta de dependencias */}
          {!canActivate.can_activate && canActivate.reason === 'missing_dependencies' && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Requisito no cumplido
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Necesitas activar primero: {canActivate.missing_modules?.join(' + ')}
                </p>
              </div>
            </div>
          )}

          {/* Alerta límite de addons */}
          {!canActivate.can_activate && canActivate.reason === 'addon_limit_reached' && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Límite de add-ons alcanzado
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Tu plan permite {canActivate.max_addons} add-ons.
                  <button 
                    onClick={() => { handleClose(); navigate('/pricing'); }}
                    className="underline ml-1 hover:text-amber-900"
                  >
                    Mejora tu plan
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Features del módulo */}
          {module.features && module.features.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Incluye:
              </p>
              <div className="space-y-1.5">
                {module.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-foreground">
                      {feature.title}
                      {feature.description && (
                        <span className="text-muted-foreground"> — {feature.description}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs: Trial vs Suscribir */}
          {canActivate.can_activate && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'trial' | 'subscribe')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="trial" className="gap-1.5">
                  <Gift className="h-4 w-4" />
                  Prueba gratis
                </TabsTrigger>
                <TabsTrigger value="subscribe" className="gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Suscribirse
                </TabsTrigger>
              </TabsList>

              {/* Tab: Trial */}
              <TabsContent value="trial" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">14 días gratis</p>
                      <p className="text-xs text-green-700 dark:text-green-400">Sin tarjeta de crédito</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-green-600" />
                      Acceso completo a todas las funciones
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-green-600" />
                      Cancela cuando quieras
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-green-600" />
                      Te avisamos antes de que termine
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                  >
                    {isStartingTrial ? (
                      'Activando...'
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Empezar prueba gratis
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Tab: Suscribirse */}
              <TabsContent value="subscribe" className="mt-4">
                <div className="space-y-4">
                  {/* Precio */}
                  <div className="text-center py-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">
                        €{monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                    
                    {module.has_discount && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {module.discount_percent}% dto. aplicado de tu plan
                      </p>
                    )}

                    {yearlySavings > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        o €{yearlyMonthly.toFixed(0)}/mes facturado anualmente 
                        <span className="text-green-600 ml-1">(ahorra {yearlySavings}%)</span>
                      </p>
                    )}
                  </div>

                  {/* Resumen de facturación */}
                  <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Plan actual ({currentPlan?.name || 'Free'})</span>
                      <span>€{currentMonthlyTotal}/mes</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>+ {module.short_name || module.name}</span>
                      <span>€{monthlyPrice}/mes</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Nuevo total</span>
                      <span>€{newMonthlyTotal}/mes</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubscribe}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Suscribirse por €{monthlyPrice}/mes
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Se añadirá a tu próxima factura
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Si no puede activar, solo mostrar info */}
          {!canActivate.can_activate && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Resuelve los requisitos anteriores para activar este módulo.
              </p>
              <Button variant="outline" className="w-full" onClick={handleClose}>
                Entendido
              </Button>
            </div>
          )}
        </div>

        {/* Footer con módulos relacionados */}
        <ModuleRelatedFooter 
          currentModule={module} 
          onModuleClick={(code) => {
            handleClose();
            // Could open popup for another module after a small delay
          }}
        />
      </DialogContent>
    </Dialog>
  );
});

// =============================================
// Subcomponente: Footer con módulos relacionados
// =============================================

interface ModuleRelatedFooterProps {
  currentModule: ModuleWithStatus;
  onModuleClick: (code: string) => void;
}

function ModuleRelatedFooter({ currentModule, onModuleClick }: ModuleRelatedFooterProps) {
  const { modulesWithStatus, showActivationPopup } = useModulesContext();
  const navigate = useNavigate();
  
  // Obtener módulos relacionados (misma sección, no activos)
  const relatedModules = modulesWithStatus
    .filter(m => 
      m.code !== currentModule.code && 
      m.sidebar_section === currentModule.sidebar_section &&
      !m.is_accessible &&
      m.visual_status !== 'coming_soon'
    )
    .slice(0, 3);

  if (relatedModules.length === 0) return null;

  return (
    <div className="p-4 pt-0 border-t bg-muted/30">
      <p className="text-xs font-medium text-muted-foreground mb-3">
        También te puede interesar:
      </p>
      <div className="flex gap-2">
        {relatedModules.map(m => (
          <button
            key={m.code}
            type="button"
            onClick={() => {
              onModuleClick(m.code);
              setTimeout(() => showActivationPopup(m.code), 200);
            }}
            className={cn(
              "flex-1 p-2 bg-background border rounded-lg text-center",
              "hover:border-primary/50 hover:shadow-sm transition-all"
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <p className="text-xs font-medium mt-1 truncate">
              {m.short_name || m.name}
            </p>
            {m.effective_price && (
              <p className="text-[10px] text-muted-foreground">
                +€{m.effective_price}/mes
              </p>
            )}
          </button>
        ))}
      </div>
      
      <button
        type="button"
        onClick={() => navigate('/app/modules')}
        className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
      >
        Ver todos los módulos
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
