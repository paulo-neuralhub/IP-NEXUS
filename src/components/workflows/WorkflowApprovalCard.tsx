// =============================================
// WORKFLOW APPROVAL CARD
// Card component for pending workflow approvals
// =============================================

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  FileText, 
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { WorkflowApprovalItem } from '@/hooks/workflow/useWorkflowApprovals';

interface WorkflowApprovalCardProps {
  approval: WorkflowApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function WorkflowApprovalCard({
  approval,
  onApprove,
  onReject,
  isApproving,
  isRejecting
}: WorkflowApprovalCardProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const triggerData = approval.trigger_data || {};

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20 text-warning">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">
                {approval.workflow?.name || 'Workflow'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Solicitado {approval.approval_requested_at && formatDistanceToNow(
                  new Date(approval.approval_requested_at),
                  { addSuffix: true, locale: es }
                )}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Approval message */}
        {approval.workflow?.approval_message && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mb-3">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-sm">{approval.workflow.approval_message}</p>
          </div>
        )}

        {/* Context info */}
        <div className="space-y-2">
          {approval.matter && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Expediente:</span>
              <span className="font-medium">
                {approval.matter.reference} - {approval.matter.title}
              </span>
            </div>
          )}
          {approval.contact && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Contacto:</span>
              <span className="font-medium">{approval.contact.name}</span>
            </div>
          )}
        </div>

        {/* Trigger data details */}
        {Object.keys(triggerData).length > 0 && (
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs text-muted-foreground">Ver detalles del trigger</span>
                {isDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto max-h-40">
                {JSON.stringify(triggerData, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-3 border-t">
        <Button
          onClick={() => onApprove(approval.id)}
          disabled={isApproving || isRejecting}
          className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isApproving ? 'Aprobando...' : 'Aprobar'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isApproving || isRejecting}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rechazar workflow</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres rechazar este workflow? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Motivo del rechazo (opcional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onReject(approval.id, rejectReason)}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRejecting ? 'Rechazando...' : 'Confirmar rechazo'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
