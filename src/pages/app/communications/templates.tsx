import { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  MessageCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  FileText,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useEmailTemplates,
  useWhatsAppTemplates,
  useDeleteEmailTemplate,
  useDeleteWhatsAppTemplate,
  useDuplicateEmailTemplate,
  EmailTemplate,
  WhatsAppTemplate,
  TEMPLATE_CATEGORIES,
} from '@/hooks/communications/useTemplates';
import { EmailTemplateEditor } from '@/components/communications/EmailTemplateEditor';
import { WhatsAppTemplateEditor } from '@/components/communications/WhatsAppTemplateEditor';
import { TemplatePreviewDialog } from '@/components/communications/TemplatePreviewDialog';
import { cn } from '@/lib/utils';

export default function CommunicationsTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [isEmailEditorOpen, setIsEmailEditorOpen] = useState(false);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<EmailTemplate | null>(null);
  
  const [isWhatsAppEditorOpen, setIsWhatsAppEditorOpen] = useState(false);
  const [editingWhatsAppTemplate, setEditingWhatsAppTemplate] = useState<WhatsAppTemplate | null>(null);
  
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | WhatsAppTemplate | null>(null);
  const [previewType, setPreviewType] = useState<'email' | 'whatsapp'>('email');

  // Queries
  const { data: emailTemplates, isLoading: loadingEmail, refetch: refetchEmail } = useEmailTemplates({
    category: filterCategory === 'all' ? undefined : filterCategory,
    search: searchQuery || undefined,
  });
  
  const { data: whatsAppTemplates, isLoading: loadingWhatsApp, refetch: refetchWhatsApp } = useWhatsAppTemplates({
    category: filterCategory === 'all' ? undefined : filterCategory,
  });

  // Mutations
  const deleteEmail = useDeleteEmailTemplate();
  const deleteWhatsApp = useDeleteWhatsAppTemplate();
  const duplicateEmail = useDuplicateEmailTemplate();

  // Filtered WhatsApp templates (client-side search)
  const filteredWhatsAppTemplates = whatsAppTemplates?.filter(t => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
  });

  const handleCreateEmail = () => {
    setEditingEmailTemplate(null);
    setIsEmailEditorOpen(true);
  };

  const handleEditEmail = (template: EmailTemplate) => {
    if (template.is_system) {
      duplicateEmail.mutate(template);
    } else {
      setEditingEmailTemplate(template);
      setIsEmailEditorOpen(true);
    }
  };

  const handleCreateWhatsApp = () => {
    setEditingWhatsAppTemplate(null);
    setIsWhatsAppEditorOpen(true);
  };

  const handleEditWhatsApp = (template: WhatsAppTemplate) => {
    setEditingWhatsAppTemplate(template);
    setIsWhatsAppEditorOpen(true);
  };

  const handlePreview = (template: EmailTemplate | WhatsAppTemplate, type: 'email' | 'whatsapp') => {
    setPreviewTemplate(template);
    setPreviewType(type);
  };

  const handleRefresh = () => {
    if (activeTab === 'email') {
      refetchEmail();
    } else {
      refetchWhatsApp();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Plantillas de Mensajes</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona plantillas reutilizables para emails y WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          {activeTab === 'email' ? (
            <Button size="sm" onClick={handleCreateEmail}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva plantilla
            </Button>
          ) : (
            <Button size="sm" onClick={handleCreateWhatsApp} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva plantilla
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'whatsapp')}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
              <Badge variant="secondary" className="ml-1">
                {emailTemplates?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
              <Badge variant="secondary" className="ml-1">
                {whatsAppTemplates?.length || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {TEMPLATE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email Templates */}
        <TabsContent value="email" className="mt-6">
          {loadingEmail ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : emailTemplates && emailTemplates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emailTemplates.map(template => (
                <EmailTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEditEmail(template)}
                  onDelete={() => deleteEmail.mutate(template.id)}
                  onDuplicate={() => duplicateEmail.mutate(template)}
                  onPreview={() => handlePreview(template, 'email')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No hay plantillas de email</p>
              <Button onClick={handleCreateEmail}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera plantilla
              </Button>
            </div>
          )}
        </TabsContent>

        {/* WhatsApp Templates */}
        <TabsContent value="whatsapp" className="mt-6">
          {loadingWhatsApp ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWhatsAppTemplates && filteredWhatsAppTemplates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWhatsAppTemplates.map(template => (
                <WhatsAppTemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => handleEditWhatsApp(template)}
                  onDelete={() => deleteWhatsApp.mutate(template.id)}
                  onPreview={() => handlePreview(template, 'whatsapp')}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No hay plantillas de WhatsApp</p>
              <Button onClick={handleCreateWhatsApp} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear primera plantilla
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Editors */}
      <EmailTemplateEditor
        open={isEmailEditorOpen}
        onOpenChange={setIsEmailEditorOpen}
        template={editingEmailTemplate}
      />

      <WhatsAppTemplateEditor
        open={isWhatsAppEditorOpen}
        onOpenChange={setIsWhatsAppEditorOpen}
        template={editingWhatsAppTemplate}
      />

      {/* Preview */}
      <TemplatePreviewDialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        template={previewTemplate}
        type={previewType}
      />
    </div>
  );
}

// =============================================
// Email Template Card
// =============================================

interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
}

function EmailTemplateCard({ template, onEdit, onDelete, onDuplicate, onPreview }: EmailTemplateCardProps) {
  const category = TEMPLATE_CATEGORIES.find(c => c.value === template.category);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm line-clamp-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{template.code}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Vista previa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                {template.is_system ? (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar y editar
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              {!template.is_system && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject */}
        <p className="text-sm font-medium mb-2 line-clamp-1">{template.subject}</p>

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.body_html?.replace(/<[^>]*>/g, '').substring(0, 100) || template.body_text?.substring(0, 100)}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {category && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.label}
              </Badge>
            )}
            {template.is_system && (
              <Badge variant="secondary" className="text-xs">Sistema</Badge>
            )}
          </div>
          {(template.usage_count ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground">
              Usado {template.usage_count}x
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// WhatsApp Template Card
// =============================================

interface WhatsAppTemplateCardProps {
  template: WhatsAppTemplate;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

function WhatsAppTemplateCard({ template, onEdit, onDelete, onPreview }: WhatsAppTemplateCardProps) {
  const category = TEMPLATE_CATEGORIES.find(c => c.value === template.category);

  const statusConfig = {
    approved: { icon: CheckCircle, color: 'text-green-500', label: 'Aprobado' },
    pending: { icon: Clock, color: 'text-amber-500', label: 'Pendiente' },
    rejected: { icon: XCircle, color: 'text-red-500', label: 'Rechazado' },
  };

  const status = statusConfig[template.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm line-clamp-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{template.wa_template_name}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="w-4 h-4 mr-2" />
                Vista previa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {template.body_text}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {category && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: category.color, color: category.color }}
              >
                {category.label}
              </Badge>
            )}
            {template.language && (
              <Badge variant="secondary" className="text-xs uppercase">
                {template.language}
              </Badge>
            )}
          </div>
          <div className={cn("flex items-center gap-1 text-xs", status.color)}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
