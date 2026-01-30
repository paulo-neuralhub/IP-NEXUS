/**
 * ClientCommunicationsTab - Tab de comunicaciones en la ficha del cliente
 * Muestra historial completo de Email, WhatsApp, Llamadas asociadas
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Mail,
  Phone,
  MessageCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Clock,
  Inbox,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { fromTable } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ClientCommunicationsTabProps {
  clientId: string;
}

interface CommunicationItem {
  id: string;
  channel: string;
  direction: string;
  subject: string;
  body_preview?: string;
  contact_info?: string;
  received_at: string;
  matter_id?: string;
  matter_reference?: string;
  matter_title?: string;
}

export function ClientCommunicationsTab({ clientId }: ClientCommunicationsTabProps) {
  const { data: communications, isLoading } = useQuery({
    queryKey: ['client-communications-full', clientId],
    queryFn: async (): Promise<CommunicationItem[]> => {
      // Get direct client communications
      const { data: direct } = await fromTable('communications')
        .select(`
          id, channel, direction, subject, body_preview, 
          email_from, email_to, whatsapp_from, whatsapp_to, phone_from, phone_to,
          received_at, matter_id,
          matter:matter_id (reference, mark_name)
        `)
        .eq('client_id', clientId)
        .order('received_at', { ascending: false })
        .limit(100);

      // Get communications via matters linked to this client
      const { data: viaMatters } = await fromTable('communications')
        .select(`
          id, channel, direction, subject, body_preview,
          email_from, email_to, whatsapp_from, whatsapp_to, phone_from, phone_to,
          received_at, matter_id,
          matter:matter_id!inner (reference, mark_name, client_id)
        `)
        .eq('matter.client_id', clientId)
        .is('client_id', null)
        .order('received_at', { ascending: false })
        .limit(100);

      // Combine and deduplicate
      const allComms = [...(direct || []), ...(viaMatters || [])];
      const uniqueById = new Map<string, CommunicationItem>();

      allComms.forEach((c: any) => {
        if (!uniqueById.has(c.id)) {
          // Determine contact info based on channel
          let contactInfo = '';
          if (c.channel === 'email') {
            contactInfo = c.direction === 'inbound' ? c.email_from : c.email_to?.[0];
          } else if (c.channel === 'whatsapp') {
            contactInfo = c.direction === 'inbound' ? c.whatsapp_from : c.whatsapp_to;
          } else if (c.channel === 'phone') {
            contactInfo = c.direction === 'inbound' ? c.phone_from : c.phone_to;
          }

          uniqueById.set(c.id, {
            id: c.id,
            channel: c.channel || 'email',
            direction: c.direction || 'inbound',
            subject: c.subject || 'Sin asunto',
            body_preview: c.body_preview || undefined,
            contact_info: contactInfo || undefined,
            received_at: c.received_at,
            matter_id: c.matter_id || undefined,
            matter_reference: c.matter?.reference || undefined,
            matter_title: c.matter?.mark_name || undefined,
          });
        }
      });

      // Sort by date
      return Array.from(uniqueById.values()).sort(
        (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
      );
    },
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'phone':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'whatsapp':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!communications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">No hay comunicaciones</p>
        <p className="text-sm text-muted-foreground mt-1">
          Las comunicaciones con este cliente aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 p-4">
        {communications.map((comm) => (
          <div
            key={comm.id}
            className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors"
          >
            {/* Direction icon */}
            <div className="shrink-0 mt-0.5">
              {comm.direction === 'outbound' ? (
                <ArrowUpRight className="h-4 w-4 text-primary" />
              ) : (
                <ArrowDownLeft className="h-4 w-4 text-success" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge
                  variant="secondary"
                  className={cn("text-xs gap-1", getChannelColor(comm.channel))}
                >
                  {getChannelIcon(comm.channel)}
                  {comm.channel}
                </Badge>

                {comm.matter_reference && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Briefcase className="h-3 w-3" />
                    {comm.matter_reference}
                  </Badge>
                )}
              </div>

              {/* Subject */}
              <p className="font-medium text-sm text-foreground truncate">
                {comm.subject}
              </p>

              {/* Contact Info */}
              {comm.contact_info && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {comm.contact_info}
                </p>
              )}
            </div>

            {/* Date/Time */}
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-foreground">
                {format(new Date(comm.received_at), 'dd MMM', { locale: es })}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                <Clock className="h-3 w-3" />
                {format(new Date(comm.received_at), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
