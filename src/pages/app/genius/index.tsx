import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GeniusChatEnhanced, ConversationSidebar, AgentSelector } from '@/components/features/genius';
import type { AgentType, AIConversation } from '@/types/genius';
import { usePageTitle } from '@/contexts/page-context';
import { Menu, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeatureGuide, InlineHelp } from '@/components/help';
import { useContextualHelp } from '@/hooks/useContextualHelp';

export default function GeniusPage() {
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
  const { setTitle } = usePageTitle();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [helpMode, setHelpMode] = useState(searchParams.get('mode') === 'help');
  
  const [agentType, setAgentType] = useState<AgentType>(
    ((searchParams.get('agent') as AgentType) || 'legal')
  );
  const [conversationId, setConversationId] = useState<string | undefined>(
    searchParams.get('conversation') || undefined
  );
  
  useEffect(() => {
    setTitle('IP-GENIUS');
  }, [setTitle]);
  
  const handleAgentChange = (agent: AgentType) => {
    if (helpMode) return;
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
  
  const setMode = (next: 'ai' | 'help') => {
    const isHelp = next === 'help';
    setHelpMode(isHelp);
    const nextAgent: AgentType = isHelp ? 'guide' : agentType;
    setAgentType(nextAgent);
    setConversationId(undefined);
    const nextParams: Record<string, string> = { agent: nextAgent };
    if (isHelp) nextParams.mode = 'help';
    setSearchParams(nextParams);
  };

  return (
    <div className="space-y-4">
      {currentGuide && shouldShowGuide(featureKey) ? (
        <FeatureGuide featureKey={featureKey} title={currentGuide.title} steps={currentGuide.steps} />
      ) : null}

      <div className="h-[calc(100vh-10rem)] flex rounded-[14px] border border-[rgba(0,0,0,0.06)] bg-card overflow-hidden">
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
          <div className="flex items-center justify-between gap-3">
            <div className={cn(helpMode ? 'opacity-60 pointer-events-none' : '')}>
              <AgentSelector
                selected={helpMode ? 'guide' : agentType}
                onChange={handleAgentChange}
                variant="tabs"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              <Button
                type="button"
                variant={helpMode ? 'ghost' : 'secondary'}
                size="sm"
                className="h-8"
                onClick={() => setMode('ai')}
              >
                IA
              </Button>
              <Button
                type="button"
                variant={helpMode ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8"
                onClick={() => setMode('help')}
              >
                Ayuda
              </Button>
            </div>
          </div>

          {helpMode ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Estás en <span className="font-medium">Modo Ayuda</span>: preguntas sobre cómo usar IP-NEXUS (con artículos del Help Center).
            </p>
          ) : null}
        </div>
        
        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <GeniusChatEnhanced
            key={`${agentType}-${conversationId}`}
            agentType={agentType}
            initialConversationId={conversationId}
            onConversationChange={handleConversationChange}
            helpMode={helpMode}
          />
        </div>
      </div>
    </div>
    </div>
  );
}
