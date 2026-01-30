import { useEffect, useState } from 'react';
import { 
  useCommunications, 
  useMarkAsRead, 
  useInboxStats,
  useToggleStar
} from '@/hooks/legal-ops/useCommunications';
import { Communication, CommChannel } from '@/types/legal-ops';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail, MessageSquare, Phone, Globe, Search,
  Star, StarOff, RefreshCw, Plus, ChevronDown,
  Archive, Trash2, Reply, Forward, MoreHorizontal,
  User, Building, Paperclip, Clock
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommunicationDetail } from './CommunicationDetail';
import { AIClassificationBadge } from './AIClassificationBadge';
import { ComposeMessageDialog } from './ComposeMessageDialog';

const CHANNEL_ICONS: Record<CommChannel, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-[hsl(var(--chart-2))]" />,
  portal: <Globe className="w-4 h-4 text-primary" />,
  phone: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4 text-[hsl(var(--chart-4))]" />,
  in_person: <MessageSquare className="w-4 h-4" />,
  other: <MessageSquare className="w-4 h-4" />
};

type InboxProps = {
  defaultChannel?: CommChannel | null;
  defaultTab?: 'all' | 'unread' | 'starred';
};

export function CommunicationsInbox({ defaultChannel = null, defaultTab = 'all' }: InboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred'>(defaultTab);
  const [channelFilter, setChannelFilter] = useState<CommChannel | null>(defaultChannel);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeChannel, setComposeChannel] = useState<CommChannel>('email');

  useEffect(() => {
    setActiveFilter(defaultTab);
    setChannelFilter(defaultChannel);
  }, [defaultChannel, defaultTab]);

  const { data: stats } = useInboxStats();
  const { data: commsResult, isLoading, refetch } = useCommunications({
    is_read: activeFilter === 'unread' ? false : undefined,
    is_starred: activeFilter === 'starred' ? true : undefined,
    channel: channelFilter || undefined,
    search: searchQuery || undefined
  });

  const handleCompose = (channel: CommChannel) => {
    setComposeChannel(channel);
    setIsComposeOpen(true);
  };
  
  const markAsRead = useMarkAsRead();
  const toggleStar = useToggleStar();

  const communications = commsResult?.data || [];
  const selectedComm = communications.find(c => c.id === selectedId);

  const handleSelect = (comm: Communication) => {
    setSelectedId(comm.id);
    if (!comm.is_read) {
      markAsRead.mutate(comm.id);
    }
  };

  const unreadCount = stats?.unread || 0;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Lista de comunicaciones */}
      <Card className="w-[420px] flex flex-col">
        <CardHeader className="pb-2 space-y-3">
          {/* Header con título y acciones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Bandeja de entrada</CardTitle>
              <Badge variant="secondary" className="font-normal">
                {stats?.total || 0}
              </Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="font-normal">
                  {unreadCount} sin leer
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Nuevo
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCompose('email')}>
                    <Mail className="w-4 h-4 mr-2" />
                    Nuevo email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCompose('whatsapp')}>
                    <MessageSquare className="w-4 h-4 mr-2 text-[hsl(var(--chart-2))]" />
                    Mensaje WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCompose('phone')}>
                    <Phone className="w-4 h-4 mr-2" />
                    Registrar llamada
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar comunicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtros simples - NO tabs de canal duplicados */}
          <div className="flex gap-1">
            <Button
              variant={activeFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={activeFilter === 'unread' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('unread')}
            >
              Sin leer
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeFilter === 'starred' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('starred')}
              className="gap-1"
            >
              <Star className="w-3.5 h-3.5" />
              Destacados
            </Button>
          </div>

          {/* Filtros de canal - SOLO si estamos en inbox unificado */}
          {defaultChannel === null && (
            <>
              <Separator />
              <div className="flex gap-1 overflow-x-auto">
                <Button
                  variant={channelFilter === null ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setChannelFilter(null)}
                >
                  Todos
                </Button>
                {(['email', 'whatsapp', 'phone'] as CommChannel[]).map(channel => (
                  <Button
                    key={channel}
                    variant={channelFilter === channel ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setChannelFilter(channel)}
                    className="gap-1"
                  >
                    {CHANNEL_ICONS[channel]}
                    <span className="capitalize">{channel}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Cargando...
              </div>
            ) : communications.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No hay comunicaciones</p>
              </div>
            ) : (
              <div className="divide-y">
                {communications.map((comm) => (
                  <CommunicationListItem
                    key={comm.id}
                    communication={comm}
                    isSelected={selectedId === comm.id}
                    onSelect={() => handleSelect(comm)}
                    onToggleStar={() => toggleStar.mutate({ id: comm.id, is_starred: !comm.is_starred })}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Panel de detalle */}
      <div className="flex-1">
        {selectedId ? (
          <CommunicationDetail communicationId={selectedId} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground font-medium">Selecciona una comunicación</p>
              <p className="text-sm text-muted-foreground/70">para ver los detalles</p>
            </div>
          </Card>
        )}
      </div>

      {/* Dialog de composición */}
      <ComposeMessageDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
        channelType={composeChannel}
      />
    </div>
  );
}

// Componente para cada item de la lista
interface CommunicationListItemProps {
  communication: Communication;
  isSelected: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}

function CommunicationListItem({ 
  communication, 
  isSelected, 
  onSelect,
  onToggleStar
}: CommunicationListItemProps) {
  const { channel, subject, body_preview, received_at, is_read, is_starred } = communication;
  
  const senderName = communication.email_from 
    || communication.whatsapp_from 
    || 'Desconocido';

  const effectiveCategory = communication.manual_category || communication.ai_category;

  return (
    <div
      onClick={onSelect}
      className={`
        p-3 cursor-pointer transition-colors
        ${isSelected ? 'bg-accent' : 'hover:bg-muted/50'}
        ${!is_read ? 'bg-primary/5' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icono de canal */}
        <div className="mt-1 p-1.5 rounded bg-muted">
          {CHANNEL_ICONS[channel]}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate ${!is_read ? 'font-semibold' : ''}`}>
              {senderName}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(received_at || communication.created_at), { 
                addSuffix: false, 
                locale: es 
              })}
            </span>
          </div>

          {subject && (
            <p className={`text-sm truncate mt-0.5 ${!is_read ? 'font-medium' : 'text-muted-foreground'}`}>
              {subject}
            </p>
          )}

          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {body_preview || '[Sin contenido]'}
          </p>

          {/* Badges y acciones */}
          <div className="flex items-center gap-1 mt-1.5">
            {effectiveCategory && (
              <AIClassificationBadge
                category={effectiveCategory}
                confidence={communication.ai_confidence}
                isManual={!!communication.manual_category}
                size="sm"
              />
            )}


            {/* Estrella */}
            <button
              type="button"
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar();
              }}
              aria-label={is_starred ? 'Quitar estrella' : 'Marcar con estrella'}
            >
              {is_starred ? (
              <Star className="w-4 h-4 fill-primary text-primary" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
