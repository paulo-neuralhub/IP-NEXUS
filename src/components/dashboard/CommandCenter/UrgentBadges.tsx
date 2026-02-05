// =============================================
// COMPONENTE: UrgentBadges
// 3 cajas urgentes con LED sutil solo en el badge
// SILK Design System
// =============================================

import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface UrgentBadgeData {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  value: number;
  href?: string;
  ledColor: string;
  footerText: string;
}

interface UrgentBadgesProps {
  plazosHoy: number;
  expedientesUrgentes: number;
  alertasSpider: number;
  plazosUrgentes?: number;
}

export function UrgentBadges({ 
  plazosHoy, 
  expedientesUrgentes, 
  alertasSpider,
  plazosUrgentes = 0 
}: UrgentBadgesProps) {
  // Calcular plazos urgentes (próximos 7 días) si no se proporciona
  const plazosUrgentesValue = plazosUrgentes || plazosHoy;

  const badges: UrgentBadgeData[] = [
    {
      id: 'expedientes-urgentes',
      icon: '⚠️',
      label: 'Expedientes Urgentes',
      sublabel: 'Marcados como urgentes',
      value: expedientesUrgentes,
      href: '/app/expedientes?filter=urgent',
      ledColor: '#ef4444', // red-400
      footerText: 'Requieren atención inmediata',
    },
    {
      id: 'alertas-spider',
      icon: '🕷️',
      label: 'Alertas Spider',
      sublabel: 'Conflictos detectados',
      value: alertasSpider,
      href: '/app/spider',
      ledColor: '#fb923c', // orange-400
      footerText: 'Similitudes críticas',
    },
    {
      id: 'plazos-urgentes',
      icon: '⏰',
      label: 'Plazos Urgentes',
      sublabel: 'Vencen en 7 días o menos',
      value: plazosUrgentesValue,
      href: '/app/expedientes?tab=plazos&filter=urgent',
      ledColor: '#fbbf24', // amber-400
      footerText: 'Próximos a vencer',
    },
  ];

  // Solo mostrar badges que tienen valores > 0
  const activeBadges = badges.filter(b => b.value > 0);

  if (activeBadges.length === 0) return null;

  return (
    <>
      {/* LED animation styles */}
      <style>{`
        @keyframes led-pulse-ultra {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            filter: brightness(1) saturate(1.2);
          }
          50% { 
            opacity: 0.85; 
            transform: scale(1.04);
            filter: brightness(1.3) saturate(1.4);
          }
        }
        @keyframes led-pulse-slow {
          0%, 100% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.12);
          }
        }
        @keyframes led-pulse-medium {
          0%, 100% { 
            opacity: 0.7; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.08);
          }
        }
        @keyframes led-pulse-fast {
          0%, 100% { 
            opacity: 0.8; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.05);
          }
        }
        .led-glow-xl {
          animation: led-pulse-slow 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-glow-outer {
          animation: led-pulse-medium 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-glow-middle {
          animation: led-pulse-fast 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-glow-ring {
          animation: led-pulse-ultra 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {activeBadges.map((badge) => (
          <UrgentBadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </>
  );
}

function UrgentBadgeCard({ badge }: { badge: UrgentBadgeData }) {
  const content = (
    <div 
      className={cn(
        "rounded-[14px] p-4 transition-all duration-300",
        "border hover:scale-[1.01] cursor-pointer"
      )}
      style={{
        background: '#f1f4f9',
        borderColor: 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{badge.icon}</span>
            <span 
              className="text-[13px] font-bold tracking-[0.15px]"
              style={{ color: '#0a2540' }}
            >
              {badge.label}
            </span>
          </div>
          <p 
            className="text-[11px] mt-0.5"
            style={{ color: '#64748b' }}
          >
            {badge.sublabel}
          </p>
        </div>
        
        {/* NeoBadge con LED ULTRA INTENSO - 4 capas de glow */}
        <div className="relative flex-shrink-0">
          {/* Capa 1: Glow XL exterior - MUY VISIBLE */}
          <div 
            className="absolute -inset-4 rounded-3xl led-glow-xl"
            style={{
              background: `${badge.ledColor}35`,
              filter: 'blur(16px)',
            }}
          />
          
          {/* Capa 2: Glow exterior grande - INTENSA */}
          <div 
            className="absolute -inset-3 rounded-2xl led-glow-outer"
            style={{
              background: `${badge.ledColor}45`,
              filter: 'blur(12px)',
            }}
          />
          
          {/* Capa 3: Glow medio - MÁS BRILLANTE */}
          <div 
            className="absolute -inset-2 rounded-xl led-glow-middle"
            style={{
              background: `${badge.ledColor}55`,
              filter: 'blur(8px)',
            }}
          />
          
          {/* Capa 4: Glow cercano - ULTRA BRILLANTE */}
          <div 
            className="absolute -inset-1 rounded-xl led-glow-ring"
            style={{
              background: `${badge.ledColor}65`,
              filter: 'blur(4px)',
            }}
          />
          
          {/* Badge neumórfico con LED INTENSO */}
          <div
            className="relative flex items-center justify-center led-glow-ring"
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#f1f4f9',
              boxShadow: `
                4px 4px 10px #cdd1dc, 
                -4px -4px 10px #ffffff,
                0 0 12px ${badge.ledColor}e6,
                0 0 24px ${badge.ledColor}b3,
                0 0 36px ${badge.ledColor}80,
                0 0 48px ${badge.ledColor}4d,
                inset 0 0 12px ${badge.ledColor}66
              `,
              border: `3px solid ${badge.ledColor}cc`,
            }}
          >
            {/* Gradient inferior más intenso */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: `linear-gradient(to top, ${badge.ledColor}30, transparent)`,
                borderRadius: 14,
              }}
            />
            
            {/* Línea base más brillante */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '15%',
                right: '15%',
                height: 3,
                background: badge.ledColor,
                borderRadius: 3,
                opacity: 0.7,
                boxShadow: `0 0 10px ${badge.ledColor}, 0 0 20px ${badge.ledColor}80`,
              }}
            />
            
            {/* Valor con text-shadow */}
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: badge.ledColor,
                position: 'relative',
                lineHeight: 1,
                textShadow: `0 0 8px ${badge.ledColor}80, 0 1px 2px rgba(0,0,0,0.1)`,
              }}
            >
              {badge.value}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer text */}
      <div 
        className="mt-2 pt-2 border-t"
        style={{ borderColor: 'rgba(0,0,0,0.04)' }}
      >
        <p 
          className="text-[10px]"
          style={{ color: '#94a3b8' }}
        >
          {badge.footerText}
        </p>
      </div>
    </div>
  );

  if (badge.href) {
    return <Link to={badge.href}>{content}</Link>;
  }
  return content;
}
