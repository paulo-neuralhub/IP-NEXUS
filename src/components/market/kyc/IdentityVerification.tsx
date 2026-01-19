// src/components/market/kyc/IdentityVerification.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Camera, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useSubmitVerification } from '@/hooks/market/useKyc';
import { DocumentType } from '@/types/kyc.types';

interface IdentityData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentNumber: string;
}

interface IdentityVerificationProps {
  onComplete?: () => void;
}

export function IdentityVerification({ onComplete }: IdentityVerificationProps) {
  const [step, setStep] = useState(1);
  const [identityData, setIdentityData] = useState<IdentityData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    documentType: 'passport',
    documentNumber: '',
  });
  const [idDocuments, setIdDocuments] = useState<{ file: File; documentType: string }[]>([]);
  const [selfie, setSelfie] = useState<{ file: File; documentType: string }[]>([]);

  const submitVerification = useSubmitVerification();

  const handleSubmit = async () => {
    const allDocuments = [...idDocuments, ...selfie];
    
    await submitVerification.mutateAsync({
      type: 'identity',
      documents: allDocuments,
      metadata: identityData,
    });

    onComplete?.();
  };

  const canProceed = () => {
    if (step === 1) {
      return identityData.firstName && identityData.lastName && 
             identityData.dateOfBirth && identityData.nationality &&
             identityData.documentNumber;
    }
    if (step === 2) {
      return idDocuments.length > 0;
    }
    if (step === 3) {
      return selfie.length > 0;
    }
    return false;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Verificación de Identidad</CardTitle>
            <CardDescription>
              Paso {step} de 3: {
                step === 1 ? 'Datos personales' :
                step === 2 ? 'Documento de identidad' :
                'Selfie de verificación'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal Data */}
        {step === 1 && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Los datos deben coincidir exactamente con tu documento de identidad.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={identityData.firstName}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Como aparece en el documento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input
                  id="lastName"
                  value={identityData.lastName}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Como aparece en el documento"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Fecha de nacimiento</Label>
                <Input
                  id="dob"
                  type="date"
                  value={identityData.dateOfBirth}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidad</Label>
                <Input
                  id="nationality"
                  value={identityData.nationality}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Ej: Española"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Tipo de documento</Label>
                <Select
                  value={identityData.documentType}
                  onValueChange={(value: any) => setIdentityData(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Pasaporte</SelectItem>
                    <SelectItem value="national_id">DNI / Cédula</SelectItem>
                    <SelectItem value="drivers_license">Carnet de conducir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="docNumber">Número de documento</Label>
                <Input
                  id="docNumber"
                  value={identityData.documentNumber}
                  onChange={(e) => setIdentityData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  placeholder="Ej: 12345678A"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: ID Document */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Sube una foto clara de tu {
                  identityData.documentType === 'passport' ? 'pasaporte' :
                  identityData.documentType === 'national_id' ? 'DNI (ambos lados)' :
                  'carnet de conducir'
                }. Asegúrate de que todos los datos sean legibles.
              </AlertDescription>
            </Alert>

            <DocumentUpload
              documentType={identityData.documentType as DocumentType}
              onFilesChange={setIdDocuments}
              maxFiles={2}
            />

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Documento completo visible</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Sin reflejos ni sombras</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Fondo neutro</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Alta resolución</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Selfie */}
        {step === 3 && (
          <div className="space-y-4">
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Toma una foto de ti sosteniendo tu documento de identidad junto a tu rostro.
                Esto nos ayuda a verificar que eres el propietario del documento.
              </AlertDescription>
            </Alert>

            <DocumentUpload
              documentType="selfie"
              onFilesChange={setSelfie}
              maxFiles={1}
            />

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm">Consejos para una buena foto:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Buena iluminación (luz natural preferida)</li>
                <li>• Sostén el documento junto a tu rostro</li>
                <li>• Mira directamente a la cámara</li>
                <li>• Asegúrate de que el documento sea legible</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
        >
          Anterior
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || submitVerification.isPending}
          >
            {submitVerification.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Enviar verificación
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
