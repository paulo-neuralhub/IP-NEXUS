// ============================================
// src/components/matters/AddPartyModal.tsx
// Modal to add a party to a matter
// ============================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, User, Building, FileText } from 'lucide-react';
import { usePartyRoles, useCreateMatterParty } from '@/hooks/legal-ops/useMatterParties';
import { useSearchClients } from '@/hooks/legal-ops/useClientRelationships';
import { useToast } from '@/hooks/use-toast';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

const formSchema = z.object({
  party_role: z.string().min(1, 'Selecciona un rol'),
  source_type: z.enum(['client', 'contact', 'manual']),
  client_id: z.string().optional(),
  external_name: z.string().optional(),
  external_address: z.string().optional(),
  external_country: z.string().optional(),
  external_email: z.string().email().optional().or(z.literal('')),
  external_phone: z.string().optional(),
  percentage: z.number().min(0).max(100).optional(),
  is_primary: z.boolean().default(false),
  jurisdiction: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPartyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterType?: string;
}

export function AddPartyModal({ 
  open, 
  onOpenChange, 
  matterId,
  matterType = 'trademark'
}: AddPartyModalProps) {
  const { toast } = useToast();
  const { data: roles, isLoading: rolesLoading } = usePartyRoles(matterType);
  const createParty = useCreateMatterParty();
  
  const [clientSearch, setClientSearch] = useState('');
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const { data: clients } = useSearchClients(clientSearch);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party_role: '',
      source_type: 'client',
      is_primary: false,
    },
  });

  const sourceType = form.watch('source_type');
  const selectedClientId = form.watch('client_id');
  const selectedClient = clients?.find(c => c.id === selectedClientId);

  const onSubmit = async (values: FormValues) => {
    try {
      await createParty.mutateAsync({
        matter_id: matterId,
        party_role: values.party_role,
        source_type: values.source_type,
        client_id: values.source_type === 'client' ? values.client_id : undefined,
        external_name: values.source_type === 'manual' ? values.external_name : undefined,
        external_address: values.source_type === 'manual' ? values.external_address : undefined,
        external_country: values.source_type === 'manual' ? values.external_country : undefined,
        external_email: values.source_type === 'manual' ? values.external_email : undefined,
        external_phone: values.source_type === 'manual' ? values.external_phone : undefined,
        percentage: values.percentage,
        is_primary: values.is_primary,
        jurisdiction: values.jurisdiction,
        notes: values.notes,
      });

      toast({ title: 'Parte añadida correctamente' });
      form.reset();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error al añadir parte', variant: 'destructive' });
    }
  };

  // Group roles by category
  const groupedRoles = roles?.reduce((acc, role) => {
    const cat = role.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(role);
    return acc;
  }, {} as Record<string, typeof roles>);

  const categoryLabels: Record<string, string> = {
    ownership: 'Titularidad',
    creation: 'Creación',
    representation: 'Representación',
    other: 'Otros',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Parte</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Party Role */}
            <FormField
              control={form.control}
              name="party_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol de la parte *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Cargando...
                        </div>
                      ) : (
                        Object.entries(groupedRoles || {}).map(([category, categoryRoles]) => (
                          <SelectGroup key={category}>
                            <SelectLabel>{categoryLabels[category] || category}</SelectLabel>
                            {categoryRoles?.map(role => (
                              <SelectItem key={role.code} value={role.code}>
                                {role.name_es}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Source Type */}
            <FormField
              control={form.control}
              name="source_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de entidad</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="client" id="client" />
                        <Label htmlFor="client" className="flex items-center gap-1 cursor-pointer">
                          <Building className="h-4 w-4" />
                          Cliente existente
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="flex items-center gap-1 cursor-pointer">
                          <User className="h-4 w-4" />
                          Externo
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Client Selection */}
            {sourceType === 'client' && (
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Cliente</FormLabel>
                    <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {selectedClient?.name || 'Buscar cliente...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar cliente..." 
                            value={clientSearch}
                            onValueChange={setClientSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No se encontraron clientes</CommandEmpty>
                            <CommandGroup>
                              {clients?.map(client => (
                                <CommandItem
                                  key={client.id}
                                  value={client.id}
                                  onSelect={() => {
                                    field.onChange(client.id);
                                    setClientPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      client.id === field.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div>
                                    <div className="font-medium">{client.name}</div>
                                    {client.company_name && (
                                      <div className="text-xs text-muted-foreground">
                                        {client.company_name}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* External Fields */}
            {sourceType === 'manual' && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <FormField
                  control={form.control}
                  name="external_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre completo o razón social" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="external_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@ejemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="external_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+34 600 000 000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="external_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="España" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="external_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Dirección completa" rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={100}
                        {...field}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdicción</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ES, EU, WIPO..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_primary"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-base">Parte principal</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Marcar como parte principal de este rol
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notas adicionales..." rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createParty.isPending}>
                {createParty.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Añadir parte
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
