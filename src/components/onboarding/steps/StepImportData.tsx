import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  ChevronLeft,
  Check,
  AlertCircle,
  Download,
} from 'lucide-react';

interface StepImportDataProps {
  organizationId: string;
  onSkip: () => void;
}

const IMPORT_OPTIONS = [
  {
    id: 'excel',
    title: 'Excel / CSV',
    description: 'Importa desde una hoja de cálculo',
    icon: FileSpreadsheet,
  },
  {
    id: 'manual',
    title: 'Empezar vacío',
    description: 'Añadiré los datos manualmente',
    icon: Sparkles,
  },
];

const TEMPLATES = [
  { name: 'Marcas', file: 'import_trademarks.xlsx', type: 'trademarks' },
  { name: 'Patentes', file: 'import_patents.xlsx', type: 'patents' },
  { name: 'Contactos', file: 'import_contacts.xlsx', type: 'contacts' },
];

export function StepImportData({ organizationId, onSkip }: StepImportDataProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    totalRows: number;
    validRows: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsValidating(true);
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setValidationResult({
        valid: true,
        totalRows: 45,
        validRows: 43,
        errors: []
      });
      setIsValidating(false);
    }
  };

  const handleDownloadTemplate = (template: typeof TEMPLATES[0]) => {
    // In production, this would download the actual template
    window.open(`/templates/${template.file}`, '_blank');
  };

  if (!selectedMethod) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">¿Tienes datos existentes?</h2>
          <p className="text-muted-foreground text-sm">Podemos importar tu portfolio actual</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IMPORT_OPTIONS.map((option) => (
            <Card
              key={option.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedMethod(option.id)}
            >
              <CardContent className="pt-6 text-center">
                <option.icon className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="font-medium">{option.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          También podrás importar datos más adelante desde Configuración &gt; Importar
        </p>
      </div>
    );
  }

  if (selectedMethod === 'manual') {
    return (
      <div className="text-center py-8">
        <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">¡Perfecto!</h3>
        <p className="text-muted-foreground mb-6">
          Podrás añadir tus activos cuando quieras desde el módulo Docket
        </p>
        <Button onClick={onSkip}>
          Continuar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <span className="text-sm text-muted-foreground">Importar desde Excel/CSV</span>
      </div>

      {/* Templates */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Descarga una plantilla de ejemplo:</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <Button
              key={template.type}
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate(template)}
            >
              <Download className="h-4 w-4 mr-2" />
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <label className="flex flex-col items-center cursor-pointer py-8">
            {isValidating ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3" />
                <span className="font-medium">Validando archivo...</span>
              </>
            ) : uploadedFile ? (
              <>
                <FileSpreadsheet className="h-12 w-12 text-green-500 mb-3" />
                <span className="font-medium">{uploadedFile.name}</span>
                <span className="text-sm text-muted-foreground mt-1">
                  Haz clic para seleccionar otro archivo
                </span>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                <span className="font-medium">
                  Arrastra tu archivo o haz clic para seleccionar
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  Excel (.xlsx) o CSV
                </span>
              </>
            )}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <Card className={validationResult.valid ? 'border-green-500' : 'border-amber-500'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              {validationResult.valid ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span className="font-medium">
                {validationResult.validRows} de {validationResult.totalRows} filas válidas
              </span>
            </div>
            {validationResult.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {validationResult.errors.length} errores encontrados
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Los datos se importarán cuando continúes al siguiente paso
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
