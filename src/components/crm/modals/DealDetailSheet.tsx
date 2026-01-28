/**
 * DealDetailSheet - Sheet lateral con ficha del cliente/deal
 * Abre vista 360 del cliente con tabs
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone,
  Mail,
  MessageSquare,
  Building2,
  MapPin,
  Calendar,
  FileText,
  User,
  Trophy,
  XCircle,
  Clock,
  Briefcase,
  Hash,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Deal } from '@/hooks/crm/useDeals';
import { useNavigate } from 'react-router-dom';

interface DealDetailSheetProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCall?: () => void;
  onEmail?: () => void;
  onWhatsApp?: () => void;
  onWin?: () => void;
  onLose?: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  contacted: 'Contactado',
  qualified: 'Cualificado',
  proposal: 'Propuesta',
  negotiation: 'Negociación',
  won: 'Ganado',
  lost: 'Perdido',
};

export function DealDetailSheet({
  deal,
  open,
  onOpenChange,
  onCall,
  onEmail,
  onWhatsApp,
  onWin,
  onLose,
}: DealDetailSheetProps) {
  const navigate = useNavigate();

  if (!deal) return null;

  const client = deal.client;
  const clientName = client?.name || deal.name;
  const clientNumber = client?.client_number;

  const initials = clientName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '??';

  const isWon = deal.stage === 'won';
  const isLost = deal.stage === 'lost';

  // Mock related data
  const contacts = client ? [
    {
      id: '1',
      name: client.name,
      role: 'Principal',
      phone: client.phone,
      email: client.email,
      isPrimary: true,
    },
  ] : [];

  const relatedDeals = [
    {
      id: deal.id,
      name: deal.name,
      amount: deal.amount,
      stage: deal.stage,
      isCurrent: true,
    },
  ];

  const matters = [
    // Mock matters for display
  ];

  const handleGoToClient = () => {
    if (client?.id) {
      navigate(`/app/crm/accounts/${client.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <Avatar className={`h-14 w-14 ${isWon ? 'bg-[hsl(var(--ip-success-bg))]' : isLost ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <AvatarFallback className={`text-lg font-semibold ${isWon ? 'text-[hsl(var(--ip-success-text))]' : isLost ? 'text-destructive' : 'text-primary'}`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold flex items-center gap-2">
                {clientName}
                {client && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleGoToClient}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </SheetTitle>
              {clientNumber && (
                <p className="text-primary font-mono text-sm mt-1">
                  {clientNumber}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isWon ? 'default' : isLost ? 'destructive' : 'secondary'}>
                  {STAGE_LABELS[deal.stage] || deal.stage}
                </Badge>
                {deal.probability !== undefined && (
                  <span className="text-sm text-muted-foreground">{deal.probability}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Deal value + progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                💰 {(deal.amount || 0).toLocaleString('es-ES')} €
              </span>
            </div>
            {!isWon && !isLost && deal.probability !== undefined && (
              <Progress value={deal.probability} className="h-2" />
            )}
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="datos" className="flex-1">
          <TabsList className="w-full justify-start px-6 py-2 h-auto border-b rounded-none bg-transparent">
            <TabsTrigger value="datos" className="text-xs">Datos</TabsTrigger>
            <TabsTrigger value="contactos" className="text-xs">Contactos</TabsTrigger>
            <TabsTrigger value="expedientes" className="text-xs">Expedientes</TabsTrigger>
            <TabsTrigger value="deals" className="text-xs">Deals</TabsTrigger>
            <TabsTrigger value="historial" className="text-xs">Historial</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-340px)]">
            {/* Datos Tab */}
            <TabsContent value="datos" className="p-6 space-y-6 m-0">
              {/* Datos Cliente */}
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Datos del Cliente
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{clientName}</span>
                  </div>
                  {(client as Record<string, unknown>)?.tax_id && (
                    <div className="flex items-center gap-3 text-sm">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{(client as Record<string, unknown>).tax_id as string}</span>
                    </div>
                  )}
                  {client?.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client?.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${client.phone}`} className="hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Deal Info */}
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Información del Deal
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>{deal.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Creado {formatDistanceToNow(new Date(deal.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  {deal.expected_close_date && (
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Cierre esperado: {format(new Date(deal.expected_close_date), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Next Action */}
              {deal.next_action && (
                <>
                  <Separator />
                  <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Próxima Acción
                    </h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{deal.next_action}</p>
                      {deal.next_action_date && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(deal.next_action_date), "EEEE d MMM", { locale: es })}
                        </p>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* Loss reason if lost */}
              {isLost && deal.lost_reason && (
                <>
                  <Separator />
                  <section>
                    <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide mb-3">
                      Motivo de Pérdida
                    </h3>
                    <div className="bg-destructive/10 p-3 rounded-lg text-sm">
                      {deal.lost_reason}
                    </div>
                  </section>
                </>
              )}
            </TabsContent>

            {/* Contactos Tab */}
            <TabsContent value="contactos" className="p-6 space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contactos
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir
                </Button>
              </div>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay contactos asociados
                </p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contact.name}</span>
                          {contact.isPrimary && (
                            <Badge variant="outline" className="text-xs">Principal</Badge>
                          )}
                        </div>
                        {contact.role && (
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </span>
                          )}
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Expedientes Tab */}
            <TabsContent value="expedientes" className="p-6 space-y-4 m-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Expedientes
                </h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Nuevo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay expedientes asociados a este cliente
              </p>
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="p-6 space-y-4 m-0">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Deals Activos
              </h3>
              {relatedDeals.map((d) => (
                <div key={d.id} className={`border rounded-lg p-3 ${d.isCurrent ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{d.name}</span>
                      {d.isCurrent && (
                        <Badge variant="outline" className="ml-2 text-xs">Actual</Badge>
                      )}
                    </div>
                    <Badge variant="secondary">{STAGE_LABELS[d.stage]}</Badge>
                  </div>
                  <p className="text-lg font-bold text-primary mt-1">
                    {(d.amount || 0).toLocaleString('es-ES')} €
                  </p>
                </div>
              ))}
            </TabsContent>

            {/* Historial Tab */}
            <TabsContent value="historial" className="p-6 space-y-4 m-0">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Historial de Actividades
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <span className="text-muted-foreground">
                      {format(new Date(deal.created_at), "d/MM", { locale: es })}
                    </span>
                    <span className="mx-2">-</span>
                    <span>Deal creado: {deal.name}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center gap-2 flex-wrap">
            {client?.phone && onCall && (
              <Button variant="outline" size="sm" onClick={onCall}>
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </Button>
            )}
            {client?.phone && onWhatsApp && (
              <Button variant="outline" size="sm" onClick={onWhatsApp}>
                <MessageSquare className="w-4 h-4 mr-2 text-[#25D366]" />
                WhatsApp
              </Button>
            )}
            {client?.email && onEmail && (
              <Button variant="outline" size="sm" onClick={onEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
            <div className="flex-1" />
            {!isWon && !isLost && onWin && (
              <Button size="sm" className="bg-[hsl(var(--ip-success-text))] hover:bg-[hsl(var(--ip-success-text))]/90" onClick={onWin}>
                <Trophy className="w-4 h-4 mr-2" />
                Ganado
              </Button>
            )}
            {!isWon && !isLost && onLose && (
              <Button variant="destructive" size="sm" onClick={onLose}>
                <XCircle className="w-4 h-4 mr-2" />
                Perdido
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
