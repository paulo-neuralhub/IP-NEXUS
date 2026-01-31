// ============================================================
// IP-NEXUS - Matter Detail Sidebar (L123 Redesign)
// Sidebar with alerts, client actions, dates, billing
// ============================================================

import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow, differenceInDays, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle, Calendar, Building2, Euro, Mail, Phone,
  MessageCircle, Clock, FileText, Plus, ChevronRight, Star,
  CheckCircle2, XCircle, Upload, TrendingUp, CheckSquare,
  History, Zap, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MatterV2 } from '@/hooks/use-matters-v2';

interface MatterStats {
  documentos: number;
  comunicaciones: number;
  tareas: number;
  tareasPendientes: number;
  facturado: number;
  pendienteCobro: number;
}

interface MatterDetailSidebarProps {
  matter: MatterV2;
  stats: MatterStats | undefined;
  lastActivityDate?: string;
  onEmailClick?: () => void;
  onWhatsAppClick?: () => void;
  onCallClick?: () => void;
  onAddDeadline?: () => void;
  onUploadDocument?: () => void;
  onNewInvoice?: () => void;
}

export function MatterDetailSidebar({
  matter,
  stats,
  lastActivityDate,
  onEmailClick,
  onWhatsAppClick,
  onCallClick,
  onAddDeadline,
  onUploadDocument,
  onNewInvoice,
}: MatterDetailSidebarProps) {
  const navigate = useNavigate();

  // Calculate deadline info
  const nextDeadline = (matter.custom_fields as any)?.next_deadline;
  const daysRemaining = nextDeadline ? differenceInDays(new Date(nextDeadline), new Date()) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Billing calculations
  const budget = (matter.estimated_official_fees || 0) + (matter.estimated_professional_fees || 0);
  const facturado = stats?.facturado || 0;
  const cobrado = facturado - (stats?.pendienteCobro || 0);
  const billingProgress = budget > 0 ? (facturado / budget) * 100 : 0;

  // Calculate alerts
  type AlertItem = {
    type: 'warning' | 'error';
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
  
  const alertas: AlertItem[] = [];

  // Alert: No deadline
  if (!nextDeadline) {
    alertas.push({
      type: 'warning',
      title: 'Sin plazo definido',
      description: 'El expediente no tiene fecha límite',
      action: onAddDeadline ? { label: '+ Añadir plazo', onClick: onAddDeadline } : undefined
    });
  }

  // Alert: Overdue deadline
  if (isOverdue) {
    const diasVencido = Math.abs(daysRemaining!);
    alertas.push({
      type: 'error',
      title: 'Plazo vencido',
      description: `El plazo venció hace ${diasVencido} días`,
      action: onAddDeadline ? { label: 'Gestionar', onClick: onAddDeadline } : undefined
    });
  }

  // Alert: No documents
  if ((stats?.documentos || 0) === 0) {
    alertas.push({
      type: 'warning',
      title: 'Sin documentos',
      description: 'No hay documentos adjuntos',
      action: onUploadDocument ? { label: '📎 Subir', onClick: onUploadDocument } : undefined
    });
  }

  // Alert: Many pending tasks
  if ((stats?.tareasPendientes || 0) > 3) {
    alertas.push({
      type: 'warning',
      title: `${stats?.tareasPendientes} tareas pendientes`,
      description: 'Hay varias tareas sin completar'
    });
  }

  return (
    <div className="space-y-4">
      
      {/* ======================================= */}
      {/* ALERTS */}
      {/* ======================================= */}
      {alertas.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Alertas
              </span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                {alertas.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertas.map((alerta, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3 p-2.5 rounded-lg",
                  alerta.type === 'error' 
                    ? "bg-red-100/80 dark:bg-red-900/30" 
                    : "bg-amber-100/80 dark:bg-amber-900/30"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {alerta.type === 'error' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    alerta.type === 'error' ? "text-red-800 dark:text-red-200" : "text-amber-800 dark:text-amber-200"
                  )}>
                    {alerta.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {alerta.description}
                  </p>
                  {alerta.action && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs mt-1"
                      onClick={alerta.action.onClick}
                    >
                      {alerta.action.label}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ======================================= */}
      {/* CLIENT */}
      {/* ======================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-blue-500" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matter.client_id && matter.client_name ? (
            <div className="space-y-3">
              {/* Client info */}
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-sm font-semibold">
                    {matter.client_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{matter.client_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {matter.is_urgent && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-[10px] px-1.5 py-0">
                        <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                        VIP
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Desde {format(new Date(matter.created_at), 'yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-sm">
                {matter.client_email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{matter.client_email}</span>
                  </div>
                )}
                {matter.client_phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{matter.client_phone}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action buttons */}
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={onEmailClick}
                    >
                      <Mail className="h-4 w-4 mr-1.5 text-blue-500" />
                      Email
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar email</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={onWhatsAppClick}
                    >
                      <MessageCircle className="h-4 w-4 mr-1.5 text-green-500" />
                      WA
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Enviar WhatsApp</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={onCallClick}
                    >
                      <Phone className="h-4 w-4 mr-1.5 text-purple-500" />
                      Llamar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Llamar al cliente</TooltipContent>
                </Tooltip>
              </div>

              {/* Link to client */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between h-8 text-muted-foreground hover:text-foreground"
                onClick={() => navigate(`/app/crm/clients/${matter.client_id}`)}
              >
                Ver ficha completa
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Building2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Sin cliente asignado</p>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Asignar cliente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* KEY DATES */}
      {/* ======================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-purple-500" />
            Fechas Clave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Created */}
          <DateRow
            label="Creado"
            date={matter.created_at}
            showRelative
          />

          {/* Next deadline */}
          {nextDeadline ? (
            <DateRow
              label="Próximo plazo"
              date={nextDeadline}
              showRelative
              highlight={daysRemaining !== null && daysRemaining <= 7 && !isOverdue}
              danger={isOverdue}
            />
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próximo plazo</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-amber-600 hover:text-amber-700"
                onClick={onAddDeadline}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                No definido · Añadir
              </Button>
            </div>
          )}

          {/* Priority date */}
          {matter.priority_date && (
            <DateRow
              label="Prioridad"
              date={matter.priority_date}
              showRelative
            />
          )}

          {/* Instruction date */}
          {matter.instruction_date && (
            <DateRow
              label="Instrucción"
              date={matter.instruction_date}
            />
          )}

          {/* Last activity */}
          {lastActivityDate && (
            <DateRow
              label="Última actividad"
              date={lastActivityDate}
              showRelative
            />
          )}
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* BILLING */}
      {/* ======================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Euro className="h-4 w-4 text-emerald-500" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {budget > 0 ? (
            <>
              {/* Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Presupuestado</span>
                  <span className="font-semibold">€{budget.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(billingProgress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(billingProgress)}% facturado
                </p>
              </div>

              <Separator />

              {/* Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Facturado
                  </span>
                  <span className="font-medium text-emerald-600">
                    €{facturado.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    Cobrado
                  </span>
                  <span className="font-medium text-blue-600">
                    €{cobrado.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    Pendiente cobro
                  </span>
                  <span className="font-medium text-amber-600">
                    €{(stats?.pendienteCobro || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Sin presupuesto definido</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onNewInvoice}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva factura
          </Button>
        </CardContent>
      </Card>

      {/* ======================================= */}
      {/* QUICK SUMMARY */}
      {/* ======================================= */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" />
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Documentos"
              value={stats?.documentos || 0}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatBox
              label="Tareas"
              value={stats?.tareasPendientes || 0}
              icon={<CheckSquare className="h-4 w-4" />}
              highlight={(stats?.tareasPendientes || 0) > 0}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for date rows with relative time
function DateRow({
  label,
  date,
  showRelative = false,
  highlight = false,
  danger = false
}: {
  label: string;
  date: string;
  showRelative?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) {
  const dateObj = new Date(date);
  const isPastDate = isPast(dateObj);
  const isToday = differenceInDays(new Date(), dateObj) === 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <p className={cn(
          "font-medium",
          highlight && "text-amber-600 dark:text-amber-400",
          danger && "text-red-600 dark:text-red-400"
        )}>
          {format(dateObj, "d MMM yyyy", { locale: es })}
        </p>
        {showRelative && (
          <p className={cn(
            "text-[11px]",
            danger ? "text-red-500" : "text-muted-foreground"
          )}>
            {isToday 
              ? 'Hoy'
              : isPastDate
                ? `hace ${formatDistanceToNow(dateObj, { locale: es })}`
                : `faltan ${formatDistanceToNow(dateObj, { locale: es })}`
            }
          </p>
        )}
      </div>
    </div>
  );
}

// Helper component for stats
function StatBox({
  label,
  value,
  icon,
  highlight = false
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center p-3 rounded-lg border",
      highlight 
        ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" 
        : "bg-muted/50"
    )}>
      <div className={cn(
        "mb-1",
        highlight ? "text-amber-600" : "text-muted-foreground"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-xl font-bold",
        highlight && "text-amber-700 dark:text-amber-300"
      )}>
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
