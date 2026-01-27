/**
 * MatterCommunicationsTab - Pestaña de comunicaciones del expediente
 * Wrapper para MatterCommunications con acciones de composición
 */

import { useState } from 'react';
import { MatterCommunications } from './MatterCommunications';
import { EmailComposeModal } from './EmailComposeModal';
import { LogCallModal } from './LogCallModal';

interface MatterCommunicationsTabProps {
  matterId: string;
  matterTitle?: string;
  clientId?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
}

export function MatterCommunicationsTab({
  matterId,
  matterTitle,
  clientId,
  clientName,
  clientEmail,
}: MatterCommunicationsTabProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | undefined>();

  // Build contacts array from client info
  const contacts = clientId && clientName ? [
    {
      id: clientId,
      name: clientName,
      email: clientEmail || undefined,
    }
  ] : [];

  const handleComposeEmail = (contact?: typeof selectedContact) => {
    setSelectedContact(contact);
    setShowEmailModal(true);
  };

  const handleCall = (contact?: typeof selectedContact) => {
    setSelectedContact(contact);
    setShowCallModal(true);
  };

  return (
    <>
      <MatterCommunications
        matterId={matterId}
        matterTitle={matterTitle}
        contacts={contacts}
        onComposeEmail={handleComposeEmail}
        onCall={handleCall}
      />

      <EmailComposeModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        matterId={matterId}
        matterTitle={matterTitle}
        recipientEmail={selectedContact?.email || clientEmail || undefined}
        recipientName={selectedContact?.name || clientName || undefined}
      />

      <LogCallModal
        open={showCallModal}
        onOpenChange={setShowCallModal}
        matterId={matterId}
        contactName={selectedContact?.name || clientName || undefined}
      />
    </>
  );
}
