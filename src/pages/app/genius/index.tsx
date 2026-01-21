import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GeniusChatEnhanced, ConversationSidebar, AgentSelector } from '@/components/features/genius';
import type { AgentType, AIConversation } from '@/types/genius';
import { usePageTitle } from '@/contexts/page-context';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function GeniusPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [agentType, setAgentType] = useState<AgentType>(
    (searchParams.get('agent') as AgentType) || 'legal'
  );
  const [conversationId, setConversationId] = useState<string | undefined>(
    searchParams.get('conversation') || undefined
  );
  
  useEffect(() => {
    setTitle('IP-GENIUS');
  }, [setTitle]);
  
  const handleAgentChange = (agent: AgentType) => {
    if (agent === 'translator') {
      navigate('/app/genius/translator');
      return;
    }
    setAgentType(agent);
    setConversationId(undefined);
    setSearchParams({ agent });
  };
  
  const handleSelectConversation = (conv: AIConversation) => {
    setAgentType(conv.agent_type);
    setConversationId(conv.id);
    setSearchParams({ agent: conv.agent_type, conversation: conv.id });
    setSidebarOpen(false);
  };
  
  const handleNewChat = () => {
    setConversationId(undefined);
    setSearchParams({ agent: agentType });
    setSidebarOpen(false);
  };
  
  const handleConversationChange = (id: string) => {
    setConversationId(id);
    setSearchParams({ agent: agentType, conversation: id });
  };
  
  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border bg-card overflow-hidden shadow-sm">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden absolute top-4 left-4 z-10"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <div className={cn(
        "w-72 flex-shrink-0 border-r bg-muted/30 transition-all duration-300",
        "lg:block",
        sidebarOpen 
          ? "fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto animate-slide-in-right" 
          : "hidden"
      )}>
        <ConversationSidebar
          agentType={agentType}
          selectedId={conversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>
      
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Agent selector */}
        <div className="p-4 border-b bg-gradient-to-r from-muted/50 to-transparent">
          <AgentSelector
            selected={agentType}
            onChange={handleAgentChange}
            variant="tabs"
          />
        </div>
        
        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <GeniusChatEnhanced
            key={`${agentType}-${conversationId}`}
            agentType={agentType}
            initialConversationId={conversationId}
            onConversationChange={handleConversationChange}
          />
        </div>
      </div>
    </div>
  );
}
