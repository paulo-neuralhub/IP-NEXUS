// ============================================================
// IP-NEXUS - STEP 3: RIGHT DATA (V2)
// L132: Adaptive fields based on type and jurisdiction
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Image, Upload, Tag, AlertCircle, Info, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { NiceClassSelectorDB } from '../NiceClassSelectorDB';
import type { MatterWizardState } from './types';

interface Step3RightDataProps {
  data: MatterWizardState['step3'];
  onChange: (data: Partial<MatterWizardState['step3']>) => void;
  matterType: string;
  jurisdiction: string;
}

// Mark type options
const MARK_TYPES = [
  { code: 'word', label: 'Denomin.', icon: 'A', description: 'Solo texto' },
  { code: 'figurative', label: 'Figurat.', icon: '🖼️', description: 'Solo imagen' },
  { code: 'mixed', label: 'Mixta', icon: 'A🖼️', description: 'Texto + imagen' },
  { code: '3d', label: '3D', icon: '🧊', description: 'Forma' },
  { code: 'sound', label: 'Sonora', icon: '🔊', description: 'Sonido' },
];

export function Step3RightData({ data, onChange, matterType, jurisdiction }: Step3RightDataProps) {
  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';
  
  // Jurisdiction flags
  const isUSPTO = jurisdiction === 'US';
  const isEUIPO = jurisdiction === 'EU';
  const isWIPO = jurisdiction === 'WO';
  const isCN = jurisdiction === 'CN';
  const isES = jurisdiction === 'ES';

  const updateJurisdictionField = (key: string, value: any) => {
    onChange({
      jurisdictionFields: {
        ...data.jurisdictionFields,
        [key]: value,
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Datos del Derecho</h2>
        <p className="text-muted-foreground">
          {isTrademarkType ? 'Información de la marca' : isPatentType ? 'Información de la patente' : 'Información del derecho'}
        </p>
      </div>

      {/* TRADEMARK FIELDS */}
      {isTrademarkType && (
        <>
          {/* Mark denomination and representation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Denominación y Representación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mark type */}
              <div className="space-y-2">
                <Label>Tipo de marca</Label>
                <div className="grid grid-cols-5 gap-2">
                  {MARK_TYPES.map((type) => {
                    const isSelected = data.markType === type.code;
                    return (
                      <button
                        key={type.code}
                        type="button"
                        onClick={() => onChange({ markType: type.code as any })}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/30"
                        )}
                      >
                        <span className="text-xl">{type.icon}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mark name */}
              <div className="space-y-2">
                <Label htmlFor="mark-name">Denominación *</Label>
                <Input
                  id="mark-name"
                  placeholder="Nombre de la marca"
                  value={data.markName || ''}
                  onChange={(e) => onChange({ markName: e.target.value, title: e.target.value })}
                  className="text-lg font-medium"
                />
              </div>

              {/* Logo upload (for figurative/mixed) */}
              {(data.markType === 'figurative' || data.markType === 'mixed') && (
                <div className="space-y-2">
                  <Label>Logotipo</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra imagen o haz clic
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, TIFF · Máx 2MB
                    </p>
                  </div>
                </div>
              )}

              {/* Optional fields */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="claim-colors"
                    checked={!!data.claimedColors}
                    onCheckedChange={(checked) => 
                      onChange({ claimedColors: checked ? '' : undefined })
                    }
                  />
                  <Label htmlFor="claim-colors" className="cursor-pointer">
                    Reivindicar colores
                  </Label>
                </div>
                {data.claimedColors !== undefined && (
                  <Input
                    placeholder="Describe los colores reivindicados"
                    value={data.claimedColors}
                    onChange={(e) => onChange({ claimedColors: e.target.value })}
                  />
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="add-description"
                    checked={!!data.markDescription}
                    onCheckedChange={(checked) => 
                      onChange({ markDescription: checked ? '' : undefined })
                    }
                  />
                  <Label htmlFor="add-description" className="cursor-pointer">
                    Añadir descripción
                  </Label>
                </div>
                {data.markDescription !== undefined && (
                  <Textarea
                    placeholder="Descripción de la marca"
                    value={data.markDescription}
                    onChange={(e) => onChange({ markDescription: e.target.value })}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Nice Classification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Clasificación Nice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NiceClassSelectorDB
                value={data.niceClassesDetail || {}}
                onChange={(selection) => {
                  const classNumbers = Object.keys(selection).map(Number).sort((a, b) => a - b);
                  onChange({
                    niceClasses: classNumbers,
                    niceClassesDetail: selection,
                  });
                }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* PATENT FIELDS */}
      {isPatentType && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invention-title">Título de la invención *</Label>
                <Input
                  id="invention-title"
                  placeholder="Título técnico de la invención"
                  value={data.inventionTitle || ''}
                  onChange={(e) => onChange({ inventionTitle: e.target.value, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Resumen (máx 150 palabras)</Label>
                <Textarea
                  id="abstract"
                  placeholder="Breve descripción de la invención..."
                  value={data.abstract || ''}
                  onChange={(e) => onChange({ abstract: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {(data.abstract?.split(/\s+/).filter(Boolean).length || 0)}/150 palabras
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Datos Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claims-count">Nº reivindicaciones *</Label>
                  <Input
                    id="claims-count"
                    type="number"
                    min="1"
                    value={data.claimsCount || ''}
                    onChange={(e) => onChange({ claimsCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drawings-count">Nº dibujos</Label>
                  <Input
                    id="drawings-count"
                    type="number"
                    min="0"
                    value={data.drawingsCount || ''}
                    onChange={(e) => onChange({ drawingsCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-sequence"
                    checked={data.hasSequenceListing}
                    onCheckedChange={(checked) => onChange({ hasSequenceListing: !!checked })}
                  />
                  <Label htmlFor="has-sequence" className="cursor-pointer">
                    Incluye listado de secuencias (biotecnología)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-code"
                    checked={data.hasSourceCode}
                    onCheckedChange={(checked) => onChange({ hasSourceCode: !!checked })}
                  />
                  <Label htmlFor="has-code" className="cursor-pointer">
                    Incluye código fuente
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-bio"
                    checked={data.hasBioDeposit}
                    onCheckedChange={(checked) => onChange({ hasBioDeposit: !!checked })}
                  />
                  <Label htmlFor="has-bio" className="cursor-pointer">
                    Depósito de material biológico
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* JURISDICTION-SPECIFIC FIELDS */}
      
      {/* USPTO Fields */}
      {isTrademarkType && isUSPTO && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Campos específicos USPTO
              <Badge variant="secondary">Solo Estados Unidos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Base de la solicitud *</Label>
              <RadioGroup
                value={data.jurisdictionFields?.usptoBasis || ''}
                onValueChange={(val) => updateJurisdictionField('usptoBasis', val)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1a" id="basis-1a" />
                  <Label htmlFor="basis-1a" className="cursor-pointer">
                    §1(a) - Uso en comercio (ya en uso)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1b" id="basis-1b" />
                  <Label htmlFor="basis-1b" className="cursor-pointer">
                    §1(b) - Intención de uso (Intent to Use)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="44d" id="basis-44d" />
                  <Label htmlFor="basis-44d" className="cursor-pointer">
                    §44(d) - Prioridad extranjera
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="44e" id="basis-44e" />
                  <Label htmlFor="basis-44e" className="cursor-pointer">
                    §44(e) - Registro extranjero
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {data.jurisdictionFields?.usptoBasis === '1a' && (
              <div className="space-y-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Specimen de uso
                    <Badge variant="destructive" className="text-xs">Requerido</Badge>
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Subir foto del producto/servicio con la marca visible
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha primer uso</Label>
                    <Input
                      type="date"
                      value={data.jurisdictionFields?.usptoFirstUseDate || ''}
                      onChange={(e) => updateJurisdictionField('usptoFirstUseDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha primer uso en comercio</Label>
                    <Input
                      type="date"
                      value={data.jurisdictionFields?.usptoFirstCommerceDate || ''}
                      onChange={(e) => updateJurisdictionField('usptoFirstCommerceDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Disclaimer</Label>
              <Input
                placeholder='No claim to "INTELLIGENCE" apart from the mark as shown'
                value={data.jurisdictionFields?.usptoDisclaimer || ''}
                onChange={(e) => updateJurisdictionField('usptoDisclaimer', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* EUIPO Fields */}
      {isTrademarkType && isEUIPO && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Campos específicos EUIPO
              <Badge variant="secondary">Solo Unión Europea</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Segundo idioma de procedimiento *</Label>
              <Select
                value={data.jurisdictionFields?.euipoSecondLanguage || ''}
                onValueChange={(val) => updateJurisdictionField('euipoSecondLanguage', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Checkbox
                id="fast-track"
                checked={data.jurisdictionFields?.euipoFastTrack}
                onCheckedChange={(checked) => updateJurisdictionField('euipoFastTrack', !!checked)}
              />
              <div>
                <Label htmlFor="fast-track" className="cursor-pointer font-medium">
                  Fast Track
                </Label>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>✓ Usar solo términos pre-aprobados de TMclass</li>
                  <li>✓ Pago inmediato</li>
                  <li>💡 Examen acelerado (~2 semanas)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spain/OEPM Fields */}
      {isES && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Campos específicos OEPM
              <Badge variant="secondary">Solo España</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isTrademarkType && (
              <div className="space-y-2">
                <Label>Modalidad</Label>
                <RadioGroup
                  value={data.jurisdictionFields?.oepmModality || 'normal'}
                  onValueChange={(val) => updateJurisdictionField('oepmModality', val)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="modality-normal" />
                    <Label htmlFor="modality-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="accelerated" id="modality-accelerated" />
                    <Label htmlFor="modality-accelerated">Acelerada (+tasas)</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Checkbox
                id="pyme-reduction"
                checked={data.jurisdictionFields?.oepmPymeReduction}
                onCheckedChange={(checked) => updateJurisdictionField('oepmPymeReduction', !!checked)}
              />
              <div>
                <Label htmlFor="pyme-reduction" className="cursor-pointer">
                  Solicitar reducción PYME (50% tasas)
                </Label>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Requiere cumplir requisitos de pequeña empresa
                </p>
              </div>
            </div>

            {isPatentType && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="iet-requested"
                  checked={data.jurisdictionFields?.oepmIetRequested}
                  onCheckedChange={(checked) => updateJurisdictionField('oepmIetRequested', !!checked)}
                />
                <Label htmlFor="iet-requested" className="cursor-pointer">
                  Solicitar Informe sobre el Estado de la Técnica (IET)
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* China Fields */}
      {isCN && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Campos específicos China
              <Badge variant="secondary">Solo China</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="china-translation">Traducción al chino (obligatorio) *</Label>
              <Input
                id="china-translation"
                placeholder="智联"
                value={data.jurisdictionFields?.chinaTranslation || ''}
                onChange={(e) => updateJurisdictionField('chinaTranslation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="china-pinyin">Transliteración (pinyin)</Label>
              <Input
                id="china-pinyin"
                placeholder="Zhì Lián"
                value={data.jurisdictionFields?.chinaPinyin || ''}
                onChange={(e) => updateJurisdictionField('chinaPinyin', e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              China divide las clases Nice en subclases más específicas
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generic title for other types */}
      {!isTrademarkType && !isPatentType && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Información del Derecho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título del expediente"
                value={data.title || ''}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
