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
import { useTransaction, useThreadMessages, useSendMessage } from '@/hooks/market';
import { 
  TransactionTimeline, 
  TransactionStatusBadge, 
  TransactionActions,
  TransactionSummary
} from '@/components/market/transactions';
import { MessageThread, MessageInput } from '@/components/market/messages';
import { EscrowStatus } from '@/components/market/payments';
import { PriceDisplay } from '@/components/market/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';

type EscrowStatusType = 'pending' | 'funded' | 'in_progress' | 'released' | 'refunded' | 'disputed';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMessages, setShowMessages] = useState(false);
  const [showContract, setShowContract] = useState(false);

  const { data: transaction, isLoading } = useTransaction(id);
  
  // Get thread ID for messages
  const threadId = transaction ? `tx_${transaction.id}` : undefined;
  const { messages, isLoading: messagesLoading } = useThreadMessages(threadId);
  const sendMessage = useSendMessage();

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

  const listing = (transaction as any).listing;
  const asset = listing?.asset;
  const buyer = (transaction as any).buyer;
  const seller = listing?.seller || (transaction as any).seller;
  const isBuyer = user?.id === transaction.buyer_id;
  const role: 'buyer' | 'seller' = isBuyer ? 'buyer' : 'seller';
  const counterparty = isBuyer ? seller : buyer;

  const handleSendMessage = async (content: string) => {
    const recipientId = isBuyer ? transaction.seller_id : transaction.buyer_id;
    await sendMessage.mutateAsync({
      threadId: `tx_${transaction.id}`,
      recipientId,
      transactionId: transaction.id,
      content,
    });
  };

  const handleOpenMessages = () => setShowMessages(true);
  const handleOpenContract = () => setShowContract(true);

  // Map escrow status
  const getEscrowStatus = (): EscrowStatusType => {
    const status = transaction.escrow_status;
    if (!status) return 'pending';
    const validStatuses: EscrowStatusType[] = ['pending', 'funded', 'in_progress', 'released', 'refunded', 'disputed'];
    return validStatuses.includes(status as EscrowStatusType) ? status as EscrowStatusType : 'pending';
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
            <TransactionStatusBadge status={transaction.status} />
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
              <TransactionSummary transaction={transaction} role={role} />

              {/* Actions */}
              <TransactionActions 
                transaction={transaction}
                role={role}
                onOpenMessages={handleOpenMessages}
                onOpenContract={handleOpenContract}
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
                    events={[]}
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
                  amount={transaction.agreed_price || 0}
                  currency={transaction.currency || 'EUR'}
                  className="text-3xl font-bold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <EscrowStatus
            status={getEscrowStatus()}
            amount={transaction.agreed_price || 0}
            currency={transaction.currency || 'EUR'}
            fundedAt={transaction.paid_at || undefined}
            releasedAt={transaction.completed_at || undefined}
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
