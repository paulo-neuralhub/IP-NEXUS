// ============================================================
// IP-NEXUS HELP - CONTEXTUAL HELP PROVIDER
// Prompt 48: Knowledge Base & Rules Engine
// ============================================================

import { ReactNode } from 'react';
import { ContextualHelpPopup } from './ContextualHelpPopup';

interface ContextualHelpProviderProps {
  children: ReactNode;
}

/**
 * Provider that wraps the app and shows contextual help popups
 * based on the rules engine. Include this at the app layout level.
 */
export function ContextualHelpProvider({ children }: ContextualHelpProviderProps) {
  return (
    <>
      {children}
      <ContextualHelpPopup />
    </>
  );
}

export default ContextualHelpProvider;
