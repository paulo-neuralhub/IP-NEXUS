import * as React from 'react';
import { useState } from 'react';
import {
  Star, CheckCircle, Clock, Shield, Globe, Briefcase,
  Edit3, Save, X, User, Building2, ExternalLink, Check,
  Award, MessageSquare, CreditCard, XCircle, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentMarketUser, useUpdateMarketUser } from '@/hooks/market/useMarketUsers';
import { useMarketUserReviews, useReviewsSummary } from '@/hooks/market/useMarketUserReviews';
import { useMarketProfile, useUpdateMarketProfile } from '@/hooks/use-market';
import { useMarketConnectStatus, useMarketConnectOnboard, useMarketConnectDashboard } from '@/hooks/market/useMarketStripeConnect';
import { KYC_LEVEL_CONFIG, type KycLevel } from '@/types/market.types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// ── Helpers ──

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className="shrink-0"
          style={{
            width: size, height: size,
            color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0',
            fill: s <= Math.round(rating) ? '#f59e0b' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ──

export default function ProfilePage() {
  const { data: marketUser, isLoading: loadingUser } = useCurrentMarketUser();
  const { data: legacyProfile, isLoading: loadingProfile } = useMarketProfile();
  const { data: reviews } = useMarketUserReviews(marketUser?.id);
  const { data: reviewsSummary } = useReviewsSummary(marketUser?.id);

  const [editing, setEditing] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);

  if (loadingUser || loadingProfile) return <LoadingSkeleton />;

  // Merge data from both sources
  const profile = marketUser || legacyProfile;
  const displayName = (marketUser?.display_name || legacyProfile?.display_name || 'Usuario');
  const companyName = (marketUser?.company_name || legacyProfile?.company_name || '');
  const bio = (marketUser?.bio || legacyProfile?.bio || '');
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const isVerified = marketUser?.is_verified_agent || false;
  const jurisdictions: string[] = marketUser?.jurisdictions || [];
  const specializations: string[] = marketUser?.specializations || [];
  const ratingAvg = reviewsSummary?.avgOverall || marketUser?.rating_avg || 0;
  const ratingsCount = reviewsSummary?.count || marketUser?.ratings_count || 0;
  const kycLevel = ((legacyProfile as any)?.kyc_level || 'none') as KycLevel;
  const kycConfig = KYC_LEVEL_CONFIG[kycLevel];

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ═══ Profile Header Card ═══ */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #0a2540, #1e3a5f)' }}
          >
            {marketUser?.avatar_url ? (
              <img src={marketUser.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540' }}>{displayName}</h2>
              {isVerified && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(0,180,216,0.08)' }}
                >
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: '#00b4d8' }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#00b4d8' }}>AGENTE VERIFICADO</span>
                </div>
              )}
              {/* Edit toggle */}
              <button
                onClick={() => setEditing(!editing)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
              >
                <Edit3 className="w-3 h-3" /> {editing ? 'Cancelar' : 'Editar perfil'}
              </button>
            </div>
            {companyName && (
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{companyName}</p>
            )}
            {bio && (
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', maxWidth: '600px' }}>{bio}</p>
            )}

            {/* Agent metrics strip */}
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>
                  {ratingAvg > 0 ? ratingAvg.toFixed(1) : '—'}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>({ratingsCount} valoraciones)</span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                <strong style={{ color: '#0a2540' }}>{marketUser?.successful_transactions || 0}</strong> trabajos
              </span>
              {marketUser?.response_time_avg != null && marketUser.response_time_avg > 0 && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Responde en <strong style={{ color: '#0a2540' }}>{Math.round(marketUser.response_time_avg / 60)}h</strong>
                </span>
              )}
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Miembro desde <strong style={{ color: '#0a2540' }}>{formatDate(marketUser?.created_at)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Jurisdictions */}
        {jurisdictions.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Jurisdicciones
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {jurisdictions.map(j => (
                <span
                  key={j}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)', color: '#334155' }}
                >
                  <Globe className="w-3 h-3" style={{ color: '#94a3b8' }} /> {j}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specializations / Services */}
        {specializations.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Servicios
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {specializations.map(s => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{ background: 'rgba(0,180,216,0.06)', color: '#00b4d8' }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Edit Form (conditional) ═══ */}
      {editing && (
        <EditProfileForm
          marketUser={marketUser}
          legacyProfile={legacyProfile}
          onClose={() => setEditing(false)}
        />
      )}

      {/* ═══ Business Data Card ═══ */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}>
              <Building2 className="w-5 h-5" style={{ color: '#0a2540' }} />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Datos del Despacho</h3>
          </div>
          <button onClick={() => setEditingBusiness(!editingBusiness)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
            <Edit3 className="w-3 h-3" /> {editingBusiness ? 'Cancelar' : 'Editar'}
          </button>
        </div>
        {editingBusiness ? (
          <BusinessDataForm marketUser={marketUser} onClose={() => setEditingBusiness(false)} />
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: 'Razón social', value: (marketUser as any)?.legal_name },
              { label: 'CIF / Tax ID', value: (marketUser as any)?.tax_id },
              { label: 'País', value: (marketUser as any)?.country },
              { label: 'Dirección', value: (marketUser as any)?.address },
              { label: 'Ciudad', value: (marketUser as any)?.city },
              { label: 'Código postal', value: (marketUser as any)?.postal_code },
              { label: 'Teléfono', value: (marketUser as any)?.phone },
              { label: 'Email profesional', value: (marketUser as any)?.professional_email },
              { label: 'Sitio web', value: (marketUser as any)?.website },
              { label: 'Nº registro profesional', value: (marketUser as any)?.professional_registration },
            ].map(item => (
              <div key={item.label}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</span>
                <span style={{ fontSize: '13px', color: item.value ? '#0a2540' : '#cbd5e1', display: 'block', fontWeight: item.value ? 500 : 400 }}>
                  {item.value || 'No completado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Verificación de Agente Card ═══ */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}>
            <Shield className="w-5 h-5" style={{ color: '#00b4d8' }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Verificación de Agente</h3>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              Los agentes verificados reciben un badge de confianza y aparecen destacados
            </p>
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
              <CheckCircle className="w-3 h-3" /> VERIFICADO
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
              PENDIENTE
            </span>
          )}
        </div>
        <div className="space-y-2">
          {[
            { label: 'Datos empresariales completos', desc: 'Razón social, CIF, dirección', done: !!(marketUser as any)?.legal_name && !!(marketUser as any)?.tax_id },
            { label: 'Datos de contacto verificados', desc: 'Teléfono y email profesional', done: !!(marketUser as any)?.phone && !!(marketUser as any)?.professional_email },
            { label: 'Al menos una jurisdicción', desc: 'Oficina IP donde puedes operar', done: jurisdictions.length > 0 },
            { label: 'Al menos un servicio', desc: 'Tipo de servicio que ofreces', done: specializations.length > 0 },
            { label: 'Cuenta de pagos configurada', desc: 'Stripe Connect para recibir pagos', done: false },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: item.done ? 'rgba(16,185,129,0.04)' : '#f8f9fa', border: `1px solid ${item.done ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.04)'}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: item.done ? 'rgba(16,185,129,0.1)' : '#f1f4f9' }}>
                {item.done ? (
                  <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                ) : (
                  <Clock className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                )}
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: item.done ? '#10b981' : '#334155' }}>{item.label}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ KYC Level Card (legacy) ═══ */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}
          >
            <Shield className="w-5 h-5" style={{ color: '#00b4d8' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Verificación de Agente</h3>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              Nivel actual: <strong style={{ color: '#0a2540' }}>{kycConfig?.name || 'Sin verificar'}</strong>
              {kycConfig?.transactionLimit && (
                <> · Límite: <strong style={{ color: '#0a2540' }}>€{kycConfig.transactionLimit.toLocaleString()}</strong></>
              )}
            </p>
          </div>
        </div>

        {/* KYC level steps */}
        <div className="flex items-center gap-1">
          {Object.entries(KYC_LEVEL_CONFIG).map(([level, config], i, arr) => {
            const isActive = level === kycLevel;
            const isPast = Object.keys(KYC_LEVEL_CONFIG).indexOf(kycLevel) >= i;
            return (
              <React.Fragment key={level}>
                <div
                  className="flex-1 py-2 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={
                    isActive
                      ? {
                          background: '#f1f4f9',
                          boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                          color: '#00b4d8',
                          border: '1px solid rgba(0,180,216,0.15)',
                        }
                      : isPast
                      ? { background: 'rgba(0,180,216,0.06)', color: '#00b4d8' }
                      : { background: '#f8fafc', color: '#94a3b8' }
                  }
                >
                  {config.name}
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="w-4 h-0.5 rounded-full"
                    style={{ background: isPast ? '#00b4d8' : '#e8ecf3' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ═══ Stripe Connect Card ═══ */}
      <StripeConnectCard />

      {/* ═══ Reviews Section ═══ */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>
            Valoraciones recientes
          </h3>
          {reviewsSummary && reviewsSummary.count > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={reviewsSummary.avgOverall} size={14} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>
                {reviewsSummary.avgOverall.toFixed(1)}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                ({reviewsSummary.count})
              </span>
            </div>
          )}
        </div>

        {/* Rating distribution */}
        {reviewsSummary && reviewsSummary.count > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-5 p-3 rounded-xl" style={{ background: '#f8fafc' }}>
            {[
              { label: 'General', value: reviewsSummary.avgOverall },
              { label: 'Comunicación', value: reviewsSummary.avgCommunication },
              { label: 'Calidad', value: reviewsSummary.avgQuality },
              { label: 'Puntualidad', value: reviewsSummary.avgTimeliness },
              { label: 'Valor', value: reviewsSummary.avgValue },
            ].map(cat => (
              <div key={cat.label} className="text-center">
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
                  {cat.value > 0 ? cat.value.toFixed(1) : '—'}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Individual reviews */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review: any) => (
              <div
                key={review.id}
                className="p-4 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.03)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #334155, #475569)' }}
                  >
                    {(review.reviewer?.display_name || 'A')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}>
                      {review.reviewer?.display_name || 'Anónimo'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '8px' }}>
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <StarRating rating={review.rating_overall || 0} size={12} />
                </div>
                {review.title && (
                  <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540', marginBottom: '4px' }}>
                    {review.title}
                  </h4>
                )}
                {review.comment && (
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{review.comment}</p>
                )}
                {review.response && (
                  <div className="mt-3 ml-4 pl-3" style={{ borderLeft: '2px solid rgba(0,180,216,0.2)' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#00b4d8' }}>Respuesta:</span>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#f1f4f9', boxShadow: '4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff' }}
            >
              <Star className="w-5 h-5" style={{ color: '#94a3b8' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Aún sin valoraciones</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Las valoraciones de tus clientes aparecerán aquí tras completar transacciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Edit Profile Form ──

function EditProfileForm({
  marketUser,
  legacyProfile,
  onClose,
}: {
  marketUser: any;
  legacyProfile: any;
  onClose: () => void;
}) {
  const updateMarketUser = useUpdateMarketUser();
  const updateLegacy = useUpdateMarketProfile();

  const [form, setForm] = useState({
    display_name: marketUser?.display_name || legacyProfile?.display_name || '',
    bio: marketUser?.bio || legacyProfile?.bio || '',
    company_name: marketUser?.company_name || legacyProfile?.company_name || '',
    website: legacyProfile?.website || '',
    linkedin_url: legacyProfile?.linkedin_url || '',
  });

  const handleSave = async () => {
    try {
      if (marketUser?.id) {
        await updateMarketUser.mutateAsync({
          id: marketUser.id,
          display_name: form.display_name,
          bio: form.bio,
          company_name: form.company_name,
        } as any);
      }
      // Also update legacy profile if exists
      if (legacyProfile) {
        await updateLegacy.mutateAsync({
          display_name: form.display_name,
          bio: form.bio,
          company_name: form.company_name,
          website: form.website,
          linkedin_url: form.linkedin_url,
        } as any);
      }
      toast.success('Perfil actualizado');
      onClose();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const isSaving = updateMarketUser.isPending || updateLegacy.isPending;

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Editar perfil</h3>
        <button onClick={onClose}>
          <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
        </button>
      </div>

      <div className="space-y-4">
        <FormField label="Nombre público" value={form.display_name} onChange={v => setForm({ ...form, display_name: v })} />
        <FormField label="Empresa" value={form.company_name} onChange={v => setForm({ ...form, company_name: v })} />
        <FormField label="Biografía" value={form.bio} onChange={v => setForm({ ...form, bio: v })} multiline />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sitio web" value={form.website} onChange={v => setForm({ ...form, website: v })} placeholder="https://" />
          <FormField label="LinkedIn" value={form.linkedin_url} onChange={v => setForm({ ...form, linkedin_url: v })} placeholder="https://linkedin.com/in/..." />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}
          >
            <Save className="w-3 h-3" /> {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Field ──

function FormField({
  label, value, onChange, multiline, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const shared = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder,
    className: 'w-full px-3 py-2 rounded-lg text-sm outline-none',
    style: {
      background: '#f8fafc',
      border: '1px solid rgba(0,0,0,0.06)',
      color: '#0a2540',
      fontSize: '13px',
    } as React.CSSProperties,
  };

  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      {multiline ? <textarea {...shared} rows={3} /> : <input {...shared} />}
    </div>
  );
}

// ── Business Data Form ──

function BusinessDataForm({ marketUser, onClose }: { marketUser: any; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    legal_name: (marketUser as any)?.legal_name || '',
    tax_id: (marketUser as any)?.tax_id || '',
    country: (marketUser as any)?.country || '',
    address: (marketUser as any)?.address || '',
    city: (marketUser as any)?.city || '',
    postal_code: (marketUser as any)?.postal_code || '',
    phone: (marketUser as any)?.phone || '',
    professional_email: (marketUser as any)?.professional_email || '',
    website: (marketUser as any)?.website || '',
    professional_registration: (marketUser as any)?.professional_registration || '',
  });

  const handleSave = async () => {
    if (!marketUser?.id) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('market_users')
        .update(form)
        .eq('id', marketUser.id);
      if (error) throw error;
      toast.success('Datos empresariales guardados');
      onClose();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'legal_name', label: 'Razón social', placeholder: 'Ej: García & Asociados S.L.' },
    { key: 'tax_id', label: 'CIF / NIF / Tax ID', placeholder: 'Ej: B12345678' },
    { key: 'country', label: 'País', placeholder: 'España' },
    { key: 'address', label: 'Dirección profesional', placeholder: 'Calle, número, piso...' },
    { key: 'city', label: 'Ciudad', placeholder: 'Madrid' },
    { key: 'postal_code', label: 'Código postal', placeholder: '28001' },
    { key: 'phone', label: 'Teléfono profesional', placeholder: '+34 91 000 0000' },
    { key: 'professional_email', label: 'Email profesional', placeholder: 'info@despacho.com' },
    { key: 'website', label: 'Sitio web (opcional)', placeholder: 'https://' },
    { key: 'professional_registration', label: 'Nº colegiado / registro (opcional)', placeholder: '' },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <FormField key={f.key} label={f.label} placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))} />
        ))}
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold"
          style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
          <Save className="w-3 h-3" /> {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

// ── Stripe Connect Card ──

function StripeConnectCard() {
  const { data: connectStatus, isLoading } = useMarketConnectStatus();
  const onboard = useMarketConnectOnboard();
  const dashboard = useMarketConnectDashboard();

  const status = connectStatus?.status || 'not_created';
  const isOnboarding = onboard.isPending;
  const isOpening = dashboard.isPending;

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    not_created: { label: 'No configurado', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
    pending: { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
    active: { label: 'Activo', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    restricted: { label: 'Restringido', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  };
  const sc = statusLabels[status] || statusLabels.not_created;

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}
          >
            <CreditCard className="w-5 h-5" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Pagos — Stripe Connect</h3>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              {status === 'not_created'
                ? 'Configura tu cuenta para recibir pagos de transacciones'
                : status === 'active'
                ? 'Tu cuenta está lista para recibir pagos'
                : 'Completa la verificación para activar pagos'}
            </p>
          </div>
        </div>
        <span
          className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{ background: sc.bg, color: sc.color }}
        >
          {sc.label}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-2/3 rounded-lg" />
        </div>
      ) : status === 'not_created' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Building2, label: 'Información del negocio', desc: 'Datos básicos de tu empresa' },
              { icon: Shield, label: 'Verificación de Agente', desc: 'Stripe verifica tu identidad' },
              { icon: CreditCard, label: 'Cuenta bancaria', desc: 'Para recibir tus pagos' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
                <item.icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#94a3b8' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0a2540', display: 'block' }}>{item.label}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onboard.mutate(window.location.href)}
            disabled={isOnboarding}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 3px 12px rgba(99,102,241,0.15)' }}
          >
            {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {isOnboarding ? 'Configurando...' : 'Configurar cuenta de pagos'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Status checklist */}
          <div className="space-y-1.5">
            {[
              { label: 'Onboarding completado', done: connectStatus?.detailsSubmitted },
              { label: 'Cobros habilitados', done: connectStatus?.chargesEnabled },
              { label: 'Pagos habilitados', done: connectStatus?.payoutsEnabled },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                {item.done ? (
                  <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                ) : (
                  <XCircle className="w-4 h-4" style={{ color: '#94a3b8' }} />
                )}
                <span style={{ fontSize: '12px', color: item.done ? '#0a2540' : '#94a3b8' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Pending requirements */}
          {connectStatus?.requirements && connectStatus.requirements.length > 0 && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: '4px' }}>
                Acciones requeridas:
              </span>
              <ul className="space-y-1">
                {connectStatus.requirements.map((req, i) => (
                  <li key={i} style={{ fontSize: '10px', color: '#92400e' }}>• {req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            {status === 'active' ? (
              <button
                onClick={() => dashboard.mutate()}
                disabled={isOpening}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
              >
                <ExternalLink className="w-3 h-3" />
                {isOpening ? 'Abriendo...' : 'Gestionar cuenta Stripe'}
              </button>
            ) : (
              <button
                onClick={() => onboard.mutate(window.location.href)}
                disabled={isOnboarding}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {isOnboarding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                {isOnboarding ? 'Cargando...' : 'Completar configuración'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Loading Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-start gap-5">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="flex-1 h-8 rounded-lg" />)}
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
