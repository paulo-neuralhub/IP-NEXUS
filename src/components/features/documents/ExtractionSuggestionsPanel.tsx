// ============================================================
// src/components/features/documents/ExtractionSuggestionsPanel.tsx
// Panel para mostrar y aplicar sugerencias de extracción
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Check, X, AlertTriangle, Plus, RefreshCw, 
  Sparkles, FileText, Calendar, Hash, Building2, Mail, Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DocumentExtraction,
  ExtractionSuggestion,
  useApplySuggestion,
  useRejectSuggestion,
  useApplyAllSuggestions
} from '@/hooks/use-document-extraction';

interface Props {
  extraction: DocumentExtraction;
  matterId?: string;
  filingId?: string;
  clientId?: string;
  onComplete?: () => void;
}

const ACTION_CONFIG = {
  add: { 
    bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
    border: 'border-emerald-200 dark:border-emerald-800', 
    icon: Plus, 
    color: 'text-emerald-600 dark:text-emerald-400',
    label: 'Nuevo'
  },
  update: { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-200 dark:border-blue-800', 
    icon: RefreshCw, 
    color: 'text-blue-600 dark:text-blue-400',
    label: 'Actualizar'
  },
  conflict: { 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-200 dark:border-red-800', 
    icon: AlertTriangle, 
    color: 'text-red-600 dark:text-red-400',
    label: 'Conflicto'
  },
  confirm: { 
    bg: 'bg-muted', 
    border: 'border-muted', 
    icon: Check, 
    color: 'text-muted-foreground',
    label: 'Confirmado'
  },
};

const FIELD_LABELS: Record<string, string> = {
  registration_number: 'Número de registro',
  application_number: 'Número de solicitud',
  publication_number: 'Número de publicación',
  filing_date: 'Fecha de presentación',
  registration_date: 'Fecha de registro',
  grant_date: 'Fecha de concesión',
  publication_date: 'Fecha de publicación',
  expiry_date: 'Fecha de vencimiento',
  priority_date: 'Fecha de prioridad',
  nice_classes: 'Clases Nice',
  goods_services_description: 'Productos/Servicios',
  mark_name: 'Nombre de marca',
  title: 'Título',
  name: 'Nombre',
  email: 'Email',
  phone: 'Teléfono',
  address: 'Dirección',
  vat_number: 'NIF/CIF',
  company_name: 'Empresa',
};

const FIELD_ICONS: Record<string, React.ElementType> = {
  registration_number: Hash,
  application_number: Hash,
  publication_number: Hash,
  filing_date: Calendar,
  registration_date: Calendar,
  grant_date: Calendar,
  publication_date: Calendar,
  expiry_date: Calendar,
  priority_date: Calendar,
  email: Mail,
  phone: Phone,
  company_name: Building2,
  name: Building2,
};

