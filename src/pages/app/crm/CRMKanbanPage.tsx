/**
 * CRM Kanban Page - Vista unificada de Leads y Deals
 */

import { useState, useMemo } from 'react';
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
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useLeads, useUpdateLeadStatus, useApproveLead, useDeleteLead, Lead, LeadStatus } from '@/hooks/crm/useLeads';
import { useDeals, useUpdateDealStage, useWinDeal, useLoseDeal, Deal, DealStage } from '@/hooks/crm/useDeals';
import { LeadCard } from '@/components/crm/kanban/LeadCard';
import { DealCard } from '@/components/crm/kanban/DealCard';
import { KanbanColumn } from '@/components/crm/kanban/KanbanColumn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, RefreshCw, ArrowRight, Users, Handshake } from 'lucide-react';
import { toast } from 'sonner';

// Columnas de Leads
const LEAD_COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'new', title: 'Nuevos', color: 'bg-primary' },
  { id: 'contacted', title: 'Contactados', color: 'bg-[hsl(var(--ip-pending-text))]' },
  { id: 'standby', title: 'Stand-by', color: 'bg-muted-foreground' },
];

// Columnas de Deals
const DEAL_COLUMNS: { id: DealStage; title: string; color: string }[] = [
  { id: 'contacted', title: 'Contactado', color: 'bg-primary' },
  { id: 'qualified', title: 'Cualificado', color: 'bg-[hsl(var(--ip-pending-text))]' },
  { id: 'proposal', title: 'Propuesta', color: 'bg-[hsl(var(--ip-action-whatsapp-text))]' },
  { id: 'negotiation', title: 'Negociación', color: 'bg-[hsl(var(--ip-success-text))]' },
];

// Motivos de pérdida predefinidos
const LOSS_REASONS = [
  { value: 'price', label: 'Precio muy alto' },
  { value: 'competitor', label: 'Eligió competidor' },
  { value: 'timing', label: 'Mal momento' },
  { value: 'no_budget', label: 'Sin presupuesto' },
  { value: 'no_response', label: 'Sin respuesta' },
  { value: 'other', label: 'Otro motivo' },
];

