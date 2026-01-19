// src/components/features/ip-finance/ValuationResult.tsx
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Save, Download, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import type { ValuationInput, ValuationResult as ValuationResultType } from '@/types/ip-finance.types';

interface ValuationResultProps {
  result: ValuationResultType;
  input: ValuationInput;
  onSave: () => void;
  isSaving: boolean;
}

function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function ValuationResult({ result, input, onSave, isSaving }: ValuationResultProps) {
  const confidencePercent = Math.round(result.confidence_level * 100);

  return (
    <div className="space-y-6">
      <div className="text-center py-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Valor Estimado</p>
        <p className="text-4xl font-bold text-primary">{formatCurrency(result.estimated_value)}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Rango: {formatCurrency(result.value_range_low)} - {formatCurrency(result.value_range_high)}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Nivel de confianza</span>
          <span className="font-medium">{confidencePercent}%</span>
        </div>
        <Progress value={confidencePercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {confidencePercent >= 70 ? 'Alta confianza en la estimación' :
           confidencePercent >= 50 ? 'Confianza moderada - considerar más datos' :
           'Baja confianza - se recomienda revisión adicional'}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="font-medium">Desglose por método</p>
        
        {result.cost_approach_value !== undefined && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enfoque de costos</p>
              <p className="text-xs text-muted-foreground">Basado en costos de desarrollo</p>
            </div>
            <p className="font-semibold">{formatCurrency(result.cost_approach_value)}</p>
          </div>
        )}

        {result.market_approach_value !== undefined && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enfoque de mercado</p>
              <p className="text-xs text-muted-foreground">Basado en transacciones comparables</p>
            </div>
            <p className="font-semibold">{formatCurrency(result.market_approach_value)}</p>
          </div>
        )}

        {result.income_approach_value !== undefined && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enfoque de ingresos</p>
              <p className="text-xs text-muted-foreground">Basado en flujos futuros</p>
            </div>
            <p className="font-semibold">{formatCurrency(result.income_approach_value)}</p>
          </div>
        )}
      </div>

      {result.ai_analysis && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis IA
            </p>
            <p className="text-sm text-muted-foreground">{result.ai_analysis}</p>
          </div>
        </>
      )}

      <div className="flex gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <p className="text-yellow-700 dark:text-yellow-300">
          Esta valoración es una estimación orientativa. Para valoraciones oficiales, 
          consulte con un profesional certificado.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button onClick={onSave} disabled={isSaving} className="flex-1">
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Guardar valoración</>
          )}
        </Button>
      </div>
    </div>
  );
}
