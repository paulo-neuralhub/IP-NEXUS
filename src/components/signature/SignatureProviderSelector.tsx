// ============================================================
// IP-NEXUS - SIGNATURE PROVIDER SELECTOR
// Component to select e-signature provider
// ============================================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Globe, Zap, TestTube, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignatureProvider } from '@/lib/signature/signatureService';

interface SignatureProviderSelectorProps {
  selectedProvider: SignatureProvider;
  onSelect: (provider: SignatureProvider) => void;
  availableProviders?: SignatureProvider[];
  disabledProviders?: SignatureProvider[];
  showSimulation?: boolean;
}

interface ProviderInfo {
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  color: string;
  bgColor: string;
}

const providerInfo: Record<SignatureProvider, ProviderInfo> = {
  boldsign: {
    name: 'BoldSign',
    description: 'Firma electrónica avanzada con cumplimiento eIDAS',
    icon: Zap,
    features: ['eIDAS compliant', 'Audit trail', 'Multi-idioma'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
  },
  yousign: {
    name: 'Yousign',
    description: 'Firma electrónica europea con validez legal',
    icon: Globe,
    features: ['GDPR compliant', 'Firma cualificada', 'API v3'],
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  simulation: {
    name: 'Simulación',
    description: 'Modo de prueba sin envío real',
    icon: TestTube,
    features: ['Sin coste', 'Testing', 'Desarrollo'],
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};

export function SignatureProviderSelector({
  selectedProvider,
  onSelect,
  availableProviders = ['boldsign', 'yousign'],
  disabledProviders = [],
  showSimulation = true,
}: SignatureProviderSelectorProps) {
  const providers = showSimulation 
    ? [...availableProviders, 'simulation' as SignatureProvider]
    : availableProviders;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {providers.map((providerId) => {
        const provider = providerInfo[providerId];
        if (!provider) return null;

        const Icon = provider.icon;
        const isSelected = selectedProvider === providerId;
        const isDisabled = disabledProviders.includes(providerId);

        return (
          <Card
            key={providerId}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected && 'ring-2 ring-primary border-primary',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !isDisabled && onSelect(providerId)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    provider.bgColor,
                    providerId !== 'simulation' && 'text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
                {isDisabled && (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <h4 className={cn('font-semibold mb-1', provider.color)}>
                {provider.name}
              </h4>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {provider.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {provider.features.map((feature) => (
                  <Badge
                    key={feature}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default SignatureProviderSelector;
