// ============================================================
// TEMPLATE PREVIEW MODAL — Two-column: 60% doc preview / 40% side panel
// Uses TemplateThumbnailSVG at large scale + style switcher
// ============================================================

import * as React from 'react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  X, Download, Edit, ChevronDown, FileText, FileSpreadsheet,
  Building2, User, Calendar, Hash, Mail, Phone, Globe, MapPin, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrganization } from '@/contexts/organization-context';
import { TemplateThumbnailSVG, STYLE_COLORS, type StyleKey } from '@/components/templates/TemplateThumbnailSVG';
import type { DocumentType } from '@/lib/document-templates/designTokens';
import { CATEGORY_LABELS } from '@/lib/document-templates/designTokens';

// ── Props ────────────────────────────────────────────────────
interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  activeStyle: StyleKey;
  onStyleChange: (style: StyleKey) => void;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

// ── Style options ────────────────────────────────────────────
const STYLE_OPTIONS: { id: StyleKey; name: string; color: string }[] = [
  { id: 'clasico', name: 'Clásico', color: '#1a1a1a' },
  { id: 'elegante', name: 'Elegante', color: '#1E293B' },
  { id: 'moderno', name: 'Moderno', color: '#2563EB' },
  { id: 'sofisticado', name: 'Sofisticado', color: '#6366F1' },
];

// ── Variables placeholder ────────────────────────────────────
const PLACEHOLDER_VARIABLES = [
  { key: 'nombre_cliente', label: 'Nombre del cliente', icon: User },
  { key: 'referencia', label: 'Referencia del expediente', icon: Hash },
  { key: 'denominacion', label: 'Denominación', icon: FileText },
  { key: 'fecha', label: 'Fecha actual', icon: Calendar },
  { key: 'clases_nice', label: 'Clases Nice', icon: Hash },
];

// ── Component ────────────────────────────────────────────────
export function TemplatePreviewModal({
  open,
  onOpenChange,
  documentType,
  activeStyle,
  onStyleChange,
  isEnabled,
  onToggle,
}: TemplatePreviewModalProps) {
  const { currentOrganization } = useOrganization();
  const [localStyle, setLocalStyle] = useState<StyleKey>(activeStyle);

  useEffect(() => {
    if (open) setLocalStyle(activeStyle);
  }, [open, activeStyle]);

  if (!documentType) return null;

  const orgName = currentOrganization?.name || 'Tu Empresa S.L.';
  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleStyleSelect = (s: StyleKey) => {
    setLocalStyle(s);
    onStyleChange(s);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] w-[90vw] h-[85vh] p-0 gap-0 overflow-hidden">
        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b bg-slate-50/80">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">{documentType.icon}</span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">{documentType.name}</h2>
              <p className="text-xs text-slate-500">
                {CATEGORY_LABELS[documentType.category]} · Última edición: {dateStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="gap-2 text-xs">
                  <FileText className="h-3.5 w-3.5" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Edit className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
        </div>

        {/* ── BODY: two columns ──────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Document at scale */}
          <div className="flex-[3] bg-slate-100 overflow-auto flex items-start justify-center p-6">
            <div
              className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
              style={{ width: '480px', aspectRatio: '210 / 297' }}
            >
              <TemplateThumbnailSVG
                typeId={documentType.id}
                style={localStyle}
                tenantName={orgName}
              />
            </div>
          </div>

          {/* RIGHT: Side panel */}
          <div className="flex-[2] max-w-[340px] border-l bg-white flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {/* ── Style selector ──────────────────── */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Estilo visual
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_OPTIONS.map((s) => {
                      const selected = localStyle === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleStyleSelect(s.id)}
                          className={cn(
                            "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border",
                            selected
                              ? "bg-slate-50 border-slate-300 font-semibold text-slate-800 shadow-sm"
                              : "border-transparent hover:bg-slate-50 text-slate-500"
                          )}
                        >
                          <span
                            className="w-3 h-3 rounded-full border-2 shrink-0"
                            style={{
                              backgroundColor: selected ? s.color : 'transparent',
                              borderColor: s.color,
                            }}
                          />
                          {s.name}
                          {selected && (
                            <Check className="h-3.5 w-3.5 text-blue-500 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Org data ────────────────────────── */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Datos de tu organización
                  </h4>
                  <div className="space-y-2 text-sm">
                    {[
                      { icon: Building2, value: orgName },
                      { icon: MapPin, value: 'C/ Gran Vía 42, 28013 Madrid' },
                      { icon: Mail, value: 'info@empresa.com' },
                      { icon: Phone, value: '+34 91 555 0100' },
                      { icon: Globe, value: 'www.empresa.com' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-600">
                        <item.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Se rellenan automáticamente desde la configuración de tu organización
                  </p>
                </div>

                {/* ── Variables ────────────────────────── */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Campos variables
                  </h4>
                  <div className="space-y-1.5">
                    {PLACEHOLDER_VARIABLES.map((v) => (
                      <div
                        key={v.key}
                        className="flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-md bg-amber-50/70 border border-amber-100"
                      >
                        <v.icon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <code className="text-[11px] text-amber-700 font-mono">{`{${v.key}}`}</code>
                        <span className="text-slate-500 text-[11px] ml-auto truncate">{v.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Se rellenan con los datos del expediente y cliente al generar
                  </p>
                </div>
              </div>
            </ScrollArea>

            {/* ── Footer: toggle ──────────────────────────── */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Estado:</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={onToggle}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isEnabled ? 'text-emerald-600' : 'text-slate-400'
                  )}>
                    {isEnabled ? '🟢 Activada' : 'Desactivada'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isEnabled
                  ? 'Disponible para generar documentos en expedientes'
                  : 'No aparecerá en el selector de documentos'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
