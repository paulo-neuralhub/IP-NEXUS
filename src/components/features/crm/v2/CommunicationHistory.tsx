import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Video,
  XCircle,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunicationHistoryProps {
  contactId: string;
  organizationId: string;
  maxHeight?: string;
}

type CommunicationType = {
  id: string;
  type: 'email' | 'whatsapp' | 'call' | 'meeting' | 'note' | string;
  direction: 'inbound' | 'outbound' | string;
  subject?: string | null;
  content?: string | null;
  status: string;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

const channelIcons: Record<string, any> = {
  email: Mail,
  whatsapp: MessageCircle,
  call: Phone,
  meeting: Video,
  note: FileText,
};

const statusConfig: Record<
  string,
  { icon: any; className: string; label: string }
> = {
  sent: { icon: CheckCircle, className: 'text-primary', label: 'Enviado' },
  delivered: { icon: CheckCircle, className: 'text-primary', label: 'Entregado' },
  read: { icon: Eye, className: 'text-primary', label: 'Leído' },
  opened: { icon: Eye, className: 'text-primary', label: 'Abierto' },
  pending: { icon: Clock, className: 'text-muted-foreground', label: 'Pendiente' },
  failed: { icon: XCircle, className: 'text-destructive', label: 'Error' },
  received: { icon: CheckCircle, className: 'text-muted-foreground', label: 'Recibido' },
};

export function CommunicationHistory({ contactId, organizationId, maxHeight = '400px' }: CommunicationHistoryProps) {
  const { data: communications = [], isLoading } = useQuery({
    queryKey: ['communication-history', organizationId, contactId],
    queryFn: async () => {
      const [interactionsRes, emailsRes, whatsappRes] = await Promise.all([
        supabase
          .from('crm_interactions')
          .select('id, channel, direction, subject, content, status, created_at, metadata')
          .eq('organization_id', organizationId)
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('crm_email_tracking')
          .select('id, subject, body_preview, status, created_at, opened_count, first_opened_at')
          .eq('organization_id', organizationId)
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('crm_whatsapp_messages')
          .select('id, direction, template_name, content, status, created_at, wa_message_id')
          .eq('organization_id', organizationId)
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (interactionsRes.error) throw interactionsRes.error;
      if (emailsRes.error) throw emailsRes.error;
      if (whatsappRes.error) throw whatsappRes.error;

      const combined: CommunicationType[] = [
        ...((interactionsRes.data ?? []).map((i) => ({
          id: i.id,
          type: (i.channel as string) || 'note',
          direction: (i.direction as string) || 'outbound',
          subject: i.subject,
          content: i.content,
          status: (i.status as string) || 'sent',
          created_at: i.created_at as string,
          metadata: (i.metadata as any) ?? null,
        })) as CommunicationType[]),
        ...((emailsRes.data ?? []).map((e) => ({
          id: e.id,
          type: 'email',
          direction: 'outbound',
          subject: e.subject,
          content: (e as any).body_preview,
          status: (e.status as string) || 'sent',
          created_at: e.created_at as string,
          metadata: {
            opened_count: (e as any).opened_count,
            first_opened_at: (e as any).first_opened_at,
          },
        })) as CommunicationType[]),
        ...((whatsappRes.data ?? []).map((w) => ({
          id: w.id,
          type: 'whatsapp',
          direction: w.direction,
          subject: (w as any).template_name,
          content: (w as any).content,
          status: (w.status as string) || 'sent',
          created_at: w.created_at as string,
          metadata: { wa_message_id: (w as any).wa_message_id },
        })) as CommunicationType[]),
      ];

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const seen = new Set<string>();
      return combined.filter((c) => {
        const key = `${c.type}-${c.created_at}-${(c.content || '').slice(0, 50)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },
    enabled: !!organizationId && !!contactId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de comunicaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de comunicaciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No hay comunicaciones registradas.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial de comunicaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }} className="pr-4">
          <div className="space-y-3">
            {communications.map((comm) => {
              const ChannelIcon = channelIcons[comm.type] || FileText;
              const statusInfo = statusConfig[comm.status] || statusConfig.sent;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={comm.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg border bg-background flex items-center justify-center">
                      <ChannelIcon className="h-4 w-4 text-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{comm.type}</span>
                        <Badge variant="secondary" className="gap-1">
                          <StatusIcon className={cn('h-3 w-3', statusInfo.className)} />
                          {statusInfo.label}
                        </Badge>
                        {comm.direction === 'inbound' ? <Badge variant="outline">Entrante</Badge> : null}
                      </div>

                      {comm.subject ? <p className="text-sm font-medium text-foreground mt-1 truncate">{comm.subject}</p> : null}
                      {comm.content ? (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                          {comm.content}
                        </p>
                      ) : null}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comm.created_at), { addSuffix: true, locale: es })}
                        </p>
                        {comm.type === 'email' && (comm.metadata as any)?.opened_count > 0 ? (
                          <Badge variant="outline">Abierto {(comm.metadata as any).opened_count}x</Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
