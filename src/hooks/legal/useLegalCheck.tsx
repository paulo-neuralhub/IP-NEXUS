import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AIDisclaimerModal } from '@/components/legal-ops/AIDisclaimerModal';

type FeatureType = 'ai' | 'general' | 'other';

interface LegalCheckDocument {
  id: string;
  organization_id: string | null;
  code: string;
  title: string;
  content: string;
  version: string;
  effective_date: string | null;
  requires_signature: boolean;
  signature_type: 'checkbox' | 'typed_name' | null;
  show_on_ai_first_use: boolean;
}

interface CheckResponse {
  accepted: boolean;
  requiresUpdate?: boolean;
  document?: LegalCheckDocument;
}

/**
 * Hook to block gated features until the user accepts a legal document (e.g., AI disclaimer).
 */
export function useLegalCheck(documentCode: string) {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [document, setDocument] = useState<LegalCheckDocument | null>(null);
  const [loading, setLoading] = useState(true);

  const featureType: FeatureType | undefined = useMemo(() => {
    if (documentCode === 'ai_disclaimer') return 'ai';
    return undefined;
  }, [documentCode]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-legal-acceptance', {
        body: {
          documentCode,
          featureType,
        },
      });

      if (error) throw error;

      const res = data as CheckResponse;
      setDocument(res.document ?? null);

      const accepted = Boolean(res.accepted);
      const requiresUpdate = Boolean(res.requiresUpdate);
      const needs = !accepted || requiresUpdate;
      setNeedsAcceptance(needs);

      // If it's required, keep the modal open (blocking)
      if (needs) setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, [documentCode, featureType]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const showModal = useCallback(() => setIsOpen(true), []);

  const handleAccept = useCallback(() => {
    setIsOpen(false);
    void refetch();
  }, [refetch]);

  const handleDecline = useCallback(() => {
    // If the feature is gated, keep it open (blocking). Consumer can also navigate away.
    if (needsAcceptance) {
      setIsOpen(true);
      return;
    }
    setIsOpen(false);
  }, [needsAcceptance]);

  const modal =
    (needsAcceptance || isOpen) && documentCode === 'ai_disclaimer' ? (
      <AIDisclaimerModal onAccept={handleAccept} onDecline={handleDecline} />
    ) : null;

  return {
    needsAcceptance: needsAcceptance && !loading,
    showModal,
    document,
    modal,
    isChecking: loading,
    refetch,
  };
}
