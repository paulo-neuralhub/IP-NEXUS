import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, FileText, PenTool, Gavel, User, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const QUICK_CATEGORIES = [
  { key: 'trademark', label: 'Marcas', icon: Tag },
  { key: 'patent', label: 'Patentes', icon: FileText },
  { key: 'design', label: 'Diseños', icon: PenTool },
  { key: 'litigation', label: 'Litigios', icon: Gavel },
];

interface HeroSectionProps {
  onParticularClick?: () => void;
  onSelectorClick?: () => void;
}

export function HeroSection({ onParticularClick, onSelectorClick }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-market/5 via-purple-50 to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-market/10 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            🚀 La plataforma líder de servicios de PI
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-secondary leading-tight">
            El Marketplace de{' '}
            <span className="text-market">Propiedad Intelectual</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mt-6 max-w-2xl">
            Conectamos empresas con los mejores profesionales de PI. 
            Solicita presupuestos, compara y contrata con total confianza.
          </p>
          
          {/* Dual CTA — Particular vs Professional */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <button
              onClick={onParticularClick}
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'block' }}>
                  Proteger mi marca
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                  Soy empresa o particular
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/60 ml-auto shrink-0" />
            </button>

            <Link
              to="/login"
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg no-underline"
              style={{
                background: '#fff',
                border: '2px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(124,58,237,0.08)' }}>
                <Briefcase className="w-5 h-5" style={{ color: '#7c3aed' }} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
                  Soy profesional IP
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Agente, abogado o despacho
                </span>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Pago Protegido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '11px', color: '#64748b' }}>✅ Agentes verificados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '11px', color: '#64748b' }}>⚡ Respuesta en &lt;24h</span>
            </div>
          </div>
          
          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={`/market/agents?category=${cat.key}`}
                className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border hover:border-market hover:shadow-md transition-all"
              >
                <cat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
