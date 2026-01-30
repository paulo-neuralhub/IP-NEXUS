// =============================================
// COMPONENTE: ModuleIcons
// Iconos premium tipo app con gradientes únicos
// =============================================

import { 
  Briefcase, 
  Users, 
  Mail, 
  FileText, 
  Calendar, 
  Receipt, 
  Globe, 
  Sparkles, 
  BarChart3,
  Bell,
  Megaphone,
  Eye,
  Scale,
  Landmark,
  LineChart,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Definición de todos los módulos con diseño único
export const MODULE_DEFINITIONS: Record<string, {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  shadowColor: string;
  bgPattern: string;
}> = {
  // === CORE MODULES ===
  expedientes: {
    id: 'expedientes',
    name: 'Expedientes',
    shortName: 'EXP',
    description: 'Gestión de expedientes de PI',
    icon: Briefcase,
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    shadowColor: 'shadow-blue-500/30',
    bgPattern: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  crm: {
    id: 'crm',
    name: 'CRM',
    shortName: 'CRM',
    description: 'Clientes, Leads y Oportunidades',
    icon: Users,
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-500/30',
    bgPattern: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  comunicaciones: {
    id: 'comunicaciones',
    name: 'Comunicaciones',
    shortName: 'COM',
    description: 'Email, WhatsApp, Teléfono',
    icon: Mail,
    gradient: 'from-violet-500 via-purple-500 to-purple-600',
    shadowColor: 'shadow-purple-500/30',
    bgPattern: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.25) 0%, transparent 40%)'
  },
  documentos: {
    id: 'documentos',
    name: 'Documentos',
    shortName: 'DOC',
    description: 'Gestión documental y templates',
    icon: FileText,
    gradient: 'from-orange-400 via-orange-500 to-red-500',
    shadowColor: 'shadow-orange-500/30',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)'
  },
  calendario: {
    id: 'calendario',
    name: 'Calendario',
    shortName: 'CAL',
    description: 'Eventos, plazos y citas',
    icon: Calendar,
    gradient: 'from-cyan-400 via-cyan-500 to-teal-500',
    shadowColor: 'shadow-cyan-500/30',
    bgPattern: 'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  facturacion: {
    id: 'facturacion',
    name: 'Facturación',
    shortName: 'FAC',
    description: 'Facturas y presupuestos',
    icon: Receipt,
    gradient: 'from-green-500 via-green-600 to-emerald-600',
    shadowColor: 'shadow-green-500/30',
    bgPattern: 'radial-gradient(circle at 40% 90%, rgba(255,255,255,0.15) 0%, transparent 50%)'
  },
  
  // === PRODUCTOS STANDALONE ===
  docket: {
    id: 'docket',
    name: 'IP-DOCKET',
    shortName: 'DKT',
    description: 'Control de plazos y vencimientos',
    icon: Bell,
    gradient: 'from-red-500 via-red-600 to-rose-600',
    shadowColor: 'shadow-red-500/30',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)'
  },
  spider: {
    id: 'spider',
    name: 'IP-SPIDER',
    shortName: 'SPD',
    description: 'Vigilancia de marcas',
    icon: Eye,
    gradient: 'from-indigo-500 via-indigo-600 to-violet-600',
    shadowColor: 'shadow-indigo-500/30',
    bgPattern: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)'
  },
  genius: {
    id: 'genius',
    name: 'IP-GENIUS',
    shortName: 'AI',
    description: 'Asistente IA avanzado',
    icon: Sparkles,
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    shadowColor: 'shadow-amber-500/30',
    bgPattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 40%)'
  },
  market: {
    id: 'market',
    name: 'IP-MARKET',
    shortName: 'MKT',
    description: 'Marketplace de PI',
    icon: Globe,
    gradient: 'from-teal-400 via-teal-500 to-cyan-600',
    shadowColor: 'shadow-teal-500/30',
    bgPattern: 'radial-gradient(circle at 60% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  finance: {
    id: 'finance',
    name: 'IP-FINANCE',
    shortName: 'FIN',
    description: 'Valoración de activos IP',
    icon: LineChart,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    shadowColor: 'shadow-pink-500/30',
    bgPattern: 'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)'
  },
  
  // === AVANZADOS ===
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    shortName: 'ANL',
    description: 'Reportes y análisis avanzado',
    icon: BarChart3,
    gradient: 'from-fuchsia-500 via-fuchsia-600 to-purple-600',
    shadowColor: 'shadow-fuchsia-500/30',
    bgPattern: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    shortName: 'MRK',
    description: 'Campañas y automatización',
    icon: Megaphone,
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
    shadowColor: 'shadow-rose-500/30',
    bgPattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  },
  
  // === INTEGRACIONES ===
  oepm: {
    id: 'oepm',
    name: 'OEPM',
    shortName: 'OEPM',
    description: 'Oficina Española de Patentes',
    icon: Landmark,
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    shadowColor: 'shadow-yellow-500/30',
    bgPattern: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.25) 0%, transparent 50%)'
  },
  euipo: {
    id: 'euipo',
    name: 'EUIPO',
    shortName: 'EUIPO',
    description: 'Oficina de PI de la UE',
    icon: Scale,
    gradient: 'from-blue-600 via-blue-700 to-indigo-700',
    shadowColor: 'shadow-blue-600/30',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 50%)'
  },
  wipo: {
    id: 'wipo',
    name: 'WIPO',
    shortName: 'WIPO',
    description: 'Organización Mundial de PI',
    icon: Globe,
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    shadowColor: 'shadow-sky-500/30',
    bgPattern: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2) 0%, transparent 50%)'
  }
};

