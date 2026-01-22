// src/pages/backoffice/ai-brain.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Hooks
import { 
  useAIProviders, 
  useAIModels, 
  useAITaskAssignments,
  useAICircuitBreaker,
  useAIRAGCollections,
  useAIAnalytics
} from '@/hooks/ai-brain';

// Components
import {
  AIBrainHeader,
  AIBrainStatsCards,
  ProvidersTab,
  ModelsTab,
  TaskRouterTab,
  CircuitBreakerTab,
  RAGTab,
  AnalyticsTab,
  ProviderDialog,
  TaskDialog,
  RAGDialog
} from '@/components/backoffice/ai-brain';

// Types
import { 
  AIProvider, 
  AIProviderFormData,
  AITaskAssignment, 
  AITaskAssignmentFormData,
  AIRAGCollection,
  AIRAGCollectionFormData
} from '@/types/ai-brain.types';

export default function AIBrainPage() {
  const [activeTab, setActiveTab] = useState('providers');
  
  // Dialog states
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [ragDialogOpen, setRagDialogOpen] = useState(false);
  
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingTask, setEditingTask] = useState<AITaskAssignment | null>(null);
  const [editingRag, setEditingRag] = useState<AIRAGCollection | null>(null);
  
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);
  const [refreshingRagId, setRefreshingRagId] = useState<string | null>(null);
  const [discoveringProviderId, setDiscoveringProviderId] = useState<string | null>(null);

  // Data hooks
  const { 
    providers, 
    isLoading: providersLoading, 
    refetch: refetchProviders,
    createProvider, 
    updateProvider, 
    deleteProvider, 
    testProvider 
  } = useAIProviders();
  
  const { models, isLoading: modelsLoading, toggleActive: toggleModelActive, discoverModels } = useAIModels();
  
  const { 
    tasks, 
    isLoading: tasksLoading, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskActive 
  } = useAITaskAssignments();
  
  const { 
    circuitStates, 
    isLoading: circuitLoading, 
    resetCircuit, 
    forceOpenCircuit 
  } = useAICircuitBreaker();
  
  const { 
    ragCollections, 
    isLoading: ragLoading, 
    createRAG, 
    updateRAG, 
    deleteRAG, 
    toggleRAGActive, 
    refreshRAG 
  } = useAIRAGCollections();
  
  const { summary, isLoading: analyticsLoading } = useAIAnalytics();

  // Provider handlers
  const openProviderDialog = (provider?: AIProvider) => {
    setEditingProvider(provider || null);
    setProviderDialogOpen(true);
  };

  const handleSaveProvider = async (data: AIProviderFormData) => {
    try {
      if (editingProvider) {
        await updateProvider.mutateAsync({ id: editingProvider.id, formData: data });
      } else {
        await createProvider.mutateAsync(data);
      }
      setProviderDialogOpen(false);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteProvider.mutateAsync(id);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleTestProvider = async (provider: AIProvider) => {
    setTestingProviderId(provider.id);
    try {
      await testProvider.mutateAsync(provider.id);
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setTestingProviderId(null);
    }
  };

  const handleDiscoverModels = async (provider: AIProvider) => {
    setDiscoveringProviderId(provider.id);
    try {
      await discoverModels.mutateAsync({ providerId: provider.id });
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setDiscoveringProviderId(null);
    }
  };

  const handleToggleModelActive = async (id: string, isActive: boolean) => {
    try {
      await toggleModelActive.mutateAsync({ id, is_active: isActive });
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleCreateDefaultProviders = async () => {
    try {
      const defaults = [
        { name: 'OpenAI', code: 'openai', base_url: 'https://api.openai.com/v1' },
        { name: 'Gemini', code: 'gemini', base_url: null },
        { name: 'Anthropic (Claude)', code: 'anthropic', base_url: 'https://api.anthropic.com' },
        { name: 'xAI (Grok)', code: 'grok', base_url: 'https://api.x.ai/v1' },
        { name: 'Meta (Llama)', code: 'meta', base_url: null },
        { name: 'DeepSeek', code: 'deepseek', base_url: 'https://api.deepseek.com/v1' },
        { name: 'Qwen', code: 'qwen', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
        { name: 'Mistral', code: 'mistral', base_url: 'https://api.mistral.ai/v1' },
        { name: 'Perplexity', code: 'perplexity', base_url: 'https://api.perplexity.ai' },
        { name: 'Kimi (Moonshot)', code: 'kimi', base_url: 'https://api.moonshot.cn/v1' },
      ] as const;

      const existingCodes = new Set(providers.map((p) => p.code.toLowerCase()));
      const toInsert = defaults
        .filter((p) => !existingCodes.has(p.code))
        .map((p) => ({
          name: p.name,
          code: p.code,
          base_url: p.base_url,
          api_key_encrypted: null,
          is_gateway: false,
          status: 'active',
          health_status: 'unknown',
          config: {},
        }));

      if (!toInsert.length) {
        toast.info('Ya están creados todos los providers por defecto.');
        return;
      }

      const { error } = await supabase.from('ai_providers').insert(toInsert);
      if (error) throw error;

      await refetchProviders();
      toast.success(`Providers creados: ${toInsert.length}`);
    } catch (e) {
      toast.error(`No se pudieron crear providers: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  };

  // Task handlers
  const openTaskDialog = (task?: AITaskAssignment) => {
    setEditingTask(task || null);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (data: AITaskAssignmentFormData) => {
    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, formData: data });
      } else {
        await createTask.mutateAsync(data);
      }
      setTaskDialogOpen(false);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleToggleTaskActive = async (id: string, isActive: boolean) => {
    try {
      await toggleTaskActive.mutateAsync({ id, is_active: isActive });
    } catch (error) {
      // Error toast handled in hook
    }
  };

  // RAG handlers
  const openRagDialog = (rag?: AIRAGCollection) => {
    setEditingRag(rag || null);
    setRagDialogOpen(true);
  };

  const handleSaveRag = async (data: AIRAGCollectionFormData) => {
    try {
      if (editingRag) {
        await updateRAG.mutateAsync({ id: editingRag.id, formData: data });
      } else {
        await createRAG.mutateAsync(data);
      }
      setRagDialogOpen(false);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleDeleteRag = async (id: string) => {
    try {
      await deleteRAG.mutateAsync(id);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleToggleRagActive = async (id: string, isActive: boolean) => {
    try {
      await toggleRAGActive.mutateAsync({ id, is_active: isActive });
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleRefreshRag = async (id: string) => {
    setRefreshingRagId(id);
    try {
      await refreshRAG.mutateAsync(id);
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setRefreshingRagId(null);
    }
  };

  // Circuit breaker handlers
  const handleResetCircuit = async (providerId: string) => {
    try {
      await resetCircuit.mutateAsync(providerId);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  const handleForceOpenCircuit = async (providerId: string) => {
    try {
      await forceOpenCircuit.mutateAsync(providerId);
    } catch (error) {
      // Error toast handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <AIBrainHeader 
        onAddProvider={() => openProviderDialog()}
        onRefresh={() => toast.info('Sincronizando...')}
      />

      <AIBrainStatsCards
        totalTokens={(summary?.totalTokensInput || 0) + (summary?.totalTokensOutput || 0)}
        inputTokens={summary?.totalTokensInput || 0}
        outputTokens={summary?.totalTokensOutput || 0}
        totalCost={summary?.totalCost || 0}
        avgLatency={summary?.avgLatency || 0}
        successRate={summary?.successRate || 0}
        isLoading={analyticsLoading}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="router">Task Router</TabsTrigger>
          <TabsTrigger value="circuit">Circuit Breaker</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <ProvidersTab
            providers={providers}
            isLoading={providersLoading}
            onEdit={openProviderDialog}
            onDelete={handleDeleteProvider}
            onTest={handleTestProvider}
            onDiscoverModels={handleDiscoverModels}
            onCreateDefaults={handleCreateDefaultProviders}
            testingProviderId={testingProviderId}
            discoveringProviderId={discoveringProviderId}
          />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <ModelsTab
            providers={providers}
            models={models}
            isLoading={modelsLoading || providersLoading}
            onToggleActive={handleToggleModelActive}
            onDiscover={(providerId) => {
              const p = providers.find((x) => x.id === providerId);
              if (p) handleDiscoverModels(p);
            }}
            discoveringProviderId={discoveringProviderId}
          />
        </TabsContent>

        <TabsContent value="router" className="space-y-4">
          <TaskRouterTab
            tasks={tasks}
            models={models}
            isLoading={tasksLoading || modelsLoading}
            onAdd={() => openTaskDialog()}
            onEdit={openTaskDialog}
            onDelete={handleDeleteTask}
            onToggleActive={handleToggleTaskActive}
          />
        </TabsContent>

        <TabsContent value="circuit" className="space-y-4">
          <CircuitBreakerTab
            circuitStates={circuitStates}
            providers={providers}
            isLoading={circuitLoading}
            onReset={handleResetCircuit}
            onForceOpen={handleForceOpenCircuit}
          />
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <RAGTab
            ragCollections={ragCollections}
            isLoading={ragLoading}
            onAdd={() => openRagDialog()}
            onEdit={openRagDialog}
            onDelete={handleDeleteRag}
            onToggleActive={handleToggleRagActive}
            onRefresh={handleRefreshRag}
            refreshingId={refreshingRagId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab
            analytics={summary}
            isLoading={analyticsLoading}
          />
        </TabsContent>
      </Tabs>

      <ProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSave={handleSaveProvider}
        isSaving={createProvider.isPending || updateProvider.isPending}
      />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        models={models}
        onSave={handleSaveTask}
        isSaving={createTask.isPending || updateTask.isPending}
      />

      <RAGDialog
        open={ragDialogOpen}
        onOpenChange={setRagDialogOpen}
        rag={editingRag}
        onSave={handleSaveRag}
        isSaving={createRAG.isPending || updateRAG.isPending}
      />
    </div>
  );
}
