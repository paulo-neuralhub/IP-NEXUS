import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateConnection, useTestConnection } from '@/hooks/use-migration-connections';
import { MIGRATION_SYSTEMS, AUTH_TYPE_INFO } from '@/lib/constants/migration-systems';
import type { SystemType, AuthType } from '@/types/migration-advanced';

interface ConnectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (connectionId: string) => void;
}

type WizardStep = 'system' | 'auth' | 'credentials' | 'test' | 'complete';

export function ConnectionWizard({ open, onOpenChange, onComplete }: ConnectionWizardProps) {
  const [step, setStep] = useState<WizardStep>('system');
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  const [selectedAuthType, setSelectedAuthType] = useState<AuthType | null>(null);
  const [connectionName, setConnectionName] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [createdConnectionId, setCreatedConnectionId] = useState<string | null>(null);

  const createConnection = useCreateConnection();
  const testConnection = useTestConnection();

  const systemInfo = selectedSystem ? MIGRATION_SYSTEMS[selectedSystem] : null;
  const authInfo = selectedAuthType ? AUTH_TYPE_INFO[selectedAuthType] : null;

  const steps: { key: WizardStep; label: string }[] = [
    { key: 'system', label: 'Sistema' },
    { key: 'auth', label: 'Autenticación' },
    { key: 'credentials', label: 'Credenciales' },
    { key: 'test', label: 'Probar' },
    { key: 'complete', label: 'Completado' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const handleSelectSystem = (system: SystemType) => {
    setSelectedSystem(system);
    setSelectedAuthType(null);
    setCredentials({});
    setConnectionName(`Conexión ${MIGRATION_SYSTEMS[system].name}`);
  };

  const handleSelectAuthType = (auth: AuthType) => {
    setSelectedAuthType(auth);
    setCredentials({});
  };

  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateAndTest = async () => {
    if (!selectedSystem || !selectedAuthType) return;

    setStep('test');
    
    try {
      const connection = await createConnection.mutateAsync({
        system_type: selectedSystem,
        name: connectionName,
        auth_type: selectedAuthType,
        credentials
      });

      setCreatedConnectionId(connection.id);

      const result = await testConnection.mutateAsync(connection.id);
      setTestResult(result);
      
      if (result.success) {
        setStep('complete');
      }
    } catch (error) {
      console.error('Error:', error);
      setTestResult({ success: false, message: 'Error al crear o probar la conexión' });
    }
  };

  const handleComplete = () => {
    if (createdConnectionId && onComplete) {
      onComplete(createdConnectionId);
    }
    handleReset();
  };

  const handleReset = () => {
    onOpenChange(false);
    setStep('system');
    setSelectedSystem(null);
    setSelectedAuthType(null);
    setCredentials({});
    setTestResult(null);
    setCreatedConnectionId(null);
  };

  const canProceed = () => {
    switch (step) {
      case 'system':
        return !!selectedSystem;
      case 'auth':
        return !!selectedAuthType;
      case 'credentials':
        if (!authInfo) return false;
        return authInfo.fields.every(f => !f.required || credentials[f.key]);
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Nueva Conexión de Migración
          </DialogTitle>
          <DialogDescription>
            Conecta directamente con tu sistema actual para migrar datos automáticamente
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div 
                key={s.key}
                className={cn(
                  "flex items-center gap-2",
                  i <= currentStepIndex ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  i < currentStepIndex && "bg-primary text-primary-foreground",
                  i === currentStepIndex && "bg-primary/20 text-primary border-2 border-primary",
                  i > currentStepIndex && "bg-muted text-muted-foreground"
                )}>
                  {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline text-sm">{s.label}</span>
              </div>
            ))}
          </div>
          <Progress value={(currentStepIndex / (steps.length - 1)) * 100} className="h-1" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 1: Select System */}
          {step === 'system' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">¿Desde qué sistema quieres migrar?</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona tu sistema actual de gestión de PI
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(MIGRATION_SYSTEMS).map(([key, system]) => (
                  <Card
                    key={key}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedSystem === key && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSelectSystem(key as SystemType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: system.color }}
                        >
                          {system.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{system.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {system.vendor}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {system.hasApi && (
                              <Badge variant="secondary" className="text-[10px] px-1">API</Badge>
                            )}
                            {system.supportsRealtime && (
                              <Badge variant="secondary" className="text-[10px] px-1">Realtime</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Auth Type */}
          {step === 'auth' && systemInfo && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div 
                  className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: systemInfo.color }}
                >
                  {systemInfo.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-lg font-medium">Conectar a {systemInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona cómo quieres autenticarte
                </p>
              </div>

              <div className="space-y-3">
                {systemInfo.supportedAuthTypes.map(authType => {
                  const info = AUTH_TYPE_INFO[authType];
                  if (!info) return null;
                  const Icon = info.icon;

                  return (
                    <Card
                      key={authType}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedAuthType === authType && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectAuthType(authType as AuthType)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{info.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {info.description}
                            </p>
                          </div>
                          {selectedAuthType === authType && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedAuthType === 'agent' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Esta opción requiere instalar el <strong>Nexus Agent</strong> en tu red local.
                    <Button variant="link" className="px-1 h-auto">
                      Descargar agente →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Enter Credentials */}
          {step === 'credentials' && authInfo && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Introduce tus credenciales</h3>
                <p className="text-sm text-muted-foreground">
                  Tus credenciales se almacenan de forma segura y encriptada
                </p>
              </div>

              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Las credenciales se guardan con encriptación AES-256. Nunca se almacenan en texto plano.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="connection-name">Nombre de la conexión</Label>
                  <Input
                    id="connection-name"
                    value={connectionName}
                    onChange={e => setConnectionName(e.target.value)}
                    placeholder="Mi conexión a PatSnap"
                  />
                </div>

                {authInfo.fields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {field.type === 'select' && field.options ? (
                      <Select 
                        value={credentials[field.key] || ''} 
                        onValueChange={v => handleCredentialChange(field.key, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type === 'password' ? 'password' : field.type}
                        value={credentials[field.key] || ''}
                        onChange={e => handleCredentialChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Testing */}
          {step === 'test' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                {(createConnection.isPending || testConnection.isPending) ? (
                  <>
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                    <h3 className="text-lg font-medium">
                      {createConnection.isPending ? 'Creando conexión...' : 'Probando conexión...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Esto puede tardar unos segundos
                    </p>
                  </>
                ) : testResult?.success ? (
                  <>
                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-green-700">¡Conexión exitosa!</h3>
                    <p className="text-sm text-muted-foreground">
                      Se estableció conexión correctamente
                    </p>
                  </>
                ) : testResult ? (
                  <>
                    <XCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                    <h3 className="text-lg font-medium text-destructive">Error de conexión</h3>
                    <p className="text-sm text-muted-foreground">
                      {testResult.message}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setStep('credentials')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Revisar credenciales
                    </Button>
                  </>
                ) : null}
              </div>

              {testResult?.success && testResult.metadata && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Datos encontrados</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {testResult.metadata.total_matters !== undefined && (
                        <div>
                          <p className="text-2xl font-bold">{testResult.metadata.total_matters.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Expedientes</p>
                        </div>
                      )}
                      {testResult.metadata.total_contacts !== undefined && (
                        <div>
                          <p className="text-2xl font-bold">{testResult.metadata.total_contacts.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Contactos</p>
                        </div>
                      )}
                      {testResult.metadata.total_deadlines !== undefined && (
                        <div>
                          <p className="text-2xl font-bold">{testResult.metadata.total_deadlines.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Plazos</p>
                        </div>
                      )}
                      {testResult.metadata.total_documents !== undefined && (
                        <div>
                          <p className="text-2xl font-bold">{testResult.metadata.total_documents.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Documentos</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && testResult?.success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">¡Conexión configurada!</h3>
              <p className="text-muted-foreground mb-6">
                Tu conexión a <strong>{systemInfo?.name}</strong> está lista para migrar datos
              </p>

              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                <Button onClick={handleComplete} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Iniciar migración ahora
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Configurar después
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'complete' && step !== 'test' && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                const prevIndex = currentStepIndex - 1;
                if (prevIndex >= 0) {
                  setStep(steps[prevIndex].key);
                }
              }}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>

            {step === 'credentials' ? (
              <Button 
                onClick={handleCreateAndTest}
                disabled={!canProceed() || createConnection.isPending}
              >
                {createConnection.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Crear y probar conexión
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  const nextIndex = currentStepIndex + 1;
                  if (nextIndex < steps.length) {
                    setStep(steps[nextIndex].key);
                  }
                }}
                disabled={!canProceed()}
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
