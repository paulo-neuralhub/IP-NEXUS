import { useState } from 'react';
import { 
  MessageSquare, 
  Star, 
  Trash2, 
  Search,
  Plus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useConversations, useDeleteConversation, useStarConversation } from '@/hooks/use-genius';
import { AGENTS } from '@/lib/constants/genius';
import type { AgentType, AIConversation } from '@/types/genius';
import { cn } from '@/lib/utils';

interface Props {
  agentType?: AgentType;
  selectedId?: string;
  onSelect: (conversation: AIConversation) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({ agentType, selectedId, onSelect, onNewChat }: Props) {
  const [search, setSearch] = useState('');
  const { data: conversations = [], isLoading } = useConversations(agentType);
  const deleteMutation = useDeleteConversation();
  const starMutation = useStarConversation();
  
  const filtered = conversations.filter(c => 
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );
  
  const starred = filtered.filter(c => c.is_starred);
  const recent = filtered.filter(c => !c.is_starred);
  
  return (
    <div className="h-full flex flex-col bg-muted/50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva conversación
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background"
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {/* Starred */}
        {starred.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              ⭐ Favoritas
            </p>
            {starred.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                onSelect={() => onSelect(conv)}
                onDelete={() => deleteMutation.mutate(conv.id)}
                onToggleStar={() => starMutation.mutate({ id: conv.id, starred: false })}
              />
            ))}
          </div>
        )}
        
        {/* Recent */}
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
            Recientes
          </p>
          {recent.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay conversaciones
            </p>
          )}
          {recent.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onSelect={() => onSelect(conv)}
              onDelete={() => deleteMutation.mutate(conv.id)}
              onToggleStar={() => starMutation.mutate({ id: conv.id, starred: true })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onToggleStar,
}: {
  conversation: AIConversation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}) {
  const agent = AGENTS[conversation.agent_type];
  
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group p-3 rounded-lg cursor-pointer mb-1 transition-colors",
        isSelected ? "bg-background shadow-sm border" : "hover:bg-background"
      )}
    >
      <div className="flex items-start gap-2">
        <div 
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          <MessageSquare className="w-3 h-3" style={{ color: agent.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {conversation.title || 'Nueva conversación'}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(conversation.last_message_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
            className="p-1 hover:bg-muted rounded"
          >
            <Star className={cn(
              "w-3 h-3",
              conversation.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
