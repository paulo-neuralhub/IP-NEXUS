/**
 * PreAcceptanceChat — Slide-over chat panel for pre-acceptance communication
 * Uses market_messages table with thread_id = `rfq_{requestId}_{sortedUserIds}`
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface PreAcceptanceChatProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  otherUserId: string;
  otherUserName: string;
}

function buildThreadId(requestId: string, userA: string, userB: string) {
  const sorted = [userA, userB].sort();
  return `rfq_${requestId}_${sorted[0].slice(0, 8)}_${sorted[1].slice(0, 8)}`;
}

export function PreAcceptanceChat({ isOpen, onClose, requestId, otherUserId, otherUserName }: PreAcceptanceChatProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threadId = user ? buildThreadId(requestId, user.id, otherUserId) : '';

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['pre-chat-messages', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await (supabase
        .from('market_messages' as any)
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true }) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!threadId,
    refetchInterval: isOpen ? 5000 : false,
  });

  // Realtime
  useEffect(() => {
    if (!isOpen || !threadId) return;
    const channel = supabase
      .channel(`pre-chat-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'market_messages',
        filter: `thread_id=eq.${threadId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['pre-chat-messages', threadId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isOpen, threadId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase
        .from('market_messages' as any)
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          recipient_id: otherUserId,
          message: content,
        }) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-chat-messages', threadId] });
    },
    onError: () => toast.error('Error al enviar mensaje'),
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full flex flex-col"
        style={{ background: '#fff', boxShadow: '-4px 0 30px rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
                Chat con {otherUserName}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>Pre-aceptación · Solicitud</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Cargando...</span>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#c4c4c4' }} />
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Inicia una conversación con {otherUserName}
              </p>
              <p style={{ fontSize: '10px', color: '#c4c4c4', marginTop: '4px' }}>
                Pregunta dudas, negocia o aclara detalles antes de aceptar.
              </p>
            </div>
          )}

          {messages.map((msg: any) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={{
                    background: isOwn ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#f1f4f9',
                    color: isOwn ? '#fff' : '#334155',
                  }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.message}</p>
                  <div className="flex items-center justify-end mt-1">
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>
                      {format(new Date(msg.created_at || Date.now()), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)', color: '#334155' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{
                background: newMessage.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e2e8f0',
              }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
