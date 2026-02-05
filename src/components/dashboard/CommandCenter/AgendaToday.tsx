 // =============================================
 // COMPONENTE: AgendaToday
 // Lista de eventos del día actual
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { Link } from 'react-router-dom';
 import { ChevronRight } from 'lucide-react';
 import { NeoBadgeInline } from '@/components/ui/neo-badge';
 import { cn } from '@/lib/utils';
 
 export interface AgendaEvent {
   id: string;
   hora: string;
   titulo: string;
   cliente?: string;
   type?: 'reunion' | 'plazo' | 'tarea' | 'otro';
 }
 
 interface AgendaTodayProps {
   eventos: AgendaEvent[];
 }
 
 const typeColors: Record<string, string> = {
   reunion: '#2563eb',
   plazo: '#ef4444',
   tarea: '#f59e0b',
   otro: '#64748b',
 };
 
 export function AgendaToday({ eventos }: AgendaTodayProps) {
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
           Agenda HOY
         </h3>
         <Link 
           to="/app/calendar"
           className="text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
           style={{ color: '#00b4d8' }}
         >
           Ver completa →
         </Link>
       </div>
 
       {/* Content */}
       <div className="flex-1 px-[18px] pb-[18px] overflow-auto">
         {eventos.length > 0 ? (
           <div className="space-y-2">
             {eventos.map((evento) => (
               <div
                 key={evento.id}
                 className="flex items-start gap-3 p-3 rounded-[12px] border border-black/[0.04] transition-all duration-200 hover:border-[rgba(0,180,216,0.15)] cursor-pointer"
                 style={{ background: 'white' }}
               >
                 {/* Time badge */}
                 <NeoBadgeInline 
                   value={evento.hora.split(':')[0]} 
                   color={typeColors[evento.type || 'otro']}
                 />
 
                 {/* Content */}
                 <div className="flex-1 min-w-0">
                   <p 
                     className="text-[12px] font-semibold truncate"
                     style={{ color: '#0a2540' }}
                   >
                     {evento.titulo}
                   </p>
                   {evento.cliente && (
                     <p 
                       className="text-[10px] truncate mt-0.5"
                       style={{ color: '#64748b' }}
                     >
                       {evento.cliente}
                     </p>
                   )}
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center h-full py-6 text-center">
             <span className="text-2xl mb-2">📅</span>
             <p 
               className="text-[12px]"
               style={{ color: '#94a3b8' }}
             >
               No hay eventos para hoy
             </p>
           </div>
         )}
       </div>
     </div>
   );
 }