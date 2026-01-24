import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  X,
  Clock,
  Building2,
  MapPin,
  Tag,
  FileText,
  Download,
  Send,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Types
export interface RfqAttachment {
  id: string;
  name: string;
  size: number;
  url: string;
}

export interface RfqQuoteDetail {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_avatar?: string;
  agent_rating?: number;
  amount: number;
  currency: string;
  delivery_days: number;
  status: 'submitted' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  submitted_at: string;
  is_mine?: boolean;
}

export interface RfqRequestDetail {
  id: string;
  reference: string;
  title: string;
  description?: string;
  service_category: string;
  ip_type: string;
  jurisdictions: string[];
  classes?: string[];
  requirements?: string[];
  budget_min?: number;
  budget_max?: number;
  currency: string;
  deadline: string;
  status: 'open' | 'evaluating' | 'awarded' | 'cancelled';
  is_blind: boolean;
  client_id?: string;
  client_name?: string;
  attachments: RfqAttachment[];
  quotes: RfqQuoteDetail[];
  created_at: string;
  // Viewer context
  is_owner: boolean; // Am I the client who created this?
  my_quote?: RfqQuoteDetail; // My submitted quote if any
}

interface RequestDetailPanelProps {
  open: boolean;
  onClose: () => void;
  request: RfqRequestDetail | null;
  onSubmitQuote?: (requestId: string) => void;
  onEditQuote?: (quoteId: string) => void;
  onWithdrawQuote?: (quoteId: string) => void;
  onAcceptQuote?: (quoteId: string) => void;
  onRejectQuote?: (quoteId: string) => void;
  onAskQuestion?: (quoteId: string) => void;
  onCancelRequest?: (requestId: string) => void;
  onMarkAwarded?: (requestId: string, quoteId: string) => void;
}

