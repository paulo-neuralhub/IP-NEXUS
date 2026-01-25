// ============================================================
// IP-NEXUS - DEADLINE TYPES TAB
// Tab for managing deadline types
// ============================================================

import { useState } from 'react';
import { Plus, Lock, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDeadlineTypesConfig,
  useDeleteDeadlineType,
  DEADLINE_CATEGORIES,
  type DeadlineTypeConfig,
} from '@/hooks/useDeadlineTypesConfig';
import { DeadlineTypeModal } from './DeadlineTypeModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function DeadlineTypesTab() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<DeadlineTypeConfig | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);

  const { data: types, isLoading } = useDeadlineTypesConfig();
  const deleteType = useDeleteDeadlineType();

  const handleEdit = (type: DeadlineTypeConfig) => {
    setSelectedType(type);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedType(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteType.mutate(id, {
      onSuccess: () => setDeleteTypeId(null),
    });
  };

  const getCategoryInfo = (category: string) => {
    return DEADLINE_CATEGORIES.find(c => c.value === category) || { label: category, color: '#6B7280' };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tipos de Plazo</h3>
          <p className="text-sm text-muted-foreground">
            Los tipos de plazo definen las categorías de vencimientos. Los tipos sistema no se pueden eliminar.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo
        </Button>
      </div>

      {/* Types Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Aplica a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(types || []).map((type) => {
                const category = getCategoryInfo(type.category);
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {type.is_system ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Pencil className="h-4 w-4 text-primary" />
                        )}
                        <code className="text-sm bg-muted px-1 rounded">{type.code}</code>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{type.name_es}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        {category.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {type.matter_types.slice(0, 2).map(mt => (
                          <Badge key={mt} variant="outline" className="text-xs">
                            {mt === 'trademark' ? 'Marcas' :
                             mt === 'patent' ? 'Patentes' :
                             mt === 'design' ? 'Diseños' : mt}
                          </Badge>
                        ))}
                        {type.matter_types.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{type.matter_types.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={type.is_system ? 'secondary' : 'outline'}>
                        {type.is_system ? 'Sistema' : 'Custom'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!type.is_system && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(type)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTypeId(type.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(types || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay tipos de plazo definidos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      <DeadlineTypeModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedType(null);
        }}
        type={selectedType}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTypeId}
        onOpenChange={() => setDeleteTypeId(null)}
        title="Eliminar tipo de plazo"
        description="¿Estás seguro de que quieres eliminar este tipo? Las reglas que lo usen podrían verse afectadas."
        confirmText="Eliminar"
        onConfirm={() => deleteTypeId && handleDelete(deleteTypeId)}
        variant="destructive"
      />
    </div>
  );
}
