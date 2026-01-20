// ============================================================
// IP-NEXUS MARKETING - NEW TEMPLATE PAGE
// Permite seleccionar desde plantilla o crear en blanco
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, FileEdit, LayoutTemplate, Mail, Bell, FileText, 
  ShoppingBag, RefreshCw, UserPlus, PartyPopper, Loader2 
} from 'lucide-react';
import { EMAIL_TEMPLATE_PRESETS, blocksToHtml, type EmailTemplatePreset, type EmailBlock as PresetBlock } from '@/lib/constants/email-template-presets';
import { useCreateTemplate } from '@/hooks/use-marketing';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { EmailBlock } from '@/types/marketing';

const CATEGORY_ICONS: Record<string, any> = {
  newsletter: Mail,
  transactional: Bell,
  report: FileText,
  sales: ShoppingBag,
  reminder: RefreshCw,
  onboarding: UserPlus,
  celebration: PartyPopper,
};

export default function NewTemplate() {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const createTemplate = useCreateTemplate();
  const [selectedPreset, setSelectedPreset] = useState<EmailTemplatePreset | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreateBlank = () => {
    navigate('/app/marketing/templates/blank/edit');
  };

  const handleSelectPreset = (preset: EmailTemplatePreset) => {
    setSelectedPreset(preset);
    setShowPreview(true);
  };

  const handleCreateFromPreset = async () => {
    if (!selectedPreset || !currentOrganization) return;

    // Convert preset blocks to proper EmailBlock format
    const convertedBlocks: EmailBlock[] = selectedPreset.blocks.map((block, idx) => ({
      id: `block-${idx}-${Date.now()}`,
      type: block.type as EmailBlock['type'],
      content: {
        text: block.content || '',
        ...block.props
      },
      styles: {}
    }));

    try {
      const result = await createTemplate.mutateAsync({
        name: selectedPreset.name,
        subject: selectedPreset.subject,
        category: selectedPreset.category as any,
        preview_text: selectedPreset.previewText,
        json_content: {
          blocks: convertedBlocks,
          settings: {
            backgroundColor: '#F8FAFC',
            contentWidth: 600,
            fontFamily: 'Arial, sans-serif',
            linkColor: '#3B82F6',
          }
        },
        html_content: blocksToHtml(selectedPreset.blocks),
        organization_id: currentOrganization.id,
        owner_type: 'tenant',
      });
      
      toast.success('Plantilla creada desde preset');
      navigate(`/app/marketing/templates/${result.id}/edit`);
    } catch (error) {
      toast.error('Error al crear plantilla');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/marketing/templates')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Plantilla</h1>
          <p className="text-muted-foreground">
            Elige una plantilla prediseñada o comienza desde cero
          </p>
        </div>
      </div>

      {/* Start from scratch */}
      <Card 
        className="cursor-pointer hover:shadow-md transition-all border-dashed border-2 hover:border-primary"
        onClick={handleCreateBlank}
      >
        <CardContent className="flex items-center gap-4 p-6">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileEdit className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Empezar desde cero</h3>
            <p className="text-muted-foreground">
              Crea una plantilla personalizada con el editor visual
            </p>
          </div>
          <Button>Crear en blanco</Button>
        </CardContent>
      </Card>

      {/* Presets Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5" />
          Plantillas Prediseñadas para PI
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMAIL_TEMPLATE_PRESETS.map((preset) => {
            const Icon = CATEGORY_ICONS[preset.category] || Mail;
            return (
              <Card 
                key={preset.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                onClick={() => handleSelectPreset(preset)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{preset.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {preset.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {preset.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {preset.blocks.length} bloques
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedPreset?.name}</DialogTitle>
            <DialogDescription>{selectedPreset?.description}</DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto border rounded-lg bg-white p-4">
            <div className="text-sm text-muted-foreground mb-2">
              <strong>Asunto:</strong> {selectedPreset?.subject}
            </div>
            {selectedPreset && (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: blocksToHtml(selectedPreset.blocks) 
                }}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateFromPreset}
              disabled={createTemplate.isPending}
            >
              {createTemplate.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Usar esta plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
