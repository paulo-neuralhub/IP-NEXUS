// =============================================
// IP-NEXUS - CONDITION BUILDER COMPONENT
// Visual builder for workflow conditions
// =============================================

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { VariablePicker, WORKFLOW_VARIABLES } from './VariablePicker';
import type { WorkflowCondition, ConditionOperator } from '@/types/workflow.types';

// Operators with their labels and applicable types
const CONDITION_OPERATORS: {
  value: ConditionOperator;
  label: string;
  types: ('string' | 'number' | 'date' | 'boolean' | 'any')[];
}[] = [
  { value: 'equals', label: 'Es igual a', types: ['any'] },
  { value: 'not_equals', label: 'No es igual a', types: ['any'] },
  { value: 'contains', label: 'Contiene', types: ['string'] },
  { value: 'not_contains', label: 'No contiene', types: ['string'] },
  { value: 'greater_than', label: 'Mayor que', types: ['number', 'date'] },
  { value: 'less_than', label: 'Menor que', types: ['number', 'date'] },
  { value: 'is_empty', label: 'Está vacío', types: ['any'] },
  { value: 'is_not_empty', label: 'No está vacío', types: ['any'] },
  { value: 'in_list', label: 'Está en la lista', types: ['string', 'number'] },
  { value: 'not_in_list', label: 'No está en la lista', types: ['string', 'number'] },
];

// Field options flattened from variables
const FIELD_OPTIONS = WORKFLOW_VARIABLES.flatMap(category => 
  category.variables.map(v => ({
    value: v.key,
    label: `${category.label} > ${v.label}`,
    type: v.type,
    category: category.id
  }))
);

interface ConditionBuilderProps {
  conditions: WorkflowCondition[];
  onChange: (conditions: WorkflowCondition[]) => void;
  className?: string;
}

export function ConditionBuilder({ conditions, onChange, className }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: WorkflowCondition = {
      field: '',
      operator: 'equals',
      value: '',
      logic: conditions.length > 0 ? 'AND' : undefined
    };
    onChange([...conditions, newCondition]);
  };

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    const newConditions = conditions.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    );
    onChange(newConditions);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    // Update logic of first remaining condition
    if (newConditions.length > 0 && index === 0) {
      newConditions[0] = { ...newConditions[0], logic: undefined };
    }
    onChange(newConditions);
  };

  const getOperatorsForField = (fieldKey: string) => {
    const field = FIELD_OPTIONS.find(f => f.value === fieldKey);
    if (!field) return CONDITION_OPERATORS;
    
    return CONDITION_OPERATORS.filter(op => 
      op.types.includes('any') || op.types.includes(field.type as any)
    );
  };

  const needsValue = (operator: ConditionOperator) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {conditions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
          <p className="text-sm mb-2">Sin condiciones</p>
          <p className="text-xs mb-4">El workflow se ejecutará siempre que se active el trigger</p>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Condición
          </Button>
        </div>
      ) : (
        <>
          {conditions.map((condition, index) => (
            <Card key={index} className="relative">
              {/* Logic connector */}
              {index > 0 && (
                <div className="absolute -top-4 left-6 z-10">
                  <Select
                    value={condition.logic || 'AND'}
                    onValueChange={(value) => updateCondition(index, { logic: value as 'AND' | 'OR' })}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">Y</SelectItem>
                      <SelectItem value="OR">O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                  
                  <div className="flex-1 grid gap-3 md:grid-cols-3">
                    {/* Field selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Campo</Label>
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKFLOW_VARIABLES.map(category => (
                            <div key={category.id}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {category.label}
                              </div>
                              {category.variables.map(v => (
                                <SelectItem key={v.key} value={v.key}>
                                  {v.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Operador</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, { operator: value as ConditionOperator })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorsForField(condition.field).map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value input */}
                    {needsValue(condition.operator) && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Valor</Label>
                          <VariablePicker 
                            onSelect={(variable) => updateCondition(index, { value: variable })}
                            buttonLabel=""
                            className="h-5 w-5 p-0"
                          />
                        </div>
                        <Input
                          value={String(condition.value || '')}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          placeholder="Valor a comparar"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeCondition(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview */}
                <div className="mt-3 pt-3 border-t">
                  <ConditionPreview condition={condition} />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Añadir Condición
          </Button>
        </>
      )}
    </div>
  );
}

// Preview component
function ConditionPreview({ condition }: { condition: WorkflowCondition }) {
  const field = FIELD_OPTIONS.find(f => f.value === condition.field);
  const operator = CONDITION_OPERATORS.find(o => o.value === condition.operator);
  
  if (!condition.field) {
    return <span className="text-xs text-muted-foreground italic">Selecciona un campo</span>;
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap text-xs">
      <Badge variant="secondary" className="font-mono">
        {field?.label || condition.field}
      </Badge>
      <span className="text-muted-foreground">{operator?.label || condition.operator}</span>
      {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
        <Badge variant="outline" className="font-mono">
          {String(condition.value) || '(vacío)'}
        </Badge>
      )}
    </div>
  );
}

// Simple summary component
export function ConditionsSummary({ conditions }: { conditions: WorkflowCondition[] }) {
  if (!conditions || conditions.length === 0) {
    return <span className="text-muted-foreground text-sm">Sin condiciones</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <Badge variant="outline" className="text-xs px-1">
              {condition.logic || 'Y'}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {condition.field} {condition.operator}
          </Badge>
        </div>
      ))}
    </div>
  );
}
