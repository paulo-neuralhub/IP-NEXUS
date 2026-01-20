/**
 * IP-NEXUS Help Center Content
 * FAQ, Categories, and Quick Guides
 */

// ============================================================
// HELP CATEGORIES
// ============================================================
export const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    slug: 'getting-started',
    name: 'Primeros Pasos',
    description: 'Configuración inicial y conceptos básicos',
    icon: 'rocket',
    color: 'hsl(var(--primary))',
    articleCount: 8
  },
  {
    id: 'docket',
    slug: 'docket',
    name: 'Expedientes (Docket)',
    description: 'Gestión de marcas, patentes y diseños',
    icon: 'briefcase',
    color: 'hsl(var(--module-docket))',
    articleCount: 12
  },
  {
    id: 'spider',
    slug: 'spider',
    name: 'Vigilancia (Spider)',
    description: 'Alertas y monitoreo de PI',
    icon: 'radar',
    color: 'hsl(var(--module-spider))',
    articleCount: 6
  },
  {
    id: 'crm',
    slug: 'crm',
    name: 'CRM',
    description: 'Gestión de clientes y oportunidades',
    icon: 'users',
    color: 'hsl(var(--module-crm))',
    articleCount: 10
  },
  {
    id: 'genius',
    slug: 'genius',
    name: 'Genius IA',
    description: 'Asistente inteligente y análisis',
    icon: 'sparkles',
    color: 'hsl(var(--module-genius))',
    articleCount: 5
  },
  {
    id: 'marketing',
    slug: 'marketing',
    name: 'Marketing',
    description: 'Campañas, automatizaciones y emails',
    icon: 'mail',
    color: 'hsl(var(--module-marketing))',
    articleCount: 8
  },
  {
    id: 'finance',
    slug: 'finance',
    name: 'Finanzas',
    description: 'Costes, facturación y valoración',
    icon: 'wallet',
    color: 'hsl(var(--module-finance))',
    articleCount: 7
  },
  {
    id: 'integrations',
    slug: 'integrations',
    name: 'Integraciones',
    description: 'APIs y conexiones externas',
    icon: 'plug',
    color: 'hsl(var(--info))',
    articleCount: 4
  }
];

