import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown,
  Copy,
  RotateCcw,
  Loader2,
  Bot,
  User,
  Folder,
  CheckSquare,
  FileText,
  Calendar,
  Pin,
  PinOff,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useGeniusChat, useGeniusFeedback } from '@/hooks/use-genius-chat';
import { AGENTS, QUICK_PROMPTS } from '@/lib/constants/genius';
import type { AgentType, AIMessage, AIActionTaken } from '@/types/genius';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

interface Props {
  agentType?: AgentType;
  initialMatterId?: string;
  initialConversationId?: string;
  onConversationChange?: (id: string) => void;
}

// Quick action definitions
const QUICK_ACTIONS = [
  { icon: Folder, label: 'Buscar expediente', prompt: 'Busca expedientes de ' },
  { icon: CheckSquare, label: 'Crear tarea', prompt: 'Crea una tarea para ' },
  { icon: Calendar, label: 'Ver plazos', prompt: '¿Cuáles son los próximos plazos?' },
  { icon: FileText, label: 'Generar documento', prompt: 'Genera un borrador de ' },
];

export function GeniusChatEnhanced({ 
  agentType = 'legal',
  initialMatterId,
  initialConversationId,
  onConversationChange 
}: Props) {
  const agent = AGENTS[agentType];
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [input, setInput] = useState('');
  const [selectedMatterId, setSelectedMatterId] = useState<string | undefined>(initialMatterId);
  
  const {
    conversationId,
    messages,
    isLoading,
    error,
    sendMessage,
    startNewConversation,
    loadConversation,
    setContextMatter,
  } = useGeniusChat(agentType);
  
  const feedbackMutation = useGeniusFeedback();

  // Fetch matters for selector
  const { data: matters = [] } = useQuery({
    queryKey: ['matters-simple', currentOrganization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('matters')
        .select('id, reference, title, mark_name')
        .eq('organization_id', currentOrganization!.id)
        .order('updated_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
  
  // Load initial conversation
  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId);
    }
  }, [initialConversationId, loadConversation]);
  
  // Notify conversation change
  useEffect(() => {
    if (conversationId && onConversationChange) {
      onConversationChange(conversationId);
    }
  }, [conversationId, onConversationChange]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update context when matter changes
  useEffect(() => {
    setContextMatter(selectedMatterId);
  }, [selectedMatterId, setContextMatter]);
  
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage({ message, matterId: selectedMatterId });
    } catch (err) {
      toast({ 
        variant: 'destructive',
        title: 'Error al enviar mensaje',
        description: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };
  
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };
  
  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    if (messageId.startsWith('temp-')) return; // Skip temp messages
    await feedbackMutation.mutateAsync({ messageId, feedback });
    toast({ title: 'Gracias por tu feedback' });
  };
  
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copiado al portapapeles' });
  };

  const handleNewChat = () => {
    startNewConversation();
    setSelectedMatterId(undefined);
  };

  const selectedMatter = matters.find(m => m.id === selectedMatterId);
  
  return (
    <div className="flex flex-col h-full bg-background rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3 bg-gradient-to-r from-card to-muted/30">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: agent.color }} />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{agent.name}</h2>
          <p className="text-xs text-muted-foreground">{agent.description}</p>
        </div>
        
        {/* Matter selector */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedMatterId || 'none'}
            onValueChange={(v) => setSelectedMatterId(v === 'none' ? undefined : v)}
          >
            <SelectTrigger className="w-[200px] h-9">
              <Folder className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Vincular expediente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin vincular</SelectItem>
              {matters.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.reference} - {m.title || m.mark_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {conversationId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Nueva
            </Button>
          )}
        </div>
      </div>

      {/* Context badge */}
      {selectedMatter && (
        <div className="px-4 py-2 bg-muted/50 border-b flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Folder className="w-3 h-3" />
            {selectedMatter.reference}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedMatter.title || selectedMatter.mark_name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-auto"
            onClick={() => setSelectedMatterId(undefined)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <EmptyState 
              agent={agent} 
              quickActions={QUICK_ACTIONS}
              onSelectAction={handleQuickAction}
            />
          )}
          
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              agentColor={agent.color}
              onFeedback={handleFeedback}
              onCopy={handleCopy}
            />
          ))}
          
          {/* Loading */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)` }}
              >
                <Bot className="w-4 h-4 animate-pulse" style={{ color: agent.color }} />
              </div>
              <div className="bg-card rounded-xl p-4 border shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: agent.color }} />
                  <span className="text-sm text-muted-foreground">Pensando...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Quick prompts bar */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t bg-gradient-to-r from-muted/50 to-muted/20 flex gap-2 overflow-x-auto animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            className="text-xs whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
            onClick={() => handleQuickAction('¿Cuáles son los próximos plazos?')}
          >
            📅 Plazos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
            onClick={() => handleQuickAction('Resume el estado actual')}
          >
            📋 Resumen
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs whitespace-nowrap hover:border-primary hover:text-primary transition-colors"
            onClick={() => handleQuickAction('¿Qué tareas están pendientes?')}
          >
            ✅ Tareas
          </Button>
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gradient-to-t from-card to-transparent">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={selectedMatter 
              ? `Pregunta sobre ${selectedMatter.reference}...` 
              : `Pregunta a ${agent.name}...`
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Las respuestas de IA son orientativas y no sustituyen asesoramiento profesional
        </p>
      </form>
    </div>
  );
}

// ===== EMPTY STATE =====
function EmptyState({ 
  agent, 
  quickActions,
  onSelectAction 
}: { 
  agent: typeof AGENTS[AgentType];
  quickActions: typeof QUICK_ACTIONS;
  onSelectAction: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${agent.color}40, ${agent.color}10)` }}
      >
        <Sparkles className="w-10 h-10 animate-pulse" style={{ color: agent.color }} />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">
        ¡Hola! Soy {agent.name}
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        Tu asistente de IA para propiedad intelectual. Puedo buscar información, crear tareas, generar documentos y más.
      </p>
      
      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
        {quickActions.map((action, i) => (
          <Button
            key={i}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all hover:scale-[1.02] hover:shadow-md"
            style={{ animationDelay: `${i * 100}ms` }}
            onClick={() => onSelectAction(action.prompt)}
          >
            <action.icon className="w-5 h-5" style={{ color: agent.color }} />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
      
      {/* Capabilities */}
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">Puedo ayudarte con:</p>
        <ul className="space-y-1">
          {agent.capabilities.map((cap, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ===== MESSAGE BUBBLE =====
function MessageBubble({ 
  message,
  agentColor,
  onFeedback,
  onCopy
}: { 
  message: AIMessage;
  agentColor: string;
  onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
  onCopy: (content: string) => void;
}) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div 
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isUser ? "bg-muted" : ""
        )}
        style={!isUser ? { backgroundColor: `${agentColor}20` } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Bot className="w-4 h-4" style={{ color: agentColor }} />
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "rounded-xl p-4",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border shadow-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Actions taken */}
        {message.actions_taken && message.actions_taken.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.actions_taken.map((action, i) => (
              <ActionBadge key={i} action={action} />
            ))}
          </div>
        )}
        
        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-xs gap-1">
                📄 {source.title || source.id}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Actions for assistant messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onCopy(message.content)}
              title="Copiar"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            {!message.feedback && !message.id.startsWith('temp-') && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-primary"
                  onClick={() => onFeedback(message.id, 'positive')}
                  title="Útil"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                  onClick={() => onFeedback(message.id, 'negative')}
                  title="No útil"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
            {message.feedback === 'positive' && (
              <ThumbsUp className="w-4 h-4 text-primary" />
            )}
            {message.feedback === 'negative' && (
              <ThumbsDown className="w-4 h-4 text-destructive" />
            )}
            {message.response_time_ms && (
              <span className="text-xs text-muted-foreground ml-2">
                {(message.response_time_ms / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(message.created_at), { 
            addSuffix: true, 
            locale: es 
          })}
        </p>
      </div>
    </div>
  );
}

// ===== ACTION BADGE =====
function ActionBadge({ action }: { action: AIActionTaken }) {
  const icons: Record<string, React.ReactNode> = {
    search_matters: <Folder className="w-3 h-3" />,
    create_task: <CheckSquare className="w-3 h-3" />,
    get_deadlines: <Calendar className="w-3 h-3" />,
  };

  const labels: Record<string, string> = {
    search_matters: `Búsqueda: ${action.results || 0} resultados`,
    create_task: `Tarea creada: ${action.title || ''}`,
    get_deadlines: `${action.results || 0} plazos encontrados`,
  };

  return (
    <Badge variant="secondary" className="text-xs gap-1">
      {icons[action.type]}
      {labels[action.type] || action.type}
    </Badge>
  );
}

export default GeniusChatEnhanced;
