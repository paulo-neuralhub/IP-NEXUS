/**
 * CRM Kanban Page - Vista UNIFICADA de Leads y Deals en un solo flujo
 * 
 * Flujo: NUEVOS → RECONTACTAR → CONTACTADO → CUALIFICADO → PROPUESTA → NEGOCIACIÓN → GANADO/PERDIDO
 *        ↑ LEADS (fondo azul) ↑         ↑ DEALS (fondo blanco) ↑
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
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useLeads, useUpdateLeadStatus, useApproveLead, useDeleteLead, Lead, LeadStatus } from '@/hooks/crm/useLeads';
import { useDeals, useUpdateDealStage, useWinDeal, useLoseDeal, Deal, DealStage } from '@/hooks/crm/useDeals';
import { UnifiedCard } from '@/components/crm/kanban/UnifiedCard';
import { UnifiedKanbanColumn } from '@/components/crm/kanban/UnifiedKanbanColumn';
import { Button } from '@/components/ui/button';
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
import { Plus, RefreshCw, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// ══════════════════════════════════════════════════════════════════════════════
// COLUMNAS UNIFICADAS - Un solo flujo continuo
// ══════════════════════════════════════════════════════════════════════════════

type ColumnType = 'lead' | 'deal';

interface UnifiedColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
  type: ColumnType;
  leadStatus?: LeadStatus;
  dealStage?: DealStage;
  isWon?: boolean;
  isLost?: boolean;
}

const UNIFIED_COLUMNS: UnifiedColumn[] = [
  // LEADS (fondo azul claro)
  { 
    id: 'new', 
    title: 'Nuevos', 
    color: 'bg-primary', 
    bgColor: 'bg-blue-50/50',
    type: 'lead',
    leadStatus: 'new',
  },
  { 
    id: 'recontact', 
    title: 'Recontactar', 
    color: 'bg-[hsl(var(--ip-pending-text))]', 
    bgColor: 'bg-blue-50/50',
    type: 'lead',
    leadStatus: 'contacted', // leads contactados pero aún no aprobados
  },
  // DEALS (fondo blanco)
  { 
    id: 'contacted', 
    title: 'Contactado', 
    color: 'bg-primary', 
    bgColor: 'bg-background',
    type: 'deal',
    dealStage: 'contacted',
  },
  { 
    id: 'qualified', 
    title: 'Cualificado', 
    color: 'bg-[hsl(var(--ip-pending-text))]', 
    bgColor: 'bg-background',
    type: 'deal',
    dealStage: 'qualified',
  },
  { 
    id: 'proposal', 
    title: 'Propuesta', 
    color: 'bg-[#25D366]', 
    bgColor: 'bg-background',
    type: 'deal',
    dealStage: 'proposal',
  },
  { 
    id: 'negotiation', 
    title: 'Negociación', 
    color: 'bg-[hsl(var(--ip-success-text))]', 
    bgColor: 'bg-background',
    type: 'deal',
    dealStage: 'negotiation',
  },
  { 
    id: 'won', 
    title: '✅ Ganado', 
    color: 'bg-[hsl(var(--ip-success-text))]', 
    bgColor: 'bg-[hsl(var(--ip-success-bg))]',
    type: 'deal',
    dealStage: 'won',
    isWon: true,
  },
  { 
    id: 'lost', 
    title: '❌ Perdido', 
    color: 'bg-destructive', 
    bgColor: 'bg-destructive/5',
    type: 'deal',
    dealStage: 'lost',
    isLost: true,
  },
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
  const { data: deals = [], isLoading: isLoadingDeals, refetch: refetchDeals } = useDeals();

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

  // ══════════════════════════════════════════════════════════════════════════════
  // MAPEO DE ITEMS POR COLUMNA
  // ══════════════════════════════════════════════════════════════════════════════

  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, { type: 'lead' | 'deal'; data: Lead | Deal; value: number | null }[]> = {};
    
    UNIFIED_COLUMNS.forEach(col => {
      grouped[col.id] = [];
    });

    // Leads activos (no convertidos)
    leads.forEach(lead => {
      if (lead.status === 'converted') return;
      
      if (lead.status === 'new') {
        grouped['new'].push({ 
          type: 'lead', 
          data: lead, 
          value: lead.estimated_value 
        });
      } else if (lead.status === 'contacted' || lead.status === 'standby') {
        // Leads contactados van a "Recontactar"
        grouped['recontact'].push({ 
          type: 'lead', 
          data: lead, 
          value: lead.estimated_value 
        });
      }
    });

    // Deals
    deals.forEach(deal => {
      const colId = deal.stage; // contacted, qualified, proposal, negotiation, won, lost
      if (grouped[colId]) {
        grouped[colId].push({ 
          type: 'deal', 
          data: deal, 
          value: deal.amount 
        });
      }
    });

    return grouped;
  }, [leads, deals]);

  // Active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    
    if (activeType === 'lead') {
      const lead = leads.find((l) => l.id === activeId);
      return lead ? { type: 'lead' as const, data: lead } : null;
    }
    
    const deal = deals.find((d) => d.id === activeId);
    return deal ? { type: 'deal' as const, data: deal } : null;
  }, [activeId, activeType, leads, deals]);

  // ══════════════════════════════════════════════════════════════════════════════
  // DRAG HANDLERS
  // ══════════════════════════════════════════════════════════════════════════════

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const activeData = active.data.current;
    const targetColId = over.id as string;
    const targetColumn = UNIFIED_COLUMNS.find(c => c.id === targetColId);

    if (!targetColumn) return;

    // ═══ LEAD siendo arrastrado ═══
    if (activeData?.type === 'lead') {
      const lead = activeData.lead as Lead;

      // Lead → columna de DEAL = APROBAR
      if (targetColumn.type === 'deal') {
        setDealTitle(`Oportunidad de ${lead.company_name || lead.contact_name}`);
        setDealValue(lead.estimated_value?.toString() || '');
        setApproveModal(lead);
        return;
      }

      // Lead → otra columna de Lead
      if (targetColumn.type === 'lead') {
        const newStatus: LeadStatus = targetColumn.id === 'new' ? 'new' : 'contacted';
        if (lead.status !== newStatus) {
          updateLeadStatus.mutate({ leadId: lead.id, status: newStatus });
        }
      }
    }

    // ═══ DEAL siendo arrastrado ═══
    if (activeData?.type === 'deal') {
      const deal = activeData.deal as Deal;

      // No puede mover deal a columnas de Lead
      if (targetColumn.type === 'lead') {
        toast.error('No puedes mover un Deal a columnas de Lead');
        return;
      }

      // Deal → GANADO
      if (targetColumn.id === 'won') {
        handleWin(deal);
        return;
      }

      // Deal → PERDIDO
      if (targetColumn.id === 'lost') {
        handleLose(deal);
        return;
      }

      // Deal → otra etapa
      if (targetColumn.dealStage && deal.stage !== targetColumn.dealStage) {
        updateDealStage.mutate({ dealId: deal.id, stage: targetColumn.dealStage });
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ACTION HANDLERS
  // ══════════════════════════════════════════════════════════════════════════════

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

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div>
          <h1 className="text-xl font-semibold">CRM Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona leads y oportunidades en un solo flujo
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
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Cargando...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
              {UNIFIED_COLUMNS.map((column) => {
                const items = itemsByColumn[column.id] || [];
                
                return (
                  <UnifiedKanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    bgColor={column.bgColor}
                    items={items.map(i => ({ id: i.data.id, value: i.value }))}
                    isWon={column.isWon}
                    isLost={column.isLost}
                  >
                    {items.map((item) => (
                      <UnifiedCard
                        key={item.data.id}
                        item={{ type: item.type, data: item.data }}
                        onCall={() => {
                          const phone = item.type === 'lead' 
                            ? (item.data as Lead).contact_phone 
                            : (item.data as Deal).client?.phone;
                          if (phone) toast.info(`Llamando a ${phone}`);
                        }}
                        onEmail={() => {
                          const email = item.type === 'lead' 
                            ? (item.data as Lead).contact_email 
                            : (item.data as Deal).client?.email;
                          if (email) toast.info(`Email a ${email}`);
                        }}
                        onWhatsApp={() => {
                          const phone = item.type === 'lead' 
                            ? (item.data as Lead).contact_phone 
                            : (item.data as Deal).client?.phone;
                          if (phone) toast.info(`WhatsApp a ${phone}`);
                        }}
                        onApprove={item.type === 'lead' ? () => handleApprove(item.data as Lead) : undefined}
                        onDelete={item.type === 'lead' ? () => handleDelete(item.data as Lead) : undefined}
                        onWin={item.type === 'deal' ? () => handleWin(item.data as Deal) : undefined}
                        onLose={item.type === 'deal' ? () => handleLose(item.data as Deal) : undefined}
                      />
                    ))}
                  </UnifiedKanbanColumn>
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeItem && (
                <UnifiedCard
                  item={activeItem}
                  isDragging
                />
              )}
            </DragOverlay>
          </DndContext>
        )}
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
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[hsl(var(--ip-success-text))]" />
              Marcar como Ganado
            </DialogTitle>
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
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Marcar como Perdido
            </DialogTitle>
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