// ============================================================
// FREQUENTLY ASKED QUESTIONS
// ============================================================
export const FAQ_ITEMS = [
  // Getting Started
  {
    id: 'faq-1',
    categoryId: 'getting-started',
    question: '¿Cómo creo mi primera marca en IP-NEXUS?',
    answer: `Para crear tu primera marca:
1. Ve a **Docket** en el menú lateral
2. Haz clic en **+ Nueva Marca**
3. Completa los datos básicos: nombre, titular, clases de Niza
4. Añade las jurisdicciones donde quieres protegerla
5. Guarda y el sistema generará automáticamente los plazos

💡 **Tip:** Usa el buscador de anterioridades antes de registrar para verificar disponibilidad.`,
    tags: ['marca', 'registro', 'docket']
  },
  {
    id: 'faq-2',
    categoryId: 'getting-started',
    question: '¿Cómo importo expedientes existentes?',
    answer: `IP-NEXUS permite importar datos desde:
- **Excel/CSV**: Formato estructurado con nuestras plantillas
- **Patricia/Corsearch**: Migración asistida por IA
- **Otras plataformas**: Usa el módulo Migrator

Ve a **Herramientas > Migrator** y sigue el asistente paso a paso.`,
    tags: ['importar', 'migración', 'datos']
  },
  {
    id: 'faq-3',
    categoryId: 'getting-started',
    question: '¿Cuántos usuarios puedo añadir?',
    answer: `Depende de tu plan:
- **Starter**: 2 usuarios
- **Professional**: 10 usuarios
- **Business**: 25 usuarios
- **Enterprise**: Ilimitados

Puedes gestionar usuarios en **Configuración > Equipo**.`,
    tags: ['usuarios', 'plan', 'equipo']
  },
  // Docket
  {
    id: 'faq-4',
    categoryId: 'docket',
    question: '¿Cómo calcula el sistema las fechas de renovación?',
    answer: `IP-NEXUS calcula automáticamente las fechas basándose en:
- **Tipo de activo**: Marca, patente, diseño
- **Jurisdicción**: Cada oficina tiene sus propios plazos
- **Fecha de solicitud/concesión**: Punto de partida

Las alertas se envían según tu configuración (30, 60, 90 días antes).

⚠️ Las fechas son orientativas. Verifica siempre con la oficina correspondiente.`,
    tags: ['renovación', 'plazos', 'alertas']
  },
  {
    id: 'faq-5',
    categoryId: 'docket',
    question: '¿Puedo vincular expedientes entre sí?',
    answer: `Sí, puedes crear relaciones entre expedientes:
- **Familia de marcas**: Misma marca en diferentes países
- **Prioridades**: Vincula solicitudes con su prioridad
- **Oposiciones**: Conecta el expediente atacante con el defendido

Usa el botón **Vincular** en la ficha del expediente.`,
    tags: ['vincular', 'familia', 'relaciones']
  },
  // Spider
  {
    id: 'faq-6',
    categoryId: 'spider',
    question: '¿Qué fuentes monitorea Spider?',
    answer: `Spider monitorea:
- **EUIPO** (marcas europeas)
- **OEPM** (España)
- **USPTO** (Estados Unidos)
- **WIPO** (Madrid System)
- **Dominios**: .com, .es, .eu y más

Los resultados se analizan con IA para detectar conflictos potenciales.`,
    tags: ['vigilancia', 'fuentes', 'monitoreo']
  },
  {
    id: 'faq-7',
    categoryId: 'spider',
    question: '¿Cómo interpreto el nivel de riesgo?',
    answer: `Spider asigna niveles de riesgo basados en:
- **Crítico (>85%)**: Alta similitud fonética, visual y conceptual
- **Alto (70-85%)**: Riesgo significativo de confusión
- **Medio (50-70%)**: Merece análisis detallado
- **Bajo (<50%)**: Diferencias claras

Haz clic en cada alerta para ver el análisis detallado.`,
    tags: ['riesgo', 'similitud', 'alertas']
  },
  // CRM
  {
    id: 'faq-8',
    categoryId: 'crm',
    question: '¿Cómo creo un pipeline personalizado?',
    answer: `Para crear un pipeline:
1. Ve a **CRM > Pipelines**
2. Haz clic en **+ Nuevo Pipeline**
3. Añade las etapas con nombre, color y probabilidad
4. Define cuál es la etapa de "ganado" y "perdido"
5. Guarda y comienza a usar

También puedes usar nuestras **plantillas prediseñadas** para PI.`,
    tags: ['pipeline', 'ventas', 'etapas']
  },
  // Genius
  {
    id: 'faq-9',
    categoryId: 'genius',
    question: '¿Genius tiene acceso a mis expedientes?',
    answer: `Sí, Genius puede consultar tu portafolio para darte respuestas contextualizadas. Por ejemplo:
- "¿Cuántas marcas tengo en España?"
- "¿Cuándo vence la patente EP12345?"
- "Analiza este expediente"

Tus datos **nunca salen de la plataforma** y no se usan para entrenar modelos.`,
    tags: ['ia', 'privacidad', 'datos']
  },
  {
    id: 'faq-10',
    categoryId: 'genius',
    question: '¿Cuántos créditos de IA tengo?',
    answer: `Los créditos dependen de tu plan:
- **Starter**: 1,000 tokens/mes
- **Professional**: 10,000 tokens/mes
- **Business**: 50,000 tokens/mes
- **Enterprise**: Personalizado

Consulta tu uso en **Dashboard > Créditos IA** o **Configuración > Facturación**.`,
    tags: ['créditos', 'tokens', 'plan']
  },
  // Marketing
  {
    id: 'faq-11',
    categoryId: 'marketing',
    question: '¿Cómo creo una campaña de email?',
    answer: `Pasos para crear una campaña:
1. Ve a **Marketing > Campañas**
2. Haz clic en **+ Nueva Campaña**
3. Selecciona la audiencia (lista de contactos)
4. Elige o crea una plantilla
5. Personaliza el asunto y contenido
6. Programa o envía inmediatamente

💡 Usa las **variables dinámicas** como {{contact.name}} para personalizar.`,
    tags: ['email', 'campaña', 'envío']
  },
  {
    id: 'faq-12',
    categoryId: 'marketing',
    question: '¿Qué automatizaciones puedo crear?',
    answer: `Automatizaciones disponibles:
- **Bienvenida**: Email al crear un contacto
- **Vencimientos**: Recordatorios automáticos
- **Seguimiento**: Secuencias post-envío
- **Etiquetado**: Tags según comportamiento
- **Notificaciones**: Alertas al equipo

Ve a **Marketing > Automatizaciones** para configurarlas.`,
    tags: ['automatización', 'flujo', 'triggers']
  },
  // Finance
  {
    id: 'faq-13',
    categoryId: 'finance',
    question: '¿Cómo se calcula el valor del portafolio?',
    answer: `IP-NEXUS usa varios métodos de valoración:
- **Coste**: Suma de gastos (registro, renovaciones, tasas)
- **Mercado**: Comparación con transacciones similares
- **Ingresos**: Royalties o licencias generados

El sistema combina estos factores con métricas como antigüedad, jurisdicciones y uso.`,
    tags: ['valoración', 'portafolio', 'métricas']
  },
  // Integrations
  {
    id: 'faq-14',
    categoryId: 'integrations',
    question: '¿Cómo conecto IP-NEXUS con otras herramientas?',
    answer: `Opciones de integración:
- **API REST**: Para desarrolladores (ver Docs)
- **Webhooks**: Notificaciones en tiempo real
- **Zapier**: Conecta con miles de apps (próximamente)
- **Email sync**: Gmail, Outlook

Configura en **Configuración > Integraciones**.`,
    tags: ['api', 'webhooks', 'integración']
  }
];

