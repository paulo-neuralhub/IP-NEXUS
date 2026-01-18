import { supabase } from '@/integrations/supabase/client';

interface EmailOptions {
  to: string | string[];
  subject?: string;
  template_code?: string;
  template_data?: Record<string, any>;
  html?: string;
  text?: string;
  from_name?: string;
  reply_to?: string;
  organization_id?: string;
}

class EmailService {
  async send(options: EmailOptions) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options,
    });
    
    if (error) {
      console.error('Email send error:', error);
      throw error;
    }
    
    return data;
  }
  
  async sendWelcome(userId: string, email: string, name: string) {
    return this.send({
      to: email,
      template_code: 'welcome',
      template_data: {
        user_name: name,
      },
    });
  }
  
  async sendPasswordReset(email: string, resetUrl: string) {
    return this.send({
      to: email,
      template_code: 'password_reset',
      template_data: {
        reset_url: resetUrl,
      },
    });
  }
  
  async sendInvitation(
    email: string, 
    inviterName: string, 
    orgName: string, 
    inviteUrl: string
  ) {
    return this.send({
      to: email,
      template_code: 'invitation',
      template_data: {
        inviter_name: inviterName,
        org_name: orgName,
        invite_url: inviteUrl,
      },
    });
  }
  
  async sendRenewalReminder(
    email: string,
    matterReference: string,
    matterTitle: string,
    dueDate: string,
    daysRemaining: number,
    estimatedCost: string,
    matterUrl: string
  ) {
    return this.send({
      to: email,
      template_code: 'renewal_reminder',
      template_data: {
        matter_reference: matterReference,
        matter_title: matterTitle,
        due_date: dueDate,
        days_remaining: daysRemaining,
        days_color: daysRemaining <= 30 ? '#EF4444' : '#F59E0B',
        estimated_cost: estimatedCost,
        matter_url: matterUrl,
      },
    });
  }
  
  async sendInvoice(
    email: string,
    clientName: string,
    invoiceNumber: string,
    invoiceDate: string,
    dueDate: string | null,
    total: string,
    invoiceUrl: string,
    orgName: string
  ) {
    return this.send({
      to: email,
      template_code: 'invoice_sent',
      template_data: {
        client_name: clientName,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate || 'A convenir',
        total,
        invoice_url: invoiceUrl,
        org_name: orgName,
      },
    });
  }
  
  async sendBulk(
    recipients: Array<{ email: string; name?: string; data?: Record<string, any> }>,
    templateCode: string,
    baseData: Record<string, any> = {}
  ) {
    const results = await Promise.allSettled(
      recipients.map(recipient => 
        this.send({
          to: recipient.email,
          template_code: templateCode,
          template_data: {
            ...baseData,
            recipient_name: recipient.name,
            recipient_email: recipient.email,
            ...recipient.data,
          },
        })
      )
    );
    
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { sent, failed, total: recipients.length };
  }
}

export const emailService = new EmailService();
