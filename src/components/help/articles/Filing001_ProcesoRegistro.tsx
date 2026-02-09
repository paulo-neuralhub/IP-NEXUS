import { HelpStep } from '../HelpStep';
import { HelpCallout } from '../HelpCallout';

export function Filing001Content() {
  return (
    <>
      <p>
        El registro de una marca es un proceso que pasa por varias fases, desde la preparación
        de la solicitud hasta la obtención del certificado. IP-NEXUS te guía en cada paso y
        <strong> automatiza el seguimiento</strong> de todo el proceso.
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Fases del registro</h2>

      <HelpStep
        number={1}
        title="Búsqueda de anterioridades"
        description="Antes de solicitar, es fundamental comprobar que no existen marcas idénticas o similares ya registradas. Usa IP-Genius para un análisis automático de riesgos."
        tip="Una búsqueda de anterioridades puede ahorrarte meses y miles de euros en oposiciones."
      />

      <HelpStep
        number={2}
        title="Preparación de la solicitud"
        description="Reúne toda la documentación necesaria: denominación, logotipo (si aplica), lista de productos/servicios, datos del titular y representante."
      />

      <HelpStep
        number={3}
        title="Presentación ante la oficina"
        description="La solicitud se presenta ante la oficina de PI correspondiente (OEPM, EUIPO, WIPO). IP-NEXUS genera la documentación y te conecta con Data Hub para envío electrónico."
        warning="Una vez presentada, no se pueden modificar los productos/servicios ni añadir clases. Revisa todo antes de enviar."
      />

      <HelpStep
        number={4}
        title="Examen de forma y fondo"
        description="La oficina revisa que la solicitud cumple los requisitos formales y, en algunos casos, examina si la marca es registrable (marcas descriptivas, genéricas, etc.)."
      />

      <HelpStep
        number={5}
        title="Publicación"
        description="Si supera el examen, la marca se publica en el Boletín Oficial. Se abre un período de oposición (generalmente 2-3 meses) en el que terceros pueden oponerse."
        tip="Activa la vigilancia en IP-Spider para detectar si alguien se opone a tu marca."
      />

      <HelpStep
        number={6}
        title="Concesión"
        description="Si no hay oposiciones (o se resuelven favorablemente), la oficina emite el certificado de registro. ¡Tu marca está registrada!"
      />

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-4">Plazos típicos</h2>

      <div className="space-y-2 text-sm text-foreground/80">
        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
          <span className="font-medium">🇪🇸 OEPM (España)</span>
          <span>6-8 meses</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
          <span className="font-medium">🇪🇺 EUIPO (Unión Europea)</span>
          <span>4-6 meses</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
          <span className="font-medium">🌍 WIPO (Internacional)</span>
          <span>12-18 meses</span>
        </div>
        <div className="flex justify-between p-3 rounded-lg bg-muted/50">
          <span className="font-medium">🇺🇸 USPTO (EE.UU.)</span>
          <span>8-12 meses</span>
        </div>
      </div>

      <HelpCallout type="info">
        IP-NEXUS actualiza automáticamente el estado del expediente en cada fase si tienes conectada
        la oficina en Data Hub.
      </HelpCallout>
    </>
  );
}
