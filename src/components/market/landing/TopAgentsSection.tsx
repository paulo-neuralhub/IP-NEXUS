import { Link } from 'react-router-dom';
import { ChevronRight, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-secondary">Top Agentes</h2>
            <p className="text-muted-foreground mt-2">Profesionales verificados con el mejor rendimiento</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/market/rankings">
              Ver ranking completo <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent, index) => (
            <Link
              key={agent.id}
              to={`/market/agents/${agent.id}`}
              className="group bg-card rounded-2xl border p-6 hover:shadow-xl hover:border-market/30 transition-all"
            >
              {/* Rank badge */}
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-gray-100 text-gray-700" :
                  index === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-muted text-muted-foreground"
                )}>
                  #{index + 1}
                </div>
                {agent.is_verified_agent && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              {/* Avatar & Info */}
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto ring-4 ring-muted group-hover:ring-market/20 transition-all">
                  <AvatarImage src={agent.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {agent.display_name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-secondary mt-4 group-hover:text-market transition-colors">
                  {agent.display_name || 'Agente'}
                </h3>
                {agent.company_name && (
                  <p className="text-sm text-muted-foreground truncate">{agent.company_name}</p>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{agent.rating_avg?.toFixed(1) || '-'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{agent.ratings_count || 0} reviews</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="font-semibold text-market">{agent.reputation_score || 0}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
              
              {/* Jurisdictions */}
              <div className="flex flex-wrap gap-1 justify-center mt-3">
                {agent.jurisdictions?.slice(0, 3).map((j: string) => (
                  <span key={j} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
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
