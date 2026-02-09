import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';

export function GS005Content() {
  return (
    <>
      <p>
        Uno de los mayores riesgos en la gestión de PI es <strong>perder un plazo</strong>. IP-NEXUS
        te permite configurar alertas automáticas para que nunca se te escape un vencimiento,
        una renovación o un plazo procesal.
      </p>

      <HelpCallout type="warning">
        Perder un plazo de renovación puede significar la pérdida de un derecho de PI. Configura
        las alertas desde el primer día.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Paso a paso</h2>

      <HelpStep
        number={1}
        title="Accede a la configuración de alertas"
        description="Ve a Configuración → Notificaciones → Plazos y alertas. Aquí puedes definir las reglas generales para todas tus alertas."
      />

      <HelpStep
        number={2}
        title="Define cuándo avisar"
        description="Selecciona con cuántos días de antelación quieres recibir la alerta. Puedes configurar múltiples avisos: por ejemplo, a 30 días, 15 días, 7 días y 1 día antes del vencimiento."
        tip="Recomendamos al menos 3 recordatorios: a 30, 7 y 1 día antes."
      />

      <HelpStep
        number={3}
        title="Elige los canales"
        description="Selecciona cómo recibir las alertas: notificación in-app, email, o ambas. Para plazos críticos, activa el email para asegurarte de no perderlos."
      />

      <HelpStep
        number={4}
        title="Configura el escalado"
        description="Opcionalmente, puedes configurar que si un plazo no se atiende a tiempo, se escale a un supervisor o manager del equipo."
        tip="El escalado es especialmente útil cuando gestionas un gran volumen de expedientes."
      />

      <HelpStep
        number={5}
        title="Alertas por expediente"
        description="Además de las reglas generales, puedes añadir alertas específicas dentro de cada expediente. Ve a un expediente → Plazos → Añadir alerta."
      />

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Tipos de plazos automáticos</h2>
      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1.5">
        <li><strong>Renovaciones de marca</strong>: cada 10 años desde la solicitud</li>
        <li><strong>Anualidades de patente</strong>: pago anual a partir del 3er año</li>
        <li><strong>Plazos de oposición</strong>: 3 meses desde la publicación (EUIPO)</li>
        <li><strong>Plazos procesales</strong>: configurables según jurisdicción</li>
      </ul>

      <HelpCallout type="info">
        IP-NEXUS calcula automáticamente las fechas de renovación y vencimiento basándose en la
        jurisdicción y el tipo de PI. Solo necesitas revisar y confirmar.
      </HelpCallout>
    </>
  );
}
