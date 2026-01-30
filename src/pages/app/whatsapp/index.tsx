/**
 * WhatsApp Inbox - Centralized message inbox
 */

import { useState } from 'react';
import { MessageCircle, Search, Filter, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useWhatsAppConversations, useWhatsAppConversation } from '@/hooks/whatsapp';
import { WhatsAppConversationList } from '@/components/whatsapp/WhatsAppConversationList';
import { WhatsAppChatView } from '@/components/whatsapp/WhatsAppChatView';
import { WhatsAppEmptyState } from '@/components/whatsapp/WhatsAppEmptyState';

export default function WhatsAppInboxPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  const { conversations, isLoading, stats } = useWhatsAppConversations();
  const { 
    conversation: selectedConversation,
    messages,
    isLoading: isLoadingChat,
    markAsRead,
    sendMessage,
  } = useWhatsAppConversation(selectedConversationId);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesSearch = !searchQuery || 
      c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contact_phone.includes(searchQuery) ||
      c.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Mark as read when opening
    setTimeout(() => markAsRead.mutate(), 500);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">WhatsApp Inbox</h1>
              <p className="text-sm text-muted-foreground">
                {stats.unread > 0 ? `${stats.unread} mensaje(s) sin leer` : 'Todas las conversaciones al día'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{stats.total} conversaciones</Badge>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/settings/whatsapp">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Conversation list */}
        <div className="w-[380px] border-r flex flex-col bg-muted/30">
          {/* Search and filters */}
          <div className="p-4 border-b bg-card space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  Todas
                  {stats.total > 0 && <Badge variant="secondary" className="ml-1.5 h-5 min-w-5">{stats.total}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="open" className="flex-1">
                  Abiertas
                  {stats.open > 0 && <Badge variant="secondary" className="ml-1.5 h-5 min-w-5">{stats.open}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex-1">
                  Cerradas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            <WhatsAppConversationList
              conversations={filteredConversations}
              selectedId={selectedConversationId}
              onSelect={handleSelectConversation}
              isLoading={isLoading}
            />
          </ScrollArea>
        </div>

        {/* Right panel - Chat view */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedConversation ? (
            <WhatsAppChatView
              conversation={selectedConversation}
              messages={messages}
              isLoading={isLoadingChat}
              onSendMessage={(content) => {
                sendMessage.mutate({
                  recipientPhone: selectedConversation.contact_phone,
                  content,
                  contactId: selectedConversation.client_id || undefined,
                });
              }}
              isSending={sendMessage.isPending}
            />
          ) : (
            <WhatsAppEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