export type ModuleId = keyof typeof MODULE_DEFINITIONS;

interface ModuleIconProps {
  moduleId: string;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function ModuleIcon({ 
  moduleId, 
  isActive, 
  size = 'md',
  showLabel = true,
  onClick 
}: ModuleIconProps) {
  const module = MODULE_DEFINITIONS[moduleId];
  if (!module) return null;
  
  const Icon = module.icon;
  
  const sizeConfig = {
    sm: {
      container: 'w-10 h-10',
      icon: 'h-5 w-5',
      label: 'text-[9px]',
      radius: 'rounded-xl'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'h-6 w-6',
      label: 'text-[10px]',
      radius: 'rounded-xl'
    },
    lg: {
      container: 'w-14 h-14',
      icon: 'h-7 w-7',
      label: 'text-xs',
      radius: 'rounded-2xl'
    }
  };

  const config = sizeConfig[size];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'group relative flex flex-col items-center gap-1 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isActive ? 'cursor-pointer' : 'cursor-not-allowed'
            )}
            disabled={!isActive}
          >
            {/* Icono principal - Estilo App Icon */}
            <div
              className={cn(
                config.container,
                config.radius,
                'relative flex items-center justify-center transition-all duration-300',
                isActive ? [
                  `bg-gradient-to-br ${module.gradient}`,
                  module.shadowColor,
                  'shadow-lg',
                  'group-hover:scale-110 group-hover:shadow-xl',
                  'active:scale-95'
                ] : [
                  'bg-muted/60',
                  'grayscale',
                  'opacity-50'
                ]
              )}
              style={{
                backgroundImage: isActive ? module.bgPattern : undefined
              }}
            >
              {/* Borde interior sutil */}
              <div className={cn(
                'absolute inset-0',
                config.radius,
                'border',
                isActive ? 'border-white/20' : 'border-border/50'
              )} />
              
              {/* Reflejo superior (glass effect) */}
              {isActive && (
                <div 
                  className={cn(
                    'absolute inset-x-1 top-1 h-1/3',
                    'rounded-t-lg',
                    'bg-gradient-to-b from-white/30 to-transparent',
                    'pointer-events-none'
                  )}
                />
              )}
              
              {/* Icono */}
              <Icon className={cn(
                config.icon,
                'relative z-10 drop-shadow-sm',
                isActive ? 'text-white' : 'text-muted-foreground'
              )} />
              
              {/* Efecto hover glow */}
              {isActive && (
                <div className={cn(
                  'absolute inset-0',
                  config.radius,
                  'opacity-0 group-hover:opacity-100',
                  'bg-white/10',
                  'transition-opacity duration-200',
                  'pointer-events-none'
                )} />
              )}
            </div>
            
            {/* Label */}
            {showLabel && (
              <span className={cn(
                config.label,
                'font-semibold tracking-wide uppercase',
                isActive ? 'text-foreground' : 'text-muted-foreground/60'
              )}>
                {module.shortName}
              </span>
            )}
            
            {/* Indicador de inactivo */}
            {!isActive && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center text-[8px] border border-border shadow-sm">
                🔒
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-center max-w-[180px]">
          <p className="font-semibold">{module.name}</p>
          <p className="text-xs text-muted-foreground">{module.description}</p>
          {!isActive && (
            <p className="text-xs text-amber-500 mt-1 font-medium">
              ⬆️ Actualiza tu plan
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar todos los módulos en el header
interface ModuleBarProps {
  activeModules: string[];
  onModuleClick?: (moduleId: string) => void;
  variant?: 'full' | 'compact' | 'minimal';
}

export function ModuleBar({ 
  activeModules, 
  onModuleClick,
  variant = 'full'
}: ModuleBarProps) {
  // Agrupar módulos por categoría
  const coreModules: string[] = ['expedientes', 'crm', 'comunicaciones', 'documentos', 'calendario', 'facturacion'];
  const productModules: string[] = ['docket', 'spider', 'genius', 'market', 'finance'];
  const advancedModules: string[] = ['analytics', 'marketing'];
  const integrationModules: string[] = ['oepm', 'euipo', 'wipo'];

  // Para variante minimal, solo mostrar activos
  const modulesToShow = variant === 'minimal' 
    ? activeModules 
    : [...coreModules, ...productModules, ...advancedModules, ...integrationModules];

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-2">
        {modulesToShow.slice(0, 8).map((moduleId) => (
          <ModuleIcon
            key={moduleId}
            moduleId={moduleId}
            isActive={activeModules.includes(moduleId)}
            size="sm"
            showLabel={false}
            onClick={() => onModuleClick?.(moduleId)}
          />
        ))}
        {modulesToShow.length > 8 && (
          <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-xs font-semibold text-muted-foreground">
            +{modulesToShow.length - 8}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 overflow-x-auto scrollbar-hide">
      {/* Core */}
      <div className="flex items-center gap-2">
        {coreModules.map((moduleId) => (
          <ModuleIcon
            key={moduleId}
            moduleId={moduleId}
            isActive={activeModules.includes(moduleId)}
            size="sm"
            onClick={() => onModuleClick?.(moduleId)}
          />
        ))}
      </div>
      
      {/* Separador */}
      <div className="w-px h-8 bg-border/50 shrink-0" />
      
      {/* Productos */}
      <div className="flex items-center gap-2">
        {productModules.map((moduleId) => (
          <ModuleIcon
            key={moduleId}
            moduleId={moduleId}
            isActive={activeModules.includes(moduleId)}
            size="sm"
            onClick={() => onModuleClick?.(moduleId)}
          />
        ))}
      </div>
      
      {/* Separador */}
      <div className="w-px h-8 bg-border/50 shrink-0" />
      
      {/* Avanzados + Integraciones */}
      <div className="flex items-center gap-2">
        {[...advancedModules, ...integrationModules].map((moduleId) => (
          <ModuleIcon
            key={moduleId}
            moduleId={moduleId}
            isActive={activeModules.includes(moduleId)}
            size="sm"
            onClick={() => onModuleClick?.(moduleId)}
          />
        ))}
      </div>
    </div>
  );
}

// Versión compacta para móvil
export function ModuleBarCompact({ activeModules }: { activeModules: string[] }) {
  const activeCount = activeModules.length;
  const totalCount = Object.keys(MODULE_DEFINITIONS).length;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-1">
        {activeModules.slice(0, 5).map((moduleId) => {
          const module = MODULE_DEFINITIONS[moduleId];
          if (!module) return null;
          const Icon = module.icon;
          return (
            <div
              key={moduleId}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                `bg-gradient-to-br ${module.gradient}`,
                "border-2 border-background shadow-sm"
              )}
            >
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
          );
        })}
        {activeModules.length > 5 && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted border-2 border-background shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground">
              +{activeModules.length - 5}
            </span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {activeCount}/{totalCount}
      </span>
    </div>
  );
}

// Versión para sidebar o dropdown
export function ModuleGrid({ 
  activeModules, 
  onModuleClick 
}: { 
  activeModules: string[]; 
  onModuleClick?: (moduleId: string) => void;
}) {
  const allModules = Object.keys(MODULE_DEFINITIONS);
  
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {allModules.map((moduleId) => (
        <ModuleIcon
          key={moduleId}
          moduleId={moduleId}
          isActive={activeModules.includes(moduleId)}
          size="lg"
          onClick={() => onModuleClick?.(moduleId)}
        />
      ))}
    </div>
  );
}

// Badge contador de módulos activos
export function ModuleCountBadge({ 
  activeModules,
  onClick 
}: { 
  activeModules: string[];
  onClick?: () => void;
}) {
  const total = Object.keys(MODULE_DEFINITIONS).length;
  const active = activeModules.length;
  
  // Mostrar los primeros 4 iconos activos en miniatura
  const previewModules = activeModules.slice(0, 4);
  
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted transition-colors"
    >
      <div className="flex -space-x-2">
        {previewModules.map((moduleId) => {
          const module = MODULE_DEFINITIONS[moduleId];
          if (!module) return null;
          const Icon = module.icon;
          return (
            <div
              key={moduleId}
              className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center',
                `bg-gradient-to-br ${module.gradient}`,
                'border-2 border-background',
                'shadow-sm'
              )}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-muted-foreground">
        {active}/{total}
      </span>
    </button>
  );
}
