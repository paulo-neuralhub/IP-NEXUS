// =============================================
// WORKFLOW APPROVALS PAGE
// Full page view for managing workflow approvals
// =============================================

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, History, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  usePendingApprovals, 
  useWorkflowApprovalHistory,
  useApproveWorkflow,
  useRejectWorkflow
} from '@/hooks/workflow/useWorkflowApprovals';
import { WorkflowApprovalCard } from '@/components/workflows/WorkflowApprovalCard';

export default function WorkflowApprovalsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  
  const { data: pendingApprovals = [], isLoading: isLoadingPending } = usePendingApprovals();
  const { data: historyApprovals = [], isLoading: isLoadingHistory } = useWorkflowApprovalHistory({ limit: 50 });
  const approveWorkflow = useApproveWorkflow();
  const rejectWorkflow = useRejectWorkflow();

  const handleApprove = (id: string) => {
    approveWorkflow.mutate(id);
  };

  const handleReject = (id: string, reason?: string) => {
    rejectWorkflow.mutate({ queueId: id, reason });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Aprobaciones de Workflows</h1>
          <p className="text-muted-foreground">
            Gestiona los workflows que requieren tu aprobación antes de ejecutarse
          </p>
        </div>
        {pendingApprovals.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingApprovals.length} pendiente{pendingApprovals.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">
              Requieren tu aprobación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyApprovals.filter(a => a.approval_status === 'approved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En el historial
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyApprovals.filter(a => a.approval_status === 'rejected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En el historial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes
            {pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="mt-6">
          {isLoadingPending ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold">Todo al día</h3>
                <p className="text-muted-foreground mt-1">
                  No tienes workflows pendientes de aprobación
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingApprovals.map((approval) => (
                <WorkflowApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isApproving={approveWorkflow.isPending}
                  isRejecting={rejectWorkflow.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-6">
          {isLoadingHistory ? (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : historyApprovals.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Sin historial</h3>
                <p className="text-muted-foreground mt-1">
                  Aún no has procesado ninguna solicitud de aprobación
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="divide-y">
                {historyApprovals.map((approval) => (
                  <div 
                    key={approval.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {approval.workflow?.name || 'Workflow'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {approval.matter ? (
                            `${approval.matter.reference} - ${approval.matter.title}`
                          ) : (
                            `Trigger: ${approval.trigger_type}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        {approval.approved_at && (
                          <p className="text-muted-foreground">
                            {format(new Date(approval.approved_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </p>
                        )}
                        {approval.rejection_reason && (
                          <p className="text-xs text-destructive truncate max-w-[200px]">
                            {approval.rejection_reason}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(approval.approval_status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
