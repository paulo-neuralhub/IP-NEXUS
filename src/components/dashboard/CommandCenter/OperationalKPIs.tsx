 // =============================================
 // COMPONENTE: OperationalKPIs
 // KPIs operacionales con NeoBadges (sin LED)
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import { Link } from 'react-router-dom';
 import { NeoBadge } from '@/components/ui/neo-badge';
 
 interface KPIData {
   id: string;
   label: string;
   sublabel: string;
   value: number | string;
   color: string;
   href?: string;
 }
 
 interface OperationalKPIsProps {
   expedientesActivos: number;
   vigilanciasActivas: number;
   emailsSinLeer: number;
   whatsappSinLeer: number;
 }
 
 export function OperationalKPIs({ 
   expedientesActivos, 
   vigilanciasActivas, 
   emailsSinLeer, 
   whatsappSinLeer 
 }: OperationalKPIsProps) {
   const kpis: KPIData[] = [
     {
       id: 'expedientes',
       label: 'Expedientes',
       sublabel: 'Activos',
       value: expedientesActivos,
       color: '#00b4d8',
       href: '/app/docket',
     },
     {
       id: 'vigilancias',
       label: 'Vigilancias',
       sublabel: 'Activas',
       value: vigilanciasActivas,
       color: '#2563eb',
       href: '/app/spider',
     },
     {
       id: 'emails',
       label: 'Emails',
       sublabel: 'Sin leer',
       value: emailsSinLeer,
       color: '#10b981',
       href: '/app/communications',
     },
     {
       id: 'whatsapp',
       label: 'WhatsApp',
       sublabel: 'Sin leer',
       value: whatsappSinLeer,
       color: '#22c55e',
       href: '/app/communications',
     },
   ];
 
   return (
     <div 
       className="p-3 rounded-2xl mb-4"
       style={{
         background: 'linear-gradient(135deg, #eceef6, #f1f4f9)',
       }}
     >
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
         {kpis.map((kpi) => (
           <KPICard key={kpi.id} kpi={kpi} />
         ))}
       </div>
     </div>
   );
 }
 
 function KPICard({ kpi }: { kpi: KPIData }) {
   const content = (
     <div 
       className="flex items-center gap-3 py-[13px] px-3 rounded-[14px] border border-black/[0.06] cursor-pointer transition-colors hover:border-[rgba(0,180,216,0.15)]"
       style={{ background: '#f1f4f9' }}
     >
       <NeoBadge
         value={kpi.value}
         color={kpi.color}
         size="md"
       />
       <div className="min-w-0 flex-1">
         <p 
           className="text-[11px] font-medium"
           style={{ color: '#64748b' }}
         >
           {kpi.label}
         </p>
         <p 
           className="text-[10px]"
           style={{ color: '#94a3b8' }}
         >
           {kpi.sublabel}
         </p>
       </div>
     </div>
   );
 
   if (kpi.href) {
     return <Link to={kpi.href}>{content}</Link>;
   }
   return content;
 }