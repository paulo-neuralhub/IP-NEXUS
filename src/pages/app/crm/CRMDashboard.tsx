import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePipelines, useDeals, useCreatePipeline } from '@/hooks/use-crm';
import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  KanbanBoard, DealFormModal, DealDetailSheet 
} from '@/components/features/crm';
import { DEFAULT_PIPELINES } from '@/lib/constants/crm';
import { toast } from 'sonner';
import {
  Plus, TrendingUp, DollarSign, Trophy, XCircle, Percent, Loader2
} from 'lucide-react';
import type { Deal, Pipeline } from '@/types/crm';

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}

export default function CRMDashboard() {
  usePageTitle('CRM');
  const navigate = useNavigate();

  // State
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [showDealForm, setShowDealForm] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState<string>('');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Queries
  const { data: pipelines = [], isLoading: loadingPipelines, refetch: refetchPipelines } = usePipelines();
  const createPipeline = useCreatePipeline();
  
  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);
  
  const { data: deals = [], isLoading: loadingDeals, refetch: refetchDeals } = useDeals({
    pipeline_id: selectedPipelineId || undefined,
  });

  // Auto-select first pipeline or create default
  useEffect(() => {
    if (loadingPipelines) return;
    
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    } else if (pipelines.length === 0 && !isInitializing) {
      // Create default pipeline
      createDefaultPipeline();
    }
  }, [pipelines, loadingPipelines, selectedPipelineId]);

  const createDefaultPipeline = async () => {
    setIsInitializing(true);
    try {
      const salesPipeline = DEFAULT_PIPELINES.sales;
      await createPipeline.mutateAsync({
        name: salesPipeline.name,
        pipeline_type: 'sales',
        stages: salesPipeline.stages.map(s => ({
          name: s.name,
          color: s.color,
          probability: s.probability,
          is_won_stage: 'is_won_stage' in s ? (s as { is_won_stage?: boolean }).is_won_stage || false : false,
          is_lost_stage: 'is_lost_stage' in s ? (s as { is_lost_stage?: boolean }).is_lost_stage || false : false,
        })),
      });
      toast.success('Pipeline de ventas creado');
      await refetchPipelines();
    } catch (error) {
      console.error('Error creating pipeline:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const openDeals = deals.filter(d => d.status === 'open');
    const wonDeals = deals.filter(d => d.status === 'won');
    const lostDeals = deals.filter(d => d.status === 'lost');
    
    const thisMonth = new Date();
    const wonThisMonth = wonDeals.filter(d => {
      const date = new Date(d.closed_at || d.created_at);
      return date.getMonth() === thisMonth.getMonth() && 
             date.getFullYear() === thisMonth.getFullYear();
    });
    const lostThisMonth = lostDeals.filter(d => {
      const date = new Date(d.closed_at || d.created_at);
      return date.getMonth() === thisMonth.getMonth() && 
             date.getFullYear() === thisMonth.getFullYear();
    });

    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = wonThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);
    const lostValue = lostThisMonth.reduce((sum, d) => sum + (d.value || 0), 0);
    
    const closedThisMonth = wonThisMonth.length + lostThisMonth.length;
    const conversionRate = closedThisMonth > 0 
      ? Math.round((wonThisMonth.length / closedThisMonth) * 100) 
      : 0;

    return {
      openDeals: openDeals.length,
      pipelineValue,
      wonThisMonth: wonThisMonth.length,
      wonValue,
      lostThisMonth: lostThisMonth.length,
      lostValue,
      conversionRate,
    };
  }, [deals]);

  const handleAddDeal = (stageId: string) => {
    setDefaultStageId(stageId);
    setShowDealForm(true);
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  if (loadingPipelines || isInitializing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[400px] w-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => {
          setDefaultStageId('');
          setShowDealForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.openDeals}</p>
                <p className="text-xs text-muted-foreground">Deals abiertos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.pipelineValue)}</p>
                <p className="text-xs text-muted-foreground">Valor pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.wonThisMonth}</p>
                <p className="text-xs text-muted-foreground">Ganados este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.lostThisMonth}</p>
                <p className="text-xs text-muted-foreground">Perdidos este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Percent className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Tasa conversión</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban */}
      {selectedPipeline ? (
        loadingDeals ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[400px] w-72 flex-shrink-0" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            pipeline={selectedPipeline}
            deals={deals}
            onDealClick={handleDealClick}
            onAddDeal={handleAddDeal}
          />
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              Selecciona un pipeline para ver los deals
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <DealFormModal
        open={showDealForm}
        onClose={() => {
          setShowDealForm(false);
          setDefaultStageId('');
        }}
        defaultPipelineId={selectedPipelineId}
        defaultStageId={defaultStageId}
      />

      <DealDetailSheet
        deal={selectedDeal}
        open={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={() => refetchDeals()}
      />
    </div>
  );
}
