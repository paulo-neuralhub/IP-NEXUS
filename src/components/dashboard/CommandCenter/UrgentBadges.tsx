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
        @keyframes led-pulse-glow {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.03);
            filter: brightness(1.2);
          }
        }
        @keyframes led-pulse-slow {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.08);
          }
        }
        @keyframes led-pulse-medium {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05);
          }
        }
        .led-glow-outer {
          animation: led-pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-glow-middle {
          animation: led-pulse-medium 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-glow-ring {
          animation: led-pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
        
        {/* NeoBadge con LED MEJORADO - Múltiples capas de glow */}
        <div className="relative flex-shrink-0">
          {/* Capa 1: Glow exterior - más grande y sutil */}
          <div 
            className="absolute -inset-3 rounded-2xl led-glow-outer"
            style={{
              background: `${badge.ledColor}15`,
              filter: 'blur(12px)',
            }}
          />
          
          {/* Capa 2: Glow medio */}
          <div 
            className="absolute -inset-2 rounded-xl led-glow-middle"
            style={{
              background: `${badge.ledColor}25`,
              filter: 'blur(8px)',
            }}
          />
          
          {/* Capa 3: Glow cercano */}
          <div 
            className="absolute -inset-1 rounded-xl led-glow-ring"
            style={{
              background: `${badge.ledColor}30`,
              filter: 'blur(4px)',
            }}
          />
          
          {/* Badge neumórfico */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: '#f1f4f9',
              boxShadow: `
                4px 4px 10px #cdd1dc, 
                -4px -4px 10px #ffffff,
                0 0 8px ${badge.ledColor}60,
                0 0 16px ${badge.ledColor}40,
                0 0 24px ${badge.ledColor}25,
                inset 0 0 6px ${badge.ledColor}15
              `,
              border: `2px solid ${badge.ledColor}50`,
            }}
          >
            {/* Gradient inferior */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '45%',
                background: `linear-gradient(to top, ${badge.ledColor}15, transparent)`,
                borderRadius: 12,
              }}
            />
            
            {/* Línea base */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '18%',
                right: '18%',
                height: 2,
                background: badge.ledColor,
                borderRadius: 2,
                opacity: 0.4,
                boxShadow: `0 0 6px ${badge.ledColor}50`,
              }}
            />
            
            {/* Valor */}
            <span
              style={{
                fontSize: 18,
                fontWeight: 200,
                color: badge.ledColor,
                position: 'relative',
                lineHeight: 1,
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
