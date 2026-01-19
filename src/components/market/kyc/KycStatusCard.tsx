// src/components/market/kyc/KycStatusCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Star
} from 'lucide-react';
import { useKycStatus } from '@/hooks/market/useKyc';
import { KYC_LEVELS, KycLevel } from '@/types/kyc.types';
import { KycLevelBadge } from './KycLevelBadge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function KycStatusCard() {
  const { data: kycStatus, isLoading } = useKycStatus();

  if (isLoading || !kycStatus) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentConfig = KYC_LEVELS[kycStatus.currentLevel];
  const nextConfig = kycStatus.nextLevel ? KYC_LEVELS[kycStatus.nextLevel] : null;
  const progressPercent = (kycStatus.currentLevel / 5) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Estado de verificación
          </CardTitle>
          <KycLevelBadge level={kycStatus.currentLevel} />
        </div>
        <CardDescription>
          {currentConfig.description.es}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nivel {kycStatus.currentLevel}/5</span>
            <span className="font-medium">{currentConfig.name}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between">
            {([0, 1, 2, 3, 4, 5] as KycLevel[]).map(level => (
              <div 
                key={level}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${level <= kycStatus.currentLevel 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}
              >
                {level}
              </div>
            ))}
          </div>
        </div>

        {/* Current benefits */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Beneficios actuales</p>
          <div className="grid gap-1">
            {currentConfig.benefits.slice(0, 3).map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{benefit.es}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current limits */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <p className="text-sm font-medium">Límites</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Máx. transacción</span>
              <p className="font-medium">
                {currentConfig.limits.maxTransactionValue 
                  ? `€${currentConfig.limits.maxTransactionValue.toLocaleString()}`
                  : 'Ilimitado'
                }
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Vol. mensual</span>
              <p className="font-medium">
                {currentConfig.limits.maxMonthlyVolume 
                  ? `€${currentConfig.limits.maxMonthlyVolume.toLocaleString()}`
                  : 'Ilimitado'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Next level preview */}
        {nextConfig && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="font-medium">
                  Siguiente nivel: {nextConfig.label.es}
                </span>
              </div>
            </div>

            {/* Requirements status */}
            <div className="space-y-1">
              {nextConfig.requirements.map(req => {
                const isCompleted = kycStatus.completedRequirements.includes(req);
                const isPending = kycStatus.pendingRequirements.includes(req);

                return (
                  <div key={req} className="flex items-center gap-2 text-sm">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isPending ? (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={isCompleted ? 'text-muted-foreground line-through' : ''}>
                      {req.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Upgrade button */}
            <Button asChild className="w-full">
              <Link to="/app/market/kyc/verify">
                Subir de nivel
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
