// ============================================================
// IP-NEXUS - SIGNATURE LEVEL SELECTOR
// PROMPT 22: Selector de nivel de firma con políticas
// ============================================================

import { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Lock,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignaturePolicy } from '@/hooks/use-signature';

interface SignatureLevelSelectorProps {
  selectedLevel: 'standard' | 'qualified';
  onLevelChange: (level: 'standard' | 'qualified') => void;
  policy: SignaturePolicy | undefined;
  qualifiedEnabled: boolean;
  qualifiedPrice: number;
}

export function SignatureLevelSelector({
  selectedLevel,
  onLevelChange,
  policy,
  qualifiedEnabled,
  qualifiedPrice,
}: SignatureLevelSelectorProps) {
  // Auto-select based on policy
  useEffect(() => {
    if (policy?.recommended_level && policy.recommended_level !== 'manual') {
      onLevelChange(policy.recommended_level as 'standard' | 'qualified');
    }
  }, [policy?.recommended_level, onLevelChange]);

  const isManualOnly = policy?.required_level === 'manual';
  const requiresQualified = policy?.required_level === 'qualified';
  const canSelectStandard = !requiresQualified && !isManualOnly;

  return (
    <div className="space-y-4">
      {/* Alerta de política - si hay warning */}
      {policy?.warning_message && (
        <Alert variant="destructive" className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Atención</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
            {policy.warning_message}
          </AlertDescription>
        </Alert>
      )}

      {/* Info de política */}
      {policy?.info_message && !policy?.warning_message && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            {policy.info_message}
          </AlertDescription>
        </Alert>
      )}

      {/* Warning si requiere manual */}
      {isManualOnly && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Firma electrónica no disponible</AlertTitle>
          <AlertDescription>
            Esta jurisdicción requiere firma manuscrita. Use el proceso tradicional 
            y registre la confirmación manual en la sección de "Confirmación Alternativa".
          </AlertDescription>
        </Alert>
      )}

      {!isManualOnly && (
        <RadioGroup
          value={selectedLevel}
          onValueChange={(v) => onLevelChange(v as 'standard' | 'qualified')}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Nivel 1: Estándar */}
          <div className="relative">
            <RadioGroupItem
              value="standard"
              id="sig-standard"
              className="peer sr-only"
              disabled={!canSelectStandard}
            />
            <Label
              htmlFor="sig-standard"
              className={cn(
                "flex flex-col h-full p-4 rounded-xl border-2 cursor-pointer transition-all",
                "hover:border-primary/50 hover:shadow-sm",
                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                !canSelectStandard && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Firma Estándar</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Incluida
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Firma Electrónica Avanzada (AES) con email + código OTP
              </p>

              <ul className="text-xs space-y-1 text-muted-foreground mb-3">
                <li className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span>
                  Audit trail completo
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span>
                  Válido eIDAS / ESIGN
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-green-600">✓</span>
                  EUIPO, USPTO, OEPM
                </li>
              </ul>

              <p className="text-lg font-bold text-green-600 mt-auto">€0</p>
            </Label>
          </div>

          {/* Nivel 2: Cualificada */}
          <div className="relative">
            <RadioGroupItem
              value="qualified"
              id="sig-qualified"
              className="peer sr-only"
              disabled={!qualifiedEnabled}
            />
            <Label
              htmlFor="sig-qualified"
              className={cn(
                "flex flex-col h-full p-4 rounded-xl border-2 cursor-pointer transition-all",
                "hover:border-primary/50 hover:shadow-sm",
                "peer-data-[state=checked]:border-violet-500 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950/30",
                !qualifiedEnabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-violet-600" />
                  <span className="font-semibold">Firma Cualificada</span>
                </div>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  Premium
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                Firma Electrónica Cualificada (QES) con verificación de identidad
              </p>

              <ul className="text-xs space-y-1 text-muted-foreground mb-3">
                <li className="flex items-center gap-1.5">
                  <span className="text-violet-600">✓</span>
                  Equivalente a firma manuscrita
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-violet-600">✓</span>
                  Certificado cualificado
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-violet-600">✓</span>
                  EPO, Alemania, alto valor
                </li>
              </ul>

              <p className="text-lg font-bold text-violet-600 mt-auto">
                €{qualifiedPrice.toFixed(2)}/firma
              </p>

              {!qualifiedEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Módulo no activado</span>
                  </div>
                </div>
              )}
            </Label>

            {requiresQualified && (
              <Badge className="absolute -top-2 -right-2 bg-amber-500">
                Requerido
              </Badge>
            )}
          </div>
        </RadioGroup>
      )}
    </div>
  );
}
