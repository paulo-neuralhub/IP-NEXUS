import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  Loader2,
  Eye,
  Code
} from 'lucide-react';
import { useState } from 'react';
import { useEmailTemplateByCode, useEmailPreview } from '@/hooks/workflow/useEmailTemplates';

interface EmailTemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  onClose?: () => void;
}

export function EmailTemplatePreview({
  open,
  onOpenChange,
  code,
  onClose
}: EmailTemplatePreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');
  const [variables, setVariables] = useState<Record<string, string>>({});
  
  const { data: template, isLoading: loadingTemplate } = useEmailTemplateByCode(code);
  const { data: preview, isLoading: loadingPreview } = useEmailPreview(code, variables);
  
  const isLoading = loadingTemplate || loadingPreview;
  
  // Extract variable names from template
  const variableNames = template?.variables?.map((v: { name: string }) => v.name) || [];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle>{template?.name || 'Email Template'}</DialogTitle>
                {template && (
                  <Badge variant="outline" className="mt-1">
                    {template.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('preview')}
                className="gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant={viewMode === 'html' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('html')}
                className="gap-1"
              >
                <Code className="h-4 w-4" />
                HTML
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : template ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Variables Editor */}
            {variableNames.length > 0 && (
              <div className="shrink-0">
                <h4 className="text-sm font-medium mb-2">Variables de prueba</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {variableNames.slice(0, 4).map((name: string) => (
                    <div key={name} className="space-y-1">
                      <Label className="text-xs">{name}</Label>
                      <Input
                        placeholder={`{{${name}}}`}
                        value={variables[name] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [name]: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Separator />
            
            {/* Subject */}
            <div className="shrink-0">
              <Label className="text-xs text-muted-foreground">Asunto</Label>
              <p className="font-medium">{preview?.subject || template.subject}</p>
            </div>
            
            {/* Body */}
            <ScrollArea className="flex-1 border rounded-lg">
              {viewMode === 'preview' ? (
                <div 
                  className="p-4"
                  dangerouslySetInnerHTML={{ 
                    __html: preview?.body || template.html_content || template.body_html || '' 
                  }}
                />
              ) : (
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                  {template.html_content || template.body_html || ''}
                </pre>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No se encontró la plantilla
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-end pt-4 border-t shrink-0">
          <Button variant="outline" onClick={() => {
            if (onClose) onClose();
            else onOpenChange(false);
          }}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
