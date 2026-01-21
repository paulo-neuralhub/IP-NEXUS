import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus,
  Star, CheckCircle, Crown, ChevronRight
} from 'lucide-react';
import { useRankings, useRankingStats } from '@/hooks/market/useRankings';
import { RANKING_CATEGORY_LABELS, RankingCategory, BADGE_DETAILS, BadgeType } from '@/types/rankings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function RankingsPage() {
  const [category, setCategory] = useState<RankingCategory>('global');
  const { data: rankings, isLoading } = useRankings(category, 100);
  const { data: stats } = useRankingStats();

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{position}</span>;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground/40" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-purple-700 text-white rounded-xl -mx-6 -mt-6 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Ranking de Agentes</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            Los mejores profesionales de Propiedad Intelectual, clasificados por rendimiento, 
            satisfacción del cliente y fiabilidad.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats?.totalAgents || 0}</div>
              <div className="text-white/70 text-sm">Agentes en ranking</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">4.7</div>
              <div className="text-white/70 text-sm">Rating promedio</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-white/70 text-sm">Tasa de éxito</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main ranking */}
        <div className="lg:col-span-3">
          <Tabs value={category} onValueChange={(v) => setCategory(v as RankingCategory)}>
            <TabsList className="mb-6">
              {Object.entries(RANKING_CATEGORY_LABELS).slice(0, 4).map(([key, labels]) => (
                <TabsTrigger key={key} value={key}>
                  {labels.es}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="bg-card rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Agente</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Rating</div>
                <div className="col-span-2 text-center">Cambio</div>
              </div>
              
              {/* Rankings */}
              <div className="divide-y divide-border">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : rankings?.length === 0 ? (
                  <div className="px-6 py-12 text-center text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay rankings disponibles aún</p>
                    <p className="text-sm mt-1">Los rankings se calculan diariamente</p>
                  </div>
                ) : (
                  rankings?.map((ranking, index) => (
                    <Link
                      key={ranking.id}
                      to={`/app/market/agents/${ranking.agent_id}`}
                      className={cn(
                        "grid grid-cols-12 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors items-center",
                        index < 3 && "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10"
                      )}
                    >
                      {/* Position */}
                      <div className="col-span-1 flex items-center justify-center">
                        {getRankIcon(ranking.rank_position)}
                      </div>
                      
                      {/* Agent */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={ranking.agent?.avatar_url || undefined} />
                            <AvatarFallback>
                              {ranking.agent?.display_name?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {ranking.agent?.is_verified_agent && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate">
                            {ranking.agent?.display_name || 'Agente'}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {ranking.agent?.company_name || ranking.agent?.country}
                          </div>
                        </div>
                        {/* Top badges */}
                        <div className="hidden md:flex gap-1">
                          {ranking.agent?.badges?.slice(0, 2).map((badge) => {
                            const details = BADGE_DETAILS[badge as BadgeType];
                            return details ? (
                              <Badge 
                                key={badge} 
                                variant="secondary" 
                                className="text-xs"
                              >
                                {details.labelEs}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="col-span-2 text-center">
                        <div className={cn(
                          "inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg",
                          ranking.reputation_score >= 90 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          ranking.reputation_score >= 70 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {ranking.reputation_score}
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{ranking.rating_avg.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ranking.total_transactions} trans.
                        </div>
                      </div>
                      
                      {/* Change */}
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        {getChangeIcon(ranking.rank_change)}
                        {ranking.rank_change !== 0 && (
                          <span className={cn(
                            "font-medium",
                            ranking.rank_change > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {Math.abs(ranking.rank_change)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Movers */}
          {stats?.topRisers && stats.topRisers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Mayores subidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.topRisers.map((ranking) => (
                  <Link
                    key={ranking.id}
                    to={`/app/market/agents/${ranking.agent_id}`}
                    className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg -mx-2 transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={ranking.agent?.avatar_url || undefined} />
                      <AvatarFallback>{ranking.agent?.display_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {ranking.agent?.display_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +{ranking.rank_change}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* How it works */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                El ranking se calcula diariamente basándose en:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">40%</span>
                  Rating de clientes
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">30%</span>
                  Tasa de éxito
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">20%</span>
                  Volumen de transacciones
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">10%</span>
                  Verificación profesional
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* CTA */}
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <CardContent className="pt-6">
              <Award className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">¿Eres agente de PI?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Regístrate y aparece en el ranking para conectar con clientes.
              </p>
              <Link 
                to="/app/market/register" 
                className="inline-flex items-center text-sm text-primary font-medium hover:underline"
              >
                Registrarse como agente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
