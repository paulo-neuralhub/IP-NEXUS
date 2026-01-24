/**
 * Top Agents Component
 * Leaderboard of top-rated market agents
 * Financial terminal style
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, CheckCircle, Clock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  display_name: string;
  avatar_url?: string;
  jurisdictions: string[];
  specializations: string[];
  rating_avg: number;
  ratings_count: number;
  total_transactions: number;
  success_rate: number;
  response_time_avg: number; // minutes
  is_verified_agent: boolean;
  rank_position?: number;
  rank_change?: number; // positive = up, negative = down
}

interface TopAgentsProps {
  agents?: Agent[];
  isLoading?: boolean;
  className?: string;
}

// Mock data for demo
const MOCK_AGENTS: Agent[] = [
  { 
    id: '1', display_name: 'García & Asociados', 
    jurisdictions: ['ES', 'EU'], specializations: ['Marcas', 'Patentes'],
    rating_avg: 4.9, ratings_count: 156, total_transactions: 234,
    success_rate: 98.5, response_time_avg: 45, is_verified_agent: true,
    rank_position: 1, rank_change: 0
  },
  { 
    id: '2', display_name: 'PatentPro Legal', 
    jurisdictions: ['EU', 'US'], specializations: ['Patentes'],
    rating_avg: 4.8, ratings_count: 98, total_transactions: 167,
    success_rate: 97.2, response_time_avg: 60, is_verified_agent: true,
    rank_position: 2, rank_change: 2
  },
  { 
    id: '3', display_name: 'IP Solutions Madrid', 
    jurisdictions: ['ES'], specializations: ['Marcas', 'Diseños'],
    rating_avg: 4.8, ratings_count: 203, total_transactions: 312,
    success_rate: 96.8, response_time_avg: 30, is_verified_agent: true,
    rank_position: 3, rank_change: -1
  },
  { 
    id: '4', display_name: 'EuroMark Partners', 
    jurisdictions: ['EU', 'DE', 'FR'], specializations: ['Marcas'],
    rating_avg: 4.7, ratings_count: 87, total_transactions: 145,
    success_rate: 95.5, response_time_avg: 90, is_verified_agent: true,
    rank_position: 4, rank_change: 1
  },
  { 
    id: '5', display_name: 'TechIP Global', 
    jurisdictions: ['US', 'CN', 'JP'], specializations: ['Patentes', 'Software'],
    rating_avg: 4.7, ratings_count: 64, total_transactions: 98,
    success_rate: 94.8, response_time_avg: 120, is_verified_agent: false,
    rank_position: 5, rank_change: -2
  },
];

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
  agents = MOCK_AGENTS, 
  isLoading = false,
  className 
}: TopAgentsProps) {
  if (isLoading) {
    return (
      <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Top Agentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/5 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          Top Agentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {agents.slice(0, 10).map((agent) => (
          <Link
            key={agent.id}
            to={`/app/market/agents/${agent.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
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
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={agent.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {agent.display_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name & Badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm truncate">
                  {agent.display_name}
                </span>
                {agent.is_verified_agent && (
                  <CheckCircle className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {agent.jurisdictions.slice(0, 3).map((j) => (
                  <span key={j} className="text-[10px] font-mono text-white/50 bg-white/5 px-1 rounded">
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
                <span className="text-white font-mono">{agent.rating_avg.toFixed(1)}</span>
              </div>

              {/* Transactions */}
              <div className="hidden sm:flex items-center gap-1 text-white/60">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">{agent.total_transactions}</span>
              </div>

              {/* Response time */}
              <div className="hidden md:flex items-center gap-1 text-white/60">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">{agent.response_time_avg}m</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
