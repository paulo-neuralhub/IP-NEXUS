// ============================================================
// IP-NEXUS BACKOFFICE - Pack Profitability Analysis
// ============================================================

import { TrendingUp, Info, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TelephonyPack } from '@/hooks/useTelephonyPacks';

interface PackProfitabilityAnalysisProps {
  packs: TelephonyPack[];
  costPerMinute?: number; // Average cost per minute to provider
}

interface PackAnalysis {
  pack: TelephonyPack;
  estimatedCost: number;
  margin: number;
  marginPercentage: number;
  avgConsumption: number; // Simulated average consumption percentage
}

export function PackProfitabilityAnalysis({
  packs,
  costPerMinute = 0.017, // Default €0.017/min
}: PackProfitabilityAnalysisProps) {
  // Simulate consumption patterns (in real app, this would come from DB)
  const consumptionPatterns: Record<string, number> = {
    'PACK_STARTER': 78,
    'PACK_BASIC': 68,
    'PACK_STANDARD': 62,
    'PACK_PROFESSIONAL': 55,
    'PACK_ENTERPRISE': 48,
    'PACK_UNLIMITED': 85,
  };

  const analysis: PackAnalysis[] = packs
    .filter(p => p.is_active)
    .map((pack) => {
      const estimatedCost = pack.minutes_included * costPerMinute;
      const margin = Number(pack.price) - estimatedCost;
      const marginPercentage = (margin / Number(pack.price)) * 100;
      const avgConsumption = consumptionPatterns[pack.code] || 60;
      
      return {
        pack,
        estimatedCost,
        margin,
        marginPercentage,
        avgConsumption,
      };
    })
    .sort((a, b) => b.marginPercentage - a.marginPercentage);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  const totalRevenue = analysis.reduce((sum, a) => sum + Number(a.pack.price), 0);
  const totalCost = analysis.reduce((sum, a) => sum + a.estimatedCost, 0);
  const avgMargin = analysis.length > 0
    ? analysis.reduce((sum, a) => sum + a.marginPercentage, 0) / analysis.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Margen Promedio</p>
              <p className="text-2xl font-bold text-success">{avgMargin.toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Coste Base</p>
              <p className="text-2xl font-bold">{formatCurrency(costPerMinute)}/min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Packs Activos</p>
              <p className="text-2xl font-bold">{analysis.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margins Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cálculo de Márgenes por Pack
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Coste estimado si se consumen todos los minutos a tarifa base.
                  El margen real suele ser mayor debido a minutos no consumidos.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 font-medium">Pack</th>
                  <th className="text-right py-2 font-medium">Precio</th>
                  <th className="text-right py-2 font-medium">Coste Est.</th>
                  <th className="text-right py-2 font-medium">Margen</th>
                  <th className="text-right py-2 font-medium">% Margen</th>
                </tr>
              </thead>
              <tbody>
                {analysis.map(({ pack, estimatedCost, margin, marginPercentage }) => (
                  <tr key={pack.id} className="border-b border-muted/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {pack.name}
                        {pack.is_featured && (
                          <Badge variant="secondary" className="text-xs">⭐</Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 font-medium">
                      {formatCurrency(Number(pack.price))}
                    </td>
                    <td className="text-right py-3 text-muted-foreground">
                      {formatCurrency(estimatedCost)}
                    </td>
                    <td className="text-right py-3 font-medium text-success">
                      {formatCurrency(margin)}
                    </td>
                    <td className="text-right py-3">
                      <Badge
                        variant={marginPercentage >= 60 ? 'default' : marginPercentage >= 40 ? 'secondary' : 'outline'}
                        className={marginPercentage >= 60 ? 'bg-success' : ''}
                      >
                        {marginPercentage.toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Consumption Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Consumo Real vs Incluido
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Porcentaje promedio de minutos consumidos antes de expirar.
                  Menor consumo = mayor margen real.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.map(({ pack, avgConsumption }) => (
            <div key={pack.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{pack.name}</span>
                <span className="text-muted-foreground">{avgConsumption}% consumido</span>
              </div>
              <Progress value={avgConsumption} className="h-2" />
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            ℹ️ En promedio, los usuarios consumen el {(analysis.reduce((sum, a) => sum + a.avgConsumption, 0) / analysis.length).toFixed(0)}% de sus
            minutos antes de expirar, mejorando el margen real.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
