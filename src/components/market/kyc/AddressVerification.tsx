// src/components/market/kyc/AddressVerification.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Shield, 
  Info,
  Loader2 
} from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useSubmitVerification } from '@/hooks/market/useKyc';

interface AddressData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressVerificationProps {
  onComplete?: () => void;
}

const COUNTRIES = [
  { code: 'ES', name: 'España' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'UK', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemania' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'PT', name: 'Portugal' },
];

export function AddressVerification({ onComplete }: AddressVerificationProps) {
  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'ES',
  });
  const [documents, setDocuments] = useState<{ file: File; documentType: string }[]>([]);

  const submitVerification = useSubmitVerification();

  const handleSubmit = async () => {
    await submitVerification.mutateAsync({
      type: 'address',
      documents,
      metadata: addressData,
    });

    onComplete?.();
  };

  const isFormValid = addressData.street && addressData.city && 
                      addressData.postalCode && addressData.country && 
                      documents.length > 0;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Verificación de Dirección</CardTitle>
            <CardDescription>
              Confirma tu dirección de residencia con un documento oficial
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            El documento debe ser reciente (menos de 3 meses) y mostrar claramente tu nombre y dirección.
            Aceptamos facturas de servicios, extractos bancarios o documentos oficiales.
          </AlertDescription>
        </Alert>

        {/* Address Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Dirección completa</Label>
            <Textarea
              id="street"
              value={addressData.street}
              onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
              placeholder="Calle, número, piso, puerta..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={addressData.city}
                onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ej: Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Provincia / Estado</Label>
              <Input
                id="state"
                value={addressData.state}
                onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Ej: Madrid"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código postal</Label>
              <Input
                id="postalCode"
                value={addressData.postalCode}
                onChange={(e) => setAddressData(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="Ej: 28001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select
                value={addressData.country}
                onValueChange={(value) => setAddressData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h4 className="font-medium">Documento de prueba</h4>
          <p className="text-sm text-muted-foreground">
            Sube una factura de servicios (agua, luz, gas, internet), extracto bancario 
            o documento oficial que muestre tu dirección.
          </p>
          
          <DocumentUpload
            documentType="utility_bill"
            onFilesChange={setDocuments}
            maxFiles={2}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || submitVerification.isPending}
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
      </CardFooter>
    </Card>
  );
}
