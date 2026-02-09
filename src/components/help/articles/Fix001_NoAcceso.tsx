import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';

export function Fix001Content() {
  return (
    <>
      <p>
        Si no puedes acceder a tu cuenta de IP-NEXUS, sigue estos pasos para solucionar
        el problema. La mayoría de los casos se resuelven en menos de 2 minutos.
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Soluciones por problema</h2>

      <h3 className="text-base font-semibold text-foreground mt-6 mb-3">He olvidado mi contraseña</h3>

      <HelpStep
        number={1}
        title="Ve a la pantalla de login"
        description="Abre app.ip-nexus.com y haz click en '¿Olvidaste tu contraseña?'."
      />

      <HelpStep
        number={2}
        title="Introduce tu email"
        description="Escribe el email con el que te registraste. Recibirás un enlace para restablecer la contraseña."
        tip="Revisa la carpeta de spam si no encuentras el email en tu bandeja de entrada."
      />

      <HelpStep
        number={3}
        title="Crea una nueva contraseña"
        description="Haz click en el enlace del email y crea una contraseña nueva. Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial."
      />

      <h3 className="text-base font-semibold text-foreground mt-8 mb-3">Mi cuenta está bloqueada</h3>

      <HelpCallout type="warning">
        Después de 5 intentos fallidos de login, tu cuenta se bloquea temporalmente durante 15 minutos
        como medida de seguridad.
      </HelpCallout>

      <HelpStep
        number={1}
        title="Espera 15 minutos"
        description="El bloqueo se levanta automáticamente después de 15 minutos. No intentes acceder durante este tiempo."
      />

      <HelpStep
        number={2}
        title="Restablece tu contraseña"
        description="Si no recuerdas la contraseña, usa la opción de restablecimiento para evitar volver a bloquearte."
      />

      <h3 className="text-base font-semibold text-foreground mt-8 mb-3">No recibí la invitación</h3>

      <HelpStep
        number={1}
        title="Verifica el email"
        description="Asegúrate de que tu administrador envió la invitación al email correcto."
      />

      <HelpStep
        number={2}
        title="Revisa spam y promociones"
        description="Los emails de IP-NEXUS pueden terminar en carpetas de spam, especialmente la primera vez."
        tip="Añade noreply@ip-nexus.com a tus contactos para evitar que futuros emails vayan a spam."
      />

      <HelpStep
        number={3}
        title="Solicita reenvío"
        description="Pide a tu administrador que reenvíe la invitación desde Configuración → Usuarios. Las invitaciones expiran a los 7 días."
      />

      <h3 className="text-base font-semibold text-foreground mt-8 mb-3">Veo un error al cargar</h3>

      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1.5 mb-4">
        <li>Limpia la caché del navegador (Ctrl+Shift+Delete)</li>
        <li>Prueba en una ventana de incógnito</li>
        <li>Desactiva las extensiones del navegador</li>
        <li>Prueba con otro navegador (Chrome, Firefox, Safari)</li>
      </ul>

      <HelpCallout type="danger">
        Si ninguna de estas soluciones funciona, <a href="/app/help/article/contactar-soporte" className="text-primary underline">contacta con soporte</a>.
        Incluye capturas de pantalla del error y el navegador que estás usando.
      </HelpCallout>
    </>
  );
}
