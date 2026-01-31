// ============================================================
// IP-NEXUS - Matter Detail Header (Premium Redesign L119)
// Full-width hero with gradient, metro workflow, quick actions
// ============================================================

import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Mail, Phone, MessageCircle, Edit, MoreHorizontal,
  Star, Building2, ChevronRight, Copy, Download, Share2,
  Archive, Trash2, CheckCircle2, AlertTriangle, Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { MatterV2 } from '@/hooks/use-matters-v2';

// Type configuration - colors for icon accents only
const TYPE_CONFIG: Record<string, { label: string; icon: string; borderColor: string; textColor: string; bgLight: string }> = {
  TM_NAT: { label: 'Marca Nacional', icon: '®️', borderColor: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950' },
  TM_EU: { label: 'Marca UE', icon: '®️', borderColor: 'border-indigo-200 dark:border-indigo-800', textColor: 'text-indigo-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950' },
  TM_INT: { label: 'Marca Internacional', icon: '®️', borderColor: 'border-violet-200 dark:border-violet-800', textColor: 'text-violet-600', bgLight: 'bg-violet-50 dark:bg-violet-950' },
  PT_NAT: { label: 'Patente Nacional', icon: '⚙️', borderColor: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-950' },
  PT_EU: { label: 'Patente Europea', icon: '⚙️', borderColor: 'border-fuchsia-200 dark:border-fuchsia-800', textColor: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950' },
  PT_PCT: { label: 'Patente PCT', icon: '⚙️', borderColor: 'border-pink-200 dark:border-pink-800', textColor: 'text-pink-600', bgLight: 'bg-pink-50 dark:bg-pink-950' },
  UM: { label: 'Modelo Utilidad', icon: '🔧', borderColor: 'border-amber-200 dark:border-amber-800', textColor: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-950' },
  DS_NAT: { label: 'Diseño Nacional', icon: '✏️', borderColor: 'border-rose-200 dark:border-rose-800', textColor: 'text-rose-600', bgLight: 'bg-rose-50 dark:bg-rose-950' },
  DS_EU: { label: 'Diseño Comunitario', icon: '✏️', borderColor: 'border-red-200 dark:border-red-800', textColor: 'text-red-600', bgLight: 'bg-red-50 dark:bg-red-950' },
  DOM: { label: 'Dominio', icon: '🌐', borderColor: 'border-teal-200 dark:border-teal-800', textColor: 'text-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-950' },
  NC: { label: 'Nombre Comercial', icon: '🏢', borderColor: 'border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950' },
  OPO: { label: 'Oposición', icon: '⚖️', borderColor: 'border-orange-200 dark:border-orange-800', textColor: 'text-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-950' },
  VIG: { label: 'Vigilancia', icon: '👁️', borderColor: 'border-cyan-200 dark:border-cyan-800', textColor: 'text-cyan-600', bgLight: 'bg-cyan-50 dark:bg-cyan-950' },
  LIT: { label: 'Litigio', icon: '🏛️', borderColor: 'border-slate-200 dark:border-slate-700', textColor: 'text-slate-600', bgLight: 'bg-slate-100 dark:bg-slate-800' },
  trademark: { label: 'Marca', icon: '®️', borderColor: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950' },
  patent: { label: 'Patente', icon: '⚙️', borderColor: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-950' },
  design: { label: 'Diseño', icon: '✏️', borderColor: 'border-rose-200 dark:border-rose-800', textColor: 'text-rose-600', bgLight: 'bg-rose-50 dark:bg-rose-950' },
};

// Workflow phases
const PHASES = [
  { key: 'F0', label: 'Apertura', shortLabel: 'Apert.' },
  { key: 'F1', label: 'Análisis', shortLabel: 'Anális.' },
  { key: 'F2', label: 'Presupuesto', shortLabel: 'Presup.' },
  { key: 'F3', label: 'Contratación', shortLabel: 'Contrat.' },
  { key: 'F4', label: 'Preparación', shortLabel: 'Prepar.' },
  { key: 'F5', label: 'Presentación', shortLabel: 'Present.' },
  { key: 'F6', label: 'Examen', shortLabel: 'Examen' },
  { key: 'F7', label: 'Publicación', shortLabel: 'Public.' },
  { key: 'F8', label: 'Resolución', shortLabel: 'Resoluc.' },
  { key: 'F9', label: 'Post-servicio', shortLabel: 'Post.' },
];

// Jurisdiction flags
const JURISDICTION_FLAGS: Record<string, { flag: string; name: string }> = {
  ES: { flag: '🇪🇸', name: 'España' },
  EU: { flag: '🇪🇺', name: 'Unión Europea' },
  EUIPO: { flag: '🇪🇺', name: 'EUIPO' },
  EP: { flag: '🇪🇺', name: 'EPO' },
  US: { flag: '🇺🇸', name: 'Estados Unidos' },
  WIPO: { flag: '🌐', name: 'WIPO' },
  GB: { flag: '🇬🇧', name: 'Reino Unido' },
  DE: { flag: '🇩🇪', name: 'Alemania' },
  FR: { flag: '🇫🇷', name: 'Francia' },
  CN: { flag: '🇨🇳', name: 'China' },
  JP: { flag: '🇯🇵', name: 'Japón' },
};

// Status config
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' }> = {
  draft: { label: 'Borrador', variant: 'default' },
  pending: { label: 'Pendiente', variant: 'warning' },
  filed: { label: 'Presentado', variant: 'default' },
  published: { label: 'Publicado', variant: 'default' },
  granted: { label: 'Concedido', variant: 'success' },
  active: { label: 'Activo', variant: 'success' },
  opposed: { label: 'En oposición', variant: 'destructive' },
  expired: { label: 'Expirado', variant: 'default' },
  abandoned: { label: 'Abandonado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

interface MatterDetailHeaderProps {
  matter: MatterV2;
  onEmailClick: () => void;
  onWhatsAppClick: () => void;
  onCallClick: () => void;
  onDeleteClick: () => void;
}

export function MatterDetailHeader({
  matter,
  onEmailClick,
  onWhatsAppClick,
  onCallClick,
  onDeleteClick,
}: MatterDetailHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current phase from custom_fields or default
  const currentPhase = (matter.custom_fields as any)?.current_phase || 'F0';
  const phaseIndex = PHASES.findIndex(p => p.key === currentPhase);
  const progressPercent = ((phaseIndex + 1) / PHASES.length) * 100;

  // Type and jurisdiction config
  const typeConfig = TYPE_CONFIG[matter.matter_type] || TYPE_CONFIG.trademark;
  const jurisdictionConfig = JURISDICTION_FLAGS[matter.jurisdiction_primary || 'ES'] || { flag: '🌐', name: matter.jurisdiction_primary };
  const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.active;

  // Calculate urgency
  const nextDeadline = (matter.custom_fields as any)?.next_deadline;
  const daysRemaining = nextDeadline ? differenceInDays(new Date(nextDeadline), new Date()) : null;
  const isUrgent = matter.is_urgent || (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const isStarred = (matter.custom_fields as any)?.is_starred || false;
      const { error } = await supabase
        .from('matters')
        .update({ 
          custom_fields: { 
            ...matter.custom_fields, 
            is_starred: !isStarred 
          } 
        })
        .eq('id', matter.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-v2', matter.id] });
      const wasStarred = (matter.custom_fields as any)?.is_starred;
      toast.success(wasStarred ? 'Quitado de favoritos' : 'Añadido a favoritos');
    },
  });

  const isStarred = (matter.custom_fields as any)?.is_starred || false;

  return (
    <div className="bg-background border-b">

      {/* Top Bar - Navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/expedientes')}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Expedientes
        </Button>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="flex items-center gap-1 mr-2 border-r pr-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onEmailClick} className="h-8 w-8">
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Enviar Email</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onWhatsAppClick} className="h-8 w-8">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>WhatsApp</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onCallClick} className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Llamar</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite.mutate()}
                className="h-8 w-8"
              >
                <Star className={cn("h-4 w-4", isStarred && "fill-amber-400 text-amber-400")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isStarred ? 'Quitar de favoritos' : 'Añadir a favoritos'}</TooltipContent>
          </Tooltip>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/expedientes/${matter.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" /> Duplicar expediente
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" /> Compartir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" /> Archivar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDeleteClick}>
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-5">
          {/* Type Icon - with subtle color accent */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2",
            typeConfig.bgLight,
            typeConfig.borderColor
          )}>
            {typeConfig.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Number and Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-sm text-muted-foreground">
                {matter.matter_number || matter.reference}
              </span>
              <Badge variant="secondary" className={cn("text-xs", typeConfig.bgLight, typeConfig.textColor)}>
                {typeConfig.label}
              </Badge>
              <Badge 
                variant={statusConfig.variant === 'success' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs",
                  statusConfig.variant === 'success' && "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                  statusConfig.variant === 'warning' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
                  statusConfig.variant === 'destructive' && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                )}
              >
                {statusConfig.variant === 'success' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                )}
                {statusConfig.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Vencido
                </Badge>
              )}
              {isUrgent && !isOverdue && (
                <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysRemaining === 0 ? 'Hoy' : `${daysRemaining}d`}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2 truncate">
              {matter.title || matter.mark_name || 'Sin título'}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {matter.client_name || 'Sin cliente'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-base">{jurisdictionConfig.flag}</span>
                {jurisdictionConfig.name}
              </span>
              {matter.nice_classes && matter.nice_classes.length > 0 && (
                <span className="flex items-center gap-1.5">
                  Clases: {matter.nice_classes.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =============================================== */}
      {/* WORKFLOW METRO MAP - In separate Card */}
      {/* =============================================== */}
      <div className="px-6 pb-4">
        <div className="bg-muted/30 rounded-xl border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progreso del Expediente</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercent)}% completado
            </span>
          </div>

          {/* Metro Map */}
          <div className="relative h-16">
            {/* Base Line */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-border rounded-full" />
            
            {/* Progress Line */}
            <div 
              className={cn(
                "absolute top-4 left-4 h-1 rounded-full transition-all duration-500",
                typeConfig.textColor.replace('text-', 'bg-')
              )}
              style={{ width: `calc(${progressPercent}% - 32px)` }}
            />

            {/* Nodes */}
            <div className="absolute top-0 left-4 right-4 flex justify-between">
              {PHASES.map((phase, index) => {
                const isCompleted = index < phaseIndex;
                const isCurrent = index === phaseIndex;
                const isFuture = index > phaseIndex;

                return (
                  <Tooltip key={phase.key}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center cursor-pointer">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 border-2",
                            isCompleted && "bg-green-500 border-green-500 text-white",
                            isCurrent && cn(
                              "bg-background border-2",
                              typeConfig.borderColor,
                              typeConfig.textColor,
                              "ring-4 ring-offset-2",
                              typeConfig.bgLight.replace('bg-', 'ring-').replace(' dark:', ' dark:ring-')
                            ),
                            isFuture && "bg-muted border-border text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <span>{index}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] mt-1.5 whitespace-nowrap",
                            isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                          )}
                        >
                          {phase.shortLabel}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{phase.key}: {phase.label}</p>
                      {isCurrent && <p className="text-xs text-muted-foreground">Fase actual</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Current Phase Highlight */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", typeConfig.textColor.replace('text-', 'bg-'))} />
              <span className="text-sm">
                Fase actual: <strong>{PHASES[phaseIndex]?.label || 'Desconocida'}</strong>
              </span>
            </div>
            <Button size="sm" variant="outline">
              Avanzar fase <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
