import { useState } from 'react';
import { Phone, Package, Clock, Settings2, ShoppingCart, History } from 'lucide-react';
import { ProfessionalCard, CardHeader } from '@/components/ui/professional-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TelephonyBalanceCard } from '@/components/telephony/TelephonyBalanceCard';
import { TelephonyPackCard } from '@/components/telephony/TelephonyPackCard';
import { TelephonyUsageTable } from '@/components/telephony/TelephonyUsageTable';
import { useTenantTelephonyBalance, useTelephonyUsageLogs, useTenantTelephonyPurchases } from '@/hooks/useTenantTelephony';
import { useTelephonyPacks, TelephonyPack } from '@/hooks/useTelephonyPacks';
import { toast } from 'sonner';

export default function TelephonySettings() {
  const { data: balance, isLoading: balanceLoading } = useTenantTelephonyBalance();
  const { data: packs, isLoading: packsLoading } = useTelephonyPacks();
  const { data: usageLogs, isLoading: usageLoading } = useTelephonyUsageLogs();
  const { data: purchases, isLoading: purchasesLoading } = useTenantTelephonyPurchases();

  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePurchase = async (pack: TelephonyPack) => {
    setIsPurchasing(true);
    try {
      // TODO: Integrar con Stripe checkout
      toast.info(`Próximamente: Compra de ${pack.name}`);
    } catch (error) {
      toast.error('Error al procesar la compra');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProfessionalCard>
        <CardHeader
          title="Telefonía VoIP"
          subtitle="Gestiona tu saldo, compra packs y revisa el historial de uso"
          icon={<Phone className="h-5 w-5" />}
        />
      </ProfessionalCard>

      <Tabs defaultValue="balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance" className="gap-2">
            <Phone className="h-4 w-4" />
            Saldo
          </TabsTrigger>
          <TabsTrigger value="packs" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-2">
            <Package className="h-4 w-4" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-6">
          <TelephonyBalanceCard balance={balance ?? null} isLoading={balanceLoading} />

          {balance && (
            <ProfessionalCard>
              <CardHeader
                title="Configuración"
                subtitle="Ajusta las opciones de telefonía"
                icon={<Settings2 className="h-5 w-5" />}
              />
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">Caller ID</div>
                    <div className="text-xs text-muted-foreground">
                      Número que se muestra en llamadas salientes
                    </div>
                  </div>
                  <code className="rounded bg-muted px-2 py-1 text-sm">
                    {balance.outbound_caller_id || 'No configurado'}
                  </code>
                </div>

                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <div className="text-sm font-medium text-foreground">Umbral de alerta</div>
                    <div className="text-xs text-muted-foreground">
                      Recibir alerta cuando queden menos de este número de minutos
                    </div>
                  </div>
                  <span className="font-semibold">{balance.low_balance_threshold} min</span>
                </div>
              </div>
            </ProfessionalCard>
          )}
        </TabsContent>

        <TabsContent value="packs" className="space-y-6">
          <ProfessionalCard>
            <CardHeader
              title="Packs de Minutos"
              subtitle="Elige el pack que mejor se adapte a tus necesidades"
              icon={<Package className="h-5 w-5" />}
            />
          </ProfessionalCard>

          {packsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Cargando packs...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(packs ?? []).map((pack) => (
                <TelephonyPackCard
                  key={pack.id}
                  pack={pack}
                  onPurchase={handlePurchase}
                  isPurchasing={isPurchasing}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <ProfessionalCard>
            <CardHeader
              title="Historial de Uso"
              subtitle="Últimas 50 comunicaciones"
              icon={<Clock className="h-5 w-5" />}
            />
          </ProfessionalCard>

          <TelephonyUsageTable logs={usageLogs ?? []} isLoading={usageLoading} />
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <ProfessionalCard>
            <CardHeader
              title="Historial de Compras"
              subtitle="Packs adquiridos"
              icon={<Package className="h-5 w-5" />}
            />

            {purchasesLoading ? (
              <div className="py-8 text-center text-muted-foreground">Cargando...</div>
            ) : (purchases ?? []).length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No has comprado ningún pack todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {(purchases ?? []).map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {purchase.minutes_purchased.toLocaleString()} minutos
                        {purchase.sms_purchased > 0 && ` + ${purchase.sms_purchased} SMS`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(purchase.purchased_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: purchase.currency }).format(purchase.price_paid)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.status === 'active' ? 'Activo' : purchase.status === 'depleted' ? 'Agotado' : 'Expirado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ProfessionalCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
