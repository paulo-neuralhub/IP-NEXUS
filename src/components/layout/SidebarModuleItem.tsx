// =============================================
// COMPONENTE: SidebarModuleItem
// Wrapper que añade estado de módulo al item del sidebar
// =============================================

import { Lock, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useModules } from '@/hooks/useModules';

interface SidebarModuleItemProps {
  moduleCode: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarModuleItem({ 
  moduleCode, 
  children,
  className,
}: SidebarModuleItemProps) {
  const { modulesWithStatus } = useModules();
  
  const module = modulesWithStatus.find(m => m.code === moduleCode);
  
  // Si no hay info del módulo, renderizar normal
  if (!module) {
    return <>{children}</>;
  }

  const isAccessible = module.is_accessible;
  const isTrial = module.visual_status === 'trial';
  const isLocked = !isAccessible;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      // Navigate to modules page to activate
      window.location.href = '/app/modules';
    }
  };

  return (
    <div 
      className={cn('relative group', className)}
      onClick={isLocked ? handleClick : undefined}
    >
      {/* Overlay para módulos bloqueados */}
      {isLocked && (
        <div className="absolute inset-0 bg-sidebar/60 rounded-md z-10 cursor-pointer" />
      )}
      
      {/* Contenido original con estilos condicionales */}
      <div className={cn(
        'transition-opacity',
        isLocked && 'opacity-50 pointer-events-none'
      )}>
        {children}
      </div>

      {/* Indicadores de estado */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
        {/* Badge de trial */}
        {isTrial && module.trial_days_remaining !== undefined && (
          <Badge 
            variant="outline" 
            className="h-4 px-1 text-[9px] bg-warning/20 text-warning border-warning/30"
          >
            <Clock className="h-2.5 w-2.5 mr-0.5" />
            {module.trial_days_remaining}d
          </Badge>
        )}

        {/* Candado si bloqueado */}
        {isLocked && (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
