import React, { useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useImportableFields } from '@/hooks/import-export';
import type { FieldMapping } from '@/types/import-export';

interface FieldMappingStepProps {
  entityType: string;
  sourceHeaders: string[];
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  templateId?: string;
}

export function FieldMappingStep({
  entityType,
  sourceHeaders,
  mappings,
  onMappingsChange,
  templateId
}: FieldMappingStepProps) {
  const { data: targetFields, isLoading } = useImportableFields(entityType);

  // Auto-suggest mappings based on header names
  useEffect(() => {
    if (!targetFields || mappings.length > 0) return;

    const autoMappings: FieldMapping[] = sourceHeaders.map(header => {
      // Try to find matching target field
      const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');
      const matchedField = targetFields.find(field => {
        const normalizedField = field.field_name.toLowerCase().replace(/[_\s-]/g, '');
        const normalizedLabel = (field.display_name || '').toLowerCase().replace(/[_\s-]/g, '');
        return normalizedField === normalizedHeader || normalizedLabel === normalizedHeader;
      });

      return {
        sourceField: header,
        targetField: matchedField?.field_name || '',
        dataType: matchedField?.data_type,
        isRequired: matchedField?.is_required || false,
        defaultValue: matchedField?.default_value || undefined
      };
    });

    onMappingsChange(autoMappings);
  }, [sourceHeaders, targetFields, mappings.length, onMappingsChange]);

  const handleMappingChange = (sourceField: string, updates: Partial<FieldMapping>) => {
    onMappingsChange(
      mappings.map(m => 
        m.sourceField === sourceField 
          ? { ...m, ...updates }
          : m
      )
    );
  };

  const mappedCount = useMemo(() => 
    mappings.filter(m => m.targetField).length,
    [mappings]
  );

  const requiredMissing = useMemo(() => {
    if (!targetFields) return [];
    const mappedTargets = new Set(mappings.map(m => m.targetField));
    return targetFields.filter(f => f.is_required && !mappedTargets.has(f.field_name));
  }, [targetFields, mappings]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Cargando campos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {mappedCount} de {sourceHeaders.length} columnas mapeadas automáticamente
          </span>
        </div>
        <Badge variant={requiredMissing.length > 0 ? 'destructive' : 'default'}>
          {requiredMissing.length > 0 
            ? `${requiredMissing.length} campos requeridos sin mapear`
            : 'Todos los campos requeridos mapeados'
          }
        </Badge>
      </div>

      {requiredMissing.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Faltan campos requeridos: {requiredMissing.map(f => f.display_name || f.field_name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Mapping table */}
      <Card className="divide-y">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 font-medium text-sm">
          <div className="col-span-3">Columna origen</div>
          <div className="col-span-1 flex justify-center">→</div>
          <div className="col-span-3">Campo destino</div>
          <div className="col-span-2">Tipo</div>
          <div className="col-span-2">Valor defecto</div>
          <div className="col-span-1">Req.</div>
        </div>
        
        {mappings.map(mapping => {
          const targetField = targetFields?.find(f => f.field_name === mapping.targetField);
          
          return (
            <div 
              key={mapping.sourceField} 
              className={`grid grid-cols-12 gap-4 px-4 py-3 items-center ${
                mapping.isRequired && !mapping.targetField ? 'bg-destructive/5' : ''
              }`}
            >
              <div className="col-span-3">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {mapping.sourceField}
                </code>
              </div>
              
              <div className="col-span-1 flex justify-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="col-span-3">
                <Select
                  value={mapping.targetField || 'none'}
                  onValueChange={(value) => {
                    const field = targetFields?.find(f => f.field_name === value);
                    handleMappingChange(mapping.sourceField, {
                      targetField: value === 'none' ? '' : value,
                      dataType: field?.data_type,
                      isRequired: field?.is_required || false
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No importar —</SelectItem>
                    {targetFields?.map(field => (
                      <SelectItem key={field.field_name} value={field.field_name}>
                        {field.display_name || field.field_name}
                        {field.is_required && <span className="text-destructive ml-1">*</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2">
                {mapping.targetField && (
                  <Badge variant="outline" className="text-xs">
                    {targetField?.data_type || 'text'}
                  </Badge>
                )}
              </div>
              
              <div className="col-span-2">
                {mapping.targetField && (
                  <Input
                    placeholder="Valor por defecto"
                    value={mapping.defaultValue || ''}
                    onChange={(e) => handleMappingChange(mapping.sourceField, {
                      defaultValue: e.target.value || undefined
                    })}
                    className="h-8 text-sm"
                  />
                )}
              </div>
              
              <div className="col-span-1 flex justify-center">
                {mapping.targetField && (
                  <Switch
                    checked={mapping.isRequired}
                    onCheckedChange={(checked) => handleMappingChange(mapping.sourceField, {
                      isRequired: checked
                    })}
                  />
                )}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="text-destructive">*</span>
          <span>Campo requerido</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">text</Badge>
          <span>Tipo de dato</span>
        </div>
      </div>
    </div>
  );
}
