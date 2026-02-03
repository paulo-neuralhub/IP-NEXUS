/**
 * Top Agents Component
 * Leaderboard of top-rated market agents
 * Financial terminal style - USES REAL DATA
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, TrendingUp, CheckCircle, Clock, Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTopMarketAgents, type MarketAgent } from '@/hooks/use-market-agents';

interface TopAgentsProps {
  agents?: MarketAgent[];
  isLoading?: boolean;
  className?: string;
}

function getRankColor(position: number) {
  if (position === 1) return 'text-amber-400';
  if (position === 2) return 'text-gray-300';
  if (position === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}

function getRankBadge(position: number) {
  if (position === 1) return <Trophy className="h-4 w-4 text-amber-400" />;
  if (position <= 3) return <span className={cn('font-mono font-bold', getRankColor(position))}>{position}</span>;
  return <span className="font-mono text-muted-foreground">{position}</span>;
}

export function TopAgents({ 
  agents: externalAgents,
  isLoading: externalLoading,
  className 
}: TopAgentsProps) {
  // Use hook if no external agents provided
  const { data: hookAgents, isLoading: hookLoading } = useTopMarketAgents(10);
  
  const agents = externalAgents ?? hookAgents ?? [];
  const isLoading = externalLoading ?? hookLoading;

  if (isLoading) {
    return (
      <Card className={cn('terminal-card', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="terminal-text flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Agentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 terminal-skeleton animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (agents.length === 0) {
    return (
      <Card className={cn('terminal-card', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="terminal-text flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Agentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Sin agentes activos</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Los agentes verificados aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('terminal-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="terminal-text flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Top Agentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {agents.slice(0, 10).map((agent) => (
          <Link
            key={agent.id}
            to={`/app/market/agents/${agent.id}`}
            className="flex items-center gap-3 px-4 py-3 terminal-hover transition-colors"
          >
            {/* Rank */}
            <div className="w-6 flex justify-center">
              {getRankBadge(agent.rank_position || 0)}
            </div>

            {/* Rank Change */}
            <div className="w-5 flex justify-center">
              {agent.rank_change !== undefined && agent.rank_change !== 0 && (
                <span className={cn(
                  'text-xs font-mono',
                  agent.rank_change > 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {agent.rank_change > 0 ? '▲' : '▼'}
                </span>
              )}
            </div>

            {/* Avatar */}
            <Avatar className="h-8 w-8 terminal-border border">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {agent.display_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name & Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="terminal-text font-medium text-sm truncate">
                  {agent.display_name}
                </span>
                {agent.is_verified_agent && (
                  <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {(agent.jurisdictions || []).slice(0, 3).map((j) => (
                  <span key={j} className="text-[10px] font-mono terminal-text-muted terminal-skeleton px-1 rounded">
                    {j}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="terminal-text font-mono">
                  {agent.rating_avg > 0 ? agent.rating_avg.toFixed(1) : '-'}
                </span>
              </div>

              {/* Transactions */}
              {agent.total_transactions > 0 && (
                <div className="hidden sm:flex items-center gap-1 terminal-text-muted">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{agent.total_transactions}</span>
                </div>
              )}

              {/* Response time */}
              {agent.response_time_avg > 0 && (
                <div className="hidden md:flex items-center gap-1 terminal-text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">{agent.response_time_avg}m</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
