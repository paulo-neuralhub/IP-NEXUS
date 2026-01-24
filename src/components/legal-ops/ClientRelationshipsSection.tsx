// ============================================
// src/components/legal-ops/ClientRelationshipsSection.tsx
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Building2, User, Users, GitBranch, Shield, Link2,
  Star, CreditCard, Trash2, MoreHorizontal, ExternalLink
} from 'lucide-react';
import {
  useClientRelationships,
  useDeleteClientRelationship,
  ClientRelationship,
  RELATIONSHIP_TYPES,
  GroupedRelationships,
} from '@/hooks/legal-ops/useClientRelationships';
import { AddRelationshipModal } from './AddRelationshipModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ClientRelationshipsSectionProps {
  clientId: string;
}

export function ClientRelationshipsSection({ clientId }: ClientRelationshipsSectionProps) {
  const { data, isLoading } = useClientRelationships(clientId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const deleteMutation = useDeleteClientRelationship();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ relationshipId: deleteTarget.id, clientId });
      toast.success('Relación eliminada');
    } catch {
      toast.error('Error al eliminar la relación');
    }
    setDeleteTarget(null);
  };

  const navigateToClient = (id: string) => {
    navigate(`/app/legal-ops/client-360/${id}`);
  };

  if (isLoading) {
    return <RelationshipsSkeleton />;
  }

  const hasRelationships = data && (
    data.represents.length > 0 ||
    data.representedBy.length > 0 ||
    data.corporateGroup.length > 0 ||
    data.contacts.length > 0 ||
    data.licensing.length > 0 ||
    data.other.length > 0
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Relaciones
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasRelationships ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sin relaciones registradas</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                Añadir primera relación
              </Button>
            </div>
          ) : (
            <>
              {/* Representa a */}
              {data.represents.length > 0 && (
                <RelationshipGroup
                  title="Representa a"
                  icon={<Shield className="w-4 h-4" />}
                  relationships={data.represents}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                />
              )}

              {/* Representado por */}
              {data.representedBy.length > 0 && (
                <RelationshipGroup
                  title="Representado por"
                  icon={<User className="w-4 h-4" />}
                  relationships={data.representedBy}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                />
              )}

              {/* Grupo empresarial */}
              {data.corporateGroup.length > 0 && (
                <RelationshipGroup
                  title="Grupo empresarial"
                  icon={<GitBranch className="w-4 h-4" />}
                  relationships={data.corporateGroup}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                />
              )}

              {/* Contactos */}
              {data.contacts.length > 0 && (
                <RelationshipGroup
                  title="Contactos"
                  icon={<Users className="w-4 h-4" />}
                  relationships={data.contacts}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                  showContactBadges
                />
              )}

              {/* Licencias */}
              {data.licensing.length > 0 && (
                <RelationshipGroup
                  title="Licencias"
                  icon={<Building2 className="w-4 h-4" />}
                  relationships={data.licensing}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                />
              )}

              {/* Otros */}
              {data.other.length > 0 && (
                <RelationshipGroup
                  title="Otras relaciones"
                  icon={<Link2 className="w-4 h-4" />}
                  relationships={data.other}
                  onNavigate={navigateToClient}
                  onDelete={setDeleteTarget}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal añadir relación */}
      <AddRelationshipModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        clientId={clientId}
      />

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar relación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar la relación con {deleteTarget?.name}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Componente para un grupo de relaciones
interface RelationshipGroupProps {
  title: string;
  icon: React.ReactNode;
  relationships: ClientRelationship[];
  onNavigate: (id: string) => void;
  onDelete: (target: { id: string; name: string }) => void;
  showContactBadges?: boolean;
}

function RelationshipGroup({
  title,
  icon,
  relationships,
  onNavigate,
  onDelete,
  showContactBadges = false,
}: RelationshipGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {icon}
        {title}
      </div>
      <div className="space-y-1 ml-6 border-l-2 border-muted pl-3">
        {relationships.map((rel) => (
          <RelationshipItem
            key={rel.id}
            relationship={rel}
            onNavigate={onNavigate}
            onDelete={onDelete}
            showContactBadges={showContactBadges}
          />
        ))}
      </div>
    </div>
  );
}

// Componente para un item de relación individual
interface RelationshipItemProps {
  relationship: ClientRelationship;
  onNavigate: (id: string) => void;
  onDelete: (target: { id: string; name: string }) => void;
  showContactBadges?: boolean;
}

function RelationshipItem({ relationship, onNavigate, onDelete, showContactBadges }: RelationshipItemProps) {
  const relatedClient = relationship.related_client;
  const displayName = relatedClient?.name || relatedClient?.company_name || 'Sin nombre';
  const clientType = relatedClient?.client_type || 'company';
  const typeLabel = RELATIONSHIP_TYPES[relationship.relationship_type]?.label || relationship.relationship_type;

  return (
    <div className="flex items-center justify-between py-1.5 group hover:bg-muted/50 rounded px-2 -ml-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {clientType === 'company' ? (
          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm font-medium truncate">{displayName}</span>
        <span className="text-xs text-muted-foreground">({typeLabel})</span>

        {/* Badges para contactos */}
        {showContactBadges && (
          <div className="flex items-center gap-1">
            {relatedClient?.is_primary_contact && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                <Star className="w-2.5 h-2.5 mr-0.5 fill-amber-400 text-amber-400" />
                Principal
              </Badge>
            )}
            {relatedClient?.is_billing_contact && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                <CreditCard className="w-2.5 h-2.5 mr-0.5" />
                Facturación
              </Badge>
            )}
          </div>
        )}

        {/* Badge de relación principal */}
        {relationship.is_primary && !showContactBadges && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            Principal
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onNavigate(relationship.related_client_id)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver ficha
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete({ id: relationship.id, name: displayName })}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar relación
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Skeleton de carga
function RelationshipsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
