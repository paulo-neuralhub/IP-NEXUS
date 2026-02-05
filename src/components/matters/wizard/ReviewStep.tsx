// ============================================================
// IP-NEXUS - REVIEW STEP COMPONENT
// L127: Final review before creating matter
// ============================================================

import { Eye, Building2, Calendar, Sparkles, Globe, Tag, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getJurisdictionInfo } from './JurisdictionSelector';
import type { MatterType } from '@/hooks/use-matters-v2';

// Type icons
const TYPE_ICONS: Record<string, string> = {
  TM: '®️',
  TM_NAT: '®️',
  TM_EU: '®️',
  TM_INT: '®️',
  PT: '⚙️',
  PT_NAT: '⚙️',
  PT_EU: '⚙️',
  PT_PCT: '⚙️',
  UM: '🔧',
  DS: '✏️',
  DS_NAT: '✏️',
  DS_EU: '✏️',
  NC: '📜',
  DOM: '🌐',
  OPO: '⚖️',
  VIG: '👁️',
  LIT: '🏛️',
};

// Trademark type labels
const TRADEMARK_TYPE_LABELS: Record<string, string> = {
  nominative: 'Nominativa',
  figurative: 'Figurativa',
  mixed: 'Mixta',
  '3d': 'Tridimensional',
  color: 'De color',
  sound: 'Sonora',
  olfactory: 'Olfativa',
  motion: 'De movimiento',
  position: 'De posición',
};

interface ReviewStepProps {
  formData: {
    title: string;
    client_id: string;
    client_name?: string;
    reference: string;
    client_reference: string;
    mark_name: string;
    invention_title: string;
    internal_notes: string;
    is_urgent: boolean;
    is_confidential: boolean;
    nice_classes?: number[];
  };
  matterType: string;
  matterTypeInfo?: MatterType;
  jurisdictions: string[];
  previewNumber?: string;
  trademarkType?: string;
}

export function ReviewStep({
  formData,
  matterType,
  matterTypeInfo,
  jurisdictions,
  previewNumber,
  trademarkType,
}: ReviewStepProps) {
  const typeIcon = TYPE_ICONS[matterType] || '📁';
  const isTrademark = matterType?.startsWith('TM') || matterType === 'NC';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Revisa tu expediente</h2>
        <p className="text-muted-foreground">Verifica que toda la información es correcta</p>
      </div>

      {/* Preview Card */}
      <Card className="bg-muted/50 mb-6">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-card shadow-sm flex items-center justify-center text-3xl">
              {typeIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge>{matterTypeInfo?.name_es || matterType}</Badge>
                {/* Trademark Type Badge */}
                {isTrademark && trademarkType && TRADEMARK_TYPE_LABELS[trademarkType] && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200"
                  >
                    {TRADEMARK_TYPE_LABELS[trademarkType]}
                  </Badge>
                )}
                {formData.is_urgent && (
                  <Badge variant="destructive">Urgente</Badge>
                )}
                {formData.is_confidential && (
                  <Badge variant="secondary">Confidencial</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold truncate">
                {formData.title || 'Sin título'}
              </h3>
              {previewNumber && (
                <p className="text-sm text-muted-foreground font-mono">
                  {previewNumber}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Client */}
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Cliente
              </p>
              <p className="font-medium">
                {formData.client_name || 'Sin cliente asignado'}
              </p>
            </div>

            {/* Jurisdictions */}
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Jurisdicción
              </p>
              <div className="flex flex-wrap gap-1">
                {jurisdictions.map((code) => {
                  const j = getJurisdictionInfo(code);
                  return (
                    <Badge key={code} variant="outline" className="text-xs">
                      {j?.flag} {j?.name || code}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Mark Name (if trademark) */}
            {formData.mark_name && (
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Marca
                </p>
                <p className="font-medium">{formData.mark_name}</p>
              </div>
            )}

            {/* Invention Title (if patent) */}
            {formData.invention_title && (
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Invención
                </p>
                <p className="font-medium">{formData.invention_title}</p>
              </div>
            )}

            {/* Nice Classes (if trademark) */}
            {formData.nice_classes && formData.nice_classes.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-muted-foreground mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Clases Nice
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.nice_classes.map((num) => (
                    <Badge key={num} variant="secondary" className="font-mono">
                      {num}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de creación
              </p>
              <p className="font-medium">
                {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>

            {/* Initial Phase */}
            <div>
              <p className="text-muted-foreground mb-1">Fase inicial</p>
              <Badge variant="secondary">F0 · Apertura</Badge>
            </div>
          </div>

          {/* Notes */}
          {formData.internal_notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Notas internas</p>
                <p className="text-sm">{formData.internal_notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-primary/5 rounded-lg p-4 flex items-start gap-3 border border-primary/20">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">
            ¿Qué pasa después?
          </p>
          <p className="text-muted-foreground">
            El expediente se creará en fase F0 (Apertura). Podrás añadir documentos, 
            clases Nice, plazos y avanzar por el workflow.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
