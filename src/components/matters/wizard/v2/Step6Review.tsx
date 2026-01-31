// ============================================================
// IP-NEXUS - STEP 6: REVIEW & CREATE (V2)
// L132: Final review before matter creation with duplicate detection
// ============================================================

import { motion } from 'framer-motion';
import { 
  Check, AlertCircle, Shield, Building, Globe, Tag, 
  Calendar, Coins, FileText, Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DuplicateChecker } from '@/components/matters/DuplicateChecker';
import type { MatterWizardState } from './types';

interface Step6ReviewProps {
  wizardData: MatterWizardState;
  previewNumber?: string;
  clientName?: string;
}

export function Step6Review({ wizardData, previewNumber, clientName }: Step6ReviewProps) {
  const { step1, step2, step3, step4, step5 } = wizardData;
  
  // Validation checks
  const checks = [
    { label: 'Tipo de expediente seleccionado', valid: !!step1.matterType },
    { label: 'Jurisdicción seleccionada', valid: step1.jurisdictions.length > 0 },
    { label: 'Cliente asignado', valid: !!step2.clientId },
    { label: 'Titular definido', valid: step2.clientIsOwner || step2.parties.some(p => p.role === 'owner') },
    { label: 'Título/Denominación completo', valid: !!(step3.title || step3.markName || step3.inventionTitle) },
    { label: 'Clasificación válida', valid: (step3.niceClasses?.length || 0) > 0 || !step1.matterType.startsWith('TM'), warning: !step1.matterType.startsWith('TM') },
  ];

  const allValid = checks.every(c => c.valid);
  const hasWarnings = checks.some(c => c.warning);

  // Calculate totals
  const totalFees = step5.feeLines.reduce((sum, f) => sum + (f.amount * f.quantity), 0);

  // Get first priority for duplicate check
  const firstPriority = step4.priorities[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Resumen del Expediente</h2>
        <p className="text-muted-foreground">Revisa la información antes de crear</p>
      </div>

      {/* HEADER CARD */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">
                {step3.markName || step3.inventionTitle || step3.title || 'Sin título'}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Badge variant="outline">{step1.matterType}</Badge>
                <span>·</span>
                <span>{step1.jurisdictions.join(', ')}</span>
              </div>
              {previewNumber && (
                <p className="text-sm text-primary font-mono mt-2">
                  Nº: {previewNumber}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DUPLICATE CHECKER */}
      <DuplicateChecker
        markName={step3.markName}
        clientId={step2.clientId}
        jurisdiction={step1.jurisdictions[0]}
        niceClasses={step3.niceClasses}
        priorityNumber={firstPriority?.number}
        priorityCountry={firstPriority?.country}
        priorityDate={firstPriority?.date}
        matterType={step1.matterType}
      />

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Parties */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Cliente:</span>
              <span className="ml-2 font-medium">{clientName || 'No asignado'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Titular:</span>
              <span className="ml-2 font-medium">
                {step2.clientIsOwner ? '(mismo que cliente)' : 
                  step2.parties.filter(p => p.role === 'owner').length + ' titular(es)'}
              </span>
            </div>
            {step2.parties.filter(p => p.role === 'inventor').length > 0 && (
              <div>
                <span className="text-muted-foreground">Inventores:</span>
                <span className="ml-2 font-medium">
                  {step2.parties.filter(p => p.role === 'inventor').length}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Clasificación
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {step3.niceClasses && step3.niceClasses.length > 0 ? (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {step3.niceClasses.slice(0, 5).map(cls => (
                    <Badge key={cls} variant="secondary">Clase {cls}</Badge>
                  ))}
                  {step3.niceClasses.length > 5 && (
                    <Badge variant="outline">+{step3.niceClasses.length - 5} más</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">
                  {Object.values(step3.niceClassesDetail || {}).flat().length} productos/servicios
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No aplica</p>
            )}
          </CardContent>
        </Card>

        {/* Priorities */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Prioridades
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {step4.priorities.length > 0 ? (
              <div className="space-y-1">
                {step4.priorities.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{p.country}</span>
                    <span className="text-muted-foreground">{p.number}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sin prioridades</p>
            )}
          </CardContent>
        </Card>

        {/* Fees */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: step5.currency,
              }).format(totalFees)}
            </p>
            <p className="text-muted-foreground">
              {step5.feeLines.length} conceptos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* VALIDATION CHECKS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Check className="h-4 w-4" />
            Comprobaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {check.valid ? (
                  <Check className="h-4 w-4 text-success" />
                ) : check.warning ? (
                  <AlertCircle className="h-4 w-4 text-warning" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  check.valid ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!allValid && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          Completa los campos obligatorios antes de crear el expediente
        </div>
      )}
    </motion.div>
  );
}
