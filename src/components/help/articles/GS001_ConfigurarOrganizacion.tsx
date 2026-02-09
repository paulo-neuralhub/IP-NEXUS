import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';

export function GS001Content() {
  return (
    <>
      <p>
        Antes de empezar a trabajar con expedientes y clientes, es importante configurar los datos
        de tu <strong>organización</strong>. Estos datos se utilizarán en comunicaciones,
        documentos generados y facturación.
      </p>

      <HelpCallout type="info">
        Solo los usuarios con rol <strong>Admin</strong> u <strong>Owner</strong> pueden modificar
        los ajustes de la organización.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Paso a paso</h2>

      <HelpStep
        number={1}
        title="Accede a Configuración"
        description="En el sidebar izquierdo, haz click en el icono de engranaje (⚙️) o navega a Configuración → Organización."
        tip="También puedes acceder desde tu perfil (avatar) → Configuración de organización."
      />

      <HelpStep
        number={2}
        title="Datos básicos"
        description="Rellena el nombre de tu despacho o empresa, el slug (URL corta) y una descripción breve. Esta información será visible para los miembros de tu equipo."
      />

      <HelpStep
        number={3}
        title="Logo y branding"
        description="Sube el logotipo de tu organización. Se recomienda un archivo PNG o SVG con fondo transparente y dimensiones mínimas de 200×200px. El logo aparecerá en el sidebar, documentos e informes."
        tip="Usa un logo cuadrado para que se vea bien en todos los tamaños."
      />

      <HelpStep
        number={4}
        title="Datos fiscales"
        description="Introduce el NIF/CIF, dirección fiscal y datos de contacto. Son necesarios para la generación de facturas y presupuestos desde el módulo Finance."
        warning="Si no introduces los datos fiscales, no podrás generar facturas desde IP-NEXUS."
      />

      <HelpStep
        number={5}
        title="Zona horaria e idioma"
        description="Selecciona la zona horaria de tu oficina principal y el idioma por defecto. Los plazos y alertas se calcularán según esta configuración."
      />

      <HelpStep
        number={6}
        title="Guarda los cambios"
        description="Haz click en 'Guardar' para aplicar la configuración. Los cambios se reflejarán inmediatamente en toda la plataforma."
      />

      <HelpCallout type="tip">
        Tras configurar tu organización, el siguiente paso es
        <a href="/app/help/article/invitar-equipo" className="text-primary underline ml-1">invitar a tu equipo</a>.
      </HelpCallout>
    </>
  );
}
