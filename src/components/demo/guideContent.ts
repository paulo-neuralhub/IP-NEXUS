// ============================================================
// IP-NEXUS - DEMO GUIDE CONTENT
// Contenido contextual para la guía de demostración
// ============================================================

export interface GuideSection {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  demoTips: string[];
}

export const GUIDE_CONTENT: Record<string, GuideSection> = {
  // ============ DASHBOARD ============
  '/app/dashboard': {
    icon: '📊',
    title: 'Dashboard',
    subtitle: 'Centro de control de tu despacho',
    description: 'Visibilidad 360° de toda la actividad. KPIs en tiempo real, alertas y accesos rápidos.',
    features: [
      'KPIs personalizables por rol',
      'Plazos urgentes destacados en rojo',
      'Gráficos de actividad mensual',
      'Acceso rápido a expedientes recientes',
    ],
    demoTips: [
      'Haz clic en un KPI para mostrar el detalle',
      'Señala los plazos que parpadean (urgentes)',
      'Muestra cómo arrastrar widgets para personalizar',
    ],
  },

  // ============ EXPEDIENTES ============
  '/app/expedientes': {
    icon: '📁',
    title: 'Gestión de Expedientes',
    subtitle: 'Control total de tu cartera IP',
    description: 'Gestiona marcas, patentes, diseños y más. Búsqueda instantánea y filtros avanzados.',
    features: [
      'Todos los tipos de IP en un lugar',
      'Búsqueda en 0.3 segundos',
      'Filtros por estado, tipo, cliente',
      'Vista en lista o tarjetas',
    ],
    demoTips: [
      'Usa Ctrl+K para búsqueda rápida global',
      'Muestra la vista de tarjetas para visualizar mejor',
      'Filtra por "Oposiciones" para mostrar gestión de conflictos',
    ],
  },

  // ============ DOCKET / MATTERS ============
  '/app/docket': {
    icon: '📋',
    title: 'Docket - Gestión IP',
    subtitle: 'Cartera de propiedad intelectual',
    description: 'Gestión integral de marcas, patentes, diseños y todos tus activos de PI.',
    features: [
      'Vista unificada de todos los activos',
      'Seguimiento de estados y renovaciones',
      'Alertas automáticas de vencimientos',
      'Vinculación con clientes y documentos',
    ],
    demoTips: [
      'Muestra diferentes tipos de activos IP',
      'Filtra por estado para ver renovaciones pendientes',
      'Abre un expediente para mostrar el detalle completo',
    ],
  },

  // ============ PLAZOS ============
  '/app/plazos': {
    icon: '⏰',
    title: 'Control de Plazos',
    subtitle: 'Nunca más pierdas un plazo',
    description: 'Sistema de alertas multinivel que garantiza 100% de cumplimiento.',
    features: [
      'Vista calendario y lista',
      'Alertas escalonadas (30, 15, 7, 3, 1 día)',
      'Notificaciones email + SMS + llamada',
      'Asignación de responsables backup',
    ],
    demoTips: [
      'Cambia a vista calendario',
      'Muestra un plazo urgente (rojo parpadeante)',
      'Explica el sistema de escalado de alertas',
    ],
  },

  // ============ CRM / CLIENTES ============
  '/app/crm': {
    icon: '👥',
    title: 'CRM - Gestión de Clientes',
    subtitle: 'CRM especializado en IP',
    description: 'Ficha completa de cada cliente con todos sus expedientes, contactos y facturación.',
    features: [
      'Ficha 360° del cliente',
      'Múltiples contactos por cliente',
      'Historial de comunicaciones',
      'Resumen de facturación',
    ],
    demoTips: [
      'Abre la ficha de un cliente grande',
      'Muestra la pestaña de expedientes',
      'Señala el resumen de facturación',
    ],
  },

  '/app/crm/contacts': {
    icon: '📇',
    title: 'Contactos',
    subtitle: 'Base de datos de contactos',
    description: 'Gestiona todos los contactos de tu organización con información detallada.',
    features: [
      'Directorio completo de contactos',
      'Filtros y búsqueda avanzada',
      'Historial de interacciones',
      'Vinculación con clientes y expedientes',
    ],
    demoTips: [
      'Busca un contacto específico',
      'Muestra el historial de comunicaciones',
      'Explica la vinculación con expedientes',
    ],
  },

  '/app/crm/pipeline': {
    icon: '🎯',
    title: 'Pipeline Comercial',
    subtitle: 'Embudo de ventas visual',
    description: 'Gestiona oportunidades comerciales con vista Kanban y seguimiento de conversiones.',
    features: [
      'Vista Kanban de oportunidades',
      'Drag & drop entre etapas',
      'Métricas de conversión',
      'Automatizaciones de seguimiento',
    ],
    demoTips: [
      'Arrastra una oportunidad entre columnas',
      'Muestra las métricas del pipeline',
      'Explica las automatizaciones configurables',
    ],
  },

  // ============ COMUNICACIONES ============
  '/app/communications': {
    icon: '💬',
    title: 'Centro de Comunicaciones',
    subtitle: 'Todos los canales unificados',
    description: 'Email, WhatsApp, SMS y llamadas en una bandeja unificada. Todo vinculado automáticamente.',
    features: [
      'Bandeja unificada multicanal',
      'Vinculación automática a expedientes',
      'Softphone integrado',
      'Plantillas personalizables',
    ],
    demoTips: [
      'Filtra por WhatsApp para mostrar ese canal',
      'Abre el softphone y simula una llamada',
      'Muestra cómo se vincula a un expediente',
    ],
  },

  // ============ VIGILANCIA / SPIDER ============
  '/app/spider': {
    icon: '🕷️',
    title: 'IP-SPIDER - Vigilancia IA',
    subtitle: 'Monitorización 24/7 con inteligencia artificial',
    description: 'Detecta amenazas antes que nadie. IA que analiza similitudes con 95% de precisión.',
    features: [
      'Vigilancia de marcas en 150+ países',
      'IA de detección de similitudes',
      'Alertas de dominios y RRSS',
      'Informes automáticos',
    ],
    demoTips: [
      'Muestra una alerta de marca similar',
      'Explica la puntuación de similitud IA',
      'Resalta que está INCLUIDO (competencia cobra extra)',
    ],
  },

  // ============ FINANZAS ============
  '/app/finance': {
    icon: '💰',
    title: 'Módulo Financiero',
    subtitle: 'Control económico integral',
    description: 'Facturación, presupuestos, gastos y análisis financiero en un solo lugar.',
    features: [
      'Facturación electrónica completa',
      'Gestión de presupuestos',
      'Control de gastos y provisiones',
      'Informes y análisis financiero',
    ],
    demoTips: [
      'Navega por las diferentes secciones',
      'Muestra la creación rápida de factura',
      'Explica los informes automáticos',
    ],
  },

  '/app/finance/invoices': {
    icon: '🧾',
    title: 'Facturación Electrónica',
    subtitle: 'Cumplimiento normativo automático',
    description: 'SII, TicketBAI, VERI*FACTU y Facturae. Todo automático y sin errores.',
    features: [
      'Generación automática desde tiempo/gastos',
      'Envío automático al SII',
      'PDF y XML Facturae',
      'Control de cobros',
    ],
    demoTips: [
      'Muestra el indicador SII ✓ en una factura',
      'Abre el editor y muestra los campos',
      'Genera un PDF para mostrar el diseño',
    ],
  },

  '/app/finance/invoices/new': {
    icon: '✏️',
    title: 'Nueva Factura',
    subtitle: 'Creación rápida y sencilla',
    description: 'Crea facturas en segundos con autocompletado de servicios y cálculos automáticos.',
    features: [
      'Autocompletado de servicios del catálogo',
      'Cálculo automático de impuestos',
      'Vinculación con expedientes',
      'Vista previa en tiempo real',
    ],
    demoTips: [
      'Escribe en descripción para buscar servicios',
      'Muestra cómo se autocompletan los precios',
      'Explica la vinculación con expedientes',
    ],
  },

  '/app/finance/quotes': {
    icon: '📝',
    title: 'Presupuestos',
    subtitle: 'Propuestas profesionales',
    description: 'Crea y envía presupuestos profesionales. Seguimiento de estado y conversión.',
    features: [
      'Plantillas personalizables',
      'Envío por email integrado',
      'Seguimiento de aperturas',
      'Conversión a factura en 1 clic',
    ],
    demoTips: [
      'Crea un presupuesto de ejemplo',
      'Muestra la conversión a factura',
      'Explica el tracking de aperturas',
    ],
  },

  '/app/finance/expenses': {
    icon: '💳',
    title: 'Gestión de Gastos',
    subtitle: 'Control de gastos y suplidos',
    description: 'Registra gastos, suplidos y reembolsables. Vinculación con expedientes y facturas.',
    features: [
      'Categorización automática',
      'Vinculación a expedientes',
      'Adjuntos de justificantes',
      'Refacturación a clientes',
    ],
    demoTips: [
      'Muestra un gasto con justificante',
      'Explica la refacturación automática',
      'Filtra por expediente o cliente',
    ],
  },

  '/app/finance/provisions': {
    icon: '📦',
    title: 'Provisiones de Fondos',
    subtitle: 'Gestión de anticipos',
    description: 'Control de provisiones recibidas de clientes con seguimiento de consumo.',
    features: [
      'Registro de provisiones',
      'Seguimiento de saldo disponible',
      'Aplicación a gastos/facturas',
      'Alertas de saldo bajo',
    ],
    demoTips: [
      'Muestra el saldo de una provisión',
      'Explica cómo se aplica a gastos',
      'Señala las alertas de saldo bajo',
    ],
  },

  // ============ AUTOMATIZACIONES ============
  '/app/workflows': {
    icon: '⚙️',
    title: 'Automatizaciones',
    subtitle: 'Tu despacho en piloto automático',
    description: 'Constructor visual de workflows. Automatiza tareas sin programar.',
    features: [
      'Constructor drag & drop',
      'Triggers: plazos, eventos, fechas',
      'Acciones: emails, tareas, notificaciones',
      'Historial de ejecuciones',
    ],
    demoTips: [
      'Abre un workflow activo y muestra el diagrama',
      'Muestra el contador de ejecuciones',
      'Crea un workflow simple en vivo',
    ],
  },

  // ============ PORTAL CLIENTE ============
  '/app/portal': {
    icon: '🌐',
    title: 'Portal de Clientes',
    subtitle: 'Autoservicio 24/7',
    description: 'Tus clientes acceden a su información cuando quieran. Menos llamadas, más satisfacción.',
    features: [
      'Acceso seguro para clientes',
      'Vista de expedientes y documentos',
      'Mensajería integrada',
      'Seguimiento de plazos',
    ],
    demoTips: [
      'Muestra cómo se invita a un cliente',
      'Abre la vista que vería el cliente',
      'Resalta la reducción de llamadas (-60%)',
    ],
  },

  // ============ TAREAS ============
  '/app/tasks': {
    icon: '✅',
    title: 'Gestión de Tareas',
    subtitle: 'Organiza el trabajo del equipo',
    description: 'Sistema completo de tareas con asignaciones, fechas y seguimiento.',
    features: [
      'Vista lista y Kanban',
      'Asignación a usuarios',
      'Fechas límite con alertas',
      'Vinculación a expedientes',
    ],
    demoTips: [
      'Cambia entre vistas lista y Kanban',
      'Crea una tarea rápida',
      'Muestra las alertas de vencimiento',
    ],
  },

  // ============ TIMETRACKING ============
  '/app/timetracking': {
    icon: '⏱️',
    title: 'Control de Tiempo',
    subtitle: 'Registra cada minuto facturable',
    description: 'Cronómetro integrado y registro manual. Todo listo para facturar.',
    features: [
      'Cronómetro con un clic',
      'Registro manual flexible',
      'Reportes por cliente/expediente',
      'Exportación para facturación',
    ],
    demoTips: [
      'Inicia el cronómetro en vivo',
      'Muestra el resumen semanal',
      'Explica la exportación a factura',
    ],
  },

  // ============ DOCUMENTOS ============
  '/app/documents': {
    icon: '📄',
    title: 'Gestión Documental',
    subtitle: 'Todos tus documentos organizados',
    description: 'Almacenamiento seguro con versionado, búsqueda y permisos.',
    features: [
      'Organización por expediente',
      'Versionado automático',
      'Búsqueda de contenido',
      'Permisos granulares',
    ],
    demoTips: [
      'Sube un documento de ejemplo',
      'Muestra las versiones de un archivo',
      'Busca por contenido',
    ],
  },

  // ============ CONFIGURACIÓN ============
  '/app/settings': {
    icon: '⚙️',
    title: 'Configuración',
    subtitle: 'Personaliza IP-NEXUS',
    description: 'Configura usuarios, permisos, integraciones y preferencias del sistema.',
    features: [
      'Gestión de usuarios y roles',
      'Integraciones con terceros',
      'Personalización de marca',
      'Configuración de alertas',
    ],
    demoTips: [
      'Muestra la gestión de roles',
      'Explica las integraciones disponibles',
      'Personaliza un logo de ejemplo',
    ],
  },

  // ============ INFORMES ============
  '/app/reports': {
    icon: '📊',
    title: 'Informes y Análisis',
    subtitle: 'Datos para tomar decisiones',
    description: 'Informes predefinidos y personalizables. Exportación en múltiples formatos.',
    features: [
      'Informes predefinidos',
      'Constructor de informes custom',
      'Programación de envíos',
      'Exportación Excel/PDF',
    ],
    demoTips: [
      'Genera un informe de ejemplo',
      'Muestra la exportación a Excel',
      'Explica la programación automática',
    ],
  },

  // ============ DATA HUB ============
  '/app/datahub': {
    icon: '🔌',
    title: 'Data Hub',
    subtitle: 'Conecta con oficinas de PI',
    description: 'Conexión directa con OEPM, EUIPO, WIPO y más. Sincronización automática.',
    features: [
      'Conexión con oficinas oficiales',
      'Sincronización automática de estados',
      'Importación de expedientes',
      'Alertas de cambios',
    ],
    demoTips: [
      'Muestra una sincronización en vivo',
      'Explica las oficinas conectadas',
      'Resalta el ahorro de tiempo',
    ],
  },

  // ============ MARKET ============
  '/app/market': {
    icon: '🏪',
    title: 'IP Market',
    subtitle: 'Marketplace de servicios',
    description: 'Conecta con corresponsales y proveedores de servicios IP a nivel mundial.',
    features: [
      'Red de corresponsales verificados',
      'Solicitud de cotizaciones',
      'Valoraciones y reseñas',
      'Gestión de encargos',
    ],
    demoTips: [
      'Busca un corresponsal en otro país',
      'Muestra las valoraciones',
      'Explica el proceso de encargo',
    ],
  },

  // ============ NEXUS GENIUS ============
  '/app/genius': {
    icon: '🧠',
    title: 'NEXUS Genius',
    subtitle: 'IA para propiedad intelectual',
    description: 'Asistente de IA especializado en PI. Análisis, redacción y estrategia.',
    features: [
      'Análisis de distintividad',
      'Redacción de descripciones',
      'Estrategia de protección',
      'Búsqueda de anterioridades',
    ],
    demoTips: [
      'Haz una consulta de ejemplo',
      'Muestra el análisis de una marca',
      'Explica las capacidades de IA',
    ],
  },

  // ============ DEFAULT ============
  default: {
    icon: '🚀',
    title: 'IP-NEXUS',
    subtitle: 'La plataforma IP más completa',
    description: 'Todo lo que necesitas para gestionar propiedad intelectual en un solo lugar.',
    features: [
      'Gestión completa de expedientes',
      'Control de plazos infalible',
      'Comunicaciones unificadas',
      'Facturación electrónica',
    ],
    demoTips: [
      'Navega por las secciones principales',
      'Muestra la búsqueda global Ctrl+K',
      'Destaca la integración entre módulos',
    ],
  },
};

