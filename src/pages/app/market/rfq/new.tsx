import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronRight, ChevronLeft, Loader2, Check, AlertTriangle,
  Globe, FileText, Shield, Search, Scale, Palette, Gavel,
  DollarSign, Clock, Zap, Eye, ArrowLeft,
} from 'lucide-react';
import {
  useCreateRfqRequest,
  usePublishRfqRequest,
} from '@/hooks/market/useRfqRequests';
import {
  SERVICE_CATEGORY_LABELS,
  JURISDICTIONS,
  ServiceCategory,
  getServiceTypesByCategory,
} from '@/types/quote-request';
import { Skeleton } from '@/components/ui/skeleton';

// ── Service category icons ──
const CATEGORY_ICONS: Record<string, typeof Globe> = {
  trademark: Shield,
  patent: FileText,
  design: Palette,
  copyright: FileText,
  domain: Globe,
  litigation: Gavel,
  licensing: Scale,
  valuation: DollarSign,
  general: Search,
};

// ── Currency auto-detect by jurisdiction ──
const JURISDICTION_CURRENCY: Record<string, string> = {
  ES: 'EUR', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  US: 'USD', GB: 'GBP', JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', MX: 'MXN', BR: 'BRL',
  CH: 'CHF', CA: 'CAD', AU: 'AUD',
};

// ── Trademark types ──
const TRADEMARK_TYPES = [
  { value: 'word', label: 'Denominativa' },
  { value: 'figurative', label: 'Figurativa' },
  { value: 'mixed', label: 'Mixta' },
  { value: 'sound', label: 'Sonora' },
  { value: '3d', label: 'Tridimensional' },
  { value: 'color', label: 'Color' },
];

// ── Patent types ──
const PATENT_TYPES = [
  { value: 'utility', label: 'Utilidad' },
  { value: 'design', label: 'Diseño' },
  { value: 'provisional', label: 'Provisional' },
  { value: 'pct', label: 'PCT Internacional' },
];

