// =====================================================
// IP-NEXUS - CLIENT HOLDERS PANEL (PROMPT 26)
// Panel to show/manage holders associated with a client (agent)
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ExternalLink,
  MapPin,
  Briefcase,
  MoreVertical
} from 'lucide-react';
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
import { useClientHolders, useDeleteClientHolder } from '@/hooks/useHolders';
import { AddClientHolderDialog } from './AddClientHolderDialog';
import { RELATIONSHIP_TYPE_LABELS } from '@/types/holders';
import type { ClientHolder } from '@/types/holders';

interface Props {
  accountId: string;
  accountName: string;
  readOnly?: boolean;
}

export function ClientHoldersPanel({ accountId, accountName, readOnly = false }: Props) {
  const { data: clientHolders = [], isLoading } = useClientHolders(accountId);
  const deleteClientHolder = useDeleteClientHolder();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ClientHolder | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    await deleteClientHolder.mutateAsync({
      id: deleteConfirm.id,
      accountId: deleteConfirm.account_id,
      holderId: deleteConfirm.holder_id,
    });
    setDeleteConfirm(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Titulares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            Cargando...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Titulares
            <Badge variant="secondary" className="ml-2">
              {clientHolders.length}
            </Badge>
          </CardTitle>
          {!readOnly && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {clientHolders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay titulares asociados</p>
              {!readOnly && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setAddDialogOpen(true)}
                >
                  Añadir primer titular
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clientHolders.map((ch) => (
                <div 
                  key={ch.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {ch.holder?.legal_name || 'Titular'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {RELATIONSHIP_TYPE_LABELS[ch.relationship_type]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {ch.holder?.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ch.holder.country}
                        </span>
                      )}
                      {ch.holder?.tax_id && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {ch.holder.tax_id}
                        </span>
                      )}
                      {ch.jurisdictions && ch.jurisdictions.length > 0 && (
                        <span>
                          Jurisdicciones: {ch.jurisdictions.join(', ')}
                        </span>
                      )}
                    </div>

                    {ch.client_reference && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {ch.client_reference}
                      </div>
                    )}
                  </div>

                  {!readOnly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => window.open(`/app/holders/${ch.holder_id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver titular
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteConfirm(ch)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar relación
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddClientHolderDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        accountId={accountId}
        accountName={accountName}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar relación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto eliminará la relación entre el cliente y el titular "{deleteConfirm?.holder?.legal_name}".
              El titular no será eliminado, solo la asociación.
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
    </>
  );
}
