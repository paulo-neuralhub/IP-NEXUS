// ============================================================
// IP-NEXUS - UNIFIED SIGNATURE SERVICE
// Client service for BoldSign, Yousign and simulation providers
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export type SignatureProvider = 'boldsign' | 'yousign' | 'simulation';

export interface SignerInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  fields?: Array<{
    type: 'signature' | 'initials' | 'text' | 'date';
    page: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
  }>;
}

export interface CreateEnvelopeOptions {
  provider: SignatureProvider;
  documentBase64: string;
  documentName: string;
  signers: SignerInfo[];
  title?: string;
  message?: string;
  expiryDays?: number;
  matterId?: string;
  documentId?: string;
  organizationId: string;
}

export interface EnvelopeResult {
  success: boolean;
  provider: SignatureProvider;
  envelopeId: string;
  status: string;
  signers: Array<{
    email: string;
    status: string;
    signLink?: string;
  }>;
  error?: string;
  safeMode?: boolean;
}

export interface EnvelopeStatus {
  success: boolean;
  provider: SignatureProvider;
  envelopeId: string;
  status: string;
  signers: Array<{
    email: string;
    name?: string;
    status: string;
    signedAt?: string;
  }>;
  completedAt?: string;
}

/**
 * Unified service for electronic signatures
 * Supports BoldSign, Yousign and simulation modes
 */
