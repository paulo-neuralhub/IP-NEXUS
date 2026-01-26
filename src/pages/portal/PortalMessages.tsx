/**
 * Portal Messages
 * Sistema de mensajes entre cliente y despacho - DATOS REALES
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { 
  usePortalThreads, 
  usePortalThreadMessages, 
  useSendPortalMessage,
  useMarkMessagesRead 
} from '@/hooks/use-portal-messages';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  MessageSquare, 
  Send,
  Plus,
  Paperclip,
  Clock,
  CheckCheck,
  Inbox
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PortalMessages() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { user } = usePortalAuth();
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');

  // Hooks de datos reales
  const { data: threads, isLoading: threadsLoading } = usePortalThreads();
  const { data: messages, isLoading: messagesLoading } = usePortalThreadMessages(selectedThread);
  const sendMessage = useSendPortalMessage();
  const markRead = useMarkMessagesRead();

  const filteredThreads = threads?.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const currentThread = threads?.find((t) => t.thread_id === selectedThread);

  const handleSelectThread = (threadId: string) => {
    setSelectedThread(threadId);
    // Marcar como leídos
    markRead.mutate(threadId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    sendMessage.mutate({
      body: newMessage,
      thread_id: selectedThread,
    });
    setNewMessage('');
  };

  const handleCreateConversation = () => {
    if (!newSubject.trim() || !newBody.trim()) return;
    
    sendMessage.mutate({
      subject: newSubject,
      body: newBody,
    });
    setNewConversationOpen(false);
    setNewSubject('');
    setNewBody('');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: es });
    } else {
      return format(date, 'd MMM', { locale: es });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('portal.messages.title')}</h1>
          <p className="text-muted-foreground">
            {t('portal.messages.conversations')}
          </p>
        </div>
        <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo mensaje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva consulta</DialogTitle>
              <DialogDescription>
                Envía un mensaje a tu equipo de gestión
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <Input 
                  placeholder="¿En qué podemos ayudarte?"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea 
                  placeholder="Escribe tu consulta..." 
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewConversationOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateConversation}
                disabled={!newSubject.trim() || !newBody.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages Layout */}
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[500px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-80px)]">
              {threadsLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Inbox className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-sm">No tienes conversaciones</p>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div
                    key={thread.thread_id}
                    onClick={() => handleSelectThread(thread.thread_id)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                      selectedThread === thread.thread_id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{thread.subject}</p>
                          {thread.unread_count > 0 && (
                            <Badge className="h-5 px-1.5">{thread.unread_count}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {thread.last_message}
                        </p>
                        {thread.matter_reference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📁 {thread.matter_reference}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(thread.last_message_date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread && currentThread ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">{currentThread.subject}</CardTitle>
                <CardDescription>
                  {currentThread.message_count} mensajes
                  {currentThread.matter_reference && ` • ${currentThread.matter_reference}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${msg.direction === 'inbound' ? 'order-1' : ''}`}>
                            {msg.direction === 'outbound' && (
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    IP
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">Equipo IP-NEXUS</span>
                              </div>
                            )}
                            <div
                              className={`rounded-lg p-3 ${
                                msg.direction === 'inbound'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                              msg.direction === 'inbound' ? 'justify-end' : ''
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(msg.created_at), 'd MMM HH:mm', { locale: es })}</span>
                              {msg.direction === 'inbound' && msg.status === 'read' && (
                                <CheckCheck className="w-3 h-3 ml-1 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" disabled>
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Escribe tu mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || sendMessage.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Selecciona una conversación</p>
                <p className="text-sm">o crea un nuevo mensaje</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
