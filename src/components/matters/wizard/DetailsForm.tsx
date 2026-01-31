// ============================================================
// IP-NEXUS - DETAILS FORM COMPONENT
// L131: Matter details form with DB-backed Nice class selector
// ============================================================

import { useState } from 'react';
import {
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Tag,
  Globe,
  Zap,
  Upload,
  Camera,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClientSelector } from './ClientSelector';
import { NiceClassSelectorDB } from './NiceClassSelectorDB';
import { CreateClientDialog } from './CreateClientDialog';
import type { NiceSelection } from './NiceClassWithProductsSelector';

export interface MatterDetailsData {
  title: string;
  client_id: string;
  reference: string;
  client_reference: string;
  mark_name: string;
  invention_title: string;
  internal_notes: string;
  is_urgent: boolean;
  is_confidential: boolean;
  nice_classes: number[];
  nice_classes_detail?: NiceSelection;
  // Jurisdiction-specific fields
  modalidad_es?: 'normal' | 'acelerada';
  reduccion_pyme_es?: boolean;
  segundo_idioma_eu?: string;
  fast_track_eu?: boolean;
  seniority_eu?: { country: string; number: string; date: string };
  basis_us?: '1a' | '1b' | '44d' | '44e' | '66a';
  first_use_date_us?: string;
  first_commerce_date_us?: string;
  disclaimer_us?: string;
  marca_base_pais_wo?: string;
  marca_base_tipo_wo?: 'solicitud' | 'registro';
  marca_base_numero_wo?: string;
  marca_base_fecha_wo?: string;
  paises_designados_wo?: string[];
  traduccion_cn?: string;
  pinyin_cn?: string;
}

interface DetailsFormProps {
  data: MatterDetailsData;
  onChange: (data: Partial<MatterDetailsData>) => void;
  matterType: string;
  jurisdiction?: string;
  previewNumber?: string;
  isGeneratingNumber?: boolean;
}

