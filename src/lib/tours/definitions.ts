export type TourId = "docket" | "crm" | "genius";

export type TourStep = {
  tourId: TourId;
  stepId: string;
  title: string;
  content: string;
  route: string;
  target: string; // CSS selector
};

export const TOURS: Record<TourId, { title: string; description: string; steps: TourStep[] }> = {
  docket: {
    title: "DOCKET · Expedientes",
    description: "Gestiona expedientes, filtros, detalles y plazos.",
    steps: [
      {
        tourId: "docket",
        stepId: "docket_list",
        title: "Vista general de expedientes",
        content: "Aquí tienes la lista de expedientes. Desde aquí accedes al detalle y al estado de cada activo.",
        route: "/app/docket",
        target: '[data-tour="docket-list"]',
      },
      {
        tourId: "docket",
        stepId: "docket_new",
        title: "Crear nuevo expediente",
        content: "Crea un expediente (marca/patente/diseño) para empezar a operar y generar alertas.",
        route: "/app/docket",
        target: '[data-tour="docket-new"]',
      },
      {
        tourId: "docket",
        stepId: "docket_filters",
        title: "Filtros y búsqueda",
        content: "Filtra por tipo, estado y jurisdicción. La búsqueda encuentra por título, referencia y marca.",
        route: "/app/docket",
        target: '[data-tour="docket-filters"]',
      },
      {
        tourId: "docket",
        stepId: "docket_detail",
        title: "Detalle de expediente",
        content: "En el detalle puedes ver documentos, historial, costes y colaboración.",
        route: "/app/docket",
        target: '[data-tour="docket-row"]',
      },
      {
        tourId: "docket",
        stepId: "docket_deadlines",
        title: "Plazos y alertas",
        content: "Aquí gestionas vencidos/urgentes/próximos y el calendario de plazos.",
        route: "/app/docket/deadlines",
        target: '[data-tour="docket-deadlines"]',
      },
    ],
  },
  crm: {
    title: "CRM · Clientes",
    description: "Gestiona clientes, ficha, timeline y tareas.",
    steps: [
      {
        tourId: "crm",
        stepId: "crm_list",
        title: "Lista de clientes",
        content: "Aquí gestionas contactos (personas/empresas) y su ciclo de vida (lead/cliente).",
        route: "/app/crm/contacts",
        target: '[data-tour="crm-contacts-list"]',
      },
      {
        tourId: "crm",
        stepId: "crm_detail",
        title: "Ficha de cliente",
        content: "En la ficha ves información, deals asociados y acciones rápidas.",
        route: "/app/crm/contacts",
        target: '[data-tour="crm-contact-row"]',
      },
      {
        tourId: "crm",
        stepId: "crm_timeline",
        title: "Timeline de comunicaciones",
        content: "Toda interacción (email/llamada/nota/tarea/reunión) queda en el timeline.",
        route: "/app/crm/contacts",
        target: '[data-tour="crm-timeline"]',
      },
      {
        tourId: "crm",
        stepId: "crm_tasks",
        title: "Tareas asociadas",
        content: "Las tareas ayudan a sistematizar seguimiento y priorización por cuenta/cliente.",
        route: "/app/crm/tasks",
        target: '[data-tour="crm-tasks-list"]',
      },
    ],
  },
  genius: {
    title: "GENIUS · IA",
    description: "Análisis, generación de documentos y predicciones.",
    steps: [
      {
        tourId: "genius",
        stepId: "genius_analysis",
        title: "Panel de análisis",
        content: "Define el contexto (tipo y jurisdicción) y lanza un análisis con IA.",
        route: "/app/genius/analysis",
        target: '[data-tour="genius-analysis"]',
      },
      {
        tourId: "genius",
        stepId: "genius_docs",
        title: "Generador de documentos",
        content: "Genera borradores (oposición, OA response, informes) y revísalos antes de usar.",
        route: "/app/genius/documents-gen",
        target: '[data-tour="genius-docs"]',
      },
      {
        tourId: "genius",
        stepId: "genius_predictions",
        title: "Predicciones",
        content: "Predicciones y scoring (placeholder por ahora) para apoyar decisiones.",
        route: "/app/genius/predictions",
        target: '[data-tour="genius-predictions"]',
      },
    ],
  },
};
