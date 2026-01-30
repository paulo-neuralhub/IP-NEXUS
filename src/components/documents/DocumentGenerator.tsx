// ============================================================
// L111: Generador Principal de Documentos
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Printer, Save, Eye, Edit, Loader2, Receipt, ArrowRight, FileSignature, Mail, FileBarChart, Stamp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StyleSelector } from './StyleSelector';
import { DocumentEditor } from './DocumentEditor';
import { A4Preview } from './A4Preview';
import { DOCUMENT_STYLES, getCustomizedStyle } from '@/config/documentStyles';
import { 
  DocumentStyleCode, 
  DocumentTemplateConfig, 
  DocumentVariables, 
  TenantDocumentSettings 
} from '@/types/documents';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateDocumentPDF } from './pdf/generatePDF';
import { generateDemoVariables, replaceVariables } from '@/utils/documentDemoData';

interface DocumentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  matterId?: string;
  clientId?: string;
  initialTemplate?: DocumentTemplateConfig;
  initialVariables?: DocumentVariables;
}

// Template categories (WITHOUT invoices)
const TEMPLATE_CATEGORIES = [
  { code: 'contrato', name: 'Contratos', icon: FileSignature },
  { code: 'carta', name: 'Cartas', icon: Mail },
  { code: 'informe', name: 'Informes', icon: FileBarChart },
  { code: 'oficial', name: 'Documentos Oficiales', icon: Stamp },
];

