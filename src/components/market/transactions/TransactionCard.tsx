import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Clock, MessageSquare } from 'lucide-react';
import type { MarketTransaction } from '@/types/market.types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: MarketTransaction;
  role: 'buyer' | 'seller';
}

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-gray-100 text-gray-800',
  negotiation: 'bg-blue-100 text-blue-800',
  offer_made: 'bg-yellow-100 text-yellow-800',
  offer_accepted: 'bg-green-100 text-green-800',
  due_diligence: 'bg-purple-100 text-purple-800',
  contract_draft: 'bg-indigo-100 text-indigo-800',
  contract_review: 'bg-indigo-100 text-indigo-800',
  pending_payment: 'bg-orange-100 text-orange-800',
  payment_in_escrow: 'bg-emerald-100 text-emerald-800',
  pending_transfer: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-red-100 text-red-800',
};

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

export function TransactionCard({ transaction, role }: TransactionCardProps) {
  const otherParty = role === 'buyer' 
    ? (transaction as any).seller 
    : (transaction as any).buyer;
  const listing = (transaction as any).listing;
  const mainImage = listing?.asset?.images?.[0] || '/placeholder.svg';

  return (
    <Link to={`/app/market/transactions/${transaction.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={mainImage} 
                alt={listing?.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {transaction.transaction_number}
                  </p>
                  <h3 className="font-medium truncate">
                    {listing?.title}
                  </h3>
                </div>
                <Badge className={STATUS_COLORS[transaction.status] || 'bg-gray-100'}>
                  {STATUS_LABELS[transaction.status] || transaction.status}
                </Badge>
              </div>

              {/* Other party */}
              {otherParty && (
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={otherParty.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {otherParty.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {role === 'buyer' ? 'Vendedor' : 'Comprador'}:{' '}
                    <span className="text-foreground">{otherParty.display_name}</span>
                  </span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <PriceDisplay 
                  amount={transaction.agreed_price} 
                  currency={transaction.currency}
                  size="sm"
                />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(transaction.updated_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
