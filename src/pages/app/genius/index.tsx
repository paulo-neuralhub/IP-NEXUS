import { useState } from 'react';
import { GeniusChat, ConversationSidebar, AgentSelector } from '@/components/features/genius';
import type { AgentType, AIConversation } from '@/types/genius';

export default function GeniusPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('legal');
  const [selectedConversation, setSelectedConversation] = useState<string | undefined>();
  
  const handleNewChat = () => {
    setSelectedConversation(undefined);
  };
  
  const handleSelectConversation = (conv: AIConversation) => {
    setSelectedConversation(conv.id);
    setSelectedAgent(conv.agent_type);
  };
  
  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Agent selector */}
      <div className="mb-4">
        <AgentSelector 
          selected={selectedAgent} 
          onChange={(agent) => {
            setSelectedAgent(agent);
            setSelectedConversation(undefined);
          }} 
        />
      </div>
      
      {/* Main content */}
      <div className="flex h-[calc(100%-4rem)] rounded-xl border bg-card overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 hidden md:block">
          <ConversationSidebar
            agentType={selectedAgent}
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </div>
        
        {/* Chat */}
        <div className="flex-1">
          <GeniusChat
            agentType={selectedAgent}
            initialConversationId={selectedConversation}
            onConversationChange={setSelectedConversation}
          />
        </div>
      </div>
    </div>
  );
}
