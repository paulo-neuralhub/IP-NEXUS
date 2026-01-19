// src/components/market/transactions/TransactionSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, FileText, CreditCard } from 'lucide-react';
import type { MarketTransaction } from '@/types/market.types';
import { PriceDisplay } from '../shared/PriceDisplay';
import { TransactionStatusBadge } from './TransactionStatus';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionSummaryProps {
  transaction: MarketTransaction;
  role: 'buyer' | 'seller';
}

export function TransactionSummary({ transaction, role }: TransactionSummaryProps) {
  const listing = (transaction as any).listing;
  const buyer = (transaction as any).buyer;
  const seller = listing?.seller || (transaction as any).seller;
  const otherParty = role === 'buyer' ? seller : buyer;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-mono">
              {transaction.transaction_number}
            </p>
            <CardTitle className="text-xl mt-1">{listing?.title}</CardTitle>
          </div>
          <TransactionStatusBadge status={transaction.status} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Vendedor</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={seller?.avatar_url} />
                <AvatarFallback>{seller?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{seller?.display_name}</p>
                {seller?.is_verified && (
                  <p className="text-xs text-primary">Verificado</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Comprador</p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={buyer?.avatar_url} />
                <AvatarFallback>{buyer?.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{buyer?.display_name || 'Tú'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Financial summary */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Resumen financiero
          </h4>
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio acordado</span>
              <PriceDisplay amount={transaction.agreed_price} currency={transaction.currency} />
            </div>
            {(transaction as any).commission_amount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comisión plataforma</span>
                <span>
                  -{new Intl.NumberFormat('es-ES', { 
                    style: 'currency', 
                    currency: transaction.currency 
                  }).format((transaction as any).commission_amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fechas
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creada</span>
              <span>{format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última actualización</span>
              <span>{format(new Date(transaction.updated_at), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
            </div>
          </div>
        </div>

        {/* Transaction type */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Tipo de transacción</span>
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {transaction.transaction_type?.replace(/_/g, ' ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
