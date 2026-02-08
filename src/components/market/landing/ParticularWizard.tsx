import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check, CheckCircle, Clock,
  HelpCircle, Image, Info, Lightbulb, Loader2, Palette, ShieldCheck,
  Store, Type,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type WhatToProtect, type WizardJurisdiction, type WizardBudget, type WizardUrgency,
  BUSINESS_CATEGORIES, POPULAR_JURISDICTIONS, OTHER_COUNTRIES, BUDGET_RANGES,
  calculateNiceClasses, translateWizardToRfq, getProtectionLabel, getCategoryLabels,
} from '@/lib/market/wizardTranslation';
import { useCreateRfqRequest, usePublishRfqRequest } from '@/hooks/market/useRfqRequests';

interface ParticularWizardProps {
  onBack: () => void;
}

const PROTECTION_OPTIONS = [
  {
    id: 'brand_name' as WhatToProtect,
    icon: Type,
    title: 'El nombre de mi marca o empresa',
    description: 'Quiero que nadie más pueda usar mi nombre comercial',
    example: 'Ej: "Luna Verde", "TechFlow", "María García Abogados"',
  },
  {
    id: 'brand_logo' as WhatToProtect,
    icon: Image,
    title: 'Mi logo o imagen de marca',
    description: 'Tengo un diseño gráfico o logotipo que quiero proteger',
    example: 'Ej: un logotipo, un símbolo, nombre + imagen',
  },
  {
    id: 'invention' as WhatToProtect,
    icon: Lightbulb,
    title: 'Una invención o producto nuevo',
    description: 'He creado algo nuevo y quiero que no lo copien',
    example: 'Ej: un dispositivo, un método, un proceso, una fórmula',
  },
  {
    id: 'design_product' as WhatToProtect,
    icon: Palette,
    title: 'Un diseño de producto',
    description: 'Quiero proteger la apariencia de mi producto',
    example: 'Ej: el diseño de un mueble, una botella, un envase',
  },
  {
    id: 'not_sure' as WhatToProtect,
    icon: HelpCircle,
    title: 'No estoy seguro',
    description: 'Necesito asesoramiento sobre cómo proteger mi idea',
    example: 'Un profesional te ayudará a determinar la mejor opción',
  },
];

