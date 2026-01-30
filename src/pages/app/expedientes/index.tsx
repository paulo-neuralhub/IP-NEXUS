// ============================================================
// IP-NEXUS - Expedientes List Page (Premium Redesign)
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutList, LayoutGrid, Kanban,
  Briefcase, Building2, Clock, AlertTriangle, CheckCircle2,
  ChevronRight, MoreHorizontal, Eye, FileText, Mail,
  Download, Trash2, Star
} from 'lucide-react';
import { useMattersV2, useDeleteMatterV2, useMatterTypes, useMatterClients, useMatterJurisdictions } from '@/hooks/use-matters-v2';
import type { MatterV2Filters } from '@/hooks/use-matters-v2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/contexts/page-context';
import { startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

// Configuración de tipos de expediente
const TYPE_CONFIG: Record<string, { label: string; icon: string; gradient: string; bgLight: string; textColor: string }> = {
  TM_NAT: { label: 'Marca Nacional', icon: '®️', gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950', textColor: 'text-blue-700 dark:text-blue-300' },
  TM_EU: { label: 'Marca UE', icon: '®️', gradient: 'from-indigo-500 to-indigo-600', bgLight: 'bg-indigo-50 dark:bg-indigo-950', textColor: 'text-indigo-700 dark:text-indigo-300' },
  TM_INT: { label: 'Marca Internacional', icon: '®️', gradient: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50 dark:bg-violet-950', textColor: 'text-violet-700 dark:text-violet-300' },
  PT_NAT: { label: 'Patente Nacional', icon: '⚙️', gradient: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-950', textColor: 'text-purple-700 dark:text-purple-300' },
  PT_EU: { label: 'Patente Europea', icon: '⚙️', gradient: 'from-fuchsia-500 to-fuchsia-600', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950', textColor: 'text-fuchsia-700 dark:text-fuchsia-300' },
  PT_PCT: { label: 'Patente PCT', icon: '⚙️', gradient: 'from-pink-500 to-pink-600', bgLight: 'bg-pink-50 dark:bg-pink-950', textColor: 'text-pink-700 dark:text-pink-300' },
  UM: { label: 'Modelo Utilidad', icon: '🔧', gradient: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-950', textColor: 'text-amber-700 dark:text-amber-300' },
  DS_NAT: { label: 'Diseño Nacional', icon: '✏️', gradient: 'from-rose-500 to-rose-600', bgLight: 'bg-rose-50 dark:bg-rose-950', textColor: 'text-rose-700 dark:text-rose-300' },
  DS_EU: { label: 'Diseño Comunitario', icon: '✏️', gradient: 'from-red-500 to-red-600', bgLight: 'bg-red-50 dark:bg-red-950', textColor: 'text-red-700 dark:text-red-300' },
  DOM: { label: 'Dominio', icon: '🌐', gradient: 'from-teal-500 to-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-950', textColor: 'text-teal-700 dark:text-teal-300' },
  NC: { label: 'Nombre Comercial', icon: '🏢', gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950', textColor: 'text-emerald-700 dark:text-emerald-300' },
  OPO: { label: 'Oposición', icon: '⚖️', gradient: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-950', textColor: 'text-orange-700 dark:text-orange-300' },
  VIG: { label: 'Vigilancia', icon: '👁️', gradient: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50 dark:bg-cyan-950', textColor: 'text-cyan-700 dark:text-cyan-300' },
  LIT: { label: 'Litigio', icon: '🏛️', gradient: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-50 dark:bg-slate-950', textColor: 'text-slate-700 dark:text-slate-300' },
};

// Configuración de estados
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
  filed: { label: 'Presentado', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  published: { label: 'Publicado', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900' },
  granted: { label: 'Concedido', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' },
  active: { label: 'Activo', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900' },
  opposed: { label: 'En oposición', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900' },
  expired: { label: 'Expirado', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  abandoned: { label: 'Abandonado', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  cancelled: { label: 'Cancelado', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' },
};

// Banderas de jurisdicción
const JURISDICTION_FLAGS: Record<string, string> = {
  ES: '🇪🇸', EU: '🇪🇺', US: '🇺🇸', EP: '🇪🇺', WIPO: '🌐',
  GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CN: '🇨🇳', JP: '🇯🇵',
};

// Configuración de fases (progreso visual)
const PHASE_CONFIG: Record<string, { label: string; progress: number; color: string }> = {
  inquiry: { label: 'Consulta', progress: 5, color: 'bg-slate-400' },
  analysis: { label: 'Análisis', progress: 15, color: 'bg-blue-400' },
  quotation: { label: 'Presupuesto', progress: 25, color: 'bg-cyan-400' },
  contracting: { label: 'Contratación', progress: 35, color: 'bg-indigo-400' },
  preparation: { label: 'Preparación', progress: 45, color: 'bg-violet-400' },
  filing: { label: 'Presentación', progress: 55, color: 'bg-purple-400' },
  examination: { label: 'Examen', progress: 70, color: 'bg-fuchsia-400' },
  publication: { label: 'Publicación', progress: 85, color: 'bg-pink-400' },
  resolution: { label: 'Resolución', progress: 95, color: 'bg-green-400' },
  monitoring: { label: 'Seguimiento', progress: 100, color: 'bg-emerald-500' },
};

export default function ExpedientesPage() {
  usePageTitle('Expedientes');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteMatter = useDeleteMatterV2();
  const { data: matterTypes } = useMatterTypes();
  const { data: jurisdictions } = useMatterJurisdictions();
  
  const [filters, setFilters] = useState<MatterV2Filters>({});
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'kanban'>('list');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<string>('all');
  
  const { data: matters, isLoading, error } = useMattersV2(filters);

  // KPIs calculados
  const kpis = useMemo(() => {
    if (!matters) return { total: 0, active: 0, urgent: 0, pending: 0, thisMonth: 0 };
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    return {
      total: matters.length,
      active: matters.filter(m => ['active', 'granted', 'filed', 'published'].includes(m.status)).length,
      urgent: matters.filter(m => m.is_urgent).length,
      pending: matters.filter(m => ['pending', 'draft'].includes(m.status)).length,
      thisMonth: matters.filter(m => {
        const created = new Date(m.created_at);
        return created >= monthStart && created <= monthEnd;
      }).length,
    };
  }, [matters]);

  // Aplicar quick filter
  const filteredByQuick = useMemo(() => {
    if (!matters) return [];
    
    switch (quickFilter) {
      case 'urgent':
        return matters.filter(m => m.is_urgent);
      case 'trademark':
        return matters.filter(m => m.matter_type?.startsWith('TM_'));
      case 'patent':
        return matters.filter(m => m.matter_type?.startsWith('PT_') || m.matter_type === 'UM');
      case 'design':
        return matters.filter(m => m.matter_type?.startsWith('DS_'));
      default:
        return matters;
    }
  }, [matters, quickFilter]);

  // Filtrado por búsqueda
  const filteredMatters = useMemo(() => {
    if (!searchInput) return filteredByQuick;
    const searchLower = searchInput.toLowerCase();
    return filteredByQuick.filter(m =>
      m.matter_number?.toLowerCase().includes(searchLower) ||
      m.title?.toLowerCase().includes(searchLower) ||
      m.client_name?.toLowerCase().includes(searchLower) ||
      m.mark_name?.toLowerCase().includes(searchLower)
    );
  }, [filteredByQuick, searchInput]);

  // Quick filters config
  const quickFilters = [
    { id: 'all', label: 'Todos', count: kpis.total },
    { id: 'trademark', label: 'Marcas', count: matters?.filter(m => m.matter_type?.startsWith('TM_')).length || 0 },
    { id: 'patent', label: 'Patentes', count: matters?.filter(m => m.matter_type?.startsWith('PT_') || m.matter_type === 'UM').length || 0 },
    { id: 'design', label: 'Diseños', count: matters?.filter(m => m.matter_type?.startsWith('DS_')).length || 0 },
    { id: 'urgent', label: '⚠️ Urgentes', count: kpis.urgent, highlight: true },
  ];

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMatter.mutateAsync(deleteId);
      toast({ title: 'Expediente eliminado' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar expedientes: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header Sticky con Glassmorphism */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Expedientes
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestión integral de propiedad intelectual
              </p>
            </div>
            <Button 
              onClick={() => navigate('/app/expedientes/nuevo')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Expediente
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Total" value={kpis.total} icon={Briefcase} color="blue" />
          <KpiCard label="Activos" value={kpis.active} icon={CheckCircle2} color="green" />
          <KpiCard label="Urgentes" value={kpis.urgent} icon={AlertTriangle} color="amber" highlight={kpis.urgent > 0} />
          <KpiCard label="Pendientes" value={kpis.pending} icon={Clock} color="violet" />
        </div>

        {/* Filtros rápidos */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setQuickFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "border hover:shadow-md",
                  quickFilter === filter.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg"
                    : filter.highlight
                      ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-70">{filter.count}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, número, cliente, marca..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-base"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={filters.jurisdiction || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, jurisdiction: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[140px] h-12 rounded-xl bg-white dark:bg-slate-800">
                <SelectValue placeholder="Jurisdicción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {jurisdictions?.map((jur) => (
                  <SelectItem key={jur} value={jur}>
                    {JURISDICTION_FLAGS[jur] || '🌐'} {jur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, status: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[130px] h-12 rounded-xl bg-white dark:bg-slate-800">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selector de vista */}
            <div className="flex items-center bg-muted/60 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'list' 
                    ? "bg-white dark:bg-slate-700 shadow-sm" 
                    : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'cards' 
                    ? "bg-white dark:bg-slate-700 shadow-sm" 
                    : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'kanban' 
                    ? "bg-white dark:bg-slate-700 shadow-sm" 
                    : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                )}
              >
                <Kanban className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de expedientes */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredMatters.length === 0 ? (
          <EmptyState 
            hasSearch={!!searchInput || quickFilter !== 'all'} 
            onClearFilters={() => { setSearchInput(''); setQuickFilter('all'); setFilters({}); }}
            onCreateNew={() => navigate('/app/expedientes/nuevo')}
          />
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredMatters.map((matter) => (
              <MatterRow 
                key={matter.id} 
                matter={matter} 
                onClick={() => navigate(`/app/expedientes/${matter.id}`)}
                onDelete={() => setDeleteId(matter.id)}
              />
            ))}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMatters.map((matter) => (
              <MatterCard 
                key={matter.id} 
                matter={matter} 
                onClick={() => navigate(`/app/expedientes/${matter.id}`)}
              />
            ))}
          </div>
        ) : (
          <MatterKanban matters={filteredMatters} />
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El expediente será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function KpiCard({ 
  label, value, icon: Icon, color, highlight, danger 
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red' | 'violet';
  highlight?: boolean;
  danger?: boolean;
}) {
  const colorConfig = {
    blue: { gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600' },
    green: { gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600' },
    amber: { gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600' },
    red: { gradient: 'from-red-500 to-red-600', shadow: 'shadow-red-500/20', bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600' },
    violet: { gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20', bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-600' },
  };
  
  const cfg = colorConfig[color];

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      highlight && "ring-2 ring-amber-400 ring-offset-2",
      danger && value > 0 && "ring-2 ring-red-400 ring-offset-2"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className={cn(
              "text-3xl font-bold mt-1",
              danger && value > 0 ? "text-red-600" : cfg.text
            )}>
              {value}
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            `bg-gradient-to-br ${cfg.gradient} ${cfg.shadow} shadow-lg`
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatterRow({ matter, onClick, onDelete }: { matter: any; onClick: () => void; onDelete: () => void }) {
  const typeConfig = TYPE_CONFIG[matter.matter_type] || { label: matter.matter_type, icon: '📁', gradient: 'from-gray-500 to-gray-600', bgLight: 'bg-gray-50', textColor: 'text-gray-700' };
  const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.draft;
  const phaseConfig = PHASE_CONFIG[matter.current_phase] || { label: matter.current_phase || '—', progress: 50, color: 'bg-gray-400' };
  const flag = JURISDICTION_FLAGS[matter.jurisdiction_primary] || '🌐';
  
  // Urgencia basada en is_urgent flag
  const isUrgent = matter.is_urgent;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative bg-white dark:bg-slate-800 rounded-xl border border-border/50",
        "hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
        "transition-all duration-200 cursor-pointer overflow-hidden"
      )}
    >
      {/* Barra de color del tipo */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", typeConfig.gradient)} />
      
      <div className="flex items-center gap-4 p-4 pl-5">
        {/* Icono tipo */}
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0", typeConfig.bgLight)}>
          {typeConfig.icon}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-primary">
              {matter.matter_number || matter.reference}
            </span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5", typeConfig.textColor)}>
              {typeConfig.label}
            </Badge>
            {matter.is_starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
            {matter.is_urgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
          
          <h3 className="font-medium text-foreground truncate mt-0.5">
            {matter.title}
          </h3>
          
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {matter.client_name || 'Sin cliente'}
            </span>
            <span className="flex items-center gap-1">
              {flag} {matter.jurisdiction_primary || '—'}
            </span>
          </div>
        </div>

        {/* Fase y progreso */}
        <div className="hidden md:flex flex-col items-end gap-1 w-32">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs font-mono">
              {matter.current_phase || '—'}
            </Badge>
            <span className="text-xs text-muted-foreground">{phaseConfig.label}</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", phaseConfig.color)}
              style={{ width: `${phaseConfig.progress}%` }}
            />
          </div>
        </div>

        {/* Urgencia indicator */}
        <div className="hidden lg:flex flex-col items-end w-24">
          {isUrgent ? (
            <Badge variant="outline" className="font-medium border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgente
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>

        {/* Estado */}
        <Badge className={cn(statusConfig.bgColor, statusConfig.color, "hidden sm:flex")}>
          {statusConfig.label}
        </Badge>

        {/* Acciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
              <Eye className="h-4 w-4 mr-2" /> Ver expediente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <FileText className="h-4 w-4 mr-2" /> Generar documento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Mail className="h-4 w-4 mr-2" /> Enviar email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Download className="h-4 w-4 mr-2" /> Exportar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Archivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

function MatterCard({ matter, onClick }: { matter: any; onClick: () => void }) {
  const typeConfig = TYPE_CONFIG[matter.matter_type] || { label: matter.matter_type, icon: '📁', gradient: 'from-gray-500 to-gray-600', bgLight: 'bg-gray-50', textColor: 'text-gray-700' };
  const statusConfig = STATUS_CONFIG[matter.status] || STATUS_CONFIG.draft;
  const phaseConfig = PHASE_CONFIG[matter.current_phase] || { label: matter.current_phase || '—', progress: 50, color: 'bg-gray-400' };
  const flag = JURISDICTION_FLAGS[matter.jurisdiction_primary] || '🌐';

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Header con gradiente */}
      <div className={cn("h-2 bg-gradient-to-r", typeConfig.gradient)} />
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-lg", typeConfig.bgLight)}>
            {typeConfig.icon}
          </div>
          <Badge className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>
            {statusConfig.label}
          </Badge>
        </div>

        <p className="font-mono text-sm font-semibold text-primary">
          {matter.matter_number || matter.reference}
        </p>
        
        <h3 className="font-medium text-foreground line-clamp-2 mt-1 min-h-[2.5rem]">
          {matter.title}
        </h3>

        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{matter.client_name || 'Sin cliente'}</span>
        </p>

        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            {flag} {matter.jurisdiction_primary || '—'}
          </span>
          <Badge variant="outline" className={cn("text-xs", typeConfig.textColor)}>
            {typeConfig.label.split(' ')[0]}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">{phaseConfig.label}</span>
            <span className="text-muted-foreground">{phaseConfig.progress}%</span>
          </div>
          <Progress value={phaseConfig.progress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}

function MatterKanban({ matters }: { matters: any[] }) {
  const phases = Object.entries(PHASE_CONFIG);
  
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-[1200px]">
        {phases.map(([phaseKey, phaseConfig]) => {
          const phasedMatters = matters.filter(m => m.current_phase === phaseKey);
          return (
            <div key={phaseKey} className="w-72 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", phaseConfig.color)} />
                  <span className="font-medium text-sm">{phaseConfig.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {phasedMatters.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                {phasedMatters.map((matter) => (
                  <KanbanCard key={matter.id} matter={matter} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function KanbanCard({ matter }: { matter: any }) {
  const navigate = useNavigate();
  const typeConfig = TYPE_CONFIG[matter.matter_type] || { icon: '📁', gradient: 'from-gray-500 to-gray-600' };
  
  return (
    <Card 
      onClick={() => navigate(`/app/expedientes/${matter.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span>{typeConfig.icon}</span>
          <span className="font-mono text-xs font-medium text-primary truncate">
            {matter.matter_number || matter.reference}
          </span>
        </div>
        <p className="text-sm font-medium line-clamp-2">{matter.title}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {matter.client_name}
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="w-24 h-8 rounded-md" />
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearch, onClearFilters, onCreateNew }: { hasSearch: boolean; onClearFilters: () => void; onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No hay expedientes</h3>
      <p className="text-muted-foreground text-center mt-1 max-w-sm">
        {hasSearch 
          ? 'No se encontraron resultados para tu búsqueda' 
          : 'Crea tu primer expediente para comenzar a gestionar tu propiedad intelectual'
        }
      </p>
      {hasSearch ? (
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : (
        <Button className="mt-4" onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Crear expediente
        </Button>
      )}
    </div>
  );
}
