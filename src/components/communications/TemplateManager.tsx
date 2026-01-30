/**
 * Template Manager Component
 * Gestión completa de plantillas de WhatsApp y Email
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageCircle, 
  Mail, 
  Search,
  Plus,
  Eye,
  Copy,
  Sparkles,
  Users,
  Clock,
  FileText,
  Receipt,
  Scale,
  Bell,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Categorías con iconos y colores usando tokens del design system
const CATEGORIES = [
  { code: 'bienvenida', name: 'Bienvenida', icon: Users, color: 'text-primary bg-primary/10' },
  { code: 'seguimiento', name: 'Seguimiento', icon: Clock, color: 'text-secondary-foreground bg-secondary' },
  { code: 'plazos', name: 'Plazos', icon: Bell, color: 'text-warning bg-warning/10' },
  { code: 'facturacion', name: 'Facturación', icon: Receipt, color: 'text-success bg-success/10' },
  { code: 'legal', name: 'Legal', icon: Scale, color: 'text-destructive bg-destructive/10' },
  { code: 'notificaciones', name: 'Notificaciones', icon: FileText, color: 'text-muted-foreground bg-muted' },
];

interface Template {
  id: string;
  code: string;
  name: string;
  description: string | null;
  channel: 'whatsapp' | 'email' | 'sms';
  category: string;
  subject: string | null;
  content_text: string;
  content_html: string | null;
  variables: Array<{ name: string; label: string; required: boolean }>;
  is_system: boolean;
  is_active: boolean;
  usage_count: number;
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: Template) => void;
  selectionMode?: boolean;
}

export function TemplateManager({ onSelectTemplate, selectionMode = false }: TemplateManagerProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedChannel, selectedCategory, searchQuery]);

  const loadTemplates = async () => {
    try {
      // Use any cast to avoid TS overload issues with dynamic table names
      const client: any = supabase;
      const { data, error } = await client
        .from('communication_templates')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Parse variables if needed
      const parsed = (data || []).map((t: any) => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : 
          (typeof t.variables === 'string' ? JSON.parse(t.variables) : [])
      })) as Template[];
      
      setTemplates(parsed);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    if (selectedChannel !== 'all') {
      filtered = filtered.filter(t => t.channel === selectedChannel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      // Use any cast to avoid TS overload issues
      const client: any = supabase;
      const { data: profile } = await client
        .from('profiles')
        .select('organization_id')
        .single();

      const orgId = profile?.organization_id ?? null;

      const newTemplate = {
        code: `${template.code}_copy_${Date.now()}`,
        name: `${template.name} (copia)`,
        description: template.description,
        channel: template.channel,
        category: template.category,
        subject: template.subject,
        content_text: template.content_text,
        content_html: template.content_html,
        variables: template.variables,
        organization_id: orgId,
        is_system: false,
        is_active: true,
      };

      const { error } = await client
        .from('communication_templates')
        .insert(newTemplate);

      if (error) throw error;

      toast({
        title: 'Plantilla duplicada',
        description: 'Puedes editarla para personalizarla',
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo duplicar la plantilla',
        variant: 'destructive',
      });
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (selectionMode && onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      setSelectedTemplate(template);
      setShowPreview(true);
    }
  };

  const getCategoryInfo = (categoryCode: string) => {
    return CATEGORIES.find(c => c.code === categoryCode) || { 
      name: categoryCode, 
      icon: FileText, 
      color: 'text-muted-foreground bg-muted' 
    };
  };

  const whatsappCount = templates.filter(t => t.channel === 'whatsapp').length;
  const emailCount = templates.filter(t => t.channel === 'email').length;
  const customCount = templates.filter(t => !t.is_system).length;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedChannel} onValueChange={(v: 'all' | 'whatsapp' | 'email') => setSelectedChannel(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los canales</SelectItem>
            <SelectItem value="whatsapp">
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-success" />
                WhatsApp
              </span>
            </SelectItem>
            <SelectItem value="email">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.code} value={cat.code}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!selectionMode && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva plantilla
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{templates.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-success">{whatsappCount}</div>
          <div className="text-sm text-muted-foreground">WhatsApp</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary">{emailCount}</div>
          <div className="text-sm text-muted-foreground">Email</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-secondary-foreground">{customCount}</div>
          <div className="text-sm text-muted-foreground">Personalizadas</div>
        </Card>
      </div>

      {/* Lista de plantillas */}
      <ScrollArea className="h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Cargando plantillas...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No se encontraron plantillas
            </div>
          ) : (
            filteredTemplates.map(template => {
              const categoryInfo = getCategoryInfo(template.category);
              const CategoryIcon = categoryInfo.icon;

              return (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          template.channel === 'whatsapp' 
                            ? "bg-success/10 text-success" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {template.channel === 'whatsapp' ? (
                            <MessageCircle className="w-4 h-4" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                        </div>
                        <Badge variant="outline" className={cn("text-xs", categoryInfo.color)}>
                          {categoryInfo.name}
                        </Badge>
                      </div>

                      {template.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Sistema
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm mb-2 line-clamp-1">{template.name}</h3>

                    {/* Preview */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2rem]">
                      {template.description || template.content_text?.substring(0, 100)}...
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        {template.variables?.length || 0} variables
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTemplate(template);
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Modal de preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.channel === 'whatsapp' ? (
                <MessageCircle className="w-5 h-5 text-success" />
              ) : (
                <Mail className="w-5 h-5 text-primary" />
              )}
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Subject (solo email) */}
              {selectedTemplate?.subject && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Asunto:</p>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>
              )}

              {/* Preview del contenido */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                {selectedTemplate?.channel === 'whatsapp' ? (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="bg-success/20 rounded-lg p-3 max-w-[85%] ml-auto shadow-sm">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedTemplate?.content_text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border rounded-lg overflow-hidden bg-background"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedTemplate?.content_html || selectedTemplate?.content_text || '' 
                    }}
                  />
                )}
              </div>

              {/* Variables */}
              {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Variables disponibles:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((v, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono text-xs">
                        {`{{${v.name}}}`}
                        {v.required && <span className="text-destructive ml-1">*</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => selectedTemplate && duplicateTemplate(selectedTemplate)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Button>
            <Button onClick={() => {
              if (selectionMode && onSelectTemplate && selectedTemplate) {
                onSelectTemplate(selectedTemplate);
                setShowPreview(false);
              }
            }}>
              <Send className="w-4 h-4 mr-2" />
              Usar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
