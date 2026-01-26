// =============================================
// HOOK: useSidebarModules
// Helper para obtener estado de módulos en sidebar
// =============================================

import { useMemo } from 'react';
import { useModules } from '@/hooks/useModules';

interface ModuleState {
  isAccessible: boolean;
  isTrial: boolean;
  isLocked: boolean;
  trialDaysRemaining?: number;
}

export function useSidebarModules() {
  const { modulesWithStatus, hasModule, isLoading } = useModules();

  // Mapa rápido de código -> estado
  const moduleStates = useMemo(() => {
    const map: Record<string, ModuleState> = {};

    modulesWithStatus.forEach(m => {
      map[m.code] = {
        isAccessible: m.is_accessible,
        isTrial: m.visual_status === 'trial',
        isLocked: !m.is_accessible,
        trialDaysRemaining: m.trial_days_remaining,
      };
    });

    return map;
  }, [modulesWithStatus]);

  // Función para obtener estado de un módulo
  const getModuleState = (code: string): ModuleState => {
    return moduleStates[code] || {
      isAccessible: true, // Por defecto accesible si no está en la lista
      isTrial: false,
      isLocked: false,
    };
  };

  // Función para manejar clic en módulo bloqueado
  const handleLockedClick = (code: string) => {
    window.location.href = '/app/modules';
  };

  // Verificar si una sección tiene módulos accesibles
  const sectionHasAccessibleModules = (moduleCodes: string[]): boolean => {
    return moduleCodes.some(code => getModuleState(code).isAccessible);
  };

  return {
    moduleStates,
    getModuleState,
    hasModule,
    handleLockedClick,
    sectionHasAccessibleModules,
    isLoading,
  };
}
