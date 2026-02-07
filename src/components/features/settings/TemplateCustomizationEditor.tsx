// ============================================================
// TEMPLATE CUSTOMIZATION EDITOR
// 7 collapsible sections for full document personalization
// ============================================================

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { ChevronDown, Upload, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── FONTS ───────────────────────────────────────────────────
export const AVAILABLE_FONTS = [
  { value: "", label: "— Por defecto del estilo —" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Sora', sans-serif", label: "Sora" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta Sans" },
  { value: "'Manrope', sans-serif", label: "Manrope" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Inter Tight', sans-serif", label: "Inter Tight" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'IBM Plex Sans', sans-serif", label: "IBM Plex Sans" },
  { value: "'Urbanist', sans-serif", label: "Urbanist" },
  { value: "'Source Sans 3', sans-serif", label: "Source Sans 3" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant Garamond" },
  { value: "'Libre Baskerville', serif", label: "Libre Baskerville" },
  { value: "'Fraunces', serif", label: "Fraunces" },
];

// ── CUSTOMIZATIONS TYPE ─────────────────────────────────────
export interface TemplateCustomizations {
  // Identity
  companyName: string;
  companySubtitle: string;
  logoBase64: string;
  logoFileName: string;
  // Colors
  primaryColor: string;
  accentColor: string;
  headerBgColor: string;
  headerTextColor: string;
  tableBgColor: string;
  totalBgColor: string;
  // Typography
  headFont: string;
  bodyFont: string;
  // Header data
  headerEmail: string;
  headerPhone: string;
  headerAddress: string;
  headerIban: string;
  headerCif: string;
  // Footer
  footerMode: string;
  footerLeft: string;
  footerRight: string;
  // Spacing
  headerPadding: string;
  bodyPadding: string;
  fontSize: string;
  tableFontSize: string;
  lineHeight: string;
  tableRadius: string;
  headerHeight: string;
}

export const DEFAULT_CUSTOMIZATIONS: TemplateCustomizations = {
  companyName: '', companySubtitle: '',
  logoBase64: '', logoFileName: '',
  primaryColor: '', accentColor: '', headerBgColor: '', headerTextColor: '', tableBgColor: '', totalBgColor: '',
  headFont: '', bodyFont: '',
  headerEmail: '', headerPhone: '', headerAddress: '', headerIban: '', headerCif: '',
  footerMode: '', footerLeft: '', footerRight: '',
  headerPadding: '', bodyPadding: '', fontSize: '', tableFontSize: '', lineHeight: '', tableRadius: '', headerHeight: '',
};

export function hasAnyCustomization(c: TemplateCustomizations): boolean {
  return Object.values(c).some(v => v !== '');
}

// ── COLLAPSIBLE SECTION ─────────────────────────────────────
function EditorSection({ icon, title, children, defaultOpen = true }: {
  icon: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-slate-700 flex-1">{title}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-3 pb-3 pt-1 border-t border-slate-50 space-y-2.5">{children}</div>}
    </div>
  );
}

// ── MINI INPUT ──────────────────────────────────────────────
function MiniInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 transition-colors text-slate-700 placeholder:text-slate-300"
      />
    </div>
  );
}

// ── COLOR INPUT ─────────────────────────────────────────────
function ColorInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-1.5 mt-0.5">
        <input
          type="color"
          value={value || '#3B82F6'}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="flex-1 px-2 py-1 text-[11px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-slate-600 placeholder:text-slate-300 font-mono"
        />
        {value && (
          <button onClick={() => onChange('')} className="text-slate-300 hover:text-slate-500 p-0.5">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── FONT SELECT ─────────────────────────────────────────────
function FontSelect({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 text-slate-700"
      >
        {AVAILABLE_FONTS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      {value && (
        <div className="mt-1 px-2 py-1 bg-slate-50 rounded text-xs text-slate-600" style={{ fontFamily: value }}>
          Aa Bb Cc 123
        </div>
      )}
    </div>
  );
}

// ── MAIN EDITOR COMPONENT ───────────────────────────────────
interface TemplateCustomizationEditorProps {
  customizations: TemplateCustomizations;
  onChange: (c: TemplateCustomizations) => void;
  onReset: () => void;
}

export function TemplateCustomizationEditor({ customizations, onChange, onReset }: TemplateCustomizationEditorProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((field: keyof TemplateCustomizations, value: string) => {
    onChange({ ...customizations, [field]: value });
  }, [customizations, onChange]);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...customizations, logoBase64: reader.result as string, logoFileName: file.name });
    reader.readAsDataURL(file);
  }, [customizations, onChange]);

  const removeLogo = useCallback(() => {
    onChange({ ...customizations, logoBase64: '', logoFileName: '' });
    if (logoInputRef.current) logoInputRef.current.value = '';
  }, [customizations, onChange]);

  const hasCustom = hasAnyCustomization(customizations);

  return (
    <div className="space-y-2">
      {/* Section 1: Logo */}
      <EditorSection icon="🖼️" title="Logo" defaultOpen={true}>
        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        {customizations.logoBase64 ? (
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
            <img src={customizations.logoBase64} alt="Logo" className="h-10 w-auto max-w-[80px] object-contain rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 truncate">{customizations.logoFileName}</p>
            </div>
            <button onClick={removeLogo} className="text-slate-400 hover:text-red-500 p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Subir logo
          </button>
        )}
      </EditorSection>

      {/* Section 2: Identity */}
      <EditorSection icon="🏢" title="Identidad" defaultOpen={true}>
        <MiniInput label="Nombre empresa" value={customizations.companyName} onChange={v => update('companyName', v)} placeholder="Meridian IP Consulting" />
        <MiniInput label="Subtítulo" value={customizations.companySubtitle} onChange={v => update('companySubtitle', v)} placeholder="Intellectual Property" />
        <MiniInput label="CIF/NIF" value={customizations.headerCif} onChange={v => update('headerCif', v)} placeholder="B-87654321" />
      </EditorSection>

      {/* Section 3: Typography */}
      <EditorSection icon="🔤" title="Tipografía" defaultOpen={true}>
        <FontSelect label="Fuente títulos" value={customizations.headFont} onChange={v => update('headFont', v)} />
        <FontSelect label="Fuente cuerpo" value={customizations.bodyFont} onChange={v => update('bodyFont', v)} />
      </EditorSection>

      {/* Section 4: Colors */}
      <EditorSection icon="🎨" title="Colores" defaultOpen={true}>
        <div className="grid grid-cols-2 gap-2">
          <ColorInput label="Primario" value={customizations.primaryColor} onChange={v => update('primaryColor', v)} />
          <ColorInput label="Acento" value={customizations.accentColor} onChange={v => update('accentColor', v)} />
          <ColorInput label="Fondo cabecera" value={customizations.headerBgColor} onChange={v => update('headerBgColor', v)} />
          <ColorInput label="Texto cabecera" value={customizations.headerTextColor} onChange={v => update('headerTextColor', v)} />
          <ColorInput label="Fondo tabla" value={customizations.tableBgColor} onChange={v => update('tableBgColor', v)} />
          <ColorInput label="Fondo total" value={customizations.totalBgColor} onChange={v => update('totalBgColor', v)} />
        </div>
      </EditorSection>

      {/* Section 5: Header data */}
      <EditorSection icon="📋" title="Datos cabecera" defaultOpen={false}>
        <MiniInput label="Email" value={customizations.headerEmail} onChange={v => update('headerEmail', v)} placeholder="info@empresa.com" />
        <MiniInput label="Teléfono" value={customizations.headerPhone} onChange={v => update('headerPhone', v)} placeholder="+34 912 345 678" />
        <MiniInput label="Dirección" value={customizations.headerAddress} onChange={v => update('headerAddress', v)} placeholder="Calle Principal 1, Madrid" />
        <MiniInput label="IBAN" value={customizations.headerIban} onChange={v => update('headerIban', v)} placeholder="ES12 3456 7890 ..." />
      </EditorSection>

      {/* Section 6: Footer */}
      <EditorSection icon="📝" title="Pie de página" defaultOpen={false}>
        <div className="flex items-center gap-2 mb-1">
          <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex-1">Personalizado</label>
          <button
            onClick={() => update('footerMode', customizations.footerMode === 'custom' ? '' : 'custom')}
            className={cn(
              "relative w-8 rounded-full transition-colors duration-200",
              customizations.footerMode === 'custom' ? "bg-indigo-500" : "bg-slate-200"
            )}
            style={{ height: 18 }}
          >
            <div className={cn(
              "absolute top-0.5 bg-white rounded-full shadow-sm transition-transform duration-200",
              customizations.footerMode === 'custom' ? "translate-x-3.5" : "translate-x-0.5"
            )} style={{ width: 14, height: 14 }} />
          </button>
        </div>
        {customizations.footerMode === 'custom' && (
          <>
            <MiniInput label="Texto izquierda" value={customizations.footerLeft} onChange={v => update('footerLeft', v)} placeholder="© 2026 Mi Empresa" />
            <MiniInput label="Texto derecha" value={customizations.footerRight} onChange={v => update('footerRight', v)} placeholder="www.miempresa.com" />
          </>
        )}
      </EditorSection>

      {/* Section 7: Spacing */}
      <EditorSection icon="↔️" title="Espaciado" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <MiniInput label="Padding cabecera" value={customizations.headerPadding} onChange={v => update('headerPadding', v)} placeholder="24" type="number" />
          <MiniInput label="Padding cuerpo" value={customizations.bodyPadding} onChange={v => update('bodyPadding', v)} placeholder="32" type="number" />
          <MiniInput label="Tamaño fuente" value={customizations.fontSize} onChange={v => update('fontSize', v)} placeholder="13" type="number" />
          <MiniInput label="Fuente tabla" value={customizations.tableFontSize} onChange={v => update('tableFontSize', v)} placeholder="12" type="number" />
          <MiniInput label="Interlineado" value={customizations.lineHeight} onChange={v => update('lineHeight', v)} placeholder="1.6" />
          <MiniInput label="Radio tabla" value={customizations.tableRadius} onChange={v => update('tableRadius', v)} placeholder="8" type="number" />
        </div>
      </EditorSection>

      {/* Reset button */}
      {hasCustom && (
        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
        >
          <RotateCcw className="w-3 h-3" />
          Restablecer todo
        </button>
      )}
    </div>
  );
}
