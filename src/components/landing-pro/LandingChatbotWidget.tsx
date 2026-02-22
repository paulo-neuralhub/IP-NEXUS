import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Check, Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, fromTable } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LandingChatbotWidgetProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  landingSlug: string;
}

const MODULE_COLORS = {
  spider: { primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', ring: 'ring-indigo-600' },
  market: { primary: 'bg-teal-600', hover: 'hover:bg-teal-700', ring: 'ring-teal-600' },
  docket: { primary: 'bg-blue-600', hover: 'hover:bg-blue-700', ring: 'ring-blue-600' },
  nexus: { primary: 'bg-blue-700', hover: 'hover:bg-blue-800', ring: 'ring-blue-700' },
};

const MODULE_NAMES = {
  spider: 'IP-SPIDER',
  market: 'IP-MARKET',
  docket: 'IP-DOCKET',
  nexus: 'IP-NEXUS',
};

export function LandingChatbotWidget({ moduleCode, landingSlug }: LandingChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = MODULE_COLORS[moduleCode];

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load config and greeting
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await fromTable('chatbot_configs')
        .select('greeting_message, quick_replies')
        .eq('landing_slug', landingSlug)
        .eq('is_active', true)
        .single();

      if (data) {
        setGreeting(data.greeting_message);
        try {
          const replies = typeof data.quick_replies === 'string' 
            ? JSON.parse(data.quick_replies) 
            : data.quick_replies;
          setQuickReplies(replies || []);
        } catch {
          setQuickReplies([]);
        }
      }
    };
    loadConfig();
  }, [landingSlug]);

  // Restore conversation from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`chatbot_${landingSlug}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.conversationId) {
          setConversationId(data.conversationId);
          // Load messages from DB
          loadMessages(data.conversationId);
        }
      } catch {
        // Ignore
      }
    }
  }, [landingSlug]);

  const loadMessages = async (convId: string) => {
    const { data } = await fromTable('chatbot_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at),
      })));
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    
    // Add greeting if no messages
    if (messages.length === 0 && greeting) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-respond', {
        body: {
          landingSlug,
          conversationId,
          sessionId,
          message: text,
          sessionData: {
            utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
            utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
            utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
            referrer: document.referrer || undefined,
          },
        },
      });

      if (error) throw error;

      // Save conversation ID
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem(`chatbot_${landingSlug}`, JSON.stringify({
          conversationId: data.conversationId,
        }));
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Update quick replies
      if (data.quickReplies?.length > 0) {
        setQuickReplies(data.quickReplies);
      } else {
        setQuickReplies([]);
      }

      // Show email capture if needed
      if (data.shouldAskEmail) {
        setShowEmailCapture(true);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, hubo un error. Por favor, inténtalo de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  // Pulse animation for new message indicator
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const interval = setInterval(() => {
        setHasNewMessage(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, messages.length]);

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] z-50 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white md:bottom-24 md:right-6 max-md:bottom-0 max-md:right-0 max-md:left-0 max-md:w-full max-md:max-w-full max-md:rounded-none max-md:rounded-t-2xl max-md:h-[70vh]"
          >
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colors.primary)}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Asistente {MODULE_NAMES[moduleCode]}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      En línea
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 md:h-80 max-md:flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 rounded-2xl text-sm',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {quickReplies.length > 0 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 pt-2"
                >
                  {quickReplies.map((reply, i) => (
                    <motion.button
                      key={reply}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Email Capture Banner */}
            {showEmailCapture && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-blue-50 border-t border-blue-100 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Check className="w-4 h-4" />
                  <span>¿Te envío más información? Solo necesito tu email</span>
                </div>
              </motion.div>
            )}

            {/* Input */}
            <div className="border-t border-slate-200 p-4 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={cn(colors.primary, colors.hover, 'text-white')}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-slate-400 text-center mt-2">
                Asistente IA · Respuestas instantáneas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white z-50 transition-colors max-md:bottom-4 max-md:right-4 max-md:w-12 max-md:h-12',
          colors.primary,
          colors.hover
        )}
        style={{
          boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.4)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 max-md:w-5 max-md:h-5" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 max-md:w-5 max-md:h-5" />
            {hasNewMessage && messages.length === 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              />
            )}
          </>
        )}
      </motion.button>
    </>
  );
}
