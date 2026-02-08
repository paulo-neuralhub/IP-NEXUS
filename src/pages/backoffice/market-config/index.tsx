/**
 * Backoffice — Market Commission Configuration
 * SILK Design System
 */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Settings, DollarSign, Percent, Save, Loader2 } from 'lucide-react';
import { useCommissionRates, useMarketplaceSettings, useUpdatePlatformConfig, type CommissionRates, type MarketplaceSettings } from '@/hooks/market/usePlatformConfig';

export default function MarketConfigPage() {
  const { data: rates, isLoading: ratesLoading } = useCommissionRates();
  const { data: settings, isLoading: settingsLoading } = useMarketplaceSettings();
  const updateConfig = useUpdatePlatformConfig();

  const [commission, setCommission] = useState<CommissionRates>({
    seller_fee_percent: 10,
    buyer_fee_percent: 5,
    official_fees_commission: 0,
    min_platform_fee: 5,
    currency: 'EUR',
  });

  const [mktSettings, setMktSettings] = useState<MarketplaceSettings>({
    request_expiry_days: 30,
    offer_validity_days: 15,
    max_offers_per_request: 20,
    auto_expire_requests: true,
    escrow_release_delay_hours: 24,
  });

  useEffect(() => { if (rates) setCommission(rates); }, [rates]);
  useEffect(() => { if (settings) setMktSettings(settings); }, [settings]);

  const saveCommission = () => updateConfig.mutate({ key: 'commission_rates', value: commission });
  const saveSettings = () => updateConfig.mutate({ key: 'marketplace_settings', value: mktSettings });

  const isLoading = ratesLoading || settingsLoading;

  // Simulation
  const simHonorarios = 1000;
  const simBuyerFee = simHonorarios * (commission.buyer_fee_percent / 100);
  const simSellerFee = simHonorarios * (commission.seller_fee_percent / 100);
  const simBuyerPays = simHonorarios + simBuyerFee;
  const simSellerReceives = simHonorarios - simSellerFee;
  const simPlatform = simBuyerFee + simSellerFee;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00b4d8' }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,180,216,0.08)' }}>
          <Settings className="w-5 h-5" style={{ color: '#00b4d8' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540' }}>IP-Market — Comisiones</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Configura los porcentajes que IP-NEXUS cobra en cada transacción.</p>
        </div>
      </div>

      {/* Commission rates */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>
          Comisiones
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <ConfigInput label="Comisión al agente (vendedor)" value={commission.seller_fee_percent} suffix="%"
            hint="Se descuenta de los honorarios profesionales del agente"
            onChange={v => setCommission(prev => ({ ...prev, seller_fee_percent: Number(v) }))} />
          <ConfigInput label="Comisión al solicitante (comprador)" value={commission.buyer_fee_percent} suffix="%"
            hint="Se añade al total que paga el solicitante"
            onChange={v => setCommission(prev => ({ ...prev, buyer_fee_percent: Number(v) }))} />
          <ConfigInput label="Comisión sobre tasas oficiales" value={commission.official_fees_commission} suffix="%"
            hint="Generalmente 0% — las tasas son pass-through"
            onChange={v => setCommission(prev => ({ ...prev, official_fees_commission: Number(v) }))} />
          <ConfigInput label="Fee mínimo por transacción" value={commission.min_platform_fee} suffix="EUR"
            hint="Se aplica si la comisión calculada es inferior"
            onChange={v => setCommission(prev => ({ ...prev, min_platform_fee: Number(v) }))} />
        </div>

        {/* Simulator */}
        <div className="mt-6 p-4 rounded-xl"
          style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.1)' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#00b4d8', marginBottom: '10px' }}>
            💡 Simulación — Honorarios de €{simHonorarios.toLocaleString()}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Solicitante paga</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>
                €{simBuyerPays.toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Agente recibe</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#10b981', letterSpacing: '-0.02em' }}>
                €{simSellerReceives.toLocaleString()}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>IP-NEXUS ingresa</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#00b4d8', letterSpacing: '-0.02em' }}>
                €{simPlatform.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={saveCommission} disabled={updateConfig.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
            {updateConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar comisiones
          </button>
        </div>
      </div>

      {/* Marketplace settings */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>
          Configuración general
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <ConfigInput label="Días de expiración de solicitudes" value={mktSettings.request_expiry_days} suffix="días"
            onChange={v => setMktSettings(prev => ({ ...prev, request_expiry_days: Number(v) }))} />
          <ConfigInput label="Validez de propuestas" value={mktSettings.offer_validity_days} suffix="días"
            onChange={v => setMktSettings(prev => ({ ...prev, offer_validity_days: Number(v) }))} />
          <ConfigInput label="Máximo ofertas por solicitud" value={mktSettings.max_offers_per_request} suffix=""
            onChange={v => setMktSettings(prev => ({ ...prev, max_offers_per_request: Number(v) }))} />
          <ConfigInput label="Delay liberación escrow" value={mktSettings.escrow_release_delay_hours} suffix="horas"
            onChange={v => setMktSettings(prev => ({ ...prev, escrow_release_delay_hours: Number(v) }))} />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={saveSettings} disabled={updateConfig.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
            {updateConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar configuración
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigInput({ label, value, suffix, hint, onChange }: {
  label: string; value: number; suffix: string; hint?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: '#f8f9fb' }}>
      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" step="0.5" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-24 px-3 py-2.5 rounded-xl text-lg font-bold text-right outline-none"
          style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
        {suffix && <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{suffix}</span>}
      </div>
      {hint && <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}
