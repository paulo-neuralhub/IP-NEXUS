// src/components/market/kyc/BusinessVerification.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Shield, 
  Info,
  Loader2,
  Users 
} from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useSubmitVerification } from '@/hooks/market/useKyc';

interface BusinessData {
  companyName: string;
  legalForm: string;
  registrationNumber: string;
  taxId: string;
  incorporationDate: string;
  country: string;
  address: string;
  website: string;
  industry: string;
}

interface UBO {
  name: string;
  nationality: string;
  ownership: string;
  dateOfBirth: string;
}

interface BusinessVerificationProps {
  onComplete?: () => void;
}

export function BusinessVerification({ onComplete }: BusinessVerificationProps) {
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: '',
    legalForm: 'sl',
    registrationNumber: '',
    taxId: '',
    incorporationDate: '',
    country: 'ES',
    address: '',
    website: '',
    industry: '',
  });
  const [ubos, setUbos] = useState<UBO[]>([
    { name: '', nationality: '', ownership: '', dateOfBirth: '' }
  ]);
  const [companyDocs, setCompanyDocs] = useState<{ file: File; documentType: string }[]>([]);
  const [uboDocs, setUboDocs] = useState<{ file: File; documentType: string }[]>([]);

  const submitVerification = useSubmitVerification();

  const addUbo = () => {
    setUbos([...ubos, { name: '', nationality: '', ownership: '', dateOfBirth: '' }]);
  };

  const updateUbo = (index: number, field: keyof UBO, value: string) => {
    const updated = [...ubos];
    updated[index][field] = value;
    setUbos(updated);
  };

  const removeUbo = (index: number) => {
    if (ubos.length > 1) {
      setUbos(ubos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    const allDocuments = [...companyDocs, ...uboDocs];
    
    await submitVerification.mutateAsync({
      type: 'business',
      documents: allDocuments,
      metadata: {
        ...businessData,
        ubos,
      },
    });

    // Also submit UBO verification
    await submitVerification.mutateAsync({
      type: 'ubo',
      documents: uboDocs,
      metadata: { ubos },
    });

    onComplete?.();
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle>Verificación Empresarial</CardTitle>
            <CardDescription>
              Paso {step} de 3: {
                step === 1 ? 'Datos de la empresa' :
                step === 2 ? 'Beneficiarios finales (UBO)' :
                'Documentación'
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
              className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        {/* Step 1: Company Data */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la empresa</Label>
                <Input
                  value={businessData.companyName}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Razón social completa"
                />
              </div>
              <div className="space-y-2">
                <Label>Forma jurídica</Label>
                <Select
                  value={businessData.legalForm}
                  onValueChange={(value) => setBusinessData(prev => ({ ...prev, legalForm: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sl">Sociedad Limitada (S.L.)</SelectItem>
                    <SelectItem value="sa">Sociedad Anónima (S.A.)</SelectItem>
                    <SelectItem value="slp">S.L. Profesional</SelectItem>
                    <SelectItem value="autonomo">Autónomo</SelectItem>
                    <SelectItem value="other">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de registro mercantil</Label>
                <Input
                  value={businessData.registrationNumber}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="Ej: B12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>NIF/CIF</Label>
                <Input
                  value={businessData.taxId}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, taxId: e.target.value }))}
                  placeholder="Ej: B12345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de constitución</Label>
                <Input
                  type="date"
                  value={businessData.incorporationDate}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, incorporationDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sector/Industria</Label>
                <Input
                  value={businessData.industry}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Ej: Propiedad Intelectual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección del domicilio social</Label>
              <Textarea
                value={businessData.address}
                onChange={(e) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Dirección completa..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Sitio web (opcional)</Label>
              <Input
                value={businessData.website}
                onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://www.ejemplo.com"
              />
            </div>
          </div>
        )}

        {/* Step 2: UBOs */}
        {step === 2 && (
          <div className="space-y-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Indica todas las personas físicas que posean directa o indirectamente más del 25% de la empresa.
              </AlertDescription>
            </Alert>

            {ubos.map((ubo, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Beneficiario {index + 1}</h4>
                  {ubos.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeUbo(index)}>
                      Eliminar
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre completo</Label>
                    <Input
                      value={ubo.name}
                      onChange={(e) => updateUbo(index, 'name', e.target.value)}
                      placeholder="Nombre y apellidos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nacionalidad</Label>
                    <Input
                      value={ubo.nationality}
                      onChange={(e) => updateUbo(index, 'nationality', e.target.value)}
                      placeholder="Ej: Española"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Porcentaje de participación</Label>
                    <Input
                      value={ubo.ownership}
                      onChange={(e) => updateUbo(index, 'ownership', e.target.value)}
                      placeholder="Ej: 50%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de nacimiento</Label>
                    <Input
                      type="date"
                      value={ubo.dateOfBirth}
                      onChange={(e) => updateUbo(index, 'dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button variant="outline" onClick={addUbo} className="w-full">
              + Añadir otro beneficiario
            </Button>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Documentos de la empresa</h4>
              <DocumentUpload
                documentType="company_registration"
                onFilesChange={setCompanyDocs}
                maxFiles={3}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Documentos de beneficiarios (UBO)</h4>
              <p className="text-sm text-muted-foreground">
                Sube el registro de accionistas o documento que acredite la estructura de propiedad.
              </p>
              <DocumentUpload
                documentType="shareholder_register"
                onFilesChange={setUboDocs}
                maxFiles={3}
              />
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
          <Button onClick={() => setStep(s => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={companyDocs.length === 0 || submitVerification.isPending}
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
