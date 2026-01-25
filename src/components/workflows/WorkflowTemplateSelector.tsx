import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileEdit, 
  Loader2,
  Zap
} from 'lucide-react';
import { useSystemWorkflowTemplates, useCreateFromTemplate, type WorkflowTemplateDB } from '@/hooks/workflow/useWorkflowTemplateSelector';
import { WorkflowTemplateCard } from './WorkflowTemplateCard';
import { WorkflowTemplatePreview } from './WorkflowTemplatePreview';
import { cn } from '@/lib/utils';

const CATEGORY_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'onboarding', label: 'Clientes' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'reminders', label: 'Recordatorios' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'billing', label: 'Facturación' },
];

// Popular templates by code
const POPULAR_TEMPLATES = [
  'WF_CLIENT_ONBOARDING',
  'WF_QUOTE_FOLLOWUP',
  'WF_TRADEMARK_RENEWAL',
];

interface WorkflowTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFromScratch?: () => void;
}

export function WorkflowTemplateSelector({
  open,
  onOpenChange,
  onCreateFromScratch
}: WorkflowTemplateSelectorProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplateDB | null>(null);
  
  const { data: templates = [], isLoading } = useSystemWorkflowTemplates({
    category: category === 'all' ? undefined : category,
    search: search || undefined
  });
  
  const createFromTemplate = useCreateFromTemplate();
  
  // Separate popular and other templates
  const { popularTemplates, otherTemplates } = useMemo(() => {
    const popular = templates.filter(t => POPULAR_TEMPLATES.includes(t.code));
    const other = templates.filter(t => !POPULAR_TEMPLATES.includes(t.code));
    return { popularTemplates: popular, otherTemplates: other };
  }, [templates]);
  
  const handleUseTemplate = async (template: WorkflowTemplateDB) => {
    try {
      const newWorkflow = await createFromTemplate.mutateAsync(template.code);
      onOpenChange(false);
      navigate(`/app/workflow/${newWorkflow.id}/edit`);
    } catch (error) {
      // Error handled in hook
    }
  };
  
  const handleCreateFromScratch = () => {
    onOpenChange(false);
    if (onCreateFromScratch) {
      onCreateFromScratch();
    } else {
      navigate('/app/workflow/new');
    }
  };
  
  const showPreview = !!previewTemplate;
  
  return (
    <>
      <Dialog open={open && !showPreview} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl">Crear Workflow</DialogTitle>
            <DialogDescription>
              Selecciona una plantilla o crea uno desde cero
            </DialogDescription>
          </DialogHeader>
          
          {/* Search & Filters */}
          <div className="space-y-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar plantilla..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
                {CATEGORY_TABS.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className={cn(
                      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                      "rounded-full px-4"
                    )}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          {/* Templates List */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No se encontraron plantillas</h3>
                <p className="text-muted-foreground text-sm">
                  Prueba con otros términos de búsqueda
                </p>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {/* Popular Templates */}
                {category === 'all' && !search && popularTemplates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Recomendadas
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {popularTemplates.map((template) => (
                        <WorkflowTemplateCard
                          key={template.id}
                          template={template}
                          isPopular
                          onSelect={handleUseTemplate}
                          onPreview={setPreviewTemplate}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other Templates */}
                {otherTemplates.length > 0 && (
                  <div>
                    {category === 'all' && !search && popularTemplates.length > 0 && (
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        Todas las plantillas
                      </h3>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {(category === 'all' && !search ? otherTemplates : templates).map((template) => (
                        <WorkflowTemplateCard
                          key={template.id}
                          template={template}
                          isPopular={POPULAR_TEMPLATES.includes(template.code)}
                          onSelect={handleUseTemplate}
                          onPreview={setPreviewTemplate}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer */}
          <div className="pt-4 border-t shrink-0">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleCreateFromScratch}
            >
              <FileEdit className="h-4 w-4" />
              Crear desde cero
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview Modal */}
      <WorkflowTemplatePreview
        open={showPreview}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
        onBack={() => setPreviewTemplate(null)}
      />
    </>
  );
}
