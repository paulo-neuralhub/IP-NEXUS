import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, Image, File, Trash2, CheckCircle,
  AlertCircle, Download, Eye, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WizardFormData } from '../FilingWizard';

interface Step6Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  errors: Record<string, string[]>;
}

interface DocumentRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
  formats: string[];
  maxSize: string;
}

const DOCUMENT_REQUIREMENTS: Record<string, DocumentRequirement[]> = {
  trademark: [
    {
      type: 'mark_image',
      label: 'Imagen de la Marca',
      description: 'Representación gráfica de la marca (para marcas figurativas o mixtas)',
      required: false,
      formats: ['JPG', 'PNG', 'PDF'],
      maxSize: '2MB',
    },
    {
      type: 'power_of_attorney',
      label: 'Poder de Representación',
      description: 'Si actúas mediante representante',
      required: false,
      formats: ['PDF'],
      maxSize: '5MB',
    },
    {
      type: 'priority_document',
      label: 'Documento de Prioridad',
      description: 'Certificado de la solicitud prioritaria (si reclamas prioridad)',
      required: false,
      formats: ['PDF'],
      maxSize: '10MB',
    },
  ],
  patent: [
    {
      type: 'description',
      label: 'Descripción de la Invención',
      description: 'Documento técnico describiendo la invención',
      required: true,
      formats: ['PDF', 'DOC', 'DOCX'],
      maxSize: '20MB',
    },
    {
      type: 'claims',
      label: 'Reivindicaciones',
      description: 'Lista de reivindicaciones de la patente',
      required: true,
      formats: ['PDF', 'DOC', 'DOCX'],
      maxSize: '10MB',
    },
    {
      type: 'abstract',
      label: 'Resumen',
      description: 'Resumen de la invención',
      required: true,
      formats: ['PDF', 'DOC', 'DOCX'],
      maxSize: '2MB',
    },
    {
      type: 'drawings',
      label: 'Dibujos Técnicos',
      description: 'Ilustraciones de la invención',
      required: false,
      formats: ['PDF', 'JPG', 'PNG'],
      maxSize: '20MB',
    },
  ],
  design: [
    {
      type: 'design_views',
      label: 'Vistas del Diseño',
      description: 'Representaciones gráficas del diseño (hasta 7 vistas)',
      required: true,
      formats: ['JPG', 'PNG', 'PDF'],
      maxSize: '5MB',
    },
    {
      type: 'description',
      label: 'Descripción del Diseño',
      description: 'Descripción opcional de los elementos del diseño',
      required: false,
      formats: ['PDF', 'DOC'],
      maxSize: '2MB',
    },
  ],
  utility_model: [
    {
      type: 'description',
      label: 'Descripción Técnica',
      description: 'Documento describiendo el modelo de utilidad',
      required: true,
      formats: ['PDF', 'DOC', 'DOCX'],
      maxSize: '20MB',
    },
    {
      type: 'claims',
      label: 'Reivindicaciones',
      description: 'Lista de reivindicaciones',
      required: true,
      formats: ['PDF', 'DOC', 'DOCX'],
      maxSize: '10MB',
    },
  ],
};

export function Step6Documents({ formData, updateFormData, errors }: Step6Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requirements = DOCUMENT_REQUIREMENTS[formData.filing_type] || DOCUMENT_REQUIREMENTS.trademark;
  
  const getDocumentByType = (type: string) => {
    return formData.documents.find(d => d.type === type);
  };

  const handleUpload = async (type: string, file: File) => {
    setUploading(type);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add document to form data
    const newDocument = {
      type,
      name: file.name,
      url: URL.createObjectURL(file), // In production, this would be the uploaded URL
      size: file.size,
    };

    updateFormData({
      documents: [...formData.documents.filter(d => d.type !== type), newDocument],
    });

    setUploading(null);
    setUploadProgress(0);
  };

  const handleRemove = (type: string) => {
    updateFormData({
      documents: formData.documents.filter(d => d.type !== type),
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold">Documentación Requerida</h3>
        <p className="text-muted-foreground">
          Adjunta los documentos necesarios para tu solicitud de {formData.filing_type}
        </p>
      </div>

      <div className="space-y-4">
        {requirements.map(req => {
          const existingDoc = getDocumentByType(req.type);
          const isUploading = uploading === req.type;

          return (
            <Card key={req.type} className={cn(
              existingDoc && "border-emerald-200 bg-emerald-50/30"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "p-3 rounded-lg",
                    existingDoc ? "bg-emerald-100" : "bg-muted"
                  )}>
                    {existingDoc ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{req.label}</h4>
                      {req.required && (
                        <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Formatos: {req.formats.join(', ')}</span>
                      <span>•</span>
                      <span>Máx: {req.maxSize}</span>
                    </div>

                    {/* Upload progress */}
                    {isUploading && (
                      <div className="mt-3">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Subiendo... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {/* Uploaded file info */}
                    {existingDoc && !isUploading && (
                      <div className="mt-3 flex items-center gap-2 bg-white rounded-lg p-2 border">
                        {getFileIcon(existingDoc.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{existingDoc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(existingDoc.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemove(req.type)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  {!existingDoc && !isUploading && (
                    <div>
                      <input
                        type="file"
                        id={`file-${req.type}`}
                        className="hidden"
                        accept={req.formats.map(f => `.${f.toLowerCase()}`).join(',')}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(req.type, file);
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-${req.type}`)?.click()}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Subir
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional documents */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h4 className="font-medium mb-1">Documentos Adicionales</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Arrastra archivos aquí o haz clic para añadir documentación extra
          </p>
          <input
            type="file"
            id="file-additional"
            className="hidden"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((file, index) => {
                  handleUpload(`additional_${Date.now()}_${index}`, file);
                });
              }
            }}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-additional')?.click()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Añadir Documentos
          </Button>
        </CardContent>
      </Card>

      {/* Info box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Información sobre documentos</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Los documentos deben estar en el idioma de la oficina o incluir traducción</li>
                <li>• Las imágenes deben tener buena resolución (mínimo 300 DPI)</li>
                <li>• Algunos documentos pueden requerirse posteriormente durante el examen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
