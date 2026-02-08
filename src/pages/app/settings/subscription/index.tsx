// ============================================================
// IP-NEXUS - Subscription Management Page
// ============================================================

import { useState } from 'react';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  useSubscription,
  useSubscriptionStatus,
  useSubscriptionInvoices,
  useSubscriptionActions,
} from '@/hooks/useSubscription';
import {
  CurrentPlanCard,
  TrialBanner,
  PastDueBanner,
  CanceledBanner,
  AddonsSection,
  BillingSummary,
  RecentInvoices,
  CancelSubscriptionModal,
  CancelAddonModal,
} from '@/components/subscription';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { data: subscription, isLoading } = useSubscription();
  const { data: invoices = [] } = useSubscriptionInvoices();
  const subscriptionStatus = useSubscriptionStatus();
  const actions = useSubscriptionActions();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelAddonModal, setShowCancelAddonModal] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<{ id: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No tienes una suscripción activa</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Elige un plan para acceder a todas las funcionalidades de IP-NEXUS.
          </p>
          <Button className="mt-6" onClick={() => navigate('/app/settings/subscription/plans')}>
            Ver planes disponibles
          </Button>
        </div>
      </div>
    );
  }

  const handleChangePlan = () => {
    navigate('/app/settings/subscription/plans');
  };

  const handleSwitchToAnnual = () => {
    // Open Stripe customer portal where they can switch billing cycle
    actions.openCustomerPortal.mutate();
  };

  const handleCancelAddon = (addonId: string, addonName: string) => {
    setSelectedAddon({ id: addonId, name: addonName });
    setShowCancelAddonModal(true);
  };

  const handleConfirmCancelAddon = () => {
    if (selectedAddon) {
      actions.cancelAddon.mutate({ addonId: selectedAddon.id });
      setShowCancelAddonModal(false);
      setSelectedAddon(null);
    }
  };

  const handleCancelSubscription = (reason: string, feedback?: string) => {
    actions.cancelSubscription.mutate({ reason, feedback });
    setShowCancelModal(false);
  };

  const handleReactivate = () => {
    actions.reactivateSubscription.mutate();
  };

  const handleManagePayment = () => {
    actions.openCustomerPortal.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi Suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>

      {/* Status Banners */}
      {subscriptionStatus.isTrialing && subscription.trial_end && (
        <TrialBanner
          planName={subscription.product?.name || 'Plan'}
          daysRemaining={subscriptionStatus.trialDaysRemaining}
          trialEnd={subscription.trial_end}
          progress={subscriptionStatus.trialProgress}
          onActivate={handleManagePayment}
          onChangePlan={handleChangePlan}
          onCancelTrial={() => setShowCancelModal(true)}
        />
      )}

      {subscriptionStatus.isPastDue && (
        <PastDueBanner
          amount={subscriptionStatus.totalMonthly}
          currency="EUR"
          retryAttempts={2}
          maxRetries={3}
          onUpdatePayment={handleManagePayment}
          onRetryPayment={handleManagePayment}
        />
      )}

      {subscriptionStatus.isCanceled && subscription.current_period_end && (
        <CanceledBanner
          cancelDate={subscription.current_period_end}
          onReactivate={handleReactivate}
          isLoading={actions.reactivateSubscription.isPending}
        />
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          {!subscriptionStatus.isTrialing && (
            <CurrentPlanCard
              subscription={subscription}
              onChangePlan={handleChangePlan}
              onSwitchToAnnual={subscription.billing_cycle === 'monthly' ? handleSwitchToAnnual : undefined}
            />
          )}

          {/* Add-ons */}
          <AddonsSection
            items={subscription.items || []}
            onCancelAddon={handleCancelAddon}
            onAddOffices={() => navigate('/app/settings/subscription/plans?tab=addons')}
            onAddModules={() => navigate('/app/settings/subscription/plans?tab=modules')}
          />

          {/* Recent Invoices */}
          <RecentInvoices invoices={invoices} limit={3} />
        </div>

        <div className="space-y-6">
          {/* Billing Summary */}
          <BillingSummary
            subscription={subscription}
            totalMonthly={subscriptionStatus.totalMonthly}
            onManagePayment={handleManagePayment}
            isLoadingPortal={actions.openCustomerPortal.isPending}
          />

          {/* Cancel Subscription */}
          {!subscriptionStatus.isCanceled && (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitas cancelar? Tu suscripción seguirá activa hasta el final del período de facturación actual.
              </p>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive w-full"
                onClick={() => setShowCancelModal(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cancelar suscripción
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CancelSubscriptionModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        periodEndDate={subscription.current_period_end || new Date().toISOString()}
        planName={subscription.product?.name || 'Plan'}
        onConfirm={handleCancelSubscription}
        isLoading={actions.cancelSubscription.isPending}
      />

      <CancelAddonModal
        open={showCancelAddonModal}
        onOpenChange={setShowCancelAddonModal}
        addonName={selectedAddon?.name || ''}
        addonPrice={39}
        currentTotal={subscriptionStatus.totalMonthly}
        newTotal={subscriptionStatus.totalMonthly - 39}
        periodEndDate={subscription.current_period_end || new Date().toISOString()}
        onConfirm={handleConfirmCancelAddon}
        isLoading={actions.cancelAddon.isPending}
      />
    </div>
  );
}
