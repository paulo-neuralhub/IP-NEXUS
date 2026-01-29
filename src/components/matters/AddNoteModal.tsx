/**
 * AddNoteModal - Modal para añadir nota rápida al expediente
 * La nota queda vinculada automáticamente al timeline del expediente
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { StickyNote, Loader2, Info, Lock, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
}

export function AddNoteModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
}: AddNoteModalProps) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(true);

  // Mutation para añadir nota
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');
      if (!content.trim()) throw new Error('El contenido es requerido');

      // Insertar en activities como tipo 'note'
      const { error } = await supabase
        .from('activities')
        .insert({
          organization_id: currentOrganization.id,
          matter_id: matterId,
          type: 'note',
          owner_type: 'tenant',
          subject: isInternal ? 'Nota interna' : 'Nota',
          content: content.trim(),
          direction: 'internal',
          created_by: user?.id,
          metadata: {
            is_internal: isInternal,
          },
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Nota añadida al expediente');
      queryClient.invalidateQueries({ queryKey: ['matter-timeline', matterId] });
      queryClient.invalidateQueries({ queryKey: ['activities', matterId] });
      queryClient.invalidateQueries({ queryKey: ['matter-activities', matterId] });
      resetAndClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al añadir nota');
    },
  });

  const resetAndClose = () => {
    setContent('');
    setIsInternal(true);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Escribe algo en la nota');
      return;
    }
    addNoteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-warning" />
            Añadir Nota
            {matterReference && (
              <Badge variant="outline" className="font-mono text-xs">
                {matterReference}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            La nota quedará vinculada al timeline del expediente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contenido */}
          <div className="space-y-2">
            <Label htmlFor="note-content">Contenido</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              rows={6}
              className="resize-none"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} caracteres
            </p>
          </div>

          {/* Visibilidad */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {isInternal ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isInternal ? 'Nota interna' : 'Nota visible'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isInternal 
                    ? 'Solo visible para tu equipo' 
                    : 'Visible en portal de cliente'}
                </p>
              </div>
            </div>
            <Switch
              checked={!isInternal}
              onCheckedChange={(checked) => setIsInternal(!checked)}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta nota se añadirá automáticamente al timeline del expediente
              {matterReference && ` ${matterReference}`}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={addNoteMutation.isPending || !content.trim()}
          >
            {addNoteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <StickyNote className="h-4 w-4 mr-2" />
                Añadir nota
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNoteModal;
