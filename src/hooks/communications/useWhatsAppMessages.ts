import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface WhatsAppMessage {
  id: string;
  organization_id: string;
  contact_id?: string;
  direction: 'inbound' | 'outbound';
  content?: string;
  media_type?: 'image' | 'video' | 'audio' | 'document' | null;
  media_url?: string;
  media_name?: string;
  media_size?: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  wa_message_id?: string;
  created_at: string;
  sender_phone?: string;
  recipient_phone?: string;
}

interface SendMessageParams {
  contactId: string;
  recipientPhone: string;
  content?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
}

export function useWhatsAppMessages(contactId?: string) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  // Fetch messages for a contact
  const messagesQuery = useQuery({
    queryKey: ['whatsapp-messages', currentOrganization?.id, contactId],
    queryFn: async () => {
      if (!currentOrganization?.id || !contactId) return [];

      const { data, error } = await supabase
        .from('crm_whatsapp_messages')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as WhatsAppMessage[];
    },
    enabled: !!currentOrganization?.id && !!contactId,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          organization_id: currentOrganization.id,
          to_phone: params.recipientPhone,
          message_type: params.mediaType ? 'media' : 'text',
          text_content: params.content,
          media_type: params.mediaType,
          media_url: params.mediaUrl,
          contact_id: params.contactId,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any)?.message || 'Error sending message');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast.success('Mensaje enviado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Upload media to storage
  const uploadMedia = async (file: File): Promise<{ url: string; name: string; size: number }> => {
    if (!currentOrganization?.id) throw new Error('No organization');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${currentOrganization.id}/whatsapp/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
    };
  };

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage,
    uploadMedia,
    refetch: messagesQuery.refetch,
  };
}
