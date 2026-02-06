// ============================================================
// TEMPLATE PREVIEW MODAL - Modal de vista previa con datos del tenant
// ============================================================

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  X, Download, Edit, Check, ChevronDown, FileText, FileSpreadsheet,
  Building2, User, Calendar, Hash, Mail, Phone, Globe, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StyleSelectorInline } from './StyleSelectorInline';
import { useOrganization } from '@/contexts/organization-context';
import type { DocumentType, DesignTokens } from '@/lib/document-templates/designTokens';
import { CATEGORY_LABELS } from '@/lib/document-templates/designTokens';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  defaultStyle: DesignTokens | null;
  allStyles: DesignTokens[];
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onStyleChange: (style: DesignTokens) => void;
}

// Variables de ejemplo que se muestran como placeholders
const PLACEHOLDER_VARIABLES = [
  { key: 'nombre_cliente', label: 'Nombre del cliente', icon: User },
  { key: 'referencia', label: 'Referencia del expediente', icon: Hash },
  { key: 'denominacion', label: 'Denominación', icon: FileText },
  { key: 'fecha', label: 'Fecha actual', icon: Calendar },
  { key: 'clases_nice', label: 'Clases Nice', icon: Hash },
];

export function TemplatePreviewModal({
  open,
  onOpenChange,
  documentType,
  defaultStyle,
  allStyles,
  isEnabled,
  onToggle,
  onStyleChange,
}: TemplatePreviewModalProps) {
  const { currentOrganization } = useOrganization();
  const [previewStyle, setPreviewStyle] = useState<DesignTokens | null>(defaultStyle);
  
  // Reset preview style when modal opens
  React.useEffect(() => {
    if (open && defaultStyle) {
      setPreviewStyle(defaultStyle);
    }
  }, [open, defaultStyle]);
  
  if (!documentType) return null;
  
  const colors = previewStyle?.colors || defaultStyle?.colors;
  const orgName = currentOrganization?.name || 'Tu Empresa S.L.';
  
  const handleStyleSelect = (style: DesignTokens) => {
    setPreviewStyle(style);
  };
  
  const handleSaveStyle = () => {
    if (previewStyle) {
      onStyleChange(previewStyle);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{documentType.icon}</span>
              <div>
                <DialogTitle className="text-lg">{documentType.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[documentType.category]} · Última edición: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Download dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Descargar
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="gap-2">
                    <FileText className="h-4 w-4" />
                    Descargar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Descargar DOCX
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Document preview */}
          <div className="flex-1 bg-slate-100 p-6 overflow-auto flex items-start justify-center">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ 
                width: '480px', // Slightly smaller for better scaling
                minHeight: '680px', // Proportional A4
                backgroundColor: colors?.background || '#ffffff',
                fontSize: '11px', // Reduced font size for realistic scaling
              }}
            >
              {/* Document Header */}
              <div
                className="px-5 py-4"
                style={{ backgroundColor: colors?.headerBg || '#2563eb' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div 
                      className="w-20 h-6 rounded flex items-center justify-center text-[9px] font-medium"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: colors?.headerText || '#ffffff',
                      }}
                    >
                      [Logo]
                    </div>
                    <h2 
                      className="text-sm font-bold mt-2"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      {orgName}
                    </h2>
                    <p 
                      className="text-[10px] opacity-80"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      C/ Gran Vía 42, 28013 Madrid
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 
                      className="text-base font-bold uppercase"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      {documentType.name}
                    </h1>
                    <p 
                      className="text-[10px] opacity-80 mt-0.5"
                      style={{ color: colors?.headerText || '#ffffff' }}
                    >
                      Nº: [Referencia]
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Document Body */}
              <div className="p-5" style={{ color: colors?.text || '#333333' }}>
                {/* Client info */}
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: colors?.backgroundAlt || '#f8fafc' }}>
                  <h3 className="text-[10px] font-semibold mb-1" style={{ color: colors?.text }}>
                    Cliente
                  </h3>
                  <p className="text-xs font-medium">[Nombre del cliente]</p>
                  <p className="text-[10px]" style={{ color: colors?.textMuted || '#999' }}>
                    [Dirección del cliente]
                  </p>
                  <p className="text-[10px]" style={{ color: colors?.textMuted || '#999' }}>
                    NIF: [NIF Cliente]
                  </p>
                </div>
                
                {/* Content placeholder */}
                <div className="space-y-3 mb-5">
                  <p className="text-xs" style={{ color: colors?.text }}>
                    Estimado/a <span className="font-medium">[Nombre del cliente]</span>,
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: colors?.text }}>
                    En relación con el expediente <span className="font-medium">[Referencia]</span> 
                    correspondiente a <span className="font-medium">[Denominación]</span>, 
                    le comunicamos que...
                  </p>
                  <div 
                    className="h-16 rounded border-2 border-dashed flex items-center justify-center"
                    style={{ borderColor: colors?.border || '#e2e8f0' }}
                  >
                    <span className="text-[10px]" style={{ color: colors?.textMuted }}>
                      [Contenido del documento]
                    </span>
                  </div>
                </div>
                
                {/* Table example */}
                <div className="mb-5">
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr>
                        <th 
                          className="text-left p-2 font-semibold"
                          style={{ 
                            backgroundColor: colors?.tableHeadBg || '#2563eb',
                            color: colors?.tableHeadText || '#ffffff',
                          }}
                        >
                          Concepto
                        </th>
                        <th 
                          className="text-right p-2 font-semibold"
                          style={{ 
                            backgroundColor: colors?.tableHeadBg || '#2563eb',
                            color: colors?.tableHeadText || '#ffffff',
                          }}
                        >
                          Importe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td 
                          className="p-2 border-b"
                          style={{ borderColor: colors?.border, backgroundColor: colors?.backgroundAlt }}
                        >
                          [Concepto 1]
                        </td>
                        <td 
                          className="p-2 text-right border-b"
                          style={{ borderColor: colors?.border, backgroundColor: colors?.backgroundAlt }}
                        >
                          [Importe]
                        </td>
                      </tr>
                      <tr>
                        <td 
                          className="p-2 border-b"
                          style={{ borderColor: colors?.border }}
                        >
                          [Concepto 2]
                        </td>
                        <td 
                          className="p-2 text-right border-b"
                          style={{ borderColor: colors?.border }}
                        >
                          [Importe]
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td 
                          className="p-2 font-bold"
                          style={{ 
                            backgroundColor: colors?.totalBg || '#2563eb',
                            color: colors?.totalText || '#ffffff',
                          }}
                        >
                          TOTAL
                        </td>
                        <td 
                          className="p-2 font-bold text-right"
                          style={{ 
                            backgroundColor: colors?.totalBg || '#2563eb',
                            color: colors?.totalText || '#ffffff',
                          }}
                        >
                          [Total]
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {/* Footer */}
                <div className="pt-4 border-t" style={{ borderColor: colors?.border }}>
                  <p className="text-[10px]" style={{ color: colors?.textMuted }}>
                    Fecha: [Fecha actual]
                  </p>
                  <p className="text-[10px] mt-3" style={{ color: colors?.text }}>
                    Atentamente,
                  </p>
                  <p className="text-[10px] font-semibold mt-1" style={{ color: colors?.text }}>
                    [Nombre del agente]
                  </p>
                  <p className="text-[10px]" style={{ color: colors?.textMuted }}>
                    {orgName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Settings panel */}
          <div className="w-80 border-l bg-white flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Style selector */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    Estilo visual
                  </h4>
                  <StyleSelectorInline
                    selectedStyleId={previewStyle?.id || null}
                    onSelect={handleStyleSelect}
                  />
                  {previewStyle?.id !== defaultStyle?.id && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600"
                      onClick={handleSaveStyle}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Guardar como estilo por defecto
                    </Button>
                  )}
                </div>
                
                {/* Tenant data */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Datos de tu organización
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{orgName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>C/ Gran Vía 42, 28013 Madrid</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>info@empresa.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>+34 91 555 0100</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span>www.empresa.com</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Estos datos se rellenan automáticamente desde la configuración de tu organización
                  </p>
                </div>
                
                {/* Placeholder variables */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Campos variables
                  </h4>
                  <div className="space-y-2">
                    {PLACEHOLDER_VARIABLES.map((v) => (
                      <div 
                        key={v.key}
                        className="flex items-center gap-2 text-sm p-2 rounded bg-amber-50 border border-amber-100"
                      >
                        <v.icon className="h-4 w-4 text-amber-600" />
                        <div>
                          <code className="text-xs text-amber-700 font-mono">
                            {`{${v.key}}`}
                          </code>
                          <span className="text-slate-500 ml-2 text-xs">
                            {v.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Estos campos se rellenan con los datos del expediente y cliente
                  </p>
                </div>
              </div>
            </ScrollArea>
            
            {/* Footer actions */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Estado de la plantilla</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={onToggle}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                  <span className={cn(
                    'text-sm font-medium',
                    isEnabled ? 'text-emerald-600' : 'text-slate-400'
                  )}>
                    {isEnabled ? 'Activada' : 'Desactivada'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {isEnabled 
                  ? 'Esta plantilla está disponible para generar documentos en expedientes'
                  : 'Esta plantilla no aparecerá en el selector de documentos'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
