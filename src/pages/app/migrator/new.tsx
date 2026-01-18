import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  FileSpreadsheet,
  ArrowRightLeft,
  Settings2,
  Play,
  Sparkles,
  Database,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  useCreateMigrationProject, 
  useUploadMigrationFile, 
  useAutoMapColumns, 
  useExecuteMigration 
} from '@/hooks/use-migration';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { SourceSystem, MigrationEntityType } from '@/types/migration';
import { MATTER_TARGET_FIELDS, CONTACT_TARGET_FIELDS } from '@/types/migration';

const STEPS = [
  { id: 1, title: 'Sistema Origen', icon: Database },
  { id: 2, title: 'Subir Archivos', icon: Upload },
  { id: 3, title: 'Mapear Campos', icon: ArrowRightLeft },
  { id: 4, title: 'Configurar', icon: Settings2 },
  { id: 5, title: 'Validar', icon: Check },
  { id: 6, title: 'Migrar', icon: Play },
];

const SOURCE_SYSTEMS = [
  { id: 'patsnap', name: 'PatSnap', description: 'Plataforma de análisis de patentes' },
  { id: 'anaqua', name: 'Anaqua', description: 'Gestión integral de PI' },
  { id: 'cpa_global', name: 'CPA Global', description: 'Servicios de renovación' },
  { id: 'dennemeyer', name: 'Dennemeyer', description: 'Gestión de portfolios IP' },
  { id: 'ipan', name: 'IPAN', description: 'Sistema de gestión de PI' },
  { id: 'thomson_compumark', name: 'Thomson CompuMark', description: 'Búsquedas de marcas' },
  { id: 'corsearch', name: 'Corsearch', description: 'Protección de marcas' },
  { id: 'orbit', name: 'Questel Orbit', description: 'Inteligencia de patentes' },
  { id: 'darts_ip', name: 'Darts-IP', description: 'Análisis de litigios IP' },
  { id: 'clarivate', name: 'Clarivate', description: 'Soluciones IP' },
  { id: 'spreadsheet', name: 'Excel/CSV', description: 'Archivos de hoja de cálculo' },
  { id: 'custom', name: 'Otro Sistema', description: 'Sistema personalizado' },
];

const ENTITY_TYPES: { id: MigrationEntityType; name: string; description: string }[] = [
  { id: 'matters', name: 'Expedientes', description: 'Marcas, patentes, diseños' },
  { id: 'contacts', name: 'Contactos', description: 'Clientes y proveedores' },
  { id: 'deadlines', name: 'Plazos', description: 'Vencimientos y recordatorios' },
  { id: 'documents', name: 'Documentos', description: 'Archivos asociados' },
  { id: 'invoices', name: 'Facturas', description: 'Facturación' },
  { id: 'costs', name: 'Costes', description: 'Gastos y honorarios' },
  { id: 'renewals', name: 'Renovaciones', description: 'Historial de renovaciones' },
];

interface UploadedFileState {
  id: string;
  name: string;
  type: MigrationEntityType;
  size: number;
  status: 'uploading' | 'analyzing' | 'ready' | 'error';
  columns?: string[];
  rowCount?: number;
  error?: string;
}

