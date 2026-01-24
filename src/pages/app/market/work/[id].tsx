// src/pages/app/market/work/[id].tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTransaction, useUpdateTransactionStatus } from '@/hooks/market/useTransaction';
import { useApproveWork } from '@/hooks/market/useWorkflow';
import { useReleaseEscrow } from '@/hooks/market/useEscrow';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Star,
  ExternalLink,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  XCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TRANSACTION_STATUS_CONFIG, type TransactionStatus } from '@/types/market.types';

// Import work components
import { WorkChat } from '@/components/market/work/WorkChat';
import { WorkTimeline } from '@/components/market/work/WorkTimeline';
import { WorkFiles } from '@/components/market/work/WorkFiles';
import { ReviewModal } from '@/components/market/work/ReviewModal';
import { CompleteWorkModal } from '@/components/market/work/CompleteWorkModal';
import { RequestChangesModal } from '@/components/market/work/RequestChangesModal';
import { TransactionStatusBadge } from '@/components/market/transactions/TransactionStatus';
import { EscrowStatus } from '@/components/market/payments/EscrowStatus';
import { PriceDisplay } from '@/components/market/shared/PriceDisplay';

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);

  const { data: transaction, isLoading, error } = useTransaction(id);
  const updateStatus = useUpdateTransactionStatus();
  const approveWork = useApproveWork();
  const releaseEscrow = useReleaseEscrow();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Trabajo no encontrado</p>
            <p className="text-muted-foreground">El trabajo que buscas no existe o no tienes acceso</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const buyer = (transaction as any).buyer;
  const seller = (transaction as any).seller;
  const listing = (transaction as any).listing;
  const asset = listing?.asset;
  
  const isBuyer = currentUserId === transaction.buyer_id;
  const isSeller = currentUserId === transaction.seller_id;
  const role = isBuyer ? 'buyer' : isSeller ? 'seller' : 'viewer';
  
  const counterparty = isBuyer ? seller : buyer;
  const counterpartyId = isBuyer ? transaction.seller_id : transaction.buyer_id;
  
  const status = transaction.status as TransactionStatus;
  const statusConfig = TRANSACTION_STATUS_CONFIG[status];
  
  // Status checks
  const isInProgress = ['payment_in_escrow', 'pending_transfer'].includes(status);
  const isPendingReview = status === 'pending_transfer';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';
  const isDisputed = status === 'disputed';

  const handleApproveAndPay = async () => {
    try {
      // First release escrow
      await releaseEscrow.mutateAsync(id!);
      // Then mark as approved
      await approveWork.mutateAsync(id!);
      // Show review modal
      setShowReviewModal(true);
    } catch (e) {
      // Error handled by mutation
    }
  };

  const handleDispute = async () => {
    await updateStatus.mutateAsync({
      transactionId: id!,
      status: 'disputed',
    });
  };

  const getEscrowStatusType = (): 'pending' | 'funded' | 'released' | 'refunded' | 'disputed' => {
    switch (status) {
      case 'pending_payment': return 'pending';
      case 'payment_in_escrow': 
      case 'pending_transfer': return 'funded';
      case 'completed': return 'released';
      case 'disputed': return 'disputed';
      case 'cancelled': return 'refunded';
      default: return 'pending';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{transaction.transaction_number}</h1>
              <TransactionStatusBadge status={status} />
            </div>
            <p className="text-muted-foreground">
              {listing?.title || asset?.title || 'Transacción'}
            </p>
          </div>
        </div>

        {/* Status-based actions */}
        <div className="flex items-center gap-2">
          {isSeller && isInProgress && !isPendingReview && (
            <Button onClick={() => setShowCompleteModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar Completado
            </Button>
          )}

          {isBuyer && isPendingReview && (
            <>
              <Button variant="outline" onClick={() => setShowChangesModal(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Solicitar Cambios
              </Button>
              <Button 
                onClick={handleApproveAndPay} 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={approveWork.isPending || releaseEscrow.isPending}
              >
                {(approveWork.isPending || releaseEscrow.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar y Liberar Pago
              </Button>
            </>
          )}

          {isCompleted && !showReviewModal && isBuyer && (
            <Button variant="outline" onClick={() => setShowReviewModal(true)}>
              <Star className="h-4 w-4 mr-2" />
              Dejar Review
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {isPendingReview && isBuyer && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Pendiente de revisión</AlertTitle>
          <AlertDescription>
            El agente ha marcado el trabajo como completado. Revisa los entregables y aprueba para liberar el pago.
          </AlertDescription>
        </Alert>
      )}

      {isPendingReview && isSeller && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle>Esperando aprobación</AlertTitle>
          <AlertDescription>
            Has marcado el trabajo como completado. El cliente está revisando los entregables.
          </AlertDescription>
        </Alert>
      )}

      {isCompleted && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertTitle>Trabajo completado</AlertTitle>
          <AlertDescription>
            Esta transacción ha sido completada exitosamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="gap-2">
                <FileText className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensajes
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-2">
                <FileText className="h-4 w-4" />
                Archivos
              </TabsTrigger>
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Transaction Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Trabajo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                      <p className="font-medium">
                        {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                    {transaction.completed_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de finalización</p>
                        <p className="font-medium">
                          {format(new Date(transaction.completed_at), 'dd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>

                  {transaction.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Notas</p>
                        <p className="text-sm">{transaction.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Listing Info */}
              {listing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Activo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      {asset?.images?.[0] && (
                        <img 
                          src={asset.images[0]} 
                          alt={listing.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                        <Link 
                          to={`/app/market/listings/${listing.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                        >
                          Ver listing <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              {currentUserId && counterpartyId && (
                <WorkChat
                  transactionId={id!}
                  currentUserId={currentUserId}
                  recipientId={counterpartyId}
                  isReadOnly={isCompleted || isCancelled}
                />
              )}
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              <WorkFiles
                transactionId={id!}
                isReadOnly={isCompleted || isCancelled}
              />
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <WorkTimeline transactionId={id!} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precio Acordado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceDisplay 
                amount={transaction.agreed_price || transaction.offered_price || 0} 
                currency={transaction.currency || 'EUR'} 
                size="lg"
              />
            </CardContent>
          </Card>

          {/* Escrow Status */}
          <EscrowStatus
            status={getEscrowStatusType()}
            amount={transaction.agreed_price || transaction.offered_price || 0}
            currency={transaction.currency || 'EUR'}
            fundedAt={transaction.paid_at || undefined}
            releasedAt={transaction.completed_at || undefined}
          />

          {/* Counterparty Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isBuyer ? 'Agente' : 'Cliente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={counterparty?.avatar_url || undefined} />
                  <AvatarFallback>
                    {counterparty?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{counterparty?.display_name || 'Usuario'}</p>
                  {counterparty?.reputation_score && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{(counterparty.reputation_score / 20).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                to={`/app/market/agents/${counterpartyId}`}
                className="inline-flex items-center gap-1 text-sm text-primary mt-4 hover:underline"
              >
                Ver perfil <ExternalLink className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          {/* Actions for Dispute */}
          {isInProgress && !isDisputed && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  ¿Problemas?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Si tienes problemas con esta transacción, puedes abrir una disputa.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleDispute}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Abrir Disputa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        transactionId={id!}
        reviewedId={counterpartyId || ''}
        reviewedName={counterparty?.display_name || 'Usuario'}
      />

      <CompleteWorkModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        transactionId={id!}
      />

      <RequestChangesModal
        open={showChangesModal}
        onOpenChange={setShowChangesModal}
        transactionId={id!}
      />
    </div>
  );
}
