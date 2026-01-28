/**
 * CRM Kanban Page - Kanban dinámico con selector de pipelines desde BD
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeads, useUpdateLeadStatus, useApproveLead, Lead, LeadStatus } from '@/hooks/crm/useLeads';
import { useDeals, useUpdateDealStage, useWinDeal, useLoseDeal, Deal, DealStage } from '@/hooks/crm/useDeals';
import { useCRMPipelines, CRMPipeline, CRMPipelineStage } from '@/hooks/crm/v2/pipelines';
import { PipelineKanbanColumn } from '@/components/features/crm/pipeline/PipelineKanbanColumn';
import { PipelineCard } from '@/components/features/crm/pipeline/PipelineCard';
import { LeadDetailModal } from '@/components/crm/modals/LeadDetailModal';
import { DealDetailSheet } from '@/components/crm/modals/DealDetailSheet';
import { Plus, Search, Filter, RefreshCw, Info, KanbanSquare, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type ViewType = 'leads' | 'deals';

// Tipo unificado para columnas
type KanbanColumn = {
  id: string;
  title: string;
  color: string;
  status?: LeadStatus;
  stage?: DealStage;
  isWon?: boolean;
  isLost?: boolean;
  probability?: number;
};

// Mapeo de nombres de etapas en español a códigos del enum
const STAGE_NAME_TO_STATUS: Record<string, LeadStatus> = {
  'nuevo': 'new',
  'new': 'new',
  'contactado': 'contacted',
  'contacted': 'contacted',
  'contacto inicial': 'contacted',
  'cualificado': 'contacted',
  'propuesta': 'standby',
  'propuesta enviada': 'standby',
  'negociación': 'standby',
  'negociacion': 'standby',
  'rellamar': 'standby',
  'standby': 'standby',
  'recontactar': 'standby',
  'ganado': 'converted',
  'ganada': 'converted',
  'cliente ganado': 'converted',
  'converted': 'converted',
};

const STAGE_NAME_TO_DEAL_STAGE: Record<string, DealStage> = {
  'nueva': 'contacted',
  'new': 'contacted',
  'contactado': 'contacted',
  'contacted': 'contacted',
  'reunión': 'qualified',
  'reunion': 'qualified',
  'cualificado': 'qualified',
  'qualified': 'qualified',
  'propuesta': 'proposal',
  'propuesta enviada': 'proposal',
  'proposal': 'proposal',
  'negociación': 'negotiation',
  'negociacion': 'negotiation',
  'negotiation': 'negotiation',
  'ganado': 'won',
  'ganada': 'won',
  'won': 'won',
  'perdido': 'lost',
  'perdida': 'lost',
  'lost': 'lost',
};

// Columnas fallback para Leads (cuando no hay pipeline configurado)
const FALLBACK_LEAD_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: '🆕 Nuevo', color: '#3B82F6', status: 'new' as LeadStatus },
  { id: 'contacted', title: '📞 Contactar', color: '#8B5CF6', status: 'contacted' as LeadStatus },
  { id: 'standby', title: '🔄 Rellamar', color: '#F59E0B', status: 'standby' as LeadStatus },
  { id: 'qualified', title: '✅ Cualificado', color: '#22C55E', status: 'converted' as LeadStatus, isWon: true },
  { id: 'discard', title: '❌ Descartado', color: '#EF4444', status: 'standby' as LeadStatus, isLost: true },
];

// Columnas fallback para Negociaciones (cuando no hay pipeline configurado)
const FALLBACK_DEAL_COLUMNS: KanbanColumn[] = [
  { id: 'contacted', title: '🆕 Nueva', color: '#3B82F6', stage: 'contacted' as DealStage },
  { id: 'qualified', title: '📅 Reunión', color: '#8B5CF6', stage: 'qualified' as DealStage },
  { id: 'proposal', title: '📄 Propuesta', color: '#F59E0B', stage: 'proposal' as DealStage },
  { id: 'negotiation', title: '🤝 Negociación', color: '#EC4899', stage: 'negotiation' as DealStage },
  { id: 'won', title: '✅ Ganado', color: '#22C55E', stage: 'won' as DealStage, isWon: true },
  { id: 'lost', title: '❌ Perdido', color: '#EF4444', stage: 'lost' as DealStage, isLost: true },
];

export default function CRMPipelinePage() {
  usePageTitle('Kanban');
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Load pipelines from database
  const { data: pipelines = [], isLoading: isLoadingPipelines } = useCRMPipelines();
  
  // Selected pipeline state
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Detail modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Set default pipeline once loaded
  useEffect(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      const urlPipeline = searchParams.get('pipeline');
      const found = urlPipeline ? pipelines.find(p => p.id === urlPipeline) : null;
      const defaultPipeline = found || pipelines.find(p => p.is_default) || pipelines[0];
      if (defaultPipeline) {
        setSelectedPipelineId(defaultPipeline.id);
      }
    }
  }, [pipelines, selectedPipelineId, searchParams]);

  // Current selected pipeline
  const selectedPipeline = useMemo(() => {
    return pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];
  }, [pipelines, selectedPipelineId]);

  // Get stages from selected pipeline (with fallback)
  const stages = useMemo(() => {
    if (selectedPipeline?.stages && selectedPipeline.stages.length > 0) {
      return selectedPipeline.stages;
    }
    return [];
  }, [selectedPipeline]);

  // Determine view type based on pipeline name or id
  const view: ViewType = useMemo(() => {
    if (!selectedPipeline) return 'deals';
    const name = selectedPipeline.name.toLowerCase();
    if (name.includes('lead')) return 'leads';
    return 'deals';
  }, [selectedPipeline]);

  // Data
  const { data: leads = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useLeads();
  const { data: deals = [], isLoading: isLoadingDeals, refetch: refetchDeals } = useDeals();

  // Mutations
  const updateLeadStatus = useUpdateLeadStatus();
  const approveLead = useApproveLead();
  const updateDealStage = useUpdateDealStage();
  const winDeal = useWinDeal();
  const loseDeal = useLoseDeal();

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Filter items by search
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(l => 
      l.contact_name?.toLowerCase().includes(q) ||
      l.company_name?.toLowerCase().includes(q) ||
      l.contact_email?.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals;
    const q = searchQuery.toLowerCase();
    return deals.filter(d => 
      d.name?.toLowerCase().includes(q) ||
      d.client?.name?.toLowerCase().includes(q)
    );
  }, [deals, searchQuery]);

  // Build columns from stages or fallback
  const columns = useMemo(() => {
    if (stages.length > 0) {
      return stages.map(stage => {
        const normalizedName = stage.name.toLowerCase().replace(/\s+/g, ' ').trim();
        return {
          id: stage.id,
          title: stage.name,
          color: stage.color || '#3B82F6',
          isWon: stage.is_won_stage ?? false,
          isLost: stage.is_lost_stage ?? false,
          probability: stage.probability,
          // Usar mapeo para obtener el status/stage correcto del enum
          status: STAGE_NAME_TO_STATUS[normalizedName] || 'new' as LeadStatus,
          stage: STAGE_NAME_TO_DEAL_STAGE[normalizedName] || 'contacted' as DealStage,
        };
      });
    }
    return view === 'leads' ? FALLBACK_LEAD_COLUMNS : FALLBACK_DEAL_COLUMNS;
  }, [stages, view]);

  // Group items by column
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, (Lead | Deal)[]> = {};
    columns.forEach(col => { grouped[col.id] = []; });
    
    if (view === 'leads') {
      filteredLeads.forEach(lead => {
        const status = lead.status || 'new';
        if (status === 'converted') return;
        // Find matching column
        const col = columns.find(c => c.status === status || c.id === status);
        if (col && grouped[col.id]) {
          grouped[col.id].push(lead);
        } else if (grouped[columns[0]?.id]) {
          grouped[columns[0].id].push(lead);
        }
      });
    } else {
      filteredDeals.forEach(deal => {
        const stageValue = deal.stage || 'contacted';
        // Match by stage name
        const col = columns.find(c => c.id === stageValue || c.stage === stageValue);
        if (col && grouped[col.id]) {
          grouped[col.id].push(deal);
        } else if (grouped[columns[0]?.id]) {
          grouped[columns[0].id].push(deal);
        }
      });
    }
    
    return grouped;
  }, [columns, filteredLeads, filteredDeals, view]);

  // Handle pipeline change
  const handlePipelineChange = (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    setSearchParams({ pipeline: pipelineId });
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    const itemId = active.id as string;
    const targetColId = over.id as string;
    const targetCol = columns.find(c => c.id === targetColId);
    if (!targetCol) return;

    if (view === 'leads') {
      const lead = leads.find(l => l.id === itemId);
      if (!lead) return;

      // Check if converting to deal (won stage)
      if (targetCol.isWon) {
        approveLead.mutate(
          { leadId: lead.id, dealTitle: `Oportunidad de ${lead.company_name || lead.contact_name}` },
          { onSuccess: () => toast.success('Lead convertido a negociación') }
        );
        return;
      }

      // Check if discarding (lost stage) - just move to standby
      if (targetCol.isLost) {
        updateLeadStatus.mutate(
          { leadId: lead.id, status: 'standby' },
          { onSuccess: () => toast.info('Lead descartado') }
        );
        return;
      }

      // Normalize and validate status before updating
      const validStatuses: LeadStatus[] = ['new', 'contacted', 'standby', 'converted'];
      
      // Double-check: mapear el status por si no se mapeó correctamente
      const statusNormalizer: Record<string, LeadStatus> = {
        'new': 'new', 'nuevo': 'new',
        'contacted': 'contacted', 'contactado': 'contacted', 'contacto inicial': 'contacted',
        'standby': 'standby', 'propuesta': 'standby', 'negociación': 'standby', 'negociacion': 'standby', 'rellamar': 'standby',
        'converted': 'converted', 'ganado': 'converted', 'cualificado': 'converted',
      };
      
      const rawStatus = targetCol.status as string;
      const newStatus = statusNormalizer[rawStatus.toLowerCase()] || statusNormalizer[rawStatus] || 'new';
      
      if (!validStatuses.includes(newStatus)) {
        toast.error(`Status no válido: ${rawStatus}`);
        return;
      }

      if (lead.status !== newStatus) {
        updateLeadStatus.mutate(
          { leadId: lead.id, status: newStatus },
          { onSuccess: () => toast.success(`Movido a ${targetCol.title}`) }
        );
      }
    } else {
      const deal = deals.find(d => d.id === itemId);
      if (!deal) return;

      if (targetCol.isWon) {
        winDeal.mutate({ dealId: deal.id }, { onSuccess: () => toast.success('🎉 ¡Deal ganado!') });
        return;
      }

      if (targetCol.isLost) {
        loseDeal.mutate(
          { dealId: deal.id, reason: 'Perdido' },
          { onSuccess: () => toast.info('Deal marcado como perdido') }
        );
        return;
      }

      // Update to new stage
      if (targetCol.stage) {
        updateDealStage.mutate(
          { dealId: deal.id, stage: targetCol.stage },
          { onSuccess: () => toast.success(`Movido a ${targetCol.title}`) }
        );
      }
    }
  };

  const handleRefresh = useCallback(() => {
    refetchLeads();
    refetchDeals();
    toast.success('Datos actualizados');
  }, [refetchLeads, refetchDeals]);

  const isLoading = isLoadingPipelines || (view === 'leads' ? isLoadingLeads : isLoadingDeals);

  // Active item for overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    if (view === 'leads') return leads.find(l => l.id === activeId);
    return deals.find(d => d.id === activeId);
  }, [activeId, view, leads, deals]);

  return (
    <div className="flex flex-col gap-4 h-full" style={{ minHeight: 'calc(100vh - 180px)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Pipeline selector dropdown */}
          <div className="flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedPipelineId || ''} onValueChange={handlePipelineChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Seleccionar pipeline..." />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    <div className="flex items-center gap-2">
                      <span>{pipeline.name}</span>
                      {pipeline.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Por defecto
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {pipelines.length === 0 && !isLoadingPipelines && (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No hay pipelines configurados
                  </div>
                )}
              </SelectContent>
            </Select>
            <Link to="/app/crm/settings">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem>Todos</DropdownMenuItem>
              <DropdownMenuItem>Alta prioridad</DropdownMenuItem>
              <DropdownMenuItem>Esta semana</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* New */}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Info className="w-4 h-4" />
        Arrastra las tarjetas entre columnas para cambiar su estado. Las etapas se configuran en{' '}
        <Link to="/app/crm/settings" className="text-primary hover:underline">Configuración</Link>.
      </div>

      {/* Kanban Board - Full height with visible scroll */}
      {isLoading ? (
        <div 
          className="flex gap-4 pb-4 flex-1 min-h-0"
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="w-[300px] h-full min-h-[400px] flex-shrink-0" />
          ))}
        </div>
      ) : columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <KanbanSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay etapas configuradas</h3>
            <p className="text-muted-foreground mb-4">
              Crea un pipeline con etapas en la configuración
            </p>
            <Link to="/app/crm/settings">
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Configurar pipelines
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div 
            className="flex gap-4 pb-4 flex-1"
            style={{ 
              overflowX: 'auto', 
              overflowY: 'hidden',
              height: 'calc(100vh - 280px)',
              minHeight: '400px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 #f1f5f9',
              scrollBehavior: 'smooth',
            }}
          >
            {columns.map(col => {
              const items = (itemsByColumn[col.id] || []) as (Lead | Deal)[];
              const totalValue = items.reduce((sum, item) => {
                const val = view === 'leads' ? (item as Lead).estimated_value : (item as Deal).amount;
                return sum + (val || 0);
              }, 0);

              return (
                <PipelineKanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  count={items.length}
                  totalValue={totalValue}
                  isWon={col.isWon}
                  isLost={col.isLost}
                >
                  {items.map(item => (
                    <PipelineCard
                      key={item.id}
                      item={item}
                      type={view}
                      onClick={() => {
                        if (view === 'leads') setSelectedLead(item as Lead);
                        else setSelectedDeal(item as Deal);
                      }}
                    />
                  ))}
                </PipelineKanbanColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeItem && (
              <PipelineCard
                item={activeItem}
                type={view}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Detail Modals */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      )}

      {selectedDeal && (
        <DealDetailSheet
          deal={selectedDeal}
          open={!!selectedDeal}
          onOpenChange={(open) => !open && setSelectedDeal(null)}
        />
      )}
    </div>
  );
}
