/**
 * Badge para mostrar estado de firma
 */

import { Badge } from '@/components/ui/badge';
import {
  FileSignature, Send, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SignatureStatus = 'draft' | 'sent' | 'viewed' | 'partially_signed' | 'completed' | 'declined' | 'expired' | 'voided';

const statusConfig: Record<SignatureStatus, {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ElementType;
  className?: string;
}> = {
  draft: {
    label: 'Borrador',
    variant: 'secondary',
    icon: FileSignature,
  },
  sent: {
    label: 'Enviado',
    variant: 'default',
    icon: Send,
    className: 'bg-blue-500 hover:bg-blue-600',
  },
  viewed: {
    label: 'Visto',
    variant: 'default',
    icon: Eye,
    className: 'bg-blue-500 hover:bg-blue-600',
  },
  partially_signed: {
    label: 'Parcialmente firmado',
    variant: 'default',
    icon: Clock,
    className: 'bg-amber-500 hover:bg-amber-600',
  },
  completed: {
    label: 'Completado',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-green-500 hover:bg-green-600',
  },
  declined: {
    label: 'Rechazado',
    variant: 'destructive',
    icon: XCircle,
  },
  expired: {
    label: 'Expirado',
    variant: 'outline',
    icon: AlertCircle,
  },
  voided: {
    label: 'Anulado',
    variant: 'outline',
    icon: Ban,
  },
};

interface Props {
  status: SignatureStatus;
  className?: string;
  showIcon?: boolean;
}

export function SignatureStatusBadge({ status, className, showIcon = true }: Props) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
