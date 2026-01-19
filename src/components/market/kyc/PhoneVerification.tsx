// src/components/market/kyc/PhoneVerification.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  Shield, 
  Send,
  CheckCircle2,
  Loader2 
} from 'lucide-react';
import { useSubmitVerification } from '@/hooks/market/useKyc';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  onComplete?: () => void;
}

export function PhoneVerification({ onComplete }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+34');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);

  const submitVerification = useSubmitVerification();

  const handleSendCode = async () => {
    setIsSending(true);
    // Simulate sending code - in production this would call an SMS service
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setStep('otp');
    toast.success('Código enviado a tu teléfono');
  };

  const handleVerify = async () => {
    // In production, verify the OTP with backend
    if (otp.length !== 6) {
      toast.error('Ingresa el código de 6 dígitos');
      return;
    }

    await submitVerification.mutateAsync({
      type: 'phone',
      metadata: {
        phone: `${countryCode}${phoneNumber}`,
        verified_at: new Date().toISOString(),
      },
    });

    onComplete?.();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Verificación de Teléfono</CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Ingresa tu número de teléfono' 
                : 'Ingresa el código que recibiste'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número de teléfono</Label>
              <div className="flex gap-2">
                <Input
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-20"
                  placeholder="+34"
                />
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="612345678"
                  className="flex-1"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Te enviaremos un código SMS para verificar tu número de teléfono.
                Pueden aplicarse tarifas de mensaje estándar.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Código enviado a <strong>{countryCode} {phoneNumber}</strong>
              </p>
              
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleSendCode}
                disabled={isSending}
                className="text-sm"
              >
                ¿No recibiste el código? Reenviar
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-end">
        {step === 'phone' ? (
          <Button
            onClick={handleSendCode}
            disabled={phoneNumber.length < 9 || isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar código
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || submitVerification.isPending}
          >
            {submitVerification.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verificar
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
