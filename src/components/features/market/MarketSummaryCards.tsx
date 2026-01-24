import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketStats {
  active: { count: number; value: number };
  pending: { count: number; value: number };
  won: { count: number; value: number };
  rejected: { count: number; value: number };
}

interface MarketSummaryCardsProps {
  stats: MarketStats;
  isLoading?: boolean;
}

const cards = [
  { key: 'active', label: 'Activos', icon: Briefcase, color: 'text-primary' },
  { key: 'pending', label: 'Pendientes', icon: Clock, color: 'text-warning' },
  { key: 'won', label: 'Ganados', icon: CheckCircle2, color: 'text-primary' },
  { key: 'rejected', label: 'Rechazados', icon: XCircle, color: 'text-destructive' },
] as const;

export function MarketSummaryCards({ stats, isLoading }: MarketSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, color }) => {
        const data = stats[key];
        return (
          <Card key={key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={cn('h-5 w-5', color)} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{data.count}</div>
                  <p className={cn('text-sm font-medium', color)}>
                    {formatCurrency(data.value)}
                  </p>
                </>
              )}
            </CardContent>
            {/* Decorative gradient */}
            <div 
              className={cn(
                'absolute bottom-0 left-0 right-0 h-1',
                key === 'active' && 'bg-primary',
                key === 'pending' && 'bg-warning',
                key === 'won' && 'bg-primary',
                key === 'rejected' && 'bg-destructive'
              )}
            />
          </Card>
        );
      })}
    </div>
  );
}
