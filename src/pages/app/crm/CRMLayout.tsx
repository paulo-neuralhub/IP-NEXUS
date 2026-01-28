import { Outlet } from 'react-router-dom';
import { ModuleGate } from '@/components/common/ModuleGate';

/**
 * CRM Layout - Contenedor simple que envuelve las páginas del módulo CRM.
 * La navegación del CRM se maneja desde el sidebar principal de la app.
 */
export default function CRMLayout() {
  return (
    <ModuleGate module="crm">
      <Outlet />
    </ModuleGate>
  );
}
