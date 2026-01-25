// src/pages/app/settings/templates/[type].tsx
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SectionHeader } from '@/components/help/SectionHeader';
import { useDocumentTemplates, DocumentType, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useTemplatePreview } from '@/hooks/useTemplatePreview';
import { 
  ArrowLeft, Plus, Search, Star, Copy, Eye, Edit2, 
  Trash2, Check, Loader2, FileText, Receipt, FileCheck, Mail, BarChart3
} from 'lucide-react';

const TYPE_CONFIG: Record<DocumentType, { label: string; icon: React.ElementType; color: string }> = {
  invoice: { label: 'Facturas', icon: Receipt, color: 'text-finance' },
  quote: { label: 'Presupuestos', icon: FileText, color: 'text-primary' },
  certificate: { label: 'Certificados', icon: FileCheck, color: 'text-warning' },
  letter: { label: 'Cartas', icon: Mail, color: 'text-genius' },
  report: { label: 'Informes', icon: BarChart3, color: 'text-crm' },
};

export default function TemplateListPage() {
  const { type } = useParams<{ type: DocumentType }>();
  const navigate = useNavigate();
  const docType = type as DocumentType;
  const config = TYPE_CONFIG[docType];
  const Icon = config?.icon || FileText;

  const { 
    templates, 
    isLoading, 
    duplicateTemplate, 
    setDefaultTemplate, 
    deleteTemplate,
    isDuplicating,
  } = useDocumentTemplates(docType);

  const { generatePreview } = useTemplatePreview();
  
  const [search, setSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePreview = async (template: DocumentTemplate) => {
    setPreviewTitle(template.name);
    const html = await generatePreview(template.template_content);
    setPreviewContent(html);
    setPreviewOpen(true);
  };

  const handleDuplicate = async (templateId: string) => {
    const newTemplate = await duplicateTemplate(templateId);
    if (newTemplate) {
      navigate(`/app/settings/templates/${newTemplate.id}/edit`);
    }
  };

  const handleSetDefault = async (template: DocumentTemplate) => {
    await setDefaultTemplate(template.id, docType);
  };

  if (!config) {
    return <div>Tipo de plantilla no válido</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/settings/templates">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Icon className={`w-6 h-6 ${config.color}`} />
            <div>
              <h1 className="text-2xl font-bold">Plantillas de {config.label}</h1>
              <p className="text-sm text-muted-foreground">Gestiona las plantillas disponibles para este tipo de documento</p>
            </div>
          </div>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar plantillas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Icon className={`w-12 h-12 ${config.color} opacity-50 mb-4`} />
            <h3 className="font-medium mb-1">No hay plantillas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'No se encontraron plantillas con ese criterio' : 'No hay plantillas disponibles para este tipo'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center gap-4 py-4">
                {/* Thumbnail placeholder */}
                <div className="w-24 h-16 rounded border bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <div className="text-center">
                    <div className="w-16 h-10 border border-dashed border-muted-foreground/30 rounded-sm mx-auto flex flex-col items-center justify-center">
                      <div className="w-8 h-0.5 bg-muted-foreground/20 mb-1" />
                      <div className="w-12 h-0.5 bg-muted-foreground/20 mb-1" />
                      <div className="w-10 h-0.5 bg-muted-foreground/20" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{template.name}</h3>
                    {template.is_default && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        Por defecto
                      </Badge>
                    )}
                    {template.is_system_template && (
                      <Badge variant="outline" className="text-xs">Sistema</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {template.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Layout: {template.layout}</span>
                    <span>•</span>
                    <span>Usado {template.usage_count} veces</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <Link to={`/app/settings/templates/${template.id}/edit`}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDuplicate(template.id)}
                    disabled={isDuplicating}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>

                  {!template.is_default && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(template)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Por defecto
                    </Button>
                  )}

                  {!template.is_system_template && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista previa: {previewTitle}</DialogTitle>
          </DialogHeader>
          <div 
            className="bg-background border rounded-lg p-8 shadow-inner min-h-[600px]"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