// Función helper para obtener contenido basado en la ruta
export function getGuideContent(pathname: string): GuideSection {
  // Buscar coincidencia exacta primero
  if (GUIDE_CONTENT[pathname]) {
    return GUIDE_CONTENT[pathname];
  }
  
  // Buscar coincidencia parcial (para rutas con parámetros)
  const pathParts = pathname.split('/');
  for (let i = pathParts.length; i > 0; i--) {
    const partialPath = pathParts.slice(0, i).join('/');
    if (GUIDE_CONTENT[partialPath]) {
      return GUIDE_CONTENT[partialPath];
    }
  }
  
  return GUIDE_CONTENT.default;
}

// Lista ordenada de secciones para navegación
export const GUIDE_SECTIONS = [
  '/app/dashboard',
  '/app/docket',
  '/app/plazos',
  '/app/crm',
  '/app/crm/contacts',
  '/app/crm/pipeline',
  '/app/communications',
  '/app/spider',
  '/app/finance',
  '/app/finance/invoices',
  '/app/finance/quotes',
  '/app/finance/expenses',
  '/app/finance/provisions',
  '/app/tasks',
  '/app/timetracking',
  '/app/documents',
  '/app/workflows',
  '/app/portal',
  '/app/datahub',
  '/app/market',
  '/app/genius',
  '/app/reports',
  '/app/settings',
];
