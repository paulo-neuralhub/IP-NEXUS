/**
 * MarketChatModal — SILK Design
 * Real-time chat between requester and agent
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  X, Send, Paperclip, Image, Check, CheckCheck,
  Clock, Shield, AlertCircle, FileText,
} from 'lucide-react';
import { useThreadMessages, useSendMessage, useMarkAsRead } from '@/hooks/market/useMessages';
import { toast } from 'sonner';

interface MarketChatModalProps {
  open: boolean;
  onClose: () => void;
  threadId?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  transactionId?: string;
  listingId?: string;
}

export default function MarketChatModal({
  open, onClose, threadId, recipientId, recipientName,
  recipientAvatar, transactionId, listingId,
}: MarketChatModalProps) {
  const { messages } = useThreadMessages(threadId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setCurrentUserId(user.id);
      });
    });
  }, []);

  // Mark as read
  useEffect(() => {
    if (threadId && open) {
      markAsRead.mutate(threadId);
    }
  }, [threadId, open]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length]);

  if (!open) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage.mutateAsync({
        threadId,
        recipientId,
        transactionId,
        listingId,
        content: input.trim(),
      });
      setInput('');
    } catch {
      toast.error('Error al enviar mensaje');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const recipientInitials = recipientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg h-[600px] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #334155, #475569)' }}
          >
            {recipientAvatar ? (
              <img src={recipientAvatar} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              recipientInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0a2540' }}>{recipientName}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span style={{ fontSize: '10px', color: '#64748b' }}>En línea</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f4f9' }}>
            <X className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f8fafc' }}>
          {/* Security notice */}
          <div
            className="mx-auto max-w-xs p-2.5 rounded-xl text-center"
            style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.08)' }}
          >
            <Shield className="w-4 h-4 mx-auto mb-1" style={{ color: '#7c3aed' }} />
            <p style={{ fontSize: '9px', color: '#64748b', lineHeight: 1.4 }}>
              Conversación protegida por IP-NEXUS. No compartas información de pago fuera de la plataforma.
            </p>
          </div>

          {messages.map((msg: any) => {
            const isMine = msg.sender_id === currentUserId;
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.04)' }}
                  >
                    <AlertCircle className="w-3 h-3" style={{ color: '#94a3b8' }} />
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[75%] px-3.5 py-2.5 rounded-2xl"
                  style={
                    isMine
                      ? {
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          color: '#fff',
                          borderBottomRightRadius: '4px',
                        }
                      : {
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderBottomLeftRadius: '4px',
                        }
                  }
                >
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: isMine ? '#fff' : '#0a2540' }}>
                    {msg.content}
                  </p>

                  {/* Attachments */}
                  {msg.attachments && (msg.attachments as any[]).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {(msg.attachments as any[]).map((att: any, i: number) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg no-underline"
                          style={{
                            background: isMine ? 'rgba(255,255,255,0.15)' : '#f8fafc',
                            border: isMine ? 'none' : '1px solid rgba(0,0,0,0.04)',
                          }}
                        >
                          <FileText className="w-3 h-3" style={{ color: isMine ? '#fff' : '#64748b' }} />
                          <span style={{ fontSize: '10px', color: isMine ? '#fff' : '#64748b' }}>{att.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Timestamp + read receipts */}
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                    <span style={{ fontSize: '9px', color: isMine ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && (
                      msg.is_read ? (
                        <CheckCheck className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.8)' }} />
                      ) : (
                        <Check className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.5)' }} />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center py-10">
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Inicia la conversación</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex items-end gap-2 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <Paperclip className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: '#f8fafc',
                border: '1px solid rgba(0,0,0,0.06)',
                color: '#0a2540',
                fontSize: '13px',
                maxHeight: '100px',
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
