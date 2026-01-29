/**
 * MatterAISummary - AI-powered summary panel for a matter
 * Shows overall health, next steps, and risks based on communications
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface MatterAISummaryProps {
  matterId: string;
  className?: string;
}

interface MatterSummary {
  overall_summary: string;
  health_status: 'healthy' | 'attention' | 'critical';
  sentiment_trend: 'improving' | 'stable' | 'declining';
  suggested_next_steps: string[];
  risks: string[];
  key_topics: string[];
  pending_action_items: number;
  generated_at: string;
}

export function MatterAISummary({ matterId, className }: MatterAISummaryProps) {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch existing summary from communications AI analysis
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['matter-ai-summary', matterId],
    queryFn: async () => {
      // Get recent communications with AI analysis
      const { data: comms, error } = await supabase
        .from('communications')
        .select('ai_summary, ai_sentiment, ai_action_items, ai_topics, ai_urgency_score, ai_classified_at')
        .eq('matter_id', matterId)
        .not('ai_summary', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!comms || comms.length === 0) return null;

      // Aggregate data from analyzed communications
      const sentiments = comms.map(c => c.ai_sentiment).filter(Boolean) as number[];
      const avgSentiment = sentiments.length > 0 
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length 
        : 0.5;

      const allTopics = comms.flatMap(c => (c.ai_topics as string[]) || []);
      const topicCounts = allTopics.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic);

      const allActionItems = comms.flatMap(c => {
        const items = c.ai_action_items as Array<{ text: string; assignee_hint?: string }> | null;
        return items?.filter(i => i.assignee_hint === 'self') || [];
      });

      const avgUrgency = comms
        .map(c => c.ai_urgency_score)
        .filter(Boolean)
        .reduce((sum, u, _, arr) => sum + (u as number) / arr.length, 0);

      // Determine health status
      let health_status: 'healthy' | 'attention' | 'critical' = 'healthy';
      if (avgSentiment < 0.35 || avgUrgency > 0.7) {
        health_status = 'critical';
      } else if (avgSentiment < 0.5 || avgUrgency > 0.5) {
        health_status = 'attention';
      }

      // Build summary
      const summary: MatterSummary = {
        overall_summary: comms[0]?.ai_summary || 'No hay análisis disponible',
        health_status,
        sentiment_trend: avgSentiment > 0.6 ? 'improving' : avgSentiment < 0.4 ? 'declining' : 'stable',
        suggested_next_steps: allActionItems.slice(0, 3).map(i => i.text),
        risks: avgUrgency > 0.6 ? ['Alta urgencia detectada en comunicaciones recientes'] : [],
        key_topics: sortedTopics,
        pending_action_items: allActionItems.length,
        generated_at: comms[0]?.ai_classified_at || new Date().toISOString()
      };

      return summary;
    },
    enabled: !!matterId && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to regenerate summary (analyze all unanalyzed comms)
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const { data: unanalyzed } = await supabase
        .from('communications')
        .select('id')
        .eq('matter_id', matterId)
        .is('ai_summary', null)
        .limit(10);

      if (!unanalyzed || unanalyzed.length === 0) {
        throw new Error('No hay comunicaciones pendientes de analizar');
      }

      let analyzed = 0;
      for (const comm of unanalyzed) {
        await supabase.functions.invoke('analyze-communication', {
          body: {
            communication_id: comm.id,
            organization_id: organizationId,
          },
        });
        analyzed++;
        // Delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }

      return analyzed;
    },
    onSuccess: (count) => {
      toast.success(`${count} comunicaciones analizadas`);
      queryClient.invalidateQueries({ queryKey: ['matter-ai-summary', matterId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Resumen Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthIcon = () => {
    switch (summaryData?.health_status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'attention':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getHealthLabel = () => {
    switch (summaryData?.health_status) {
      case 'healthy': return 'Saludable';
      case 'attention': return 'Requiere atención';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const getHealthColor = () => {
    switch (summaryData?.health_status) {
      case 'healthy': return 'bg-success/10 text-success';
      case 'attention': return 'bg-warning/10 text-warning';
      case 'critical': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Resumen Inteligente
            <Badge variant="outline" className="text-xs font-normal">
              IA
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {summaryData ? (
          <div className="space-y-4">
            {/* Health Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge className={cn("gap-1", getHealthColor())}>
                {getHealthIcon()}
                {getHealthLabel()}
              </Badge>
              {summaryData.sentiment_trend === 'improving' && (
                <TrendingUp className="h-4 w-4 text-success ml-auto" />
              )}
            </div>

            {/* Summary */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summaryData.overall_summary}
            </p>

            {/* Key Topics */}
            {summaryData.key_topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {summaryData.key_topics.map((topic, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}

            {/* Next Steps */}
            {summaryData.suggested_next_steps.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Próximos pasos sugeridos:
                </p>
                {summaryData.suggested_next_steps.map((step, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 text-sm"
                  >
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Risks */}
            {summaryData.risks.length > 0 && (
              <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <ShieldAlert className="h-4 w-4" />
                  {summaryData.risks[0]}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Actualizado: {formatDistanceToNow(new Date(summaryData.generated_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              No hay resumen generado aún
            </p>
            <Button
              size="sm"
              onClick={() => regenerateMutation.mutate()}
              disabled={regenerateMutation.isPending}
            >
              {regenerateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Sparkles className="h-4 w-4 mr-2" />
              Generar resumen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MatterAISummary;
