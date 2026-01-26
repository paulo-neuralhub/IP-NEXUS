// =============================================
// WORKFLOW APPROVAL BADGE
// Shows pending approvals count in header/sidebar
// =============================================

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  usePendingApprovalsCount, 
  usePendingApprovals,
  useApproveWorkflow,
  useRejectWorkflow
} from '@/hooks/workflow/useWorkflowApprovals';
import { WorkflowApprovalCard } from './WorkflowApprovalCard';
import { cn } from '@/lib/utils';

interface WorkflowApprovalBadgeProps {
  className?: string;
  showPopover?: boolean;
}

export function WorkflowApprovalBadge({ 
  className,
  showPopover = true 
}: WorkflowApprovalBadgeProps) {
  const navigate = useNavigate();
  const { data: count = 0, isLoading: isLoadingCount } = usePendingApprovalsCount();
  const { data: approvals = [], isLoading: isLoadingApprovals } = usePendingApprovals();
  const approveWorkflow = useApproveWorkflow();
  const rejectWorkflow = useRejectWorkflow();

  if (isLoadingCount) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (count === 0) {
    return null;
  }

  const handleApprove = (id: string) => {
    approveWorkflow.mutate(id);
  };

  const handleReject = (id: string, reason?: string) => {
    rejectWorkflow.mutate({ queueId: id, reason });
  };

  const content = (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", className)}
        onClick={() => !showPopover && navigate('/app/workflow/approvals')}
      >
        <Bell className="h-5 w-5" />
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      </Button>
    </div>
  );

  if (!showPopover) {
    return content;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {content}
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Workflows pendientes</h4>
            <Badge variant="secondary">{count}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Estos workflows requieren tu aprobación
          </p>
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {isLoadingApprovals ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay workflows pendientes
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {approvals.slice(0, 3).map((approval) => (
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
        </ScrollArea>

        {approvals.length > 3 && (
          <div className="p-3 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/app/workflow/approvals')}
            >
              Ver todos ({count})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
