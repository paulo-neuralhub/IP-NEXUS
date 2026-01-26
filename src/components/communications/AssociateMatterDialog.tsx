/**
 * AssociateMatterDialog - Dialog para vincular comunicación a expediente
 * Se muestra después de enviar email/llamada/mensaje sin matter_id
 */

import { useState, useEffect } from 'react';
import { useMatters } from '@/hooks/use-matters';
import { useLinkCommunication } from '@/hooks/legal-ops/useCommunications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase, Check, Link } from 'lucide-react';
import { MatterStatusBadge, MatterTypeBadge } from '@/components/features/docket';
import { MatterType, MatterStatus } from '@/types/matters';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AssociateMatterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communicationId: string;
  communicationType?: 'email' | 'llamada' | 'mensaje' | 'comunicación';
  onSuccess?: (matterId: string) => void;
}

export function AssociateMatterDialog({
  open,
  onOpenChange,
  communicationId,
  communicationType = 'comunicación',
  onSuccess
}: AssociateMatterDialogProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);

  const { data: matters, isLoading } = useMatters({ search: searchQuery });
  const linkCommunication = useLinkCommunication();

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedMatterId(null);
    }
  }, [open]);

  const handleLink = async () => {
    if (!selectedMatterId) return;

    try {
      await linkCommunication.mutateAsync({
        id: communicationId,
        matter_id: selectedMatterId
      });

      toast({
        title: 'Vinculado correctamente',
        description: `La ${communicationType} ha sido vinculada al expediente.`
      });

      onSuccess?.(selectedMatterId);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error al vincular',
        description: 'No se pudo vincular la comunicación al expediente.',
        variant: 'destructive'
      });
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            ¿Vincular a un expediente?
          </DialogTitle>
          <DialogDescription>
            La {communicationType} se ha enviado. ¿Deseas vincularla a un expediente para 
            mantener un registro ordenado?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por referencia o título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Lista de expedientes */}
          <ScrollArea className="h-[300px] border rounded-lg">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Buscando expedientes...
              </div>
            ) : !matters?.length ? (
              <div className="p-4 text-center text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron expedientes</p>
                {searchQuery && (
                  <p className="text-sm mt-1">
                    Prueba con otros términos de búsqueda
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {matters.map((matter) => (
                  <button
                    key={matter.id}
                    type="button"
                    onClick={() => setSelectedMatterId(matter.id)}
                    className={cn(
                      "w-full p-3 text-left transition-colors hover:bg-muted/50",
                      selectedMatterId === matter.id && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {matter.reference}
                          </span>
                          {selectedMatterId === matter.id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className="font-medium truncate mt-0.5">
                          {matter.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <MatterTypeBadge type={matter.type as MatterType} />
                          <MatterStatusBadge status={matter.status as MatterStatus} />
                        </div>
                        {matter.owner_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente: {matter.owner_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Omitir
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedMatterId || linkCommunication.isPending}
          >
            {linkCommunication.isPending ? 'Vinculando...' : 'Vincular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssociateMatterDialog;
