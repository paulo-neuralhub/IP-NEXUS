// ============================================================
// IP-NEXUS - DEADLINE RULES TAB
// Tab for managing deadline calculation rules
// ============================================================

import { useState } from 'react';
import { Plus, Lock, Pencil, Copy, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeadlineRuleConfigs,
  useDeleteDeadlineRuleConfig,
  useDuplicateDeadlineRule,
  type DeadlineRuleConfig,
} from '@/hooks/useDeadlineConfig';
import { DeadlineRuleModal } from './DeadlineRuleModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const MATTER_TYPES = [
  { value: 'trademark', label: 'Marcas' },
  { value: 'patent', label: 'Patentes' },
  { value: 'design', label: 'Diseños' },
  { value: 'utility_model', label: 'Modelos Utilidad' },
];

const JURISDICTIONS = [
  { value: 'ES', label: '🇪🇸 España' },
  { value: 'EU', label: '🇪🇺 EUIPO' },
  { value: 'US', label: '🇺🇸 USPTO' },
  { value: 'WIPO', label: '🌐 WIPO' },
  { value: 'GB', label: '🇬🇧 Reino Unido' },
];

export function DeadlineRulesTab() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DeadlineRuleConfig | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    jurisdiction: '',
    matterType: '',
    showSystem: true,
    showCustom: true,
  });
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    trademark: true,
    patent: true,
    design: false,
    utility_model: false,
  });

  const { data: rules, isLoading } = useDeadlineRuleConfigs({
    jurisdiction: filters.jurisdiction || undefined,
    matterType: filters.matterType || undefined,
    showSystem: filters.showSystem,
    showCustom: filters.showCustom,
  });
  const deleteRule = useDeleteDeadlineRuleConfig();
  const duplicateRule = useDuplicateDeadlineRule();

  // Group rules by matter type
  const groupedRules = (rules || []).reduce((acc, rule) => {
    const key = rule.matter_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(rule);
    return acc;
  }, {} as Record<string, DeadlineRuleConfig[]>);

  const handleEdit = (rule: DeadlineRuleConfig) => {
    setSelectedRule(rule);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setShowModal(true);
  };

  const handleDuplicate = (rule: DeadlineRuleConfig) => {
    duplicateRule.mutate({ ruleId: rule.id });
  };

  const handleDelete = (id: string) => {
    deleteRule.mutate(id, {
      onSuccess: () => setDeleteRuleId(null),
    });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatOffset = (days: number) => {
    if (days === 0) return 'Mismo día';
    const abs = Math.abs(days);
    const sign = days < 0 ? '-' : '+';
    if (abs >= 365 && abs % 365 === 0) return `${sign}${abs / 365} año${abs / 365 > 1 ? 's' : ''}`;
    if (abs >= 30 && abs % 30 === 0) return `${sign}${abs / 30} mes${abs / 30 > 1 ? 'es' : ''}`;
    return `${sign}${abs} día${abs > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reglas de Cálculo</h3>
          <p className="text-sm text-muted-foreground">
            Define cómo se calculan los plazos automáticamente
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              value={filters.matterType || '__all__'}
              onValueChange={(v) => setFilters(f => ({ ...f, matterType: v === '__all__' ? '' : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los tipos</SelectItem>
                {MATTER_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.jurisdiction || '__all__'}
              onValueChange={(v) => setFilters(f => ({ ...f, jurisdiction: v === '__all__' ? '' : v }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todas jurisdicciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas jurisdicciones</SelectItem>
                {JURISDICTIONS.map(j => (
                  <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-4 ml-auto">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.showSystem}
                  onCheckedChange={(c) => setFilters(f => ({ ...f, showSystem: !!c }))}
                />
                Reglas sistema
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.showCustom}
                  onCheckedChange={(c) => setFilters(f => ({ ...f, showCustom: !!c }))}
                />
                Personalizadas
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules by group */}
      <div className="space-y-4">
        {Object.entries(groupedRules).map(([matterType, typeRules]) => {
          const matterLabel = MATTER_TYPES.find(t => t.value === matterType)?.label || matterType;
          const isExpanded = expandedGroups[matterType] ?? true;

          return (
            <Collapsible key={matterType} open={isExpanded}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleGroup(matterType)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {matterLabel}
                        <Badge variant="secondary">{typeRules.length}</Badge>
                      </CardTitle>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Tipo de Plazo</TableHead>
                          <TableHead>Jurisdicción</TableHead>
                          <TableHead>Evento</TableHead>
                          <TableHead>Offset</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {rule.is_system ? (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Pencil className="h-4 w-4 text-primary" />
                                )}
                                <span className="font-medium">{rule.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {JURISDICTIONS.find(j => j.value === rule.jurisdiction)?.label || rule.jurisdiction}
                            </TableCell>
                            <TableCell className="capitalize">
                              {rule.event_type?.replace(/_/g, ' ') || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.days_from_event < 0 ? 'destructive' : 'default'}>
                                {formatOffset(rule.days_from_event)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.is_system ? 'secondary' : 'outline'}>
                                {rule.is_system ? 'Sistema' : 'Custom'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {rule.is_system ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDuplicate(rule)}
                                      title="Crear override"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(rule)}
                                      title="Ver detalle"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(rule)}
                                      title="Editar"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteRuleId(rule.id)}
                                      title="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {Object.keys(groupedRules).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No se encontraron reglas con los filtros seleccionados
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <DeadlineRuleModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteRuleId}
        onOpenChange={() => setDeleteRuleId(null)}
        title="Eliminar regla"
        description="¿Estás seguro de que quieres eliminar esta regla? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        onConfirm={() => deleteRuleId && handleDelete(deleteRuleId)}
        variant="destructive"
      />
    </div>
  );
}
