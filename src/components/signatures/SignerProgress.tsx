/**
 * Componente para mostrar progreso de firmantes
 */

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Signer } from '@/hooks/signatures/useSignatureRequests';

interface Props {
  signers: Signer[];
  size?: 'sm' | 'md' | 'lg';
}

const roleLabels = {
  signer: 'Firmante',
  approver: 'Aprobador',
  cc: 'Copia',
};

export function SignerProgress({ signers, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div className="flex gap-1.5">
      {signers.map((signer, i) => {
        const isSigned = !!signer.signed_at;
        const isViewed = !!signer.viewed_at;
        const isDeclined = !!signer.declined_at;

        return (
          <Tooltip key={signer.id || i}>
            <TooltipTrigger>
              <div
                className={cn(
                  sizeClasses[size],
                  "rounded-full flex items-center justify-center font-medium border-2 transition-colors",
                  isDeclined
                    ? "bg-red-100 text-red-700 border-red-300"
                    : isSigned
                      ? "bg-green-100 text-green-700 border-green-300"
                      : isViewed
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                )}
              >
                {isDeclined ? '✗' : isSigned ? '✓' : signer.order || i + 1}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-1 text-left">
                <p className="font-medium">{signer.name}</p>
                <p className="text-xs text-muted-foreground">{signer.email}</p>
                <p className="text-xs">
                  {roleLabels[signer.role]}
                </p>
                {isDeclined ? (
                  <p className="text-xs text-red-600">
                    ✗ Rechazado {signer.declined_at && format(new Date(signer.declined_at), 'dd MMM yyyy', { locale: es })}
                  </p>
                ) : isSigned ? (
                  <p className="text-xs text-green-600">
                    ✓ Firmado {format(new Date(signer.signed_at!), 'dd MMM yyyy', { locale: es })}
                  </p>
                ) : isViewed ? (
                  <p className="text-xs text-blue-600">
                    👁 Visto {format(new Date(signer.viewed_at!), 'dd MMM yyyy', { locale: es })}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Pendiente
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
