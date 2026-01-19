// src/components/market/transactions/TransactionActions.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  AlertTriangle,
  Send,
  Download
} from 'lucide-react';
import type { MarketTransaction, TransactionStatus } from '@/types/market.types';
import { useUpdateTransactionStatus } from '@/hooks/market/useTransaction';
import { useInitiatePayment, useReleaseEscrow } from '@/hooks/market/useEscrow';

interface TransactionActionsProps {
  transaction: MarketTransaction;
  role: 'buyer' | 'seller';
  onOpenMessages: () => void;
  onOpenContract: () => void;
}

export function TransactionActions({ 
  transaction, 
  role, 
  onOpenMessages,
  onOpenContract 
}: TransactionActionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const updateStatus = useUpdateTransactionStatus();
  const initiatePayment = useInitiatePayment();
  const releaseEscrow = useReleaseEscrow();

  const handleCancel = () => {
    updateStatus.mutate({
      transactionId: transaction.id,
      status: 'cancelled' as TransactionStatus,
      notes: cancelReason,
    });
    setShowCancelDialog(false);
  };

  const handleDispute = () => {
    updateStatus.mutate({
      transactionId: transaction.id,
      status: 'disputed' as TransactionStatus,
      notes: disputeReason,
    });
    setShowDisputeDialog(false);
  };

  const handleProceedToPayment = async () => {
    try {
      const result = await initiatePayment.mutateAsync(transaction.id);
      // Redirect to checkout
      window.location.href = `/app/market/checkout?secret=${result.clientSecret}&transaction=${transaction.id}`;
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleReleaseEscrow = () => {
    releaseEscrow.mutate(transaction.id);
  };

  const handleConfirmDelivery = () => {
    updateStatus.mutate({
      transactionId: transaction.id,
      status: 'completed' as TransactionStatus,
    });
  };

  // Common actions
  const commonActions = (
    <Button variant="outline" onClick={onOpenMessages}>
      <MessageSquare className="h-4 w-4 mr-2" />
      Mensajes
    </Button>
  );

  // Render based on status and role
  const renderActions = () => {
    const { status } = transaction;

    // Buyer actions
    if (role === 'buyer') {
      switch (status) {
        case 'offer_accepted':
        case 'due_diligence':
          return (
            <>
              {commonActions}
              <Button onClick={() => updateStatus.mutate({ 
                transactionId: transaction.id, 
                status: 'contract_draft' as TransactionStatus 
              })}>
                <FileText className="h-4 w-4 mr-2" />
                Solicitar contrato
              </Button>
            </>
          );
        case 'contract_review':
          return (
            <>
              {commonActions}
              <Button variant="outline" onClick={onOpenContract}>
                <Download className="h-4 w-4 mr-2" />
                Ver contrato
              </Button>
              <Button onClick={() => updateStatus.mutate({ 
                transactionId: transaction.id, 
                status: 'pending_payment' as TransactionStatus 
              })}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceptar contrato
              </Button>
            </>
          );
        case 'pending_payment':
          return (
            <>
              {commonActions}
              <Button onClick={handleProceedToPayment} disabled={initiatePayment.isPending}>
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar
              </Button>
            </>
          );
        case 'pending_transfer':
          return (
            <>
              {commonActions}
              <Button onClick={handleConfirmDelivery}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar recepción
              </Button>
              <Button variant="destructive" onClick={() => setShowDisputeDialog(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Abrir disputa
              </Button>
            </>
          );
        default:
          return commonActions;
      }
    }

    // Seller actions
    if (role === 'seller') {
      switch (status) {
        case 'contract_draft':
          return (
            <>
              {commonActions}
              <Button onClick={onOpenContract}>
                <FileText className="h-4 w-4 mr-2" />
                Preparar contrato
              </Button>
            </>
          );
        case 'payment_in_escrow':
          return (
            <>
              {commonActions}
              <Button onClick={() => updateStatus.mutate({ 
                transactionId: transaction.id, 
                status: 'pending_transfer' as TransactionStatus 
              })}>
                <Send className="h-4 w-4 mr-2" />
                Iniciar transferencia
              </Button>
            </>
          );
        case 'completed':
          return (
            <>
              {commonActions}
              <Button variant="outline" onClick={handleReleaseEscrow} disabled={releaseEscrow.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Fondos liberados
              </Button>
            </>
          );
        default:
          return commonActions;
      }
    }

    return commonActions;
  };

  // Don't show actions for completed or cancelled transactions
  if (transaction.status === 'completed' || transaction.status === 'cancelled') {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={onOpenMessages}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Ver mensajes
        </Button>
        <Button variant="outline" onClick={onOpenContract}>
          <FileText className="h-4 w-4 mr-2" />
          Ver contrato
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {renderActions()}
        
        {/* Cancel button */}
        {!['completed', 'cancelled', 'disputed'].includes(transaction.status) && (
          <Button variant="ghost" className="text-destructive" onClick={() => setShowCancelDialog(true)}>
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar transacción</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Por favor indica el motivo de la cancelación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo de cancelación..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Confirmar cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispute Dialog */}
      <AlertDialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abrir disputa</AlertDialogTitle>
            <AlertDialogDescription>
              Al abrir una disputa, nuestro equipo revisará el caso. Los fondos permanecerán en escrow hasta resolución.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Describe el problema..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDispute} className="bg-destructive text-destructive-foreground">
              Enviar disputa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
