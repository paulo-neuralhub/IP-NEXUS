// src/components/market/transactions/TransactionTimeline.tsx
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MessageSquare,
  FileText,
  CreditCard,
  Shield,
  Send,
  PartyPopper
} from 'lucide-react';
import type { TransactionStatus } from '@/types/market.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  status: TransactionStatus;
  timestamp?: string;
  note?: string;
}

interface TransactionTimelineProps {
  currentStatus: TransactionStatus;
  events?: TimelineEvent[];
}

const STATUS_ORDER: TransactionStatus[] = [
  'inquiry',
  'negotiation',
  'offer_made',
  'offer_accepted',
  'due_diligence',
  'contract_draft',
  'contract_review',
  'pending_payment',
  'payment_in_escrow',
  'pending_transfer',
  'completed',
];

const STATUS_LABELS: Record<string, string> = {
  inquiry: 'Consulta',
  negotiation: 'Negociación',
  offer_made: 'Oferta realizada',
  offer_accepted: 'Oferta aceptada',
  due_diligence: 'Due Diligence',
  contract_draft: 'Borrador de contrato',
  contract_review: 'Revisión de contrato',
  pending_payment: 'Pendiente de pago',
  payment_in_escrow: 'Pago en escrow',
  pending_transfer: 'Pendiente de transferencia',
  completed: 'Completada',
  cancelled: 'Cancelada',
  disputed: 'En disputa',
};

const STATUS_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  inquiry: MessageSquare,
  negotiation: MessageSquare,
  offer_made: Send,
  offer_accepted: CheckCircle2,
  due_diligence: FileText,
  contract_draft: FileText,
  contract_review: FileText,
  pending_payment: CreditCard,
  payment_in_escrow: Shield,
  pending_transfer: Send,
  completed: PartyPopper,
  cancelled: AlertCircle,
  disputed: AlertCircle,
};

export function TransactionTimeline({ currentStatus, events = [] }: TransactionTimelineProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus as TransactionStatus);
  const eventsMap = new Map(events.map(e => [e.status, e]));

  // Show different UI if cancelled or disputed
  if (currentStatus === 'cancelled' || currentStatus === 'disputed') {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-950 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
        <div>
          <p className="font-medium text-red-700 dark:text-red-300">
            {STATUS_LABELS[currentStatus]}
          </p>
          {eventsMap.get(currentStatus as TransactionStatus)?.note && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {eventsMap.get(currentStatus as TransactionStatus)?.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {STATUS_ORDER.map((status, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;
        const event = eventsMap.get(status);
        const Icon = STATUS_ICONS[status] || Clock;

        return (
          <div key={status} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2',
                isComplete && 'bg-green-500 border-green-500 text-white',
                isCurrent && 'bg-primary border-primary text-primary-foreground',
                isPending && 'bg-muted border-muted-foreground/30 text-muted-foreground'
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              {index < STATUS_ORDER.length - 1 && (
                <div className={cn(
                  'w-0.5 h-12 mt-2',
                  isComplete ? 'bg-green-500' : 'bg-muted-foreground/30'
                )} />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-8', isPending && 'opacity-50')}>
              <div className="flex items-center justify-between">
                <h4 className={cn(
                  'font-medium',
                  isCurrent && 'text-primary'
                )}>
                  {STATUS_LABELS[status]}
                </h4>
                {event?.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm', { locale: es })}
                  </span>
                )}
              </div>
              {event?.note && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.note}
                </p>
              )}
              {isCurrent && (
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm text-primary">En progreso</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