const STATUS_CONFIG = {
  open: { label: 'Abierta', color: 'bg-primary/10 text-primary border-primary/20' },
  evaluating: { label: 'Evaluando', color: 'bg-warning/10 text-warning border-warning/20' },
  awarded: { label: 'Adjudicada', color: 'bg-primary/10 text-primary border-primary/20' },
  cancelled: { label: 'Cancelada', color: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const QUOTE_STATUS_CONFIG = {
  submitted: { label: 'Enviado', color: 'bg-warning/10 text-warning' },
  accepted: { label: 'Aceptado', color: 'bg-primary/10 text-primary' },
  rejected: { label: 'Rechazado', color: 'bg-destructive/10 text-destructive' },
  expired: { label: 'Expirado', color: 'bg-muted text-muted-foreground' },
};

export function RequestDetailPanel({
  open,
  onClose,
  request,
  onSubmitQuote,
  onEditQuote,
  onWithdrawQuote,
  onAcceptQuote,
  onRejectQuote,
  onAskQuestion,
  onCancelRequest,
  onMarkAwarded,
}: RequestDetailPanelProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [quotesExpanded, setQuotesExpanded] = useState(true);

  if (!request) return null;

  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatBudget = () => {
    if (request.budget_min && request.budget_max) {
      return `${formatCurrency(request.budget_min, request.currency)} - ${formatCurrency(request.budget_max, request.currency)}`;
    }
    if (request.budget_min) return `Desde ${formatCurrency(request.budget_min, request.currency)}`;
    if (request.budget_max) return `Hasta ${formatCurrency(request.budget_max, request.currency)}`;
    return 'A convenir';
  };

  const getRemainingTime = () => {
    const now = new Date();
    const end = new Date(request.deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return { text: 'Vencida', urgent: true, percent: 100 };
    
    const totalDuration = end.getTime() - new Date(request.created_at).getTime();
    const elapsed = now.getTime() - new Date(request.created_at).getTime();
    const percent = Math.min(100, (elapsed / totalDuration) * 100);
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h restantes`, urgent: days <= 2, percent };
    return { text: `${hours}h restantes`, urgent: true, percent };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const remaining = getRemainingTime();
  const status = STATUS_CONFIG[request.status];
  const canSubmitQuote = !request.is_owner && !request.my_quote && request.status === 'open';
  const canEditQuote = request.my_quote?.status === 'submitted' && request.status === 'open';
  const otherQuotes = request.quotes.filter(q => !q.is_mine);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-4 pb-4">
            {/* Reference + Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-muted-foreground">
                {request.reference}
              </span>
              <Badge variant="outline" className={cn('text-xs', status.color)}>
                {status.label}
              </Badge>
            </div>

            {/* Title */}
            <SheetTitle className="text-xl font-semibold text-left">
              {request.title}
            </SheetTitle>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {request.client_name && !request.is_blind && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {request.client_name}
                </span>
              )}
              {request.is_blind && (
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Cliente anónimo
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {request.jurisdictions.join(', ')}
              </span>
            </div>

            {/* Budget */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Presupuesto estimado</span>
              <span className="font-semibold">{formatBudget()}</span>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Fecha límite
                </span>
                <span className={cn('font-medium', remaining.urgent && 'text-destructive')}>
                  {remaining.text}
                </span>
              </div>
              <Progress 
                value={remaining.percent} 
                className={cn('h-2', remaining.urgent && '[&>div]:bg-destructive')} 
              />
              <p className="text-xs text-muted-foreground text-right">
                {format(new Date(request.deadline), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </SheetHeader>

          <Separator className="my-4" />

          {/* Description */}
          {request.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Descripción</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium">Detalles</h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground block text-xs mb-1">Tipo de servicio</span>
                <span className="font-medium">{request.service_category}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground block text-xs mb-1">Tipo IP</span>
                <span className="font-medium">{request.ip_type}</span>
              </div>
            </div>

            {/* Classes */}
            {request.classes && request.classes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Clases/Categorías</span>
                <div className="flex flex-wrap gap-1">
                  {request.classes.map((cls, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {request.requirements && request.requirements.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Requisitos específicos</span>
                <ul className="space-y-1 text-sm">
                  {request.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Attachments */}
            {request.attachments.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">Archivos adjuntos</span>
                <div className="space-y-2">
                  {request.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={file.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* My Quote (if submitted) */}
          {request.my_quote && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Mi Presupuesto</span>
                  <Badge className={QUOTE_STATUS_CONFIG[request.my_quote.status].color}>
                    {QUOTE_STATUS_CONFIG[request.my_quote.status].label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monto</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(request.my_quote.amount, request.my_quote.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plazo entrega</span>
                  <span>{request.my_quote.delivery_days} días</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enviado</span>
                  <span>
                    {format(new Date(request.my_quote.submitted_at), "d MMM yyyy, HH:mm", { locale: es })}
                  </span>
                </div>
                
                {canEditQuote && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEditQuote?.(request.my_quote!.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => setShowWithdrawDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Retirar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other Quotes (visible to owner if not blind) */}
          {request.is_owner && otherQuotes.length > 0 && (
            <Collapsible open={quotesExpanded} onOpenChange={setQuotesExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between mb-3">
                  <span className="font-medium">
                    Presupuestos recibidos ({otherQuotes.length})
                  </span>
                  {quotesExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                {otherQuotes.map((quote) => (
                  <Card key={quote.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      {/* Agent info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {quote.agent_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{quote.agent_name}</p>
                            {quote.agent_rating && (
                              <p className="text-xs text-muted-foreground">
                                ⭐ {quote.agent_rating.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={QUOTE_STATUS_CONFIG[quote.status].color}>
                          {QUOTE_STATUS_CONFIG[quote.status].label}
                        </Badge>
                      </div>

                      {/* Quote details */}
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground text-xs">Monto</span>
                          <p className="font-semibold">
                            {formatCurrency(quote.amount, quote.currency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Plazo</span>
                          <p className="font-medium">{quote.delivery_days} días</p>
                        </div>
                      </div>

                      {quote.message && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mb-3">
                          "{quote.message}"
                        </p>
                      )}

                      {/* Actions for owner */}
                      {quote.status === 'submitted' && request.status !== 'cancelled' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => onAcceptQuote?.(quote.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aceptar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => onRejectQuote?.(quote.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAskQuestion?.(quote.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          <Separator className="my-4" />

          {/* Main Actions */}
          <div className="space-y-3">
            {/* Submit quote (if agent and hasn't submitted) */}
            {canSubmitQuote && (
              <Button className="w-full" onClick={() => onSubmitQuote?.(request.id)}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Presupuesto
              </Button>
            )}

            {/* Cancel request (if owner) */}
            {request.is_owner && request.status === 'open' && (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Cancelar Solicitud
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Request Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cancelará la solicitud "{request.reference}" y se notificará a los agentes que hayan enviado presupuestos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancelRequest?.(request.id);
                setShowCancelDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar solicitud
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Withdraw Quote Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Retirar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se retirará tu presupuesto de esta solicitud. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onWithdrawQuote?.(request.my_quote!.id);
                setShowWithdrawDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirar presupuesto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
