// ============================================================
// IP-NEXUS - STEP 6: REVIEW & CREATE (V2)
// L132: Final review before matter creation with duplicate detection
// ============================================================

import { motion } from 'framer-motion';
import { 
  Check, AlertCircle, Shield, Globe, Tag, 
  Calendar, Coins, Users, FileText, Lightbulb, 
  Zap, Building, CheckCircle, Upload, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DuplicateChecker } from '@/components/matters/DuplicateChecker';
import type { MatterWizardState } from './types';

interface Step6ReviewProps {
  wizardData: MatterWizardState;
  previewNumber?: string;
  clientName?: string;
}

// Helper to get jurisdiction display name
const getJurisdictionName = (code: string): string => {
  const names: Record<string, string> = {
    'ES': '🇪🇸 España (OEPM)',
    'EU': '🇪🇺 Unión Europea (EUIPO)',
    'US': '🇺🇸 Estados Unidos (USPTO)',
    'WO': '🌍 Internacional (WIPO)',
    'CN': '🇨🇳 China (CNIPA)',
    'JP': '🇯🇵 Japón (JPO)',
    'KR': '🇰🇷 Corea (KIPO)',
    'GB': '🇬🇧 Reino Unido (UKIPO)',
    'DE': '🇩🇪 Alemania (DPMA)',
    'FR': '🇫🇷 Francia (INPI)',
  };
  return names[code] || code;
};

// Helper to get mark type display
const getMarkTypeName = (code?: string): string => {
  const names: Record<string, string> = {
    'word': 'Denominativa',
    'figurative': 'Figurativa',
    'mixed': 'Mixta',
    '3d': 'Tridimensional',
    'sound': 'Sonora',
  };
  return code ? names[code] || code : 'No especificado';
};

