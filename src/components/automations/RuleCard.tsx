// ============================================================
// IP-NEXUS - RULE CARD COMPONENT
// Displays a single automation rule with actions
// ============================================================

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit, 
  Copy, 
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  Mail,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { AutomationRule, useToggleAutomationRule, useCloneAutomationRule } from '@/hooks/useAutomationRules';
import { VerificationBadge } from './VerificationBadge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RuleCardProps {
  rule: AutomationRule;
  legalDeadline?: {
    legal_basis: string | null;
    last_verified_at: string | null;
    source_url: string | null;
  };
}

const RULE_TYPE_CONFIG = {
  deadline: { icon: Clock, label: 'Crear plazo', color: 'text-blue-600' },
  notification: { icon: Bell, label: 'Notificación', color: 'text-amber-600' },
  task: { icon: ClipboardList, label: 'Crear tarea', color: 'text-green-600' },
  email: { icon: Mail, label: 'Enviar email', color: 'text-purple-600' },
  field_update: { icon: Zap, label: 'Actualizar', color: 'text-cyan-600' },
};

export function RuleCard({ rule, legalDeadline }: RuleCardProps) {
  const toggleRule = useToggleAutomationRule();
  const cloneRule = useCloneAutomationRule();

  const typeConfig = RULE_TYPE_CONFIG[rule.rule_type as keyof typeof RULE_TYPE_CONFIG] || RULE_TYPE_CONFIG.deadline;
  const TypeIcon = typeConfig.icon;

  // Extract office from conditions
  const conditions = rule.conditions as Record<string, unknown> | null;
  const offices = conditions?.offices as string[] | undefined;
  const officeBadge = offices?.join(', ') || 'General';

  // Get trigger description
  const getTriggerDescription = () => {
    const config = rule.trigger_config as Record<string, unknown> | null;
    
    if (rule.trigger_type === 'event') {
      if (rule.trigger_event === 'matter_status_changed') {
        const newStatus = config?.new_status as string;
        return `Cuando: Estado cambia a "${newStatus || 'cualquiera'}"`;
      }
      if (rule.trigger_event === 'notification_received') {
        const type = config?.notification_type as string;
        return `Cuando: Se recibe notificación "${type || 'cualquiera'}"`;
      }
      return `Cuando: ${rule.trigger_event}`;
    }
    
    if (rule.trigger_type === 'deadline_approaching') {
      const daysBefore = config?.days_before as number;
      if (daysBefore) {
        return `Cuando: ${daysBefore} días antes de vencimiento`;
      }
      const years = config?.years as number;
      const months = config?.months as number;
      if (years || months) {
        return `Cuando: Aniversario ${years ? `${years} años` : ''} ${months ? `${months} meses` : ''}`;
      }
    }

    return `Trigger: ${rule.trigger_type}`;
  };

  // Get action description
  const getActionDescription = () => {
    const deadlineConfig = rule.deadline_config as Record<string, unknown> | null;
    
    if (rule.rule_type === 'deadline' && deadlineConfig) {
      const notifyDays = deadlineConfig.notify_before_days as number[];
      const autoTask = deadlineConfig.auto_create_task as boolean;
      
      let desc = `Acción: Crear plazo`;
      if (notifyDays?.length) {
        desc += ` (avisos: ${notifyDays.join(', ')} días)`;
      }
      if (autoTask) {
        desc += ' + tarea';
      }
      return desc;
    }

    return `Acción: ${typeConfig.label}`;
  };

  const handleToggle = () => {
    toggleRule.mutate({ id: rule.id, isActive: !rule.is_active });
  };

  const handleClone = () => {
    cloneRule.mutate(rule.id);
  };

  return (
    <Card className={cn(
      "transition-all",
      !rule.is_active && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Toggle */}
          <div className="pt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      checked={rule.is_active || false}
                      onCheckedChange={handleToggle}
                      disabled={toggleRule.isPending}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {rule.is_active ? 'Desactivar regla' : 'Activar regla'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{rule.name}</h3>
              <Badge variant="outline" className="shrink-0">
                {officeBadge}
              </Badge>
              {rule.is_system_rule && (
                <Badge variant="secondary" className="shrink-0">Sistema</Badge>
              )}
              {rule.is_customized && (
                <Badge variant="default" className="shrink-0">Personalizado</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {getTriggerDescription()}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {getActionDescription()}
            </p>

            {/* Legal basis info */}
            {legalDeadline?.legal_basis && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Basado en: {legalDeadline.legal_basis}</span>
                {legalDeadline.last_verified_at && (
                  <VerificationBadge date={legalDeadline.last_verified_at} />
                )}
                {legalDeadline.source_url && (
                  <a
                    href={legalDeadline.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Execution stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Ejecutada: {rule.execution_count || 0} veces
              </span>
              {rule.last_executed_at && (
                <span>
                  Última: {format(new Date(rule.last_executed_at), "d MMM yyyy", { locale: es })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {rule.is_system_rule ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClone}
                      disabled={cloneRule.isPending}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Crear copia personalizada</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar regla</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
