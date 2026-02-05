// ============================================================
// IP-NEXUS - Matter Rights Info Card (SILK Design)
// Complete information card for IP rights with trademark type
// ============================================================

import { Tag, Globe, FileText, Type, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MatterV2 } from '@/hooks/use-matters-v2';

// Trademark type labels and icons
const TRADEMARK_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  nominative: { label: 'Nominativa', icon: '📝' },
  figurative: { label: 'Figurativa', icon: '🖼️' },
  mixed: { label: 'Mixta', icon: '🎨' },
  '3d': { label: 'Tridimensional', icon: '📦' },
  color: { label: 'De color', icon: '🎨' },
  sound: { label: 'Sonora', icon: '🔊' },
  olfactory: { label: 'Olfativa', icon: '👃' },
  motion: { label: 'De movimiento', icon: '🎬' },
  position: { label: 'De posición', icon: '📍' },
};

// Matter type labels
const MATTER_TYPE_LABELS: Record<string, string> = {
  TM_NAT: 'Marca Nacional',
  TM_EU: 'Marca UE',
  TM_INT: 'Marca Internacional',
  PT_NAT: 'Patente Nacional',
  PT_EU: 'Patente Europea',
  PT_PCT: 'Patente PCT',
  UM: 'Modelo Utilidad',
  DS_NAT: 'Diseño Nacional',
  DS_EU: 'Diseño Comunitario',
  DOM: 'Dominio',
  NC: 'Nombre Comercial',
  OPO: 'Oposición',
  VIG: 'Vigilancia',
  LIT: 'Litigio',
  trademark: 'Marca',
  patent: 'Patente',
  design: 'Diseño',
};

// Jurisdiction info
const JURISDICTION_INFO: Record<string, { flag: string; name: string; office: string }> = {
  ES: { flag: '🇪🇸', name: 'España', office: 'OEPM' },
  EU: { flag: '🇪🇺', name: 'Unión Europea', office: 'EUIPO' },
  EUIPO: { flag: '🇪🇺', name: 'Unión Europea', office: 'EUIPO' },
  US: { flag: '🇺🇸', name: 'Estados Unidos', office: 'USPTO' },
  WIPO: { flag: '🌐', name: 'Internacional', office: 'OMPI/WIPO' },
  WO: { flag: '🌐', name: 'Internacional', office: 'OMPI/WIPO' },
  GB: { flag: '🇬🇧', name: 'Reino Unido', office: 'UKIPO' },
  DE: { flag: '🇩🇪', name: 'Alemania', office: 'DPMA' },
  FR: { flag: '🇫🇷', name: 'Francia', office: 'INPI' },
  CN: { flag: '🇨🇳', name: 'China', office: 'CNIPA' },
  JP: { flag: '🇯🇵', name: 'Japón', office: 'JPO' },
};

interface MatterRightsInfoCardProps {
  matter: MatterV2;
}

export function MatterRightsInfoCard({ matter }: MatterRightsInfoCardProps) {
  const isTrademark = matter.matter_type?.startsWith('TM') || matter.matter_type === 'trademark' || matter.matter_type === 'NC';
  const trademarkType = (matter.custom_fields as any)?.trademark_type;
  const trademarkTypeConfig = trademarkType ? TRADEMARK_TYPE_CONFIG[trademarkType] : null;
  const matterTypeLabel = MATTER_TYPE_LABELS[matter.matter_type] || matter.matter_type || 'Expediente';
  const jurisdictionInfo = JURISDICTION_INFO[matter.jurisdiction_primary || 'ES'] || { flag: '🌐', name: matter.jurisdiction_primary, office: '-' };

  return (
    <Card 
      className="border-slate-200 rounded-xl overflow-hidden"
      style={{ background: '#f1f4f9' }}
    >
      <CardHeader className="pb-3 bg-white/60">
        <CardTitle className="flex items-center gap-2 text-base">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #00b4d8 0%, #00d4aa 100%)',
              boxShadow: '0 2px 8px rgba(0, 180, 216, 0.3)',
            }}
          >
            <Tag className="h-4 w-4 text-white" />
          </div>
          Información del Derecho
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Type Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Matter Type */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Tipo de expediente</label>
            <div 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)' }}
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{matterTypeLabel}</span>
            </div>
          </div>

          {/* Trademark Type - Only for trademarks */}
          {isTrademark && trademarkTypeConfig && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Tipo de marca</label>
              <div 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(147, 51, 234, 0.04) 100%)', 
                  border: '1px solid rgba(147, 51, 234, 0.2)' 
                }}
              >
                <span className="text-base">{trademarkTypeConfig.icon}</span>
                <span className="text-sm font-medium text-purple-700">{trademarkTypeConfig.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Denomination / Mark Name */}
        {matter.mark_name && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Denominación</label>
            <p className="text-lg font-semibold text-slate-800">{matter.mark_name}</p>
          </div>
        )}

        {/* Invention Title */}
        {matter.invention_title && matter.invention_title !== matter.title && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Título de invención</label>
            <p className="text-lg font-semibold text-slate-800">{matter.invention_title}</p>
          </div>
        )}

        {/* Jurisdiction Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Jurisdicción</label>
            <div className="flex items-center gap-2">
              <span className="text-xl">{jurisdictionInfo.flag}</span>
              <span className="text-sm font-medium text-slate-700">{jurisdictionInfo.name}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Oficina</label>
            <span className="text-sm font-medium text-slate-700">{jurisdictionInfo.office}</span>
          </div>
        </div>

        {/* Nice Classes */}
        {matter.nice_classes && matter.nice_classes.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Clases Nice</label>
            <div className="flex flex-wrap gap-2">
              {matter.nice_classes.map(c => (
                <span 
                  key={c} 
                  className="inline-flex items-center justify-center px-3 py-1 rounded-lg font-mono font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.1) 0%, rgba(0, 180, 216, 0.05) 100%)',
                    border: '1px solid rgba(0, 180, 216, 0.2)',
                    color: '#0891b2',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Goods & Services */}
        {matter.goods_services && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Productos/Servicios</label>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{matter.goods_services}</p>
          </div>
        )}

        {/* Internal Notes */}
        {matter.internal_notes && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Notas internas</label>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{matter.internal_notes}</p>
          </div>
        )}

        {/* Tags */}
        {matter.tags && matter.tags.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {matter.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