export function Step6Review({ wizardData, previewNumber, clientName }: Step6ReviewProps) {
  const { step1, step2, step3, step4, step5 } = wizardData;
  
  // Jurisdiction flags
  const primaryJurisdiction = step1.jurisdictions[0];
  const isES = primaryJurisdiction === 'ES';
  const isEU = primaryJurisdiction === 'EU';
  const isUS = primaryJurisdiction === 'US';
  const isWO = primaryJurisdiction === 'WO';
  const isCN = primaryJurisdiction === 'CN';
  
  const isTrademarkType = step1.matterType?.startsWith('TM') || step1.matterType === 'NC';
  const isPatentType = step1.matterType?.startsWith('PT') || step1.matterType === 'UM';
  
  // Validation checks
  const checks = [
    { label: 'Tipo de expediente seleccionado', valid: !!step1.matterType },
    { label: 'Jurisdicción seleccionada', valid: step1.jurisdictions.length > 0 },
    { label: 'Cliente asignado', valid: !!step2.clientId },
    { label: 'Titular definido', valid: step2.clientIsOwner || step2.parties.some(p => p.role === 'owner') },
    { label: 'Título/Denominación completo', valid: !!(step3.title || step3.markName || step3.inventionTitle) },
    { label: 'Clasificación válida', valid: (step3.niceClasses?.length || 0) > 0 || !isTrademarkType, warning: !isTrademarkType },
  ];

  const allValid = checks.every(c => c.valid);

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
        <p className="text-muted-foreground">Revisa toda la información antes de crear</p>
      </div>

      {/* HEADER CARD */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              {isTrademarkType ? (
                <span className="text-3xl">®️</span>
              ) : isPatentType ? (
                <span className="text-3xl">⚙️</span>
              ) : (
                <Shield className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{step1.matterType}</Badge>
                {step1.filingRoute !== 'national' && (
                  <Badge variant="outline">{step1.filingRoute === 'regional' ? 'Regional' : 'Internacional'}</Badge>
                )}
                {step5.invoiceTiming === 'on_create' && (
                  <Badge variant="secondary">Factura automática</Badge>
                )}
              </div>
              <h3 className="text-xl font-bold mt-1">
                {step3.markName || step3.inventionTitle || step3.title || 'Sin título'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step1.jurisdictions.map(j => getJurisdictionName(j)).join(' • ')}
              </p>
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
        jurisdiction={primaryJurisdiction}
        niceClasses={step3.niceClasses}
        priorityNumber={firstPriority?.number}
        priorityCountry={firstPriority?.country}
        priorityDate={firstPriority?.date}
        matterType={step1.matterType}
      />

      {/* SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client & Parties */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-medium">{clientName || 'No asignado'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Titulares
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="font-medium">
              {step2.clientIsOwner ? '(mismo que cliente)' : 
                `${step2.parties.filter(p => p.role === 'owner').length} titular(es)`}
            </p>
            {step2.parties.filter(p => p.role === 'inventor').length > 0 && (
              <p className="text-muted-foreground">
                + {step2.parties.filter(p => p.role === 'inventor').length} inventores
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mark Type (for trademarks) */}
        {isTrademarkType && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Tipo de marca
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{getMarkTypeName(step3.markType)}</p>
              {step3.claimedColors && (
                <p className="text-muted-foreground text-xs mt-1">
                  Colores: {step3.claimedColors}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Classification */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Clasificación Nice
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
                    <span>{getJurisdictionName(p.country).split(' ')[0]}</span>
                    <span className="text-muted-foreground font-mono text-xs">{p.number}</span>
                    <span className="text-muted-foreground text-xs">({p.date})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sin prioridades reivindicadas</p>
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
              {step5.feeLines.filter(f => f.type === 'official').length} tasas oficiales, 
              {' '}{step5.feeLines.filter(f => f.type === 'professional').length} honorarios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* JURISDICTION-SPECIFIC SUMMARY */}
      {isES && (step3.jurisdictionFields?.oepmPymeReduction || step3.jurisdictionFields?.oepmModality === 'accelerated') && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="py-3 flex flex-col gap-2">
            {step3.jurisdictionFields?.oepmPymeReduction && (
              <p className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Reducción PYME solicitada (50% tasas)
              </p>
            )}
            {step3.jurisdictionFields?.oepmModality === 'accelerated' && (
              <p className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Modalidad acelerada
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isEU && (step3.jurisdictionFields?.euipoFastTrack || step3.jurisdictionFields?.euipoSecondLanguage) && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-3 flex flex-col gap-2">
            {step3.jurisdictionFields?.euipoFastTrack && (
              <p className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Fast Track activado - Examen acelerado
              </p>
            )}
            {step3.jurisdictionFields?.euipoSecondLanguage && (
              <p className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                2º idioma: {step3.jurisdictionFields.euipoSecondLanguage.toUpperCase()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isUS && step3.jurisdictionFields?.usptoBasis && (
        <Card className="border-l-4 border-l-blue-700">
          <CardContent className="py-3 flex flex-col gap-2">
            <p className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Base de solicitud: §{step3.jurisdictionFields.usptoBasis}
              {step3.jurisdictionFields.usptoBasis === '1a' && ' - Uso en comercio'}
              {step3.jurisdictionFields.usptoBasis === '1b' && ' - Intención de uso'}
              {step3.jurisdictionFields.usptoBasis === '44d' && ' - Prioridad extranjera'}
              {step3.jurisdictionFields.usptoBasis === '44e' && ' - Registro extranjero'}
            </p>
            {step3.jurisdictionFields?.usptoFirstUseDate && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Primer uso: {step3.jurisdictionFields.usptoFirstUseDate}
              </p>
            )}
            {step3.jurisdictionFields?.usptoDisclaimer && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                Disclaimer: "{step3.jurisdictionFields.usptoDisclaimer}"
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isWO && step3.jurisdictionFields?.wipoBaseNumber && (
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-3 flex flex-col gap-2">
            <p className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Marca base: {step3.jurisdictionFields.wipoBaseCountry} {step3.jurisdictionFields.wipoBaseNumber}
            </p>
            {step3.jurisdictionFields?.wipoDesignatedCountries && step3.jurisdictionFields.wipoDesignatedCountries.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs text-muted-foreground mr-2">Países designados:</span>
                {step3.jurisdictionFields.wipoDesignatedCountries.slice(0, 6).map(c => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
                {step3.jurisdictionFields.wipoDesignatedCountries.length > 6 && (
                  <Badge variant="outline" className="text-xs">+{step3.jurisdictionFields.wipoDesignatedCountries.length - 6}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isCN && (step3.jurisdictionFields?.chinaTranslation || step3.jurisdictionFields?.chinaPinyin) && (
        <Card className="border-l-4 border-l-red-600">
          <CardContent className="py-3 flex flex-col gap-2">
            {step3.jurisdictionFields?.chinaTranslation && (
              <p className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-red-500" />
                Traducción china: {step3.jurisdictionFields.chinaTranslation}
              </p>
            )}
            {step3.jurisdictionFields?.chinaPinyin && (
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                Pinyin: {step3.jurisdictionFields.chinaPinyin}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
                  <Check className="h-4 w-4 text-green-500" />
                ) : check.warning ? (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
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

      {/* What happens next */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">¿Qué pasa después?</p>
              <p className="text-sm text-muted-foreground">
                El expediente se creará en fase F0 (Apertura). Podrás añadir documentos, 
                gestionar plazos y avanzar por el workflow hasta su concesión.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!allValid && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          Completa los campos obligatorios antes de crear el expediente
        </div>
      )}
    </motion.div>
  );
}
