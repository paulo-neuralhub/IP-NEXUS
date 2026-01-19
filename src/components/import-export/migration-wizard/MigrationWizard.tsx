import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Globe, 
  Key, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Server,
  FileCode
} from 'lucide-react';
import { useOrganization } from '@/contexts/organization-context';
import { useMigrationConfigs, useMigrationJobs } from '@/hooks/import-export';

interface MigrationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MigrationStep = 'source' | 'credentials' | 'mapping' | 'review' | 'migrating' | 'complete';

const SOURCE_SYSTEMS = [
  { id: 'patsnap', name: 'PatSnap', icon: Database },
  { id: 'anaqua', name: 'Anaqua', icon: Database },
  { id: 'cpa_global', name: 'CPA Global', icon: Database },
  { id: 'dennemeyer', name: 'Dennemeyer', icon: Database },
  { id: 'ipfolio', name: 'IP Folio', icon: Database },
  { id: 'clarivate', name: 'Clarivate', icon: Database },
  { id: 'custom_api', name: 'API Personalizada', icon: FileCode },
  { id: 'custom_db', name: 'Base de Datos', icon: Server }
];

const CONNECTION_TYPES = [
  { id: 'api', name: 'API REST', description: 'Conexión vía API' },
  { id: 'oauth2', name: 'OAuth 2.0', description: 'Autenticación OAuth' },
  { id: 'database', name: 'Base de datos', description: 'Conexión directa DB' },
  { id: 'sftp', name: 'SFTP', description: 'Transferencia de archivos' }
];

const STEPS: { id: MigrationStep; label: string }[] = [
  { id: 'source', label: 'Sistema origen' },
  { id: 'credentials', label: 'Credenciales' },
  { id: 'mapping', label: 'Mapeo' },
  { id: 'review', label: 'Revisión' },
  { id: 'migrating', label: 'Migración' },
  { id: 'complete', label: 'Completado' }
];

export function MigrationWizard({ open, onOpenChange }: MigrationWizardProps) {
  const { currentOrganization } = useOrganization();
  const { createConfig } = useMigrationConfigs();
  const { startMigration } = useMigrationJobs();
  
  const [currentStep, setCurrentStep] = useState<MigrationStep>('source');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [connectionType, setConnectionType] = useState<string>('api');
  const [credentials, setCredentials] = useState({
    apiUrl: '',
    apiKey: '',
    username: '',
    password: '',
    clientId: '',
    clientSecret: ''
  });
  const [configName, setConfigName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const handleClose = () => {
    // Reset state
    setCurrentStep('source');
    setSelectedSource('');
    setCredentials({
      apiUrl: '',
      apiKey: '',
      username: '',
      password: '',
      clientId: '',
      clientSecret: ''
    });
    setConnectionStatus('idle');
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    setIsConnecting(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus('success');
    setIsConnecting(false);
  };

  const handleStartMigration = async () => {
    if (!currentOrganization) return;

    setCurrentStep('migrating');
    
    // Simulate migration progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMigrationProgress(i);
    }

    setCurrentStep('complete');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 'source':
        return selectedSource !== '';
      case 'credentials':
        return connectionStatus === 'success';
      case 'mapping':
        return true;
      case 'review':
        return configName.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Migración de Sistema</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Step indicators */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-2">
            {STEPS.filter(s => s.id !== 'migrating').map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${
                    STEPS.findIndex(s => s.id === currentStep) >= STEPS.findIndex(s => s.id === step.id)
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {index < STEPS.filter(s => s.id !== 'migrating').length - 1 && (
                  <div className="w-4 h-0.5 bg-muted flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <Progress value={progress} className="mt-2" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step: Source Selection */}
          {currentStep === 'source' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecciona el sistema desde el cual deseas migrar tus datos de propiedad intelectual.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {SOURCE_SYSTEMS.map(source => (
                  <Card
                    key={source.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedSource === source.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSource(source.id)}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <source.icon className={`h-8 w-8 ${
                        selectedSource === source.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <Label>Tipo de conexión</Label>
                <div className="grid grid-cols-2 gap-4">
                  {CONNECTION_TYPES.map(type => (
                    <Card
                      key={type.id}
                      className={`p-3 cursor-pointer transition-all ${
                        connectionType === type.id 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setConnectionType(type.id)}
                    >
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Credentials */}
          {currentStep === 'credentials' && (
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Tus credenciales se almacenan de forma segura y encriptada.
                </AlertDescription>
              </Alert>

              <Tabs value={connectionType} onValueChange={setConnectionType}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="api">API Key</TabsTrigger>
                  <TabsTrigger value="oauth2">OAuth 2.0</TabsTrigger>
                </TabsList>

                <TabsContent value="api" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiUrl">URL del API</Label>
                    <Input
                      id="apiUrl"
                      placeholder="https://api.example.com/v1"
                      value={credentials.apiUrl}
                      onChange={(e) => setCredentials(prev => ({ ...prev, apiUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk_live_..."
                      value={credentials.apiKey}
                      onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="oauth2" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="client_id"
                      value={credentials.clientId}
                      onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="client_secret"
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isConnecting}
                  variant="outline"
                  className="gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Probar conexión
                </Button>

                {connectionStatus === 'success' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Conexión exitosa
                  </span>
                )}

                {connectionStatus === 'error' && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Error de conexión
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Step: Mapping */}
          {currentStep === 'mapping' && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                El sistema detectará automáticamente los campos y te permitirá ajustar el mapeo.
              </p>

              <Card className="p-6">
                <div className="flex items-center justify-center gap-4 py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <div>
                    <p className="font-medium">Analizando estructura de datos...</p>
                    <p className="text-sm text-muted-foreground">
                      Esto puede tomar unos momentos
                    </p>
                  </div>
                </div>
              </Card>

              <Alert>
                <AlertDescription>
                  Una vez conectado, el sistema mapeará automáticamente los campos comunes y te permitirá 
                  ajustar cualquier mapeo necesario antes de iniciar la migración.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="configName">Nombre de la configuración</Label>
                <Input
                  id="configName"
                  placeholder="Migración desde PatSnap"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Este nombre te ayudará a identificar la migración
                </p>
              </div>

              <Card className="p-4 space-y-4">
                <h4 className="font-medium">Resumen de la migración</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sistema origen:</span>
                    <p className="font-medium">
                      {SOURCE_SYSTEMS.find(s => s.id === selectedSource)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo de conexión:</span>
                    <p className="font-medium">
                      {CONNECTION_TYPES.find(t => t.id === connectionType)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium text-green-600">Conexión verificada</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entidades a migrar:</span>
                    <p className="font-medium">Todas</p>
                  </div>
                </div>
              </Card>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  La migración puede tomar tiempo dependiendo del volumen de datos. 
                  Podrás monitorear el progreso en cualquier momento.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step: Migrating */}
          {currentStep === 'migrating' && (
            <div className="flex flex-col items-center justify-center gap-6 py-8">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Migración en progreso</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor no cierres esta ventana
                </p>
              </div>
              <div className="w-full max-w-md">
                <Progress value={migrationProgress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {migrationProgress}% completado
                </p>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {currentStep === 'complete' && (
            <div className="flex flex-col items-center justify-center gap-6 py-8">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">¡Migración completada!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos tus datos han sido migrados exitosamente
                </p>
              </div>
              <Button onClick={handleClose}>
                Finalizar
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== 'migrating' && currentStep !== 'complete' && (
          <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            {currentStep === 'review' ? (
              <Button onClick={handleStartMigration} disabled={!canGoNext()}>
                Iniciar migración
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canGoNext()}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
