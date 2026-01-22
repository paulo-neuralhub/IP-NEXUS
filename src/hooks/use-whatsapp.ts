import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export type WhatsAppMessageType = 'text' | 'template';

export type WhatsAppTemplateStatus = 'pending' | 'approved' | 'rejected' | string;

export interface WhatsAppTemplateVariable {
  key: string;
  label?: string;
  example?: string;
}

export interface WhatsAppTemplate {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  wa_template_name: string;
  language: string | null;
  category: string | null;
  body_text: string;
  variables: WhatsAppTemplateVariable[] | null;
  status: WhatsAppTemplateStatus;
}

export function useWhatsAppTemplates() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['whatsapp-templates', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [] as WhatsAppTemplate[];

      const { data, error } = await supabase
        .from('crm_whatsapp_templates')
        .select('id, organization_id, name, code, wa_template_name, language, category, body_text, variables, status')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;
      return (data ?? []) as unknown as WhatsAppTemplate[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSendWhatsApp() {
  const { currentOrganization } = useOrganization();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      toPhone: string;
      messageType: WhatsAppMessageType;
      textContent?: string;
      templateCode?: string;
      templateVariables?: Record<string, string>;
      contactId?: string;
      interactionId?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          organization_id: currentOrganization.id,
          to_phone: params.toPhone,
          message_type: params.messageType,
          text_content: params.textContent,
          template_code: params.templateCode,
          template_variables: params.templateVariables,
          contact_id: params.contactId,
          interaction_id: params.interactionId,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any)?.message || (data as any)?.error);
      return data as { success?: boolean; message_id?: string; wa_message_id?: string; status?: string };
    },
    onSuccess: () => {
      toast.success('WhatsApp enviado correctamente');
      qc.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      qc.invalidateQueries({ queryKey: ['crm-interactions'] });
      qc.invalidateQueries({ queryKey: ['communication-history'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al enviar WhatsApp: ${error.message}`);
    },
  });
}
