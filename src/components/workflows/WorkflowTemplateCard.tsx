import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Mail, 
  Clock, 
  CheckSquare, 
  Star,
  Zap,
  RefreshCw,
  AlertTriangle,
  UserPlus,
  FileText,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkflowTemplateDB } from '@/hooks/workflow/useWorkflowTemplateSelector';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'user-plus': UserPlus,
  'refresh-cw': RefreshCw,
  'file-text': FileText,
  'file-check': FileText,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertTriangle,
  'target': Target,
  'award': Award,
  'zap': Zap,
  'clock': Clock,
};

const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  onboarding: { label: 'Clientes', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  marketing: { label: 'Marketing', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  reminders: { label: 'Recordatorios', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  operations: { label: 'Operaciones', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  billing: { label: 'Facturación', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  sales: { label: 'Ventas', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

interface WorkflowTemplateCardProps {
  template: WorkflowTemplateDB;
  isPopular?: boolean;
  onSelect: (template: WorkflowTemplateDB) => void;
  onPreview?: (template: WorkflowTemplateDB) => void;
}

export function WorkflowTemplateCard({ 
  template, 
  isPopular = false,
  onSelect, 
  onPreview 
}: WorkflowTemplateCardProps) {
  const IconComponent = ICON_MAP[template.icon || ''] || Zap;
  const categoryInfo = CATEGORY_INFO[template.category] || { label: template.category, color: 'bg-gray-100 text-gray-700' };
  const iconColor = COLOR_MAP[template.color || 'blue'] || COLOR_MAP.blue;
  
  // Count step types
  const steps = template.steps || [];
  const emailCount = steps.filter(s => s.type === 'send_email').length;
  const taskCount = steps.filter(s => s.type === 'create_task').length;
  
  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all cursor-pointer border-border/60",
        "hover:border-primary/30"
      )}
      onClick={() => onPreview?.(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={cn("p-2.5 rounded-lg", iconColor)}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            {isPopular && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Popular
              </Badge>
            )}
            <Badge variant="outline" className={categoryInfo.color}>
              {categoryInfo.label}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {emailCount > 0 && (
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {emailCount} emails
            </span>
          )}
          {taskCount > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {taskCount} tareas
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {steps.length} pasos
          </span>
        </div>
        
        {/* Action */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(template);
          }}
        >
          Usar plantilla
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
