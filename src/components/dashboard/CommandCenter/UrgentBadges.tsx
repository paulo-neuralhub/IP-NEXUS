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
        @keyframes led-pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.02);
          }
        }
        @keyframes led-ping {
          0% { 
            opacity: 0.6; 
            transform: scale(1);
          }
          100% { 
            opacity: 0; 
            transform: scale(1.3);
          }
        }
        .led-pulse {
          animation: led-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .led-ping {
          animation: led-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
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
        
        {/* NeoBadge con LED elegante SOLO en el badge */}
        <div className="relative flex-shrink-0">
          {/* LED glow animado alrededor del badge */}
          <div 
            className="absolute inset-0 rounded-xl led-pulse"
            style={{
              background: `${badge.ledColor}20`,
              filter: 'blur(4px)',
            }}
          />
          <div 
            className="absolute inset-0 rounded-xl led-ping"
            style={{
              background: `${badge.ledColor}15`,
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
              boxShadow: '5px 5px 12px #bfc3ce, -5px -5px 12px #ffffff, inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.04)',
              border: `2px solid ${badge.ledColor}30`,
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
