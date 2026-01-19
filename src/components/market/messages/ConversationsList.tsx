// src/components/market/messages/ConversationsList.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Local interface for conversations - flexible to accept various formats
interface ConversationItem {
  id: string;
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

interface ConversationsListProps {
  conversations: ConversationItem[];
  selectedId?: string;
  onSelect: (conversation: ConversationItem) => void;
  currentUserId: string;
}

export function ConversationsList({ 
  conversations, 
  selectedId, 
  onSelect,
  currentUserId 
}: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
        <p>No tienes conversaciones aún</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.otherParty ||
            (conversation.participant_1_id === currentUserId
              ? conversation.participant_2
              : conversation.participant_1) as any;
          
          const listing = conversation.listing as any;
          const isSelected = selectedId === conversation.id;
          const hasUnread = (conversation.unread_count || 0) > 0;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                isSelected && 'bg-muted'
              )}
            >
              <div className="flex gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherParticipant?.avatar_url} />
                  <AvatarFallback>
                    {otherParticipant?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'font-medium truncate',
                      hasUnread && 'text-foreground'
                    )}>
                      {otherParticipant?.display_name || 'Usuario'}
                    </span>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    )}
                  </div>

                  {listing && (
                    <p className="text-xs text-muted-foreground truncate">
                      {listing.title}
                    </p>
                  )}

                  {conversation.last_message && (
                    <p className={cn(
                      'text-sm truncate mt-1',
                      hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {conversation.last_message}
                    </p>
                  )}
                </div>

                {hasUnread && (
                  <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