// ============================================================
// QUICK GUIDES / TUTORIALS
// ============================================================
export const QUICK_GUIDES = [
  {
    id: 'guide-1',
    title: 'Configurar tu organización',
    description: 'Primeros pasos después del registro',
    duration: '5 min',
    steps: [
      'Completa el perfil de tu empresa',
      'Invita a tu equipo',
      'Configura las notificaciones',
      'Importa tus primeros expedientes'
    ],
    icon: 'settings'
  },
  {
    id: 'guide-2',
    title: 'Crear tu primera vigilancia',
    description: 'Monitorea marcas similares automáticamente',
    duration: '3 min',
    steps: [
      'Ve a Spider > Vigilancias',
      'Añade el término a monitorear',
      'Selecciona las jurisdicciones',
      'Configura la frecuencia de alertas'
    ],
    icon: 'radar'
  },
  {
    id: 'guide-3',
    title: 'Enviar tu primera campaña',
    description: 'Email marketing para tu cartera de clientes',
    duration: '10 min',
    steps: [
      'Crea una lista de contactos',
      'Diseña tu plantilla de email',
      'Configura la campaña',
      'Programa el envío'
    ],
    icon: 'mail'
  },
  {
    id: 'guide-4',
    title: 'Consultar a Genius',
    description: 'Usa IA para análisis de PI',
    duration: '2 min',
    steps: [
      'Abre el chat de Genius',
      'Escribe tu pregunta en lenguaje natural',
      'Revisa la respuesta con fuentes',
      'Profundiza con preguntas de seguimiento'
    ],
    icon: 'sparkles'
  }
];

// ============================================================
// ONBOARDING WIZARD STEPS
// ============================================================
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a IP-NEXUS',
    description: 'La plataforma integral para gestión de Propiedad Intelectual',
    icon: 'sparkles',
    action: 'next'
  },
  {
    id: 'profile',
    title: 'Tu Perfil',
    description: 'Completa tu información personal para personalizar la experiencia',
    icon: 'user',
    action: 'form',
    fields: ['full_name', 'phone', 'job_title']
  },
  {
    id: 'organization',
    title: 'Tu Organización',
    description: 'Configura los datos de tu empresa o despacho',
    icon: 'building',
    action: 'form',
    fields: ['org_name', 'industry', 'size']
  },
  {
    id: 'import',
    title: 'Importar Datos',
    description: 'Trae tus expedientes existentes o comienza desde cero',
    icon: 'upload',
    action: 'choice',
    options: ['import_excel', 'import_other', 'start_fresh']
  },
  {
    id: 'first-matter',
    title: 'Tu Primer Expediente',
    description: 'Crea una marca, patente o diseño de ejemplo',
    icon: 'briefcase',
    action: 'guided'
  },
  {
    id: 'modules',
    title: 'Explora los Módulos',
    description: 'Descubre las herramientas disponibles',
    icon: 'grid',
    action: 'tour',
    modules: ['docket', 'spider', 'crm', 'genius']
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configura cómo quieres recibir alertas',
    icon: 'bell',
    action: 'form',
    fields: ['email_alerts', 'push_alerts', 'alert_timing']
  },
  {
    id: 'complete',
    title: '¡Todo Listo!',
    description: 'Ya puedes empezar a usar IP-NEXUS',
    icon: 'check-circle',
    action: 'finish'
  }
];

// ============================================================
// VIDEO TUTORIALS
// ============================================================
export const VIDEO_TUTORIALS = [
  {
    id: 'video-1',
    title: 'Introducción a IP-NEXUS',
    description: 'Tour general de la plataforma',
    duration: '5:30',
    thumbnail: '/videos/thumbnails/intro.jpg',
    youtubeId: 'demo123',
    category: 'getting-started'
  },
  {
    id: 'video-2',
    title: 'Gestión de Expedientes',
    description: 'Cómo crear y gestionar marcas',
    duration: '8:15',
    thumbnail: '/videos/thumbnails/docket.jpg',
    youtubeId: 'demo456',
    category: 'docket'
  },
  {
    id: 'video-3',
    title: 'Configurar Vigilancias',
    description: 'Monitoreo automatizado con Spider',
    duration: '6:45',
    thumbnail: '/videos/thumbnails/spider.jpg',
    youtubeId: 'demo789',
    category: 'spider'
  },
  {
    id: 'video-4',
    title: 'CRM para Agentes de PI',
    description: 'Gestiona clientes y oportunidades',
    duration: '12:00',
    thumbnail: '/videos/thumbnails/crm.jpg',
    youtubeId: 'demo101',
    category: 'crm'
  }
];
