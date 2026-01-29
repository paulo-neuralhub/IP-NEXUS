/**
 * MatterSelector - Selector de expediente reutilizable para modales
 * Auto-selecciona si hay 1 expediente, muestra selector si hay 2+
 */

import { useState, useEffect } from 'react';
import { useMatterSelector, MatterOption } from '@/hooks/use-matter-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatterSelectorProps {
  accountId: string | null | undefined;
  value?: string | null;
  onChange: (matterId: string | null, matter: MatterOption | null) => void;
  required?: boolean;
  className?: string;
  showMatterSelector?: boolean; // false si viene de contexto de expediente
  fixedMatterId?: string | null; // ID fijo cuando viene de expediente
  fixedMatterReference?: string | null; // Referencia fija
}

// Colores por tipo de expediente
const MATTER_TYPE_COLORS: Record<string, string> = {
  trademark: '#3b82f6',
  patent: '#8b5cf6',
  design: '#ec4899',
  copyright: '#f59e0b',
  litigation: '#ef4444',
  contract: '#10b981',
  domain: '#06b6d4',
  general: '#6b7280',
};

export function MatterSelector({
  accountId,
  value,
  onChange,
  required = false,
  className,
  showMatterSelector = true,
  fixedMatterId,
  fixedMatterReference,
}: MatterSelectorProps) {
  // Si viene de contexto de expediente, mostrar badge fijo
  if (!showMatterSelector && fixedMatterId) {
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg", className)}>
        <Briefcase className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          Expediente: {fixedMatterReference || 'Sin referencia'}
        </span>
        <Badge variant="secondary" className="ml-auto text-xs">
          Contexto fijo
        </Badge>
      </div>
    );
  }

  // Si no hay accountId, no se puede seleccionar
  if (!accountId) {
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground", className)}>
        <Info className="w-4 h-4" />
        Sin cliente asociado - No se puede vincular a expediente
      </div>
    );
  }

  return (
    <MatterSelectorInner
      accountId={accountId}
      value={value}
      onChange={onChange}
      required={required}
      className={className}
    />
  );
}

// Componente interno que usa el hook
function MatterSelectorInner({
  accountId,
  value,
  onChange,
  required,
  className,
}: {
  accountId: string;
  value?: string | null;
  onChange: (matterId: string | null, matter: MatterOption | null) => void;
  required?: boolean;
  className?: string;
}) {
  const {
    matters,
    isLoading,
    hasMatters,
    hasMultipleMatters,
    hasSingleMatter,
    matterCount,
    selectedMatter,
    isValid,
    needsSelection,
    matterId,
    setMatterId,
  } = useMatterSelector({
    accountId,
    autoSelectSingle: true,
    required,
    initialMatterId: value,
  });

  // Sync con value externo
  useEffect(() => {
    if (value !== undefined && value !== matterId) {
      setMatterId(value);
    }
  }, [value]);

  // Notificar cambios
  useEffect(() => {
    onChange(matterId, selectedMatter);
  }, [matterId, selectedMatter]);

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Sin expedientes activos
  if (!hasMatters) {
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground", className)}>
        <Info className="w-4 h-4 flex-shrink-0" />
        Sin expedientes activos - Se vinculará solo al cliente
      </div>
    );
  }

  // Exactamente 1 expediente - auto-seleccionado
  if (hasSingleMatter && matters[0]) {
    const matter = matters[0];
    return (
      <div className={cn("flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg", className)}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate">
            Vinculado a: {matter.reference} - {matter.title}
          </span>
        </div>
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          Auto
        </Badge>
      </div>
    );
  }

  // 2+ expedientes - mostrar selector
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Vincular a expediente
            {required && <span className="text-destructive ml-1">*</span>}
          </span>
        </div>
        {hasMultipleMatters && (
          <Badge variant="outline" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            {matterCount} expedientes
          </Badge>
        )}
      </div>

      <Select
        value={matterId || ''}
        onValueChange={(v) => setMatterId(v || null)}
      >
        <SelectTrigger className={cn(
          !isValid && "border-destructive",
          needsSelection && "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
        )}>
          <SelectValue placeholder="Seleccionar expediente..." />
        </SelectTrigger>
        <SelectContent>
          {/* Opción de vincular solo al cliente */}
          {!required && (
            <SelectItem value="__none__" className="text-muted-foreground">
              Solo vincular al cliente
            </SelectItem>
          )}

          {/* Lista de expedientes */}
          {matters.map((matter) => (
            <SelectItem key={matter.id} value={matter.id}>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MATTER_TYPE_COLORS[matter.matter_type] || MATTER_TYPE_COLORS.general }}
                />
                <span className="font-medium">{matter.reference}</span>
                <span className="text-muted-foreground truncate">{matter.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {required && !matterId && needsSelection && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Debes seleccionar un expediente para continuar
        </p>
      )}
    </div>
  );
}
