import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, CheckCircle, Globe, Zap, Store, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onParticularClick?: () => void;
}

export function HeroSection({ onParticularClick }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(145deg, #0F0A2A 0%, #1E1B4B 30%, #312E81 60%, #3B1F7E 100%)' }}>

      {/* === LAYER 1: Orb glow === */}
      <div className="absolute pointer-events-none"
        style={{
          top: '-20%', right: '-10%',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      <div className="absolute pointer-events-none"
        style={{
          bottom: '-10%', left: '-5%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }} />

      {/* === LAYER 2: Grid mesh (Vercel-style) === */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* === LAYER 3: Dot pattern === */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* === LAYER 4: Bottom fade === */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #F5F3FF, transparent)' }} />

      {/* === HEADER NAV === */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Store className="w-4.5 h-4.5 text-white" />
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* === HERO CONTENT === */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-12 md:py-0">
          <div className="max-w-3xl">

            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
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
              style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#fff' }}>
              Protege tu marca.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 50%, #818CF8 100%)',
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
              style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginTop: '24px', maxWidth: '520px', lineHeight: 1.7 }}>
              Conectamos empresas con los mejores profesionales de Propiedad Intelectual.
              Presupuestos gratis, pago protegido, sin riesgo.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 mt-10">

              {/* Primary CTA */}
              <button
                onClick={onParticularClick}
                className="group relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  boxShadow: '0 0 50px rgba(124,58,237,0.3), 0 4px 24px rgba(124,58,237,0.25)',
                }}>
                Proteger mi marca — Gratis
                <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: '0 0 60px rgba(124,58,237,0.4), inset 0 0 20px rgba(255,255,255,0.05)' }} />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => navigate('/app/market')}
                className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-medium transition-all hover:bg-white/[0.08]"
                style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                  <item.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* === FLOATING MOCKUP === */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-8 hidden lg:block"
        style={{ marginTop: '-40px' }}>
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}>
          {/* Window bar */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                ipmarket.ip-nexus.com
              </div>
            </div>
          </div>
          {/* Content preview */}
          <div className="p-6">
            {/* Mini header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md" style={{ background: 'rgba(124,58,237,0.3)' }} />
                <div className="w-16 h-2.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="px-3 py-1.5 rounded-lg" style={{ background: i === 1 ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)' }}>
                    <div className="w-10 h-2 rounded" style={{ background: i === 1 ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)' }} />
                  </div>
                ))}
              </div>
            </div>
            {/* Mini cards grid */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded" style={{ background: 'rgba(124,58,237,0.2)' }} />
                    <div className="w-20 h-2 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="w-full h-2 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="w-3/4 h-2 rounded mb-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-2 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="px-3 py-1 rounded-lg" style={{ background: 'rgba(124,58,237,0.15)' }}>
                      <div className="w-14 h-2 rounded" style={{ background: 'rgba(124,58,237,0.4)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Reflection */}
        <div className="h-20 -mt-1" style={{
          background: 'linear-gradient(to bottom, rgba(124,58,237,0.05), transparent)',
          filter: 'blur(20px)',
          transform: 'scaleY(-0.3)',
        }} />
      </motion.div>
    </section>
  );
}
