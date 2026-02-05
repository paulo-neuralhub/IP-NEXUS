// ============================================================
// IP-NEXUS - Expedientes NIVEL DIOS
// Professional matter list with deadline-based urgency
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutList, LayoutGrid, Kanban,
  Briefcase, ChevronRight, MoreHorizontal, Eye, FileText, Mail,
  Download, Building2, Clock
} from 'lucide-react';
import { NeoBadge, NeoBadgeInline } from '@/components/ui/neo-badge';
import { useMattersWithDeadlines, useUrgencyStats, type MatterWithDeadline, type MattersWithDeadlinesFilters } from '@/hooks/useMattersWithDeadlines';
import { useMatterJurisdictions } from '@/hooks/use-matters-v2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePageTitle } from '@/contexts/page-context';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================================
// CONFIGURATION
// ============================================================

// Banderas de jurisdicción
const FLAGS: Record<string, string> = {
  ES: '🇪🇸', EU: '🇪🇺', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
  IT: '🇮🇹', PT: '🇵🇹', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', IN: '🇮🇳',
  BR: '🇧🇷', MX: '🇲🇽', AU: '🇦🇺', CA: '🇨🇦', WO: '🌐', EP: '🇪🇺',
  WIPO: '🌐',
};

// Configuración de tipos de expediente
const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bgLight: string; textColor: string }> = {
  TM_NAT: { label: 'Marca Nacional', icon: '®️', color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950', textColor: 'text-blue-700 dark:text-blue-300' },
  TM_EU: { label: 'Marca UE', icon: '®️', color: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-950', textColor: 'text-indigo-700 dark:text-indigo-300' },
  TM_INT: { label: 'Marca Internacional', icon: '®️', color: 'bg-violet-500', bgLight: 'bg-violet-50 dark:bg-violet-950', textColor: 'text-violet-700 dark:text-violet-300' },
  PT_NAT: { label: 'Patente Nacional', icon: '⚙️', color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950', textColor: 'text-purple-700 dark:text-purple-300' },
  PT_EU: { label: 'Patente Europea', icon: '⚙️', color: 'bg-fuchsia-500', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950', textColor: 'text-fuchsia-700 dark:text-fuchsia-300' },
  PT_PCT: { label: 'Patente PCT', icon: '⚙️', color: 'bg-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-950', textColor: 'text-pink-700 dark:text-pink-300' },
  UM: { label: 'Modelo Utilidad', icon: '🔧', color: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-950', textColor: 'text-amber-700 dark:text-amber-300' },
  DS_NAT: { label: 'Diseño Nacional', icon: '✏️', color: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-950', textColor: 'text-rose-700 dark:text-rose-300' },
  DS_EU: { label: 'Diseño Comunitario', icon: '✏️', color: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-950', textColor: 'text-red-700 dark:text-red-300' },
  DOM: { label: 'Dominio', icon: '🌐', color: 'bg-teal-500', bgLight: 'bg-teal-50 dark:bg-teal-950', textColor: 'text-teal-700 dark:text-teal-300' },
  NC: { label: 'Nombre Comercial', icon: '🏢', color: 'bg-emerald-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950', textColor: 'text-emerald-700 dark:text-emerald-300' },
  OPO: { label: 'Oposición', icon: '⚖️', color: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-950', textColor: 'text-orange-700 dark:text-orange-300' },
  VIG: { label: 'Vigilancia', icon: '👁️', color: 'bg-cyan-500', bgLight: 'bg-cyan-50 dark:bg-cyan-950', textColor: 'text-cyan-700 dark:text-cyan-300' },
  LIT: { label: 'Litigio', icon: '🏛️', color: 'bg-slate-500', bgLight: 'bg-slate-50 dark:bg-slate-950', textColor: 'text-slate-700 dark:text-slate-300' },
  trademark: { label: 'Marca', icon: '®️', color: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-950', textColor: 'text-blue-700 dark:text-blue-300' },
  patent: { label: 'Patente', icon: '⚙️', color: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-950', textColor: 'text-purple-700 dark:text-purple-300' },
  design: { label: 'Diseño', icon: '✏️', color: 'bg-rose-500', bgLight: 'bg-rose-50 dark:bg-rose-950', textColor: 'text-rose-700 dark:text-rose-300' },
};

const DEFAULT_TYPE = { label: 'Expediente', icon: '📁', color: 'bg-gray-500', bgLight: 'bg-gray-50 dark:bg-gray-900', textColor: 'text-gray-700 dark:text-gray-300' };

// Configuración de fases
const PHASE_CONFIG: Record<string, { label: string; progress: number; color: string; bgLight: string }> = {
  F0: { label: 'Apertura', progress: 5, color: 'bg-slate-400', bgLight: 'bg-slate-100 text-slate-700' },
  F1: { label: 'Búsqueda', progress: 15, color: 'bg-blue-400', bgLight: 'bg-blue-100 text-blue-700' },
  F2: { label: 'Presentado', progress: 25, color: 'bg-blue-500', bgLight: 'bg-blue-100 text-blue-700' },
  F3: { label: 'Examen', progress: 40, color: 'bg-yellow-500', bgLight: 'bg-yellow-100 text-yellow-700' },
  F4: { label: 'Publicación', progress: 55, color: 'bg-orange-500', bgLight: 'bg-orange-100 text-orange-700' },
  F5: { label: 'Oposición', progress: 65, color: 'bg-red-400', bgLight: 'bg-red-100 text-red-700' },
  F6: { label: 'Concesión', progress: 75, color: 'bg-emerald-400', bgLight: 'bg-emerald-100 text-emerald-700' },
  F7: { label: 'Pre-Registro', progress: 85, color: 'bg-emerald-500', bgLight: 'bg-emerald-100 text-emerald-700' },
  F8: { label: 'Registrado', progress: 95, color: 'bg-green-500', bgLight: 'bg-green-100 text-green-700' },
  F9: { label: 'Post-Registro', progress: 100, color: 'bg-purple-500', bgLight: 'bg-purple-100 text-purple-700' },
};

// Colores hex para badges neumórficos de fase
const PHASE_COLORS: Record<string, string> = {
  F0: '#94a3b8', // slate
  F1: '#60a5fa', // blue
  F2: '#3b82f6', // blue-500
  F3: '#eab308', // yellow
  F4: '#f97316', // orange
  F5: '#f87171', // red
  F6: '#34d399', // emerald
  F7: '#10b981', // emerald-500
  F8: '#22c55e', // green
  F9: '#a855f7', // purple
};

const DEFAULT_PHASE = { label: '—', progress: 0, color: 'bg-gray-400', bgLight: 'bg-gray-100 text-gray-700' };

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ExpedientesPage() {
  usePageTitle('Expedientes');
  
  const navigate = useNavigate();
  const { data: jurisdictions } = useMatterJurisdictions();
  
  const [filters, setFilters] = useState<MattersWithDeadlinesFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Fetch matters with deadlines
  const { data: allMatters, isLoading, error } = useMattersWithDeadlines({
    ...filters,
    search: searchInput || undefined,
  });
  
  // Calculate urgency stats from ALL matters (before filtering)
  const stats = useUrgencyStats(allMatters);
  
  // Apply urgency filter client-side for instant feedback
  const filteredMatters = useMemo(() => {
    if (!allMatters) return [];
    
    let result = allMatters;
    
    // Apply urgency filter
    if (urgencyFilter !== 'all') {
      result = result.filter(m => {
        switch (urgencyFilter) {
          case 'overdue':
            return m.urgency_level === 'overdue' || m.urgency_level === 'today';
          case 'next7Days':
            return m.urgency_level === 'week';
          case 'next30Days':
            return m.urgency_level === 'month';
          case 'ok':
            return m.urgency_level === 'ok';
          default:
            return true;
        }
      });
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(m => {
        if (typeFilter === 'trademark') return m.matter_type.startsWith('TM_') || m.matter_type === 'trademark';
        if (typeFilter === 'patent') return m.matter_type.startsWith('PT_') || m.matter_type === 'UM' || m.matter_type === 'patent';
        if (typeFilter === 'design') return m.matter_type.startsWith('DS_') || m.matter_type === 'design';
        return true;
      });
    }
    
    return result;
  }, [allMatters, urgencyFilter, typeFilter]);
  
  // Type counts
  const typeCounts = useMemo(() => {
    if (!allMatters) return { all: 0, trademark: 0, patent: 0, design: 0 };
    return {
      all: allMatters.length,
      trademark: allMatters.filter(m => m.matter_type.startsWith('TM_') || m.matter_type === 'trademark').length,
      patent: allMatters.filter(m => m.matter_type.startsWith('PT_') || m.matter_type === 'UM' || m.matter_type === 'patent').length,
      design: allMatters.filter(m => m.matter_type.startsWith('DS_') || m.matter_type === 'design').length,
    };
  }, [allMatters]);

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
      {/* Header */}
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
        {/* KPIs de Urgencia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UrgencyKpiCard 
            label="Vencidos" 
            value={stats.overdue} 
            urgencyKey="overdue"
            colorClass="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
            textClass="text-red-700 dark:text-red-300"
            isActive={urgencyFilter === 'overdue'}
            onClick={() => setUrgencyFilter(urgencyFilter === 'overdue' ? 'all' : 'overdue')}
            showWarning={stats.overdue > 0}
          />
          <UrgencyKpiCard 
            label="Próximos 7 días" 
            value={stats.next7Days} 
            urgencyKey="next7Days"
            colorClass="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
            textClass="text-orange-700 dark:text-orange-300"
            isActive={urgencyFilter === 'next7Days'}
            onClick={() => setUrgencyFilter(urgencyFilter === 'next7Days' ? 'all' : 'next7Days')}
            showWarning={stats.next7Days > 5}
          />
          <UrgencyKpiCard 
            label="Este mes" 
            value={stats.next30Days} 
            urgencyKey="next30Days"
            colorClass="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
            textClass="text-yellow-700 dark:text-yellow-300"
            isActive={urgencyFilter === 'next30Days'}
            onClick={() => setUrgencyFilter(urgencyFilter === 'next30Days' ? 'all' : 'next30Days')}
          />
          <UrgencyKpiCard 
            label="Sin urgencia" 
            value={stats.ok} 
            urgencyKey="ok"
            colorClass="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            textClass="text-green-700 dark:text-green-300"
            isActive={urgencyFilter === 'ok'}
            onClick={() => setUrgencyFilter(urgencyFilter === 'ok' ? 'all' : 'ok')}
          />
        </div>

        {/* Filtros por tipo */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-2">
            {[
              { id: 'all', label: 'Todos', count: typeCounts.all },
              { id: 'trademark', label: 'Marcas', count: typeCounts.trademark },
              { id: 'patent', label: 'Patentes', count: typeCounts.patent },
              { id: 'design', label: 'Diseños', count: typeCounts.design },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTypeFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  "border hover:shadow-md",
                  typeFilter === filter.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg"
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
                    {FLAGS[jur] || '🌐'} {jur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.phase || 'all'}
              onValueChange={(v) => setFilters(prev => ({ ...prev, phase: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger className="w-[130px] h-12 rounded-xl bg-white dark:bg-slate-800">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(PHASE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{key} - {config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View mode toggle */}
            <div className="flex items-center bg-muted/60 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'table' 
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

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredMatters.length === 0 ? (
          <EmptyState 
            hasFilters={!!searchInput || urgencyFilter !== 'all' || typeFilter !== 'all'} 
            onClearFilters={() => { setSearchInput(''); setUrgencyFilter('all'); setTypeFilter('all'); setFilters({}); }}
            onCreateNew={() => navigate('/app/expedientes/nuevo')}
          />
        ) : viewMode === 'table' ? (
          <div className="space-y-1.5">
            {filteredMatters.map((matter) => (
              <MatterListRowSilk 
                key={matter.id} 
                matter={matter} 
                onClick={() => navigate(`/app/expedientes/${matter.id}`)}
              />
            ))}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMatters.map((matter) => (
              <MatterCardNew 
                key={matter.id} 
                matter={matter} 
                onClick={() => navigate(`/app/expedientes/${matter.id}`)}
              />
            ))}
          </div>
        ) : (
          <MatterKanbanNew matters={filteredMatters} />
        )}

        {/* Results count */}
        <div className="text-sm text-muted-foreground text-center">
          Mostrando {filteredMatters.length} de {allMatters?.length || 0} expedientes
        </div>
      </div>

      {/* Delete Dialog REMOVED - funcionalidad deshabilitada */}
    </div>
  );
}

// ============================================================
// URGENCY KPI CARD
// ============================================================

// Color mapping for urgency states (hex)
const URGENCY_COLORS: Record<string, string> = {
  overdue: '#ef4444',   // red
  next7Days: '#f97316', // orange
  next30Days: '#eab308', // yellow
  ok: '#22c55e',        // green
};

// KPI descriptions
const URGENCY_DESCRIPTIONS: Record<string, string> = {
  overdue: 'Requiere atención urgente',
  next7Days: 'Atención pronto',
  next30Days: 'Programados este mes',
  ok: 'Más de 30 días',
};

// KPI icons
const URGENCY_ICONS: Record<string, string> = {
  overdue: '⚠️',
  next7Days: '⏰',
  next30Days: '📅',
  ok: '✅',
};

function UrgencyKpiCard({ 
  label, value, colorClass, textClass, isActive, onClick, showWarning, urgencyKey
}: {
  label: string;
  value: number;
  colorClass: string;
  textClass: string;
  isActive: boolean;
  onClick: () => void;
  showWarning?: boolean;
  urgencyKey: string;
}) {
  const stateColor = URGENCY_COLORS[urgencyKey] || '#64748b';
  const description = URGENCY_DESCRIPTIONS[urgencyKey] || '';
  const icon = URGENCY_ICONS[urgencyKey] || '';
  
  // Border color based on urgency
  const getBorderStyle = () => {
    if (urgencyKey === 'overdue' && value > 0) {
      return { border: '2px solid rgba(239, 68, 68, 0.4)', boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.1)' };
    }
    if (urgencyKey === 'next7Days' && value > 0) {
      return { border: '1px solid rgba(249, 115, 22, 0.25)' };
    }
    return { border: '1px solid rgba(0, 0, 0, 0.06)' };
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-4 rounded-[14px] transition-all text-left bg-[#f1f4f9]",
        "hover:border-[rgba(0,180,216,0.15)]",
        isActive && "ring-2 ring-offset-2 ring-primary"
      )}
      style={getBorderStyle()}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Label + description */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span 
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: '#0a2540' }}
          >
            {icon} {label}
          </span>
          <span 
            className="text-[9px]"
            style={{ color: value > 0 && (urgencyKey === 'overdue' || urgencyKey === 'next7Days') ? stateColor : '#94a3b8' }}
          >
            {description}
          </span>
        </div>
        
        {/* Right: Neumorphic badge */}
        <NeoBadge 
          value={value} 
          color={value > 0 ? stateColor : '#94a3b8'}
          size="md"
          active={isActive}
        />
      </div>
    </button>
  );
}

// ============================================================
// LIST ROW SILK (Line-Defined Design)
// ============================================================

function MatterListRowSilk({ matter, onClick }: { 
  matter: MatterWithDeadline; 
  onClick: () => void; 
}) {
  const typeConfig = TYPE_CONFIG[matter.matter_type] || DEFAULT_TYPE;
  const phaseConfig = PHASE_CONFIG[matter.current_phase || 'F0'] || DEFAULT_PHASE;
  const flag = FLAGS[matter.jurisdiction_code || ''] || '🌐';
  
  // Get color for type
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'TM_NAT': '#00b4d8',
      'TM_EU': '#00b4d8',
      'TM_INT': '#00b4d8',
      'trademark': '#00b4d8',
      'PT_NAT': '#10b981',
      'PT_EU': '#10b981',
      'PT_PCT': '#10b981',
      'UM': '#10b981',
      'patent': '#10b981',
      'DS_NAT': '#ec4899',
      'DS_EU': '#ec4899',
      'design': '#ec4899',
    };
    return colors[type] || '#64748b';
  };
  
  const typeColor = getTypeColor(matter.matter_type);
  const isUrgent = matter.urgency_level === 'overdue' || matter.urgency_level === 'today';
  
  // Deadline display
  const getDeadlineDisplay = () => {
    if (!matter.next_deadline) {
      return { text: '—', subtext: '', colorClass: 'text-muted-foreground', bgClass: '', icon: '' };
    }
    
    const days = matter.days_until_deadline;
    const dueDate = new Date(matter.next_deadline.due_date);
    
    if (days === null) {
      return { text: '—', subtext: '', colorClass: 'text-muted-foreground', bgClass: '', icon: '' };
    }
    
    if (days < 0) {
      return { 
        text: format(dueDate, 'dd/MM', { locale: es }), 
        subtext: 'VENCIDO', 
        colorClass: 'text-red-700 dark:text-red-400 font-bold', 
        bgClass: 'bg-red-50 dark:bg-red-950',
        icon: '🔴'
      };
    }
    if (days === 0) {
      return { 
        text: 'HOY', 
        subtext: 'VENCE', 
        colorClass: 'text-red-600 dark:text-red-400 font-bold animate-pulse', 
        bgClass: 'bg-red-50 dark:bg-red-950',
        icon: '🔴'
      };
    }
    if (days <= 7) {
      return { 
        text: format(dueDate, 'dd/MM', { locale: es }), 
        subtext: `${days}d`, 
        colorClass: 'text-orange-600 dark:text-orange-400 font-semibold', 
        bgClass: 'bg-orange-50 dark:bg-orange-950',
        icon: '🟠'
      };
    }
    if (days <= 30) {
      return { 
        text: format(dueDate, 'dd/MM', { locale: es }), 
        subtext: `${days}d`, 
        colorClass: 'text-yellow-600 dark:text-yellow-400', 
        bgClass: 'bg-yellow-50 dark:bg-yellow-950',
        icon: '🟡'
      };
    }
    
    const years = differenceInYears(dueDate, new Date());
    if (years >= 1) {
      return { 
        text: format(dueDate, 'yyyy', { locale: es }), 
        subtext: `${years}a`, 
        colorClass: 'text-green-600 dark:text-green-400', 
        bgClass: '',
        icon: '🟢'
      };
    }
    
    return { 
      text: format(dueDate, 'dd/MM', { locale: es }), 
      subtext: `${days}d`, 
      color: '#22c55e',
      bgClass: '',
      icon: '🟢'
    };
  };

  const deadline = getDeadlineDisplay();
  const displayName = matter.mark_name || matter.title;
  const officialNumber = matter.application_number || matter.registration_number;

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer transition-all duration-200"
      style={{
        padding: '14px 16px',
        borderRadius: '14px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        background: '#f1f4f9',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0, 180, 216, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.06)';
      }}
    >
      <div className="flex items-center gap-4">
        {/* Phase badge - neumorphic */}
        <NeoBadge 
          value={matter.current_phase || 'F0'} 
          color={PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'} 
          size="md" 
        />
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {/* Matter name */}
            <span 
              className="truncate"
              style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}
            >
              {displayName}
            </span>
            
            {/* Type badge */}
            <span 
              style={{
                fontSize: '9px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '5px',
                background: `${typeColor}0a`,
                color: typeColor,
                flexShrink: 0
              }}
            >
              {typeConfig.label}
            </span>
            
            {/* Urgent badge */}
            {isUrgent && (
              <span 
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '5px',
                  background: '#ef44440a',
                  color: '#ef4444',
                  flexShrink: 0
                }}
              >
                URGENTE
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '12px', color: '#64748b' }} className="truncate">
              {matter.client_name || 'Sin cliente'}
            </span>
            {officialNumber && (
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {officialNumber}
              </span>
            )}
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {flag} {matter.jurisdiction_code}
            </span>
          </div>
        </div>
        
        {/* Deadline */}
        {matter.next_deadline && (
          <div 
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: isUrgent ? '#ef44440a' : 'rgba(0,0,0,0.04)',
              textAlign: 'center',
              minWidth: '60px'
            }}
          >
            <div className="flex items-center justify-center gap-1">
              {deadline.icon && <span style={{ fontSize: '10px' }}>{deadline.icon}</span>}
              <span style={{ fontSize: '11px', fontWeight: 600, color: isUrgent ? '#ef4444' : '#64748b' }}>
                {deadline.text}
              </span>
            </div>
            {deadline.subtext && (
              <span style={{ fontSize: '9px', color: isUrgent ? '#ef4444' : '#94a3b8' }}>
                {deadline.subtext}
              </span>
            )}
          </div>
        )}
        
        {/* Progress */}
        {/* Progress bar - SILK 6px with gradient */}
        <div style={{ width: '110px' }}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: '9px', color: '#94a3b8' }}>{phaseConfig.label}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b' }}>
              {phaseConfig.progress}%
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div 
              style={{
                width: `${phaseConfig.progress}%`,
                height: '100%',
                borderRadius: '4px',
                background: `linear-gradient(90deg, ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}, ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}99)`,
                boxShadow: `0 1px 3px ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}30`,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
                <Download className="h-4 w-4 mr-2" /> Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

// ============================================================
// CARD VIEW
// ============================================================

function MatterCardNew({ matter, onClick }: { matter: MatterWithDeadline; onClick: () => void }) {
  const typeConfig = TYPE_CONFIG[matter.matter_type] || DEFAULT_TYPE;
  const phaseConfig = PHASE_CONFIG[matter.current_phase || 'F0'] || DEFAULT_PHASE;
  const flag = FLAGS[matter.jurisdiction_code || ''] || '🌐';
  
   // Get color for type badge
   const getTypeColor = (type: string): string => {
     const colors: Record<string, string> = {
       'TM_NAT': '#00b4d8',
       'TM_EU': '#00b4d8',
       'TM_INT': '#00b4d8',
       'trademark': '#00b4d8',
       'PT_NAT': '#10b981',
       'PT_EU': '#10b981',
       'PT_PCT': '#10b981',
       'UM': '#10b981',
       'patent': '#10b981',
       'DS_NAT': '#ec4899',
       'DS_EU': '#ec4899',
       'design': '#ec4899',
     };
     return colors[type] || '#64748b';
   };
   
   const typeColor = getTypeColor(matter.matter_type);
   const isUrgent = matter.urgency_level === 'overdue' || matter.urgency_level === 'today';

  return (
     <div 
      onClick={onClick}
       className="group cursor-pointer transition-all duration-200"
       style={{
         padding: '14px 16px',
         borderRadius: '14px',
         border: '1px solid rgba(0, 0, 0, 0.06)',
         background: '#f1f4f9',
         marginBottom: '6px',
       }}
       onMouseEnter={(e) => {
         e.currentTarget.style.border = '1px solid rgba(0, 180, 216, 0.15)';
       }}
       onMouseLeave={(e) => {
         e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.06)';
       }}
    >
       <div className="flex items-center gap-4">
         {/* Phase badge - neumorphic */}
         <NeoBadge 
           value={matter.current_phase || 'F0'} 
           color={PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'} 
           size="md" 
         />
         
         {/* Main content */}
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-3 mb-1">
             <span 
               className="truncate"
               style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}
             >
               {matter.mark_name || matter.title}
             </span>
             
             <span 
               style={{
                 fontSize: '9px',
                 fontWeight: 600,
                 padding: '2px 7px',
                 borderRadius: '5px',
                 background: `${typeColor}0a`,
                 color: typeColor,
                 flexShrink: 0
               }}
             >
               {typeConfig.label}
             </span>
             
             {isUrgent && (
               <span 
                 style={{
                   fontSize: '9px',
                   fontWeight: 700,
                   padding: '2px 7px',
                   borderRadius: '5px',
                   background: '#ef44440a',
                   color: '#ef4444',
                   flexShrink: 0
                 }}
               >
                 URGENTE
               </span>
             )}
           </div>
           
           <div className="flex items-center gap-4">
             <span style={{ fontSize: '12px', color: '#64748b' }} className="truncate">
               {matter.client_name || 'Sin cliente'}
             </span>
             <span style={{ fontSize: '11px', color: '#94a3b8' }}>
               {matter.matter_number}
             </span>
             <span style={{ fontSize: '11px', color: '#94a3b8' }}>
               {flag} {matter.jurisdiction_code}
             </span>
          </div>
         </div>
         
         {/* Progress bar - SILK 6px with gradient */}
         <div style={{ width: '120px' }}>
           <div className="flex justify-between items-center mb-1">
             <span style={{ fontSize: '9px', color: '#94a3b8' }}>Fase</span>
             <span style={{ fontSize: '10px', fontWeight: 700, color: PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b' }}>
               {phaseConfig.progress}%
             </span>
           </div>
           <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div 
               style={{
                 width: `${phaseConfig.progress}%`,
                 height: '100%',
                 borderRadius: '4px',
                 background: `linear-gradient(90deg, ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}, ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}99)`,
                 boxShadow: `0 1px 3px ${PHASE_COLORS[matter.current_phase || 'F0'] || '#64748b'}30`,
                 transition: 'width 0.3s ease'
               }}
            />
          </div>
        </div>
       </div>
     </div>
  );
}

// ============================================================
// KANBAN VIEW
// ============================================================

function MatterKanbanNew({ matters }: { matters: MatterWithDeadline[] }) {
  const navigate = useNavigate();
  
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-[1200px]">
        {Object.entries(PHASE_CONFIG).map(([phaseKey, phaseConfig]) => {
          const phasedMatters = matters.filter(m => m.current_phase === phaseKey);
          return (
            <div key={phaseKey} className="w-72 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  {/* Neumorphic phase badge for column header */}
                  <NeoBadgeInline 
                    value={phaseKey}
                    color={PHASE_COLORS[phaseKey] || '#64748b'}
                  />
                  <span className="font-medium text-sm">{phaseConfig.label}</span>
                </div>
                <NeoBadge 
                  value={phasedMatters.length} 
                  color={PHASE_COLORS[phaseKey] || '#64748b'}
                  size="sm"
                />
              </div>
              <div className="space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2">
                {phasedMatters.map((matter) => {
                  const typeConfig = TYPE_CONFIG[matter.matter_type] || DEFAULT_TYPE;
                   const isUrgent = matter.urgency_level === 'overdue' || matter.urgency_level === 'today';
                  return (
                     <div 
                      key={matter.id}
                      onClick={() => navigate(`/app/expedientes/${matter.id}`)}
                       className="cursor-pointer transition-all duration-200"
                       style={{
                         padding: '12px 14px',
                         borderRadius: '14px',
                         border: '1px solid rgba(0, 0, 0, 0.06)',
                         background: '#f1f4f9',
                         marginBottom: '6px',
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.border = '1px solid rgba(0, 180, 216, 0.15)';
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.border = '1px solid rgba(0, 0, 0, 0.06)';
                       }}
                    >
                       <div className="flex items-center gap-2 mb-2">
                         <span style={{ fontSize: '12px' }}>{typeConfig.icon}</span>
                         <span 
                           className="truncate"
                           style={{ fontSize: '11px', fontWeight: 600, color: '#0a2540' }}
                         >
                            {matter.matter_number}
                         </span>
                         {isUrgent && (
                           <span 
                             style={{
                               fontSize: '8px',
                               fontWeight: 700,
                               padding: '1px 5px',
                               borderRadius: '4px',
                               background: '#ef44440a',
                               color: '#ef4444',
                             }}
                           >
                             !
                           </span>
                         )}
                       </div>
                       <p 
                         className="line-clamp-2"
                         style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}
                       >
                         {matter.mark_name || matter.title}
                       </p>
                       <p 
                         className="truncate mt-1"
                         style={{ fontSize: '11px', color: '#64748b' }}
                       >
                         {matter.client_name}
                       </p>
                       {matter.next_deadline && (
                         <div 
                           className="mt-2 flex items-center gap-1"
                           style={{
                             fontSize: '10px',
                             padding: '4px 6px',
                             borderRadius: '6px',
                             background: isUrgent ? '#ef44440a' : 'rgba(0,0,0,0.04)',
                             color: isUrgent ? '#ef4444' : '#94a3b8'
                           }}
                         >
                           <Clock size={10} />
                           <span className="truncate">
                             {matter.days_until_deadline !== null && matter.days_until_deadline <= 0 ? 'Vencido' :
                              `${matter.days_until_deadline}d`}
                           </span>
                         </div>
                       )}
                     </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

// ============================================================
// LOADING & EMPTY STATES
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-border/50 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-1 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-20 h-8" />
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters, onClearFilters, onCreateNew }: { 
  hasFilters: boolean; 
  onClearFilters: () => void; 
  onCreateNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No hay expedientes</h3>
      <p className="text-muted-foreground text-center mt-1 max-w-sm">
        {hasFilters 
          ? 'No se encontraron resultados para los filtros seleccionados' 
          : 'Crea tu primer expediente para comenzar a gestionar tu propiedad intelectual'
        }
      </p>
      {hasFilters ? (
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
