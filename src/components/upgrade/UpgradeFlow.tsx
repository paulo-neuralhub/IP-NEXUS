/**
 * UPGRADE FLOW
 * PROMPT 50 Phase 5: Self-service upgrade modal
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { MODULE_REGISTRY, type ModuleCode } from "@/lib/modules/module-registry";
import { useSubscriptionPacks } from "@/hooks/use-subscription-packs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpgradeFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetModule?: ModuleCode;
  currentPlan?: string;
}

export function UpgradeFlow({ 
  open, 
  onOpenChange, 
  targetModule,
  currentPlan 
}: UpgradeFlowProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: packs, isLoading: packsLoading } = useSubscriptionPacks();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const moduleInfo = targetModule ? MODULE_REGISTRY[targetModule] : null;

  // Get recommended pack for the target module
  const getRecommendedPack = () => {
    if (!targetModule || !packs) return null;
    
    // Find packs that include this module
    return packs.find(pack => {
      const modules = pack.included_modules as Array<{ module_code: string }>;
      return modules?.some(m => m.module_code === targetModule);
    });
  };

  const recommendedPack = getRecommendedPack();

  const { mutate: startCheckout, isPending } = useMutation({
    mutationFn: async (packCode: string) => {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          pack_code: packCode,
          billing_cycle: billingCycle,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al procesar: ${error.message}`);
    },
  });

  const { mutate: startTrial, isPending: trialPending } = useMutation({
    mutationFn: async (packCode: string) => {
      const { error } = await supabase.rpc('start_module_trial', {
        p_pack_code: packCode,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('¡Trial de 14 días activado!');
      queryClient.invalidateQueries({ queryKey: ['organization-licenses'] });
      onOpenChange(false);
      if (targetModule) {
        navigate(MODULE_REGISTRY[targetModule].routes);
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al activar trial: ${error.message}`);
    },
  });

  const getPriceDisplay = (pack: any) => {
    const price = billingCycle === 'yearly' 
      ? pack.price_yearly / 12 
      : pack.price_monthly;
    return `€${price.toFixed(0)}`;
  };

  const getYearlySavings = (pack: any) => {
    const monthly = pack.price_monthly * 12;
    const yearly = pack.price_yearly;
    return Math.round((1 - yearly / monthly) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {targetModule ? (
              <>
                <span 
                  className="w-2 h-8 rounded-full" 
                  style={{ backgroundColor: moduleInfo?.color }}
                />
                Desbloquear {moduleInfo?.name}
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 text-primary" />
                Mejora tu plan
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {targetModule 
              ? `${moduleInfo?.description}. Elige un plan para acceder.`
              : 'Desbloquea más funcionalidades con un plan superior.'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex justify-center my-4">
          <Tabs 
            value={billingCycle} 
            onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}
          >
            <TabsList>
              <TabsTrigger value="monthly">Mensual</TabsTrigger>
              <TabsTrigger value="yearly" className="gap-2">
                Anual
                <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                  -20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {packsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                <div className="h-10 bg-muted rounded mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              </Card>
            ))
          ) : (
            packs?.filter(p => p.pack_type === 'bundle').slice(0, 3).map((pack) => {
              const isRecommended = pack.code === recommendedPack?.code;
              const isCurrent = pack.code === currentPlan;
              const Icon = pack.code === 'starter' ? Zap : pack.code === 'professional' ? Sparkles : Crown;
              
              return (
                <Card 
                  key={pack.id}
                  className={cn(
                    "relative p-6 cursor-pointer transition-all hover:shadow-lg",
                    isRecommended && "border-primary ring-2 ring-primary/20",
                    selectedPack === pack.code && "bg-primary/5"
                  )}
                  onClick={() => setSelectedPack(pack.code)}
                >
                  {isRecommended && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Recomendado
                    </Badge>
                  )}
                  
                  {isCurrent && (
                    <Badge variant="outline" className="absolute -top-2 right-4">
                      Plan actual
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold">{getPriceDisplay(pack)}</span>
                    <span className="text-muted-foreground">/mes</span>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-green-600">
                        Ahorras {getYearlySavings(pack)}% anual
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {pack.description}
                  </p>

                  <ul className="space-y-2">
                    {(pack.included_modules as Array<{ module_code: string; tier: string }>)
                      ?.slice(0, 6)
                      .map((mod, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span className={cn(
                            mod.module_code === targetModule && "font-medium text-primary"
                          )}>
                            {MODULE_REGISTRY[mod.module_code as ModuleCode]?.name || mod.module_code}
                          </span>
                          {mod.tier !== 'basic' && (
                            <Badge variant="outline" className="text-[10px]">
                              {mod.tier.toUpperCase()}
                            </Badge>
                          )}
                        </li>
                      ))}
                  </ul>

                  <div className="mt-6 space-y-2">
                    <Button 
                      className="w-full"
                      variant={isRecommended ? "default" : "outline"}
                      disabled={isCurrent || isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        startCheckout(pack.code);
                      }}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrent ? 'Plan actual' : 'Seleccionar'}
                    </Button>
                    
                    {!isCurrent && pack.trial_days > 0 && (
                      <Button 
                        variant="ghost" 
                        className="w-full text-sm"
                        disabled={trialPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          startTrial(pack.code);
                        }}
                      >
                        {trialPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Probar {pack.trial_days} días gratis
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>¿Necesitas un plan personalizado? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/pricing')}>Contacta con ventas</Button></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to use upgrade flow
 */
export function useUpgradeFlow() {
  const [searchParams, setSearchParams] = useSearchParams();
  const upgradeParam = searchParams.get('upgrade');
  const isGeneral = upgradeParam === 'general';
  const upgradeModule = upgradeParam && !isGeneral ? upgradeParam as ModuleCode : null;
  
  const openUpgrade = (module?: ModuleCode) => {
    if (module) {
      setSearchParams({ upgrade: module });
    } else {
      setSearchParams({ upgrade: 'general' });
    }
  };
  
  const closeUpgrade = () => {
    setSearchParams({});
  };

  return {
    isOpen: !!upgradeParam,
    targetModule: upgradeModule || undefined,
    openUpgrade,
    closeUpgrade,
  };
}
