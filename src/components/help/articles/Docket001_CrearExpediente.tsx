import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';
import { MockupCreateMatter } from '../ScreenshotMockups';

export function Docket001Content() {
  return (
    <>
      <p>
        El módulo IP-Docket es el <strong>corazón de IP-NEXUS</strong>. Cada expediente almacena
        toda la información de un caso de PI: datos del titular, jurisdicción, documentos,
        plazos, costes e historial de actividad.
      </p>

      <HelpCallout type="info">
        Este artículo cubre la creación detallada de expedientes. Si es tu primera vez, consulta
        primero <a href="/app/help/article/primer-expediente" className="text-primary underline">Crear tu primer expediente</a> para una versión más resumida.
      </HelpCallout>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Proceso completo</h2>

      <HelpStep
        number={1}
        title="Abre el formulario de creación"
        description="Navega a Expedientes en el sidebar y haz click en '+ Nuevo expediente'. Se abrirá el wizard de creación con varios pasos."
        tip="Atajo rápido: ⌘+N desde cualquier página."
      />

      <HelpStep
        number={2}
        title="Paso 1: Tipo de PI"
        description="Selecciona el tipo de derecho de propiedad intelectual: Marca, Patente, Diseño industrial o Litigio. Cada tipo mostrará campos adaptados."
        screenshotComponent={<MockupCreateMatter />}
      />

      <HelpStep
        number={3}
        title="Paso 2: Datos del titular"
        description="Selecciona un contacto existente del CRM o crea uno nuevo. El titular es la persona física o jurídica que será propietaria del derecho."
        tip="Si el titular es una empresa, asegúrate de que la razón social coincida exactamente con la registrada en la oficina de PI."
      />

      <HelpStep
        number={4}
        title="Paso 3: Jurisdicción y clasificación"
        description="Elige la oficina de PI (OEPM, EUIPO, WIPO, etc.) y, para marcas, selecciona las clases de Niza aplicables. Para patentes, indica la clasificación CPC/IPC."
      />

      <HelpStep
        number={5}
        title="Paso 4: Datos adicionales"
        description="Completa información opcional como referencia interna, representante, notas internas, prioridades y fechas clave."
      />

      <HelpStep
        number={6}
        title="Paso 5: Documentos"
        description="Adjunta documentos relevantes: logo de marca (para marcas figurativas), memoria descriptiva (patentes), fotografías (diseños), poderes, etc."
        warning="Los archivos no pueden superar los 50 MB por documento. Formatos aceptados: PDF, DOCX, XLSX, PNG, JPG, TIFF."
      />

      <HelpStep
        number={7}
        title="Crear y configurar"
        description="Haz click en 'Crear expediente'. El expediente se creará en estado Borrador. Desde la ficha del expediente podrás añadir plazos, costes estimados y activar la vigilancia."
      />

      <HelpCallout type="tip">
        Después de crear el expediente, activa la <strong>vigilancia en IP-Spider</strong> para
        recibir alertas si se solicitan marcas similares en la misma jurisdicción.
      </HelpCallout>
    </>
  );
}
