// ============================================
// src/hooks/legal-ops/useClientOnboarding.ts
// Client Onboarding Hook with Consent Management
// ============================================

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';

export interface OnboardingFormData {
  // Step 1: Client Registration
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_company?: string;
  
  // Step 2: AI Disclosure
  ai_disclosure_read: boolean;
  ai_disclosure_understood: boolean;
  ai_disclosure_accepted_at?: string;
  
  // Step 3: Consents
  tos_accepted: boolean;
  dpa_accepted: boolean;
  ai_classification_enabled: boolean;
  ai_extraction_enabled: boolean;
  ai_assistant_enabled: boolean;
  audio_transcription_enabled: boolean;
  whatsapp_sync_enabled: boolean;
  biometric_enabled: boolean;
  marketing_emails_accepted: boolean;
  
  // Step 4: Signature
  signature_data?: string;
  signed_pdf_url?: string;
  
  // Step 5: Setup
  preferred_communication?: 'email' | 'phone' | 'whatsapp';
  language_preference?: string;
}

interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  formData: OnboardingFormData;
  clientId?: string;
}

const INITIAL_FORM_DATA: OnboardingFormData = {
  client_name: '',
  client_email: '',
  ai_disclosure_read: false,
  ai_disclosure_understood: false,
  tos_accepted: false,
  dpa_accepted: false,
  ai_classification_enabled: true,
  ai_extraction_enabled: true,
  ai_assistant_enabled: true,
  audio_transcription_enabled: false,
  whatsapp_sync_enabled: false,
  biometric_enabled: false,
  marketing_emails_accepted: false
};

const INITIAL_STATE: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  formData: INITIAL_FORM_DATA
};

