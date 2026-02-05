// ============================================================
// IP-NEXUS - Dynamic Denomination Field Component
// L135: Campos adaptativos según tipo de marca
// ============================================================

import { motion } from 'framer-motion';
import { 
  Type, Image, Layers, Box, Palette, Volume2, 
  Wind, Play, MapPin, Upload, Info, AlertTriangle,
  FileAudio, FileVideo, Music
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TrademarkType } from './TrademarkTypeSelector';

interface DynamicDenominationFieldProps {
  trademarkType?: TrademarkType;
  markName: string;
  onMarkNameChange: (value: string) => void;
  graphicDescription?: string;
  onGraphicDescriptionChange?: (value: string) => void;
}

// Configuration for each trademark type
const TRADEMARK_FIELD_CONFIG: Record<TrademarkType, {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  helperText: string;
  isTextArea?: boolean;
  rows?: number;
  hasImage?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasMultipleImages?: boolean;
  hasColorPicker?: boolean;
  hasSecondaryField?: boolean;
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
  additionalFields?: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea';
  }>;
  warningNote?: string;
}> = {
  nominative: {
    icon: Type,
    label: 'Denominación de la marca',
    placeholder: 'Ej: ACME, NIKE, COCA-COLA',
    helperText: 'Introduce el texto exacto que deseas registrar como marca',
  },
  figurative: {
    icon: Image,
    label: 'Descripción del elemento gráfico',
    placeholder: 'Ej: Logo con forma de swoosh curvo en dirección ascendente',
    helperText: 'Describe el diseño gráfico. Podrás adjuntar la imagen en el expediente.',
    isTextArea: true,
    rows: 3,
    hasImage: true,
  },
  mixed: {
    icon: Layers,
    label: 'Denominación textual',
    placeholder: 'Ej: ACME',
    helperText: 'Incluye tanto el texto como la descripción visual de la marca',
    hasSecondaryField: true,
    secondaryLabel: 'Descripción del elemento gráfico',
    secondaryPlaceholder: 'Ej: Logo circular con texto ACME en fuente serif',
    hasImage: true,
  },
  '3d': {
    icon: Box,
    label: 'Descripción de la forma tridimensional',
    placeholder: 'Ej: Botella de vidrio con forma contorneada, cintura estrecha y base ancha',
    helperText: 'Describe la forma 3D con detalle. Se requerirán vistas desde múltiples ángulos.',
    isTextArea: true,
    rows: 4,
    hasMultipleImages: true,
  },
  color: {
    icon: Palette,
    label: 'Identificación del color',
    placeholder: 'Ej: Pantone 485 C',
    helperText: 'Indica el código Pantone y/o RAL del color. Al menos uno es obligatorio.',
    hasColorPicker: true,
    additionalFields: [
      { key: 'ral', label: 'Código RAL', placeholder: 'Ej: RAL 3020', type: 'text' },
    ],
  },
  sound: {
    icon: Volume2,
    label: 'Descripción del sonido',
    placeholder: 'Ej: Melodía de 4 notas ascendentes en tonalidad mayor, 3 segundos de duración',
    helperText: 'Adjunta el archivo de audio y opcionalmente la partitura musical',
    isTextArea: true,
    rows: 3,
    hasAudio: true,
  },
  olfactory: {
    icon: Wind,
    label: 'Descripción del olor',
    placeholder: 'Ej: Aroma floral con notas predominantes de jazmín y rosa, con base amaderada',
    helperText: 'Describe el olor con el mayor detalle posible. Incluye fórmula química si la conoces.',
    isTextArea: true,
    rows: 4,
    warningNote: 'Las marcas olfativas tienen requisitos de representación muy específicos. Consulte con su agente de PI antes de proceder.',
    additionalFields: [
      { key: 'formula', label: 'Fórmula química (opcional)', placeholder: 'Ej: Composición principal: linalool, geraniol...', type: 'text' },
    ],
  },
  motion: {
    icon: Play,
    label: 'Descripción de la secuencia de movimiento',
    placeholder: 'Ej: Logo que rota 360° en sentido horario durante 2 segundos, con efecto de destello al completar',
    helperText: 'Adjunta un video o GIF que muestre la secuencia completa del movimiento',
    isTextArea: true,
    rows: 4,
    hasVideo: true,
  },
  position: {
    icon: MapPin,
    label: 'Descripción de la posición en el producto',
    placeholder: 'Ej: Suela de color rojo aplicada en la parte inferior del zapato de tacón alto',
    helperText: 'Describe exactamente dónde se ubica el signo en el producto. La imagen debe mostrar claramente la posición.',
    isTextArea: true,
    rows: 4,
    hasImage: true,
  },
};

// Upload zone component (visual placeholder)
function UploadZone({ 
  type, 
  label, 
  formats,
  multiple = false,
}: { 
  type: 'image' | 'audio' | 'video'; 
  label: string; 
  formats: string;
  multiple?: boolean;
}) {
  const Icon = type === 'image' ? Upload : type === 'audio' ? FileAudio : FileVideo;
  
  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer",
        "border-cyan-300 bg-cyan-50/30 hover:border-cyan-400 hover:bg-cyan-50/50",
        type === 'audio' || type === 'video' ? 'h-24' : 'h-32',
      )}
    >
      <Icon className="h-8 w-8 text-cyan-500" />
      <p className="text-sm text-slate-600 text-center px-4">{label}</p>
      <p className="text-xs text-slate-400">Formatos: {formats}</p>
      {/* Overlay message */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
        <p className="text-xs text-slate-500 text-center px-4">
          Los archivos se podrán adjuntar una vez creado el expediente
        </p>
      </div>
    </div>
  );
}

