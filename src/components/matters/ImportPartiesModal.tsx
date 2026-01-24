// ============================================
// src/components/matters/ImportPartiesModal.tsx
// Import parties from client relationships
// ============================================

import { useState, useEffect } from 'react';
import { Loader2, Check, Link2, User, Building } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientRelationshipsV2 } from '@/hooks/legal-ops/useClientRelationshipsV2';
import { useImportPartiesFromClient, useMatterParties } from '@/hooks/legal-ops/useMatterParties';
import { useToast } from '@/hooks/use-toast';

// Mapping from relationship type to party role
const RELATIONSHIP_TO_PARTY: Record<string, { role: string; label: string }> = {
  legal_representative: { role: 'legal_representative', label: 'Representante Legal' },
  power_of_attorney: { role: 'representative', label: 'Representante' },
  ip_agent: { role: 'ip_agent', label: 'Agente PI' },
  ip_correspondent: { role: 'correspondent', label: 'Corresponsal' },
  inventor: { role: 'inventor', label: 'Inventor' },
  designer: { role: 'designer', label: 'Diseñador' },
  applicant: { role: 'applicant', label: 'Solicitante' },
  owner: { role: 'owner', label: 'Titular' },
  licensee: { role: 'licensee', label: 'Licenciatario' },
};

interface ImportPartiesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  clientId: string;
}

export function ImportPartiesModal({
  open,
  onOpenChange,
  matterId,
  clientId,
}: ImportPartiesModalProps) {
  const { toast } = useToast();
  const { data: relationships, isLoading } = useClientRelationshipsV2(clientId);
  const { data: existingParties } = useMatterParties(matterId);
  const importParties = useImportPartiesFromClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Get all importable relationships (legal and ip categories)
  const importableRelationships = [
    ...(relationships?.legal || []),
    ...(relationships?.ip || []),
  ].filter(rel => {
    // Only include relationships that have a mapping
    return RELATIONSHIP_TO_PARTY[rel.relationship_type];
  });

  // Get already imported relationship IDs
  const alreadyImportedIds = new Set(
    Object.values(existingParties || {})
      .flat()
      .filter(p => p.source_relationship_id)
      .map(p => p.source_relationship_id!)
  );

  // Filter out already imported
  const availableRelationships = importableRelationships.filter(
    rel => !alreadyImportedIds.has(rel.id)
  );

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      // Pre-select primary relationships
      const primaryIds = new Set(
        availableRelationships
          .filter(rel => rel.is_primary)
          .map(rel => rel.id)
      );
      setSelectedIds(primaryIds);
    }
  }, [open]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;

    try {
      await importParties.mutateAsync({
        matterId,
        clientId,
        relationshipIds: Array.from(selectedIds),
      });

      toast({ title: `${selectedIds.size} partes importadas correctamente` });
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al importar partes', variant: 'destructive' });
    }
  };

  const getRelationshipName = (rel: typeof availableRelationships[0]) => {
    if (rel.related_client?.name) return rel.related_client.name;
    if (rel.external_name) return rel.external_name;
    return 'Sin nombre';
  };

  const getRelationshipCompany = (rel: typeof availableRelationships[0]) => {
    if (rel.related_client?.company_name) return rel.related_client.company_name;
    if (rel.external_company) return rel.external_company;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Relaciones del Cliente</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : availableRelationships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay relaciones disponibles para importar</p>
              <p className="text-sm mt-1">
                {alreadyImportedIds.size > 0
                  ? 'Todas las relaciones ya han sido importadas'
                  : 'El cliente no tiene relaciones de tipo legal o PI'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona las relaciones a importar como partes del expediente:
              </p>
              
              {availableRelationships.map(rel => {
                const mapping = RELATIONSHIP_TO_PARTY[rel.relationship_type];
                const isSelected = selectedIds.has(rel.id);
                const name = getRelationshipName(rel);
                const company = getRelationshipCompany(rel);

                return (
                  <div
                    key={rel.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleSelection(rel.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(rel.id)}
                    />
                    
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {rel.related_entity_type === 'external' ? (
                        <User className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Building className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{name}</span>
                        {rel.is_primary && (
                          <Badge variant="secondary" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rel.relationship_type_info?.name_es || rel.relationship_type}
                        {' → '}
                        <span className="text-primary">{mapping?.label || 'Parte'}</span>
                      </div>
                      {company && (
                        <div className="text-xs text-muted-foreground truncate">
                          {company}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport}
            disabled={selectedIds.size === 0 || importParties.isPending}
          >
            {importParties.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Importar {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
