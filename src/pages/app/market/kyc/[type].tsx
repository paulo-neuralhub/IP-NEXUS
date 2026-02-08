// src/pages/app/market/kyc/[type].tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  IdentityVerification, 
  AddressVerification, 
  PhoneVerification,
  BusinessVerification 
} from '@/components/market/kyc';
import { VerificationType } from '@/types/kyc.types';

export default function KycVerificationPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/app/market/kyc');
  };

  const renderVerification = () => {
    switch (type as VerificationType) {
      case 'identity':
        return <IdentityVerification onComplete={handleComplete} />;
      case 'address':
        return <AddressVerification onComplete={handleComplete} />;
      case 'phone':
        return <PhoneVerification onComplete={handleComplete} />;
      case 'business':
      case 'ubo':
        return <BusinessVerification onComplete={handleComplete} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Tipo de verificación no disponible
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/app/market/kyc')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Verificación
      </Button>

      {renderVerification()}
    </div>
  );
}
