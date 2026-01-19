// src/components/market/transactions/TransactionStatus.tsx
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  CreditCard,
  Shield,
  Send,
  FileText
} from 'lucide-react';
import type { TransactionStatus as TxStatus } from '@/types/market.types';
import { cn } from '@/lib/utils';

interface TransactionStatusProps {
  status: TxStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  inquiry: { label: 'Consulta', color: 'bg-gray-100 text-gray-800', icon: Clock },
  negotiation: { label: 'Negociación', color: 'bg-blue-100 text-blue-800', icon: Clock },
  offer_made: { label: 'Oferta realizada', color: 'bg-yellow-100 text-yellow-800', icon: Send },
  offer_accepted: { label: 'Oferta aceptada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  due_diligence: { label: 'Due Diligence', color: 'bg-purple-100 text-purple-800', icon: FileText },
  contract_draft: { label: 'Borrador', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
  contract_review: { label: 'Revisión', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
  pending_payment: { label: 'Pendiente pago', color: 'bg-orange-100 text-orange-800', icon: CreditCard },
  payment_in_escrow: { label: 'En escrow', color: 'bg-emerald-100 text-emerald-800', icon: Shield },
  pending_transfer: { label: 'Pendiente transferencia', color: 'bg-cyan-100 text-cyan-800', icon: Send },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
  disputed: { label: 'En disputa', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

export function TransactionStatusBadge({ status, size = 'md', showIcon = true }: TransactionStatusProps) {
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    color: 'bg-gray-100 text-gray-800', 
    icon: Clock 
  };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      className={cn(
        config.color,
        sizeClasses[size],
        'font-medium'
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {config.label}
    </Badge>
  );
}
