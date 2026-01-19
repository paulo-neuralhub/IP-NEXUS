// src/pages/app/market/messages/index.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { useConversations, useThreadMessages, useSendMessage } from '@/hooks/market';
import { ConversationsList, MessageThread, MessageInput } from '@/components/market/messages';
import { useAuth } from '@/contexts/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversationItem {
  id: string;
  threadId?: string;
  listing_id?: string | null;
  transaction_id?: string | null;
  participant_1_id?: string;
  participant_2_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  listing?: any;
  participant_1?: any;
  participant_2?: any;
  otherParty?: any;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);

  const { data: rawConversations, isLoading: conversationsLoading } = useConversations();
  
  // Transform conversations to the expected format
  const conversations: ConversationItem[] = (rawConversations || []).map((conv: any) => ({
    id: conv.threadId || conv.id,
    threadId: conv.threadId,
    listing_id: conv.listingId,
    transaction_id: conv.transactionId,
    participant_1_id: user?.id || '',
    participant_2_id: conv.otherParty?.id || '',
    last_message: conv.lastMessage,
    last_message_at: conv.lastMessageAt,
    unread_count: conv.unreadCount,
    listing: conv.listing,
    participant_1: { id: user?.id, display_name: 'Tú' },
    participant_2: conv.otherParty,
    otherParty: conv.otherParty,
  }));

  const threadId = selectedConversation?.threadId || selectedConversation?.id;
  const { messages, isLoading: messagesLoading } = useThreadMessages(threadId);
  const sendMessage = useSendMessage();

  const filteredConversations = conversations.filter((conv) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const otherParticipant = conv.otherParty || conv.participant_2;
    return otherParticipant?.display_name?.toLowerCase().includes(searchLower) ||
           conv.listing?.title?.toLowerCase().includes(searchLower);
  });

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;
    const recipientId = selectedConversation.otherParty?.id || selectedConversation.participant_2_id;
    if (!recipientId) return;
    
    await sendMessage.mutateAsync({
      threadId: selectedConversation.threadId || selectedConversation.id,
      recipientId,
      listingId: selectedConversation.listing_id || undefined,
      transactionId: selectedConversation.transaction_id || undefined,
      content,
    });
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    setSelectedConversation(conv);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const otherParticipant = selectedConversation?.otherParty || selectedConversation?.participant_2;

  // Mobile: show either list or conversation
  if (isMobile) {
    if (selectedConversation) {
      return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
          {/* Mobile header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant?.avatar_url} />
              <AvatarFallback>
                {otherParticipant?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{otherParticipant?.display_name || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.listing?.title}
              </p>
            </div>
          </div>

          {/* Messages */}
          <MessageThread 
            messages={messages || []}
            currentUserId={user?.id || ''}
            isLoading={messagesLoading}
          />
          <MessageInput onSend={handleSendMessage} />
        </div>
      );
    }

    return (
      <div className="container py-6 space-y-4">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {conversationsLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando conversaciones...
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin mensajes</h3>
              <p className="text-muted-foreground">
                No tienes conversaciones aún
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <ConversationsList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id}
              onSelect={handleSelectConversation}
              currentUserId={user?.id || ''}
            />
          </Card>
        )}
      </div>
    );
  }

  // Desktop: split view
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Mensajes</h1>

      <Card className="h-[calc(100vh-12rem)] flex overflow-hidden">
        {/* Conversations list */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {conversationsLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Cargando...
            </div>
          ) : (
            <ConversationsList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id}
              onSelect={handleSelectConversation}
              currentUserId={user?.id || ''}
            />
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant?.avatar_url} />
                  <AvatarFallback>
                    {otherParticipant?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{otherParticipant?.display_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.listing?.title}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <MessageThread 
                messages={messages || []}
                currentUserId={user?.id || ''}
                isLoading={messagesLoading}
              />
              <MessageInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una conversación</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
