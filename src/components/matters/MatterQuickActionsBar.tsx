/**
 * MatterQuickActionsBar - Barra flotante de acciones rápidas para expediente
 * Permite ejecutar acciones (Email, Llamada, WhatsApp, Nota, Reunión) sin salir del expediente
 */

import { useState } from 'react';
import { Mail, Phone, MessageSquare, StickyNote, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MatterContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface MatterQuickActionsBarProps {
  matterId: string;
  matterReference: string;
  accountId?: string;
  accountName?: string;
  contacts?: MatterContact[];
  onEmailClick: (contact?: MatterContact) => void;
  onCallClick: (contact?: MatterContact) => void;
  onWhatsAppClick?: (contact?: MatterContact) => void;
  onNoteClick: () => void;
  onMeetingClick?: () => void;
  className?: string;
}

export function MatterQuickActionsBar({
  matterId,
  matterReference,
  accountId,
  accountName,
  contacts = [],
  onEmailClick,
  onCallClick,
  onWhatsAppClick,
  onNoteClick,
  onMeetingClick,
  className,
}: MatterQuickActionsBarProps) {
  const hasContacts = contacts.length > 0;
  const hasPhoneContacts = contacts.some(c => c.phone);

  const ActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    colorClass,
    disabled = false 
  }: { 
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    colorClass?: string;
    disabled?: boolean;
  }) => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gap-1.5 transition-colors",
        colorClass
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 bg-muted/30 rounded-xl border",
      className
    )}>
      <div className="flex items-center gap-2 mr-2">
        <span className="text-sm font-medium text-muted-foreground">Acciones:</span>
        <Badge variant="outline" className="font-mono text-xs">
          {matterReference}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Email - con dropdown si hay contactos */}
        {hasContacts ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-primary hover:bg-primary/10">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {contacts.filter(c => c.email).map((contact) => (
                <DropdownMenuItem key={contact.id} onClick={() => onEmailClick(contact)}>
                  <Mail className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onEmailClick()}>
                <Mail className="h-4 w-4 mr-2 opacity-50" />
                <span className="text-muted-foreground">Otro destinatario...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ActionButton 
            icon={Mail} 
            label="Email" 
            onClick={() => onEmailClick()}
            colorClass="text-primary hover:bg-primary/10"
          />
        )}

        {/* Llamada */}
        {hasPhoneContacts ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-success hover:bg-success/10">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Llamar</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              {contacts.filter(c => c.phone).map((contact) => (
                <DropdownMenuItem key={contact.id} onClick={() => onCallClick(contact)}>
                  <Phone className="h-4 w-4 mr-2" />
                  <div className="flex flex-col">
                    <span className="font-medium">{contact.name}</span>
                    <span className="text-xs text-muted-foreground">{contact.phone}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => onCallClick()}>
                <Phone className="h-4 w-4 mr-2 opacity-50" />
                <span className="text-muted-foreground">Registrar llamada...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <ActionButton 
            icon={Phone} 
            label="Llamada" 
            onClick={() => onCallClick()}
            colorClass="text-success hover:bg-success/10"
          />
        )}

        {/* WhatsApp */}
        {onWhatsAppClick && (
          hasPhoneContacts ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-[#25D366] hover:bg-[#25D366]/10">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                {contacts.filter(c => c.phone).map((contact) => (
                  <DropdownMenuItem key={contact.id} onClick={() => onWhatsAppClick(contact)}>
                    <MessageSquare className="h-4 w-4 mr-2 text-[#25D366]" />
                    <div className="flex flex-col">
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-xs text-muted-foreground">{contact.phone}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <ActionButton 
              icon={MessageSquare} 
              label="WhatsApp" 
              onClick={() => onWhatsAppClick()}
              colorClass="text-[#25D366] hover:bg-[#25D366]/10"
              disabled={!hasPhoneContacts}
            />
          )
        )}

        {/* Separador visual */}
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* Nota */}
        <ActionButton 
          icon={StickyNote} 
          label="Nota" 
          onClick={onNoteClick}
          colorClass="text-warning hover:bg-warning/10"
        />

        {/* Reunión */}
        {onMeetingClick && (
          <ActionButton 
            icon={Calendar} 
            label="Reunión" 
            onClick={onMeetingClick}
            colorClass="text-purple-600 hover:bg-purple-600/10"
          />
        )}
      </div>
    </div>
  );
}

export default MatterQuickActionsBar;
