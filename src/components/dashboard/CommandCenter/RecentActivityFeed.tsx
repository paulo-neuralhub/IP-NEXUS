 // =============================================
 // COMPONENTE: RecentActivityFeed
 // Feed compacto de actividad reciente
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { Link } from 'react-router-dom';
 import { 
   FileText, 
   Mail, 
   Phone, 
   User,
   AlertTriangle,
   CheckCircle,
   Plus,
   Edit,
 } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { es } from 'date-fns/locale';
 import { cn } from '@/lib/utils';
 
 export interface ActivityItem {
   id: string;
   type: string;
   titulo: string;
   usuario?: string;
   tiempo: Date;
   link?: string;
 }
 
 interface RecentActivityFeedProps {
   actividades: ActivityItem[];
 }
 
 const iconMap: Record<string, React.ElementType> = {
   matter_created: Plus,
   matter_updated: Edit,
   client_added: User,
   email_sent: Mail,
   call_made: Phone,
   alert: AlertTriangle,
   task_completed: CheckCircle,
   default: FileText,
 };
 
 const colorMap: Record<string, string> = {
   matter_created: '#00b4d8',
   matter_updated: '#2563eb',
   client_added: '#10b981',
   email_sent: '#00b4d8',
   call_made: '#f59e0b',
   alert: '#ef4444',
   task_completed: '#10b981',
   default: '#64748b',
 };
 
 export function RecentActivityFeed({ actividades }: RecentActivityFeedProps) {
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] p-[18px]"
       style={{ background: '#f1f4f9' }}
     >
       {/* Header */}
       <div className="flex items-center justify-between mb-4">
         <h3 
           className="text-[13px] font-bold tracking-[0.15px]"
           style={{ color: '#0a2540' }}
         >
           Actividad Reciente
         </h3>
         <Link 
           to="/app/activity"
           className="text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
           style={{ color: '#00b4d8' }}
         >
           Ver toda la actividad →
         </Link>
       </div>
 
       {/* Grid of 4 activities */}
       {actividades.length > 0 ? (
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
           {actividades.slice(0, 4).map((actividad) => (
             <ActivityCard key={actividad.id} actividad={actividad} />
           ))}
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center py-6 text-center">
           <span className="text-2xl mb-2">🕐</span>
           <p className="text-[12px]" style={{ color: '#94a3b8' }}>
             Sin actividad reciente
           </p>
         </div>
       )}
     </div>
   );
 }
 
 function ActivityCard({ actividad }: { actividad: ActivityItem }) {
   const Icon = iconMap[actividad.type] || iconMap.default;
   const color = colorMap[actividad.type] || colorMap.default;
 
   const content = (
     <div
       className={cn(
         "p-3 rounded-[12px] border border-black/[0.04] transition-all duration-200 hover:border-[rgba(0,180,216,0.15)]",
         actividad.link && "cursor-pointer"
       )}
       style={{ background: 'white' }}
     >
       <div className="flex items-start gap-2">
         {/* Icon */}
         <div 
           className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
           style={{ background: `${color}15` }}
         >
           <Icon className="h-3.5 w-3.5" style={{ color }} />
         </div>
 
         {/* Content */}
         <div className="flex-1 min-w-0">
           <p 
             className="text-[11px] font-medium line-clamp-2"
             style={{ color: '#0a2540' }}
           >
             {actividad.titulo}
           </p>
           {actividad.usuario && (
             <p 
               className="text-[9px] mt-0.5 truncate"
               style={{ color: '#64748b' }}
             >
               {actividad.usuario}
             </p>
           )}
           <p 
             className="text-[9px] mt-0.5"
             style={{ color: '#94a3b8' }}
           >
             {formatDistanceToNow(actividad.tiempo, { addSuffix: true, locale: es })}
           </p>
         </div>
       </div>
     </div>
   );
 
   if (actividad.link) {
     return <Link to={actividad.link}>{content}</Link>;
   }
   return content;
 }