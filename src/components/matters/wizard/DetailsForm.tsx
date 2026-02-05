// ============================================================
// IP-NEXUS - DETAILS FORM COMPONENT
// L131: Matter details form with DB-backed Nice class selector
// Now integrated with DynamicJurisdictionFields from DB
// ============================================================

import { useState, useMemo } from 'react';
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
  Lock,
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
import { DynamicJurisdictionFields } from '@/components/matters/DynamicJurisdictionFields';
import { cn } from '@/lib/utils';
import type { NiceSelection } from './NiceClassWithProductsSelector';

// Map matter type codes to right types for dynamic fields
const MATTER_TYPE_TO_RIGHT_TYPE: Record<string, 'trademark' | 'patent' | 'utility_model' | 'design' | 'copyright'> = {
  TM_NAT: 'trademark',
  TM_EU: 'trademark',
  TM_INT: 'trademark',
  NC: 'trademark', // Nombre comercial
  PT_NAT: 'patent',
  PT_EU: 'patent',
  PT_PCT: 'patent',
  EP: 'patent',
  UM: 'utility_model',
  DS_NAT: 'design',
  DS_EU: 'design',
  DOM: 'trademark', // Domain as trademark-related
  OPO: 'trademark', // Opposition
  VIG: 'trademark', // Vigilancia
  LIT: 'trademark', // Litigation
};

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
  // Dynamic jurisdiction-specific fields from DB
  jurisdiction_fields?: Record<string, unknown>;
  // Legacy hardcoded fields (kept for backwards compatibility)
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
  trademarkType?: string;
}

