 // =============================================
 // COMPONENTE: UrgentBadges
 // Badges con efecto LED rojo para alertas críticas
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { Link } from 'react-router-dom';
 import { NeoBadge } from '@/components/ui/neo-badge';
 import { cn } from '@/lib/utils';
 
 interface UrgentBadgeData {
   id: string;
   icon: string;
   label: string;
   sublabel: string;
   value: number;
   href?: string;
 }
 
 interface UrgentBadgesProps {
   plazosHoy: number;
   expedientesUrgentes: number;
   alertasSpider: number;
 }
 
 export function UrgentBadges({ plazosHoy, expedientesUrgentes, alertasSpider }: UrgentBadgesProps) {
   const badges: UrgentBadgeData[] = [
     {
       id: 'plazos-hoy',
       icon: '⏰',
       label: 'Plazos HOY',
       sublabel: 'Requieren atención inmediata',
       value: plazosHoy,
       href: '/app/docket',
     },
     {
       id: 'expedientes-urgentes',
       icon: '🔥',
       label: 'Expedientes Urgentes',
       sublabel: 'Marcados como urgentes',
       value: expedientesUrgentes,
       href: '/app/docket',
     },
     {
       id: 'alertas-spider',
       icon: '🕷️',
       label: 'Alertas Spider',
       sublabel: 'Conflictos detectados',
       value: alertasSpider,
       href: '/app/spider',
     },
   ];
 
   // Solo mostrar badges que tienen valores > 0
   const activeBadges = badges.filter(b => b.value > 0);
 
   if (activeBadges.length === 0) return null;
 
   return (
     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
       {activeBadges.map((badge) => (
         <UrgentBadgeCard key={badge.id} badge={badge} />
       ))}
     </div>
   );
 }
 
 function UrgentBadgeCard({ badge }: { badge: UrgentBadgeData }) {
   const content = (
     <div className="relative">
       {/* Outer LED glow */}
       <div 
         className="absolute inset-0 rounded-[16px] animate-pulse-glow"
         style={{
           background: 'rgba(239, 68, 68, 0.15)',
           filter: 'blur(8px)',
         }}
       />
       
       {/* Card with LED border */}
       <div 
         className={cn(
           "relative rounded-[14px] p-4 transition-all duration-300",
           "border-2 hover:scale-[1.01]",
           "cursor-pointer"
         )}
         style={{
           background: '#f1f4f9',
           borderColor: 'rgba(239, 68, 68, 0.3)',
           boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)',
         }}
       >
         <div className="flex items-center gap-3">
           {/* NeoBadge with red color */}
           <NeoBadge 
             value={badge.value}
             color="#ef4444"
             size="lg"
           />
           
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
         </div>
       </div>
     </div>
   );
 
   if (badge.href) {
     return <Link to={badge.href}>{content}</Link>;
   }
   return content;
 }