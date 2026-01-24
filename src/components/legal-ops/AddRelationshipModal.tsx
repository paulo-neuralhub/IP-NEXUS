// ============================================
// src/components/legal-ops/AddRelationshipModal.tsx
// ============================================

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Building2, User, Search, Plus, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  useSearchClients,
  useCreateClientRelationship,
  RELATIONSHIP_TYPES,
  RelationshipType,
} from '@/hooks/legal-ops/useClientRelationships';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddRelationshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export function AddRelationshipModal({ open, onOpenChange, clientId }: AddRelationshipModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    company_name: string | null;
    client_type: string | null;
  } | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType | ''>('');
  const [relationshipLabel, setRelationshipLabel] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchClients(searchQuery, clientId);
  const createMutation = useCreateClientRelationship();

  const resetForm = () => {
    setSearchQuery('');
    setSelectedClient(null);
    setRelationshipType('');
    setRelationshipLabel('');
    setIsPrimary(false);
    setValidFrom('');
    setValidUntil('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!selectedClient || !relationshipType) {
      toast.error('Selecciona un cliente y tipo de relación');
      return;
    }

    try {
      await createMutation.mutateAsync({
        client_id: clientId,
        related_client_id: selectedClient.id,
        relationship_type: relationshipType,
        relationship_label: relationshipLabel || undefined,
        is_primary: isPrimary,
        valid_from: validFrom || undefined,
        valid_until: validUntil || undefined,
        notes: notes || undefined,
      });
      toast.success('Relación creada correctamente');
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage.includes('unique_client_relationship')) {
        toast.error('Ya existe esta relación con el cliente seleccionado');
      } else {
        toast.error('Error al crear la relación');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir relación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selector de cliente */}
          <div className="space-y-2">
            <Label>Cliente relacionado *</Label>
            <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isComboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedClient ? (
                    <div className="flex items-center gap-2">
                      {selectedClient.client_type === 'company' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      {selectedClient.name || selectedClient.company_name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Buscar cliente...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar por nombre, empresa o email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isSearching && (
                      <div className="p-4 text-center">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      </div>
                    )}
                    {!isSearching && searchQuery.length >= 2 && searchResults?.length === 0 && (
                      <CommandEmpty>
                        <div className="py-4 text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            No se encontraron resultados
                          </p>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Crear nuevo cliente
                          </Button>
                        </div>
                      </CommandEmpty>
                    )}
                    {searchQuery.length < 2 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Escribe al menos 2 caracteres para buscar
                      </div>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <CommandGroup>
                        {searchResults.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={() => {
                              setSelectedClient(client as typeof selectedClient);
                              setIsComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient?.id === client.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {client.client_type === 'company' ? (
                                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {client.name || client.company_name}
                                </p>
                                {client.email && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {client.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo de relación */}
          <div className="space-y-2">
            <Label>Tipo de relación *</Label>
            <Select value={relationshipType} onValueChange={(v) => setRelationshipType(v as RelationshipType)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RELATIONSHIP_TYPES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Etiqueta personalizada */}
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input
              placeholder="Ej: Director Legal, Agente en OEPM..."
              value={relationshipLabel}
              onChange={(e) => setRelationshipLabel(e.target.value)}
            />
          </div>

          {/* Fechas de validez */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Válido desde</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Válido hasta</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Es relación principal */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked === true)}
            />
            <Label htmlFor="is_primary" className="text-sm font-normal">
              Es la relación principal de este tipo
            </Label>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              placeholder="Notas adicionales sobre esta relación..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedClient || !relationshipType || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar relación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
