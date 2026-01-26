import { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { 
  useCurrentSubscription, 
  useSubscriptionPlans,
  useCurrentUsage,
} from '@/hooks/use-subscription';
import { SUBSCRIPTION_STATUSES, PLAN_FEATURES } from '@/lib/constants/backoffice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function BillingSettingsPage() {
  const { data: subscription, isLoading } = useCurrentSubscription();
  const { data: plans = [] } = useSubscriptionPlans();
  const { data: usage } = useCurrentUsage();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const currentPlan = subscription?.plan;
  const statusConfig = subscription?.status ? SUBSCRIPTION_STATUSES[subscription.status as keyof typeof SUBSCRIPTION_STATUSES] : null;
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plan y Facturación</h1>
        <p className="text-muted-foreground">Gestiona tu suscripción y método de pago</p>
      </div>
      
      {/* Plan actual */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Plan actual</p>
            <h2 className="text-2xl font-bold text-foreground">{currentPlan?.name || 'Free'}</h2>
            {statusConfig && (
              <span 
                className="mt-2 inline-flex px-2 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(
                billingCycle === 'monthly' 
                  ? currentPlan?.price_monthly || 0
                  : currentPlan?.price_yearly || 0
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              /{billingCycle === 'monthly' ? 'mes' : 'año'}
            </p>
          </div>
        </div>
        
        {subscription?.cancel_at_period_end && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">
              Tu suscripción se cancelará al final del periodo actual
            </span>
          </div>
        )}
        
        {/* Uso */}
        {usage && currentPlan?.limits && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageCard 
              label="Expedientes" 
              current={usage.matters} 
              limit={currentPlan.limits.max_matters} 
            />
            <UsageCard 
              label="Usuarios" 
              current={usage.users} 
              limit={currentPlan.limits.max_users} 
            />
            <UsageCard 
              label="Contactos" 
              current={usage.contacts} 
              limit={currentPlan.limits.max_contacts} 
            />
            <UsageCard 
              label="Mensajes IA hoy" 
              current={usage.ai_messages_today} 
              limit={currentPlan.limits.max_ai_messages_day} 
            />
          </div>
        )}
      </div>
      
      {/* Toggle ciclo */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              billingCycle === 'monthly' ? "bg-background shadow" : "hover:bg-background/50"
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              billingCycle === 'yearly' ? "bg-background shadow" : "hover:bg-background/50"
            )}
          >
            Anual <span className="text-success text-xs ml-1">-17%</span>
          </button>
        </div>
      </div>
      
      {/* Planes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.filter((p: any) => !p.is_enterprise).map((plan: any) => (
          <PlanCard 
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrent={currentPlan?.id === plan.id}
          />
        ))}
      </div>
      
      {/* Enterprise */}
      <div className="bg-gradient-to-r from-module-genius to-module-crm rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Enterprise</h3>
            <p className="opacity-90">Solución completa para grandes organizaciones</p>
          </div>
          <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
            Contactar ventas
          </Button>
        </div>
      </div>
    </div>
  );
}

function UsageCard({ label, current, limit }: {
  label: string;
  current: number;
  limit: number;
}) {
  const unlimited = limit === -1;
  const percentage = unlimited ? 0 : Math.min(100, (current / limit) * 100);
  
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {current}{!unlimited && ` / ${limit}`}
        {unlimited && ' ∞'}
      </p>
      {!unlimited && (
        <div className="mt-2 h-1 bg-background rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full",
              percentage >= 90 ? "bg-destructive" :
              percentage >= 70 ? "bg-warning" : "bg-success"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, billingCycle, isCurrent }: {
  plan: any;
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
}) {
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  
  return (
    <div className={cn(
      "bg-card rounded-xl border p-6 relative",
      plan.is_popular && "border-primary ring-2 ring-primary/20",
      isCurrent && "border-success"
    )}>
      {plan.is_popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          Popular
        </span>
      )}
      
      <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      
      <div className="mt-4">
        <span className="text-3xl font-bold text-foreground">{formatCurrency(price)}</span>
        <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
      </div>
      
      <ul className="mt-4 space-y-2">
        {(plan.features as Array<string | { text: string; included: boolean }>).slice(0, 6).map((feature, idx) => {
          // Handle both string features and object features {text, included}
          const featureKey = typeof feature === 'string' ? feature : `feature-${idx}`;
          const featureLabel = typeof feature === 'string' 
            ? (PLAN_FEATURES[feature as keyof typeof PLAN_FEATURES]?.label || feature)
            : feature.text;
          return (
            <li key={featureKey} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-success" />
              <span>{featureLabel}</span>
            </li>
          );
        })}
      </ul>
      
      <Button 
        className={cn(
          "w-full mt-6",
          isCurrent && "bg-success hover:bg-success/90"
        )}
        variant={isCurrent ? "default" : "default"}
        disabled={isCurrent}
      >
        {isCurrent ? 'Plan actual' : 'Seleccionar'}
      </Button>
    </div>
  );
}
