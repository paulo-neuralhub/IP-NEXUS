import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AICreditsCardProps {
  used: number;
  total: number;
  variant?: 'card' | 'pill';
}

export function AICreditsCard({ used, total, variant = 'card' }: AICreditsCardProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const remaining = total - used;
  const isLow = percentage >= 80;
  const isCritical = percentage >= 95;

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border bg-background-card px-3 py-2',
          (isLow || isCritical) && 'border-warning/30 bg-warning/10',
        )}
        aria-label="Créditos IA"
      >
        <Sparkles className="h-4 w-4 text-module-genius" />
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Tokens</span>
          <span className={cn('text-sm font-semibold', isCritical && 'text-destructive', isLow && !isCritical && 'text-warning')}>
            {used.toLocaleString()}/{total.toLocaleString()}
          </span>
        </div>
        <div className="h-6 w-px bg-border" />
        <span className={cn('text-xs', isCritical ? 'text-destructive' : isLow ? 'text-warning' : 'text-muted-foreground')}>
          {remaining.toLocaleString()} restantes
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-module-genius" />
          Créditos IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Usados este mes</span>
            <span className={cn(
              "font-medium",
              isCritical && "text-destructive",
              isLow && !isCritical && "text-warning"
            )}>
              {used.toLocaleString()} / {total.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
                isCritical && "[&>div]:bg-destructive",
                isLow && !isCritical && "[&>div]:bg-warning"
            )}
          />
          
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-xs",
              isCritical ? "text-destructive" : isLow ? "text-warning" : "text-muted-foreground"
            )}>
              {remaining.toLocaleString()} créditos restantes
            </p>
            {isCritical && (
              <div className="flex items-center gap-1 text-destructive">
                <Zap className="h-3 w-3" />
                <span className="text-xs font-medium">Bajo</span>
              </div>
            )}
          </div>

          <Button variant="outline" className="w-full" size="sm" asChild>
            <Link to="/app/genius">
              <Sparkles className="h-4 w-4 mr-2" />
              Usar Genius
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