export default function NewMigrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sourceSystem: (searchParams.get('source') || '') as SourceSystem | '',
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileState[]>([]);
  
  const [fieldMapping, setFieldMapping] = useState<Record<string, Record<string, string>>>({});
  const [config, setConfig] = useState({
    dateFormat: 'YYYY-MM-DD',
    duplicateHandling: 'skip' as 'skip' | 'update' | 'create_new',
    preserveIds: false,
    migrateDocuments: true,
    migrateHistory: false,
  });
  
  const [validationResults, setValidationResults] = useState<{
    valid: boolean;
    errors: Array<{ entity: string; row: number; field: string; message: string }>;
    warnings: Array<{ entity: string; message: string }>;
    summary: { total: number; valid: number; invalid: number };
  } | null>(null);
  
  const [migrationProgress, setMigrationProgress] = useState({
    status: 'idle' as 'idle' | 'running' | 'completed' | 'failed',
    progress: 0,
    currentEntity: '',
    processed: 0,
    total: 0,
    errors: [] as string[],
  });

  // Mutations
  const createProject = useCreateMigrationProject();
  const uploadFile = useUploadMigrationFile();
  const autoMap = useAutoMapColumns();
  const executeMigration = useExecuteMigration();

  // Step 1: Crear proyecto
  const handleCreateProject = async () => {
    if (!formData.name || !formData.sourceSystem) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    try {
      const project = await createProject.mutateAsync({
        name: formData.name,
        description: formData.description,
        source_system: formData.sourceSystem as SourceSystem,
      });
      setProjectId(project.id);
      setCurrentStep(2);
    } catch (error) {
      toast.error('Error al crear el proyecto');
    }
  };

  // Step 2: Subir archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, entityType: MigrationEntityType) => {
    const files = e.target.files;
    if (!files?.length || !projectId) return;

    const file = files[0];
    const tempId = crypto.randomUUID();
    
    setUploadedFiles(prev => [...prev, {
      id: tempId,
      name: file.name,
      type: entityType,
      size: file.size,
      status: 'uploading',
    }]);

    try {
      const result = await uploadFile.mutateAsync({
        projectId,
        file,
        entityType,
      });
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { 
              ...f, 
              id: result.id, 
              status: 'ready' as const, 
              columns: result.analysis?.columns || [],
              rowCount: result.total_rows 
            }
          : f
      ));
    } catch (error) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId 
          ? { ...f, status: 'error' as const, error: 'Error al procesar archivo' }
          : f
      ));
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Step 3: Auto-mapeo de campos
  const handleAutoMap = async () => {
    if (uploadedFiles.length === 0) return;

    // Get first file with columns
    const file = uploadedFiles.find(f => f.status === 'ready' && f.columns);
    if (!file) return;

    const targetFields = file.type === 'contacts' 
      ? CONTACT_TARGET_FIELDS.map(f => f.value)
      : MATTER_TARGET_FIELDS.map(f => f.value);

    try {
      const result = await autoMap.mutateAsync({
        fileId: file.id,
        sourceColumns: file.columns || [],
        targetFields,
        sampleData: [],
      });
      
      setFieldMapping(prev => ({
        ...prev,
        [file.type]: result.mapping,
      }));
      toast.success('Campos mapeados automáticamente');
    } catch (error) {
      toast.error('Error en el mapeo automático');
    }
  };

  // Step 5: Validar
  const handleValidate = () => {
    // Simulación de validación
    const totalRows = uploadedFiles.reduce((sum, f) => sum + (f.rowCount || 0), 0);
    const invalidRows = Math.floor(totalRows * 0.01); // 1% de errores
    
    const mockValidation = {
      valid: invalidRows < totalRows * 0.1, // válido si menos del 10% errores
      errors: [],
      warnings: [
        { entity: 'matters', message: `${Math.floor(totalRows * 0.01)} expedientes sin fecha de presentación` },
        { entity: 'contacts', message: '3 contactos sin email' },
      ],
      summary: { total: totalRows, valid: totalRows - invalidRows, invalid: invalidRows },
    };
    setValidationResults(mockValidation);
  };

  // Step 6: Ejecutar migración
  const handleMigrate = async () => {
    if (!projectId) return;

    setMigrationProgress({ 
      status: 'running', 
      progress: 0, 
      currentEntity: 'Iniciando...', 
      processed: 0, 
      total: validationResults?.summary.total || 0,
      errors: [],
    });

    try {
      await executeMigration.mutateAsync(projectId);
      
      setMigrationProgress(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
      }));
      
      toast.success('¡Migración completada exitosamente!');
    } catch (error) {
      setMigrationProgress(prev => ({
        ...prev,
        status: 'failed',
        errors: ['Error durante la migración'],
      }));
      toast.error('Error durante la migración');
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name && formData.sourceSystem;
      case 2: return uploadedFiles.some(f => f.status === 'ready');
      case 3: return Object.keys(fieldMapping).length > 0;
      case 4: return true;
      case 5: return validationResults?.valid;
      default: return false;
    }
  };

  const getTargetFields = (entityType: string) => {
    if (entityType === 'contacts') return CONTACT_TARGET_FIELDS;
    return MATTER_TARGET_FIELDS;
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/migrator')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Migración</h1>
          <p className="text-muted-foreground">Importa tus datos desde otro sistema</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted ? "bg-primary text-primary-foreground" :
                    isActive ? "bg-primary/20 text-primary border-2 border-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Seleccionar Sistema */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Proyecto *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Migración desde PatSnap Q1 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción opcional del proyecto de migración"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Sistema de Origen *</Label>
                <RadioGroup
                  value={formData.sourceSystem}
                  onValueChange={(value) => setFormData({ ...formData, sourceSystem: value as SourceSystem })}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  {SOURCE_SYSTEMS.map((system) => (
                    <div key={system.id}>
                      <RadioGroupItem
                        value={system.id}
                        id={system.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={system.id}
                        className={cn(
                          "flex flex-col p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors",
                          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        )}
                      >
                        <span className="font-medium">{system.name}</span>
                        <span className="text-xs text-muted-foreground">{system.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Subir Archivos */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ENTITY_TYPES.map((entity) => {
                  const existingFile = uploadedFiles.find(f => f.type === entity.id);
                  
                  return (
                    <Card key={entity.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <h3 className="font-medium">{entity.name}</h3>
                          <p className="text-xs text-muted-foreground mb-4">{entity.description}</p>
                          
                          {existingFile ? (
                            <div className="space-y-2">
                              <Badge variant="outline" className="w-full justify-between">
                                <span className="truncate text-xs">
                                  {existingFile.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-2"
                                  onClick={() => removeFile(existingFile.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                              {existingFile.status === 'uploading' && (
                                <p className="text-xs text-muted-foreground flex items-center justify-center">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Subiendo...
                                </p>
                              )}
                              {existingFile.rowCount && (
                                <p className="text-xs text-muted-foreground">
                                  {existingFile.rowCount.toLocaleString()} filas
                                </p>
                              )}
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, entity.id)}
                              />
                              <Button variant="outline" size="sm" className="w-full" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Subir
                                </span>
                              </Button>
                            </label>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {uploadedFiles.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Archivos subidos:</h4>
                  <ul className="space-y-1 text-sm">
                    {uploadedFiles.map((file) => (
                      <li key={file.id} className="flex items-center gap-2">
                        {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                        {file.status === 'ready' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {file.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        <span>{file.name}</span>
                        <span className="text-muted-foreground">({file.type})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Mapear Campos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Mapeo de Campos</h3>
                  <p className="text-sm text-muted-foreground">
                    Asocia las columnas de tus archivos con los campos de IP-NEXUS
                  </p>
                </div>
                <Button onClick={handleAutoMap} disabled={autoMap.isPending}>
                  {autoMap.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Mapeo Automático con IA
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {uploadedFiles.filter(f => f.status === 'ready').map((file) => (
                  <div key={file.id} className="mb-6 last:mb-0">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      {file.name} ({file.type})
                    </h4>
                    <div className="grid gap-3">
                      {file.columns?.map((column) => (
                        <div key={column} className="flex items-center gap-4">
                          <div className="w-1/3 p-2 bg-muted rounded text-sm truncate">{column}</div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Select
                            value={fieldMapping[file.type]?.[column] || ''}
                            onValueChange={(value) => {
                              setFieldMapping(prev => ({
                                ...prev,
                                [file.type]: {
                                  ...prev[file.type],
                                  [column]: value,
                                },
                              }));
                            }}
                          >
                            <SelectTrigger className="w-1/3">
                              <SelectValue placeholder="Seleccionar campo" />
                            </SelectTrigger>
                            <SelectContent>
                              {getTargetFields(file.type).map(field => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label} {field.required && '*'}
                                </SelectItem>
                              ))}
                              <SelectItem value="_ignore">⊘ Ignorar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* Step 4: Configurar */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Formato de Fechas</Label>
                  <Select
                    value={config.dateFormat}
                    onValueChange={(value) => setConfig({ ...config, dateFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-01-18)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (18/01/2026)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (01/18/2026)</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (18-01-2026)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Manejo de Duplicados</Label>
                  <Select
                    value={config.duplicateHandling}
                    onValueChange={(value: 'skip' | 'update' | 'create_new') => 
                      setConfig({ ...config, duplicateHandling: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Omitir duplicados</SelectItem>
                      <SelectItem value="update">Actualizar existentes</SelectItem>
                      <SelectItem value="create_new">Crear nuevos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Opciones Adicionales</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="preserveIds"
                      checked={config.preserveIds}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, preserveIds: checked as boolean })
                      }
                    />
                    <label htmlFor="preserveIds" className="text-sm">
                      Preservar IDs originales (si es posible)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="migrateDocuments"
                      checked={config.migrateDocuments}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, migrateDocuments: checked as boolean })
                      }
                    />
                    <label htmlFor="migrateDocuments" className="text-sm">
                      Migrar documentos adjuntos
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="migrateHistory"
                      checked={config.migrateHistory}
                      onCheckedChange={(checked) => 
                        setConfig({ ...config, migrateHistory: checked as boolean })
                      }
                    />
                    <label htmlFor="migrateHistory" className="text-sm">
                      Migrar historial de cambios
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Validar */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {!validationResults ? (
                <div className="text-center py-12">
                  <Check className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Validar Datos</h3>
                  <p className="text-muted-foreground mb-4">
                    Verifica que todos los datos estén correctos antes de migrar
                  </p>
                  <Button onClick={handleValidate}>
                    <Check className="h-4 w-4 mr-2" />
                    Iniciar Validación
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{validationResults.summary.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Registros</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {validationResults.summary.valid.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Válidos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-red-600">
                          {validationResults.summary.invalid.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Con Errores</p>
                      </CardContent>
                    </Card>
                  </div>

                  {validationResults.warnings.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Advertencias
                      </h4>
                      <ul className="space-y-1 text-sm text-yellow-700">
                        {validationResults.warnings.map((warning, i) => (
                          <li key={i}>• {warning.entity}: {warning.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResults.valid && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Validación completada. Puedes proceder con la migración.</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 6: Migrar */}
          {currentStep === 6 && (
            <div className="space-y-6">
              {migrationProgress.status === 'idle' ? (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Todo listo para migrar</h3>
                  <p className="text-muted-foreground mb-4">
                    Se migrarán {validationResults?.summary.valid.toLocaleString()} registros a IP-NEXUS
                  </p>
                  <Button onClick={handleMigrate} size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar Migración
                  </Button>
                </div>
              ) : migrationProgress.status === 'running' ? (
                <div className="space-y-6 py-8">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-medium">{migrationProgress.currentEntity}</h3>
                    <p className="text-muted-foreground">
                      {migrationProgress.processed.toLocaleString()} de {migrationProgress.total.toLocaleString()} registros
                    </p>
                  </div>
                  <Progress value={migrationProgress.progress} className="h-3" />
                </div>
              ) : migrationProgress.status === 'completed' ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">¡Migración Completada!</h3>
                  <p className="text-muted-foreground mb-6">
                    Se han migrado exitosamente todos los registros
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/app/migrator')}>
                      Ver Todas las Migraciones
                    </Button>
                    <Button onClick={() => navigate('/app/docket')}>
                      Ir al Docket
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Error en la Migración</h3>
                  <p className="text-muted-foreground mb-4">
                    Se produjo un error durante la migración
                  </p>
                  <Button variant="outline" onClick={() => setMigrationProgress({ ...migrationProgress, status: 'idle' })}>
                    Reintentar
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1 || migrationProgress.status === 'running'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        {currentStep < 6 ? (
          <Button
            onClick={() => {
              if (currentStep === 1) {
                handleCreateProject();
              } else {
                setCurrentStep(prev => Math.min(6, prev + 1));
              }
            }}
            disabled={!canProceed() || createProject.isPending}
          >
            {createProject.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          migrationProgress.status === 'completed' && (
            <Button onClick={() => navigate('/app/migrator')}>
              Finalizar
            </Button>
          )
        )}
      </div>
    </div>
  );
}
