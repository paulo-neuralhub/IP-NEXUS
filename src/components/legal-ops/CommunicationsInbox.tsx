import { useEffect, useState } from 'react';
import { 
  useCommunications, 
  useMarkAsRead, 
  useInboxStats,
  useToggleStar
} from '@/hooks/legal-ops/useCommunications';
import { Communication, CommChannel, CommCategory } from '@/types/legal-ops';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, MessageSquare, Phone, Globe, Search,
  Star, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CommunicationDetail } from './CommunicationDetail';
import { AIClassificationBadge } from './AIClassificationBadge';

const CHANNEL_ICONS: Record<CommChannel, React.ReactNode> = {
  email: <Mail className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4 text-primary" />,
  portal: <Globe className="w-4 h-4 text-primary" />,
  phone: <Phone className="w-4 h-4" />,
  sms: <MessageSquare className="w-4 h-4" />,
  in_person: <MessageSquare className="w-4 h-4" />,
  other: <MessageSquare className="w-4 h-4" />
};

type InboxProps = {
  defaultChannel?: CommChannel | null;
  defaultTab?: 'all' | 'unread' | 'starred';
};

export function CommunicationsInbox({ defaultChannel = null, defaultTab = 'all' }: InboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred'>(defaultTab);
  const [channelFilter, setChannelFilter] = useState<CommChannel | null>(defaultChannel);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveTab(defaultTab);
    setChannelFilter(defaultChannel);
  }, [defaultChannel, defaultTab]);

  const { data: stats } = useInboxStats();
  const { data: commsResult, isLoading, refetch } = useCommunications({
    is_read: activeTab === 'unread' ? false : undefined,
    is_starred: activeTab === 'starred' ? true : undefined,
    channel: channelFilter || undefined,
    search: searchQuery || undefined
  });
  const markAsRead = useMarkAsRead();

  const communications = commsResult?.data || [];

  const handleSelect = (comm: Communication) => {
    setSelectedId(comm.id);
    if (!comm.is_read) {
      markAsRead.mutate(comm.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Lista de comunicaciones */}
      <Card className="w-[400px] flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Comunicaciones</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Stats rápidos */}
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{stats?.total || 0} total</Badge>
            {(stats?.unread ?? 0) > 0 && (
              <Badge variant="destructive">{stats?.unread} sin leer</Badge>
            )}
            {(stats?.urgent ?? 0) > 0 && (
              <Badge variant="destructive">
                {stats?.urgent} urgente
              </Badge>
            )}
          </div>

          {/* Búsqueda */}
          <div className="relative mt-3">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread' | 'starred')}>
            <TabsList className="w-full justify-start rounded-none border-b px-4 bg-transparent">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="unread">
                Sin leer
                {(stats?.unread ?? 0) > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                    {stats?.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="starred">Destacados</TabsTrigger>
            </TabsList>

            {/* Filtros de canal */}
            <div className="flex gap-1 px-4 py-2 border-b overflow-x-auto">
              <Button
                variant={channelFilter === null ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChannelFilter(null)}
              >
                Todos
              </Button>
              {(['email', 'whatsapp', 'phone', 'portal'] as CommChannel[]).map(channel => (
                <Button
                  key={channel}
                  variant={channelFilter === channel ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setChannelFilter(channel)}
                >
                  {CHANNEL_ICONS[channel]}
                  <span className="ml-1 capitalize">{channel}</span>
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[calc(100%-140px)]">
              <div className="divide-y">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Cargando...
                  </div>
                ) : communications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay comunicaciones
                  </div>
                ) : (
                  communications.map((comm) => (
                    <CommunicationListItem
                      key={comm.id}
                      communication={comm}
                      isSelected={selectedId === comm.id}
                      onSelect={() => handleSelect(comm)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detalle de comunicación */}
      <div className="flex-1">
        {selectedId ? (
          <CommunicationDetail communicationId={selectedId} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una comunicación para ver los detalles</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Componente para cada item de la lista
interface CommunicationListItemProps {
  communication: Communication;
  isSelected: boolean;
  onSelect: () => void;
}

function CommunicationListItem({ 
  communication, 
  isSelected, 
  onSelect 
}: CommunicationListItemProps) {
  const { channel, subject, body_preview, received_at, is_read, is_starred } = communication;
  
  // Obtener nombre del remitente
  const senderName = communication.email_from 
    || communication.whatsapp_from 
    || 'Desconocido';

  const effectiveCategory = communication.manual_category || communication.ai_category;

  const toggleStar = useToggleStar();

  return (
    <div
      onClick={onSelect}
      className={`
        p-3 cursor-pointer transition-colors
        ${isSelected ? 'bg-accent' : 'hover:bg-muted/50'}
        ${!is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icono de canal */}
        <div className="mt-1">
          {CHANNEL_ICONS[channel]}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`text-sm truncate ${!is_read ? 'font-semibold' : ''}`}>
              {senderName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(received_at || communication.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>

          {subject && (
            <p className={`text-sm truncate ${!is_read ? 'font-medium' : 'text-muted-foreground'}`}>
              {subject}
            </p>
          )}

          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {body_preview || '[Sin contenido]'}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1 mt-1">
            {/* Clasificación IA */}
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
              className="inline-flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleStar.mutate({ id: communication.id, is_starred: !is_starred });
              }}
              aria-label={is_starred ? 'Quitar estrella' : 'Marcar con estrella'}
            >
              <Star className={`w-3.5 h-3.5 ${is_starred ? 'fill-current text-primary' : 'text-muted-foreground'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

