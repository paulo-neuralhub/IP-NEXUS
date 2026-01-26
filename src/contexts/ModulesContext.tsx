// =============================================
// CONTEXT: ModulesContext
// src/contexts/ModulesContext.tsx
// =============================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useModules, UseModulesReturn } from '@/hooks/useModules';

interface ModulesContextValue extends UseModulesReturn {
  // Estado del popup de activación
  activationPopup: {
    isOpen: boolean;
    moduleCode: string | null;
  };
  showActivationPopup: (moduleCode: string) => void;
  hideActivationPopup: () => void;
  
  // Acceso rápido
  requireModule: (moduleCode: string) => boolean;
}

const ModulesContext = createContext<ModulesContextValue | null>(null);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const modules = useModules();
  
  const [activationPopup, setActivationPopup] = useState({
    isOpen: false,
    moduleCode: null as string | null,
  });

  const showActivationPopup = useCallback((moduleCode: string) => {
    setActivationPopup({ isOpen: true, moduleCode });
  }, []);

  const hideActivationPopup = useCallback(() => {
    setActivationPopup({ isOpen: false, moduleCode: null });
  }, []);

  // Verificar módulo y mostrar popup si no tiene
  const requireModule = useCallback((moduleCode: string): boolean => {
    if (modules.hasModule(moduleCode)) {
      return true;
    }
    showActivationPopup(moduleCode);
    return false;
  }, [modules.hasModule, showActivationPopup]);

  return (
    <ModulesContext.Provider
      value={{
        ...modules,
        activationPopup,
        showActivationPopup,
        hideActivationPopup,
        requireModule,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModulesContext() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModulesContext debe usarse dentro de ModulesProvider');
  }
  return context;
}
