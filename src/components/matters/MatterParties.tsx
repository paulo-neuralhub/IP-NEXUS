// ============================================
// src/components/matters/MatterParties.tsx
// Display and manage matter parties
// ============================================

import { useState } from 'react';
import { 
  Crown, Users, Briefcase, Eye, Lightbulb, Palette, 
  PenTool, UserCheck, Globe, Scale, AlertTriangle, 
  FileText, Key, Link2, Trash2, Star, Plus, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  useMatterParties, 
  useDeleteMatterParty,
  type MatterParty,
  type GroupedParties 
} from '@/hooks/legal-ops/useMatterParties';
import { AddPartyModal } from './AddPartyModal';
import { ImportPartiesModal } from './ImportPartiesModal';
import { useToast } from '@/hooks/use-toast';

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  applicant: FileText,
  co_owner: Users,
  licensee: Key,
  inventor: Lightbulb,
  designer: Palette,
  author: PenTool,
  representative: UserCheck,
  ip_agent: Briefcase,
  correspondent: Globe,
  legal_representative: Scale,
  opponent: AlertTriangle,
  interested_party: Eye,
};

const CATEGORY_LABELS: Record<keyof GroupedParties, { es: string; en: string }> = {
  ownership: { es: 'Titularidad', en: 'Ownership' },
  creation: { es: 'Creación', en: 'Creation' },
  representation: { es: 'Representación', en: 'Representation' },
  other: { es: 'Otros', en: 'Other' },
};

interface MatterPartiesProps {
  matterId: string;
  matterType?: string;
  clientId?: string;
  readOnly?: boolean;
}

export function MatterParties({ 
  matterId, 
  matterType = 'trademark',
  clientId,
  readOnly = false 
}: MatterPartiesProps) {
  const { toast } = useToast();
  const { data: grouped, isLoading, error } = useMatterParties(matterId);
  const deleteParty = useDeleteMatterParty();
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<MatterParty | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteParty.mutateAsync({ 
        partyId: deleteConfirm.id, 
        matterId 
      });
      toast({ title: 'Parte eliminada' });
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return <MatterPartiesSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Error al cargar las partes
        </CardContent>
      </Card>
    );
  }

  const hasParties = grouped && Object.values(grouped).some(arr => arr.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Partes del Expediente</h3>
        {!readOnly && (
          <div className="flex gap-2">
            {clientId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setImportModalOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Importar del cliente
              </Button>
            )}
            <Button 
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir parte
            </Button>
          </div>
        )}
      </div>

      {!hasParties ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay partes registradas en este expediente
            </p>
            {!readOnly && (
              <div className="flex justify-center gap-2">
                {clientId && (
                  <Button 
                    variant="outline"
                    onClick={() => setImportModalOpen(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Importar del cliente
                  </Button>
                )}
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir parte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(['ownership', 'creation', 'representation', 'other'] as const).map(category => {
            const parties = grouped?.[category] || [];
            if (parties.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS[category].es}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {parties.map(party => (
                      <PartyRow 
                        key={party.id} 
                        party={party} 
                        onDelete={readOnly ? undefined : () => setDeleteConfirm(party)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Party Modal */}
      <AddPartyModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        matterId={matterId}
        matterType={matterType}
      />

      {/* Import Parties Modal */}
      {clientId && (
        <ImportPartiesModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          matterId={matterId}
          clientId={clientId}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar parte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la parte "{getPartyName(deleteConfirm)}" del expediente.
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
    </div>
  );
}

interface PartyRowProps {
  party: MatterParty;
  onDelete?: () => void;
}

function PartyRow({ party, onDelete }: PartyRowProps) {
  const Icon = ROLE_ICONS[party.party_role] || Users;
  const name = getPartyName(party);
  const roleLabel = party.role_info?.name_es || party.party_role;
  const isFromRelationship = party.source_type === 'relationship';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{name}</span>
          {party.is_primary && (
            <Star className="h-4 w-4 fill-primary text-primary shrink-0" />
          )}
          {isFromRelationship && (
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{roleLabel}</span>
          {party.percentage && (
            <Badge variant="secondary" className="text-xs">
              {party.percentage}%
            </Badge>
          )}
          {party.jurisdiction && (
            <Badge variant="outline" className="text-xs">
              {party.jurisdiction}
            </Badge>
          )}
        </div>
        {isFromRelationship && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Heredado del cliente
          </p>
        )}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function getPartyName(party: MatterParty | null): string {
  if (!party) return '';
  if (party.client?.name) return party.client.name;
  if (party.contact?.name) return party.contact.name;
  if (party.external_name) return party.external_name;
  return 'Sin nombre';
}

function MatterPartiesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Card>
        <CardHeader className="py-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