export class SignatureService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Create and send a signature envelope
   */
  async createEnvelope(options: CreateEnvelopeOptions): Promise<EnvelopeResult> {
    const { 
      provider, 
      documentBase64, 
      documentName, 
      signers, 
      title, 
      message, 
      expiryDays, 
      matterId, 
      documentId 
    } = options;

    // For simulation, don't call Edge Functions
    if (provider === 'simulation') {
      return this.simulateEnvelope(options);
    }

    // Determine Edge Function based on provider
    const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';

    // Prepare data based on provider
    const requestBody: any = {
      action: 'create',
      documentBase64,
      documentName,
      title,
      message,
      expiryDays,
    };

    if (provider === 'boldsign') {
      requestBody.signers = signers.map((s) => ({
        name: s.name || `${s.firstName} ${s.lastName}`,
        email: s.email,
        formFields: s.fields?.map((f) => ({
          fieldType: f.type === 'signature' ? 'Signature' : f.type,
          pageNumber: f.page,
          bounds: { x: f.x, y: f.y, width: f.width || 200, height: f.height || 50 },
        })),
      }));
    } else {
      // Yousign
      requestBody.signers = signers.map((s) => ({
        firstName: s.firstName || s.name.split(' ')[0],
        lastName: s.lastName || s.name.split(' ').slice(1).join(' ') || '-',
        email: s.email,
        phone: s.phone,
        fields: s.fields,
      }));
      requestBody.name = title;
    }

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody,
    });

    if (error || !data?.success) {
      // Check if safe mode (no API key configured)
      if (data?.safeMode) {
        return {
          success: false,
          provider,
          envelopeId: '',
          status: 'error',
          signers: [],
          error: data?.error || 'Provider not configured',
          safeMode: true,
        };
      }
      
      return {
        success: false,
        provider,
        envelopeId: '',
        status: 'error',
        signers: [],
        error: error?.message || data?.error || 'Unknown error',
      };
    }

    // Save to our database using fromTable for dynamic typing
    const { fromTable } = await import('@/lib/supabase');
    const { error: dbError } = await fromTable('signature_requests')
      .insert({
        organization_id: this.organizationId,
        document_id: documentId,
        matter_id: matterId,
        provider,
        provider_envelope_id: data.envelopeId,
        status: 'sent',
        document_name: documentName,
        document_url: '',
        signers: signers.map((s, i) => ({
          email: s.email,
          name: s.name || `${s.firstName} ${s.lastName}`,
          role: s.role || 'signer',
          order: i + 1,
          status: 'pending',
          sign_link: data.signers?.[i]?.signLink,
        })),
        signature_config: {
          title,
          message,
          expiryDays,
        },
        provider_response: data.raw,
        expires_at: data.expiresAt,
      });

    if (dbError) {
      console.error('Error saving envelope to database:', dbError);
    }

    return {
      success: true,
      provider,
      envelopeId: data.envelopeId,
      status: 'sent',
      signers: data.signers || [],
    };
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string, provider: SignatureProvider): Promise<EnvelopeStatus | null> {
    if (provider === 'simulation') {
      const { data } = await supabase
        .from('signature_requests')
        .select('*')
        .eq('provider_envelope_id', envelopeId)
        .single();
      
      if (!data) return null;
      
      return {
        success: true,
        provider: 'simulation',
        envelopeId,
        status: data.status,
        signers: (data.signers as any[]) || [],
        completedAt: data.completed_at,
      };
    }

    const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        action: 'status',
        envelopeId: provider === 'boldsign' ? envelopeId : undefined,
        signatureRequestId: provider === 'yousign' ? envelopeId : undefined,
      },
    });

    if (error || !data?.success) {
      return null;
    }

    return data as EnvelopeStatus;
  }

  /**
   * Download signed document
   */
  async downloadSignedDocument(envelopeId: string, provider: SignatureProvider): Promise<string | null> {
    if (provider === 'simulation') {
      // For simulation, return null (no real signed document)
      return null;
    }

    const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        action: 'download',
        envelopeId: provider === 'boldsign' ? envelopeId : undefined,
        signatureRequestId: provider === 'yousign' ? envelopeId : undefined,
      },
    });

    if (error || !data?.success) {
      console.error('Error downloading signed document:', error || data?.error);
      return null;
    }

    return data.documentBase64;
  }

  /**
   * Send reminder
   */
  async sendReminder(envelopeId: string, provider: SignatureProvider): Promise<boolean> {
    if (provider === 'simulation') {
      return true;
    }

    const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        action: 'remind',
        envelopeId: provider === 'boldsign' ? envelopeId : undefined,
        signatureRequestId: provider === 'yousign' ? envelopeId : undefined,
      },
    });

    return !error && data?.success;
  }

  /**
   * Void envelope
   */
  async voidEnvelope(envelopeId: string, provider: SignatureProvider): Promise<boolean> {
    if (provider === 'simulation') {
      await supabase
        .from('signature_requests')
        .update({ status: 'voided' })
        .eq('provider_envelope_id', envelopeId);
      return true;
    }

    const functionName = provider === 'boldsign' ? 'signature-boldsign' : 'signature-yousign';
    const action = provider === 'boldsign' ? 'void' : 'cancel';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        action,
        envelopeId: provider === 'boldsign' ? envelopeId : undefined,
        signatureRequestId: provider === 'yousign' ? envelopeId : undefined,
      },
    });

    if (!error && data?.success) {
      await supabase
        .from('signature_requests')
        .update({ status: 'voided' })
        .eq('provider_envelope_id', envelopeId);
    }

    return !error && data?.success;
  }

  /**
   * Simulate envelope (for development/testing)
   */
  private async simulateEnvelope(options: CreateEnvelopeOptions): Promise<EnvelopeResult> {
    const simulatedId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { fromTable } = await import('@/lib/supabase');
    const { error } = await fromTable('signature_requests')
      .insert({
        organization_id: this.organizationId,
        document_id: options.documentId,
        matter_id: options.matterId,
        provider: 'simulation',
        provider_envelope_id: simulatedId,
        status: 'pending',
        document_name: options.documentName,
        document_url: '',
        signers: options.signers.map((s, i) => ({
          email: s.email,
          name: s.name || `${s.firstName} ${s.lastName}`,
          role: s.role || 'signer',
          order: i + 1,
          status: 'pending',
          sign_link: `${window.location.origin}/sign/${simulatedId}/${i}`,
        })),
        signature_config: {
          title: options.title,
          message: options.message,
        },
        expires_at: new Date(Date.now() + (options.expiryDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (error) {
      return {
        success: false,
        provider: 'simulation',
        envelopeId: '',
        status: 'error',
        signers: [],
        error: error.message,
      };
    }

    return {
      success: true,
      provider: 'simulation',
      envelopeId: simulatedId,
      status: 'pending',
      signers: options.signers.map((s, i) => ({
        email: s.email,
        status: 'pending',
        signLink: `${window.location.origin}/sign/${simulatedId}/${i}`,
      })),
    };
  }

  /**
   * Simulate signing (for development/testing)
   */
  async simulateSign(envelopeId: string, signerIndex: number): Promise<boolean> {
    const { data: envelope } = await supabase
      .from('signature_requests')
      .select('*')
      .eq('provider_envelope_id', envelopeId)
      .single();

    if (!envelope) return false;

    const signers = (envelope.signers as any[]) || [];
    if (signerIndex >= signers.length) return false;

    signers[signerIndex] = {
      ...signers[signerIndex],
      status: 'signed',
      signed_at: new Date().toISOString(),
    };

    // Check if all signers have signed
    const allSigned = signers.every((s: any) => s.status === 'signed');

    await supabase
      .from('signature_requests')
      .update({
        signers,
        status: allSigned ? 'completed' : 'pending',
        completed_at: allSigned ? new Date().toISOString() : null,
      })
      .eq('provider_envelope_id', envelopeId);

    return true;
  }
}

/**
 * Helper to create signature service instance
 */
export function createSignatureService(organizationId: string): SignatureService {
  return new SignatureService(organizationId);
}
