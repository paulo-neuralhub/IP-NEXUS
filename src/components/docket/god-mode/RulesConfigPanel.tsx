import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Settings2,
  Globe,
  Loader2,
  Scale
} from 'lucide-react';
import { useJurisdictionRules, useDeleteJurisdictionRule } from '@/hooks/docket';
import { RULE_TYPES } from '@/lib/constants/docket-god-mode';
import type { JurisdictionRule } from '@/types/docket-god-mode';
import { cn } from '@/lib/utils';

export function RulesConfigPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>('all');

  const { data: rules = [], isLoading } = useJurisdictionRules({
    jurisdiction: jurisdictionFilter === 'all' ? undefined : jurisdictionFilter,
    ruleType: ruleTypeFilter === 'all' ? undefined : ruleTypeFilter,
  });

  const deleteRule = useDeleteJurisdictionRule();

  const filteredRules = rules.filter(rule => 
    !searchQuery || 
    rule.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Eliminar la regla "${name}"?`)) {
      deleteRule.mutate(id);
    }
  };

  // Get unique jurisdictions for filter
  const jurisdictions = [...new Set(rules.map(r => r.jurisdiction_code))].sort();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Reglas de Jurisdicción
          </CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reglas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Jurisdicción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {jurisdictions.map((j) => (
                <SelectItem key={j} value={j}>{j}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(RULE_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rules Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay reglas configuradas</p>
            <p className="text-sm">Crea reglas para automatizar el seguimiento de plazos</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regla</TableHead>
                  <TableHead>Jurisdicción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <RuleRow 
                    key={rule.id} 
                    rule={rule}
                    onDelete={() => handleDelete(rule.id, rule.rule_name)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>Total: {filteredRules.length} reglas</span>
          <span>Sistema: {filteredRules.filter(r => r.is_system).length} | Personalizadas: {filteredRules.filter(r => !r.is_system).length}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RuleRowProps {
  rule: JurisdictionRule;
  onDelete: () => void;
}

function RuleRow({ rule, onDelete }: RuleRowProps) {
  const ruleTypeConfig = RULE_TYPES[rule.rule_type as keyof typeof RULE_TYPES];

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-2">
            {rule.rule_name}
            {rule.is_system && (
              <Badge variant="outline" className="text-xs">Sistema</Badge>
            )}
          </div>
          {rule.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
              {rule.description}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className="gap-1">
          <Globe className="h-3 w-3" />
          {rule.jurisdiction_code}
        </Badge>
      </TableCell>

      <TableCell>
        <Badge variant="secondary">
          {ruleTypeConfig?.label || rule.rule_type}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          <span className="font-medium">{rule.base_days}</span>
          <span className="text-muted-foreground ml-1">
            {rule.business_days_only ? 'días hábiles' : 'días'}
          </span>
        </div>
        {rule.exclude_holidays && (
          <span className="text-xs text-muted-foreground">
            (excl. festivos)
          </span>
        )}
      </TableCell>

      <TableCell>
        {rule.is_system ? (
          <span className="text-xs text-muted-foreground">Sistema</span>
        ) : (
          <span className="text-xs text-primary">Personalizada</span>
        )}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            {!rule.is_system && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