export function ParticularWizard({ onBack }: ParticularWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // State
  const [whatToProtect, setWhatToProtect] = useState<WhatToProtect | null>(null);
  const [jurisdiction, setJurisdiction] = useState<WizardJurisdiction | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [brandName, setBrandName] = useState('');
  const [hasLogo, setHasLogo] = useState<boolean | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [urgency, setUrgency] = useState<WizardUrgency>('normal');
  const [budget, setBudget] = useState<WizardBudget | null>(null);

  const createMutation = useCreateRfqRequest();
  const publishMutation = usePublishRfqRequest();
  const isSubmitting = createMutation.isPending || publishMutation.isPending;

  const filteredCountries = countrySearch.trim()
    ? OTHER_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : [];

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!whatToProtect || !jurisdiction) return;

    const rfqData = translateWizardToRfq({
      whatToProtect,
      jurisdiction,
      selectedCategories,
      brandName,
      hasLogo,
      additionalInfo,
      urgency,
      budget,
    });

    try {
      const request = await createMutation.mutateAsync(rfqData as any);
      await publishMutation.mutateAsync(request.id);
      toast.success('¡Solicitud publicada! Recibirás presupuestos de profesionales verificados.');
      navigate(`/app/market/rfq/${request.id}?from=mis-pedidos`);
    } catch {
      toast.error('Error al publicar. ¿Tienes sesión iniciada?');
    }
  };

  const canGoNext = (() => {
    switch (step) {
      case 1: return !!whatToProtect;
      case 2: return !!jurisdiction;
      case 3: return selectedCategories.length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  })();

  return (
    <div className="max-w-xl mx-auto py-8 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back to selector */}
      <button
        onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
        className="flex items-center gap-1.5 text-xs font-semibold mb-6"
        style={{ color: '#64748b' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {step === 1 ? 'Volver' : 'Paso anterior'}
      </button>

      {/* ═══ STEP 1: What to protect ═══ */}
      {step === 1 && (
        <div>
          <StepHeader step={1} total={TOTAL_STEPS} title="¿Qué quieres proteger?" subtitle="Selecciona lo que mejor describe tu necesidad" />
          <div className="grid grid-cols-1 gap-3">
            {PROTECTION_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => { setWhatToProtect(option.id); setStep(2); }}
                className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all hover:scale-[1.01]"
                style={{
                  background: whatToProtect === option.id ? 'rgba(124,58,237,0.04)' : '#fff',
                  border: `2px solid ${whatToProtect === option.id ? '#7c3aed' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(124,58,237,0.08)' }}
                >
                  <option.icon className="w-5 h-5" style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#0a2540', display: 'block' }}>
                    {option.title}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                    {option.description}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px', fontStyle: 'italic' }}>
                    {option.example}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Jurisdiction ═══ */}
      {step === 2 && (
        <div>
          <StepHeader step={2} total={TOTAL_STEPS} title="¿Dónde necesitas protección?" subtitle="Selecciona el país o región donde operas o piensas operar" />

          <div className="mb-4">
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Más populares
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {POPULAR_JURISDICTIONS.map(j => (
                <button
                  key={j.code}
                  onClick={() => setJurisdiction(j)}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: jurisdiction?.code === j.code ? 'rgba(124,58,237,0.04)' : '#fff',
                    border: `2px solid ${jurisdiction?.code === j.code ? '#7c3aed' : 'rgba(0,0,0,0.06)'}`,
                  }}
                >
                  <span className="text-2xl">{j.flag}</span>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0a2540', display: 'block' }}>
                      {j.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{j.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search other countries */}
          <div className="mt-4">
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Otro país
            </span>
            <input
              type="text"
              placeholder="Busca un país: Reino Unido, Francia, Alemania..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: '#f8f9fb', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
            />
            {filteredCountries.length > 0 && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {filteredCountries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { setJurisdiction(c); setCountrySearch(''); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-slate-50"
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span style={{ fontSize: '13px', color: '#334155' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info tooltip */}
          <div
            className="mt-6 p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}>
                ¿No sabes qué elegir?
              </span>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.5 }}>
                Si solo vendes en España, elige "Solo en España".
                Si vendes online en toda Europa, elige "Toda la Unión Europea".
                Si no estás seguro, el profesional que contactes te asesorará.
              </p>
            </div>
          </div>

          <WizardNav onPrev={() => setStep(1)} onNext={() => setStep(3)} canNext={!!jurisdiction} />
        </div>
      )}

      {/* ═══ STEP 3: Business sectors ═══ */}
      {step === 3 && (
        <div>
          <StepHeader step={3} total={TOTAL_STEPS} title="¿A qué se dedica tu negocio?" subtitle="Selecciona todas las categorías que apliquen" />

          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className="flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                style={{
                  background: selectedCategories.includes(cat.id) ? 'rgba(124,58,237,0.04)' : '#fff',
                  border: `2px solid ${selectedCategories.includes(cat.id) ? '#7c3aed' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540', display: 'block' }}>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{cat.desc}</span>
                </div>
                {selectedCategories.includes(cat.id) && (
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#7c3aed' }} />
                )}
              </button>
            ))}
          </div>

          {selectedCategories.length > 0 && (
            <div
              className="mt-4 p-3 rounded-xl"
              style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}
            >
              <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>
                {selectedCategories.length} {selectedCategories.length === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                Esto determinará automáticamente el alcance de protección necesario.
              </span>
            </div>
          )}

          <WizardNav onPrev={() => setStep(2)} onNext={() => setStep(4)} canNext={selectedCategories.length > 0} />
        </div>
      )}

      {/* ═══ STEP 4: Details ═══ */}
      {step === 4 && (
        <div>
          <StepHeader step={4} total={TOTAL_STEPS} title="Cuéntanos un poco más" subtitle="Esta información ayuda a los profesionales a preparar un presupuesto preciso" />

          <div className="space-y-5">
            {/* Brand name (conditional) */}
            {(whatToProtect === 'brand_name' || whatToProtect === 'brand_logo') && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  ¿Cómo se llama tu marca?
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ej: Luna Verde"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }}
                />
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  🔒 Este nombre se compartirá SOLO con el profesional que aceptes.
                </p>
              </div>
            )}

            {/* Has logo (conditional) */}
            {whatToProtect === 'brand_logo' && (
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  ¿Tienes el logo diseñado?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: true, label: 'Sí, tengo el logo' },
                    { val: false, label: 'No, solo el nombre' },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setHasLogo(opt.val)}
                      className="p-3 rounded-xl text-sm font-semibold"
                      style={{
                        background: hasLogo === opt.val ? 'rgba(124,58,237,0.04)' : '#fff',
                        border: `2px solid ${hasLogo === opt.val ? '#7c3aed' : 'rgba(0,0,0,0.06)'}`,
                        color: '#334155',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional info */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                ¿Algo más que debamos saber? (opcional)
              </label>
              <textarea
                rows={3}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Ej: Ya estamos operando desde hace 2 años, vendemos online en toda Europa..."
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#334155' }}
              />
            </div>

            {/* Urgency */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                ¿Cuánta prisa tienes?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'urgent' as const, label: '⚡ Urgente', desc: 'Lo antes posible', color: '#ef4444' },
                  { value: 'normal' as const, label: 'Normal', desc: 'Próximas semanas', color: '#7c3aed' },
                  { value: 'flexible' as const, label: 'Sin prisa', desc: 'Cuando sea', color: '#10b981' },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setUrgency(opt.value)}
                    className="p-3 rounded-xl text-center"
                    style={{
                      background: urgency === opt.value ? `${opt.color}08` : '#fff',
                      border: `2px solid ${urgency === opt.value ? opt.color : 'rgba(0,0,0,0.06)'}`,
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: urgency === opt.value ? opt.color : '#334155' }}>
                      {opt.label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                ¿Tienes un presupuesto en mente? (opcional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_RANGES.map(range => (
                  <button
                    key={range.id}
                    type="button"
                    onClick={() => setBudget(prev => prev?.id === range.id ? null : range)}
                    className="p-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: budget?.id === range.id ? 'rgba(124,58,237,0.04)' : '#fff',
                      border: `2px solid ${budget?.id === range.id ? '#7c3aed' : 'rgba(0,0,0,0.06)'}`,
                      color: '#334155',
                    }}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                No te preocupes por acertar — recibirás presupuestos detallados de varios profesionales para comparar.
              </p>
            </div>
          </div>

          <WizardNav onPrev={() => setStep(3)} onNext={() => setStep(5)} canNext />
        </div>
      )}

      {/* ═══ STEP 5: Summary & publish ═══ */}
      {step === 5 && (
        <div>
          <StepHeader step={5} total={TOTAL_STEPS} title="Todo listo. Revisa tu solicitud." subtitle="Profesionales especializados recibirán tu solicitud y te enviarán presupuestos personalizados." />

          {/* Summary card */}
          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="space-y-4">
              <SummaryRow label="Servicio" value={getProtectionLabel(whatToProtect!)} />
              <SummaryRow
                label="Protección en"
                value={
                  <span className="flex items-center gap-1.5">
                    <span>{jurisdiction?.flag}</span> {jurisdiction?.name}
                  </span>
                }
              />
              <SummaryRow label="Sector" value={getCategoryLabels(selectedCategories)} />
              <SummaryRow
                label="Urgencia"
                value={urgency === 'urgent' ? '⚡ Urgente' : urgency === 'normal' ? 'Normal' : 'Sin prisa'}
              />
              {budget && <SummaryRow label="Presupuesto" value={budget.label} border={false} />}
            </div>
          </div>

          {/* What happens next */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '12px' }}>
              ¿Qué pasa después?
            </h4>
            <div className="space-y-3">
              {[
                'Profesionales especializados en tu zona recibirán tu solicitud',
                'Recibirás varios presupuestos detallados para comparar (precio, plazo, experiencia)',
                'Puedes chatear con cualquier profesional antes de decidir',
                'Eliges al que prefieras y pagas con Pago Protegido — tu dinero está seguro hasta que confirmes el resultado',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-white text-[10px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Free to publish */}
          <div className="text-center mb-5">
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              📋 Publicar tu solicitud es{' '}
              <strong style={{ color: '#10b981' }}>completamente gratis</strong> y sin compromiso.
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="relative w-full py-4 rounded-2xl text-base font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Publicando...
              </span>
            ) : (
              'Publicar mi solicitud gratis'
            )}
            <span
              className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
          </button>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Pago Protegido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Agentes verificados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Respuesta en &lt;24h</span>
            </div>
          </div>

          <div className="mt-4">
            <WizardNav onPrev={() => setStep(4)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <span
        className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-3"
        style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}
      >
        Paso {step} de {total}
      </span>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0a2540' }}>{title}</h2>
      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{subtitle}</p>
    </div>
  );
}

function WizardNav({ onPrev, onNext, canNext }: { onPrev?: () => void; onNext?: () => void; canNext?: boolean }) {
  return (
    <div className="flex justify-between pt-6">
      {onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
        >
          <ChevronLeft className="w-3 h-3" /> Atrás
        </button>
      ) : (
        <div />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          Continuar <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value, border = true }: { label: string; value: React.ReactNode; border?: boolean }) {
  return (
    <div
      className="flex justify-between items-center"
      style={border ? { paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.04)' } : undefined}
    >
      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{value}</span>
    </div>
  );
}
