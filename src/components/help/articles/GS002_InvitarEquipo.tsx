import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function GS002Content() {
  return (
    <>
      <p>
        IP-NEXUS funciona mejor cuando trabajas en equipo. Puedes invitar a miembros de tu despacho
        y asignarles <strong>roles con permisos específicos</strong> para controlar qué puede ver y
        hacer cada persona.
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Paso a paso</h2>

      <HelpStep
        number={1}
        title="Accede a la gestión de equipo"
        description="Ve a Configuración → Usuarios y equipo. Verás la lista de todos los miembros actuales de tu organización."
      />

      <HelpStep
        number={2}
        title="Haz click en 'Invitar miembro'"
        description="Introduce la dirección de email de la persona que quieres invitar. Puedes invitar a varias personas a la vez separando los emails con comas."
        tip="Puedes pegar una lista de emails directamente desde Excel o un archivo de texto."
      />

      <HelpStep
        number={3}
        title="Selecciona el rol"
        description="Elige el rol que tendrá el nuevo miembro. Cada rol tiene permisos predefinidos que puedes personalizar después."
      />

      <HelpStep
        number={4}
        title="Envía la invitación"
        description="Haz click en 'Enviar invitación'. El usuario recibirá un email con un enlace para crear su cuenta y unirse a tu organización."
        warning="Las invitaciones expiran en 7 días. Si no se aceptan, deberás reenviarlas."
      />

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Roles disponibles</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead>Expedientes</TableHead>
            <TableHead>CRM</TableHead>
            <TableHead>Configuración</TableHead>
            <TableHead>Facturación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-medium">Owner</TableCell><TableCell>✅ Todo</TableCell><TableCell>✅ Todo</TableCell><TableCell>✅ Todo</TableCell><TableCell>✅</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Admin</TableCell><TableCell>✅ Todo</TableCell><TableCell>✅ Todo</TableCell><TableCell>✅ Todo</TableCell><TableCell>❌</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Manager</TableCell><TableCell>✅ CRUD</TableCell><TableCell>✅ CRUD</TableCell><TableCell>Parcial</TableCell><TableCell>❌</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Member</TableCell><TableCell>Asignados</TableCell><TableCell>Asignados</TableCell><TableCell>❌</TableCell><TableCell>❌</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Viewer</TableCell><TableCell>Solo lectura</TableCell><TableCell>Solo lectura</TableCell><TableCell>❌</TableCell><TableCell>❌</TableCell></TableRow>
        </TableBody>
      </Table>

      <HelpCallout type="info">
        El número de usuarios disponibles depende de tu plan. Consulta
        <a href="/app/help/article/planes-precios" className="text-primary underline ml-1">Planes y precios</a>
        para ver los límites de cada plan.
      </HelpCallout>
    </>
  );
}
