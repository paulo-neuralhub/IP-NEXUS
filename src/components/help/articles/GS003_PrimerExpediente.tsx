import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';
import { MockupCreateMatter } from '../ScreenshotMockups';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function GS003Content() {
  return (
    <>
      <p>
        Un <strong>expediente</strong> en IP-NEXUS representa un caso de Propiedad Intelectual:
        una marca que quieres registrar, una patente en proceso, un diseño protegido o un litigio.
        Toda la información relevante del caso se organiza dentro del expediente.
      </p>

      <HelpCallout type="info">
        Si ya tienes expedientes en otro sistema o en Excel, puedes importarlos automáticamente.
        Consulta la guía <a href="/app/help/article/importar-expedientes" className="text-primary underline">Importar expedientes existentes</a>.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Paso a paso</h2>

      <HelpStep
        number={1}
        title="Accede a IP-Docket"
        description="En el sidebar izquierdo, haz click en 'Expedientes' o usa el atajo ⌘+2. Verás la lista de todos tus expedientes (vacía si es tu primera vez)."
        tip="También puedes crear un expediente rápido desde cualquier página con ⌘+N."
      />

      <HelpStep
        number={2}
        title="Haz click en 'Crear nuevo'"
        description="En la esquina superior derecha encontrarás el botón 'Crear nuevo'. Haz click y se abrirá el formulario de creación."
      />

      <HelpStep
        number={3}
        title="Selecciona el tipo de IP"
        description="Lo primero es elegir qué tipo de expediente vas a crear. Cada tipo tiene campos específicos adaptados a su naturaleza."
        screenshotComponent={<MockupCreateMatter />}
      />

      <HelpStep
        number={4}
        title="Rellena los datos del expediente"
        description="Completa la información básica: nombre de la marca, cliente, jurisdicción y clases Niza. No te preocupes si no tienes toda la información — puedes completar los datos más tarde."
        tip="Para marcas, las clases Niza más comunes son: 9 (tecnología), 25 (ropa), 35 (servicios empresariales) y 42 (servicios tecnológicos)."
      />

      <HelpStep
        number={5}
        title="Guarda el expediente"
        description="Haz click en 'Crear expediente' y listo. Tu expediente aparecerá en la lista de IP-Docket. Ahora puedes añadir documentos, notas, plazos y más."
      />

      <HelpCallout type="tip">
        Después de crear tu primer expediente, te recomendamos configurar las alertas de vencimiento.
        Consulta <a href="/app/help/article/configurar-alertas" className="text-primary underline">Configurar plazos y alertas</a>.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Campos del expediente</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>¿Obligatorio?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-medium">Tipo de IP</TableCell><TableCell>Marca, Patente, Diseño o Litigio</TableCell><TableCell>✅ Sí</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Nombre / Denominación</TableCell><TableCell>Nombre de la marca, título de la patente, etc.</TableCell><TableCell>✅ Sí</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Referencia interna</TableCell><TableCell>Tu código interno para identificar el caso</TableCell><TableCell>Opcional</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Cliente</TableCell><TableCell>Contacto asociado al expediente</TableCell><TableCell>Recomendado</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Jurisdicción</TableCell><TableCell>España (OEPM), UE (EUIPO), Internacional (WIPO), etc.</TableCell><TableCell>Recomendado</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Clases Niza</TableCell><TableCell>Clases de productos/servicios (solo para marcas)</TableCell><TableCell>Para marcas</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Estado</TableCell><TableCell>Fase actual del expediente</TableCell><TableCell>Automático</TableCell></TableRow>
        </TableBody>
      </Table>

      <HelpCallout type="warning">
        Los campos obligatorios pueden variar según el tipo de IP seleccionado.
        Para patentes, por ejemplo, se requiere el número de solicitud y la fecha de prioridad.
      </HelpCallout>
    </>
  );
}
