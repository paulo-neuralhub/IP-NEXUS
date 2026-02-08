import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, CheckCircle } from 'lucide-react';

interface Agent {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  is_verified_agent: boolean | null;
  rating_avg: number | null;
  ratings_count: number | null;
  reputation_score: number | null;
  jurisdictions: string[] | null;
}

interface TopAgentsSectionProps {
  agents: Agent[] | null | undefined;
}

export function TopAgentsSection({ agents }: TopAgentsSectionProps) {
  if (!agents || agents.length === 0) return null;

  return (
    <section className="py-20" style={{ background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
              Top Agentes
            </h2>
            <p style={{ fontSize: '16px', color: '#475569', marginTop: '6px' }}>
              Profesionales verificados con el mejor rendimiento
            </p>
          </div>
          <Link to="/market/rankings" 
            className="flex items-center gap-1 text-sm font-semibold no-underline transition-colors"
            style={{ color: '#6C2BD9' }}>
            Ver ranking completo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {agents.map((agent, index) => (
            <Link
              key={agent.id}
              to={`/market/agents/${agent.id}`}
              className="group rounded-2xl p-6 transition-all hover:scale-[1.02] no-underline"
              style={{ 
                background: '#FAFAFE',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)',
                borderRadius: '16px',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: index === 0 ? '#FEF3C7' : index === 1 ? '#F3F4F6' : index === 2 ? '#FFEDD5' : '#F5F3FF',
                    color: index === 0 ? '#92400E' : index === 1 ? '#374151' : index === 2 ? '#9A3412' : '#6C2BD9',
                  }}>
                  #{index + 1}
                </div>
                {agent.is_verified_agent && (
                  <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                )}
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
                  {agent.display_name?.[0] || 'A'}
                </div>
                
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', marginTop: '12px' }}
                  className="group-hover:text-violet-600 transition-colors">
                  {agent.display_name || 'Agente'}
                </h3>
                {agent.company_name && (
                  <p style={{ fontSize: '12px', color: '#94a3b8' }} className="truncate">{agent.company_name}</p>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E1B4B' }}>{agent.rating_avg?.toFixed(1) || '-'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{agent.ratings_count || 0} reviews</div>
                </div>
                <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)' }} />
                <div className="text-center">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#6C2BD9' }}>{agent.reputation_score || 0}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Score</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 justify-center mt-3">
                {agent.jurisdictions?.slice(0, 3).map((j: string) => (
                  <span key={j} className="px-2 py-0.5 rounded-full text-[10px]"
                    style={{ background: '#EDE9FE', color: '#6C2BD9' }}>
                    {j}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
