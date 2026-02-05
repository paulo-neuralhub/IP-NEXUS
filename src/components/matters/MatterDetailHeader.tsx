// ============================================================
// IP-NEXUS - Matter Detail Header (Enterprise Redesign L130)
// Premium enterprise-level header with enhanced visual hierarchy
// ============================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Mail, Phone, MessageCircle, Edit, MoreHorizontal,
  Star, Building2, Copy, Download, Share2, FileText, Pencil,
  Archive, Trash2, AlertTriangle, Clock, Calendar, User, Globe, Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { WorkflowCards } from './WorkflowCards';
import { PhasePanelContainer } from '@/components/phases';

// Type configuration - colors for icon accents only
const TYPE_CONFIG: Record<string, { label: string; icon: string; borderColor: string; textColor: string; bgLight: string; gradientFrom: string; gradientTo: string }> = {
  TM_NAT: { label: 'Marca Nacional', icon: '®️', borderColor: 'border-cyan-300', textColor: 'text-cyan-700', bgLight: 'bg-cyan-50', gradientFrom: '#00b4d8', gradientTo: '#0891b2' },
  TM_EU: { label: 'Marca UE', icon: '®️', borderColor: 'border-blue-300', textColor: 'text-blue-700', bgLight: 'bg-blue-50', gradientFrom: '#3b82f6', gradientTo: '#2563eb' },
  TM_INT: { label: 'Marca Internacional', icon: '®️', borderColor: 'border-indigo-300', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50', gradientFrom: '#6366f1', gradientTo: '#4f46e5' },
  PT_NAT: { label: 'Patente Nacional', icon: '⚙️', borderColor: 'border-amber-300', textColor: 'text-amber-700', bgLight: 'bg-amber-50', gradientFrom: '#f59e0b', gradientTo: '#d97706' },
  PT_EU: { label: 'Patente Europea', icon: '⚙️', borderColor: 'border-orange-300', textColor: 'text-orange-700', bgLight: 'bg-orange-50', gradientFrom: '#f97316', gradientTo: '#ea580c' },
  PT_PCT: { label: 'Patente PCT', icon: '⚙️', borderColor: 'border-rose-300', textColor: 'text-rose-700', bgLight: 'bg-rose-50', gradientFrom: '#f43f5e', gradientTo: '#e11d48' },
  UM: { label: 'Modelo Utilidad', icon: '🔧', borderColor: 'border-yellow-300', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', gradientFrom: '#eab308', gradientTo: '#ca8a04' },
  DS_NAT: { label: 'Diseño Nacional', icon: '✏️', borderColor: 'border-pink-300', textColor: 'text-pink-700', bgLight: 'bg-pink-50', gradientFrom: '#ec4899', gradientTo: '#db2777' },
  DS_EU: { label: 'Diseño Comunitario', icon: '✏️', borderColor: 'border-fuchsia-300', textColor: 'text-fuchsia-700', bgLight: 'bg-fuchsia-50', gradientFrom: '#d946ef', gradientTo: '#c026d3' },
  DOM: { label: 'Dominio', icon: '🌐', borderColor: 'border-teal-300', textColor: 'text-teal-700', bgLight: 'bg-teal-50', gradientFrom: '#14b8a6', gradientTo: '#0d9488' },
  NC: { label: 'Nombre Comercial', icon: '🏢', borderColor: 'border-emerald-300', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50', gradientFrom: '#10b981', gradientTo: '#059669' },
  OPO: { label: 'Oposición', icon: '⚖️', borderColor: 'border-red-300', textColor: 'text-red-700', bgLight: 'bg-red-50', gradientFrom: '#ef4444', gradientTo: '#dc2626' },
  VIG: { label: 'Vigilancia', icon: '👁️', borderColor: 'border-slate-300', textColor: 'text-slate-700', bgLight: 'bg-slate-50', gradientFrom: '#64748b', gradientTo: '#475569' },
  LIT: { label: 'Litigio', icon: '🏛️', borderColor: 'border-gray-300', textColor: 'text-gray-700', bgLight: 'bg-gray-50', gradientFrom: '#6b7280', gradientTo: '#4b5563' },
  trademark: { label: 'Marca', icon: '®️', borderColor: 'border-cyan-300', textColor: 'text-cyan-700', bgLight: 'bg-cyan-50', gradientFrom: '#00b4d8', gradientTo: '#0891b2' },
  patent: { label: 'Patente', icon: '⚙️', borderColor: 'border-amber-300', textColor: 'text-amber-700', bgLight: 'bg-amber-50', gradientFrom: '#f59e0b', gradientTo: '#d97706' },
  design: { label: 'Diseño', icon: '✏️', borderColor: 'border-pink-300', textColor: 'text-pink-700', bgLight: 'bg-pink-50', gradientFrom: '#ec4899', gradientTo: '#db2777' },
};

// Trademark type labels
const TRADEMARK_TYPE_LABELS: Record<string, string> = {
  nominative: 'Nominativa',
  figurative: 'Figurativa',
  mixed: 'Mixta',
  '3d': 'Tridimensional',
  color: 'De color',
  sound: 'Sonora',
  olfactory: 'Olfativa',
  motion: 'De movimiento',
  position: 'De posición',
};

// Jurisdiction flags
const JURISDICTION_FLAGS: Record<string, { flag: string; name: string }> = {
  ES: { flag: '🇪🇸', name: 'España' },
  EU: { flag: '🇪🇺', name: 'Unión Europea (EUIPO)' },
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

// Status config with enhanced colors
const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string; dotColor?: string }> = {
  draft: { label: 'Borrador', bgColor: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-200' },
  pending: { label: 'Pendiente', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  filed: { label: 'Presentado', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  published: { label: 'Publicado', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200' },
  granted: { label: 'Concedido', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200', dotColor: 'bg-green-500' },
  active: { label: 'Activo', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  opposed: { label: 'En oposición', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  expired: { label: 'Expirado', bgColor: 'bg-gray-50', textColor: 'text-gray-500', borderColor: 'border-gray-200' },
  abandoned: { label: 'Abandonado', bgColor: 'bg-gray-50', textColor: 'text-gray-500', borderColor: 'border-gray-200' },
  cancelled: { label: 'Cancelado', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
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
  
  // State for phase panel
  const [showPhasePanel, setShowPhasePanel] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('F0');

  // Get current phase from direct matter fields (not custom_fields!)
  const currentPhase = matter.current_phase || 'F0';
  const phaseEnteredAt = matter.phase_entered_at;

  // Type and jurisdiction config
  const typeConfig = TYPE_CONFIG[matter.matter_type] || TYPE_CONFIG.trademark;
  const jurisdictionConfig = JURISDICTION_FLAGS[matter.jurisdiction_primary || 'ES'] || { flag: '🌐', name: matter.jurisdiction_primary };
  const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.active;

  // Calculate urgency
  const nextDeadline = (matter.custom_fields as any)?.next_deadline;
  const daysRemaining = nextDeadline ? differenceInDays(new Date(nextDeadline), new Date()) : null;
  const isUrgent = matter.is_urgent || (daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isConfidential = (matter.custom_fields as any)?.is_confidential;

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
  const trademarkType = (matter.custom_fields as any)?.trademark_type;
  const isTrademark = matter.matter_type?.startsWith('TM') || matter.matter_type === 'trademark' || matter.matter_type === 'NC';

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-200">

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/expedientes')}
          className="text-slate-500 hover:text-slate-800 font-medium text-sm -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Expedientes
        </Button>

        {/* Quick Action Icons - Top Right */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite.mutate()}
                className="h-9 w-9 rounded-lg hover:bg-slate-100"
              >
                <Star className={cn("h-4 w-4", isStarred && "fill-amber-400 text-amber-400")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isStarred ? 'Quitar de favoritos' : 'Añadir a favoritos'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onCallClick} className="h-9 w-9 rounded-lg hover:bg-slate-100">
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Llamar</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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

      {/* Main Header Content - Enterprise Design */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-6">
          
          {/* Large Avatar/Logo with Phase Gradient Border */}
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${typeConfig.gradientFrom}, ${typeConfig.gradientTo})`,
              border: `3px solid ${typeConfig.gradientFrom}`,
            }}
          >
            {/* If has mark image, show it */}
            {matter.mark_image_url ? (
              <img 
                src={matter.mark_image_url} 
                alt={matter.title || 'Marca'} 
                className="w-full h-full object-contain p-2 bg-white rounded-xl"
              />
            ) : (
              <span className="filter drop-shadow-md">{typeConfig.icon}</span>
            )}
          </div>

          {/* Main Information */}
          <div className="flex-1 min-w-0">
            {/* Reference Number */}
            <p className="font-mono text-sm text-slate-500 mb-1">
              {matter.matter_number || matter.reference}
            </p>

            {/* Main Title - Most Prominent */}
            <h1 className="text-2xl font-bold text-slate-900 mb-3 truncate">
              {matter.title || matter.mark_name || 'Sin título'}
            </h1>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Type Badge */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                "bg-cyan-50 border-cyan-200 text-cyan-700"
              )}>
                {typeConfig.label}
              </span>

              {/* Trademark Type Badge - Only for trademarks */}
              {isTrademark && trademarkType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 border-blue-200 text-blue-700">
                  {TRADEMARK_TYPE_LABELS[trademarkType] || trademarkType}
                </span>
              )}

              {/* Status Badge with animated dot */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                statusConfig.bgColor, statusConfig.borderColor, statusConfig.textColor
              )}>
                {statusConfig.dotColor && (
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusConfig.dotColor)} />
                )}
                {statusConfig.label}
              </span>

              {/* Urgent Badge */}
              {isUrgent && !isOverdue && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 border-amber-200 text-amber-700">
                  <AlertTriangle className="h-3 w-3" />
                  {daysRemaining === 0 ? 'Vence hoy' : `${daysRemaining}d restantes`}
                </span>
              )}

              {/* Overdue Badge */}
              {isOverdue && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-50 border-red-200 text-red-700 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  Vencido
                </span>
              )}

              {/* Confidential Badge */}
              {isConfidential && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 border-amber-200 text-amber-700">
                  🔒 Confidencial
                </span>
              )}
            </div>

            {/* Metadata Line */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              {/* Client - Clickable */}
              {matter.client_id ? (
                <Link 
                  to={`/app/clientes/${matter.client_id}`}
                  className="flex items-center gap-1.5 hover:text-cyan-600 transition-colors group"
                >
                  <User className="h-4 w-4 text-slate-400 group-hover:text-cyan-500" />
                  <span className="group-hover:underline">{matter.client_name || 'Sin cliente'}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  {matter.client_name || 'Sin cliente'}
                </span>
              )}

              {/* Jurisdiction with Flag */}
              <span className="flex items-center gap-1.5">
                <span className="text-base">{jurisdictionConfig.flag}</span>
                {jurisdictionConfig.name}
              </span>

              {/* Creation Date */}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                {format(new Date(matter.created_at), 'd MMM yyyy', { locale: es })}
              </span>

              {/* Internal Reference if exists */}
              {matter.reference && matter.reference !== matter.matter_number && (
                <span className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-slate-400" />
                  {matter.reference}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onEmailClick}
            className="border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center mr-2">
              <Mail className="h-3.5 w-3.5 text-blue-600" />
            </div>
            Email
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onWhatsAppClick}
            className="border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center mr-2">
              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
            </div>
            WhatsApp
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Open document generator */}}
            className="border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center mr-2">
              <FileText className="h-3.5 w-3.5 text-amber-600" />
            </div>
            Documento
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/expedientes/${matter.id}/editar`)}
            className="border-slate-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-50 hover:shadow-sm"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center mr-2">
              <Pencil className="h-3.5 w-3.5 text-slate-600" />
            </div>
            Editar
          </Button>
        </div>
      </div>

      {/* =============================================== */}
      {/* WORKFLOW CARDS - New L122 Design */}
      {/* =============================================== */}
      <div className="px-6 pb-4">
        <WorkflowCards
          currentPhase={currentPhase}
          expedienteId={matter.id}
          matterReference={matter.matter_number || matter.reference || ''}
          phaseEnteredAt={phaseEnteredAt}
          typeColor={typeConfig.textColor}
          onPhaseClick={(phase) => {
            setSelectedPhase(phase);
            setShowPhasePanel(true);
          }}
        />
      </div>

      {/* =============================================== */}
      {/* PHASE PANEL MODAL */}
      {/* =============================================== */}
      <PhasePanelContainer
        open={showPhasePanel}
        onOpenChange={setShowPhasePanel}
        matterId={matter.id}
        matterReference={matter.matter_number || matter.reference || ''}
        matterTitle={matter.title || matter.mark_name || 'Sin título'}
        currentPhase={selectedPhase}
        clientId={matter.client_id}
        clientName={matter.client_name}
        clientEmail={matter.client_email}
        clientPhone={matter.client_phone}
        onAdvancePhase={() => {
          // Close panel after advance
          setShowPhasePanel(false);
        }}
        onGoBack={() => {
          // Could navigate to previous phase or close
          setShowPhasePanel(false);
        }}
      />
    </div>
  );
}
