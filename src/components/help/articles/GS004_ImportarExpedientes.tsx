import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function GS004Content() {
  return (
    <>
      <p>
        Si ya gestionas expedientes de PI en otro software o en hojas de cálculo, IP-NEXUS te
        permite <strong>importarlos de forma masiva</strong> para que no tengas que empezar de cero.
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Formatos soportados</h2>
      <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1 mb-6">
        <li><strong>Excel</strong> (.xlsx, .xls)</li>
        <li><strong>CSV</strong> (separado por comas o punto y coma)</li>
        <li><strong>Migración asistida</strong> desde otros sistemas IP (consulta con soporte)</li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Paso a paso</h2>

      <HelpStep
        number={1}
        title="Prepara tu archivo"
        description="Organiza tus datos en un archivo Excel o CSV con una fila por expediente. Asegúrate de incluir al menos las columnas obligatorias."
      />

      <h3 className="text-base font-semibold text-foreground mt-4 mb-3">Columnas requeridas</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Columna</TableHead>
            <TableHead>Obligatoria</TableHead>
            <TableHead>Ejemplo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell className="font-medium">Referencia</TableCell><TableCell>Sí</TableCell><TableCell>MRC-2024-001</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Tipo</TableCell><TableCell>Sí</TableCell><TableCell>Marca</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Denominación</TableCell><TableCell>Sí</TableCell><TableCell>AURORA</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Titular</TableCell><TableCell>Sí</TableCell><TableCell>Tech Corp S.L.</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Jurisdicción</TableCell><TableCell>Sí</TableCell><TableCell>EUIPO</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Estado</TableCell><TableCell>No</TableCell><TableCell>En trámite</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Fecha solicitud</TableCell><TableCell>No</TableCell><TableCell>2024-01-15</TableCell></TableRow>
          <TableRow><TableCell className="font-medium">Clases</TableCell><TableCell>No</TableCell><TableCell>9, 35, 42</TableCell></TableRow>
        </TableBody>
      </Table>

      <HelpStep
        number={2}
        title="Sube el archivo"
        description="Ve a Configuración → Importar datos → Importar expedientes. Arrastra o selecciona tu archivo. IP-NEXUS detectará automáticamente las columnas."
      />

      <HelpStep
        number={3}
        title="Mapea los campos"
        description="Revisa que cada columna de tu archivo se corresponde con el campo correcto en IP-NEXUS. El sistema sugiere el mapeo automáticamente, pero puedes ajustarlo."
      />

      <HelpStep
        number={4}
        title="Revisa y confirma"
        description="Antes de importar, verás una preview de los datos con los expedientes a importar, advertencias sobre datos incompletos y opciones para duplicados."
        warning="La importación masiva no se puede deshacer automáticamente. Revisa bien los datos antes de confirmar."
      />

      <HelpStep
        number={5}
        title="Importa"
        description="Haz click en 'Importar' y espera a que el proceso finalice. Recibirás un informe con expedientes importados correctamente, advertencias y errores."
      />

      <HelpCallout type="tip">
        Si tienes más de 500 expedientes, contacta con nuestro equipo para una <strong>migración asistida gratuita</strong>.
        Nos encargamos de importar y validar todos tus datos.
      </HelpCallout>
    </>
  );
}
