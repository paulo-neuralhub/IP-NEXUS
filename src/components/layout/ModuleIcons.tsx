// ============================================================
// IP-NEXUS - Module Icons for Header
// Visual module badges showing subscription status
// ============================================================

import { 
  Users, 
  Briefcase, 
  Mail, 
  FileText, 
  Calendar, 
  Receipt, 
  Globe, 
  Sparkles, 
  BarChart3,
  Bell,
  Target,
  Megaphone,
  Eye,
  Scale,
  Landmark,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Definición de todos los módulos disponibles
export const MODULE_DEFINITIONS: Record<string, {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  textColor: string;
}> = {
  // Core
  expedientes: {
    id: 'expedientes',
    name: 'Expedientes',
    shortName: 'EXP',
    description: 'Gestión de expedientes de PI',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  crm: {
    id: 'crm',
    name: 'CRM',
    shortName: 'CRM',
    description: 'Clientes, Leads y Oportunidades',
    icon: Users,
    color: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    textColor: 'text-green-600'
  },
  comunicaciones: {
    id: 'comunicaciones',
    name: 'Comunicaciones',
    shortName: 'COM',
    description: 'Email, WhatsApp, Teléfono',
    icon: Mail,
    color: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  documentos: {
    id: 'documentos',
    name: 'Documentos',
    shortName: 'DOC',
    description: 'Gestión documental y templates',
    icon: FileText,
    color: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  calendario: {
    id: 'calendario',
    name: 'Calendario',
    shortName: 'CAL',
    description: 'Eventos, plazos y citas',
    icon: Calendar,
    color: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600'
  },
  facturacion: {
    id: 'facturacion',
    name: 'Facturación',
    shortName: 'FAC',
    description: 'Facturas y presupuestos',
    icon: Receipt,
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600'
  },
  
  // Avanzados
  docket: {
    id: 'docket',
    name: 'IP-DOCKET',
    shortName: 'DKT',
    description: 'Control de plazos y vencimientos',
    icon: Bell,
    color: 'from-red-500 to-red-600',
    bgLight: 'bg-red-50',
    textColor: 'text-red-600'
  },
  spider: {
    id: 'spider',
    name: 'IP-SPIDER',
    shortName: 'SPD',
    description: 'Vigilancia de marcas',
    icon: Eye,
    color: 'from-indigo-500 to-indigo-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600'
  },
  genius: {
    id: 'genius',
    name: 'IP-GENIUS',
    shortName: 'GNS',
    description: 'Asistente IA',
    icon: Sparkles,
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600'
  },
  market: {
    id: 'market',
    name: 'IP-MARKET',
    shortName: 'MKT',
    description: 'Marketplace de PI',
    icon: Globe,
    color: 'from-teal-500 to-teal-600',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600'
  },
  finance: {
    id: 'finance',
    name: 'IP-FINANCE',
    shortName: 'FIN',
    description: 'Valoración de activos IP',
    icon: BarChart3,
    color: 'from-pink-500 to-pink-600',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600'
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    shortName: 'ANL',
    description: 'Reportes y análisis avanzado',
    icon: Target,
    color: 'from-violet-500 to-violet-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600'
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    shortName: 'MRK',
    description: 'Campañas y automatización',
    icon: Megaphone,
    color: 'from-rose-500 to-rose-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600'
  },
  
  // Integraciones
  oepm: {
    id: 'oepm',
    name: 'OEPM',
    shortName: 'OEPM',
    description: 'Oficina Española de Patentes',
    icon: Landmark,
    color: 'from-yellow-500 to-yellow-600',
    bgLight: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  euipo: {
    id: 'euipo',
    name: 'EUIPO',
    shortName: 'EUIPO',
    description: 'Oficina de PI de la UE',
    icon: Scale,
    color: 'from-blue-600 to-blue-700',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  wipo: {
    id: 'wipo',
    name: 'WIPO',
    shortName: 'WIPO',
    description: 'Organización Mundial de PI',
    icon: Globe,
    color: 'from-sky-500 to-sky-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600'
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
  showLabel = false,
  onClick 
}: ModuleIconProps) {
  const module = MODULE_DEFINITIONS[moduleId];
  if (!module) return null;
  
  const Icon = module.icon;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              onClick && "cursor-pointer hover:scale-110",
              !onClick && "cursor-default"
            )}
          >
            {/* Icono tipo blasón */}
            <div
              className={cn(
                sizeClasses[size],
                "relative rounded-lg flex items-center justify-center transition-all duration-300",
                isActive 
                  ? `bg-gradient-to-br ${module.color} shadow-lg shadow-current/20` 
                  : "bg-muted/50 border border-border"
              )}
            >
              {/* Efecto de brillo */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-white/10 to-white/20" />
              )}
              
              <Icon 
                className={cn(
                  iconSizes[size],
                  "relative z-10",
                  isActive ? "text-white" : "text-muted-foreground/50"
                )} 
              />
              
              {/* Indicador de activo */}
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white shadow-sm" />
              )}
            </div>
            
            {/* Label opcional */}
            {showLabel && (
              <span className={cn(
                "text-[10px] font-semibold tracking-wide",
                isActive ? module.textColor : "text-muted-foreground/50"
              )}>
                {module.shortName}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-semibold">{module.name}</p>
            <p className="text-xs text-muted-foreground">{module.description}</p>
            {!isActive && (
              <p className="text-xs text-amber-600 font-medium">No incluido en tu plan</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar todos los módulos en el header
interface ModuleBarProps {
  activeModules: string[];
  onModuleClick?: (moduleId: string) => void;
}

export function ModuleBar({ activeModules, onModuleClick }: ModuleBarProps) {
  // Orden de visualización
  const moduleOrder: string[] = [
    'expedientes', 'crm', 'comunicaciones', 'documentos', 'calendario', 'facturacion',
    'docket', 'spider', 'genius', 'market', 'finance', 'analytics', 'marketing',
    'oepm', 'euipo', 'wipo'
  ];

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 rounded-xl border border-border/50">
      {moduleOrder.map((moduleId) => (
        <ModuleIcon
          key={moduleId}
          moduleId={moduleId}
          isActive={activeModules.includes(moduleId)}
          size="sm"
          onClick={() => onModuleClick?.(moduleId)}
        />
      ))}
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
                "w-6 h-6 rounded-md flex items-center justify-center",
                `bg-gradient-to-br ${module.color}`,
                "border-2 border-background"
              )}
            >
              <Icon className="h-3 w-3 text-white" />
            </div>
          );
        })}
        {activeModules.length > 5 && (
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted border-2 border-background">
            <span className="text-[10px] font-bold text-muted-foreground">
              +{activeModules.length - 5}
            </span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        {activeCount}/{totalCount} módulos
      </span>
    </div>
  );
}
