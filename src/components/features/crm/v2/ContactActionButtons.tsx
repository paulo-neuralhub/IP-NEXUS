import { useState } from 'react';
import { Mail, MessageCircle, Phone, MoreHorizontal, Calendar, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SendEmailModal } from './SendEmailModal';
import { SendWhatsAppModal } from './SendWhatsAppModal';

interface Contact {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp_phone?: string | null;
}

interface ContactActionButtonsProps {
  contact: Contact;
  dealId?: string;
  variant?: 'default' | 'compact';
}

export function ContactActionButtons({ contact, dealId, variant = 'default' }: ContactActionButtonsProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  const hasEmail = !!contact.email;
  const hasPhone = !!(contact.whatsapp_phone || contact.phone);

  const callHref = contact.phone ? `tel:${contact.phone}` : undefined;

  if (variant === 'compact') {
    return (
      <>
        <div className="flex items-center gap-2">
          {hasEmail ? (
            <Button size="icon" variant="outline" onClick={() => setEmailModalOpen(true)} aria-label="Enviar email">
              <Mail className="h-4 w-4" />
            </Button>
          ) : null}
          {hasPhone ? (
            <Button size="icon" variant="outline" onClick={() => setWhatsappModalOpen(true)} aria-label="Enviar WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Más acciones">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {callHref ? (
                <DropdownMenuItem asChild>
                  <a href={callHref}>
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </a>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar reunión
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Añadir nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SendEmailModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          contact={{ id: contact.id, email: contact.email || undefined, full_name: contact.full_name }}
          dealId={dealId}
        />
        <SendWhatsAppModal
          open={whatsappModalOpen}
          onOpenChange={setWhatsappModalOpen}
          contact={{
            id: contact.id,
            phone: contact.phone || undefined,
            whatsapp_phone: contact.whatsapp_phone || undefined,
            full_name: contact.full_name,
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasEmail ? (
          <Button variant="outline" onClick={() => setEmailModalOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        ) : null}
        {hasPhone ? (
          <Button variant="outline" onClick={() => setWhatsappModalOpen(true)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        ) : null}
        {callHref ? (
          <Button asChild variant="outline">
            <a href={callHref}>
              <Phone className="h-4 w-4 mr-2" />
              Llamar
            </a>
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Más
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar reunión
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Añadir nota
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        contact={{ id: contact.id, email: contact.email || undefined, full_name: contact.full_name }}
        dealId={dealId}
      />
      <SendWhatsAppModal
        open={whatsappModalOpen}
        onOpenChange={setWhatsappModalOpen}
        contact={{
          id: contact.id,
          phone: contact.phone || undefined,
          whatsapp_phone: contact.whatsapp_phone || undefined,
          full_name: contact.full_name,
        }}
      />
    </>
  );
}
