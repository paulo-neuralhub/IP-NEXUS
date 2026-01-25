import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Mail, 
  CheckSquare, 
  Clock, 
  Zap,
  Loader2
} from 'lucide-react';
import { useWorkflowTemplatePreview } from '@/hooks/workflow/useWorkflowTemplateSelector';
import { WorkflowFlowPreview } from './WorkflowFlowPreview';
import type { WorkflowTemplateDB } from '@/hooks/workflow/useWorkflowTemplateSelector';

interface WorkflowTemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkflowTemplateDB | null;
  onUseTemplate: (template: WorkflowTemplateDB) => void;
  onBack: () => void;
}

export function WorkflowTemplatePreview({
  open,
  onOpenChange,
  template,
  onUseTemplate,
  onBack
}: WorkflowTemplatePreviewProps) {
  const { data: preview, isLoading } = useWorkflowTemplatePreview(template?.code);
  
  if (!template) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : preview ? (
            <div className="space-y-6 pb-4">
              {/* Stats */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  {preview.stepCount} pasos
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {preview.emailCount} emails
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {preview.taskCount} tareas
                </Badge>
                {preview.delayCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {preview.delayCount} esperas
                  </Badge>
                )}
              </div>
              
              <Separator />
              
              {/* Flow */}
              <div>
                <h3 className="text-sm font-semibold mb-4">Flujo del Workflow</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <WorkflowFlowPreview steps={preview.template.steps} />
                </div>
              </div>
              
              {/* Email Templates */}
              {preview.emailTemplates.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Emails Incluidos ({preview.emailTemplates.length})
                    </h3>
                    <div className="space-y-2">
                      {preview.emailTemplates.map((email) => (
                        <div 
                          key={email.code}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{email.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {email.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No se pudo cargar la vista previa
            </div>
          )}
        </ScrollArea>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={() => onUseTemplate(template)}>
            Usar esta plantilla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
