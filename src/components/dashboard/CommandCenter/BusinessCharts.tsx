 // =============================================
 // COMPONENTE: BusinessCharts
 // Gráficos de analytics del negocio
 // SILK Design System
 // =============================================
 
 import * as React from 'react';
 import {
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   LineChart,
   Line,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid,
 } from 'recharts';
 import { NeoBadgeInline } from '@/components/ui/neo-badge';
 import { cn } from '@/lib/utils';
 
 // =============================================
 // Chart: Expedientes por Tipo (Donut)
 // =============================================
 
 interface TipoData {
   tipo: string;
   count: number;
   color: string;
 }
 
 interface TiposChartProps {
   data: TipoData[];
 }
 
 export function ExpedientesTiposChart({ data }: TiposChartProps) {
   const hasData = data && data.length > 0;
 
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] p-[18px] h-full"
       style={{ background: '#f1f4f9' }}
     >
       <h3 
         className="text-[13px] font-bold tracking-[0.15px] mb-4"
         style={{ color: '#0a2540' }}
       >
         Expedientes por Tipo
       </h3>
 
       {hasData ? (
         <div className="flex flex-col items-center">
           {/* Donut Chart */}
           <div className="h-[140px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={35}
                   outerRadius={55}
                   paddingAngle={3}
                   dataKey="count"
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   formatter={(value: number) => [value, 'Expedientes']}
                   contentStyle={{ 
                     borderRadius: '8px',
                     border: '1px solid rgba(0,0,0,0.06)',
                     background: '#fff',
                     fontSize: '11px',
                   }}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
 
           {/* Legend */}
           <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
             {data.map((item, i) => (
               <div key={i} className="flex items-center gap-2">
                 <span 
                   className="w-3 h-3 rounded-sm"
                   style={{ background: item.color }}
                 />
                 <span className="text-[11px]" style={{ color: '#64748b' }}>
                   {item.tipo}
                 </span>
                 <span 
                   className="text-[11px] font-semibold"
                   style={{ color: '#0a2540' }}
                 >
                   {item.count}
                 </span>
               </div>
             ))}
           </div>
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center h-[160px] text-center">
           <span className="text-3xl mb-2">📊</span>
           <p className="text-[12px]" style={{ color: '#94a3b8' }}>
             Sin datos disponibles
           </p>
         </div>
       )}
     </div>
   );
 }
 
 // =============================================
 // Chart: Evolución Facturación (Line)
 // =============================================
 
 interface FacturacionData {
   mes: string;
   valor: number;
 }
 
 interface FacturacionChartProps {
   data: FacturacionData[];
   metricas?: {
     mes: string;
     trimestre: string;
     año: string;
   };
 }
 
 export function FacturacionEvolucionChart({ data, metricas }: FacturacionChartProps) {
   const hasData = data && data.some(d => d.valor > 0);
 
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] p-[18px] h-full"
       style={{ background: '#f1f4f9' }}
     >
       <h3 
         className="text-[13px] font-bold tracking-[0.15px] mb-4"
         style={{ color: '#0a2540' }}
       >
         Facturación 2026
       </h3>
 
       {hasData ? (
         <>
           {/* Line Chart */}
           <div className="h-[120px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                 <XAxis 
                   dataKey="mes" 
                   tick={{ fontSize: 10, fill: '#94a3b8' }}
                   axisLine={false}
                   tickLine={false}
                 />
                 <YAxis 
                   tick={{ fontSize: 10, fill: '#94a3b8' }}
                   tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`}
                   axisLine={false}
                   tickLine={false}
                 />
                 <Tooltip 
                   formatter={(value: number) => [`€${value.toLocaleString()}`, 'Facturado']}
                   contentStyle={{ 
                     borderRadius: '8px',
                     border: '1px solid rgba(0,0,0,0.06)',
                     background: '#fff',
                     fontSize: '11px',
                   }}
                 />
                 <Line 
                   type="monotone" 
                   dataKey="valor" 
                   stroke="#00b4d8"
                   strokeWidth={2}
                   dot={{ fill: '#00b4d8', strokeWidth: 0, r: 3 }}
                 />
               </LineChart>
             </ResponsiveContainer>
           </div>
 
           {/* Metrics */}
           {metricas && (
             <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-black/[0.04]">
               <MetricPill label="Mes" value={metricas.mes} />
               <MetricPill label="Trimestre" value={metricas.trimestre} />
               <MetricPill label="Año" value={metricas.año} />
             </div>
           )}
         </>
       ) : (
         <div className="flex flex-col items-center justify-center h-[160px] text-center">
           <span className="text-3xl mb-2">📈</span>
           <p className="text-[12px]" style={{ color: '#94a3b8' }}>
             Sin facturas registradas
           </p>
         </div>
       )}
     </div>
   );
 }
 
 function MetricPill({ label, value }: { label: string; value: string }) {
   const isPositive = value.startsWith('+');
   return (
     <div className="text-center">
       <p className="text-[9px]" style={{ color: '#94a3b8' }}>{label}</p>
       <p 
         className="text-[12px] font-semibold"
         style={{ color: isPositive ? '#10b981' : '#64748b' }}
       >
         {value}
       </p>
     </div>
   );
 }
 
 // =============================================
 // Chart: Pipeline por Fase (Horizontal Bars)
 // =============================================
 
 interface PipelinePhase {
   fase: string;
   nombre: string;
   count: number;
   color: string;
   max: number;
 }
 
 interface PipelineChartProps {
   data: PipelinePhase[];
 }
 
 export function PipelineChart({ data }: PipelineChartProps) {
   const hasData = data && data.length > 0;
   const maxValue = hasData ? Math.max(...data.map(d => d.count)) : 1;
 
   return (
     <div 
       className="rounded-[14px] border border-black/[0.06] p-[18px] h-full"
       style={{ background: '#f1f4f9' }}
     >
       <h3 
         className="text-[13px] font-bold tracking-[0.15px] mb-4"
         style={{ color: '#0a2540' }}
       >
         Pipeline por Fase
       </h3>
 
       {hasData ? (
         <div className="space-y-3">
           {data.map((fase, i) => (
             <div key={i} className="flex items-center gap-3">
               {/* Phase badge */}
               <NeoBadgeInline value={fase.fase} color={fase.color} />
 
               {/* Bar */}
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-1">
                   <span 
                     className="text-[10px] font-medium"
                     style={{ color: '#64748b' }}
                   >
                     {fase.nombre}
                   </span>
                   <span 
                     className="text-[11px] font-semibold"
                     style={{ color: '#0a2540' }}
                   >
                     {fase.count}
                   </span>
                 </div>
                 <div 
                   className="h-[6px] rounded-full overflow-hidden"
                   style={{ background: 'rgba(0,0,0,0.04)' }}
                 >
                   <div 
                     className="h-full rounded-full transition-all duration-500"
                     style={{ 
                       width: `${(fase.count / maxValue) * 100}%`,
                       background: `linear-gradient(90deg, ${fase.color}cc, ${fase.color})`,
                     }}
                   />
                 </div>
               </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center h-[160px] text-center">
           <span className="text-3xl mb-2">📋</span>
           <p className="text-[12px]" style={{ color: '#94a3b8' }}>
             Sin expedientes en pipeline
           </p>
         </div>
       )}
     </div>
   );
 }