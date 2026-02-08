/**
 * ProductionChat — Chat panel for post-acceptance transaction workspace
 * Displays system messages + user messages with realtime updates
 */
import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import { MessageCircle, Send, FileText, Download } from 'lucide-react';
import { useProductionMessages, useSendProductionMessage, type ProductionMessage } from '@/hooks/market/useProductionChat';
import { ChatFileUpload } from './ChatFileUpload';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductionChatProps {
  transactionId: string;
  currentUserId: string;
  isReadOnly?: boolean;
}

export function ProductionChat({ transactionId, currentUserId, isReadOnly }: ProductionChatProps) {
  const { data: messages = [], isLoading } = useProductionMessages(transactionId);
  const sendMessage = useSendProductionMessage();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate({ transactionId, content: newMessage.trim() });
    setNewMessage('');
  };

  return (
    <div className="rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', height: '600px' }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" style={{ color: '#00b4d8' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>Chat de Producción</span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Mensajes cifrados · Solo participantes</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Cargando mensajes...</span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#c4c4c4' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sin mensajes aún</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isReadOnly && (
        <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <ChatFileUpload
              transactionId={transactionId}
              onFileUploaded={(fileName, fileUrl) => {
                sendMessage.mutate({ transactionId, content: `📎 ${fileName}`, fileName, fileUrl });
              }}
              disabled={sendMessage.isPending}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)', color: '#334155' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 transition-all"
              style={{
                background: newMessage.trim() ? 'linear-gradient(135deg, #00b4d8, #00d4aa)' : '#e2e8f0',
                cursor: newMessage.trim() ? 'pointer' : 'default',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessage({ msg, currentUserId }: { msg: ProductionMessage; currentUserId: string }) {
  const isSystem = msg.message_type === 'system';
  const isOwn = msg.sender_user_id === currentUserId;
  const isFile = msg.message_type === 'file';
  const meta = msg.metadata as { icon?: string; title?: string; color?: string } | null;

  if (isSystem) {
    const color = meta?.color || '#00b4d8';
    return (
      <div className="flex items-start gap-2 p-3 rounded-xl mx-2" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
        <span className="text-base shrink-0">{meta?.icon || 'ℹ️'}</span>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: '12px', fontWeight: 700, color, display: 'block' }}>{meta?.title || 'Sistema'}</span>
          <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>{msg.content}</span>
          <span style={{ fontSize: '9px', color: '#c4c4c4', display: 'block', marginTop: '4px' }}>
            {format(new Date(msg.created_at || Date.now()), 'dd MMM · HH:mm', { locale: es })}
          </span>
        </div>
      </div>
    );
  }

  if (isFile && msg.file_url) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl max-w-[60%]"
          style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)' }}>
          <FileText className="w-5 h-5 shrink-0" style={{ color: '#00b4d8' }} />
          <div className="min-w-0">
            <span className="truncate" style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540', display: 'block' }}>{msg.file_name || 'Archivo'}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
              {format(new Date(msg.created_at || Date.now()), 'HH:mm', { locale: es })}
            </span>
          </div>
          <Download className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} />
        </a>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] p-3 rounded-2xl ${isOwn ? 'rounded-br-md' : 'rounded-bl-md'}`}
        style={{
          background: isOwn ? 'linear-gradient(135deg, #00b4d8, #00d4aa)' : '#f1f4f9',
          color: isOwn ? '#fff' : '#334155',
        }}>
        <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{msg.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span style={{ fontSize: '9px', opacity: 0.7 }}>
            {format(new Date(msg.created_at || Date.now()), 'HH:mm', { locale: es })}
          </span>
          {isOwn && (
            <span style={{ fontSize: '9px', opacity: 0.7 }}>{msg.is_read ? '✓✓' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
