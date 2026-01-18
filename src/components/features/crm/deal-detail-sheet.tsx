import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityTimeline, AddActivityModal, DealFormModal } from '@/components/features/crm';
import { useActivities, useUpdateDeal, useDeleteDeal } from '@/hooks/use-crm';
import { DEAL_PRIORITIES, DEAL_STATUSES } from '@/lib/constants/crm';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Mail, FileText, CheckCircle, XCircle,
  User, Calendar, DollarSign, Building2, Briefcase, Tag
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Deal, DealPriority, DealStatus, ActivityType } from '@/types/crm';

interface Props {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DealDetailSheet({ deal, open, onClose, onUpdate }: Props) {
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [defaultActivityType, setDefaultActivityType] = useState<ActivityType>('note');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWonDialog, setShowWonDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [closeReason, setCloseReason] = useState('');

  const { data: activities = [], isLoading: loadingActivities } = useActivities({ 
    dealId: deal?.id 
  });
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();

  if (!deal) return null;

  const priorityConfig = DEAL_PRIORITIES[deal.priority as DealPriority];
  const statusConfig = DEAL_STATUSES[deal.status as DealStatus];

  const handleMarkWon = async () => {
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        data: {
          status: 'won',
          won_reason: closeReason || null,
          closed_at: new Date().toISOString(),
        },
      });
      toast.success('Deal marcado como ganado');
      setShowWonDialog(false);
      setCloseReason('');
      onUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar el deal');
    }
  };

  const handleMarkLost = async () => {
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        data: {
          status: 'lost',
          lost_reason: closeReason || null,
          closed_at: new Date().toISOString(),
        },
      });
      toast.success('Deal marcado como perdido');
      setShowLostDialog(false);
      setCloseReason('');
      onUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar el deal');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDeal.mutateAsync(deal.id);
      toast.success('Deal eliminado');
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      toast.error('Error al eliminar el deal');
    }
  };

  const openActivityModal = (type: ActivityType) => {
    setDefaultActivityType(type);
    setShowActivityModal(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-xl">{deal.title}</SheetTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {deal.value && (
                    <span className="font-semibold text-foreground">
                      {formatCurrency(deal.value, deal.currency)}
                    </span>
                  )}
                  <span>·</span>
                  <Badge 
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${statusConfig?.color}20`,
                      color: statusConfig?.color 
                    }}
                  >
                    {statusConfig?.label}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setShowEditForm(true)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Actions */}
          {deal.status === 'open' && (
            <div className="flex gap-2 mb-6">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600 hover:bg-green-50"
                onClick={() => setShowWonDialog(true)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Ganado
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowLostDialog(true)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Perdido
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openActivityModal('email')}
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openActivityModal('note')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Nota
              </Button>
            </div>
          )}

          <Separator className="my-4" />

          {/* Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Información</h4>
            <Card>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Etapa</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: deal.stage?.color }} 
                    />
                    <span>{deal.stage?.name}</span>
                  </div>
                </div>
                {deal.expected_close_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cierre esperado</span>
                    <span>{formatDate(deal.expected_close_date)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridad</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: priorityConfig?.color }} 
                    />
                    <span>{priorityConfig?.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            {deal.contact && (
              <>
                <h4 className="font-semibold text-sm">Contacto</h4>
                <Card 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/app/crm/contacts/${deal.contact?.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{deal.contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {deal.contact.company_name} {deal.contact.job_title && `· ${deal.contact.job_title}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Description */}
            {deal.description && (
              <>
                <h4 className="font-semibold text-sm">Descripción</h4>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {deal.description}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Timeline */}
            <h4 className="font-semibold text-sm">Actividad</h4>
            <Card>
              <CardContent className="p-4">
                <ActivityTimeline 
                  activities={activities.slice(0, 5)} 
                  isLoading={loadingActivities}
                  onAddActivity={() => setShowActivityModal(true)}
                />
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <DealFormModal
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        deal={deal}
      />

      <AddActivityModal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        dealId={deal.id}
        contactId={deal.contact_id || undefined}
        defaultType={defaultActivityType}
      />

      {/* Mark Won Dialog */}
      <AlertDialog open={showWonDialog} onOpenChange={setShowWonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como ganado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Por qué se ganó este deal? (opcional)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo del éxito..."
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCloseReason('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkWon}
              className="bg-green-600 hover:bg-green-700"
            >
              Marcar ganado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Lost Dialog */}
      <AlertDialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como perdido</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Por qué se perdió este deal? (opcional)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo de la pérdida..."
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCloseReason('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkLost}
              className="bg-destructive hover:bg-destructive/90"
            >
              Marcar perdido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar deal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el deal
              "{deal.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
