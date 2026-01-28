/**
 * MatterCommunications - Panel de comunicaciones para expediente
 * Muestra todas las comunicaciones vinculadas al expediente
 * IMPORTANTE: Abre las comunicaciones en un Sheet sin salir del expediente
 */

import { useState } from 'react';
import { useCommunications, useCommunication } from '@/hooks/legal-ops/useCommunications';
import { CommChannel, Communication } from '@/types/legal-ops';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail, MessageSquare, Phone, Plus, ChevronDown,
  ArrowDownLeft, ArrowUpRight, RefreshCw, Globe, X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MatterContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface MatterCommunicationsProps {
  matterId: string;
  matterTitle?: string;
  contacts?: MatterContact[];
  onComposeEmail?: (contact?: MatterContact) => void;
  onComposeWhatsApp?: (contact?: MatterContact) => void;
  onCall?: (contact?: MatterContact) => void;
}

const CHANNEL_ICONS: Record<CommChannel, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-[hsl(var(--ip-action-whatsapp-text))]" />,
  portal: <Globe className="w-4 h-4 text-primary" />,
  phone: <Phone className="w-4 h-4 text-primary" />,
  sms: <MessageSquare className="w-4 h-4 text-[hsl(var(--ip-pending-text))]" />,
  in_person: <MessageSquare className="w-4 h-4" />,
  other: <MessageSquare className="w-4 h-4" />
};

const CHANNEL_COLORS: Record<CommChannel, string> = {
  email: 'bg-primary/10 text-primary',
  whatsapp: 'bg-[hsl(var(--ip-action-whatsapp-bg))] text-[hsl(var(--ip-action-whatsapp-text))]',
  phone: 'bg-primary/10 text-primary',
  sms: 'bg-[hsl(var(--ip-pending-bg))] text-[hsl(var(--ip-pending-text))]',
  portal: 'bg-primary/10 text-primary',
  in_person: 'bg-muted text-muted-foreground',
  other: 'bg-muted text-muted-foreground'
};

type ChannelFilter = CommChannel | 'all';

