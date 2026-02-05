 // =============================================
 // COMPONENTE: MiniCalendar
 // Calendario mensual compacto con plazos
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { useState, useMemo } from 'react';
 import { ChevronLeft, ChevronRight } from 'lucide-react';
 import { 
   startOfMonth, 
   endOfMonth, 
   startOfWeek, 
   endOfWeek, 
   eachDayOfInterval, 
   isSameMonth, 
   isSameDay,
   isToday,
   format,
   addMonths,
   subMonths,
 } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 export interface CalendarDay {
   date: Date;
   plazos: number;
   tareas: number;
   reuniones: number;
 }
 
 interface MiniCalendarProps {
   deadlines: Array<{
     date: Date;
     type: 'plazo' | 'tarea' | 'reunion';
   }>;
 }
 
 export function MiniCalendar({ deadlines }: MiniCalendarProps) {
   const [currentDate, setCurrentDate] = useState(new Date());
 
   const monthStart = startOfMonth(currentDate);
   const monthEnd = endOfMonth(currentDate);
   const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
   const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
 
   const days = useMemo(() => {
     return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => {
       const dayDeadlines = deadlines.filter(d => isSameDay(d.date, date));
       return {
         date,
         plazos: dayDeadlines.filter(d => d.type === 'plazo').length,
         tareas: dayDeadlines.filter(d => d.type === 'tarea').length,
         reuniones: dayDeadlines.filter(d => d.type === 'reunion').length,
         isCurrentMonth: isSameMonth(date, currentDate),
       };
     });
   }, [currentDate, deadlines, calendarStart, calendarEnd]);
 
   const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
 
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] p-[18px]"
       style={{ background: '#f1f4f9' }}
     >
       {/* Header */}
       <div className="flex items-center justify-between mb-4">
         <h3 
           className="text-[13px] font-bold tracking-[0.15px] capitalize"
           style={{ color: '#0a2540' }}
         >
           {format(currentDate, 'MMMM yyyy', { locale: es })}
         </h3>
         <div className="flex items-center gap-1">
           <button
             onClick={() => setCurrentDate(subMonths(currentDate, 1))}
             className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors"
           >
             <ChevronLeft className="h-4 w-4" style={{ color: '#64748b' }} />
           </button>
           <button
             onClick={() => setCurrentDate(addMonths(currentDate, 1))}
             className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors"
           >
             <ChevronRight className="h-4 w-4" style={{ color: '#64748b' }} />
           </button>
         </div>
       </div>
 
       {/* Grid */}
       <div className="grid grid-cols-7 gap-1">
         {/* Week day headers */}
         {weekDays.map((d, i) => (
           <div 
             key={i} 
             className="text-center text-[9px] font-medium pb-2"
             style={{ color: '#94a3b8' }}
           >
             {d}
           </div>
         ))}
 
         {/* Days */}
         {days.map((day, i) => (
           <div
             key={i}
             className={cn(
               "relative p-1 text-center rounded-lg min-h-[32px] transition-colors cursor-pointer",
               day.isCurrentMonth ? "hover:bg-white/60" : "opacity-40",
               isToday(day.date) && "ring-2 ring-[#00b4d8] ring-offset-1"
             )}
           >
             <span 
               className={cn(
                 "text-[11px] font-medium",
                 isToday(day.date) ? "text-[#00b4d8]" : ""
               )}
               style={{ color: isToday(day.date) ? '#00b4d8' : '#334155' }}
             >
               {format(day.date, 'd')}
             </span>
 
             {/* Event indicators */}
             {day.isCurrentMonth && (day.plazos > 0 || day.tareas > 0 || day.reuniones > 0) && (
               <div className="flex justify-center gap-[2px] mt-0.5">
                 {day.plazos > 0 && (
                   <span className="w-[5px] h-[5px] rounded-full bg-[#ef4444]" />
                 )}
                 {day.tareas > 0 && (
                   <span className="w-[5px] h-[5px] rounded-full bg-[#f59e0b]" />
                 )}
                 {day.reuniones > 0 && (
                   <span className="w-[5px] h-[5px] rounded-full bg-[#2563eb]" />
                 )}
               </div>
             )}
           </div>
         ))}
       </div>
 
       {/* Legend */}
       <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-black/[0.04]">
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
           <span className="text-[9px]" style={{ color: '#64748b' }}>Plazos</span>
         </div>
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
           <span className="text-[9px]" style={{ color: '#64748b' }}>Tareas</span>
         </div>
         <div className="flex items-center gap-1.5">
           <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
           <span className="text-[9px]" style={{ color: '#64748b' }}>Reuniones</span>
         </div>
       </div>
     </div>
   );
 }