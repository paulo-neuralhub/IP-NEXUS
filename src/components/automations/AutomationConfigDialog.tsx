// ============================================================
// IP-NEXUS - AUTOMATION CONFIG DIALOG
// Modal para configurar parámetros de una automatización
// ============================================================

import { useState, useEffect } from 'react';
import { Settings, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import {
  useUpdateAutomationParams,
  type TenantAutomationCatalogItem,
} from '@/hooks/useTenantAutomationConfigs';
import type { ConfigurableParam } from '@/types/automations';

interface AutomationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TenantAutomationCatalogItem | null;
}

export function AutomationConfigDialog({
  open,
  onOpenChange,
  item,
}: AutomationConfigDialogProps) {
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const updateParams = useUpdateAutomationParams();

  // Initialize params when item changes
  useEffect(() => {
    if (item?.tenant_automation) {
      setParams(item.tenant_automation.custom_params || {});
      setChangedKeys(new Set());
    }
  }, [item]);

  if (!item) return null;

  const configurableParams = (item.template.configurable_params || []) as ConfigurableParam[];
  const currentParams = item.tenant_automation?.custom_params || {};

  const getParamValue = (param: ConfigurableParam): unknown => {
    // Priority: local state > custom_params > default
    if (params[param.key] !== undefined) return params[param.key];
    if (currentParams[param.key] !== undefined) return currentParams[param.key];
    return param.default_value;
  };

  const handleParamChange = (key: string, value: unknown) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setChangedKeys(prev => new Set([...prev, key]));
  };

  const handleResetParam = (key: string) => {
    const param = configurableParams.find(p => p.key === key);
    if (param) {
      setParams(prev => ({ ...prev, [key]: param.default_value }));
      setChangedKeys(prev => new Set([...prev, key]));
    }
  };

  const handleSave = () => {
    if (!item.tenant_automation?.id) return;

    updateParams.mutate(
      { automationId: item.tenant_automation.id, customParams: params },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  const hasChanges = changedKeys.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{item.template.icon}</span>
            Configurar: {item.template.name}
          </DialogTitle>
          <DialogDescription>
            Personaliza los parámetros de esta automatización para tu despacho.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {configurableParams.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">
                Esta automatización no tiene parámetros configurables
              </p>
            </div>
          ) : (
            configurableParams.map((param, idx) => (
              <div key={param.key}>
                {idx > 0 && <Separator className="mb-6" />}
                <ParamField
                  param={param}
                  value={getParamValue(param)}
                  onChange={(value) => handleParamChange(param.key, value)}
                  onReset={() => handleResetParam(param.key)}
                  isChanged={changedKeys.has(param.key)}
                />
              </div>
            ))
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateParams.isPending || (!hasChanges && configurableParams.length > 0)}
          >
            {updateParams.isPending ? (
              <Spinner className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Parameter Field Component ────────────────────────────────

function ParamField({
  param,
  value,
  onChange,
  onReset,
  isChanged,
}: {
  param: ConfigurableParam;
  value: unknown;
  onChange: (value: unknown) => void;
  onReset: () => void;
  isChanged: boolean;
}) {
  const isDefault = JSON.stringify(value) === JSON.stringify(param.default_value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={param.key} className="font-medium">
          {param.label}
          {param.label_en && (
            <span className="text-xs text-muted-foreground ml-2">
              ({param.label_en})
            </span>
          )}
        </Label>
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restaurar
          </Button>
        )}
      </div>

      {/* Number input */}
      {param.type === 'number' && (
        <Input
          id={param.key}
          type="number"
          min={param.validation?.min as number | undefined}
          max={param.validation?.max as number | undefined}
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(isChanged && 'border-primary')}
        />
      )}

      {/* Boolean switch */}
      {param.type === 'boolean' && (
        <div className="flex items-center gap-3">
          <Switch
            id={param.key}
            checked={value as boolean}
            onCheckedChange={onChange}
          />
          <span className="text-sm text-muted-foreground">
            {value ? 'Activado' : 'Desactivado'}
          </span>
        </div>
      )}

      {/* Textarea */}
      {param.type === 'textarea' && (
        <Textarea
          id={param.key}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={param.validation?.max_length as number | undefined}
          className={cn(isChanged && 'border-primary')}
        />
      )}

      {/* Select */}
      {param.type === 'select' && param.options && (
        <Select value={value as string} onValueChange={onChange}>
          <SelectTrigger className={cn(isChanged && 'border-primary')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {param.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Multi-select */}
      {param.type === 'multi_select' && param.options && (
        <div className="flex flex-wrap gap-2">
          {param.options.map(opt => {
            const isSelected = (value as string[])?.includes(opt.value);
            return (
              <Badge
                key={opt.value}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const current = (value as string[]) || [];
                  if (isSelected) {
                    onChange(current.filter(v => v !== opt.value));
                  } else {
                    onChange([...current, opt.value]);
                  }
                }}
              >
                {opt.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Number array */}
      {param.type === 'number_array' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {((value as number[]) || []).map((num, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="gap-1"
              >
                {num}
                <button
                  onClick={() => {
                    const arr = [...(value as number[])];
                    arr.splice(idx, 1);
                    onChange(arr);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Añadir valor..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  const newValue = Number(input.value);
                  if (!isNaN(newValue)) {
                    onChange([...(value as number[]) || [], newValue]);
                    input.value = '';
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* String array */}
      {param.type === 'string_array' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {((value as string[]) || []).map((str, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {str}
                <button
                  onClick={() => {
                    const arr = [...(value as string[])];
                    arr.splice(idx, 1);
                    onChange(arr);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Añadir valor (Enter para confirmar)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  onChange([...(value as string[]) || [], input.value.trim()]);
                  input.value = '';
                }
              }
            }}
          />
        </div>
      )}

      {/* String (default) */}
      {(param.type === 'string' || param.type === 'email') && (
        <Input
          id={param.key}
          type={param.type === 'email' ? 'email' : 'text'}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={cn(isChanged && 'border-primary')}
        />
      )}

      {/* Description */}
      {param.description && (
        <p className="text-xs text-muted-foreground">{param.description}</p>
      )}

      {/* Default value indicator */}
      {!isDefault && (
        <p className="text-xs text-muted-foreground">
          Valor por defecto: <code className="bg-muted px-1 rounded">{JSON.stringify(param.default_value)}</code>
        </p>
      )}
    </div>
  );
}
