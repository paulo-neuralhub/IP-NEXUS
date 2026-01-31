// ============================================================
// IP-NEXUS - STEP 2: PARTIES & ROLES (V2)
// L132: Client, owners, inventors, contacts management
// ============================================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Building, Users, PlusCircle, Search, Trash2, Star,
  Edit2, ChevronDown, ChevronUp, AlertCircle, MapPin, Receipt
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { MatterWizardState, WizardParty } from './types';

interface Step2PartiesProps {
  data: MatterWizardState['step2'];
  onChange: (data: Partial<MatterWizardState['step2']>) => void;
  matterType: string;
}

export function Step2Parties({ data, onChange, matterType }: Step2PartiesProps) {
  const { currentOrganization } = useOrganization();
  const [clientSearch, setClientSearch] = useState('');
  const [showInventors, setShowInventors] = useState(false);
  
  const isPatentType = matterType?.startsWith('PT') || matterType === 'UM';

  // Fetch clients (from contacts with is_client or from crm_accounts)
  const { data: clients = [] } = useQuery({
    queryKey: ['wizard-clients', currentOrganization?.id, clientSearch],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('contacts')
        .select('id, name, email, company_name, tax_id, client_token, country')
        .eq('organization_id', currentOrganization.id)
        .or('type.eq.company,client_type.eq.client')
        .order('name')
        .limit(20);
      
      if (clientSearch.trim()) {
        query = query.or(`name.ilike.%${clientSearch}%,company_name.ilike.%${clientSearch}%,tax_id.ilike.%${clientSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });

  // Get selected client info
  const selectedClient = useMemo(() => 
    clients.find(c => c.id === data.clientId),
    [clients, data.clientId]
  );

  // Handlers
  const handleClientSelect = (clientId: string) => {
    onChange({ clientId });
    
    // Auto-add as owner if checkbox is checked
    if (data.clientIsOwner) {
      const existing = data.parties.filter(p => p.role !== 'owner' || p.clientId !== clientId);
      onChange({
        clientId,
        parties: [
          ...existing,
          {
            role: 'owner',
            sourceType: 'client',
            clientId,
            isPrimary: true,
            percentage: 100,
          }
        ]
      });
    }
  };

  const handleClientIsOwnerChange = (checked: boolean) => {
    onChange({ clientIsOwner: checked });
    
    if (checked && data.clientId) {
      // Add client as owner
      const existing = data.parties.filter(p => p.role !== 'owner' || p.clientId !== data.clientId);
      onChange({
        clientIsOwner: checked,
        parties: [
          ...existing,
          {
            role: 'owner',
            sourceType: 'client',
            clientId: data.clientId,
            isPrimary: true,
            percentage: 100,
          }
        ]
      });
    } else if (!checked) {
      // Remove client from owners
      onChange({
        clientIsOwner: checked,
        parties: data.parties.filter(p => !(p.role === 'owner' && p.clientId === data.clientId))
      });
    }
  };

  const addParty = (role: string) => {
    const newParty: WizardParty = {
      role,
      sourceType: 'external',
      isPrimary: data.parties.filter(p => p.role === role).length === 0,
    };
    onChange({ parties: [...data.parties, newParty] });
  };

  const removeParty = (index: number) => {
    const updated = [...data.parties];
    updated.splice(index, 1);
    onChange({ parties: updated });
  };

  const updateParty = (index: number, updates: Partial<WizardParty>) => {
    const updated = [...data.parties];
    updated[index] = { ...updated[index], ...updates };
    onChange({ parties: updated });
  };

  // Group parties by role
  const owners = data.parties.filter(p => p.role === 'owner');
  const inventors = data.parties.filter(p => p.role === 'inventor');
  const otherParties = data.parties.filter(p => !['owner', 'inventor'].includes(p.role));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Partes y Roles</h2>
        <p className="text-muted-foreground">Identifica al cliente, titulares e inventores</p>
      </div>

      {/* CLIENT SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Cliente (quien instruye)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente existente..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Client results */}
          {clientSearch && clients.length > 0 && !selectedClient && (
            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-2 space-y-1">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => {
                      handleClientSelect(client.id);
                      setClientSearch('');
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Building className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{client.name || client.company_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {client.tax_id && `${client.tax_id} · `}{client.country}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Selected client */}
          {selectedClient && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{selectedClient.name || selectedClient.company_name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedClient.tax_id && `${selectedClient.tax_id} · `}
                  {selectedClient.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onChange({ clientId: '', parties: data.parties.filter(p => p.clientId !== data.clientId) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Create new client link */}
          <Button variant="outline" size="sm" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Crear nuevo cliente
          </Button>

          {/* Client is owner checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="client-is-owner"
              checked={data.clientIsOwner}
              onCheckedChange={(checked) => handleClientIsOwnerChange(!!checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="client-is-owner" className="font-medium cursor-pointer">
                El cliente es también el titular
              </Label>
              <p className="text-xs text-muted-foreground">
                Si el cliente es un agente o despacho externo, desmarca esta opción
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OWNERS SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Titular(es)
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => addParty('owner')}>
              <PlusCircle className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {owners.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay titulares añadidos. {data.clientIsOwner && data.clientId ? 'El cliente será el titular.' : 'Añade al menos un titular.'}
            </p>
          ) : (
            owners.map((owner, idx) => (
              <PartyCard
                key={idx}
                party={owner}
                index={data.parties.indexOf(owner)}
                onUpdate={(updates) => updateParty(data.parties.indexOf(owner), updates)}
                onRemove={() => removeParty(data.parties.indexOf(owner))}
                clients={clients}
              />
            ))
          )}
          
          {owners.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Asegúrate de que los porcentajes sumen 100%
            </div>
          )}
        </CardContent>
      </Card>

      {/* INVENTORS SECTION (Patents only) */}
      {isPatentType && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Inventores
                <Badge variant="secondary" className="text-xs">Solo patentes</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => addParty('inventor')}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay inventores añadidos
              </p>
            ) : (
              inventors.map((inventor, idx) => (
                <InventorCard
                  key={idx}
                  party={inventor}
                  order={idx + 1}
                  onUpdate={(updates) => updateParty(data.parties.indexOf(inventor), updates)}
                  onRemove={() => removeParty(data.parties.indexOf(inventor))}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* CONTACTS SECTION */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Correspondencia</Label>
              <Select
                value={data.correspondenceAddress}
                onValueChange={(val) => onChange({ correspondenceAddress: val as 'client' | 'custom' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Usar dirección del cliente</SelectItem>
                  <SelectItem value="custom">Dirección personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Facturación</Label>
              <Select
                value={data.billingAddress}
                onValueChange={(val) => onChange({ billingAddress: val as 'client' | 'custom' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Usar dirección del cliente</SelectItem>
                  <SelectItem value="custom">Dirección personalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Sub-components

interface PartyCardProps {
  party: WizardParty;
  index: number;
  onUpdate: (updates: Partial<WizardParty>) => void;
  onRemove: () => void;
  clients: any[];
}

function PartyCard({ party, index, onUpdate, onRemove, clients }: PartyCardProps) {
  const client = clients.find(c => c.id === party.clientId);
  
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
        <Building className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {party.sourceType === 'client' && client ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">{client.name || client.company_name}</span>
              {party.isPrimary && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Principal
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {client.tax_id} · {client.country}
            </p>
          </>
        ) : (
          <Input
            placeholder="Nombre del titular"
            value={party.externalName || ''}
            onChange={(e) => onUpdate({ externalName: e.target.value })}
            className="h-8"
          />
        )}
        
        {/* Percentage for co-owners */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="100"
            value={party.percentage || ''}
            onChange={(e) => onUpdate({ percentage: parseFloat(e.target.value) || 0 })}
            className="w-20 h-8"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface InventorCardProps {
  party: WizardParty;
  order: number;
  onUpdate: (updates: Partial<WizardParty>) => void;
  onRemove: () => void;
}

function InventorCard({ party, order, onUpdate, onRemove }: InventorCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border font-bold text-sm">
        #{order}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nombre del inventor"
            value={party.externalName || ''}
            onChange={(e) => onUpdate({ externalName: e.target.value })}
            className="h-8"
          />
          {party.isPrimary && (
            <Badge variant="outline" className="gap-1 text-xs shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              Primero
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Nacionalidad"
            value={party.inventorNationality || ''}
            onChange={(e) => onUpdate({ inventorNationality: e.target.value })}
            className="h-8 text-sm"
          />
          <Input
            placeholder="DNI/ID"
            value={party.inventorIdNumber || ''}
            onChange={(e) => onUpdate({ inventorIdNumber: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`assignment-${order}`}
            checked={party.assignmentStatus === 'signed'}
            onCheckedChange={(checked) => 
              onUpdate({ assignmentStatus: checked ? 'signed' : 'pending' })
            }
          />
          <Label htmlFor={`assignment-${order}`} className="text-xs cursor-pointer">
            Cesión de derechos firmada
          </Label>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