export function DocumentGenerator({
  isOpen,
  onClose,
  matterId,
  clientId,
  initialTemplate,
  initialVariables = {},
}: DocumentGeneratorProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Estado
  const [activeTab, setActiveTab] = useState<'template' | 'style' | 'edit' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateConfig | null>(initialTemplate || null);
  const [selectedStyle, setSelectedStyle] = useState<DocumentStyleCode>('corporativo');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toLocaleDateString('es-ES'));
  const [variables, setVariables] = useState<DocumentVariables>(initialVariables);
  const [tenantSettings, setTenantSettings] = useState<TenantDocumentSettings | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplateConfig[]>([]);
  const [matterData, setMatterData] = useState<Record<string, unknown> | null>(null);
  const [clientData, setClientData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar configuración del tenant y plantillas
  useEffect(() => {
    if (isOpen) {
      loadTenantSettings();
      loadTemplates();
      loadMatterAndClientData();
      generateTempDocumentNumber();
    }
  }, [isOpen, matterId, clientId]);

  const loadTenantSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (membership?.organization_id) {
        const { data: settings } = await supabase
          .from('tenant_document_settings')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .single();
        
        if (settings) {
          setTenantSettings(transformSettings(settings));
          setSelectedStyle((settings.default_style_code as DocumentStyleCode) || 'corporativo');
        }
      }
    } catch (error) {
      console.error('Error loading tenant settings:', error);
    }
  };

  const loadMatterAndClientData = async () => {
    try {
      // Load matter data if matterId provided
      if (matterId) {
        const { data: matter } = await supabase
          .from('matters')
          .select('*')
          .eq('id', matterId)
          .single();
        
        if (matter) {
          setMatterData(matter as Record<string, unknown>);
          
          // If no clientId provided, get from matter
          const cId = clientId || matter.client_id;
          if (cId) {
            const { data: client } = await supabase
              .from('contacts')
              .select('*')
              .eq('id', cId)
              .single();
            
            if (client) {
              setClientData(client as Record<string, unknown>);
            }
          }
        }
      } else if (clientId) {
        // Load client data if only clientId provided
        const { data: client } = await supabase
          .from('contacts')
          .select('*')
          .eq('id', clientId)
          .single();
        
        if (client) {
          setClientData(client as Record<string, unknown>);
        }
      }
    } catch (error) {
      console.error('Error loading matter/client data:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .neq('category', 'factura') // Exclude invoices - they go to billing module
        .order('category', { ascending: true });
      
      if (data) {
        setTemplates(data.map(transformTemplate));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Generate a temporary document number (for preview before template selection)
  const generateTempDocumentNumber = () => {
    const prefix = tenantSettings?.invoiceSettings?.prefix || 'DOC';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setDocumentNumber(`${prefix}-${year}${month}-${random}`);
  };

  // Get the next document number from the database using RPC
  const getNextDocumentNumber = async (documentType: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!membership?.organization_id) {
        throw new Error('No organization found');
      }

      const { data, error } = await supabase.rpc('get_next_document_number', {
        p_organization_id: membership.organization_id,
        p_document_type: documentType || null,
        p_format: 'PREFIX-YYYY-SEQ' // Default format, will be customized from tenant settings
      });

      if (error) throw error;
      return data || `DOC-${Date.now()}`;
    } catch (error) {
      console.error('Error getting document number:', error);
      // Fallback: generate temporary number
      const date = new Date();
      return `DOC-${date.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    }
  };

  // Seleccionar plantilla - usar datos demo combinados con datos reales
  const handleSelectTemplate = async (template: DocumentTemplateConfig) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setSelectedStyle(template.preferredStyleCode);
    
    // Get sequential document number from database
    const docNumber = await getNextDocumentNumber(template.category);
    setDocumentNumber(docNumber);
    
    // Generate demo variables combined with real tenant/matter/client data
    const demoVars = generateDemoVariables(
      tenantSettings,
      matterData || undefined,
      clientData || undefined
    );
    
    // Add document number to variables
    demoVars.document_number = docNumber;
    
    // Merge with any initial variables passed as props
    const mergedVars = { ...demoVars, ...initialVariables };
    
    // Replace variables in the template content
    const processedContent = replaceVariables(template.contentHtml, mergedVars);
    setContent(processedContent);
    setVariables(mergedVars);
    
    setActiveTab('style');
  };

  // Guardar documento
  const handleSave = async (status: 'draft' | 'final' = 'draft') => {
    if (!content || !title) {
      toast({
        title: 'Error',
        description: 'El documento debe tener título y contenido',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('generated_documents')
        .insert({
          organization_id: membership?.organization_id || '',
          name: title,
          content: content,
          matter_id: matterId || null,
          client_id: clientId || null,
          template_id: selectedTemplate?.id || null,
          document_number: documentNumber,
          title,
          category: selectedTemplate?.category || 'carta',
          style_code: selectedStyle,
          content_html: content,
          status,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Documento guardado',
        description: `El documento se ha guardado como ${status === 'draft' ? 'borrador' : 'final'}`,
      });

      if (status === 'final') {
        onClose();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el documento',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Descargar PDF
  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const style = getCustomizedStyle(selectedStyle, tenantSettings || undefined);
      
      await generateDocumentPDF({
        content,
        title,
        documentNumber,
        documentDate,
        style,
        tenantSettings: tenantSettings || undefined,
      });

      toast({
        title: 'PDF descargado',
        description: 'El documento se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el PDF',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Imprimir
  const handlePrint = () => {
    window.print();
  };

  const currentStyle = getCustomizedStyle(selectedStyle, tenantSettings || undefined);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle>Generador de Documentos</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar borrador
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Descargar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel izquierdo - Configuración */}
          <div className="w-[400px] border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                <TabsTrigger value="template">Plantilla</TabsTrigger>
                <TabsTrigger value="style">Estilo</TabsTrigger>
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="preview">Vista</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="flex-1 m-0 p-4 overflow-auto">
                <div className="space-y-6">
                  <h3 className="font-medium">Seleccionar plantilla</h3>
                  
                  {/* Compact notice for invoices - NOT a big card */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50 text-sm">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-muted-foreground">¿Crear factura?</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 text-amber-700 dark:text-amber-400 hover:text-amber-800"
                      onClick={() => {
                        onClose();
                        navigate(matterId ? `/app/facturacion/nueva?matterId=${matterId}` : '/app/facturacion/nueva');
                      }}
                    >
                      Ir a Facturación
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>

                  {/* Templates by category (excluding invoices) */}
                  {TEMPLATE_CATEGORIES.map((category) => {
                    const categoryTemplates = templates.filter(
                      t => t.category === category.code && t.category !== 'factura'
                    );
                    if (categoryTemplates.length === 0) return null;
                    
                    const CategoryIcon = category.icon;
                    
                    return (
                      <div key={category.code}>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4" />
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {categoryTemplates.map((template) => (
                            <Card
                              key={template.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => handleSelectTemplate(template)}
                            >
                              <CardContent className="p-3">
                                <p className="font-medium text-sm">{template.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Fallback if no templates in categories */}
                  {templates.filter(t => t.category !== 'factura').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay plantillas disponibles
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="style" className="flex-1 m-0 p-4 overflow-auto">
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onSelectStyle={setSelectedStyle}
                  tenantColors={tenantSettings?.customColors}
                />
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Título del documento</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Contrato de Servicios"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Número de documento</Label>
                    <Input
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="edit" className="flex-1 m-0 p-4 overflow-auto">
                {content ? (
                  <DocumentEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Escribe el contenido del documento..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Selecciona una plantilla primero</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => setActiveTab('template')}
                    >
                      Ir a Plantillas
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-auto">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Vista previa con el estilo seleccionado. Los cambios se reflejan en tiempo real.
                  </p>
                  {content ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar contenido
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSave('final')}
                        disabled={isSaving}
                      >
                        Finalizar documento
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Selecciona una plantilla para ver la vista previa
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel derecho - Preview A4 */}
          <div className="flex-1 overflow-auto bg-muted/30">
            {content ? (
              <A4Preview
                ref={previewRef}
                content={content}
                style={currentStyle}
                tenantSettings={tenantSettings || undefined}
                title={title}
                documentNumber={documentNumber}
                documentDate={documentDate}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="font-medium text-muted-foreground mb-2">
                    Selecciona una plantilla
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    El documento completo aparecerá aquí con datos de ejemplo del tenant
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helpers para transformar datos de Supabase
function transformSettings(data: Record<string, unknown>): TenantDocumentSettings {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    defaultStyleCode: (data.default_style_code as DocumentStyleCode) || 'corporativo',
    logoUrl: data.logo_url as string | undefined,
    logoPosition: (data.logo_position as 'left' | 'center' | 'right') || 'left',
    logoMaxHeight: (data.logo_max_height as number) || 50,
    customColors: data.custom_primary_color ? {
      primary: data.custom_primary_color as string,
      secondary: data.custom_secondary_color as string,
      accent: data.custom_accent_color as string,
      background: data.custom_background_color as string,
      text: data.custom_text_color as string,
      border: '#e5e5e5',
    } : undefined,
    companyInfo: {
      name: (data.company_name as string) || '',
      address: data.company_address as string | undefined,
      city: data.company_city as string | undefined,
      postalCode: data.company_postal_code as string | undefined,
      country: data.company_country as string | undefined,
      phone: data.company_phone as string | undefined,
      email: data.company_email as string | undefined,
      website: data.company_website as string | undefined,
      cif: data.company_cif as string | undefined,
    },
    bankInfo: data.bank_name ? {
      name: data.bank_name as string,
      iban: data.bank_iban as string,
      swift: data.bank_swift as string | undefined,
      accountHolder: data.bank_account_holder as string,
    } : undefined,
    customTexts: {
      headerText: data.custom_header_text as string | undefined,
      footerText: data.custom_footer_text as string | undefined,
      confidentialityNotice: data.confidentiality_notice as string | undefined,
    },
    invoiceSettings: {
      taxRate: (data.default_tax_rate as number) || 21,
      paymentTerms: (data.default_payment_terms as string) || '30 días',
      prefix: (data.invoice_prefix as string) || 'DOC',
      nextNumber: (data.invoice_next_number as number) || 1,
    },
  };
}

function transformTemplate(data: Record<string, unknown>): DocumentTemplateConfig {
  return {
    id: data.id as string,
    organizationId: data.organization_id as string,
    code: data.code as string,
    name: data.name as string,
    description: data.description as string | undefined,
    category: data.category as DocumentTemplateConfig['category'],
    preferredStyleCode: (data.preferred_style_code as DocumentStyleCode) || 'corporativo',
    contentHtml: (data.content_html as string) || '',
    sections: (data.sections as DocumentTemplateConfig['sections']) || [],
    availableVariables: (data.available_variables as string[]) || [],
    isActive: data.is_active as boolean,
    isSystemTemplate: data.is_system_template as boolean,
  };
}
