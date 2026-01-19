import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GeniusChat, ConversationSidebar, AgentSelector } from '@/components/features/genius';
import type { AgentType, AIConversation } from '@/types/genius';
import { usePageTitle } from '@/contexts/page-context';

export default function GeniusPage() {
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
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
  };
  
  const handleNewChat = () => {
    setConversationId(undefined);
    setSearchParams({ agent: agentType });
  };
  
  const handleConversationChange = (id: string) => {
    setConversationId(id);
    setSearchParams({ agent: agentType, conversation: id });
  };
  
  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border bg-card overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 hidden lg:block border-r">
        <ConversationSidebar
          agentType={agentType}
          selectedId={conversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>
      
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Agent selector */}
        <div className="p-4 border-b bg-muted/30">
          <AgentSelector
            selected={agentType}
            onChange={handleAgentChange}
            variant="tabs"
          />
        </div>
        
        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <GeniusChat
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
