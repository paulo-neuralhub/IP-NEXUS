// src/pages/app/market/transactions/[id].tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MessageSquare, 
  FileText, 
  Clock,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useTransaction, useTransactionMessages } from '@/hooks/market';
import { 
  TransactionTimeline, 
  TransactionStatus, 
  TransactionActions,
  TransactionSummary
} from '@/components/market/transactions';
import { MessageThread, MessageInput } from '@/components/market/messages';
import { EscrowStatus } from '@/components/market/payments';
import { PriceDisplay } from '@/components/market/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: transaction, isLoading } = useTransaction(id);
  const { 
    messages, 
    isLoading: messagesLoading,
    sendMessage 
  } = useTransactionMessages(id);

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Transacción no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              La transacción que buscas no existe o no tienes acceso.
            </p>
            <Link to="/app/market/transactions">
              <Button>Volver a transacciones</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const listing = transaction.listing as any;
  const asset = listing?.asset;
  const buyer = transaction.buyer as any;
  const seller = listing?.seller as any;
  const isBuyer = user?.id === transaction.buyer_id;
  const counterparty = isBuyer ? seller : buyer;

  const handleSendMessage = async (content: string) => {
    await sendMessage({ content });
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/market/transactions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{listing?.title || 'Transacción'}</h1>
            <TransactionStatus status={transaction.status} />
          </div>
          <p className="text-muted-foreground">
            ID: {transaction.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">
                <FileText className="h-4 w-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Clock className="h-4 w-4 mr-2" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Transaction Summary */}
              <TransactionSummary transaction={transaction} />

              {/* Actions */}
              <TransactionActions 
                transaction={transaction}
                isBuyer={isBuyer}
              />
            </TabsContent>

            <TabsContent value="messages" className="mt-6">
              <Card className="h-[500px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={counterparty?.avatar_url} />
                      <AvatarFallback>
                        {counterparty?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {counterparty?.display_name || 'Usuario'}
                  </CardTitle>
                </CardHeader>
                <Separator />
                <MessageThread 
                  messages={messages || []}
                  currentUserId={user?.id || ''}
                  isLoading={messagesLoading}
                />
                <MessageInput onSend={handleSendMessage} />
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de la transacción</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionTimeline 
                    currentStatus={transaction.status}
                    events={transaction.status_history || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Precio acordado</p>
                <PriceDisplay 
                  amount={transaction.agreed_price || listing?.price || 0}
                  currency={transaction.currency || 'EUR'}
                  className="text-3xl font-bold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <EscrowStatus
            status={transaction.escrow_status || 'pending'}
            amount={transaction.escrow_amount || transaction.agreed_price || 0}
            currency={transaction.currency || 'EUR'}
            fundedAt={transaction.escrow_funded_at}
            releasedAt={transaction.escrow_released_at}
          />

          {/* Counterparty */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {isBuyer ? 'Vendedor' : 'Comprador'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={counterparty?.avatar_url} />
                  <AvatarFallback>
                    {counterparty?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{counterparty?.display_name || 'Usuario'}</p>
                  {counterparty?.is_verified && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Shield className="h-3 w-3" />
                      Verificado
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset link */}
          {listing && (
            <Link to={`/app/market/listings/${listing.id}`}>
              <Button variant="outline" className="w-full">
                Ver listing original
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
