// ============================================
// src/components/legal-ops/ClientRelationshipsV2.tsx
// Enhanced client relationships with categories
// ============================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Building2, User, Link2, Star, Trash2, MoreHorizontal, 
  ExternalLink, Scale, Briefcase, ShieldCheck, CreditCard,
  Mail, Phone, Edit2, CheckCircle2
} from 'lucide-react';
import {
  useClientRelationshipsV2,
  useDeleteClientRelationshipV2,
  useSetPrimaryRelationship,
  ClientRelationshipV2,
  GroupedRelationshipsV2,
} from '@/hooks/legal-ops/useClientRelationshipsV2';
import { getCategoryLabel } from '@/hooks/legal-ops/useRelationshipTypes';
import { AddRelationshipModalV2 } from './AddRelationshipModalV2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientRelationshipsV2Props {
  clientId: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  legal: <Scale className="w-4 h-4" />,
  commercial: <Briefcase className="w-4 h-4" />,
  ip: <ShieldCheck className="w-4 h-4" />,
  contact: <Mail className="w-4 h-4" />,
};

export function ClientRelationshipsV2({ clientId }: ClientRelationshipsV2Props) {
  const { data, isLoading } = useClientRelationshipsV2(clientId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const deleteMutation = useDeleteClientRelationshipV2();
  const setPrimaryMutation = useSetPrimaryRelationship();
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

  const handleSetPrimary = async (relationshipId: string) => {
    try {
      await setPrimaryMutation.mutateAsync({ relationshipId, clientId });
      toast.success('Relación marcada como principal');
    } catch {
      toast.error('Error al actualizar la relación');
    }
  };

  const navigateToClient = (id: string) => {
    navigate(`/app/legal-ops/client-360/${id}`);
  };

  if (isLoading) {
    return <RelationshipsSkeleton />;
  }

  const hasRelationships = data && (
    data.legal.length > 0 ||
    data.commercial.length > 0 ||
    data.ip.length > 0 ||
    data.contact.length > 0
  );

  const categories: Array<{ key: keyof GroupedRelationshipsV2; label: string }> = [
    { key: 'legal', label: getCategoryLabel('legal') },
    { key: 'ip', label: getCategoryLabel('ip') },
    { key: 'commercial', label: getCategoryLabel('commercial') },
    { key: 'contact', label: getCategoryLabel('contact') },
  ];

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
            <EmptyState onAdd={() => setIsAddModalOpen(true)} />
          ) : (
            <div className="space-y-4">
              {categories.map(({ key, label }) => {
                const relationships = data?.[key] || [];
                if (relationships.length === 0) return null;

                return (
                  <RelationshipGroup
                    key={key}
                    title={label}
                    icon={CATEGORY_ICONS[key]}
                    relationships={relationships}
                    onNavigate={navigateToClient}
                    onDelete={setDeleteTarget}
                    onSetPrimary={handleSetPrimary}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddRelationshipModalV2
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        clientId={clientId}
      />

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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p className="text-sm">Sin relaciones registradas</p>
      <Button variant="link" size="sm" onClick={onAdd}>
        Añadir primera relación
      </Button>
    </div>
  );
}

interface RelationshipGroupProps {
  title: string;
  icon: React.ReactNode;
  relationships: ClientRelationshipV2[];
  onNavigate: (id: string) => void;
  onDelete: (target: { id: string; name: string }) => void;
  onSetPrimary: (id: string) => void;
}

function RelationshipGroup({
  title,
  icon,
  relationships,
  onNavigate,
  onDelete,
  onSetPrimary,
}: RelationshipGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {icon}
        {title}
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {relationships.length}
        </Badge>
      </div>
      <div className="space-y-1 ml-6 border-l-2 border-muted pl-3">
        {relationships.map((rel) => (
          <RelationshipItem
            key={rel.id}
            relationship={rel}
            onNavigate={onNavigate}
            onDelete={onDelete}
            onSetPrimary={onSetPrimary}
          />
        ))}
      </div>
    </div>
  );
}

interface RelationshipItemProps {
  relationship: ClientRelationshipV2;
  onNavigate: (id: string) => void;
  onDelete: (target: { id: string; name: string }) => void;
  onSetPrimary: (id: string) => void;
}

function RelationshipItem({ relationship, onNavigate, onDelete, onSetPrimary }: RelationshipItemProps) {
  const isExternal = relationship.related_entity_type === 'external';
  const displayName = isExternal 
    ? relationship.external_name 
    : (relationship.related_client?.name || relationship.related_client?.company_name || 'Sin nombre');
  
  const typeLabel = relationship.relationship_type_info?.name_es || relationship.relationship_type;
  const isCompany = !isExternal && relationship.related_client?.client_type === 'company';
  
  // Check validity
  const now = new Date();
  const validFrom = relationship.valid_from ? new Date(relationship.valid_from) : null;
  const validUntil = relationship.valid_until ? new Date(relationship.valid_until) : null;
  const isExpired = validUntil && validUntil < now;
  const isNotYetValid = validFrom && validFrom > now;

  return (
    <div className={`flex items-center justify-between py-2 group hover:bg-muted/50 rounded px-2 -ml-2 ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {isExternal ? (
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : isCompany ? (
          <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{displayName}</span>
            {relationship.is_primary && (
              <Star className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
            )}
            {isExternal && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                Externo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{typeLabel}</span>
            {relationship.role_description && (
              <>
                <span>•</span>
                <span className="truncate">{relationship.role_description}</span>
              </>
            )}
            {isExpired && (
              <>
                <span>•</span>
                <span className="text-destructive">Expirado</span>
              </>
            )}
            {isNotYetValid && (
              <>
                <span>•</span>
                <span className="text-muted-foreground">Desde {format(validFrom, 'dd/MM/yyyy', { locale: es })}</span>
              </>
            )}
          </div>
        </div>

        {/* Contact info for external */}
        {isExternal && (relationship.external_email || relationship.external_phone) && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            {relationship.external_email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {relationship.external_email}
              </span>
            )}
            {relationship.external_phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {relationship.external_phone}
              </span>
            )}
          </div>
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
          {!isExternal && relationship.related_client_id && (
            <DropdownMenuItem onClick={() => onNavigate(relationship.related_client_id!)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver ficha
            </DropdownMenuItem>
          )}
          {!relationship.is_primary && (
            <DropdownMenuItem onClick={() => onSetPrimary(relationship.id)}>
              <Star className="w-4 h-4 mr-2" />
              Marcar como principal
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete({ id: relationship.id, name: displayName || 'Sin nombre' })}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

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
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
