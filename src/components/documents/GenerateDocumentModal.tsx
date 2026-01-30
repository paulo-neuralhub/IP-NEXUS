/**
 * L104: Generate Document Modal - Enhanced Version
 * Professional document generation with PI-specific templates and A4 preview
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  FileText, Sparkles, Loader2, Download, Save, Eye, Pencil,
  FileSignature, AlertTriangle, Shield, RefreshCw, Award, Calculator,
  ArrowLeft, Receipt, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DocumentRichTextEditor } from './DocumentRichTextEditor';
import { DocumentA4Preview } from './DocumentA4Preview';

// ============================================================
// BUILT-IN DOCUMENT TEMPLATES FOR PI/LEGAL
// ============================================================

const BUILTIN_TEMPLATES = [
  {
    id: 'poder_representacion',
    name: 'Poder de representación',
    description: 'Autorización para actuar en nombre del cliente',
    icon: FileSignature,
    category: 'legal',
  },
  {
    id: 'carta_cese',
    name: 'Carta de cese y desistimiento',
    description: 'Requerimiento por infracción de derechos',
    icon: AlertTriangle,
    category: 'enforcement',
  },
  {
    id: 'informe_vigilancia',
    name: 'Informe de vigilancia',
    description: 'Resumen de marcas similares detectadas',
    icon: Eye,
    category: 'report',
  },
  {
    id: 'informe_estado',
    name: 'Informe de estado del expediente',
    description: 'Resumen actual para el cliente',
    icon: FileText,
    category: 'report',
  },
  {
    id: 'contestacion_oposicion',
    name: 'Contestación a oposición',
    description: 'Borrador de respuesta a oposición recibida',
    icon: Shield,
    category: 'legal',
  },
  {
    id: 'solicitud_renovacion',
    name: 'Solicitud de instrucciones renovación',
    description: 'Email al cliente solicitando instrucciones',
    icon: RefreshCw,
    category: 'communication',
  },
  {
    id: 'certificado_registro',
    name: 'Carta de confirmación de registro',
    description: 'Notificación al cliente de registro exitoso',
    icon: Award,
    category: 'communication',
  },
  {
    id: 'presupuesto',
    name: 'Presupuesto de servicios',
    description: 'Propuesta económica para el cliente',
    icon: Calculator,
    category: 'commercial',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  legal: 'bg-blue-100 text-blue-700',
  enforcement: 'bg-red-100 text-red-700',
  report: 'bg-amber-100 text-amber-700',
  communication: 'bg-green-100 text-green-700',
  commercial: 'bg-purple-100 text-purple-700',
};

// ============================================================
// COMPONENT
// ============================================================

interface GenerateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
  clientId?: string;
}

type Step = 'select' | 'generating' | 'preview';

export function GenerateDocumentModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  clientId,
}: GenerateDocumentModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentOrganization: organization } = useOrganization();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('select');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedTemplateId(null);
      setGeneratedContent('');
      setIsEditing(false);
    }
  }, [open]);

  // Fetch matter details
  const { data: matter } = useQuery({
    queryKey: ['matter-for-document', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('*, contacts:client_id(name, email, company_name)')
        .eq('id', matterId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!matterId,
  });

  // Fetch organization settings
  const { data: orgSettings } = useQuery({
    queryKey: ['org-settings-for-doc', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', organization?.id)
        .single();
      return data;
    },
    enabled: !!organization?.id,
  });

  // Get selected template
  const selectedTemplate = useMemo(
    () => BUILTIN_TEMPLATES.find((t) => t.id === selectedTemplateId),
    [selectedTemplateId]
  );

  // Build context for AI generation
  const documentContext = useMemo(() => {
    if (!matter) return {};
    const client = matter.contacts as { name?: string; email?: string; company_name?: string } | null;
    return {
      matter_reference: matter.reference || matterReference,
      matter_title: matter.title,
      matter_type: matter.ip_type,
      mark_name: matter.mark_name,
      jurisdiction: matter.jurisdiction,
      application_number: matter.application_number,
      registration_number: matter.registration_number,
      filing_date: matter.filing_date,
      registration_date: matter.registration_date,
      expiry_date: matter.expiry_date,
      nice_classes: matter.nice_classes,
      client_name: client?.name || client?.company_name || '',
      client_email: client?.email || '',
      organization_name: organization?.name || '',
      user_name: user?.email?.split('@')[0] || '',
      today: format(new Date(), 'dd/MM/yyyy'),
    };
  }, [matter, matterReference, organization, user]);

  // Generate document mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setStep('generating');
      const { data, error } = await supabase.functions.invoke('generate-document-ai', {
        body: {
          templateType: selectedTemplateId,
          matterId,
          context: documentContext,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content || data.html || '');
      setStep('preview');
    },
    onError: (error: Error) => {
      toast.error(`Error al generar: ${error.message}`);
      setStep('select');
    },
  });

  // Save document mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          organization_id: organization.id,
          template_id: null,
          matter_id: matterId,
          name: `${selectedTemplate?.name || 'Documento'} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
          content: generatedContent,
          variables_input: documentContext,
          status: 'draft',
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      queryClient.invalidateQueries({ queryKey: ['matter-documents'] });
      toast.success('Documento guardado en el expediente');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    generateMutation.mutate();
  };

  // Navigate to invoicing
  const handleCreateInvoice = () => {
    onOpenChange(false);
    navigate(`/app/invoicing/new?matter_id=${matterId}${clientId ? `&client_id=${clientId}` : ''}`);
  };

  // Export to PDF (placeholder - would use jspdf)
  const handleExportPDF = () => {
    toast.info('Exportación PDF en desarrollo');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {step === 'preview' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStep('select')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {step === 'select' && 'Generar documento'}
                {step === 'generating' && 'Generando documento...'}
                {step === 'preview' && (selectedTemplate?.name || 'Vista previa')}
              </DialogTitle>
              {matterReference && (
                <DialogDescription>Expediente: {matterReference}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Step: Select Template */}
        {step === 'select' && (
          <ScrollArea className="flex-1 px-6 py-4">
            {/* Invoice shortcut */}
            <Card
              className="p-4 mb-6 border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleCreateInvoice}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Crear factura para este expediente</h3>
                  <p className="text-sm text-muted-foreground">
                    Ir al módulo de facturación con los datos pre-rellenados
                  </p>
                </div>
                <Badge variant="outline">Facturación</Badge>
              </div>
            </Card>

            {/* Document templates */}
            <h3 className="font-medium mb-4">Documentos generados con IA</h3>
            <div className="grid grid-cols-2 gap-4">
              {BUILTIN_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Card
                    key={template.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={cn('mt-2 text-xs', CATEGORY_COLORS[template.category])}
                        >
                          {template.category}
                        </Badge>
                      </div>
                      <Sparkles className="h-4 w-4 text-primary/50" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Step: Generating */}
        {step === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="h-12 w-12 text-primary/30" />
              </div>
              <Sparkles className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-medium">Generando documento...</h3>
            <p className="text-sm text-muted-foreground">
              Analizando expediente y preparando contenido
            </p>
            <Spinner className="mt-4" />
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {isEditing ? 'Modo edición' : 'Vista previa'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {isEditing ? 'Editando' : 'Solo lectura'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Vista previa
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar en expediente
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {isEditing ? (
                <DocumentRichTextEditor
                  content={generatedContent}
                  onChange={setGeneratedContent}
                  className="h-full"
                />
              ) : (
              <DocumentA4Preview
                  content={generatedContent}
                  matterReference={matterReference}
                  organizationSettings={{
                    name: organization?.name,
                    logo_url: (orgSettings?.branding as Record<string, unknown>)?.logo_url as string | undefined,
                    address: (orgSettings?.general as Record<string, unknown>)?.address as string | undefined,
                    phone: (orgSettings?.general as Record<string, unknown>)?.phone as string | undefined,
                    email: (orgSettings?.email as Record<string, unknown>)?.sender_email as string | undefined,
                    legal_disclaimer: (orgSettings?.general as Record<string, unknown>)?.legal_disclaimer as string | undefined,
                  }}
                  className="h-full"
                />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
