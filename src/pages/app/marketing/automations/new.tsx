/**
 * IP-NEXUS Marketing - New Automation Page
 * Template selection for creating automations
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Zap, HandMetal, CalendarClock, Bell, 
  Mail, Settings, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AUTOMATION_TEMPLATES, 
  AUTOMATION_CATEGORIES,
  type AutomationTemplate 
} from '@/lib/constants/automation-templates';
import { cn, generateUniqueId } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  onboarding: HandMetal,
  renewals: CalendarClock,
  alerts: Bell,
  'follow-up': Mail,
  custom: Settings,
};

export default function NewAutomationPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);

  const filteredTemplates = activeCategory === 'all'
    ? AUTOMATION_TEMPLATES
    : AUTOMATION_TEMPLATES.filter(t => t.category === activeCategory);

  const handleUseTemplate = (template: AutomationTemplate) => {
    // Store template in session storage for the editor to pick up
    const automationData = {
      name: template.name,
      description: template.description,
      trigger_type: template.trigger_type,
      trigger_config: template.trigger_config,
      actions: template.actions.map(action => ({
        ...action,
        id: generateUniqueId()
      }))
    };
    sessionStorage.setItem('automation_template', JSON.stringify(automationData));
    navigate('/app/marketing/automations/new/editor');
  };

  const handleStartFromScratch = () => {
    sessionStorage.removeItem('automation_template');
    navigate('/app/marketing/automations/new/editor');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/automations')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva Automatización</h1>
            <p className="text-muted-foreground">
              Elige una plantilla o empieza desde cero
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleStartFromScratch}>
          <Zap className="w-4 h-4 mr-2" />
          Empezar desde cero
        </Button>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          {Object.entries(AUTOMATION_CATEGORIES).map(([key, category]) => {
            const Icon = CATEGORY_ICONS[key] || Settings;
            return (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="w-4 h-4" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const category = AUTOMATION_CATEGORIES[template.category];
          const CategoryIcon = CATEGORY_ICONS[template.category] || Zap;
          const isSelected = selectedTemplate?.id === template.id;
          
          return (
            <Card 
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary border-primary'
              )}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${template.color}20` }}
                  >
                    <CategoryIcon 
                      className="w-5 h-5"
                      style={{ color: template.color }}
                    />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {category?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {template.actions.length} acción{template.actions.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                
                {/* Actions Preview */}
                <div className="mt-3 space-y-1">
                  {template.actions.slice(0, 3).map((action, idx) => (
                    <div 
                      key={idx} 
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                      {action.type === 'send_email' && 'Enviar email'}
                      {action.type === 'wait' && `Esperar ${action.config.duration} ${action.config.unit}`}
                      {action.type === 'add_tag' && `Añadir tag: ${action.config.tag}`}
                      {action.type === 'remove_tag' && `Quitar tag: ${action.config.tag}`}
                      {action.type === 'notify_team' && 'Notificar al equipo'}
                      {action.type === 'create_task' && 'Crear tarea'}
                      {action.type === 'condition' && 'Condición'}
                    </div>
                  ))}
                  {template.actions.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.actions.length - 3} más...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Bar */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{selectedTemplate.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedTemplate.actions.length} acciones configuradas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={() => handleUseTemplate(selectedTemplate)}>
              Usar esta plantilla
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
