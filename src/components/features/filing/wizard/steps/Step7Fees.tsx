import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, CreditCard, Building, RefreshCw, 
  AlertCircle, CheckCircle, Info, Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalculateFees } from '@/hooks/filing/useFiling';
import { Spinner } from '@/components/ui/spinner';
import type { WizardFormData } from '../FilingWizard';

interface Step7Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    label: 'Transferencia Bancaria',
    icon: Building,
    description: 'Pago mediante transferencia a cuenta oficial',
    available: true,
  },
  {
    id: 'credit_card',
    label: 'Tarjeta de Crédito',
    icon: CreditCard,
    description: 'Pago inmediato con tarjeta',
    available: true,
  },
  {
    id: 'deferred',
    label: 'Pago Diferido',
    icon: DollarSign,
    description: 'Cuenta corriente con la oficina (solo usuarios verificados)',
    available: false,
  },
];

export function Step7Fees({ formData, updateFormData, errors }: Step7Props) {
  const calculateFees = useCalculateFees();
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculateFees = async () => {
    if (!formData.office_code) return;
    
    setIsCalculating(true);
    try {
      const result = await calculateFees.mutateAsync({
        officeCode: formData.office_code,
        filingType: formData.filing_type,
        niceClasses: formData.nice_classes,
        claimsPriority: formData.priority_claimed,
      });

      if (result.success) {
        updateFormData({
          calculated_fees: {
            fees: result.fees,
            total: result.total,
            currency: result.currency,
          }
        });
      }
    } catch (error) {
      console.error('Fee calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Calculate fees on mount if not already calculated
  useEffect(() => {
    if (!formData.calculated_fees && formData.office_code) {
      handleCalculateFees();
    }
  }, [formData.office_code]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold">Tasas Oficiales</h3>
        <p className="text-muted-foreground">
          Cálculo de tasas y selección del método de pago
        </p>
      </div>

      {/* Fee Calculation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Desglose de Tasas
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCalculateFees}
              disabled={isCalculating}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isCalculating && "animate-spin")} />
              Recalcular
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-8 w-8" />
              <span className="ml-3">Calculando tasas...</span>
            </div>
          ) : formData.calculated_fees ? (
            <div className="space-y-4">
              {/* Individual fees */}
              <div className="space-y-3">
                {formData.calculated_fees.fees.map((fee, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">{fee.concept}</span>
                    <span className="font-medium">
                      {formatCurrency(fee.amount, fee.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between py-3 bg-muted/50 rounded-lg px-4">
                <span className="text-lg font-semibold">Total a Pagar</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(formData.calculated_fees.total, formData.calculated_fees.currency)}
                </span>
              </div>

              {/* Fee info */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p>Las tasas mostradas son las oficiales de la oficina seleccionada.</p>
                  <p>No incluyen honorarios profesionales ni IVA.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se han podido calcular las tasas.</p>
              <p className="text-sm">Verifica que has completado los pasos anteriores.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Método de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.payment_method || ''}
            onValueChange={(value) => updateFormData({ payment_method: value })}
            className="space-y-3"
          >
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon;
              return (
                <div
                  key={method.id}
                  className={cn(
                    "flex items-center space-x-4 rounded-lg border p-4 transition-colors",
                    method.available 
                      ? "cursor-pointer hover:bg-muted/50" 
                      : "opacity-50 cursor-not-allowed",
                    formData.payment_method === method.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => method.available && updateFormData({ payment_method: method.id })}
                >
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id}
                    disabled={!method.available}
                  />
                  <div className={cn(
                    "p-2 rounded-lg",
                    formData.payment_method === method.id ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      formData.payment_method === method.id ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1">
                    <Label 
                      htmlFor={method.id} 
                      className="font-medium cursor-pointer"
                    >
                      {method.label}
                      {!method.available && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          No disponible
                        </Badge>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                  {formData.payment_method === method.id && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              );
            })}
          </RadioGroup>

          {/* Payment instructions based on method */}
          {formData.payment_method === 'bank_transfer' && (
            <Card className="mt-4 bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Instrucciones de Transferencia
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Recibirás los datos bancarios de la oficina tras confirmar la solicitud</p>
                  <p>• El plazo de pago habitual es de 1-3 días laborables</p>
                  <p>• Incluye el número de referencia en el concepto</p>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.payment_method === 'credit_card' && (
            <Card className="mt-4 bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Pago con Tarjeta
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>• Serás redirigido a la pasarela de pago segura</p>
                  <p>• Se aceptan Visa, Mastercard y American Express</p>
                  <p>• El cargo se realizará inmediatamente</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Summary reminder */}
      {formData.calculated_fees && formData.payment_method && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-800">
                  Listo para revisar
                </p>
                <p className="text-sm text-emerald-700">
                  Total: {formatCurrency(formData.calculated_fees.total, formData.calculated_fees.currency)} • 
                  Método: {PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
