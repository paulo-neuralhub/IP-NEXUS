import { useState } from 'react';
import { CommunicationsInbox } from "@/components/legal-ops";
import { WhatsAppChat } from "@/components/communications";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, ArrowLeft, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  avatar_url?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export default function WhatsAppInboxPage() {
  const { currentOrganization } = useOrganization();
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  // Obtener contactos con conversaciones de WhatsApp
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['whatsapp-contacts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      // Obtener las últimas comunicaciones de WhatsApp agrupadas por contacto
      const { data, error } = await supabase
        .from('communications')
        .select(`
          id,
          contact_id,
          whatsapp_from,
          body_preview,
          created_at,
          is_read
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('channel', 'whatsapp')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener contactos únicos
      const contactIds = [...new Set((data || []).map(c => c.contact_id).filter(Boolean))];
      
      if (contactIds.length === 0) return [];

      const { data: contactsData } = await supabase
        .from('contacts')
        .select('id, name, phone, avatar_url')
        .in('id', contactIds as string[]);

      // Crear mapa de contactos
      const contactsById = new Map(
        (contactsData || []).map(c => [c.id, c])
      );

      // Agrupar por contacto y obtener el último mensaje
      const contactMap = new Map<string, WhatsAppContact>();
      
      for (const comm of data || []) {
        const contact = contactsById.get(comm.contact_id || '');
        if (!contact) continue;

        if (!contactMap.has(contact.id)) {
          contactMap.set(contact.id, {
            id: contact.id,
            name: contact.name || 'Sin nombre',
            phone: contact.phone || '',
            avatar_url: contact.avatar_url || undefined,
            last_message: comm.body_preview || '',
            last_message_at: comm.created_at,
            unread_count: comm.is_read ? 0 : 1,
          });
        } else if (!comm.is_read) {
          const existing = contactMap.get(contact.id)!;
          existing.unread_count = (existing.unread_count || 0) + 1;
        }
      }

      return Array.from(contactMap.values());
    },
    enabled: !!currentOrganization?.id,
  });

  // Filtrar contactos por búsqueda
  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Vista de lista de contactos
  const ContactList = () => (
    <Card className={cn(
      "flex flex-col",
      isMobile ? "h-full w-full" : "w-[360px] h-full"
    )}>
      <CardHeader className="pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            WhatsApp
          </CardTitle>
          <Button size="sm" className="gap-1 bg-[#25D366] hover:bg-[#128C7E]">
            <Plus className="w-4 h-4" />
            Nuevo
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contacto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="divide-y">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Cargando conversaciones...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No se encontraron contactos' : 'No hay conversaciones'}
                </p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
                    selectedContact?.id === contact.id && "bg-muted"
                  )}
                >
                  <Avatar>
                    <AvatarImage src={contact.avatar_url} />
                    <AvatarFallback className="bg-[#25D366] text-white">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{contact.name}</span>
                      {contact.last_message_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(contact.last_message_at), {
                            addSuffix: false,
                            locale: es,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                        {contact.last_message || contact.phone}
                      </p>
                      {(contact.unread_count ?? 0) > 0 && (
                        <Badge className="bg-[#25D366] text-white h-5 min-w-[20px] flex items-center justify-center">
                          {contact.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Mobile: mostrar chat a pantalla completa o lista
  if (isMobile) {
    if (selectedContact) {
      return (
        <div className="h-[calc(100vh-140px)]">
          <WhatsAppChat
            contact={selectedContact}
            onBack={() => setSelectedContact(null)}
          />
        </div>
      );
    }
    return <ContactList />;
  }

  // Desktop: layout de dos columnas
  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      <ContactList />

      {/* Chat area */}
      <div className="flex-1">
        {selectedContact ? (
          <WhatsAppChat
            contact={selectedContact}
            className="h-full rounded-xl overflow-hidden border"
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-[#25D366]" />
              </div>
              <h3 className="font-medium mb-1">WhatsApp Business</h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                Selecciona un contacto para ver la conversación o inicia una nueva
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
