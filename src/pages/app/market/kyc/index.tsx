// src/pages/app/market/kyc/index.tsx
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { KycStatusCard, KycProgressStepper } from '@/components/market/kyc';
import { useKycStatus } from '@/hooks/market/useKyc';

export default function MarketKycPage() {
  const navigate = useNavigate();
  const { data: kycStatus, isLoading } = useKycStatus();

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Verificación de Agente
          </h1>
          <p className="text-muted-foreground mt-1">
            Completa la verificación para desbloquear todas las funcionalidades
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <KycStatusCard />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progreso de Verificación</CardTitle>
          </CardHeader>
          <CardContent>
            <KycProgressStepper 
              onStartVerification={(type) => navigate(`/app/market/kyc/${type}`)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