// ── Schema ──
const formSchema = z.object({
  service_category: z.string().min(1, 'Selecciona una categoría'),
  service_type: z.string().min(1, 'Selecciona un tipo de servicio'),
  title: z.string().min(5, 'Mínimo 5 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(20, 'Describe tu necesidad (mínimo 20 caracteres)'),
  jurisdictions: z.array(z.string()).min(1, 'Selecciona al menos una jurisdicción'),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  budget_currency: z.string().default('EUR'),
  urgency: z.enum(['urgent', 'normal', 'flexible']).default('normal'),
  expiration_days: z.number().default(14),
  is_blind: z.boolean().default(true),
  max_quotes: z.number().min(1).max(10).default(5),
  // Conditional: trademark
  num_classes: z.number().optional(),
  nice_classes: z.array(z.number()).optional(),
  trademark_type: z.string().optional(),
  // Conditional: patent
  tech_area: z.string().optional(),
  prior_search_done: z.boolean().optional(),
  patent_type: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// ── Main ──

export default function CreateRfqRequestPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const createMutation = useCreateRfqRequest();
  const publishMutation = usePublishRfqRequest();

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_category: '',
      service_type: '',
      title: '',
      description: '',
      jurisdictions: [],
      budget_currency: 'EUR',
      urgency: 'normal',
      expiration_days: 14,
      is_blind: true,
      max_quotes: 5,
      nice_classes: [],
    },
  });

  const selectedCategory = watch('service_category') as ServiceCategory;
  const serviceTypes = selectedCategory ? getServiceTypesByCategory(selectedCategory) : [];
  const selectedJurisdictions = watch('jurisdictions') || [];
  const isTrademark = selectedCategory === 'trademark';
  const isPatent = selectedCategory === 'patent';

  // Auto-detect currency from first jurisdiction
  React.useEffect(() => {
    if (selectedJurisdictions.length > 0) {
      const currency = JURISDICTION_CURRENCY[selectedJurisdictions[0]] || 'EUR';
      setValue('budget_currency', currency);
    }
  }, [selectedJurisdictions, setValue]);

  const canStep1 = !!watch('service_type');
  const titleLen = watch('title')?.length || 0;
  const descLen = watch('description')?.length || 0;
  const canStep2 = titleLen >= 5 && descLen >= 20 && selectedJurisdictions.length > 0;
  const isSubmitting = createMutation.isPending || publishMutation.isPending;

  const onSubmit = async (data: FormData) => {
    try {
      const request = await createMutation.mutateAsync({
        service_category: data.service_category as any,
        service_type: data.service_type as any,
        title: data.title,
        description: data.description,
        jurisdictions: data.jurisdictions,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        budget_currency: data.budget_currency,
        urgency: data.urgency,
        is_blind: data.is_blind,
        max_quotes: data.max_quotes,
        nice_classes: data.nice_classes,
        details: {
          trademark_type: data.trademark_type,
          num_classes: data.num_classes,
          tech_area: data.tech_area,
          prior_search_done: data.prior_search_done,
          patent_type: data.patent_type,
          expiration_days: data.expiration_days,
        },
      } as any);

      await publishMutation.mutateAsync(request.id);
      navigate(`/app/market/rfq/${request.id}?from=mis-pedidos`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/app/market/rfq')}
        className="flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: '#64748b' }}
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a Mis Solicitudes
      </button>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540' }}>Nueva Solicitud</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Describe tu necesidad y recibe presupuestos de agentes verificados
        </p>
      </div>

      {/* ═══ SILK Progress Stepper ═══ */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Servicio' },
          { n: 2, label: 'Detalles' },
          { n: 3, label: 'Preferencias' },
        ].map(({ n, label }, i, arr) => (
          <React.Fragment key={n}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                style={
                  step > n
                    ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff' }
                    : step === n
                    ? {
                        background: '#f1f4f9',
                        color: '#7c3aed',
                        boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                        border: '2px solid rgba(124,58,237,0.3)',
                      }
                    : { background: '#f1f4f9', color: '#94a3b8' }
                }
              >
                {step > n ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: step === n ? '#0a2540' : '#94a3b8',
                }}
              >
                {label}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div
                className="flex-1 h-0.5 rounded-full mx-1"
                style={{ background: step > n ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e8ecf3' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ═══ STEP 1: Service Category ═══ */}
        {step === 1 && (
          <SilkCard title="¿Qué servicio necesitas?" subtitle="Selecciona la categoría y tipo de servicio de PI">
            {/* Category grid */}
            <div className="mb-5">
              <SectionLabel>Categoría</SectionLabel>
              <Controller
                name="service_category"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, config]) => {
                      const Icon = CATEGORY_ICONS[key] || Globe;
                      const selected = field.value === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            field.onChange(key);
                            setValue('service_type', '');
                          }}
                          className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                          style={
                            selected
                              ? {
                                  background: '#f1f4f9',
                                  boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                                  border: '1px solid rgba(0,180,216,0.2)',
                                }
                              : {
                                  background: '#fff',
                                  border: '1px solid rgba(0,0,0,0.06)',
                                }
                          }
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              background: selected ? 'rgba(0,180,216,0.08)' : '#f8fafc',
                            }}
                          >
                            <Icon
                              className="w-4 h-4"
                              style={{ color: selected ? '#7c3aed' : '#94a3b8' }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: selected ? '#0a2540' : '#64748b',
                            }}
                          >
                            {config.es}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Service type select */}
            {selectedCategory && serviceTypes.length > 0 && (
              <div className="mb-5">
                <SectionLabel>Tipo de servicio</SectionLabel>
                <Controller
                  name="service_type"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        background: '#f8fafc',
                        border: '1px solid rgba(0,0,0,0.06)',
                        color: field.value ? '#0a2540' : '#94a3b8',
                        fontSize: '13px',
                      }}
                    >
                      <option value="">Selecciona el servicio específico</option>
                      {serviceTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.service_type && (
                  <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.service_type.message}</p>
                )}
              </div>
            )}

            <StepNav onNext={() => setStep(2)} canNext={canStep1} />
          </SilkCard>
        )}

        {/* ═══ STEP 2: Details ═══ */}
        {step === 2 && (
          <SilkCard title="Detalles de la solicitud" subtitle="Describe tu necesidad con el mayor detalle posible">
            <ControlledInput control={control} name="title" label="Título" placeholder="Ej: Registro de marca ACME en España y UE" error={errors.title?.message} />

            <div className="mb-4">
              <SectionLabel>Descripción</SectionLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Describe tu necesidad, contexto y cualquier detalle relevante..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540', fontSize: '13px' }}
                  />
                )}
              />
              {/* Privacy warning */}
              <div
                className="flex items-start gap-2 mt-2 p-2.5 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '10px', color: '#92400e', lineHeight: 1.4 }}>
                  <strong>Privacidad:</strong> No incluyas información confidencial como nombres de marca, números de expediente o datos de clientes. Los agentes verán esta descripción antes de enviar su oferta.
                </span>
              </div>
              {errors.description && (
                <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.description.message}</p>
              )}
            </div>

            {/* Jurisdictions */}
            <div className="mb-4">
              <SectionLabel>Jurisdicciones</SectionLabel>
              <Controller
                name="jurisdictions"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {JURISDICTIONS.map(j => {
                      const selected = field.value.includes(j.code);
                      return (
                        <button
                          key={j.code}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              selected ? field.value.filter(v => v !== j.code) : [...field.value, j.code]
                            )
                          }
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                          style={
                            selected
                              ? { background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }
                              : { background: '#f8fafc', color: '#64748b', border: '1px solid rgba(0,0,0,0.06)' }
                          }
                        >
                          {j.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.jurisdictions && (
                <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors.jurisdictions.message}</p>
              )}
            </div>

            {/* ═══ Conditional: Trademark fields ═══ */}
            {isTrademark && (
              <div
                className="p-4 rounded-xl mb-4"
                style={{ background: '#f8fafc', border: '1px solid rgba(124,58,237,0.1)' }}
              >
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Datos específicos de marca
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <ControlledInput control={control} name="num_classes" label="Nº de clases" placeholder="1" type="number" />
                  <div>
                    <SectionLabel>Tipo de marca</SectionLabel>
                    <Controller
                      name="trademark_type"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-1.5">
                          {TRADEMARK_TYPES.map(t => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => field.onChange(t.value)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all"
                              style={
                                field.value === t.value
                                   ? { background: '#7c3aed', color: '#fff' }
                                  : { background: '#fff', border: '1px solid rgba(0,0,0,0.06)', color: '#64748b' }
                              }
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Conditional: Patent fields ═══ */}
            {isPatent && (
              <div
                className="p-4 rounded-xl mb-4"
                style={{ background: '#f8fafc', border: '1px solid rgba(124,58,237,0.1)' }}
              >
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Datos específicos de patente
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <ControlledInput control={control} name="tech_area" label="Área tecnológica" placeholder="Ej: Biotecnología, Software, Mecánica..." />
                  <div>
                    <SectionLabel>Tipo de patente</SectionLabel>
                    <Controller
                      name="patent_type"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-1.5">
                          {PATENT_TYPES.map(t => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => field.onChange(t.value)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all"
                              style={
                                field.value === t.value
                                   ? { background: '#7c3aed', color: '#fff' }
                                  : { background: '#fff', border: '1px solid rgba(0,0,0,0.06)', color: '#64748b' }
                              }
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Controller
                    name="prior_search_done"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center"
                          style={{
                            background: field.value ? '#7c3aed' : '#fff',
                            border: `1px solid ${field.value ? '#7c3aed' : 'rgba(0,0,0,0.15)'}`,
                          }}
                          onClick={() => field.onChange(!field.value)}
                        >
                          {field.value && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span style={{ fontSize: '12px', color: '#334155' }}>Búsqueda de anterioridades ya realizada</span>
                      </label>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Validation hints */}
            {!canStep2 && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444' }}>Para continuar necesitas:</span>
                <ul className="mt-1 space-y-0.5">
                  {titleLen < 5 && <li style={{ fontSize: '10px', color: '#ef4444' }}>• Título (mín. 5 caracteres) — actual: {titleLen}</li>}
                  {descLen < 20 && <li style={{ fontSize: '10px', color: '#ef4444' }}>• Descripción (mín. 20 caracteres) — actual: {descLen}</li>}
                  {selectedJurisdictions.length === 0 && <li style={{ fontSize: '10px', color: '#ef4444' }}>• Al menos una jurisdicción seleccionada</li>}
                </ul>
              </div>
            )}
            <StepNav onPrev={() => setStep(1)} onNext={() => setStep(3)} canNext={canStep2} />
          </SilkCard>
        )}

        {/* ═══ STEP 3: Preferences ═══ */}
        {step === 3 && (
          <SilkCard title="Presupuesto y preferencias" subtitle="Configura tus preferencias para los presupuestos">
            {/* Budget range */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <ControlledInput control={control} name="budget_min" label="Presupuesto mínimo" placeholder="0" type="number" />
              <ControlledInput control={control} name="budget_max" label="Presupuesto máximo" placeholder="Sin límite" type="number" />
              <div>
                <SectionLabel>Moneda</SectionLabel>
                <Controller
                  name="budget_currency"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540', fontSize: '13px' }}
                    >
                      {['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Urgency */}
            <div className="mb-5">
              <SectionLabel>Urgencia</SectionLabel>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'urgent', label: 'Urgente', desc: '< 1 semana', icon: Zap, color: '#ef4444' },
                      { value: 'normal', label: 'Normal', desc: '1-4 semanas', icon: Clock, color: '#f59e0b' },
                      { value: 'flexible', label: 'Flexible', desc: 'Sin prisa', icon: Eye, color: '#10b981' },
                    ].map(opt => {
                      const selected = field.value === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className="p-3 rounded-xl text-left transition-all"
                          style={
                            selected
                              ? {
                                  background: '#f1f4f9',
                                  boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                                  border: `1px solid ${opt.color}33`,
                                }
                              : { background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }
                          }
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <opt.icon className="w-3.5 h-3.5" style={{ color: selected ? opt.color : '#94a3b8' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: selected ? '#0a2540' : '#64748b' }}>
                              {opt.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Expiration */}
            <div className="mb-5">
              <SectionLabel>Expiración de la solicitud</SectionLabel>
              <Controller
                name="expiration_days"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {[7, 14, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => field.onChange(d)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={
                          field.value === d
                            ? { background: '#0a2540', color: '#fff' }
                            : { background: '#f8fafc', color: '#64748b', border: '1px solid rgba(0,0,0,0.06)' }
                        }
                      >
                        {d} días
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Max quotes & blind */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <SectionLabel>Máx. presupuestos</SectionLabel>
                <Controller
                  name="max_quotes"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={e => field.onChange(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540', fontSize: '13px' }}
                    >
                      {[3, 5, 7, 10].map(n => (
                        <option key={n} value={n}>{n} presupuestos</option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div>
                <SectionLabel>Modo ciego</SectionLabel>
                <Controller
                  name="is_blind"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{
                          background: field.value ? '#7c3aed' : '#fff',
                          border: `1px solid ${field.value ? '#7c3aed' : 'rgba(0,0,0,0.15)'}`,
                        }}
                        onClick={() => field.onChange(!field.value)}
                      >
                        {field.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span style={{ fontSize: '12px', color: '#334155' }}>Presupuestos ciegos</span>
                    </label>
                  )}
                />
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  Los agentes no verán los presupuestos de otros
                </p>
              </div>
            </div>

            <StepNav
              onPrev={() => setStep(2)}
              isSubmit
              isSubmitting={isSubmitting}
              submitLabel="Publicar Solicitud"
            />
          </SilkCard>
        )}
      </form>
    </div>
  );
}

// ── Shared Sub-components ──

function SilkCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', marginBottom: '2px' }}>{title}</h2>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>{subtitle}</p>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase' as const,
        display: 'block',
        marginBottom: '6px',
        letterSpacing: '0.3px',
      }}
    >
      {children}
    </label>
  );
}

function ControlledInput({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  error,
}: {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div className="mb-4">
      <SectionLabel>{label}</SectionLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            value={field.value ?? ''}
            onChange={e =>
              field.onChange(type === 'number' ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value)
            }
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540', fontSize: '13px' }}
          />
        )}
      />
      {error && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

function StepNav({
  onPrev,
  onNext,
  canNext,
  isSubmit,
  isSubmitting,
  submitLabel,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  canNext?: boolean;
  isSubmit?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-between pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
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
      {isSubmit ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          Continuar <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
