// ============================================================
// IP-NEXUS - Matter Detail Sidebar (SILK Design System)
// Neumorphic sidebar with client card + insight banners
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
      {/* ALERTS - SILK Insight Banners */}
      {/* ======================================= */}
      {alertas.length > 0 && (
        <div className="space-y-3">
          {alertas.map((alerta, index) => {
            const isError = alerta.type === 'error';
            const accentColor = isError ? '#ef4444' : '#f59e0b';
            
            return (
              <div
                key={index}
                className="flex items-start gap-3"
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: '#f1f4f9',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderLeft: `3px solid ${accentColor}`,
                }}
              >
                {/* Icon in SILK square */}
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    {isError ? '🚨' : '⚠️'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#0a2540', marginBottom: '3px' }}>
                    {alerta.title}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    {alerta.description}
                  </p>
                  {alerta.action && (
                    <button
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{ 
                        background: `${accentColor}12`,
                        color: accentColor,
                        border: `1px solid ${accentColor}20`
                      }}
                      onClick={alerta.action.onClick}
                    >
                      {alerta.action.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================= */}
      {/* CLIENT - SILK Card */}
      {/* ======================================= */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9'
        }}
      >
        {matter.client_id && matter.client_name ? (
          <>
            {/* Corporate badge */}
            <div 
              className="flex items-center gap-2 mb-4"
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(0, 180, 216, 0.06)',
                border: '1px solid rgba(0, 180, 216, 0.1)'
              }}
            >
              <div 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00b4d8',
                  boxShadow: '0 0 8px rgba(0, 180, 216, 0.5)'
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#00b4d8' }}>
                {matter.is_urgent ? 'Cliente VIP' : 'Cliente Corporativo'}
              </span>
            </div>
            
            {/* Client name */}
            <h3 style={{ 
              fontSize: '17px', 
              fontWeight: 700, 
              color: '#0a2540',
              marginBottom: '12px'
            }}>
              {matter.client_name}
            </h3>
            
            {/* Client data */}
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.8 }}>
              {matter.client_email && (
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: '#94a3b8' }}>✉️</span>
                  <span className="truncate">{matter.client_email}</span>
                </div>
              )}
              {matter.client_phone && (
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: '#94a3b8' }}>📞</span>
                  <span>{matter.client_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span style={{ color: '#94a3b8' }}>📅</span>
                <span>Cliente desde {format(new Date(matter.created_at), 'yyyy')}</span>
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.06)', margin: '14px 0' }} />

            {/* Action buttons - SILK style */}
            <div className="flex gap-2 mb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onEmailClick}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.12)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#3b82f6'
                    }}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </button>
                </TooltipTrigger>
                <TooltipContent>Enviar email</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onWhatsAppClick}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.12)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#22c55e'
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WA
                  </button>
                </TooltipTrigger>
                <TooltipContent>Enviar WhatsApp</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onCallClick}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(0, 180, 216, 0.08)',
                      border: '1px solid rgba(0, 180, 216, 0.12)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#00b4d8'
                    }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Llamar
                  </button>
                </TooltipTrigger>
                <TooltipContent>Llamar al cliente</TooltipContent>
              </Tooltip>
            </div>

            {/* Link to client */}
            <button
              onClick={() => navigate(`/app/crm/clients/${matter.client_id}`)}
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all"
              style={{
                background: 'rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                fontSize: '11px',
                color: '#64748b'
              }}
            >
              <span>Ver ficha completa</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <Building2 className="h-8 w-8 mx-auto mb-2" style={{ color: '#94a3b8' }} />
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Sin cliente asignado</p>
            <Button variant="outline" size="sm" style={{ fontSize: '11px' }}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Asignar cliente
            </Button>
          </div>
        )}
      </div>

      {/* ======================================= */}
      {/* KEY DATES - SILK Card */}
      {/* ======================================= */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4" style={{ color: '#8b5cf6' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>Fechas Clave</span>
        </div>
        
        <div className="space-y-3">
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
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '12px', color: '#64748b' }}>Próximo plazo</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                style={{ fontSize: '11px', color: '#d97706' }}
                onClick={onAddDeadline}
              >
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
        </div>
      </div>

      {/* ======================================= */}
      {/* BILLING - SILK Card */}
      {/* ======================================= */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Euro className="h-4 w-4" style={{ color: '#10b981' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>Facturación</span>
        </div>
        
        <div className="space-y-3">
          {budget > 0 ? (
            <>
              {/* Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Presupuestado</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>€{budget.toLocaleString()}</span>
                </div>
                <div style={{ height: '4px', borderRadius: '3px', background: 'rgba(0,0,0,0.04)' }}>
                  <div style={{
                    width: `${Math.min(billingProgress, 100)}%`,
                    height: '100%',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, #10b981, #10b98188)',
                    boxShadow: '0 0 4px rgba(16, 185, 129, 0.2)'
                  }} />
                </div>
                <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right' }}>
                  {Math.round(billingProgress)}% facturado
                </p>
              </div>

              <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.06)' }} />

              {/* Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#64748b' }}>
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#10b981' }} />
                    Facturado
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                    €{facturado.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#64748b' }}>
                    <TrendingUp className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />
                    Cobrado
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>
                    €{cobrado.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#64748b' }}>
                    <Clock className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
                    Pendiente cobro
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                    €{(stats?.pendienteCobro || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <p style={{ fontSize: '12px', color: '#64748b' }}>Sin presupuesto definido</p>
            </div>
          )}

          <button
            onClick={onNewInvoice}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#10b981'
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva factura
          </button>
        </div>
      </div>

      {/* ======================================= */}
      {/* QUICK SUMMARY - SILK Card */}
      {/* ======================================= */}
      <div 
        style={{
          padding: '20px',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          background: '#f1f4f9'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4" style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>Resumen</span>
        </div>
        
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
      </div>
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
    <div className="flex items-center justify-between">
      <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
      <div className="text-right">
        <p style={{ 
          fontSize: '12px', 
          fontWeight: 500, 
          color: danger ? '#dc2626' : highlight ? '#d97706' : '#0a2540' 
        }}>
          {format(dateObj, "d MMM yyyy", { locale: es })}
        </p>
        {showRelative && (
          <p style={{ 
            fontSize: '10px', 
            color: danger ? '#dc2626' : '#94a3b8' 
          }}>
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
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px',
        borderRadius: '10px',
        background: highlight ? 'rgba(245, 158, 11, 0.06)' : 'rgba(255, 255, 255, 0.6)',
        border: highlight ? '1px solid rgba(245, 158, 11, 0.12)' : '1px solid rgba(0, 0, 0, 0.04)'
      }}
    >
      <div style={{ marginBottom: '4px', color: highlight ? '#f59e0b' : '#94a3b8' }}>
        {icon}
      </div>
      <span style={{ fontSize: '20px', fontWeight: 700, color: highlight ? '#f59e0b' : '#0a2540' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', color: '#64748b' }}>{label}</span>
    </div>
  );
}
