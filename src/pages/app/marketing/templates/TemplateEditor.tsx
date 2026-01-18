import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmailTemplate } from '@/types/marketing';
import { useToast } from '@/hooks/use-toast';
import { useTemplate, useCreateTemplate, useUpdateTemplate } from '@/hooks/use-marketing';
import { useOrganization } from '@/contexts/organization-context';
import { EmailEditor } from '@/components/features/marketing/email-editor';
import { TEMPLATE_CATEGORIES, DEFAULT_EMAIL_SETTINGS } from '@/lib/constants/marketing';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { EmailEditorContent } from '@/types/marketing';

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const isNew = id === 'new';

  const { data: template, isLoading } = useTemplate(isNew ? undefined : id);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>('');
  const [previewText, setPreviewText] = useState('');
  const [content, setContent] = useState<EmailEditorContent>({
    blocks: [],
    settings: DEFAULT_EMAIL_SETTINGS
  });

  useEffect(() => {
    if (template && !isNew) {
      setName(template.name);
      setSubject(template.subject);
      setCategory(template.category || '');
      setPreviewText(template.preview_text || '');
      if (template.json_content) {
        setContent(template.json_content as EmailEditorContent);
      }
    }
  }, [template, isNew]);

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) {
      toast({
        title: 'Campos requeridos',
        description: 'Nombre y asunto son obligatorios',
        variant: 'destructive'
      });
      return;
    }

    if (!currentOrganization) return;

    const templateData: Partial<EmailTemplate> = {
      name,
      subject,
      category: (category || undefined) as EmailTemplate['category'],
      preview_text: previewText || undefined,
      json_content: content,
      html_content: '', // Will be generated on send
      organization_id: currentOrganization.id,
      owner_type: 'tenant' as const
    };

    try {
      if (isNew) {
        await createTemplate.mutateAsync(templateData);
        toast({ title: 'Plantilla creada exitosamente' });
      } else if (id) {
        await updateTemplate.mutateAsync({ id, data: templateData });
        toast({ title: 'Plantilla actualizada exitosamente' });
      }
      navigate('/app/marketing/templates');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la plantilla',
        variant: 'destructive'
      });
    }
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/templates')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'Nueva Plantilla' : 'Editar Plantilla'}
            </h1>
            <p className="text-muted-foreground">
              Diseña tu email con el editor visual
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>

      {/* Template Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la plantilla *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Newsletter Mensual"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Asunto del email *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ej: Novedades de enero"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="preview">Texto de previsualización</Label>
          <Input
            id="preview"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Texto que aparece en inbox..."
          />
        </div>
      </div>

      {/* Email Editor */}
      <EmailEditor
        initialContent={content}
        onChange={setContent}
      />
    </div>
  );
}