export function MatterCommunications({
  matterId,
  matterTitle,
  contacts = [],
  onComposeEmail,
  onComposeWhatsApp,
  onCall
}: MatterCommunicationsProps) {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [selectedCommId, setSelectedCommId] = useState<string | null>(null);

  const { data: commsResult, isLoading, refetch } = useCommunications({
    matter_id: matterId,
    channel: channelFilter !== 'all' ? channelFilter : undefined
  });

  // Cargar detalle de la comunicación seleccionada
  const { data: selectedComm, isLoading: isLoadingDetail } = useCommunication(selectedCommId || '');

  const communications = commsResult?.data || [];

  // Contar por canal
  const channelCounts = communications.reduce((acc, comm) => {
    acc[comm.channel] = (acc[comm.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleCommunicationClick = (comm: Communication) => {
    // Abrir en Sheet sin navegar fuera del expediente
    setSelectedCommId(comm.id);
  };

  const handleNewCommunication = (type: 'email' | 'whatsapp' | 'phone', contact?: MatterContact) => {
    if (type === 'email' && onComposeEmail) {
      onComposeEmail(contact);
    } else if (type === 'whatsapp' && onComposeWhatsApp) {
      onComposeWhatsApp(contact);
    } else if (type === 'phone' && onCall) {
      onCall(contact);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Comunicaciones</CardTitle>
            <Badge variant="secondary">{communications.length}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* Botón Nueva Comunicación */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Nueva
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {contacts.length > 0 ? (
                  <>
                    {contacts.map((contact) => (
                      <div key={contact.id}>
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                          {contact.name}
                        </div>
                        <DropdownMenuItem onClick={() => handleNewCommunication('email', contact)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                        {contact.phone && (
                          <>
                            <DropdownMenuItem onClick={() => handleNewCommunication('phone', contact)}>
                              <Phone className="w-4 h-4 mr-2" />
                              Llamar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNewCommunication('whatsapp', contact)}>
                              <MessageSquare className="w-4 h-4 mr-2 text-[#25D366]" />
                              WhatsApp
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => handleNewCommunication('email')}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNewCommunication('phone')}>
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNewCommunication('whatsapp')}>
                      <MessageSquare className="w-4 h-4 mr-2 text-[#25D366]" />
                      WhatsApp
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filtros de canal */}
        <div className="flex flex-wrap gap-1 mt-3">
          <Button
            variant={channelFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setChannelFilter('all')}
          >
            Todos ({communications.length})
          </Button>
          {(['email', 'whatsapp', 'phone', 'sms'] as CommChannel[]).map((channel) => {
            const count = channelCounts[channel] || 0;
            if (count === 0 && channelFilter !== channel) return null;
            return (
              <Button
                key={channel}
                variant={channelFilter === channel ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 gap-1"
                onClick={() => setChannelFilter(channel)}
              >
                {CHANNEL_ICONS[channel]}
                <span className="capitalize">{channel}</span>
                <Badge variant="outline" className="ml-1 h-5 px-1">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando comunicaciones...
            </div>
          ) : communications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay comunicaciones en este expediente</p>
              <p className="text-sm mt-1">
                Las comunicaciones vinculadas aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {communications.map((comm) => (
                <CommunicationItem
                  key={comm.id}
                  communication={comm}
                  onClick={() => handleCommunicationClick(comm)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Sheet para ver detalle de comunicación sin salir del expediente */}
      <Sheet open={!!selectedCommId} onOpenChange={(open) => !open && setSelectedCommId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                {selectedComm && CHANNEL_ICONS[selectedComm.channel]}
                {selectedComm?.subject || 'Comunicación'}
              </SheetTitle>
            </div>
          </SheetHeader>

          {isLoadingDetail ? (
            <div className="p-4 text-center text-muted-foreground">
              Cargando...
            </div>
          ) : selectedComm ? (
            <div className="py-4 space-y-4">
              {/* Header info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={cn(CHANNEL_COLORS[selectedComm.channel])}>
                    {selectedComm.channel.toUpperCase()}
                  </Badge>
                  <Badge variant={selectedComm.direction === 'inbound' ? 'secondary' : 'outline'}>
                    {selectedComm.direction === 'inbound' ? 'Recibido' : 'Enviado'}
                  </Badge>
                </div>

                {/* De/Para según dirección */}
                {selectedComm.direction === 'inbound' ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">De:</span>{' '}
                    {selectedComm.email_from || selectedComm.whatsapp_from || selectedComm.phone_from || 'Desconocido'}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Para:</span>{' '}
                    {selectedComm.email_to?.join(', ') || selectedComm.whatsapp_to || selectedComm.phone_to || 'Destinatario'}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedComm.received_at || selectedComm.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                </p>
              </div>

              {/* Contenido */}
              <div className="pt-4 border-t">
                {selectedComm.body_html ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedComm.body_html }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedComm.body_preview || '[Sin contenido]'}
                  </p>
                )}
              </div>

              {/* Transcripción si es llamada */}
              {selectedComm.transcription && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Transcripción
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {String(selectedComm.transcription)}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </Card>
  );
}

// Item de comunicación individual
interface CommunicationItemProps {
  communication: Communication;
  onClick: () => void;
}

function CommunicationItem({ communication, onClick }: CommunicationItemProps) {
  const { channel, direction, subject, body_preview, received_at, is_read, created_at } = communication;

  // Obtener nombre del remitente/destinatario (usando campos disponibles en Communication)
  const contactName = communication.email_from
    || communication.whatsapp_from
    || communication.phone_from
    || 'Desconocido';

  const DirectionIcon = direction === 'inbound' ? ArrowDownLeft : ArrowUpRight;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-muted/50",
        !is_read && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icono de canal */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          CHANNEL_COLORS[channel]
        )}>
          {CHANNEL_ICONS[channel]}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
            <DirectionIcon className={cn(
                "w-3 h-3 shrink-0",
                direction === 'inbound' ? 'text-[hsl(var(--ip-success-text))]' : 'text-primary'
              )} />
              <span className={cn(
                "truncate text-sm",
                !is_read && "font-semibold"
              )}>
                {contactName}
              </span>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(received_at || created_at), {
                addSuffix: true,
                locale: es
              })}
            </span>
          </div>

          {subject && (
            <p className={cn(
              "text-sm truncate mt-0.5",
              !is_read ? "font-medium" : "text-muted-foreground"
            )}>
              {subject}
            </p>
          )}

          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {body_preview || '[Sin contenido]'}
          </p>

          {/* Estado de lectura */}
          {!is_read && (
            <Badge variant="destructive" className="mt-1 h-5 text-xs">
              Nuevo
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatterCommunications;
