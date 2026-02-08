import * as React from 'react';
import { Star, Users, CheckCircle, Globe } from 'lucide-react';

interface StatsBarProps {
  totalAgents: number;
  avgSuccess: number;
  totalTransactions: number;
  avgRating: string;
}

export function StatsBar({ totalAgents, avgSuccess, totalTransactions, avgRating }: StatsBarProps) {
  const stats = [
    { value: `${totalAgents}+`, label: 'Agentes verificados', icon: Users },
    { value: `${avgSuccess}%`, label: 'Tasa de éxito', icon: CheckCircle },
    { value: `${totalTransactions}+`, label: 'Transacciones', icon: Globe },
    { value: avgRating, label: 'Rating promedio', icon: Star },
  ];

  return (
    <section style={{ background: '#1E1B4B', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <s.icon className="w-5 h-5" style={{ color: '#A78BFA' }} />
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>{s.value}</span>
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