export function ExtractionSuggestionsPanel({ 
  extraction, 
  matterId, 
  filingId,
  clientId,
  onComplete 
}: Props) {
  const [localSuggestions, setLocalSuggestions] = useState<(ExtractionSuggestion & { localStatus?: string })[]>(
    extraction.suggestions.map(s => ({ ...s, localStatus: 'pending' }))
  );

  const applySuggestion = useApplySuggestion();
  const rejectSuggestion = useRejectSuggestion();
  const applyAll = useApplyAllSuggestions();

  const handleApply = async (suggestion: ExtractionSuggestion, index: number) => {
    try {
      await applySuggestion.mutateAsync({
        extractionId: extraction.id,
        suggestion,
        matterId,
        filingId,
        clientId: clientId || extraction.client_id
      });
      
      setLocalSuggestions(prev => 
        prev.map((s, i) => i === index ? { ...s, localStatus: 'applied' } : s)
      );
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleReject = async (suggestion: ExtractionSuggestion, index: number) => {
    await rejectSuggestion.mutateAsync({
      extractionId: extraction.id,
      suggestion
    });
    
    setLocalSuggestions(prev => 
      prev.map((s, i) => i === index ? { ...s, localStatus: 'rejected' } : s)
    );
  };

  const handleApplyAll = async () => {
    const result = await applyAll.mutateAsync({
      extraction: {
        ...extraction,
        suggestions: localSuggestions.filter(s => s.localStatus === 'pending')
      },
      matterId,
      filingId,
      clientId: clientId || extraction.client_id
    });

    setLocalSuggestions(prev => 
      prev.map(s => 
        s.localStatus === 'pending' && s.action !== 'conflict' && s.action !== 'confirm'
          ? { ...s, localStatus: 'applied' }
          : s
      )
    );

    onComplete?.();
  };

  const pendingCount = localSuggestions.filter(
    s => s.localStatus === 'pending' && s.action !== 'confirm'
  ).length;

  const applicableCount = localSuggestions.filter(
    s => s.localStatus === 'pending' && s.action !== 'conflict' && s.action !== 'confirm'
  ).length;

  if (localSuggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No se encontraron datos para extraer</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Datos Extraídos</CardTitle>
            <Badge variant="outline" className="ml-2">
              {extraction.document_type || 'Documento'}
            </Badge>
            {extraction.detected_jurisdiction && (
              <Badge variant="secondary">{extraction.detected_jurisdiction}</Badge>
            )}
          </div>
          {applicableCount > 0 && (
            <Button 
              size="sm" 
              onClick={handleApplyAll}
              disabled={applyAll.isPending}
            >
              {applyAll.isPending ? 'Aplicando...' : `Aplicar Todos (${applicableCount})`}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Revisa las sugerencias y aplica las que sean correctas
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {localSuggestions.map((suggestion, idx) => {
          const config = ACTION_CONFIG[suggestion.action];
          const Icon = config.icon;
          const FieldIcon = FIELD_ICONS[suggestion.field] || FileText;
          const isProcessed = suggestion.localStatus === 'applied' || suggestion.localStatus === 'rejected';

          return (
            <div
              key={`${suggestion.field}-${idx}`}
              className={cn(
                'rounded-lg border p-3 transition-all',
                config.bg,
                config.border,
                isProcessed && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn('p-2 rounded-lg bg-background/80')}>
                    <FieldIcon className={cn('h-4 w-4', config.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {FIELD_LABELS[suggestion.field] || suggestion.field}
                      </span>
                      <Badge variant="outline" className={cn('text-xs', config.color)}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>

                    {suggestion.current_value && (
                      <p className="text-xs text-muted-foreground mb-1">
                        Actual: <span className="font-mono">{String(suggestion.current_value)}</span>
                      </p>
                    )}

                    <p className="text-sm">
                      {suggestion.action === 'add' ? 'Añadir: ' : 
                       suggestion.action === 'update' ? 'Actualizar a: ' :
                       suggestion.action === 'conflict' ? 'Detectado: ' : ''}
                      <span className="font-semibold font-mono">
                        {Array.isArray(suggestion.suggested_value) 
                          ? suggestion.suggested_value.join(', ')
                          : String(suggestion.suggested_value)}
                      </span>
                    </p>

                    {suggestion.reason && (
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Confianza: {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {suggestion.target}
                      </Badge>
                    </div>
                  </div>
                </div>

                {!isProcessed && (
                  <div className="flex gap-1 shrink-0">
                    {suggestion.action !== 'confirm' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        onClick={() => handleApply(suggestion, idx)}
                        disabled={applySuggestion.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                      onClick={() => handleReject(suggestion, idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {suggestion.localStatus === 'applied' && (
                  <Badge className="bg-emerald-500">Aplicado</Badge>
                )}
                {suggestion.localStatus === 'rejected' && (
                  <Badge variant="secondary">Rechazado</Badge>
                )}
              </div>
            </div>
          );
        })}

        {extraction.confidence_score && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Confianza general: {Math.round(extraction.confidence_score * 100)}%</span>
              <span>Modelo: {extraction.ai_model_used}</span>
              {extraction.processing_time_ms && (
                <span>Tiempo: {extraction.processing_time_ms}ms</span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
