import { 
  Mail, 
  Clock, 
  CheckSquare, 
  Bell,
  Zap,
  GitBranch,
  Flag,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowStep } from '@/hooks/workflow/useWorkflowTemplateSelector';

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'trigger': Zap,
  'send_email': Mail,
  'send_notification': Bell,
  'create_task': CheckSquare,
  'delay': Clock,
  'condition': GitBranch,
  'end': Flag,
};

const STEP_COLORS: Record<string, string> = {
  'trigger': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  'send_email': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  'send_notification': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  'create_task': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  'delay': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'condition': 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  'end': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

interface WorkflowFlowPreviewProps {
  steps: WorkflowStep[];
  compact?: boolean;
}

export function WorkflowFlowPreview({ steps, compact = false }: WorkflowFlowPreviewProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No hay pasos definidos
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", compact && "max-h-[300px] overflow-y-auto pr-2")}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.type] || Zap;
        const colorClass = STEP_COLORS[step.type] || STEP_COLORS.trigger;
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id || index}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 py-1">
                <p className="text-sm font-medium truncate">
                  {step.name}
                </p>
                {step.config && !compact && (
                  <StepConfigPreview step={step} />
                )}
              </div>
            </div>
            
            {/* Connector */}
            {!isLast && (
              <div className="flex items-center justify-start pl-4 py-0.5">
                <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
            
            {/* Branches for conditions */}
            {step.type === 'condition' && step.branches && !compact && (
              <div className="ml-8 mt-1 pl-4 border-l-2 border-dashed border-muted space-y-1">
                {step.branches.yes && (
                  <div className="text-xs text-muted-foreground">
                    <span className="text-green-600 font-medium">Sí</span> → {step.branches.yes}
                  </div>
                )}
                {step.branches.no && (
                  <div className="text-xs text-muted-foreground">
                    <span className="text-red-600 font-medium">No</span> → {step.branches.no}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepConfigPreview({ step }: { step: WorkflowStep }) {
  const config = step.config;
  if (!config) return null;
  
  let description = '';
  
  switch (step.type) {
    case 'delay':
      description = `Esperar ${config.value} ${config.unit === 'days' ? 'días' : config.unit === 'hours' ? 'horas' : 'minutos'}`;
      break;
    case 'send_email':
      description = config.email_template_code || '';
      break;
    case 'create_task':
      description = config.title || '';
      break;
    case 'send_notification':
      description = config.title || '';
      break;
    case 'condition':
      description = `${config.field} ${config.operator} ${String(config.value || '')}`;
      break;
    default:
      return null;
  }
  
  if (!description) return null;
  
  return (
    <p className="text-xs text-muted-foreground truncate mt-0.5">
      {description}
    </p>
  );
}
