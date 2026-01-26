// =============================================
// HOOK: useRequireModule
// Para verificar acceso a módulo en componentes
// src/hooks/useRequireModule.ts
// =============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModulesContext } from '@/contexts/ModulesContext';

interface UseRequireModuleOptions {
  redirectTo?: string;
  showPopup?: boolean;
}

export function useRequireModule(
  moduleCode: string, 
  options: UseRequireModuleOptions = {}
) {
  const { redirectTo, showPopup = true } = options;
  const navigate = useNavigate();
  const { hasModule, showActivationPopup, isLoading } = useModulesContext();

  const hasAccess = hasModule(moduleCode);

  useEffect(() => {
    if (isLoading) return;

    if (!hasAccess) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
      if (showPopup) {
        showActivationPopup(moduleCode);
      }
    }
  }, [hasAccess, isLoading, moduleCode, redirectTo, showPopup, navigate, showActivationPopup]);

  return {
    hasAccess,
    isLoading,
  };
}
