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

// Type configuration
const TYPE_CONFIG: Record<string, { label: string; icon: string; gradient: string }> = {
  TM_NAT: { label: 'Marca Nacional', icon: '®️', gradient: 'from-blue-600 via-blue-700 to-indigo-800' },
  TM_EU: { label: 'Marca UE', icon: '®️', gradient: 'from-indigo-600 via-indigo-700 to-violet-800' },
  TM_INT: { label: 'Marca Internacional', icon: '®️', gradient: 'from-violet-600 via-violet-700 to-purple-800' },
  PT_NAT: { label: 'Patente Nacional', icon: '⚙️', gradient: 'from-purple-600 via-purple-700 to-fuchsia-800' },
  PT_EU: { label: 'Patente Europea', icon: '⚙️', gradient: 'from-fuchsia-600 via-fuchsia-700 to-pink-800' },
  PT_PCT: { label: 'Patente PCT', icon: '⚙️', gradient: 'from-pink-600 via-pink-700 to-rose-800' },
  UM: { label: 'Modelo Utilidad', icon: '🔧', gradient: 'from-amber-600 via-amber-700 to-orange-800' },
  DS_NAT: { label: 'Diseño Nacional', icon: '✏️', gradient: 'from-rose-600 via-rose-700 to-red-800' },
  DS_EU: { label: 'Diseño Comunitario', icon: '✏️', gradient: 'from-red-600 via-red-700 to-rose-800' },
  DOM: { label: 'Dominio', icon: '🌐', gradient: 'from-teal-600 via-teal-700 to-cyan-800' },
  NC: { label: 'Nombre Comercial', icon: '🏢', gradient: 'from-emerald-600 via-emerald-700 to-green-800' },
  OPO: { label: 'Oposición', icon: '⚖️', gradient: 'from-orange-600 via-orange-700 to-amber-800' },
  VIG: { label: 'Vigilancia', icon: '👁️', gradient: 'from-cyan-600 via-cyan-700 to-teal-800' },
  LIT: { label: 'Litigio', icon: '🏛️', gradient: 'from-slate-600 via-slate-700 to-gray-800' },
  trademark: { label: 'Marca', icon: '®️', gradient: 'from-blue-600 via-blue-700 to-indigo-800' },
  patent: { label: 'Patente', icon: '⚙️', gradient: 'from-purple-600 via-purple-700 to-fuchsia-800' },
  design: { label: 'Diseño', icon: '✏️', gradient: 'from-rose-600 via-rose-700 to-red-800' },
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
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        typeConfig.gradient
      )} />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 px-6 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app/expedientes')}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Expedientes
          </Button>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <div className="flex items-center gap-1 mr-2 border-r border-white/20 pr-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEmailClick}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar Email</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onWhatsAppClick}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>WhatsApp</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCallClick}
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
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
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Star className={cn("h-4 w-4", isStarred && "fill-yellow-400 text-yellow-400")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isStarred ? 'Quitar de favoritos' : 'Añadir a favoritos'}</TooltipContent>
            </Tooltip>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/app/expedientes/${matter.id}/editar`)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
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

        {/* Main Info */}
        <div className="flex items-start gap-6 mb-8">
          {/* Type Icon */}
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-4xl shadow-xl">
            {typeConfig.icon}
          </div>

          <div className="flex-1">
            {/* Number and Badges */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-white">
                {matter.matter_number || matter.reference}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {typeConfig.label}
              </Badge>
              <Badge 
                variant="secondary"
                className={cn(
                  "border-transparent",
                  statusConfig.variant === 'success' && "bg-emerald-500/80 text-white",
                  statusConfig.variant === 'warning' && "bg-amber-500/80 text-white",
                  statusConfig.variant === 'destructive' && "bg-red-500/80 text-white",
                  statusConfig.variant === 'default' && "bg-white/20 text-white"
                )}
              >
                {statusConfig.variant === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {statusConfig.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="bg-red-500 animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  VENCIDO
                </Badge>
              )}
              {isUrgent && !isOverdue && (
                <Badge variant="destructive" className="bg-amber-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysRemaining === 0 ? 'HOY' : `${daysRemaining}d`}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-white mb-3">
              {matter.title || matter.mark_name || 'Sin título'}
            </h1>

            {/* Subtitle with Client and Jurisdiction */}
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                {matter.client_name || 'Sin cliente'}
              </span>
              <span className="flex items-center gap-1.5">
                {jurisdictionConfig.flag}
                {jurisdictionConfig.name}
              </span>
              {matter.nice_classes && matter.nice_classes.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium">Clases:</span>
                  {matter.nice_classes.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =============================================== */}
        {/* WORKFLOW METRO MAP */}
        {/* =============================================== */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white">Progreso del Expediente</span>
            </div>
            <span className="text-sm text-white/70">
              {Math.round(progressPercent)}% completado
            </span>
          </div>

          {/* Metro Map */}
          <div className="relative h-16">
            {/* Base Line */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full" />
            
            {/* Progress Line */}
            <div 
              className="absolute top-4 left-4 h-1 bg-white rounded-full transition-all duration-500"
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
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                            isCompleted && "bg-white text-blue-600",
                            isCurrent && "bg-white text-blue-600 ring-4 ring-white/30 shadow-lg scale-110",
                            isFuture && "bg-white/30 text-white/60"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Zap className="h-4 w-4" />
                          ) : (
                            <span>{index}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] mt-1.5 whitespace-nowrap",
                            isCurrent ? "text-white font-medium" : "text-white/60"
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-white" />
              <span className="text-sm text-white">
                Fase actual: <strong>{PHASES[phaseIndex]?.label || 'Desconocida'}</strong>
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              Avanzar fase <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
