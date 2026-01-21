/**
 * Portal Messages
 * Sistema de mensajes entre cliente y despacho
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  CheckCheck
} from 'lucide-react';

// Mock data
const mockConversations = [
  {
    id: '1',
    subject: 'Consulta sobre renovación marca NEXUS',
    lastMessage: 'Perfecto, procederemos con la renovación la próxima semana.',
    lastMessageDate: '2025-01-20T10:30:00',
    unread: 0,
    participants: ['María García', 'Juan López'],
  },
  {
    id: '2',
    subject: 'Estado patente IoT Device',
    lastMessage: 'Hemos recibido el informe de examen de fondo. Te adjunto el documento.',
    lastMessageDate: '2025-01-19T16:45:00',
    unread: 2,
    participants: ['Carlos Martínez'],
  },
  {
    id: '3',
    subject: 'Documentación pendiente',
    lastMessage: 'Necesitamos el poder firmado para continuar con el trámite.',
    lastMessageDate: '2025-01-18T09:00:00',
    unread: 1,
    participants: ['Ana Ruiz'],
  },
];

const mockMessages = [
  {
    id: '1',
    conversationId: '1',
    sender: 'María García',
    senderType: 'staff',
    content: 'Buenos días, le informamos que la marca NEXUS está próxima a su fecha de renovación.',
    date: '2025-01-18T09:00:00',
    read: true,
  },
  {
    id: '2',
    conversationId: '1',
    sender: 'Cliente',
    senderType: 'client',
    content: '¿Cuál sería el coste de la renovación?',
    date: '2025-01-18T10:15:00',
    read: true,
  },
  {
    id: '3',
    conversationId: '1',
    sender: 'María García',
    senderType: 'staff',
    content: 'El coste total incluyendo tasas oficiales y honorarios sería de 450€. ¿Desea que procedamos?',
    date: '2025-01-19T11:30:00',
    read: true,
  },
  {
    id: '4',
    conversationId: '1',
    sender: 'Cliente',
    senderType: 'client',
    content: 'Sí, por favor procedan con la renovación.',
    date: '2025-01-20T09:00:00',
    read: true,
  },
  {
    id: '5',
    conversationId: '1',
    sender: 'María García',
    senderType: 'staff',
    content: 'Perfecto, procederemos con la renovación la próxima semana.',
    date: '2025-01-20T10:30:00',
    read: true,
  },
];

export default function PortalMessages() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = usePortalAuth();
  const [search, setSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.subject.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = mockMessages.filter(
    (msg) => msg.conversationId === selectedConversation
  );

  const currentConversation = mockConversations.find(
    (conv) => conv.id === selectedConversation
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // En producción, aquí se enviaría el mensaje a Supabase
    console.log('Enviar mensaje:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-muted-foreground">
            Comunicación directa con tu asesor
          </p>
        </div>
        <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva conversación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva conversación</DialogTitle>
              <DialogDescription>
                Inicia una nueva conversación con tu asesor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Asunto</label>
                <Input placeholder="Escribe el asunto de tu consulta" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea 
                  placeholder="Escribe tu mensaje aquí..." 
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewConversationOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setNewConversationOpen(false)}>
                Enviar
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
                placeholder="Buscar conversaciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100%-80px)]">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                    selectedConversation === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{conv.subject}</p>
                        {conv.unread > 0 && (
                          <Badge className="h-5 px-1.5">{conv.unread}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.participants.join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(conv.lastMessageDate)}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation && currentConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="text-lg">{currentConversation.subject}</CardTitle>
                <CardDescription>
                  Con: {currentConversation.participants.join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${msg.senderType === 'client' ? 'order-1' : ''}`}>
                          {msg.senderType === 'staff' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {msg.sender.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{msg.sender}</span>
                            </div>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              msg.senderType === 'client'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                            msg.senderType === 'client' ? 'justify-end' : ''
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(msg.date)}</span>
                            {msg.senderType === 'client' && msg.read && (
                              <CheckCheck className="w-3 h-3 ml-1 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
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
                <p>Selecciona una conversación para ver los mensajes</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