export function DetailsForm({
  data,
  onChange,
  matterType,
  jurisdiction,
  previewNumber,
  isGeneratingNumber,
}: DetailsFormProps) {
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  // Jurisdiction flags
  const isES = jurisdiction === 'ES';
  const isEU = jurisdiction === 'EU';
  const isUS = jurisdiction === 'US';
  const isWO = jurisdiction === 'WO';
  const isCN = jurisdiction === 'CN';

  const handleClientCreated = (clientId: string) => {
    onChange({ client_id: clientId });
    setShowCreateClient(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles del expediente</h2>
        <p className="text-muted-foreground">Completa la información básica</p>
      </div>

      {/* Number Preview */}
      {previewNumber && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Número de expediente</p>
            {isGeneratingNumber ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generando...</span>
              </div>
            ) : (
              <p className="font-mono text-lg font-semibold text-primary truncate">
                {previewNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Client Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Cliente
        </Label>
        <ClientSelector
          value={data.client_id}
          onChange={(clientId) => onChange({ client_id: clientId })}
          onCreateNew={() => setShowCreateClient(true)}
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Título del expediente *
        </Label>
        <Input
          placeholder="Ej: Registro de marca ACME en España"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-12"
        />
        {data.title && data.title.length < 3 && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            El título debe tener al menos 3 caracteres
          </p>
        )}
      </div>

      {/* Type-specific fields */}
      {isTrademarkType && (
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Denominación de la marca
            </Label>
            <Input
              placeholder="Ej: ACME"
              value={data.mark_name}
              onChange={(e) => onChange({ mark_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Clases Nice y Productos</Label>
            <NiceClassSelectorDB
              value={data.nice_classes_detail || {}}
              onChange={(selection) => {
                const classNumbers = Object.keys(selection).map(Number).sort((a, b) => a - b);
                onChange({
                  nice_classes: classNumbers,
                  nice_classes_detail: selection,
                });
              }}
            />
          </div>
        </>
      )}

      {isPatentType && (
        <div className="space-y-2">
          <Label>Título de la invención</Label>
          <Input
            placeholder="Título técnico de la invención"
            value={data.invention_title}
            onChange={(e) => onChange({ invention_title: e.target.value })}
          />
        </div>
      )}

      {/* References */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Referencia interna</Label>
          <Input
            placeholder="Se genera automáticamente"
            value={data.reference}
            onChange={(e) => onChange({ reference: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Déjalo vacío para generar automáticamente
          </p>
        </div>
        <div className="space-y-2">
          <Label>Referencia del cliente</Label>
          <Input
            placeholder="Referencia que usa el cliente"
            value={data.client_reference}
            onChange={(e) => onChange({ client_reference: e.target.value })}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notas internas</Label>
        <Textarea
          placeholder="Notas adicionales..."
          value={data.internal_notes}
          onChange={(e) => onChange({ internal_notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Options */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Urgente</p>
            <p className="text-sm text-muted-foreground">Marcar como expediente prioritario</p>
          </div>
          <Switch
            checked={data.is_urgent}
            onCheckedChange={(checked) => onChange({ is_urgent: checked })}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <p className="font-medium">Confidencial</p>
            <p className="text-sm text-muted-foreground">Restringir acceso a usuarios autorizados</p>
          </div>
          <Switch
            checked={data.is_confidential}
            onCheckedChange={(checked) => onChange({ is_confidential: checked })}
          />
        </div>
      </div>

      {/* ============================================ */}
      {/* CAMPOS ESPECÍFICOS POR JURISDICCIÓN         */}
      {/* ============================================ */}

      {/* ESPAÑA - OEPM */}
      {isES && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🇪🇸</span>
              Campos específicos España (OEPM)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Modalidad de solicitud</Label>
              <RadioGroup
                value={data.modalidad_es || 'normal'}
                onValueChange={(value) => onChange({ modalidad_es: value as 'normal' | 'acelerada' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="modalidad-normal" />
                  <Label htmlFor="modalidad-normal" className="font-normal cursor-pointer">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="acelerada" id="modalidad-acelerada" />
                  <Label htmlFor="modalidad-acelerada" className="font-normal cursor-pointer">
                    Acelerada <span className="text-xs text-muted-foreground">(+tasas)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <Checkbox
                id="pyme-es"
                checked={data.reduccion_pyme_es || false}
                onCheckedChange={(checked) => onChange({ reduccion_pyme_es: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="pyme-es" className="font-medium cursor-pointer">
                  Solicitar reducción PYME (50% tasas)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Requiere cumplir requisitos de pequeña/mediana empresa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UNIÓN EUROPEA - EUIPO */}
      {isEU && (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🇪🇺</span>
              Campos específicos EUIPO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Segundo idioma de procedimiento <span className="text-destructive">*</span>
              </Label>
              <Select
                value={data.segundo_idioma_eu || ''}
                onValueChange={(value) => onChange({ segundo_idioma_eu: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Checkbox
                id="fasttrack-eu"
                checked={data.fast_track_eu || false}
                onCheckedChange={(checked) => onChange({ fast_track_eu: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="fasttrack-eu" className="font-medium cursor-pointer flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Fast Track
                </Label>
                <p className="text-xs text-muted-foreground">
                  Examen acelerado (~2 semanas). Requiere usar solo términos pre-aprobados de TMclass.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ESTADOS UNIDOS - USPTO */}
      {isUS && (
        <Card className="border-l-4 border-l-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🇺🇸</span>
              Campos específicos USPTO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Base de la solicitud <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={data.basis_us || ''}
                onValueChange={(value) => onChange({ basis_us: value as MatterDetailsData['basis_us'] })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value="1a" id="basis-1a" />
                  <Label htmlFor="basis-1a" className="font-normal cursor-pointer flex-1">
                    <span className="font-medium">§1(a)</span> - Uso en comercio
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value="1b" id="basis-1b" />
                  <Label htmlFor="basis-1b" className="font-normal cursor-pointer flex-1">
                    <span className="font-medium">§1(b)</span> - Intención de uso (ITU)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value="44d" id="basis-44d" />
                  <Label htmlFor="basis-44d" className="font-normal cursor-pointer flex-1">
                    <span className="font-medium">§44(d)</span> - Prioridad extranjera
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted">
                  <RadioGroupItem value="44e" id="basis-44e" />
                  <Label htmlFor="basis-44e" className="font-normal cursor-pointer flex-1">
                    <span className="font-medium">§44(e)</span> - Registro extranjero
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {data.basis_us === '1a' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Specimen de uso <span className="text-destructive">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Foto del producto/servicio con la marca visible
                    </p>
                    <Input type="file" accept="image/*" className="max-w-xs mx-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Fecha de primer uso</Label>
                    <Input
                      type="date"
                      value={data.first_use_date_us || ''}
                      onChange={(e) => onChange({ first_use_date_us: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Fecha primer uso en comercio</Label>
                    <Input
                      type="date"
                      value={data.first_commerce_date_us || ''}
                      onChange={(e) => onChange({ first_commerce_date_us: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium">Disclaimer (opcional)</Label>
              <Input
                placeholder='Ej: No claim to "INTELLIGENCE" apart from the mark as shown'
                value={data.disclaimer_us || ''}
                onChange={(e) => onChange({ disclaimer_us: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Elementos descriptivos que no se reivindican exclusivamente
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* INTERNACIONAL - WIPO/MADRID */}
      {isWO && (
        <Card className="border-l-4 border-l-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🌍</span>
              Campos específicos WIPO (Protocolo de Madrid)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg space-y-4">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Marca base (obligatoria)
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">País de origen</Label>
                  <Select
                    value={data.marca_base_pais_wo || ''}
                    onValueChange={(value) => onChange({ marca_base_pais_wo: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ES">🇪🇸 España</SelectItem>
                      <SelectItem value="DE">🇩🇪 Alemania</SelectItem>
                      <SelectItem value="FR">🇫🇷 Francia</SelectItem>
                      <SelectItem value="IT">🇮🇹 Italia</SelectItem>
                      <SelectItem value="EU">🇪🇺 EUIPO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tipo</Label>
                  <RadioGroup
                    value={data.marca_base_tipo_wo || 'registro'}
                    onValueChange={(value) => onChange({ marca_base_tipo_wo: value as 'solicitud' | 'registro' })}
                    className="flex gap-3 h-9 items-center"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="solicitud" id="mb-sol" />
                      <Label htmlFor="mb-sol" className="text-xs font-normal cursor-pointer">Solicitud</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="registro" id="mb-reg" />
                      <Label htmlFor="mb-reg" className="text-xs font-normal cursor-pointer">Registro</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Número</Label>
                  <Input
                    className="h-9"
                    placeholder="M1234567"
                    value={data.marca_base_numero_wo || ''}
                    onChange={(e) => onChange({ marca_base_numero_wo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Fecha de la marca base</Label>
                <Input
                  type="date"
                  className="h-9 w-48"
                  value={data.marca_base_fecha_wo || ''}
                  onChange={(e) => onChange({ marca_base_fecha_wo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Países designados <span className="text-destructive">*</span>
              </Label>

              <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-muted/30">
                {!(data.paises_designados_wo?.length) ? (
                  <span className="text-sm text-muted-foreground">Ningún país seleccionado</span>
                ) : (
                  data.paises_designados_wo.map((code) => (
                    <Badge key={code} variant="secondary" className="gap-1">
                      {code === 'US' && '🇺🇸'}{code === 'CN' && '🇨🇳'}{code === 'JP' && '🇯🇵'}
                      {code === 'KR' && '🇰🇷'}{code === 'AU' && '🇦🇺'}{code === 'BR' && '🇧🇷'}
                      {code === 'MX' && '🇲🇽'}{code === 'IN' && '🇮🇳'}
                      {' '}{code}
                      <button
                        type="button"
                        className="hover:text-destructive"
                        onClick={() => {
                          const updated = (data.paises_designados_wo || []).filter((p) => p !== code);
                          onChange({ paises_designados_wo: updated });
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { code: 'US', name: 'EE.UU.', flag: '🇺🇸' },
                  { code: 'CN', name: 'China', flag: '🇨🇳' },
                  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
                  { code: 'KR', name: 'Corea S.', flag: '🇰🇷' },
                  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
                  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
                  { code: 'MX', name: 'México', flag: '🇲🇽' },
                  { code: 'IN', name: 'India', flag: '🇮🇳' },
                ].map((pais) => {
                  const isSelected = (data.paises_designados_wo || []).includes(pais.code);
                  return (
                    <label
                      key={pais.code}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
                        isSelected ? 'bg-green-100 dark:bg-green-900/30 border border-green-300' : 'hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const current = data.paises_designados_wo || [];
                          const updated = checked
                            ? [...current, pais.code]
                            : current.filter((p) => p !== pais.code);
                          onChange({ paises_designados_wo: updated });
                        }}
                      />
                      <span>{pais.flag}</span>
                      <span className="text-xs">{pais.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CHINA - CNIPA */}
      {isCN && (
        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-xl">🇨🇳</span>
              Campos específicos China (CNIPA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Traducción al chino <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="智联"
                value={data.traduccion_cn || ''}
                onChange={(e) => onChange({ traduccion_cn: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Obligatorio para marcas denominativas en China
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Transliteración (pinyin)</Label>
              <Input
                placeholder="Zhì Lián"
                value={data.pinyin_cn || ''}
                onChange={(e) => onChange({ pinyin_cn: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateClient}
        onOpenChange={setShowCreateClient}
        onClientCreated={handleClientCreated}
        initialName={clientSearch}
      />
    </motion.div>
  );
}
