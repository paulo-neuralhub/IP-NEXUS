 // =============================================
 // COMPONENTE: UpcomingDeadlinesList
 // Lista de plazos próximos
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { Link } from 'react-router-dom';
 import { NeoBadge } from '@/components/ui/neo-badge';
 import { cn } from '@/lib/utils';
 import { differenceInDays, isToday, format } from 'date-fns';
 import { es } from 'date-fns/locale';
 
 export interface UpcomingDeadline {
   id: string;
   titulo: string;
   expediente: string;
   fecha: Date;
   oficina: string;
   matterId?: string;
 }
 
 interface UpcomingDeadlinesListProps {
   plazos: UpcomingDeadline[];
 }
 
 export function UpcomingDeadlinesList({ plazos }: UpcomingDeadlinesListProps) {
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] h-full flex flex-col"
       style={{ background: '#f1f4f9' }}
     >
       {/* Header */}
       <div className="flex items-center justify-between px-[18px] pt-[18px] pb-3">
         <h3 
           className="text-[13px] font-bold tracking-[0.15px]"
           style={{ color: '#0a2540' }}
         >
           Plazos Próximos
         </h3>
         <Link 
           to="/app/docket"
           className="text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
           style={{ color: '#00b4d8' }}
         >
           Ver todos →
         </Link>
       </div>
 
       {/* Content */}
       <div className="flex-1 px-[18px] pb-[18px] overflow-auto">
         {plazos.length > 0 ? (
           <div className="space-y-2">
             {plazos.map((plazo) => (
               <DeadlineRow key={plazo.id} plazo={plazo} />
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center h-full py-6 text-center">
             <span className="text-2xl mb-2">✅</span>
             <p 
               className="text-[12px]"
               style={{ color: '#94a3b8' }}
             >
               Sin plazos próximos
             </p>
           </div>
         )}
       </div>
     </div>
   );
 }
 
 function DeadlineRow({ plazo }: { plazo: UpcomingDeadline }) {
   const dias = differenceInDays(plazo.fecha, new Date());
   const esHoy = isToday(plazo.fecha);
   const esUrgente = dias <= 0;
 
   // Color based on urgency
   const badgeColor = esUrgente ? '#ef4444' : dias <= 3 ? '#f59e0b' : dias <= 7 ? '#00b4d8' : '#10b981';
 
   const content = (
     <div
       className={cn(
         "flex items-start gap-3 p-3 rounded-[12px] border transition-all duration-200 hover:border-[rgba(0,180,216,0.15)]",
         plazo.matterId && "cursor-pointer"
       )}
       style={{ 
         background: 'white',
         borderColor: esUrgente ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.04)',
       }}
     >
       {/* Days badge */}
       <NeoBadge 
         value={esHoy ? '0' : dias.toString()}
         label="días"
         color={badgeColor}
         size="sm"
       />
 
       {/* Content */}
       <div className="flex-1 min-w-0">
         <div className="flex items-center gap-2">
           <span 
             className="text-[12px] font-semibold truncate flex-1"
             style={{ color: '#0a2540' }}
           >
             {plazo.titulo}
           </span>
           {esUrgente && (
             <span 
               className="text-[8px] font-bold px-[7px] py-[2px] rounded-[5px] shrink-0"
               style={{ 
                 background: 'rgba(239, 68, 68, 0.1)',
                 color: '#ef4444',
               }}
             >
               URGENTE
             </span>
           )}
         </div>
         <p 
           className="text-[11px] truncate"
           style={{ color: '#64748b' }}
         >
           {plazo.expediente}
         </p>
         <div 
           className="flex items-center gap-3 mt-1 text-[10px]"
           style={{ color: '#94a3b8' }}
         >
           <span>📅 {format(plazo.fecha, 'd MMM', { locale: es })}</span>
           <span>📍 {plazo.oficina}</span>
         </div>
       </div>
     </div>
   );
 
   if (plazo.matterId) {
     return <Link to={`/app/docket/${plazo.matterId}`}>{content}</Link>;
   }
   return content;
 }