// src/components/features/ip-finance/PortfolioOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Briefcase, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';
import { usePortfolioMetrics } from '@/hooks/finance/usePortfolioValuation';

interface PortfolioOverviewProps {
  portfolioId: string;
}

function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function PortfolioOverview({ portfolioId }: PortfolioOverviewProps) {
  const metrics = usePortfolioMetrics(portfolioId);

  if (!metrics) return null;

  const isPositiveROI = metrics.roi >= 0;
  const isPositiveChange = metrics.valueChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue, metrics.currency)}</div>
          <div className={`flex items-center text-sm mt-1 ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveChange ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {isPositiveChange ? '+' : ''}{metrics.valueChangePercent.toFixed(1)}% vs anterior
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveROI ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveROI ? '+' : ''}{metrics.roi.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Ganancia: {formatCurrency(metrics.unrealizedGain, metrics.currency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.assetCount}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Costo: {formatCurrency(metrics.totalCost, metrics.currency)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Valor Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.assetCount > 0 ? metrics.totalValue / metrics.assetCount : 0, metrics.currency)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">por activo</div>
        </CardContent>
      </Card>
    </div>
  );
}
