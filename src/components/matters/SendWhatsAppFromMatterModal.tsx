/**
 * SendWhatsAppFromMatterModal - WhatsApp modal optimized for Matter context
 * Wraps the CRM SendWhatsAppModal with matter-specific defaults
 */

import { SendWhatsAppModal } from '@/components/features/crm/v2/SendWhatsAppModal';

interface SendWhatsAppFromMatterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
}

export function SendWhatsAppFromMatterModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  clientId,
  clientName,
  clientPhone,
}: SendWhatsAppFromMatterModalProps) {
  // Build contact object from client info
  const contact = clientId && clientName ? {
    id: clientId,
    full_name: clientName,
    phone: clientPhone,
    whatsapp_phone: clientPhone, // Try same phone for WhatsApp
  } : undefined;

  return (
    <SendWhatsAppModal
      open={open}
      onOpenChange={onOpenChange}
      contact={contact}
      matterId={matterId}
      matterReference={matterReference}
    />
  );
}

export default SendWhatsAppFromMatterModal;
