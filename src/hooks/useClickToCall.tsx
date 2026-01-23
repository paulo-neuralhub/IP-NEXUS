import { useCallback } from 'react';

declare global {
  interface Window {
    softphoneCall?: (number: string, contactId?: string, contactName?: string) => void;
  }
}

export function useClickToCall() {
  const call = useCallback((phoneNumber: string, contactId?: string, contactName?: string) => {
    if (window.softphoneCall) {
      window.softphoneCall(phoneNumber, contactId, contactName);
      return;
    }

    // Fallback nativo
    window.location.href = `tel:${phoneNumber}`;
  }, []);

  return { call };
}

export function ClickToCallNumber({
  number,
  contactId,
  contactName,
  className,
}: {
  number: string;
  contactId?: string;
  contactName?: string;
  className?: string;
}) {
  const { call } = useClickToCall();

  return (
    <button
      type="button"
      onClick={() => call(number, contactId, contactName)}
      className={className ?? 'text-primary hover:underline'}
    >
      {number}
    </button>
  );
}
