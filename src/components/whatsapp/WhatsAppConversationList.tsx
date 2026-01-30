/**
 * WhatsApp Conversation List Component
 */

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Building2, MessageCircle, CheckCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { WhatsAppConversation } from '@/types/whatsapp';

interface WhatsAppConversationListProps {
  conversations: WhatsAppConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function WhatsAppConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: WhatsAppConversationListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">
          No hay conversaciones
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedId === conversation.id}
          onSelect={() => onSelect(conversation.id)}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: WhatsAppConversation;
  isSelected: boolean;
  onSelect: () => void;
}

function ConversationItem({ conversation, isSelected, onSelect }: ConversationItemProps) {
  const displayName = conversation.client?.full_name || 
    conversation.contact_name || 
    conversation.contact_phone;
  
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const hasUnread = conversation.unread_count > 0;
  const isLinkedToClient = !!conversation.client_id;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-4 hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted',
        hasUnread && 'bg-green-50/50 dark:bg-green-950/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.client?.avatar_url || undefined} />
            <AvatarFallback className={cn(
              'text-sm',
              isLinkedToClient ? 'bg-primary/10 text-primary' : 'bg-muted'
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          {isLinkedToClient && (
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
              <User className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                'font-medium truncate',
                hasUnread && 'font-semibold'
              )}>
                {displayName}
              </span>
              {conversation.client?.company_name && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <Building2 className="h-3 w-3" />
                  {conversation.client.company_name}
                </span>
              )}
            </div>
            {conversation.last_message_at && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(conversation.last_message_at), {
                  addSuffix: false,
                  locale: es,
                })}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            <p className={cn(
              'text-sm truncate',
              hasUnread ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {conversation.last_message_preview || 'Sin mensajes'}
            </p>
            <div className="flex items-center gap-1.5">
              {hasUnread && (
                <Badge className="h-5 min-w-5 bg-green-500 hover:bg-green-500">
                  {conversation.unread_count}
                </Badge>
              )}
              {conversation.status === 'closed' && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  Cerrada
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-muted-foreground">
              {conversation.contact_phone}
            </span>
            {conversation.tags && conversation.tags.length > 0 && (
              <div className="flex gap-1">
                {conversation.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
