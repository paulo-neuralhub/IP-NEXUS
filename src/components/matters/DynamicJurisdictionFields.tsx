// ============================================================
// IP-NEXUS - DYNAMIC JURISDICTION FIELDS (V2 - Improved Design)
// Renders jurisdiction-specific fields with cohesive IP-NEXUS styling
// ============================================================

import React from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  useJurisdictionFieldsByCode, 
  groupFieldsByGroup 
} from '@/hooks/useJurisdictions';
import type { JurisdictionFieldConfig, FieldType } from '@/types/jurisdiction';
import { cn } from '@/lib/utils';

// ============================================================
// JURISDICTION STYLES - Flag + Colors per country
// ============================================================

const JURISDICTION_STYLES: Record<string, { flag: string; bgClass: string; textClass: string; borderClass: string }> = {
  ES: { flag: '🇪🇸', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-200' },
  EU: { flag: '🇪🇺', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
  US: { flag: '🇺🇸', bgClass: 'bg-slate-50', textClass: 'text-slate-700', borderClass: 'border-slate-200' },
  GB: { flag: '🇬🇧', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-200' },
  CN: { flag: '🇨🇳', bgClass: 'bg-red-50', textClass: 'text-red-600', borderClass: 'border-red-200' },
  JP: { flag: '🇯🇵', bgClass: 'bg-rose-50', textClass: 'text-rose-700', borderClass: 'border-rose-200' },
  KR: { flag: '🇰🇷', bgClass: 'bg-blue-50', textClass: 'text-blue-600', borderClass: 'border-blue-200' },
  DE: { flag: '🇩🇪', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200' },
  FR: { flag: '🇫🇷', bgClass: 'bg-blue-50', textClass: 'text-blue-600', borderClass: 'border-blue-200' },
  IT: { flag: '🇮🇹', bgClass: 'bg-green-50', textClass: 'text-green-700', borderClass: 'border-green-200' },
  BR: { flag: '🇧🇷', bgClass: 'bg-green-50', textClass: 'text-green-600', borderClass: 'border-green-200' },
  MX: { flag: '🇲🇽', bgClass: 'bg-green-50', textClass: 'text-green-700', borderClass: 'border-green-200' },
  AU: { flag: '🇦🇺', bgClass: 'bg-blue-50', textClass: 'text-blue-600', borderClass: 'border-blue-200' },
  CA: { flag: '🇨🇦', bgClass: 'bg-red-50', textClass: 'text-red-600', borderClass: 'border-red-200' },
  IN: { flag: '🇮🇳', bgClass: 'bg-orange-50', textClass: 'text-orange-600', borderClass: 'border-orange-200' },
  WO: { flag: '🌐', bgClass: 'bg-teal-50', textClass: 'text-teal-700', borderClass: 'border-teal-200' },
  EP: { flag: '🇪🇺', bgClass: 'bg-indigo-50', textClass: 'text-indigo-700', borderClass: 'border-indigo-200' },
  WIPO: { flag: '🌐', bgClass: 'bg-teal-50', textClass: 'text-teal-700', borderClass: 'border-teal-200' },
  DEFAULT: { flag: '🏳️', bgClass: 'bg-gray-50', textClass: 'text-gray-700', borderClass: 'border-gray-200' },
};

// ============================================================
// GROUP LABELS - Icons + Translations
// ============================================================

const GROUP_CONFIG: Record<string, { icon: string; en: string; es: string }> = {
  general: { icon: '📋', en: 'General', es: 'General' },
  filing: { icon: '📤', en: 'Filing Details', es: 'Datos de Presentación' },
  applicant: { icon: '👤', en: 'Applicant', es: 'Solicitante' },
  priority: { icon: '🎯', en: 'Priority', es: 'Prioridad' },
  classification: { icon: '🏷️', en: 'Classification', es: 'Clasificación' },
  fees: { icon: '💰', en: 'Official Fees', es: 'Tasas Oficiales' },
  examination: { icon: '🔍', en: 'Examination', es: 'Examen' },
  publication: { icon: '📰', en: 'Publication', es: 'Publicación' },
  maintenance: { icon: '🔄', en: 'Maintenance', es: 'Mantenimiento' },
  prosecution: { icon: '⚖️', en: 'Prosecution', es: 'Procedimiento' },
  opposition: { icon: '⚔️', en: 'Opposition', es: 'Oposición' },
  status: { icon: '📊', en: 'Status', es: 'Estado' },
  languages: { icon: '🌍', en: 'Languages', es: 'Idiomas' },
  seniority: { icon: '📜', en: 'Seniority', es: 'Antigüedad' },
  representative: { icon: '👔', en: 'Representative', es: 'Representante' },
  trademark: { icon: '™️', en: 'Trademark Details', es: 'Datos de Marca' },
  patent: { icon: '📄', en: 'Patent Details', es: 'Datos de Patente' },
  use: { icon: '✅', en: 'Use & Evidence', es: 'Uso y Evidencia' },
  renewal: { icon: '🔁', en: 'Renewal', es: 'Renovación' },
};

// ============================================================
// TYPES
// ============================================================

interface DynamicJurisdictionFieldsProps {
  jurisdictionCode?: string;
  rightType?: 'trademark' | 'patent' | 'utility_model' | 'design' | 'copyright';
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  language?: 'en' | 'es';
  className?: string;
}

interface FieldRendererProps {
  field: JurisdictionFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  language: 'en' | 'es';
}

// ============================================================
// FIELD RENDERER - Uses same styling as main form
// ============================================================

function FieldRenderer({ field, value, onChange, language }: FieldRendererProps) {
  const label = language === 'es' && field.field_label_es 
    ? field.field_label_es 
    : field.field_label_en;

  const gridClass = cn(
    field.grid_column === 'half' && 'col-span-1',
    field.grid_column === 'third' && 'col-span-1',
    field.grid_column === 'full' && 'col-span-2'
  );

  const renderInput = (): React.ReactNode => {
    switch (field.field_type as FieldType) {
      case 'text':
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
            className="h-9"
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
            rows={2}
            className="min-h-[60px] resize-none"
          />
        );

      case 'number':
        return (
          <Input
            id={field.field_key}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(e.target.valueAsNumber || null)}
            placeholder={field.field_placeholder || ''}
            className="h-9"
          />
        );

      case 'date':
        return (
          <Input
            id={field.field_key}
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-9"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={field.field_key}
              checked={(value as boolean) || false}
              onCheckedChange={onChange}
            />
            <Label 
              htmlFor={field.field_key} 
              className="text-sm font-normal cursor-pointer text-muted-foreground"
            >
              {label}
            </Label>
          </div>
        );

      case 'select':
        return (
          <Select 
            value={(value as string) || ''} 
            onValueChange={onChange}
          >
            <SelectTrigger id={field.field_key} className="h-9">
              <SelectValue placeholder={field.field_placeholder || `Seleccionar...`} />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-1.5 pt-1">
            {field.field_options?.map(opt => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.field_key}-${opt.value}`}
                  name={field.field_key}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-3.5 w-3.5 text-primary focus:ring-primary"
                />
                <Label 
                  htmlFor={`${field.field_key}-${opt.value}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <Input
            id={field.field_key}
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            className="h-9"
          />
        );

      case 'multi_select':
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-1.5 p-2 border rounded-md bg-muted/30">
            {field.field_options?.map(opt => (
              <div key={opt.value} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.field_key}-${opt.value}`}
                  checked={selectedValues.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter(v => v !== opt.value);
                    onChange(newValues);
                  }}
                />
                <Label 
                  htmlFor={`${field.field_key}-${opt.value}`}
                  className="font-normal cursor-pointer text-sm"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'country_select':
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Código de país (ej: ES, US)"
            className="h-9"
          />
        );

      default:
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
            className="h-9"
          />
        );
    }
  };

  // Checkbox type renders label inline
  if (field.field_type === 'checkbox') {
    return (
      <div className={gridClass}>
        {renderInput()}
        {field.field_description && (
          <p className="text-xs text-muted-foreground mt-0.5 ml-6">
            {field.field_description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', gridClass)}>
      <Label htmlFor={field.field_key} className="text-sm font-medium">
        {label}
        {field.is_required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {renderInput()}
      {field.field_description && (
        <p className="text-xs text-muted-foreground">{field.field_description}</p>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT - Cohesive IP-NEXUS Design
// ============================================================

export function DynamicJurisdictionFields({
  jurisdictionCode,
  rightType,
  values,
  onChange,
  language = 'es',
  className,
}: DynamicJurisdictionFieldsProps) {
  const { data: fields, isLoading, error } = useJurisdictionFieldsByCode(
    jurisdictionCode, 
    rightType
  );

  // Don't render if no jurisdiction selected
  if (!jurisdictionCode || !rightType) return null;
  
  // Loading state - subtle inline
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 py-4 text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando campos específicos...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Fail silently - don't block the form
  }

  // No fields configured
  if (!fields?.length) return null;

  // Get style for this jurisdiction
  const style = JURISDICTION_STYLES[jurisdictionCode] || JURISDICTION_STYLES.DEFAULT;
  const jurisdictionName = getJurisdictionName(jurisdictionCode);

  // Check visibility conditions
  const shouldShow = (field: JurisdictionFieldConfig): boolean => {
    if (!field.visible_condition) return true;
    
    try {
      const condition = field.visible_condition;
      
      // Pattern: "fieldKey === 'value'"
      const matchEquals = condition.match(/(\w+)\s*===?\s*['"]([^'"]+)['"]/);
      if (matchEquals) {
        const [, key, expectedValue] = matchEquals;
        return values[key] === expectedValue;
      }
      
      // Pattern: "fieldKey" (boolean truthy check)
      if (/^\w+$/.test(condition)) {
        return !!values[condition];
      }
      
      return true;
    } catch {
      return true;
    }
  };

  // Group fields
  const grouped = groupFieldsByGroup(fields);
  const totalFieldCount = fields.length;

  return (
    <div className={cn("mt-8 pt-6 border-t border-border", className)}>
      {/* ============================================ */}
      {/* HEADER: Badge + Divider + Field count       */}
      {/* ============================================ */}
      <div className="flex items-center gap-3 mb-6">
        {/* Jurisdiction Badge - Pill style */}
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
          style.bgClass,
          style.textClass,
          style.borderClass
        )}>
          <span className="text-base leading-none">{style.flag}</span>
          <span className="text-sm font-medium">{jurisdictionName}</span>
        </div>
        
        {/* Divider line */}
        <div className="flex-1 h-px bg-border" />
        
        {/* Field count badge */}
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
          {totalFieldCount} campos específicos
        </Badge>
      </div>

      {/* ============================================ */}
      {/* FIELD GROUPS: Collapsible sections          */}
      {/* ============================================ */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([groupName, groupFields]) => {
          const visibleFields = groupFields.filter(shouldShow);
          if (visibleFields.length === 0) return null;

          const groupConfig = GROUP_CONFIG[groupName.toLowerCase()] || { 
            icon: '📁', 
            en: formatGroupName(groupName), 
            es: formatGroupName(groupName) 
          };
          const groupLabel = language === 'es' ? groupConfig.es : groupConfig.en;

          return (
            <Collapsible key={groupName} defaultOpen className="group">
              <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-2 hover:text-primary transition-colors">
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {groupConfig.icon} {groupLabel}
                </span>
                <div className="flex-1 h-px bg-border/50 ml-2" />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {visibleFields.length}
                </span>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pl-6 pt-3 pb-1">
                  {visibleFields.map(field => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      value={values[field.field_key]}
                      onChange={(v) => onChange(field.field_key, v)}
                      language={language}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatGroupName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getJurisdictionName(code: string): string {
  const names: Record<string, string> = {
    ES: 'España (OEPM)',
    EU: 'Unión Europea (EUIPO)',
    US: 'Estados Unidos (USPTO)',
    GB: 'Reino Unido (UKIPO)',
    CN: 'China (CNIPA)',
    JP: 'Japón (JPO)',
    KR: 'Corea del Sur (KIPO)',
    DE: 'Alemania (DPMA)',
    FR: 'Francia (INPI)',
    IT: 'Italia (UIBM)',
    BR: 'Brasil (INPI)',
    MX: 'México (IMPI)',
    AU: 'Australia (IP Australia)',
    CA: 'Canadá (CIPO)',
    IN: 'India (IPO)',
    WO: 'Internacional (WIPO)',
    EP: 'Patente Europea (EPO)',
    WIPO: 'OMPI / WIPO',
  };
  return names[code] || code;
}

export default DynamicJurisdictionFields;
