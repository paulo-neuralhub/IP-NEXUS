// ════════════════════════════════════════════════════════════════════════════
// IP-NEXUS - Workflow Progress Component
// PROMPT 4E: Visualización y control de progreso de workflow
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Clock, Loader2, History, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAllWorkflowPhases,
  useChangePhase,
  useCanTransitionTo,
  useMatterPhaseHistory,
  PHASE_COLORS,
  PHASE_ICONS,
} from '@/hooks/useWorkflowPhasesNew';
import type { PhaseCode } from '@/types/workflow';
import { cn } from '@/lib/utils';

interface WorkflowProgressProps {
  matterId: string;
  currentPhase: PhaseCode;
  phaseEnteredAt?: string;
  applicablePhases?: string[];
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
}

export function WorkflowProgress({
  matterId,
  currentPhase,
  phaseEnteredAt,
  applicablePhases,
  readOnly = false,
  compact = false,
  className,
}: WorkflowProgressProps) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<PhaseCode | ''>('');
  const [changeReason, setChangeReason] = useState('');

  const { data: phases, isLoading } = useAllWorkflowPhases();
  const { data: history } = useMatterPhaseHistory(matterId);
  const changePhase = useChangePhase();
  const { forward, backward } = useCanTransitionTo(currentPhase);

  // Filtrar fases aplicables
  const displayPhases = phases?.filter(p => 
    !applicablePhases || applicablePhases.includes(p.code)
  ) ?? [];

  const currentPhaseData = phases?.find(p => p.code === currentPhase);
  const currentIndex = displayPhases.findIndex(p => p.code === currentPhase);

  const handleChangePhase = async () => {
    if (!selectedPhase) return;

    await changePhase.mutateAsync({
      matterId,
      newPhase: selectedPhase as PhaseCode,
      reason: changeReason || undefined,
    });

    setIsChangeDialogOpen(false);
    setSelectedPhase('');
    setChangeReason('');
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact view - just badges
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge 
          className={cn(
            PHASE_COLORS[currentPhase]?.bg,
            PHASE_COLORS[currentPhase]?.text,
            PHASE_COLORS[currentPhase]?.border,
            "border"
          )}
        >
          {PHASE_ICONS[currentPhase]} {currentPhase}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {currentPhaseData?.name_en}
        </span>
        {phaseEnteredAt && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(phaseEnteredAt))}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {PHASE_ICONS[currentPhase]}
            Workflow Progress
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* History Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Phase History</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px] pr-4">
                  {history?.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      No phase changes recorded
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history?.map((entry) => (
                        <div key={entry.id} className="flex gap-3 border-b pb-3 last:border-0">
                          <div className="flex items-center gap-2 shrink-0">
                            {entry.from_phase && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {entry.from_phase}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              </>
                            )}
                            <Badge 
                              className={cn(
                                PHASE_COLORS[entry.to_phase as PhaseCode]?.bg,
                                PHASE_COLORS[entry.to_phase as PhaseCode]?.text,
                                "text-xs"
                              )}
                            >
                              {entry.to_phase}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.changed_at), { addSuffix: true })}
                              {entry.user && ` by ${entry.user.full_name}`}
                            </p>
                            {entry.reason && (
                              <p className="text-sm mt-1">{entry.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>

            {/* Change Phase Dialog */}
            {!readOnly && (forward.length > 0 || backward.length > 0) && (
              <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    Change Phase
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Workflow Phase</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Current Phase</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <span className="text-xl">{PHASE_ICONS[currentPhase]}</span>
                        <Badge className={cn(
                          PHASE_COLORS[currentPhase]?.bg,
                          PHASE_COLORS[currentPhase]?.text
                        )}>
                          {currentPhase}
                        </Badge>
                        <span className="text-sm">{currentPhaseData?.name_en}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Move to Phase</Label>
                      <Select 
                        value={selectedPhase} 
                        onValueChange={(v) => setSelectedPhase(v as PhaseCode)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target phase" />
                        </SelectTrigger>
                        <SelectContent>
                          {forward.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Move Forward</SelectLabel>
                              {forward.map((code) => {
                                const phase = phases?.find(p => p.code === code);
                                return (
                                  <SelectItem key={code} value={code}>
                                    <span className="flex items-center gap-2">
                                      <ChevronRight className="h-3 w-3 text-green-500" />
                                      {PHASE_ICONS[code as PhaseCode]}
                                      {code} - {phase?.name_en}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          )}
                          {backward.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Move Back</SelectLabel>
                              {backward.map((code) => {
                                const phase = phases?.find(p => p.code === code);
                                return (
                                  <SelectItem key={code} value={code}>
                                    <span className="flex items-center gap-2">
                                      <ChevronLeft className="h-3 w-3 text-orange-500" />
                                      {PHASE_ICONS[code as PhaseCode]}
                                      {code} - {phase?.name_en}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason (optional)</Label>
                      <Textarea
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        placeholder="Why is this phase change being made?"
                        rows={2}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsChangeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePhase}
                      disabled={!selectedPhase || changePhase.isPending}
                    >
                      {changePhase.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Change Phase
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress bar visualization */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              {displayPhases.map((phase, index) => {
                const isActive = phase.code === currentPhase;
                const isPast = index < currentIndex;
                const isFuture = index > currentIndex;
                const colors = PHASE_COLORS[phase.code as PhaseCode];

                return (
                  <React.Fragment key={phase.code}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex flex-col items-center cursor-default",
                            "transition-all duration-200"
                          )}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                              "border-2 transition-all",
                              isActive && cn(colors?.bg, colors?.border, "ring-2 ring-offset-2 ring-primary"),
                              isPast && "bg-green-100 border-green-300",
                              isFuture && "bg-gray-100 border-gray-200 opacity-50"
                            )}
                          >
                            {isPast ? '✓' : PHASE_ICONS[phase.code as PhaseCode]}
                          </div>
                          <span
                            className={cn(
                              "text-xs mt-1 font-medium",
                              isActive && colors?.text,
                              isPast && "text-green-600",
                              isFuture && "text-gray-400"
                            )}
                          >
                            {phase.code}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{phase.name_en}</p>
                        <p className="text-xs text-muted-foreground">{phase.description_en}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Connector line */}
                    {index < displayPhases.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-1",
                          index < currentIndex ? "bg-green-300" : "bg-gray-200"
                        )}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </TooltipProvider>
          </div>
        </div>

        {/* Current phase info */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Current: {currentPhaseData?.name_en}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentPhaseData?.description_en}
              </p>
            </div>
            {phaseEnteredAt && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  In this phase for {formatDistanceToNow(new Date(phaseEnteredAt))}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkflowProgress;