export function DynamicDenominationField({
  trademarkType,
  markName,
  onMarkNameChange,
  graphicDescription = '',
  onGraphicDescriptionChange,
}: DynamicDenominationFieldProps) {
  // Default to nominative if no type selected
  const config = trademarkType ? TRADEMARK_FIELD_CONFIG[trademarkType] : TRADEMARK_FIELD_CONFIG.nominative;
  const Icon = config.icon;

  return (
    <motion.div
      key={trademarkType || 'default'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-200 p-5 space-y-4"
      style={{ background: '#f1f4f9' }}
    >
      {/* Header with trademark type badge */}
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ 
            background: 'linear-gradient(135deg, #00b4d8 0%, #00d4aa 100%)',
            boxShadow: '0 4px 12px rgba(0, 180, 216, 0.3)',
          }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{config.label}</h4>
          {trademarkType && (
            <span 
              className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
              style={{ 
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)', 
                color: '#7c3aed',
                border: '1px solid rgba(147, 51, 234, 0.2)' 
              }}
            >
              Marca {TRADEMARK_FIELD_CONFIG[trademarkType]?.icon === Type ? 'Nominativa' : 
                     trademarkType === 'figurative' ? 'Figurativa' :
                     trademarkType === 'mixed' ? 'Mixta' :
                     trademarkType === '3d' ? 'Tridimensional' :
                     trademarkType === 'color' ? 'De color' :
                     trademarkType === 'sound' ? 'Sonora' :
                     trademarkType === 'olfactory' ? 'Olfativa' :
                     trademarkType === 'motion' ? 'De movimiento' :
                     trademarkType === 'position' ? 'De posición' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main Field */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700">{config.label}</Label>
        {config.isTextArea ? (
          <Textarea
            placeholder={config.placeholder}
            value={markName}
            onChange={(e) => onMarkNameChange(e.target.value)}
            rows={config.rows || 3}
            className="bg-white border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
          />
        ) : (
          <Input
            placeholder={config.placeholder}
            value={markName}
            onChange={(e) => onMarkNameChange(e.target.value)}
            className="h-12 bg-white border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
          />
        )}
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="h-3 w-3" />
          {config.helperText}
        </p>
      </div>

      {/* Secondary Field (for mixed type) */}
      {config.hasSecondaryField && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">{config.secondaryLabel}</Label>
          <Textarea
            placeholder={config.secondaryPlaceholder}
            value={graphicDescription}
            onChange={(e) => onGraphicDescriptionChange?.(e.target.value)}
            rows={3}
            className="bg-white border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
          />
        </div>
      )}

      {/* Additional Fields (for color, olfactory) */}
      {config.additionalFields?.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea
              placeholder={field.placeholder}
              className="bg-white border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
              rows={2}
            />
          ) : (
            <Input
              placeholder={field.placeholder}
              className="h-10 bg-white border-slate-200 focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400"
            />
          )}
        </div>
      ))}

      {/* Color Picker (visual only for now) */}
      {config.hasColorPicker && (
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-slate-200"
            style={{ background: '#ef4444' }}
          />
          <Input
            placeholder="#FF0000"
            className="h-10 w-32 bg-white border-slate-200 font-mono"
          />
        </div>
      )}

      {/* Image Upload Zone */}
      {config.hasImage && (
        <UploadZone 
          type="image" 
          label={config.hasMultipleImages 
            ? "Sube vistas de la forma 3D (frontal, lateral, superior, etc.)" 
            : "Arrastra la imagen de la marca o haz clic para seleccionar"
          }
          formats="PNG, JPG, SVG"
          multiple={config.hasMultipleImages}
        />
      )}

      {/* Multiple Images Zone */}
      {config.hasMultipleImages && !config.hasImage && (
        <UploadZone 
          type="image" 
          label="Sube vistas de la forma 3D (hasta 6 imágenes)"
          formats="PNG, JPG, SVG"
          multiple
        />
      )}

      {/* Audio Upload Zone */}
      {config.hasAudio && (
        <>
          <UploadZone 
            type="audio" 
            label="Sube el archivo de audio de la marca"
            formats="MP3, WAV, OGG"
          />
          <UploadZone 
            type="image" 
            label="Partitura musical (opcional)"
            formats="PDF, PNG, JPG"
          />
        </>
      )}

      {/* Video Upload Zone */}
      {config.hasVideo && (
        <UploadZone 
          type="video" 
          label="Sube el video de la secuencia de movimiento"
          formats="MP4, MOV, GIF"
        />
      )}

      {/* Warning Note */}
      {config.warningNote && (
        <div 
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
          >
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm text-amber-800 leading-relaxed">
            {config.warningNote}
          </p>
        </div>
      )}
    </motion.div>
  );
}
