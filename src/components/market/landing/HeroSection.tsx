import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle, Globe, Zap, Store, Sparkles, Star, BadgeCheck } from 'lucide-react';

interface HeroSectionProps {
  onParticularClick?: () => void;
}

export function HeroSection({ onParticularClick }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #14213D 40%, #1B2D4F 100%)' }}>

      {/* === LAYER 1: Gold orb glow === */}
      <div className="absolute pointer-events-none"
        style={{
          top: '-15%', right: '5%',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(252,163,17,0.12) 0%, rgba(252,163,17,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      {/* Blue secondary orb */}
      <div className="absolute pointer-events-none"
        style={{
          bottom: '-10%', left: '-5%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }} />

      {/* === LAYER 2: Grid mesh === */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* === LAYER 3: Bottom fade === */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #F8F9FC, transparent)' }} />

      {/* === HEADER NAV === */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(252,163,17,0.15)', border: '1px solid rgba(252,163,17,0.2)' }}>
              <Store className="w-4.5 h-4.5" style={{ color: '#FCA311' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '19px', color: '#fff', letterSpacing: '-0.02em' }}>
              IP-Market
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/[0.06]"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(252,163,17,0.15)', border: '1px solid rgba(252,163,17,0.25)', color: '#FCA311' }}>
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* === HERO CONTENT — 2 columns === */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-12 md:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT — Text */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                  style={{ background: 'rgba(252,163,17,0.08)', border: '1px solid rgba(252,163,17,0.15)' }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#FCA311' }} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                    El primer marketplace de Propiedad Intelectual
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#fff' }}>
                Protege tu marca.
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #FCA311 0%, #FFB833 50%, #FCD34D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Sin complicaciones.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginTop: '24px', maxWidth: '480px', lineHeight: 1.7 }}>
                Conectamos empresas con los mejores profesionales de Propiedad Intelectual.
                Presupuestos gratis, pago protegido, cero riesgo.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 mt-10">
                {/* Gold CTA */}
                <button
                  onClick={onParticularClick}
                  className="group relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #FCA311, #E8930A)',
                    color: '#14213D',
                    boxShadow: '0 0 50px rgba(252,163,17,0.2), 0 4px 24px rgba(252,163,17,0.15)',
                  }}>
                  Proteger mi marca — Gratis
                  <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                </button>
                {/* Secondary CTA */}
                <button
                  onClick={() => navigate('/app/market')}
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-medium transition-all hover:bg-white/[0.06]"
                  style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Soy profesional IP
                  <ArrowRight className="w-4 h-4" style={{ opacity: 0.5 }} />
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-wrap gap-x-6 gap-y-3 mt-12">
                {[
                  { icon: ShieldCheck, text: 'Pago 100% Protegido' },
                  { icon: CheckCircle, text: 'Agentes verificados' },
                  { icon: Globe, text: '+190 jurisdicciones' },
                  { icon: Zap, text: 'Presupuestos en <24h' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" style={{ color: 'rgba(252,163,17,0.5)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Glassmorphism product visual */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative hidden lg:block">

              {/* Gold orb behind */}
              <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(252,163,17,0.1), transparent 70%)', filter: 'blur(40px)' }} />

              {/* Main glass container */}
              <div className="relative rounded-3xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                }}>

                {/* Sample request card */}
                <div className="rounded-2xl p-5 mb-4"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(252,163,17,0.15)', color: '#FCA311' }}>
                      Registro de Marca
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>🇪🇸 España</span>
                  </div>
                  <p className="text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Marca denominativa en 3 categorías
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>6 propuestas</span>
                    <span className="text-xs font-medium" style={{ color: '#FCA311' }}>Ver propuestas →</span>
                  </div>
                </div>

                {/* Agent proposal cards */}
                <div className="space-y-2.5">
                  {[
                    { name: 'García & Asociados', rating: '4.9', price: '€1.200', flag: '🇪🇸' },
                    { name: 'IP Solutions GmbH', rating: '4.8', price: '€980', flag: '🇩🇪' },
                    { name: 'TradeMark Pro UK', rating: '4.7', price: '€1.450', flag: '🇬🇧' },
                  ].map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1B2D4F, #14213D)', color: '#FCA311', border: '1px solid rgba(252,163,17,0.2)' }}>
                        {agent.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            {agent.name}
                          </span>
                          <BadgeCheck className="w-3 h-3 shrink-0" style={{ color: '#FCA311' }} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#FCA311' }}>
                            <Star className="w-2.5 h-2.5 fill-current" /> {agent.rating}
                          </span>
                          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{agent.flag}</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#fff' }}>{agent.price}</span>
                    </div>
                  ))}
                </div>

                {/* Protected payment bar */}
                <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                  <div>
                    <span className="text-xs font-semibold" style={{ color: '#10B981' }}>Pago Protegido activo</span>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(16,185,129,0.6)' }}>
                      Tu dinero seguro hasta confirmar entrega
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