export function DetailsForm({
  data,
  onChange,
  matterType,
  jurisdiction,
  previewNumber,
  isGeneratingNumber,
  trademarkType,
}: DetailsFormProps) {
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const isTrademarkType = matterType?.startsWith('TM') || matterType === 'NC';
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  // Map matterType to rightType for dynamic fields
  const rightType = useMemo(() => {
    return MATTER_TYPE_TO_RIGHT_TYPE[matterType] || 'trademark';
  }, [matterType]);

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

      {/* Number Preview - HERO ELEMENT WOW */}
      {previewNumber && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 mb-6"
        >
          {/* Glow orbs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-violet-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Icon premium */}
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/50">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
                <Sparkles className="h-7 w-7 text-white relative z-10" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-400 mb-1">Número de expediente</p>
              {isGeneratingNumber ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-slate-300">Generando...</span>
                </div>
              ) : (
                <p className="font-mono text-xl font-bold text-white truncate">
                  {previewNumber}
                </p>
              )}
            </div>
          </div>
        </motion.div>
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

      {/* Options - EFECTO WOW: Toggles con glow */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        {/* Urgente Toggle */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer overflow-hidden",
            data.is_urgent
              ? "border-orange-500 bg-white shadow-[0_20px_50px_-12px_rgba(249,115,22,0.35)]"
              : "border-white/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-orange-400/50 hover:shadow-lg"
          )}
          onClick={() => onChange({ is_urgent: !data.is_urgent })}
        >
          {/* Pulse glow when active */}
          {data.is_urgent && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10" />
            </div>
          )}
          
          <div className="flex items-center gap-4 relative z-10">
            {/* Icon with gradient */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
              data.is_urgent 
                ? "bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 shadow-lg shadow-orange-500/40" 
                : "bg-slate-100"
            )}>
              {data.is_urgent && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
              )}
              <Zap className={cn(
                "h-6 w-6 relative z-10",
                data.is_urgent ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-base",
                data.is_urgent && "text-orange-700"
              )}>
                ⚠️ Urgente
              </p>
              <p className="text-sm text-muted-foreground">Marcar como expediente prioritario</p>
            </div>
          </div>
          <Switch
            checked={data.is_urgent}
            onCheckedChange={(checked) => onChange({ is_urgent: checked })}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-red-500"
          />
        </motion.div>

        {/* Confidencial Toggle */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer overflow-hidden",
            data.is_confidential
              ? "border-violet-500 bg-white shadow-[0_20px_50px_-12px_rgba(139,92,246,0.35)]"
              : "border-white/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-violet-400/50 hover:shadow-lg"
          )}
          onClick={() => onChange({ is_confidential: !data.is_confidential })}
        >
          {/* Pulse glow when active */}
          {data.is_confidential && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10" />
            </div>
          )}
          
          <div className="flex items-center gap-4 relative z-10">
            {/* Icon with gradient */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative",
              data.is_confidential 
                ? "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 shadow-lg shadow-violet-500/40" 
                : "bg-slate-100"
            )}>
              {data.is_confidential && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
              )}
              <Lock className={cn(
                "h-6 w-6 relative z-10",
                data.is_confidential ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className={cn(
                "font-semibold text-base",
                data.is_confidential && "text-violet-700"
              )}>
                🔒 Confidencial
              </p>
              <p className="text-sm text-muted-foreground">Restringir acceso a usuarios autorizados</p>
            </div>
          </div>
          <Switch
            checked={data.is_confidential}
            onCheckedChange={(checked) => onChange({ is_confidential: checked })}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-violet-500 data-[state=checked]:to-purple-600"
          />
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* CAMPOS ESPECÍFICOS POR JURISDICCIÓN - NIVEL DIOS */}
      {/* Diseño integrado, no llamativo */}
      {/* ============================================ */}

      {/* ESPAÑA - OEPM */}
      {isES && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <span className="text-xl">🇪🇸</span>
            <div>
              <p className="font-semibold text-sm">España (OEPM)</p>
              <p className="text-xs text-muted-foreground">Campos específicos de jurisdicción</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
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

            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border">
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
          </div>
        </motion.div>
      )}

      {/* UNIÓN EUROPEA - EUIPO */}
      {isEU && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <span className="text-xl">🇪🇺</span>
            <div>
              <p className="font-semibold text-sm">Unión Europea (EUIPO)</p>
              <p className="text-xs text-muted-foreground">Campos específicos de jurisdicción</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
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

            <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg border">
              <Checkbox
                id="fasttrack-eu"
                checked={data.fast_track_eu || false}
                onCheckedChange={(checked) => onChange({ fast_track_eu: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="fasttrack-eu" className="font-medium cursor-pointer flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Fast Track
                </Label>
                <p className="text-xs text-muted-foreground">
                  Examen acelerado (~2 semanas). Requiere usar solo términos pre-aprobados de TMclass.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ESTADOS UNIDOS - USPTO */}
      {isUS && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <span className="text-xl">🇺🇸</span>
            <div>
              <p className="font-semibold text-sm">Estados Unidos (USPTO)</p>
              <p className="text-xs text-muted-foreground">Campos específicos de jurisdicción</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
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
              <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
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
          </div>
        </motion.div>
      )}

      {/* INTERNACIONAL - WIPO/MADRID */}
      {isWO && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <span className="text-xl">🌍</span>
            <div>
              <p className="font-semibold text-sm">WIPO (Protocolo de Madrid)</p>
              <p className="text-xs text-muted-foreground">Campos específicos de jurisdicción</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border space-y-4">
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
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer text-sm transition-all",
                        isSelected 
                          ? "bg-primary/10 border border-primary/30" 
                          : "hover:bg-muted border border-transparent"
                      )}
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
          </div>
        </motion.div>
      )}

      {/* CHINA - CNIPA */}
      {isCN && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b">
            <span className="text-xl">🇨🇳</span>
            <div>
              <p className="font-semibold text-sm">China (CNIPA)</p>
              <p className="text-xs text-muted-foreground">Campos específicos de jurisdicción</p>
            </div>
          </div>
          <div className="p-4 space-y-4">
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
          </div>
        </motion.div>
      )}

      {/* ============================================ */}
      {/* CAMPOS DINÁMICOS DE BASE DE DATOS           */}
      {/* ============================================ */}
      
      {/* Dynamic fields from jurisdiction_field_configs table */}
      {jurisdiction && (
        <DynamicJurisdictionFields
          jurisdictionCode={jurisdiction}
          rightType={rightType}
          values={data.jurisdiction_fields || {}}
          onChange={(key, value) => {
            onChange({
              jurisdiction_fields: {
                ...data.jurisdiction_fields,
                [key]: value,
              },
            });
          }}
          language="es"
          className="mt-6"
        />
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
