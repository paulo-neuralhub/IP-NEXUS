// src/components/market/compliance/RiskScoreCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/kyc.types';

interface RiskScoreCardProps {
  score: number;
  level: RiskLevel;
  factors?: {
    name: string;
    score: number;
    weight: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  flags?: string[];
  recommendations?: string[];
}

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-500' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-500' },
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};

export function RiskScoreCard({ 
  score, 
  level, 
  factors = [], 
  flags = [], 
  recommendations = [] 
}: RiskScoreCardProps) {
  const colors = RISK_COLORS[level];

  const getScoreIcon = () => {
    switch (level) {
      case 'low':
        return <CheckCircle2 className="w-8 h-8 text-green-500" />;
      case 'medium':
        return <Info className="w-8 h-8 text-yellow-500" />;
      case 'high':
        return <AlertTriangle className="w-8 h-8 text-orange-500" />;
      case 'critical':
        return <XCircle className="w-8 h-8 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Evaluación de Riesgo
        </CardTitle>
        <CardDescription>
          Análisis automatizado basado en múltiples factores
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Score */}
        <div className={cn('p-6 rounded-lg text-center', colors.bg)}>
          <div className="flex justify-center mb-3">
            {getScoreIcon()}
          </div>
          <div className={cn('text-4xl font-bold mb-1', colors.text)}>
            {score}
            <span className="text-lg font-normal">/100</span>
          </div>
          <Badge variant="outline" className={cn('border-2', colors.border, colors.text)}>
            Riesgo {RISK_LABELS[level]}
          </Badge>
        </div>

        {/* Risk Factors */}
        {factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Factores de Riesgo</h4>
            {factors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {factor.impact === 'positive' && <TrendingDown className="w-4 h-4 text-green-500" />}
                    {factor.impact === 'negative' && <TrendingUp className="w-4 h-4 text-red-500" />}
                    {factor.impact === 'neutral' && <span className="w-4 h-4" />}
                    {factor.name}
                  </span>
                  <span className={cn(
                    'font-medium',
                    factor.impact === 'positive' && 'text-green-600',
                    factor.impact === 'negative' && 'text-red-600',
                    factor.impact === 'neutral' && 'text-muted-foreground'
                  )}>
                    {factor.score.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={factor.score} 
                  className={cn(
                    'h-1.5',
                    factor.impact === 'positive' && '[&>div]:bg-green-500',
                    factor.impact === 'negative' && '[&>div]:bg-red-500'
                  )}
                />
              </div>
            ))}
          </div>
        )}

        {/* Flags */}
        {flags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Alertas detectadas
            </h4>
            <ul className="space-y-1">
              {flags.map((flag, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Recomendaciones
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
