// ============================================================
// IP-NEXUS - Matter Detail Sidebar (Premium Redesign L119)
// Right sidebar with quick stats, client, dates, billing
// ============================================================

import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock, FileText, CheckSquare, History,
  Building2, ChevronRight, Euro, Calendar,
  AlertTriangle, Zap, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
}

export function MatterDetailSidebar({
  matter,
  stats,
  lastActivityDate,
}: MatterDetailSidebarProps) {
  const navigate = useNavigate();

  // Calculate deadline info
  const nextDeadline = (matter.custom_fields as any)?.next_deadline;
  const daysRemaining = nextDeadline ? differenceInDays(new Date(nextDeadline), new Date()) : null;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Billing calculations
  const budget = matter.estimated_official_fees || 0 + (matter.estimated_professional_fees || 0);
  const facturado = stats?.facturado || 0;
  const billingProgress = budget > 0 ? (facturado / budget) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Quick Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-500" />
            Resumen Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Next Deadline */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Próximo plazo
            </span>
            <span className={cn(
              "text-sm font-medium",
              isOverdue ? "text-destructive" : 
              (daysRemaining !== null && daysRemaining <= 7) ? "text-amber-600" : ""
            )}>
              {nextDeadline 
                ? isOverdue 
                  ? `${Math.abs(daysRemaining!)}d vencido`
                  : `${daysRemaining}d`
                : 'Sin plazo'}
            </span>
          </div>

          {/* Pending Tasks */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckSquare className="h-4 w-4" />
              Tareas pendientes
            </span>
            <span className={cn(
              "text-sm font-medium",
              stats?.tareasPendientes && stats.tareasPendientes > 0 && "text-amber-600"
            )}>
              {stats?.tareasPendientes || 0}
            </span>
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Documentos
            </span>
            <span className="text-sm font-medium">{stats?.documentos || 0}</span>
          </div>

          {/* Last Activity */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              Última actividad
            </span>
            <span className="text-sm text-muted-foreground">
              {lastActivityDate 
                ? format(new Date(lastActivityDate), 'd MMM', { locale: es })
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Client */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-blue-500" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matter.client_id && matter.client_name ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {matter.client_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{matter.client_name}</p>
                  {matter.client_email && (
                    <p className="text-sm text-muted-foreground truncate">{matter.client_email}</p>
                  )}
                </div>
              </div>
              
              {matter.client_phone && (
                <p className="text-sm text-muted-foreground">{matter.client_phone}</p>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate(`/app/crm/clients/${matter.client_id}`)}
              >
                Ver ficha cliente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin cliente asignado</p>
          )}
        </CardContent>
      </Card>

      {/* Key Dates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-purple-500" />
            Fechas Clave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <DateRow 
            label="Creado" 
            date={matter.created_at} 
          />
          {matter.instruction_date && (
            <DateRow 
              label="Instrucción" 
              date={matter.instruction_date} 
            />
          )}
          {matter.priority_date && (
            <DateRow 
              label="Prioridad" 
              date={matter.priority_date} 
            />
          )}
          {nextDeadline && (
            <DateRow 
              label="Próximo plazo" 
              date={nextDeadline}
              highlight={daysRemaining !== null && daysRemaining <= 7 && !isOverdue}
              danger={isOverdue}
            />
          )}
        </CardContent>
      </Card>

      {/* Billing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Euro className="h-4 w-4 text-emerald-500" />
            Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Presupuestado</span>
            <span className="font-medium">
              €{budget.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Facturado</span>
            <span className="font-medium text-emerald-600">
              €{facturado.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pendiente</span>
            <span className="font-medium text-amber-600">
              €{(stats?.pendienteCobro || 0).toLocaleString()}
            </span>
          </div>
          
          <Separator />
          
          <div className="space-y-1.5">
            <Progress value={Math.min(billingProgress, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {budget > 0 
                ? `${Math.round(billingProgress)}% del presupuesto facturado`
                : 'Sin presupuesto definido'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for date rows
function DateRow({ 
  label, 
  date, 
  highlight, 
  danger 
}: { 
  label: string; 
  date: string; 
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-medium",
        highlight && "text-amber-600",
        danger && "text-destructive"
      )}>
        {format(new Date(date), 'd MMM yyyy', { locale: es })}
      </span>
    </div>
  );
}
