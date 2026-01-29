/**
 * AIInsightsBadge - Compact AI analysis indicator for timeline items
 * Shows sentiment icon with tooltip containing full analysis
 */

import { cn } from '@/lib/utils';
import { 
  Smile, 
  Meh, 
  Frown, 
  Sparkles, 
  AlertTriangle,
  CheckSquare,
  Calendar,
  Users,
  Building2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export interface AIAnalysis {
  summary?: string;
  sentiment?: number;
  sentiment_label?: 'negative' | 'neutral' | 'positive';
  topics?: string[];
  action_items?: Array<{
    text: string;
    assignee_hint?: 'self' | 'client' | 'other';
    due_hint?: string | null;
  }>;
  urgency_score?: number;
  entities?: {
    people?: string[];
    companies?: string[];
    amounts?: string[];
  };
  commitments?: Array<{
    who: string;
    what: string;
    when?: string | null;
  }>;
  key_dates?: string[];
}

interface AIInsightsBadgeProps {
  analysis: AIAnalysis | null | undefined;
  compact?: boolean;
  className?: string;
}

export function AIInsightsBadge({ 
  analysis, 
  compact = true,
  className 
}: AIInsightsBadgeProps) {
  if (!analysis || !analysis.summary) return null;

  const sentiment = analysis.sentiment ?? 0.5;
  
  const getSentimentIcon = () => {
    if (sentiment > 0.65) return <Smile className="h-3.5 w-3.5" />;
    if (sentiment < 0.35) return <Frown className="h-3.5 w-3.5" />;
    return <Meh className="h-3.5 w-3.5" />;
  };

  const getSentimentColor = () => {
    if (sentiment > 0.65) return 'text-green-600 dark:text-green-400';
    if (sentiment < 0.35) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const hasActionItems = analysis.action_items && analysis.action_items.length > 0;
  const hasEntities = analysis.entities && (
    (analysis.entities.people?.length || 0) > 0 ||
    (analysis.entities.companies?.length || 0) > 0
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
              "bg-primary/10 hover:bg-primary/20 transition-colors",
              "text-xs font-medium",
              className
            )}
          >
            <Sparkles className="h-3 w-3 text-primary" />
            <span className={getSentimentColor()}>
              {getSentimentIcon()}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="start"
          className="max-w-sm p-3 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Análisis IA
          </div>
          
          <p className="text-sm">{analysis.summary}</p>
          
          {analysis.topics && analysis.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {analysis.topics.map((topic, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-xs py-0"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {hasActionItems && (
            <div className="pt-1 border-t border-border">
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                <CheckSquare className="h-3 w-3" />
                Tareas detectadas
              </div>
              <ul className="text-xs space-y-0.5">
                {analysis.action_items!.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-muted-foreground">•</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(analysis.urgency_score ?? 0) > 0.6 && (
            <div className="flex items-center gap-1 text-xs text-warning font-medium">
              <AlertTriangle className="h-3 w-3" />
              Alta urgencia detectada
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded version
  return (
    <div className={cn(
      "rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3",
      className
    )}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Resumen IA</span>
        <span className={cn("ml-auto", getSentimentColor())}>
          {getSentimentIcon()}
        </span>
      </div>

      <p className="text-sm text-muted-foreground">{analysis.summary}</p>

      {analysis.topics && analysis.topics.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {analysis.topics.map((topic, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {hasActionItems && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium">
            <CheckSquare className="h-3.5 w-3.5 text-primary" />
            Tareas detectadas
          </div>
          {analysis.action_items!.map((item, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              {item.text}
              {item.due_hint && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {item.due_hint}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {hasEntities && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {analysis.entities!.people?.map((p, i) => (
            <span key={`p-${i}`} className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />{p}
            </span>
          ))}
          {analysis.entities!.companies?.map((c, i) => (
            <span key={`c-${i}`} className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" />{c}
            </span>
          ))}
        </div>
      )}

      {analysis.key_dates && analysis.key_dates.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Fechas: {analysis.key_dates.join(', ')}
        </div>
      )}

      {(analysis.urgency_score ?? 0) > 0.6 && (
        <div className="flex items-center gap-1 text-xs text-warning font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          Alta urgencia
        </div>
      )}
    </div>
  );
}

export default AIInsightsBadge;
