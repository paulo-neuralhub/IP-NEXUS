// src/components/market/kyc/KycProgressStepper.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Mail,
  Phone,
  User,
  MapPin,
  Wallet,
  Building,
  Users,
  Award,
  Shield
} from 'lucide-react';
import { useKycStatus } from '@/hooks/market/useKyc';
import { VerificationType, VERIFICATION_STEPS } from '@/types/kyc.types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ICONS: Record<string, any> = {
  Mail,
  Phone,
  User,
  MapPin,
  Wallet,
  Building,
  Users,
  Award,
  Shield,
};

interface KycProgressStepperProps {
  onStartVerification?: (type: VerificationType) => void;
}

export function KycProgressStepper({ onStartVerification }: KycProgressStepperProps) {
  const { data: kycStatus, isLoading } = useKycStatus();

  if (isLoading || !kycStatus) {
    return null;
  }

  const verificationTypes: VerificationType[] = [
    'email',
    'phone',
    'identity',
    'address',
    'source_of_funds',
    'business',
    'ubo',
    'agent_license',
    'professional_insurance',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pasos de verificación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {verificationTypes.map((type, index) => {
          const step = VERIFICATION_STEPS[type];
          const verification = kycStatus.verifications[type];
          const Icon = ICONS[step.icon] || Shield;
          
          const status = verification?.status || 'not_started';
          const isCompleted = status === 'approved';
          const isPending = status === 'pending' || status === 'in_review';
          const isRejected = status === 'rejected';
          const isLocked = step.requiredLevel > kycStatus.currentLevel + 1;

          const route = `/app/market/kyc/verify/${type}`;

          return (
            <div 
              key={type}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                isCompleted && 'bg-green-50 border-green-200',
                isPending && 'bg-yellow-50 border-yellow-200',
                isRejected && 'bg-red-50 border-red-200',
                isLocked && 'opacity-50',
                !isCompleted && !isPending && !isRejected && !isLocked && 'hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isCompleted && 'bg-green-100 text-green-700',
                isPending && 'bg-yellow-100 text-yellow-700',
                isRejected && 'bg-red-100 text-red-700',
                !isCompleted && !isPending && !isRejected && 'bg-muted text-muted-foreground'
              )}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">{step.label.es}</p>
                <p className="text-xs text-muted-foreground">{step.description.es}</p>
              </div>

              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    En revisión
                  </Badge>
                )}
                {isRejected && (
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Rechazado
                  </Badge>
                )}
                {!isCompleted && !isPending && !isLocked && (
                  onStartVerification ? (
                    <Button variant="ghost" size="sm" onClick={() => onStartVerification(type)}>
                      Verificar
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={route}>
                        Verificar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
