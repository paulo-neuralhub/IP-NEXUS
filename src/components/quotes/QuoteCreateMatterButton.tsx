// =====================================================
// Quote Create Matter Button
// =====================================================

import { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { useQuoteToMatter } from '@/hooks/useQuoteToMatter';
import { Button } from '@/components/ui/button';
import { QuoteAcceptedModal } from './QuoteAcceptedModal';

interface Props {
  quoteId: string;
  quoteNumber: string;
  quoteStatus: string;
  invoiceNumber?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function QuoteCreateMatterButton({
  quoteId,
  quoteNumber,
  quoteStatus,
  invoiceNumber,
  variant = 'outline',
  size = 'default',
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const { canCreateMatter, pendingMatterItems, isLoading } = useQuoteToMatter(quoteId);

  // Only show for accepted quotes with pending items
  if (quoteStatus !== 'accepted' || !canCreateMatter || isLoading) {
    return null;
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setShowModal(true)}>
        <FolderPlus className="h-4 w-4 mr-2" />
        Crear expediente ({pendingMatterItems.length})
      </Button>

      <QuoteAcceptedModal
        open={showModal}
        onOpenChange={setShowModal}
        quoteId={quoteId}
        quoteNumber={quoteNumber}
        invoiceNumber={invoiceNumber}
      />
    </>
  );
}
