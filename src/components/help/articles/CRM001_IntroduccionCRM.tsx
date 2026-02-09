import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';

export function CRM001Content() {
  return (
    <>
      <p>
        El CRM de IP-NEXUS es un sistema de gestión de relaciones comerciales <strong>diseñado
        específicamente para profesionales de PI</strong>. A diferencia de un CRM genérico, está
        integrado con tus expedientes, plazos y documentos.
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">¿Qué puedes hacer?</h2>
      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1.5 mb-6">
        <li>Gestionar <strong>contactos</strong> (clientes, empresas, representantes)</li>
        <li>Crear <strong>pipelines de ventas</strong> con etapas personalizables</li>
        <li>Registrar <strong>actividades</strong> (llamadas, emails, reuniones)</li>
        <li>Ver el <strong>timeline completo</strong> de cada contacto</li>
        <li>Vincular contactos con <strong>expedientes</strong></li>
        <li>Ofrecer un <strong>portal de cliente</strong> para seguimiento</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Primeros pasos con el CRM</h2>

      <HelpStep
        number={1}
        title="Accede al módulo CRM"
        description="Haz click en 'CRM' en el sidebar. Verás el panel principal con un resumen de contactos, deals activos y actividades recientes."
      />

      <HelpStep
        number={2}
        title="Crea tu primer contacto"
        description="Haz click en '+ Nuevo contacto' y rellena los datos: nombre, email, teléfono, empresa. Puedes clasificar los contactos como personas o empresas."
        tip="Si ya tienes contactos en otro sistema, puedes importarlos desde un archivo CSV."
      />

      <HelpStep
        number={3}
        title="Configura tu pipeline"
        description="Ve a CRM → Configuración → Pipelines. IP-NEXUS incluye pipelines predefinidos para PI (captación, registro de marca, renovaciones, oposiciones) que puedes personalizar."
      />

      <HelpStep
        number={4}
        title="Crea tu primer deal"
        description="Un deal representa una oportunidad de negocio. Crea uno asociándolo a un contacto y un pipeline. Muévelo entre etapas arrastrando en la vista Kanban."
      />

      <HelpCallout type="info">
        El CRM es un módulo <strong>premium</strong> disponible en el plan Business y superior.
        En el plan Professional puedes gestionar contactos básicos.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Vistas disponibles</h2>
      <div className="space-y-2 text-sm text-foreground/80">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="font-medium min-w-[80px]">📋 Lista</span>
          <span>Tabla con filtros avanzados, ordenación y búsqueda. Ideal para gestión masiva.</span>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="font-medium min-w-[80px]">📊 Kanban</span>
          <span>Arrastra deals entre etapas del pipeline. La vista más visual para ventas.</span>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="font-medium min-w-[80px]">📅 Calendario</span>
          <span>Visualiza actividades programadas por fecha. Útil para seguimiento.</span>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <span className="font-medium min-w-[80px]">📈 Reportes</span>
          <span>Métricas de conversión, valor del pipeline y rendimiento del equipo.</span>
        </div>
      </div>
    </>
  );
}
