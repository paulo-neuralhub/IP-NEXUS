// src/components/features/ip-finance/ValuationWizard.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import type { ValuationInput, ValuationMethod, ValuationResult as ValuationResultType } from '@/types/ip-finance.types';
import { VALUATION_ASSET_TYPES, JURISDICTIONS, VALUATION_METHODS } from '@/types/ip-finance.types';
import { useCalculateValuation, useSaveValuation } from '@/hooks/finance/useAssetValuation';
import { ValuationResult } from './ValuationResult';

interface ValuationWizardProps {
  portfolioId?: string;
  assetId?: string;
  initialData?: Partial<ValuationInput>;
  onComplete?: () => void;
}

export function ValuationWizard({ portfolioId, assetId, initialData, onComplete }: ValuationWizardProps) {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState<ValuationInput>({
    assetType: initialData?.assetType || 'trademark',
    assetTitle: initialData?.assetTitle || '',
    registrationNumber: initialData?.registrationNumber,
    jurisdiction: initialData?.jurisdiction,
    acquisitionCost: initialData?.acquisitionCost,
    acquisitionDate: initialData?.acquisitionDate,
    projectedRevenue: initialData?.projectedRevenue,
    brandStrength: initialData?.brandStrength ?? 50,
    marketPosition: initialData?.marketPosition ?? 50,
    legalStrength: initialData?.legalStrength ?? 50,
  });
  const [methods, setMethods] = useState<ValuationMethod[]>(['cost', 'market', 'income']);
  const [result, setResult] = useState<ValuationResultType | null>(null);

  const calculate = useCalculateValuation();
  const save = useSaveValuation();

  const handleCalculate = async () => {
    const res = await calculate.mutateAsync({ input, methods });
    setResult(res);
    setStep(4);
  };

  const handleSave = async () => {
    if (!result) return;
    await save.mutateAsync({
      assetId,
      portfolioId,
      valuation: {
        ...result,
        factors: {
          developmentCost: input.acquisitionCost,
          projectedRevenue: input.projectedRevenue,
          brandStrength: input.brandStrength,
          marketPosition: input.marketPosition,
          legalStrength: input.legalStrength,
        },
      },
    });
    onComplete?.();
  };

  const totalSteps = 4;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valoración de Activo
          </CardTitle>
          <span className="text-sm text-muted-foreground">Paso {step}/{totalSteps}</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-2 mt-2" />
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de activo</Label>
              <Select value={input.assetType} onValueChange={(v) => setInput({ ...input, assetType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VALUATION_ASSET_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label.es}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre del activo</Label>
              <Input 
                value={input.assetTitle} 
                onChange={(e) => setInput({ ...input, assetTitle: e.target.value })}
                placeholder="Ej: Marca ACME"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de registro</Label>
                <Input 
                  value={input.registrationNumber || ''} 
                  onChange={(e) => setInput({ ...input, registrationNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jurisdicción</Label>
                <Select value={input.jurisdiction} onValueChange={(v) => setInput({ ...input, jurisdiction: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(JURISDICTIONS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.flag} {config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Costo de adquisición (€)</Label>
                <Input 
                  type="number"
                  value={input.acquisitionCost || ''} 
                  onChange={(e) => setInput({ ...input, acquisitionCost: Number(e.target.value) })}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de adquisición</Label>
                <Input 
                  type="date"
                  value={input.acquisitionDate || ''} 
                  onChange={(e) => setInput({ ...input, acquisitionDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ingresos proyectados anuales (€)</Label>
              <Input 
                type="number"
                value={input.projectedRevenue || ''} 
                onChange={(e) => setInput({ ...input, projectedRevenue: Number(e.target.value) })}
                placeholder="100000"
              />
              <p className="text-xs text-muted-foreground">
                Ingresos asociados al activo o negocio que lo utiliza
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Métodos de valoración</Label>
              <div className="space-y-2">
                {(['cost', 'market', 'income'] as ValuationMethod[]).map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={methods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) setMethods([...methods, method]);
                        else setMethods(methods.filter(m => m !== method));
                      }}
                    />
                    <label htmlFor={method} className="text-sm">
                      {VALUATION_METHODS[method].label.es}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Fortaleza de marca</Label>
                  <span className="text-sm font-medium">{input.brandStrength}%</span>
                </div>
                <Slider
                  value={[input.brandStrength || 50]}
                  onValueChange={([v]) => setInput({ ...input, brandStrength: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Posición de mercado</Label>
                  <span className="text-sm font-medium">{input.marketPosition}%</span>
                </div>
                <Slider
                  value={[input.marketPosition || 50]}
                  onValueChange={([v]) => setInput({ ...input, marketPosition: v })}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Fortaleza legal</Label>
                  <span className="text-sm font-medium">{input.legalStrength}%</span>
                </div>
                <Slider
                  value={[input.legalStrength || 50]}
                  onValueChange={([v]) => setInput({ ...input, legalStrength: v })}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <ValuationResult 
            result={result} 
            input={input}
            onSave={handleSave}
            isSaving={save.isPending}
          />
        )}

        {step < 4 && (
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleCalculate} disabled={calculate.isPending || methods.length === 0}>
                {calculate.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculando...</>
                ) : (
                  <><Calculator className="h-4 w-4 mr-2" /> Calcular valoración</>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