export function useClientOnboarding(existingClientId?: string) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [state, setState] = useState<OnboardingState>({
    ...INITIAL_STATE,
    clientId: existingClientId
  });

  // Load existing client data if editing
  const { data: existingClient } = useQuery({
    queryKey: ['client-onboarding', existingClientId],
    queryFn: async () => {
      if (!existingClientId || !currentOrganization?.id) return null;
      
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', existingClientId)
        .eq('organization_id', currentOrganization.id)
        .single();
      
      return data;
    },
    enabled: !!existingClientId && !!currentOrganization?.id
  });

  // Update form data
  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  // Navigation
  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 5),
      completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])]
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, 5))
    }));
  }, []);

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const { formData } = state;
    
    switch (step) {
      case 1:
        return !!(formData.client_name && formData.client_email);
      
      case 2:
        // AI Disclosure is MANDATORY
        return formData.ai_disclosure_read && formData.ai_disclosure_understood;
      
      case 3:
        // ToS and DPA are mandatory
        return formData.tos_accepted && formData.dpa_accepted;
      
      case 4:
        // Signature is mandatory
        return !!formData.signature_data;
      
      case 5:
        // Setup is optional
        return true;
      
      default:
        return false;
    }
  }, [state.formData]);

  // Create or update client (Step 1)
  const saveClientData = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      const { formData, clientId } = state;

      if (clientId) {
        // Update existing client
        const { data, error } = await supabase
          .from('contacts')
          .update({
            display_name: formData.client_name,
            email: formData.client_email,
            phone: formData.client_phone,
            company_name: formData.client_company
          })
          .eq('id', clientId)
          .eq('organization_id', currentOrganization.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new client
        const { data, error } = await supabase
          .from('contacts')
          .insert([{
            organization_id: currentOrganization.id,
            owner_type: 'tenant',
            type: 'person',
            display_name: formData.client_name,
            email: formData.client_email,
            phone: formData.client_phone,
            company_name: formData.client_company,
            source: 'onboarding'
          }] as any)
          .select()
          .single();

        if (error) throw error;
        
        setState(prev => ({ ...prev, clientId: data.id }));
        return data;
      }
    }
  });

  // Save AI Disclosure acceptance (Step 2)
  const saveAIDisclosure = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id || !state.clientId) {
        throw new Error('Missing organization or client');
      }

      const timestamp = new Date().toISOString();
      const ip = await getClientIP();

      // Log in consent audit
      const { error } = await supabase.from('consent_audit_log').insert([{
        organization_id: currentOrganization.id,
        user_id: user?.id || null,
        event_type: 'disclosure_viewed',
        consent_type: 'ai_disclosure',
        new_value: { 
          read: true, 
          understood: true, 
          timestamp,
          client_id: state.clientId
        },
        ip_address: ip,
        user_agent: navigator.userAgent
      }]);

      if (error) {
        console.error('Consent audit log error:', error);
      }

      updateFormData({ ai_disclosure_accepted_at: timestamp });
    }
  });

  // Save consents (Step 3)
  const saveConsents = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id || !state.clientId) {
        throw new Error('Missing organization or client');
      }

      const { formData } = state;
      const timestamp = new Date().toISOString();
      const ip = await getClientIP();

      // Log consents in audit
      const { error: consentError } = await supabase.from('consent_audit_log').insert([{
        organization_id: currentOrganization.id,
        user_id: user?.id || null,
        event_type: 'consent_accepted',
        consent_type: 'client_onboarding',
        new_value: {
          tos: formData.tos_accepted,
          dpa: formData.dpa_accepted,
          ai_classification: formData.ai_classification_enabled,
          ai_extraction: formData.ai_extraction_enabled,
          ai_assistant: formData.ai_assistant_enabled,
          audio_transcription: formData.audio_transcription_enabled,
          whatsapp_sync: formData.whatsapp_sync_enabled,
          marketing: formData.marketing_emails_accepted,
          client_id: state.clientId,
          timestamp
        },
        ip_address: ip,
        user_agent: navigator.userAgent
      }]);

      if (consentError) {
        console.error('Consent audit log error:', consentError);
      }

      // Update client with consent preferences
      await supabase
        .from('contacts')
        .update({
          custom_fields: {
            consents: {
              tos_accepted: formData.tos_accepted,
              dpa_accepted: formData.dpa_accepted,
              ai_enabled: formData.ai_assistant_enabled,
              marketing_enabled: formData.marketing_emails_accepted,
              accepted_at: timestamp
            }
          }
        })
        .eq('id', state.clientId)
        .eq('organization_id', currentOrganization.id);
    }
  });

  // Save signature (Step 4)
  const saveSignature = useMutation({
    mutationFn: async (signatureData: string) => {
      if (!currentOrganization?.id || !state.clientId) {
        throw new Error('Missing organization or client');
      }

      const timestamp = new Date().toISOString();
      const ip = await getClientIP();

      // Log signature event
      const { error: sigError } = await supabase.from('consent_audit_log').insert([{
        organization_id: currentOrganization.id,
        user_id: user?.id || null,
        event_type: 'signature_captured',
        consent_type: 'electronic_signature',
        new_value: {
          client_id: state.clientId,
          signature_method: 'ses',
          timestamp,
          ip_address: ip
        },
        ip_address: ip,
        user_agent: navigator.userAgent
      }]);

      if (sigError) {
        console.error('Signature audit log error:', sigError);
      }

      updateFormData({ signature_data: signatureData });

      // In production, you'd call an Edge Function to generate PDF
      // For now, we just store the signature data
    }
  });

  // Complete onboarding (Step 5)
  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id || !state.clientId) {
        throw new Error('Missing organization or client');
      }

      const { formData } = state;
      const timestamp = new Date().toISOString();

      // Update client as onboarded
      await supabase
        .from('contacts')
        .update({
          tags: ['onboarded'],
          custom_fields: {
            onboarding_completed: true,
            onboarding_completed_at: timestamp,
            communication_preference: formData.preferred_communication,
            language_preference: formData.language_preference
          }
        })
        .eq('id', state.clientId)
        .eq('organization_id', currentOrganization.id);

      // Log completion
      const { error: completeError } = await supabase.from('consent_audit_log').insert([{
        organization_id: currentOrganization.id,
        user_id: user?.id || null,
        event_type: 'onboarding_completed',
        consent_type: 'client_onboarding',
        new_value: {
          client_id: state.clientId,
          completed: true,
          timestamp
        }
      }]);

      if (completeError) {
        console.error('Onboarding completion audit error:', completeError);
      }
    }
  });

  return {
    // State
    state,
    currentStep: state.currentStep,
    formData: state.formData,
    clientId: state.clientId,
    existingClient,
    
    // Navigation
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    
    // Validation
    validateStep,
    isStepValid: validateStep(state.currentStep),
    
    // Mutations
    saveClientData,
    saveAIDisclosure,
    saveConsents,
    saveSignature,
    completeOnboarding
  };
}

// Helper to get client IP
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}
