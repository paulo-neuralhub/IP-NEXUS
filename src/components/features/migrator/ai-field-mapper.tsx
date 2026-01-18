import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sparkles,
  Brain,
  ArrowRight,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Settings2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useAIFieldMapping, 
  useLearnedMappings, 
  type FieldAnalysis, 
  type MappingAnalysisResult 
} from '@/hooks/use-ai-field-mapping';
import { IP_NEXUS_FIELDS } from '@/lib/constants/ip-nexus-schema';

interface AIFieldMapperProps {
  sourceSystem: string;
  sourceData: Record<string, unknown>[];
  onMappingComplete: (mapping: Record<string, MappingConfig>) => void;
  onBack: () => void;
}

export interface MappingConfig {
  targetEntity: string;
  targetField: string;
  transformation?: {
    type: string;
    config: Record<string, unknown>;
  };
  confirmed: boolean;
}

export function AIFieldMapper({ sourceSystem, sourceData, onMappingComplete, onBack }: AIFieldMapperProps) {
  const [analysis, setAnalysis] = useState<MappingAnalysisResult | null>(null);
  const [mappings, setMappings] = useState<Record<string, MappingConfig>>({});
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);

  const aiMapping = useAIFieldMapping();
  const learnMapping = useLearnedMappings(sourceSystem);

  useEffect(() => {
    // Analizar campos automáticamente al cargar
    aiMapping.mutate(
      { sourceSystem, sourceData: sourceData as Record<string, unknown>[] },
      {
        onSuccess: (result) => {
          setAnalysis(result);
          // Inicializar mappings con sugerencias de alta confianza
          const initialMappings: Record<string, MappingConfig> = {};
          result.fields.forEach(field => {
            if (field.suggestedMapping.confidence >= 0.7) {
              initialMappings[field.sourceField] = {
                targetEntity: field.suggestedMapping.targetEntity,
                targetField: field.suggestedMapping.targetField,
                transformation: field.suggestedTransformation,
                confirmed: false
              };
            }
          });
          setMappings(initialMappings);
        }
      }
    );
  }, [sourceSystem]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirmMapping = (sourceField: string, confirmed: boolean) => {
    const mapping = mappings[sourceField];
    if (!mapping) return;

    setMappings(prev => ({
      ...prev,
      [sourceField]: { ...mapping, confirmed }
    }));

    // Aprender del feedback
    learnMapping.mutate({
      sourceField,
      targetEntity: mapping.targetEntity,
      targetField: mapping.targetField,
      confirmed
    });
  };

  const handleChangeMapping = (
    sourceField: string, 
    targetEntity: string, 
    targetField: string
  ) => {
    setMappings(prev => ({
      ...prev,
      [sourceField]: {
        ...prev[sourceField],
        targetEntity,
        targetField,
        confirmed: false
      }
    }));
  };

  const handleIgnoreField = (sourceField: string) => {
    setMappings(prev => {
      const newMappings = { ...prev };
      delete newMappings[sourceField];
      return newMappings;
    });
  };

  const confirmedCount = Object.values(mappings).filter(m => m.confirmed).length;
  const totalFields = analysis?.fields.length || 0;
  const progress = totalFields > 0 ? (confirmedCount / totalFields) * 100 : 0;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/50';
    if (confidence >= 0.5) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/50';
    return 'text-red-600 bg-red-100 dark:bg-red-900/50';
  };

  const filteredFields = analysis?.fields.filter(field => {
    if (!showOnlyIssues) return true;
    return field.suggestedMapping.confidence < 0.7 || field.warnings.length > 0;
  }) || [];

  if (aiMapping.isPending) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <Brain className="w-20 h-20 text-primary/20" />
            <Sparkles className="w-6 h-6 text-primary absolute top-0 right-0 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium mb-2">Analizando estructura de datos...</h3>
          <p className="text-sm text-muted-foreground mb-4">
            La IA está identificando campos y sugiriendo mapeos
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Procesando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (aiMapping.isError || !analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-medium mb-2">Error al analizar datos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No se pudo completar el análisis automático
          </p>
          <Button onClick={() => aiMapping.reset()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium">Mapeo Inteligente con IA</h3>
                <p className="text-sm text-muted-foreground">
                  {analysis.fields.length} campos detectados • 
                  {' '}{Math.round(analysis.overallConfidence * 100)}% confianza promedio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{confirmedCount}/{totalFields}</p>
                <p className="text-xs text-muted-foreground">Confirmados</p>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de problemas potenciales */}
      {analysis.potentialIssues.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              Problemas detectados ({analysis.potentialIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {analysis.potentialIssues.map((issue, i) => (
                <div 
                  key={i}
                  className={cn(
                    "p-2 rounded text-sm",
                    issue.severity === 'high' && "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200",
                    issue.severity === 'medium' && "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200",
                    issue.severity === 'low' && "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  )}
                >
                  <p className="font-medium">{issue.message}</p>
                  <p className="text-xs mt-1 opacity-80">
                    💡 {issue.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtro */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="show-issues"
            checked={showOnlyIssues}
            onCheckedChange={(checked) => setShowOnlyIssues(!!checked)}
          />
          <label htmlFor="show-issues" className="text-sm cursor-pointer">
            Mostrar solo campos con problemas
          </label>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredFields.length} campos
        </div>
      </div>

      {/* Lista de campos */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {filteredFields.map(field => (
            <FieldMappingRow
              key={field.sourceField}
              field={field}
              mapping={mappings[field.sourceField]}
              isExpanded={expandedFields.has(field.sourceField)}
              onToggleExpand={(expanded) => {
                setExpandedFields(prev => {
                  const newSet = new Set(prev);
                  if (expanded) newSet.add(field.sourceField);
                  else newSet.delete(field.sourceField);
                  return newSet;
                });
              }}
              onConfirm={(confirmed) => handleConfirmMapping(field.sourceField, confirmed)}
              onChangeMapping={(entity, targetField) => handleChangeMapping(field.sourceField, entity, targetField)}
              onIgnore={() => handleIgnoreField(field.sourceField)}
              getConfidenceColor={getConfidenceColor}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Campos no mapeados */}
      {analysis.unmappedFields.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Campos sin mapear ({analysis.unmappedFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {analysis.unmappedFields.map(field => (
                <Badge key={field} variant="outline" className="opacity-50">
                  {field}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Estos campos serán ignorados durante la migración
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resumen y acciones */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Calidad de datos:</span>
                <Badge variant="outline" className={cn(
                  "ml-2",
                  analysis.dataQualityScore >= 80 && "text-green-600",
                  analysis.dataQualityScore >= 50 && analysis.dataQualityScore < 80 && "text-amber-600",
                  analysis.dataQualityScore < 50 && "text-red-600"
                )}>
                  {analysis.dataQualityScore}%
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Tiempo estimado:</span>
                <span className="ml-2 font-medium">
                  ~{analysis.estimatedMigrationTime} min
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Atrás
              </Button>
              <Button 
                onClick={() => onMappingComplete(mappings)}
                disabled={confirmedCount < totalFields * 0.5}
              >
                <Zap className="mr-2 h-4 w-4" />
                Continuar ({confirmedCount}/{totalFields} confirmados)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Subcomponent for each field row
interface FieldMappingRowProps {
  field: FieldAnalysis;
  mapping?: MappingConfig;
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  onConfirm: (confirmed: boolean) => void;
  onChangeMapping: (entity: string, field: string) => void;
  onIgnore: () => void;
  getConfidenceColor: (confidence: number) => string;
}

function FieldMappingRow({
  field,
  mapping,
  isExpanded,
  onToggleExpand,
  onConfirm,
  onChangeMapping,
  onIgnore,
  getConfidenceColor
}: FieldMappingRowProps) {
  const hasIssues = field.warnings.length > 0 || field.suggestedMapping.confidence < 0.5;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <Card className={cn(
        "transition-all",
        mapping?.confirmed && "ring-2 ring-green-500",
        hasIssues && !mapping?.confirmed && "border-amber-300"
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Campo origen */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                  {field.sourceField}
                </code>
                <Badge variant="outline" className="text-xs">
                  {field.sourceType}
                </Badge>
                {field.warnings.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <ul className="text-xs space-y-1">
                          {field.warnings.map((w, i) => (
                            <li key={i}>⚠️ {w}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Ejemplos: {field.sampleValues.slice(0, 3).join(', ')}
              </p>
            </div>

            {/* Flecha */}
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            {/* Campo destino */}
            <div className="w-64">
              <Select
                value={mapping ? `${mapping.targetEntity}.${mapping.targetField}` : ''}
                onValueChange={(value) => {
                  const [entity, ...fieldParts] = value.split('.');
                  onChangeMapping(entity, fieldParts.join('.'));
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Seleccionar campo..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IP_NEXUS_FIELDS).map(([entity, fields]) => (
                    <div key={entity}>
                      <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                        {entity}
                      </div>
                      {fields.map(f => (
                        <SelectItem 
                          key={`${entity}.${f.name}`} 
                          value={`${entity}.${f.name}`}
                        >
                          {f.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confianza */}
            <Badge 
              variant="outline" 
              className={cn("w-16 justify-center", getConfidenceColor(field.suggestedMapping.confidence))}
            >
              {Math.round(field.suggestedMapping.confidence * 100)}%
            </Badge>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              {mapping && !mapping.confirmed && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => onConfirm(true)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={onIgnore}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}
              {mapping?.confirmed && (
                <Check className="h-5 w-5 text-green-600" />
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Razonamiento de la IA */}
              <div className="flex items-start gap-2 p-2 bg-muted rounded">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Razonamiento de la IA:</p>
                  <p className="text-muted-foreground">
                    {field.suggestedMapping.reasoning}
                  </p>
                </div>
              </div>

              {/* Alternativas */}
              {field.alternativeMappings.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2">Mapeos alternativos:</p>
                  <div className="flex flex-wrap gap-2">
                    {field.alternativeMappings.map((alt, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => onChangeMapping(alt.targetEntity, alt.targetField)}
                      >
                        {alt.targetEntity}.{alt.targetField}
                        <span className="ml-1 opacity-50">
                          ({Math.round(alt.confidence * 100)}%)
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Transformación */}
              {field.transformationRequired && field.suggestedTransformation && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/50 rounded">
                  <Settings2 className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Transformación requerida:
                    </p>
                    <p className="text-blue-600 dark:text-blue-300">
                      {field.suggestedTransformation.type}
                    </p>
                  </div>
                </div>
              )}

              {/* Valores de ejemplo expandidos */}
              <div>
                <p className="text-xs font-medium mb-1">Valores de ejemplo:</p>
                <div className="flex flex-wrap gap-1">
                  {field.sampleValues.map((val, i) => (
                    <code 
                      key={i} 
                      className="text-xs bg-muted px-1.5 py-0.5 rounded"
                    >
                      {val}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