export default function CRMKanbanPage() {
  // Data
  const { data: leads = [], isLoading: isLoadingLeads, refetch: refetchLeads } = useLeads();
  const { data: deals = [], isLoading: isLoadingDeals, refetch: refetchDeals } = useDeals({ exclude_closed: true });

  // Mutations
  const updateLeadStatus = useUpdateLeadStatus();
  const approveLead = useApproveLead();
  const deleteLead = useDeleteLead();
  const updateDealStage = useUpdateDealStage();
  const winDeal = useWinDeal();
  const loseDeal = useLoseDeal();

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'lead' | 'deal' | null>(null);

  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{ leadId: string; name: string } | null>(null);
  const [approveModal, setApproveModal] = useState<Lead | null>(null);
  const [winModal, setWinModal] = useState<Deal | null>(null);
  const [loseModal, setLoseModal] = useState<Deal | null>(null);

  // Form states
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [wonValue, setWonValue] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [lossDetail, setLossDetail] = useState('');

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      standby: [],
      converted: [],
    };
    leads.forEach((lead) => {
      if (lead.status !== 'converted') {
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [leads]);

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    deals.forEach((deal) => {
      if (deal.stage !== 'won' && deal.stage !== 'lost') {
        grouped[deal.stage].push(deal);
      }
    });
    return grouped;
  }, [deals]);

  // Active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    if (activeType === 'lead') {
      return leads.find((l) => l.id === activeId);
    }
    return deals.find((d) => d.id === activeId);
  }, [activeId, activeType, leads, deals]);

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Could be used for visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;

    if (activeData?.type === 'lead') {
      const lead = activeData.lead as Lead;
      
      // Check if dropping on deal columns (approve action)
      if (DEAL_COLUMNS.some((col) => col.id === overId)) {
        setApproveModal(lead);
        return;
      }

      // Moving between lead columns
      const newStatus = overId as LeadStatus;
      if (LEAD_COLUMNS.some((col) => col.id === newStatus) && lead.status !== newStatus) {
        updateLeadStatus.mutate({
          leadId: lead.id,
          status: newStatus,
        });
      }
    } else if (activeData?.type === 'deal') {
      const deal = activeData.deal as Deal;
      const newStage = overId as DealStage;

      if (DEAL_COLUMNS.some((col) => col.id === newStage) && deal.stage !== newStage) {
        updateDealStage.mutate({
          dealId: deal.id,
          stage: newStage,
        });
      }
    }
  };

  // Lead actions
  const handleApprove = (lead: Lead) => {
    setDealTitle(`Oportunidad de ${lead.company_name || lead.contact_name}`);
    setDealValue(lead.estimated_value?.toString() || '');
    setApproveModal(lead);
  };

  const confirmApprove = () => {
    if (!approveModal) return;
    approveLead.mutate(
      {
        leadId: approveModal.id,
        dealTitle: dealTitle || undefined,
        dealValue: dealValue ? parseFloat(dealValue) : undefined,
      },
      {
        onSuccess: () => {
          setApproveModal(null);
          setDealTitle('');
          setDealValue('');
        },
      }
    );
  };

  const handleDelete = (lead: Lead) => {
    setDeleteConfirm({ leadId: lead.id, name: lead.contact_name });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteLead.mutate(
      { leadId: deleteConfirm.leadId, reason: 'No cualificado' },
      { onSuccess: () => setDeleteConfirm(null) }
    );
  };

  // Deal actions
  const handleWin = (deal: Deal) => {
    setWonValue(deal.amount?.toString() || '');
    setWinModal(deal);
  };

  const confirmWin = () => {
    if (!winModal) return;
    winDeal.mutate(
      {
        dealId: winModal.id,
        wonValue: wonValue ? parseFloat(wonValue) : undefined,
      },
      {
        onSuccess: () => {
          setWinModal(null);
          setWonValue('');
        },
      }
    );
  };

  const handleLose = (deal: Deal) => {
    setLossReason('');
    setLossDetail('');
    setLoseModal(deal);
  };

  const confirmLose = () => {
    if (!loseModal || !lossReason) {
      toast.error('Selecciona un motivo de pérdida');
      return;
    }
    loseDeal.mutate(
      {
        dealId: loseModal.id,
        reason: lossReason,
        reasonDetail: lossDetail || undefined,
      },
      {
        onSuccess: () => {
          setLoseModal(null);
          setLossReason('');
          setLossDetail('');
        },
      }
    );
  };

  const isLoading = isLoadingLeads || isLoadingDeals;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-xl font-semibold">CRM Kanban</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona leads y oportunidades de venta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { refetchLeads(); refetchDeals(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full overflow-x-auto">
            {/* LEADS Section */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">LEADS</span>
                <Badge variant="outline">{leads.filter(l => l.status !== 'converted').length}</Badge>
              </div>
              <div className="flex gap-4 h-[calc(100%-40px)]">
                {LEAD_COLUMNS.map((column) => (
                  <div key={column.id} className="w-[280px] flex-shrink-0">
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      color={column.color}
                      items={leadsByStatus[column.id]}
                    >
                      {leadsByStatus[column.id].map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onApprove={() => handleApprove(lead)}
                          onDelete={() => handleDelete(lead)}
                          onCall={() => toast.info(`Llamando a ${lead.contact_phone}`)}
                          onEmail={() => toast.info(`Email a ${lead.contact_email}`)}
                        />
                      ))}
                    </KanbanColumn>
                  </div>
                ))}
              </div>
            </div>

            {/* SEPARATOR */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="w-px h-full bg-border relative">
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-background px-2 py-4 border rounded-lg">
                  <ArrowRight className="w-5 h-5 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground writing-mode-vertical">
                    Aprobar
                  </span>
                </div>
              </div>
            </div>

            {/* DEALS Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Handshake className="w-4 h-4 text-[hsl(var(--ip-success-text))]" />
                <span className="font-semibold text-sm">DEALS</span>
                <Badge variant="outline">{deals.length}</Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  Total: <span className="font-semibold text-foreground">{deals.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('es-ES')} €</span>
                </span>
              </div>
              <div className="flex gap-4 h-[calc(100%-40px)] overflow-x-auto">
                {DEAL_COLUMNS.map((column) => (
                  <div key={column.id} className="w-[280px] flex-shrink-0">
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      color={column.color}
                      items={dealsByStage[column.id]}
                    >
                      {dealsByStage[column.id].map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onWin={() => handleWin(deal)}
                          onLose={() => handleLose(deal)}
                          onCall={() => toast.info(`Llamando a ${deal.client?.phone}`)}
                          onEmail={() => toast.info(`Email a ${deal.client?.email}`)}
                          onWhatsApp={() => toast.info(`WhatsApp a ${deal.client?.phone}`)}
                        />
                      ))}
                    </KanbanColumn>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem && activeType === 'lead' && (
              <LeadCard lead={activeItem as Lead} isDragging />
            )}
            {activeItem && activeType === 'deal' && (
              <DealCard deal={activeItem as Deal} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el lead "{deleteConfirm?.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Lead Modal */}
      <Dialog open={!!approveModal} onOpenChange={() => setApproveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Lead → Crear Deal</DialogTitle>
            <DialogDescription>
              Se creará un cliente y un deal a partir de este lead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título del Deal</Label>
              <Input
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                placeholder="Oportunidad de..."
              />
            </div>
            <div className="space-y-2">
              <Label>Valor estimado (€)</Label>
              <Input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="0"
              />
            </div>
            {approveModal && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Cliente:</strong> {approveModal.company_name || approveModal.contact_name}</p>
                <p><strong>Contacto:</strong> {approveModal.contact_name}</p>
                <p><strong>Email:</strong> {approveModal.contact_email || '-'}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmApprove} disabled={approveLead.isPending}>
              {approveLead.isPending ? 'Creando...' : 'Aprobar y Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Win Deal Modal */}
      <Dialog open={!!winModal} onOpenChange={() => setWinModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Marcar como Ganado</DialogTitle>
            <DialogDescription>
              Confirma el valor final del deal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Valor ganado (€)</Label>
              <Input
                type="number"
                value={wonValue}
                onChange={(e) => setWonValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWinModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmWin} disabled={winDeal.isPending} className="bg-[hsl(var(--ip-success-bg))] text-[hsl(var(--ip-success-text))] hover:bg-[hsl(var(--ip-success-bg))]/90">
              {winDeal.isPending ? 'Guardando...' : 'Confirmar Ganado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lose Deal Modal */}
      <Dialog open={!!loseModal} onOpenChange={() => setLoseModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Perdido</DialogTitle>
            <DialogDescription>
              Indica el motivo de la pérdida para mejorar el análisis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo principal *</Label>
              <Select value={lossReason} onValueChange={setLossReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Detalle (opcional)</Label>
              <Textarea
                value={lossDetail}
                onChange={(e) => setLossDetail(e.target.value)}
                placeholder="Más información sobre la pérdida..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoseModal(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmLose} disabled={loseDeal.isPending || !lossReason} variant="destructive">
              {loseDeal.isPending ? 'Guardando...' : 'Confirmar Perdido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
