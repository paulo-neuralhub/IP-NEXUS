// ============================================================
// IP-NEXUS - DYNAMIC JURISDICTION FIELDS
// Renders jurisdiction-specific fields based on configuration
// ============================================================

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  useJurisdictionFieldsByCode, 
  groupFieldsByGroup 
} from '@/hooks/useJurisdictions';
import type { JurisdictionFieldConfig, FieldType } from '@/types/jurisdiction';
import { cn } from '@/lib/utils';

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
// FIELD RENDERER
// ============================================================

function FieldRenderer({ field, value, onChange, language }: FieldRendererProps) {
  const label = language === 'es' && field.field_label_es 
    ? field.field_label_es 
    : field.field_label_en;

  const renderField = (): React.ReactNode => {
    switch (field.field_type as FieldType) {
      case 'text':
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
            rows={3}
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
          />
        );

      case 'date':
        return (
          <Input
            id={field.field_key}
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id={field.field_key}
              checked={(value as boolean) || false}
              onCheckedChange={onChange}
            />
            <Label htmlFor={field.field_key} className="text-sm font-normal cursor-pointer">
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
            <SelectTrigger id={field.field_key}>
              <SelectValue placeholder={field.field_placeholder || `Select ${label.toLowerCase()}...`} />
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
          <div className="space-y-2">
            {field.field_options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.field_key}-${opt.value}`}
                  name={field.field_key}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4"
                />
                <Label 
                  htmlFor={`${field.field_key}-${opt.value}`}
                  className="font-normal cursor-pointer"
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
          />
        );

      case 'multi_select':
        // For now, render as checkboxes
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
            {field.field_options?.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
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
                  className="font-normal cursor-pointer"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'country_select':
        // Placeholder - would integrate with JurisdictionSelector
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Country code (e.g., ES, US)"
          />
        );

      default:
        return (
          <Input
            id={field.field_key}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.field_placeholder || ''}
          />
        );
    }
  };

  // Checkbox type already includes label
  if (field.field_type === 'checkbox') {
    return (
      <div className={cn(
        field.grid_column === 'half' && 'col-span-1',
        field.grid_column === 'third' && 'col-span-1',
        field.grid_column === 'full' && 'col-span-full'
      )}>
        {renderField()}
        {field.field_description && (
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            {field.field_description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'space-y-1.5',
      field.grid_column === 'half' && 'col-span-1',
      field.grid_column === 'third' && 'col-span-1',
      field.grid_column === 'full' && 'col-span-full'
    )}>
      <Label htmlFor={field.field_key}>
        {label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {field.field_description && (
        <p className="text-xs text-muted-foreground">{field.field_description}</p>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 p-4 text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Cargando campos específicos...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("p-4 text-sm text-destructive bg-destructive/10 rounded-lg", className)}>
        Error cargando campos específicos de jurisdicción
      </div>
    );
  }

  // No fields configured
  if (!fields?.length) return null;

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

  // Format group name for display
  const formatGroupName = (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(grouped).map(([groupName, groupFields]) => {
        const visibleFields = groupFields.filter(shouldShow);
        if (visibleFields.length === 0) return null;

        return (
          <Card key={groupName} className="border-l-4 border-l-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {formatGroupName(groupName)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default DynamicJurisdictionFields;
