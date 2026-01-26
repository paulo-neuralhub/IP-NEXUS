// =============================================
// COMPONENTE: ModuleGuard
// Protege rutas que requieren un módulo activo
// src/components/modules/ModuleGuard.tsx
// =============================================

import { ReactNode } from 'react';
import { useModulesContext } from '@/contexts/ModulesContext';
import { ModuleBlockedPage } from './ModuleBlockedPage';

interface ModuleGuardProps {
  moduleCode: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ModuleGuard({ 
  moduleCode, 
  children, 
  fallback 
}: ModuleGuardProps) {
  const { hasModule, isLoading } = useModulesContext();

  // Mientras carga, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Si tiene el módulo, renderizar children
  if (hasModule(moduleCode)) {
    return <>{children}</>;
  }

  // Si no tiene el módulo, mostrar página bloqueada o fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  return <ModuleBlockedPage moduleCode={moduleCode} />;
}
