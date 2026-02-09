// ============================================================
// IP-NEXUS HELP — ARTICLE DATA (Component-based content)
// ============================================================

export interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string;
  icon: string;
  readTime: string;
  lastUpdated: string;
  summary: string;
  keywords: string[];
  /** Key into the content registry */
  content: string;
  relatedArticles?: string[];
}

export const helpArticles: HelpArticle[] = [
  // ═══ PRIMEROS PASOS ═══
  { id:'gs-001', title:'Configurar tu organización', slug:'configurar-organizacion', category:'getting-started', subcategory:'Configuración inicial', icon:'Building', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Personaliza el nombre, logo y datos de tu despacho en IP-NEXUS.', keywords:['organización','logo','nombre','configurar','despacho','inicio'], content:'GS001Content', relatedArticles:['gs-002','gs-003'] },
  { id:'gs-002', title:'Invitar miembros a tu equipo', slug:'invitar-equipo', category:'getting-started', subcategory:'Configuración inicial', icon:'UserPlus', readTime:'2 min', lastUpdated:'Actualizado hace 1 semana', summary:'Añade miembros de tu despacho con los roles y permisos adecuados.', keywords:['equipo','invitar','miembros','roles','permisos','usuario'], content:'GS002Content', relatedArticles:['gs-001','config-003'] },
  { id:'gs-003', title:'Crear tu primer expediente', slug:'primer-expediente', category:'getting-started', subcategory:'Primeros pasos', icon:'FilePlus', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Guía paso a paso para crear y configurar tu primer expediente de marca, patente o diseño.', keywords:['expediente','crear','nuevo','marca','patente','primer'], content:'GS003Content', relatedArticles:['docket-001','docket-002'] },
  { id:'gs-004', title:'Importar expedientes existentes', slug:'importar-expedientes', category:'getting-started', subcategory:'Primeros pasos', icon:'Upload', readTime:'5 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Importa tus expedientes desde Excel, CSV u otro software IP.', keywords:['importar','excel','csv','migración','datos','existentes'], content:'GS004Content', relatedArticles:['gs-003'] },
  { id:'gs-005', title:'Configurar plazos y alertas', slug:'configurar-alertas', category:'getting-started', subcategory:'Primeros pasos', icon:'Bell', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Configura las alertas automáticas de vencimiento y renovación.', keywords:['alertas','plazos','vencimiento','renovación','notificación'], content:'GS005Content', relatedArticles:['docket-007','spider-001'] },
  { id:'gs-006', title:'Entender la navegación de IP-NEXUS', slug:'navegacion-ipnexus', category:'getting-started', subcategory:'Conoce la app', icon:'Layout', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Aprende a moverte por IP-NEXUS: sidebar, módulos, atajos y búsqueda rápida.', keywords:['navegación','sidebar','menú','buscar','módulos','interfaz'], content:'GS006Content' },
  { id:'gs-007', title:'Atajos de teclado', slug:'atajos-teclado-gs', category:'getting-started', subcategory:'Conoce la app', icon:'Keyboard', readTime:'2 min', lastUpdated:'Actualizado hace 1 semana', summary:'Los atajos de teclado más útiles para trabajar más rápido en IP-NEXUS.', keywords:['atajos','teclado','shortcuts','rápido','comando'], content:'GS007Content' },
  { id:'gs-008', title:'Planes y suscripción', slug:'planes-suscripcion', category:'getting-started', subcategory:'Cuenta', icon:'CreditCard', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Compara los planes disponibles y cómo gestionar tu suscripción.', keywords:['planes','suscripción','precio','pago','facturación','upgrade'], content:'GS008Content' },

  // ═══ PORTFOLIO / DOCKET ═══
  { id:'docket-001', title:'Crear un nuevo expediente', slug:'crear-expediente', category:'portfolio', subcategory:'Lo básico', icon:'FilePlus', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Todo lo que necesitas saber para crear un expediente de marca, patente o diseño.', keywords:['crear','expediente','nuevo','marca','patente'], content:'Docket001Content', relatedArticles:['docket-002','docket-003'] },
  { id:'docket-002', title:'Tipos de expediente: marca, patente, diseño y litigio', slug:'tipos-expediente', category:'portfolio', subcategory:'Lo básico', icon:'Layers', readTime:'5 min', lastUpdated:'Actualizado hace 1 semana', summary:'Las diferencias entre los tipos de expediente y cuándo usar cada uno.', keywords:['tipos','marca','patente','diseño','litigio'], content:'Docket002Content' },
  { id:'docket-003', title:'Estructura de un expediente: pestañas y secciones', slug:'estructura-expediente', category:'portfolio', subcategory:'Lo básico', icon:'LayoutGrid', readTime:'5 min', lastUpdated:'Actualizado hace 1 semana', summary:'Recorre cada pestaña y sección de un expediente para entender toda la información disponible.', keywords:['estructura','pestañas','secciones','detalles','información'], content:'Docket003Content' },
  { id:'docket-004', title:'Añadir y gestionar documentos', slug:'documentos', category:'portfolio', subcategory:'Documentos', icon:'FileText', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Cómo subir, organizar y buscar documentos dentro de un expediente.', keywords:['documentos','subir','archivos','PDF','adjuntar'], content:'Docket004Content' },
  { id:'docket-005', title:'Asignar expediente a un miembro del equipo', slug:'asignar-expediente', category:'portfolio', subcategory:'Colaboración', icon:'UserPlus', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Asigna responsables a cada expediente para que tu equipo sepa quién gestiona qué.', keywords:['asignar','equipo','responsable','miembro'], content:'Docket005Content' },
  { id:'docket-006', title:'Estados de un expediente y flujo de trabajo', slug:'estados-flujo', category:'portfolio', subcategory:'Lo básico', icon:'GitBranch', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Los estados por los que pasa un expediente y cómo configurar tu flujo.', keywords:['estados','flujo','workflow','proceso','etapas'], content:'Docket006Content' },
  { id:'docket-009', title:'Buscar y filtrar expedientes', slug:'buscar-filtrar', category:'portfolio', subcategory:'Organización', icon:'Search', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Usa la búsqueda avanzada, filtros y vistas para encontrar cualquier expediente.', keywords:['buscar','filtrar','búsqueda','avanzada','encontrar'], content:'Docket009Content' },
  { id:'docket-010', title:'Vistas: lista, tabla y kanban', slug:'vistas', category:'portfolio', subcategory:'Organización', icon:'LayoutGrid', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Cambia entre las vistas disponibles para organizar tus expedientes.', keywords:['vistas','lista','tabla','kanban','organizar'], content:'Docket010Content' },
  { id:'docket-011', title:'Vincular contactos a un expediente', slug:'vincular-contactos', category:'portfolio', subcategory:'Colaboración', icon:'Users', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Asocia clientes, representantes y terceros a tus expedientes.', keywords:['contactos','vincular','cliente','representante'], content:'Docket011Content' },
  { id:'docket-012', title:'Exportar datos e informes', slug:'exportar-informes', category:'portfolio', subcategory:'Informes', icon:'Download', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Genera y descarga informes de tus expedientes en PDF o Excel.', keywords:['exportar','informes','PDF','excel','descargar'], content:'Docket012Content' },

  // ═══ DOCKET & DEADLINES ═══
  { id:'docket-007', title:'Configurar plazos y vencimientos', slug:'plazos-vencimientos', category:'docket', subcategory:'Plazos', icon:'Clock', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Configura plazos legales, vencimientos y renovaciones.', keywords:['plazos','vencimientos','renovación','fecha','deadline'], content:'Docket007Content' },
  { id:'docket-008', title:'Alertas automáticas de vencimiento', slug:'alertas-vencimiento', category:'docket', subcategory:'Alertas', icon:'Bell', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Configura cuándo y cómo recibir alertas antes de que venzan tus plazos.', keywords:['alertas','automáticas','notificaciones','vencimiento'], content:'Docket008Content' },

  // ═══ FILING ═══
  { id:'filing-001', title:'Cómo funciona el proceso de registro', slug:'proceso-registro', category:'filing', subcategory:'Lo básico', icon:'FileText', readTime:'5 min', lastUpdated:'Actualizado hace 1 semana', summary:'Entiende las fases del registro de una marca: desde la solicitud hasta el certificado.', keywords:['registro','proceso','solicitud','fases','marca'], content:'Filing001Content', relatedArticles:['filing-002','filing-003'] },
  { id:'filing-002', title:'Preparar una solicitud de marca', slug:'preparar-solicitud', category:'filing', subcategory:'Solicitudes', icon:'ClipboardList', readTime:'6 min', lastUpdated:'Actualizado hace 1 semana', summary:'Checklist completo para preparar la documentación antes de solicitar.', keywords:['solicitud','preparar','documentación','checklist'], content:'Filing002Content' },
  { id:'filing-003', title:'Elegir las clases Niza correctas', slug:'clases-niza', category:'filing', subcategory:'Solicitudes', icon:'ListOrdered', readTime:'7 min', lastUpdated:'Actualizado hace 1 semana', summary:'Guía práctica para seleccionar las clases de la Clasificación de Niza.', keywords:['clases','niza','clasificación','productos','servicios'], content:'Filing003Content' },
  { id:'filing-004', title:'Jurisdicciones: dónde registrar tu marca', slug:'jurisdicciones', category:'filing', subcategory:'Jurisdicciones', icon:'Globe', readTime:'5 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Diferencias entre registro nacional (OEPM), europeo (EUIPO) e internacional (WIPO).', keywords:['jurisdicciones','OEPM','EUIPO','WIPO','nacional','europeo'], content:'Filing004Content' },
  { id:'filing-005', title:'Seguimiento del estado de una solicitud', slug:'seguimiento-solicitud', category:'filing', subcategory:'Gestión', icon:'Activity', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Cómo ver y entender el estado de tus solicitudes en IP-NEXUS.', keywords:['seguimiento','estado','solicitud','tracking'], content:'Filing005Content' },
  { id:'filing-006', title:'Generar documentos y plantillas de solicitud', slug:'plantillas-solicitud', category:'filing', subcategory:'Documentos', icon:'FileSignature', readTime:'4 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Usa las plantillas prediseñadas para generar documentación de solicitud profesional.', keywords:['plantillas','documentos','generar','solicitud'], content:'Filing006Content' },

  // ═══ GENIUS AI ═══
  { id:'genius-001', title:'¿Qué es IP-Genius y qué puede hacer?', slug:'que-es-genius', category:'genius', subcategory:'Introducción', icon:'Brain', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Descubre las capacidades del asistente de IA integrado en IP-NEXUS.', keywords:['genius','IA','inteligencia','artificial','asistente'], content:'Genius001Content', relatedArticles:['genius-002','genius-003'] },
  { id:'genius-002', title:'Tu primer chat con IP-Genius', slug:'primer-chat-genius', category:'genius', subcategory:'Uso básico', icon:'MessageSquare', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Aprende a interactuar con el asistente de IA para obtener los mejores resultados.', keywords:['chat','consulta','preguntar','prompt'], content:'Genius002Content' },
  { id:'genius-003', title:'Análisis automático de anterioridades', slug:'analisis-anterioridades', category:'genius', subcategory:'Análisis', icon:'Search', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Cómo usar la IA para analizar riesgos de anterioridades antes de registrar.', keywords:['anterioridades','análisis','riesgo','similitud'], content:'Genius003Content' },
  { id:'genius-004', title:'Generar informes automáticos', slug:'informes-automaticos', category:'genius', subcategory:'Informes', icon:'FileText', readTime:'4 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Crea informes profesionales con un click usando el análisis de IA.', keywords:['informes','automáticos','generar','PDF'], content:'Genius004Content' },
  { id:'genius-005', title:'Análisis de documentos con IA', slug:'analisis-documentos', category:'genius', subcategory:'Análisis', icon:'Scan', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Sube un documento y deja que la IA extraiga y analice la información.', keywords:['documentos','análisis','extraer','leer','PDF'], content:'Genius005Content' },
  { id:'genius-006', title:'Consultas legales de Propiedad Intelectual', slug:'consultas-legales', category:'genius', subcategory:'Consultas', icon:'Scale', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Haz preguntas sobre legislación IP y recibe respuestas fundamentadas.', keywords:['legal','consulta','legislación','ley'], content:'Genius006Content' },

  // ═══ CRM ═══
  { id:'crm-001', title:'Tu CRM de Propiedad Intelectual', slug:'introduccion-crm', category:'crm', subcategory:'Introducción', icon:'Target', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Cómo usar el CRM de IP-NEXUS para gestionar contactos, clientes y oportunidades.', keywords:['CRM','contactos','clientes','ventas','gestión'], content:'CRM001Content', relatedArticles:['crm-002','crm-003'] },
  { id:'crm-002', title:'Crear y gestionar contactos', slug:'gestionar-contactos', category:'crm', subcategory:'Contactos', icon:'Users', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Añade contactos, empresas y clientes con toda su información.', keywords:['contactos','crear','añadir','empresa','cliente'], content:'CRM002Content' },
  { id:'crm-003', title:'Pipeline de ventas', slug:'pipeline-ventas', category:'crm', subcategory:'Ventas', icon:'TrendingUp', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Configura las etapas de tu pipeline y mueve deals por las fases de venta.', keywords:['pipeline','ventas','deals','oportunidades','etapas'], content:'CRM003Content' },
  { id:'crm-004', title:'Actividades: llamadas, emails y reuniones', slug:'actividades-crm', category:'crm', subcategory:'Seguimiento', icon:'Phone', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Registra todas las interacciones con tus contactos.', keywords:['actividades','llamadas','emails','reuniones','seguimiento'], content:'CRM004Content' },
  { id:'crm-005', title:'Portal de cliente', slug:'portal-cliente', category:'crm', subcategory:'Portal', icon:'ExternalLink', readTime:'4 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Ofrece a tus clientes un portal donde ver el estado de sus expedientes.', keywords:['portal','cliente','acceso','seguimiento'], content:'CRM005Content' },
  { id:'crm-006', title:'Firma digital de documentos', slug:'firma-digital', category:'crm', subcategory:'Documentos', icon:'PenTool', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Envía documentos a firmar y recibe la firma digital directamente.', keywords:['firma','digital','documento','firmar'], content:'CRM006Content' },

  // ═══ COSTES ═══
  { id:'fin-001', title:'Panel financiero general', slug:'panel-financiero', category:'costes', subcategory:'General', icon:'BarChart3', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Visión general de ingresos, gastos, honorarios pendientes y flujo de caja.', keywords:['finanzas','ingresos','gastos','balance','panel'], content:'Fin001Content' },
  { id:'fin-002', title:'Crear y enviar facturas', slug:'crear-facturas', category:'costes', subcategory:'Facturación', icon:'Receipt', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Genera facturas profesionales y envíalas a tus clientes.', keywords:['facturas','crear','enviar','cobrar','facturación'], content:'Fin002Content' },
  { id:'fin-003', title:'Gestionar honorarios por expediente', slug:'honorarios', category:'costes', subcategory:'Honorarios', icon:'DollarSign', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Asocia honorarios y costes a cada expediente.', keywords:['honorarios','costes','expediente','precio'], content:'Fin003Content' },
  { id:'fin-004', title:'Control de cobros pendientes', slug:'cobros-pendientes', category:'costes', subcategory:'Cobros', icon:'AlertCircle', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Monitoriza facturas pendientes de cobro y envía recordatorios.', keywords:['cobros','pendientes','impagados','recordatorio'], content:'Fin004Content' },
  { id:'fin-005', title:'Tasas de oficinas IP', slug:'tasas-oficinas', category:'costes', subcategory:'Tasas', icon:'Landmark', readTime:'5 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Consulta las tasas oficiales de OEPM, EUIPO, WIPO y otras oficinas.', keywords:['tasas','oficinas','OEPM','EUIPO','WIPO','precios'], content:'Fin005Content' },

  // ═══ CONFIGURACIÓN ═══
  { id:'config-001', title:'Ajustes de organización', slug:'ajustes-organizacion', category:'configuracion', subcategory:'General', icon:'Building', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Modifica el nombre, logo, datos fiscales y preferencias.', keywords:['configuración','organización','ajustes','logo'], content:'Config001Content' },
  { id:'config-002', title:'Gestionar equipo y permisos', slug:'equipo-permisos', category:'configuracion', subcategory:'Equipo', icon:'Shield', readTime:'4 min', lastUpdated:'Actualizado hace 1 semana', summary:'Administra los miembros, roles y permisos de acceso.', keywords:['equipo','permisos','roles','admin','acceso'], content:'Config002Content' },
  { id:'config-003', title:'Suscripción y facturación', slug:'suscripcion-config', category:'configuracion', subcategory:'Cuenta', icon:'CreditCard', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Gestiona tu plan, método de pago y accede a tus facturas.', keywords:['suscripción','facturación','plan','pago'], content:'Config003Content' },
  { id:'config-004', title:'Plantillas de documentos', slug:'plantillas-config', category:'configuracion', subcategory:'Personalización', icon:'FileText', readTime:'4 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Crea y personaliza plantillas de documentos.', keywords:['plantillas','documentos','personalizar','templates'], content:'Config004Content' },
  { id:'config-005', title:'Notificaciones y preferencias', slug:'notificaciones-config', category:'configuracion', subcategory:'Preferencias', icon:'Bell', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Configura qué notificaciones recibir y por qué canal.', keywords:['notificaciones','preferencias','email','alertas'], content:'Config005Content' },
  { id:'config-006', title:'Seguridad y autenticación', slug:'seguridad-config', category:'configuracion', subcategory:'Seguridad', icon:'Lock', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Configura la autenticación en dos factores y revisa la seguridad.', keywords:['seguridad','2FA','contraseña','autenticación'], content:'Config006Content' },

  // ═══ INTEGRACIONES ═══
  { id:'int-001', title:'Integraciones disponibles', slug:'integraciones-disponibles', category:'integraciones', subcategory:'General', icon:'Plug', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Lista completa de integraciones disponibles en IP-NEXUS.', keywords:['integraciones','conectar','servicios','API'], content:'Int001Content' },
  { id:'int-002', title:'Conectar con Google Workspace', slug:'google-workspace', category:'integraciones', subcategory:'Productividad', icon:'Mail', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Sincroniza tu calendario, emails y documentos de Google.', keywords:['google','gmail','calendar','drive','workspace'], content:'Int002Content' },
  { id:'int-003', title:'API y webhooks', slug:'api-webhooks', category:'integraciones', subcategory:'Desarrollo', icon:'Code', readTime:'5 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Documentación de la API REST de IP-NEXUS.', keywords:['API','webhooks','desarrollo','REST','integración'], content:'Int003Content' },
  { id:'int-004', title:'Automatizaciones con n8n', slug:'automatizaciones-n8n', category:'integraciones', subcategory:'Automatización', icon:'Zap', readTime:'5 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Crea workflows automáticos conectando IP-NEXUS con otras herramientas.', keywords:['n8n','automatización','workflows','zapier'], content:'Int004Content' },

  // ═══ FACTURACIÓN ═══
  { id:'bill-001', title:'Planes y precios', slug:'planes-precios', category:'facturacion', subcategory:'Planes', icon:'CreditCard', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Compara los planes Starter, Professional y Enterprise.', keywords:['planes','precios','starter','professional','enterprise'], content:'Bill001Content' },
  { id:'bill-002', title:'Cambiar de plan', slug:'cambiar-plan', category:'facturacion', subcategory:'Gestión', icon:'ArrowUpCircle', readTime:'2 min', lastUpdated:'Actualizado hace 1 semana', summary:'Cómo upgradar, downgradar o cambiar entre facturación mensual y anual.', keywords:['cambiar','plan','upgrade','anual','mensual'], content:'Bill002Content' },
  { id:'bill-003', title:'Métodos de pago', slug:'metodos-pago', category:'facturacion', subcategory:'Pago', icon:'Wallet', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Métodos de pago aceptados y cómo actualizar tu información.', keywords:['pago','tarjeta','SEPA','transferencia'], content:'Bill003Content' },
  { id:'bill-004', title:'Facturas y recibos', slug:'facturas-recibos', category:'facturacion', subcategory:'Documentos', icon:'Receipt', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Accede a tus facturas, descarga recibos y configura datos fiscales.', keywords:['facturas','recibos','descargar','fiscal'], content:'Bill004Content' },

  // ═══ SOLUCIÓN DE PROBLEMAS ═══
  { id:'fix-001', title:'No puedo acceder a mi cuenta', slug:'no-puedo-acceder', category:'troubleshooting', subcategory:'Acceso', icon:'KeyRound', readTime:'2 min', lastUpdated:'Actualizado hace 1 semana', summary:'Soluciones cuando no puedes iniciar sesión o has olvidado tu contraseña.', keywords:['acceso','login','contraseña','olvidé','bloqueo','sesión'], content:'Fix001Content', relatedArticles:['fix-002'] },
  { id:'fix-002', title:'La página carga lento o no responde', slug:'pagina-lenta', category:'troubleshooting', subcategory:'Rendimiento', icon:'Gauge', readTime:'3 min', lastUpdated:'Actualizado hace 1 semana', summary:'Pasos para diagnosticar y solucionar problemas de rendimiento.', keywords:['lento','carga','rendimiento','error','no responde'], content:'Fix002Content' },
  { id:'fix-003', title:'Error al subir documentos', slug:'error-subir-documentos', category:'troubleshooting', subcategory:'Documentos', icon:'UploadCloud', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Soluciones cuando la carga de documentos falla.', keywords:['error','subir','documentos','upload','fallo'], content:'Fix003Content' },
  { id:'fix-004', title:'No recibo notificaciones por email', slug:'no-recibo-emails', category:'troubleshooting', subcategory:'Notificaciones', icon:'MailX', readTime:'2 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Verifica tu configuración de notificaciones y revisa el spam.', keywords:['email','notificaciones','no recibo','spam'], content:'Fix004Content' },
  { id:'fix-005', title:'Problemas con pagos en IP-Market', slug:'problemas-pagos-market', category:'troubleshooting', subcategory:'IP-Market', icon:'CreditCard', readTime:'3 min', lastUpdated:'Actualizado hace 2 semanas', summary:'Soluciones para problemas de pago y disputas en IP-Market.', keywords:['pago','market','protegido','disputa','reembolso'], content:'Fix005Content' },
  { id:'fix-006', title:'Contactar soporte técnico', slug:'contactar-soporte', category:'troubleshooting', subcategory:'Soporte', icon:'Headphones', readTime:'1 min', lastUpdated:'Actualizado hace 1 semana', summary:'Cómo contactar con nuestro equipo de soporte.', keywords:['soporte','contactar','ayuda','ticket','email','chat'], content:'Fix006Content' },
];

// ═══ SEARCH ═══
export function searchHelpArticles(query: string): HelpArticle[] {
  if (!query || query.length < 2) return [];
  const n = query.toLowerCase().trim();
  return helpArticles
    .filter(a =>
      a.title.toLowerCase().includes(n) ||
      a.summary.toLowerCase().includes(n) ||
      a.keywords.some(k => k.toLowerCase().includes(n))
    )
    .sort((a, b) => {
      const at = a.title.toLowerCase().includes(n) ? 0 : 1;
      const bt = b.title.toLowerCase().includes(n) ? 0 : 1;
      return at - bt;
    })
    .slice(0, 10);
}

export function getArticlesByCategory(category: string): HelpArticle[] {
  return helpArticles.filter(a => a.category === category);
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return helpArticles.find(a => a.slug === slug);
}

export function getArticleById(id: string): HelpArticle | undefined {
  return helpArticles.find(a => a.id === id);
}

export function getArticleCountByCategory(): Record<string, number> {
  return helpArticles.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
