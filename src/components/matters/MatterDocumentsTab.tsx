/**
 * MatterDocumentsTab - Enhanced document tab with template generator
 * Includes inline document generator with categorized templates
 */

import { useState, useEffect } from 'react';
import { 
  FileText, Download, Trash2, Eye, Plus, File, Sparkles, 
  ExternalLink, Loader2, FileSignature, Mail, FileBarChart, 
  Stamp, Receipt, Scale, Building2, FolderOpen, ChevronRight,
  Upload, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMatterDocuments, useDeleteMatterDocument } from '@/hooks/use-matter-documents';
import { DocumentUploader } from '@/components/features/documents/DocumentUploader';
import { DocumentGenerator } from '@/components/documents/DocumentGenerator';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PreviewDoc {
  id: string;
  name: string;
  file_path: string;
  mime_type?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  application: { label: 'Solicitud', color: 'text-blue-700', bg: 'bg-blue-50' },
  certificate: { label: 'Certificado', color: 'text-green-700', bg: 'bg-green-50' },
  correspondence: { label: 'Correspondencia', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  invoice: { label: 'Factura', color: 'text-purple-700', bg: 'bg-purple-50' },
  report: { label: 'Informe', color: 'text-orange-700', bg: 'bg-orange-50' },
  contrato: { label: 'Contrato', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  carta: { label: 'Carta', color: 'text-cyan-700', bg: 'bg-cyan-50' },
  poder: { label: 'Poder', color: 'text-violet-700', bg: 'bg-violet-50' },
  oficial: { label: 'Oficial', color: 'text-slate-700', bg: 'bg-slate-100' },
  other: { label: 'Otro', color: 'text-gray-700', bg: 'bg-gray-50' },
};

// Template categories with icons and templates
const TEMPLATE_CATEGORIES = [
  {
    id: 'solicitudes',
    name: '📋 Solicitudes',
    icon: FileText,
    color: '#3b82f6',
    templates: [
      { id: 'sol_marca', name: 'Solicitud de marca', desc: 'Formulario de solicitud de registro de marca' },
      { id: 'sol_patente', name: 'Solicitud de patente', desc: 'Formulario de solicitud de patente de invención' },
      { id: 'sol_diseno', name: 'Solicitud de diseño', desc: 'Formulario de registro de diseño industrial' },
      { id: 'sol_modelo', name: 'Solicitud modelo utilidad', desc: 'Formulario de modelo de utilidad' },
    ]
  },
  {
    id: 'poderes',
    name: '📝 Poderes',
    icon: FileSignature,
    color: '#8b5cf6',
    templates: [
      { id: 'poder_rep', name: 'Poder de representación', desc: 'Poder general para actuar en nombre del cliente' },
      { id: 'poder_oepm', name: 'Poder especial OEPM', desc: 'Poder específico para trámites ante la OEPM' },
      { id: 'poder_euipo', name: 'Poder EUIPO', desc: 'Poder de representación ante la EUIPO' },
      { id: 'poder_wipo', name: 'Poder WIPO', desc: 'Poder para procedimientos internacionales WIPO' },
    ]
  },
  {
    id: 'informes',
    name: '📊 Informes',
    icon: FileBarChart,
    color: '#f59e0b',
    templates: [
      { id: 'inf_viabilidad', name: 'Informe de viabilidad', desc: 'Análisis previo de viabilidad del registro' },
      { id: 'inf_busqueda', name: 'Informe de búsqueda', desc: 'Resultado de búsqueda de anterioridades' },
      { id: 'inf_vigilancia', name: 'Informe de vigilancia', desc: 'Informe periódico de vigilancia de marcas' },
      { id: 'inf_riesgo', name: 'Análisis de riesgo', desc: 'Evaluación de riesgos legales' },
    ]
  },
  {
    id: 'presupuestos',
    name: '💰 Presupuestos',
    icon: Receipt,
    color: '#10b981',
    templates: [
      { id: 'pres_estandar', name: 'Presupuesto estándar', desc: 'Presupuesto simplificado para servicios' },
      { id: 'pres_detallado', name: 'Presupuesto detallado', desc: 'Presupuesto con desglose completo' },
      { id: 'factura_proforma', name: 'Factura pro-forma', desc: 'Documento previo a la factura oficial' },
    ]
  },
  {
    id: 'comunicaciones',
    name: '📨 Comunicaciones',
    icon: Mail,
    color: '#06b6d4',
    templates: [
      { id: 'carta_cliente', name: 'Carta al cliente', desc: 'Comunicación formal al cliente' },
      { id: 'resp_oficial', name: 'Respuesta oficial', desc: 'Respuesta a requerimiento de oficina' },
      { id: 'escrito_alegaciones', name: 'Escrito de alegaciones', desc: 'Alegaciones en procedimiento' },
      { id: 'escrito_oposicion', name: 'Escrito de oposición', desc: 'Oposición contra registro de tercero' },
    ]
  },
  {
    id: 'legal',
    name: '⚖️ Legal',
    icon: Scale,
    color: '#ef4444',
    templates: [
      { id: 'contrato_licencia', name: 'Contrato de licencia', desc: 'Licencia de uso de marca o patente' },
      { id: 'contrato_cesion', name: 'Contrato de cesión', desc: 'Cesión de derechos de PI' },
      { id: 'acuerdo_coexistencia', name: 'Acuerdo de coexistencia', desc: 'Acuerdo entre titulares de marcas' },
      { id: 'carta_cese', name: 'Carta de cese', desc: 'Requerimiento de cese de uso' },
    ]
  },
  {
    id: 'oficiales',
    name: '🏛️ Oficiales',
    icon: Stamp,
    color: '#64748b',
    templates: [
      { id: 'escrito_oepm', name: 'Escrito a OEPM', desc: 'Comunicación oficial a la OEPM' },
      { id: 'escrito_euipo', name: 'Escrito a EUIPO', desc: 'Comunicación oficial a la EUIPO' },
      { id: 'escrito_wipo', name: 'Escrito a WIPO', desc: 'Comunicación oficial a la WIPO' },
      { id: 'resp_requerimiento', name: 'Respuesta a requerimiento', desc: 'Respuesta a requerimiento oficial' },
    ]
  },
  {
    id: 'otros',
    name: '📄 Otros',
    icon: FolderOpen,
    color: '#94a3b8',
    templates: [
      { id: 'certificado', name: 'Certificado', desc: 'Certificado de registro o estado' },
      { id: 'declaracion_jurada', name: 'Declaración jurada', desc: 'Declaración bajo juramento' },
      { id: 'acta_notarial', name: 'Acta notarial', desc: 'Documento notarial' },
      { id: 'plantilla_custom', name: 'Plantilla personalizada', desc: 'Crear documento desde cero' },
    ]
  },
];

interface MatterDocumentsTabProps {
  matterId: string;
  matterReference?: string;
  clientId?: string;
  matterData?: Record<string, unknown>;
  clientData?: Record<string, unknown>;
}

export function MatterDocumentsTab({ 
  matterId, 
  matterReference, 
  clientId,
  matterData,
  clientData 
}: MatterDocumentsTabProps) {
  const [showUploader, setShowUploader] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);
  const [selectedTemplateForGenerator, setSelectedTemplateForGenerator] = useState<{ id: string; name: string; category: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<any[]>([]);
  const [isLoadingGenerated, setIsLoadingGenerated] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState('solicitudes');
  const { toast } = useToast();
  
  // Uploaded documents
  const { data: uploadedDocuments, isLoading: isLoadingUploaded } = useMatterDocuments(matterId);
  const deleteDoc = useDeleteMatterDocument();

  // Load generated documents
  useEffect(() => {
    loadGeneratedDocuments();
  }, [matterId]);

  const loadGeneratedDocuments = async () => {
    try {
      const { data } = await supabase
        .from('ai_generated_documents')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });
      
      setGeneratedDocs(data || []);
    } catch (error) {
      console.error('Error loading generated documents:', error);
    } finally {
      setIsLoadingGenerated(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc.mutateAsync(deleteId);
      toast({ title: 'Documento eliminado' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  // Open document preview
  const handleOpenPreview = async (doc: PreviewDoc) => {
    if (!doc.file_path) {
      toast({ title: 'Documento no disponible', variant: 'destructive' });
      return;
    }
    
    setPreviewDoc(doc);
    setPreviewLoading(true);
    setPreviewUrl(null);
    
    try {
      const { data, error } = await supabase.storage
        .from('matter-documents')
        .createSignedUrl(doc.file_path, 3600);
      
      if (error) {
        toast({ 
          title: 'Archivo no disponible', 
          description: 'El archivo aún no ha sido subido al sistema.',
          variant: 'destructive' 
        });
        setPreviewDoc(null);
        return;
      }
      
      setPreviewUrl(data.signedUrl);
    } catch (err) {
      toast({ title: 'Error al cargar vista previa', variant: 'destructive' });
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (filePath: string, name: string) => {
    if (!filePath) {
      toast({ title: 'Documento no disponible', variant: 'destructive' });
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from('matter-documents')
        .createSignedUrl(filePath, 3600);
      
      if (error || !data?.signedUrl) {
        toast({ 
          title: 'El archivo aún no ha sido subido al sistema',
          variant: 'destructive' 
        });
        return;
      }
      
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: 'Descarga iniciada' });
    } catch (err) {
      console.error('Download error:', err);
      toast({ title: 'Error al descargar el documento', variant: 'destructive' });
    }
  };

  const isImage = (mimeType?: string) => mimeType?.startsWith('image/');
  const isPdf = (mimeType?: string) => mimeType === 'application/pdf';

  const totalDocs = (uploadedDocuments?.length || 0) + generatedDocs.length;
  const isLoading = isLoadingUploaded || isLoadingGenerated;

  // Handle template click - opens the document generator with the selected template
  const handleTemplateClick = (template: { id: string; name: string; category: string }) => {
    setSelectedTemplateForGenerator(template);
    setShowDocGenerator(true);
  };

  return (
    <div className="space-y-6">
      {/* ====================================== */}
      {/* SECTION A: Existing Documents */}
      {/* ====================================== */}
      <div 
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)', background: 'white' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540' }}>
                Documentos del Expediente
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                {totalDocs} documento(s) en total
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowUploader(!showUploader)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Subir documento
          </Button>
        </div>

        {/* Uploader collapsible */}
        <Collapsible open={showUploader} onOpenChange={setShowUploader}>
          <CollapsibleContent>
            <div className="p-4 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}>
              <DocumentUploader
                entityType="matter"
                entityId={matterId}
                onUploadComplete={() => setShowUploader(false)}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Documents list */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Cargando documentos...</p>
            </div>
          ) : totalDocs === 0 ? (
            <div className="text-center py-8">
              <File className="h-10 w-10 mx-auto mb-2" style={{ color: '#94a3b8' }} />
              <p style={{ fontSize: '13px', color: '#64748b' }}>No hay documentos aún</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Sube archivos o genera documentos desde plantillas
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Generated documents */}
              {generatedDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-sm cursor-pointer"
                  style={{ 
                    background: 'white', 
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(139, 92, 246, 0.1)' }}
                    >
                      <Sparkles className="h-4 w-4" style={{ color: '#8b5cf6' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge 
                          variant="secondary"
                          className={doc.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        >
                          {doc.status === 'approved' ? '✓ Final' : '○ Borrador'}
                        </Badge>
                        {doc.created_at && (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: es })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" style={{ color: '#64748b' }} />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Uploaded documents */}
              {uploadedDocuments?.map((doc) => {
                const categoryConfig = CATEGORY_CONFIG[doc.category || 'other'] || CATEGORY_CONFIG.other;
                
                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-sm cursor-pointer"
                    style={{ 
                      background: 'white', 
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                    onClick={() => handleOpenPreview({
                      id: doc.id,
                      name: doc.name,
                      file_path: doc.file_path || doc.storage_path || '',
                      mime_type: doc.mime_type
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={cn("w-10 h-10 rounded-lg flex items-center justify-center", categoryConfig.bg)}
                      >
                        <FileText className={cn("h-4 w-4", categoryConfig.color)} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={cn(categoryConfig.bg, categoryConfig.color)} variant="secondary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {categoryConfig.label}
                          </Badge>
                          {doc.created_at && (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {format(new Date(doc.created_at), 'dd MMM', { locale: es })}
                            </span>
                          )}
                          {doc.file_size && (
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {(doc.file_size / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenPreview({
                          id: doc.id,
                          name: doc.name,
                          file_path: doc.file_path || doc.storage_path || '',
                          mime_type: doc.mime_type
                        })}
                      >
                        <Eye className="h-4 w-4" style={{ color: '#64748b' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(doc.file_path || doc.storage_path || '', doc.name)}
                      >
                        <Download className="h-4 w-4" style={{ color: '#64748b' }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteId(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ====================================== */}
      {/* SECTION B: Document Generator with Templates */}
      {/* ====================================== */}
      <div 
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: 'white',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540' }}>
                  Generador de Documentos
                </h3>
                <Badge 
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                    color: 'white',
                    fontSize: '9px',
                    padding: '2px 6px'
                  }}
                >
                  IA
                </Badge>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Genera documentos profesionales desde plantillas
              </p>
            </div>
          </div>
        </div>

        {/* Template Tabs */}
        <Tabs value={activeTemplateCategory} onValueChange={setActiveTemplateCategory}>
          <div className="px-4 pt-3" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <TabsList 
              className="h-auto p-1 bg-slate-100/80 rounded-lg flex flex-wrap gap-1"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)' }}
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Template Grids */}
          {TEMPLATE_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="p-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {category.templates.map((template) => (
                  <div
                    key={template.id}
                    className="group p-4 rounded-xl border border-slate-200 bg-white transition-all cursor-pointer hover:shadow-md hover:border-cyan-300"
                    onClick={() => handleTemplateClick({ id: template.id, name: template.name, category: category.id })}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${category.color}15` }}
                      >
                        <category.icon className="h-5 w-5" style={{ color: category.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>
                          {template.name}
                        </h4>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                          {template.desc}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <span 
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: '#00b4d8' }}
                      >
                        Generar
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Generator Modal */}
      <DocumentGenerator
        isOpen={showDocGenerator}
        onClose={() => {
          setShowDocGenerator(false);
          setSelectedTemplateForGenerator(null);
          loadGeneratedDocuments();
        }}
        matterId={matterId}
        clientId={clientId}
        initialTemplateHint={selectedTemplateForGenerator || undefined}
      />

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
            <DialogTitle className="truncate pr-4">
              {previewDoc?.name}
            </DialogTitle>
            <div className="flex items-center gap-2 shrink-0">
              {previewUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" title="Abrir en nueva pestaña">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => previewDoc && handleDownload(previewDoc.file_path, previewDoc.name)}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4 bg-muted/30" style={{ maxHeight: 'calc(90vh - 80px)' }}>
            {previewLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previewUrl ? (
              <>
                {isImage(previewDoc?.mime_type) && (
                  <img
                    src={previewUrl}
                    alt={previewDoc?.name}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  />
                )}

                {isPdf(previewDoc?.mime_type) && (
                  <iframe
                    src={`${previewUrl}#toolbar=1&navpanes=0`}
                    title={previewDoc?.name}
                    className="w-full h-[70vh] rounded-lg border bg-white"
                    style={{ minHeight: '500px' }}
                  />
                )}

                {!isImage(previewDoc?.mime_type) && !isPdf(previewDoc?.mime_type) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Vista previa no disponible para este tipo de archivo.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => previewDoc && handleDownload(previewDoc.file_path, previewDoc.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar archivo
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No se pudo cargar la vista previa
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
