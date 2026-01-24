// ============================================
// src/components/legal-ops/AddRelationshipModalV2.tsx
// Enhanced modal with entity type selection
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, User, ExternalLink as ExternalIcon, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useSearchClients } from '@/hooks/legal-ops/useClientRelationships';
import { useCreateClientRelationshipV2, RelatedEntityType } from '@/hooks/legal-ops/useClientRelationshipsV2';
import { useRelationshipTypes, getCategoryLabel } from '@/hooks/legal-ops/useRelationshipTypes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddRelationshipModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

interface FormState {
  entityType: RelatedEntityType;
  selectedClientId: string;
  selectedClientName: string;
  relationshipType: string;
  roleDescription: string;
  isPrimary: boolean;
  validFrom: string;
  validUntil: string;
  notes: string;
  externalName: string;
  externalEmail: string;
  externalPhone: string;
  externalCompany: string;
}

const initialFormState: FormState = {
  entityType: 'client',
  selectedClientId: '',
  selectedClientName: '',
  relationshipType: '',
  roleDescription: '',
  isPrimary: false,
  validFrom: '',
  validUntil: '',
  notes: '',
  externalName: '',
  externalEmail: '',
  externalPhone: '',
  externalCompany: '',
};

export function AddRelationshipModalV2({ open, onOpenChange, clientId }: AddRelationshipModalV2Props) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const { data: relationshipTypes, isLoading: typesLoading } = useRelationshipTypes();
  const { data: searchResults, isLoading: isSearching } = useSearchClients(searchQuery, clientId);
  const createMutation = useCreateClientRelationshipV2();

  const resetForm = () => {
    setForm(initialFormState);
    setSearchQuery('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.relationshipType) {
      toast.error('Selecciona un tipo de relación');
      return;
    }

    if (form.entityType === 'client' && !form.selectedClientId) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (form.entityType === 'external' && !form.externalName) {
      toast.error('Introduce el nombre de la entidad externa');
      return;
    }

    try {
      await createMutation.mutateAsync({
        client_id: clientId,
        related_entity_type: form.entityType,
        related_client_id: form.entityType === 'client' ? form.selectedClientId : undefined,
        relationship_type: form.relationshipType,
        role_description: form.roleDescription || undefined,
        is_primary: form.isPrimary,
        valid_from: form.validFrom || undefined,
        valid_until: form.validUntil || undefined,
        notes: form.notes || undefined,
        external_name: form.entityType === 'external' ? form.externalName : undefined,
        external_email: form.entityType === 'external' ? form.externalEmail : undefined,
        external_phone: form.entityType === 'external' ? form.externalPhone : undefined,
        external_company: form.entityType === 'external' ? form.externalCompany : undefined,
      });
      toast.success('Relación creada correctamente');
      handleClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
        toast.error('Ya existe esta relación');
      } else {
        toast.error('Error al crear la relación');
      }
    }
  };

  const updateForm = (updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Añadir relación</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5 py-4">
            {/* Entity Type Selection */}
            <div className="space-y-3">
              <Label>Tipo de entidad relacionada</Label>
              <RadioGroup
                value={form.entityType}
                onValueChange={(v) => updateForm({ entityType: v as RelatedEntityType, selectedClientId: '', selectedClientName: '' })}
                className="grid grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="client" id="entity-client" />
                  <Label htmlFor="entity-client" className="flex items-center gap-2 cursor-pointer font-normal">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Cliente existente
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="external" id="entity-external" />
                  <Label htmlFor="entity-external" className="flex items-center gap-2 cursor-pointer font-normal">
                    <ExternalIcon className="w-4 h-4 text-muted-foreground" />
                    Entidad externa
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Client Selector (if entity type is client) */}
            {form.entityType === 'client' && (
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
                      {form.selectedClientName || (
                        <span className="text-muted-foreground">Buscar cliente...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
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
                            <p className="text-sm text-muted-foreground py-4">
                              No se encontraron resultados
                            </p>
                          </CommandEmpty>
                        )}
                        {searchQuery.length < 2 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            Escribe al menos 2 caracteres
                          </div>
                        )}
                        {searchResults && searchResults.length > 0 && (
                          <CommandGroup>
                            {searchResults.map((client) => (
                              <CommandItem
                                key={client.id}
                                value={client.id}
                                onSelect={() => {
                                  updateForm({
                                    selectedClientId: client.id,
                                    selectedClientName: client.name || client.company_name || '',
                                  });
                                  setIsComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  {client.client_type === 'company' ? (
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <User className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{client.name || client.company_name}</p>
                                    {client.email && (
                                      <p className="text-xs text-muted-foreground">{client.email}</p>
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
            )}

            {/* External Entity Fields */}
            {form.entityType === 'external' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    placeholder="Nombre de la persona o entidad"
                    value={form.externalName}
                    onChange={(e) => updateForm({ externalName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={form.externalEmail}
                      onChange={(e) => updateForm({ externalEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      placeholder="+34 600 000 000"
                      value={form.externalPhone}
                      onChange={(e) => updateForm({ externalPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Empresa/Organización</Label>
                  <Input
                    placeholder="Nombre de la empresa"
                    value={form.externalCompany}
                    onChange={(e) => updateForm({ externalCompany: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Relationship Type */}
            <div className="space-y-2">
              <Label>Tipo de relación *</Label>
              <Select 
                value={form.relationshipType} 
                onValueChange={(v) => updateForm({ relationshipType: v })}
                disabled={typesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes && Object.entries(relationshipTypes).map(([category, types]) => (
                    types.length > 0 && (
                      <SelectGroup key={category}>
                        <SelectLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                          {getCategoryLabel(category)}
                        </SelectLabel>
                        {types.map((type) => (
                          <SelectItem key={type.code} value={type.code}>
                            {type.name_es}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Description */}
            <div className="space-y-2">
              <Label>Descripción del rol</Label>
              <Input
                placeholder="Ej: Director Legal, Agente en OEPM, Inventor principal..."
                value={form.roleDescription}
                onChange={(e) => updateForm({ roleDescription: e.target.value })}
              />
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válido desde</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => updateForm({ validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Válido hasta</Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => updateForm({ validUntil: e.target.value })}
                />
              </div>
            </div>

            {/* Primary Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary"
                checked={form.isPrimary}
                onCheckedChange={(checked) => updateForm({ isPrimary: checked === true })}
              />
              <Label htmlFor="is_primary" className="text-sm font-normal">
                Es la relación principal de este tipo
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Notas adicionales sobre esta relación..."
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
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
