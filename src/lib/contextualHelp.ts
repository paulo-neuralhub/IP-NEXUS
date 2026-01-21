// ============================================================
// IP-NEXUS HELP - CONTEXTUAL HELP MAPS
// Prompt P78: Contextual Help System
// ============================================================

export interface ContextualGuideStep {
  title: string;
  description: string;
  image?: string;
}

export interface ContextualGuide {
  title: string;
  steps: ContextualGuideStep[];
}

// Mapeo de rutas/features a sus guías
export const CONTEXTUAL_HELP: Record<string, ContextualGuide> = {
  dashboard: {
    title: "🎉 Bienvenido a IP-NEXUS",
    steps: [
      {
        title: "Tu Dashboard",
        description:
          "Aquí verás un resumen de tu portafolio de PI, alertas pendientes y próximas fechas límite.",
      },
      {
        title: "Barra de búsqueda",
        description:
          "Usa la búsqueda para encontrar marcas, patentes o expedientes rápidamente. También puedes hablar con IP-Genius.",
      },
      {
        title: "Menú lateral",
        description:
          "Navega entre los diferentes módulos: Expedientes, Búsquedas, Vigilancia, Marketplace y más.",
      },
    ],
  },
  matters: {
    title: "📁 Gestión de Expedientes",
    steps: [
      {
        title: "Crea tu primer expediente",
        description:
          "Haz clic en \"Nuevo Expediente\" para registrar una marca, patente o diseño.",
      },
      {
        title: "Organiza por tipo",
        description:
          "Filtra por tipo de PI (marca, patente, diseño) o estado para encontrar lo que buscas.",
      },
      {
        title: "Alertas automáticas",
        description:
          "El sistema te avisará de fechas límite, renovaciones y acciones requeridas.",
      },
    ],
  },
  market: {
    title: "🏪 IP-MARKET",
    steps: [
      {
        title: "Explora agentes",
        description: "Encuentra profesionales de PI verificados en cualquier jurisdicción.",
      },
      {
        title: "Solicita presupuestos",
        description: "Describe tu necesidad y recibe propuestas de múltiples agentes.",
      },
      {
        title: "Compara y contrata",
        description: "Revisa perfiles, ratings y elige al mejor profesional para tu caso.",
      },
    ],
  },
  "ai-genius": {
    title: "🤖 IP-Genius",
    steps: [
      {
        title: "Tu asistente de PI",
        description:
          "IP-Genius puede responder preguntas, analizar documentos y ayudarte con tareas complejas.",
      },
      {
        title: "Contexto inteligente",
        description:
          "El asistente entiende en qué página estás y puede acceder a tus datos para dar respuestas relevantes.",
      },
      {
        title: "Ejemplos de uso",
        description:
          "\"Analiza mi marca X\", \"¿Cuándo vence la patente Y?\", \"Redacta una respuesta a esta oposición\".",
      },
    ],
  },
};

// Tooltips por campo
export const FIELD_TOOLTIPS: Record<string, string> = {
  "matter.reference": "Número de referencia único para identificar este expediente internamente.",
  "matter.niceClasses":
    "Clases de la Clasificación de Niza para marcas. Selecciona las clases que cubren tus productos/servicios.",
  "matter.priority":
    "Reclamo de prioridad basado en una solicitud anterior. Tienes 6 meses desde la primera solicitud.",
  "trademark.distinctiveness":
    "La distintividad es clave para el registro. Marcas genéricas o descriptivas tienen más dificultad.",
  "patent.claims":
    "Las reivindicaciones definen el alcance de protección. Deben ser claras, concisas y soportadas por la descripción.",
  "quote.budget": "Presupuesto estimado. Los agentes pueden ajustar según la complejidad del caso.",
};
