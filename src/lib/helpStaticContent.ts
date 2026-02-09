// ============================================================
// IP-NEXUS HELP - STATIC CONTENT DATA
// Real articles in Spanish for all categories
// ============================================================

export interface StaticHelpArticle {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  tags: string[];
  readTime: string;
  articleType: 'guide' | 'tutorial' | 'faq' | 'troubleshooting' | 'reference';
  content: string; // markdown
  isFeatured?: boolean;
}

export interface StaticHelpCategory {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ── Categories ──
export const HELP_CATEGORIES: StaticHelpCategory[] = [
  { slug: 'getting-started', name: 'Primeros Pasos', description: 'Guías esenciales para empezar a usar IP-NEXUS', icon: 'zap', color: '#2563eb' },
  { slug: 'portfolio', name: 'Portfolio', description: 'Gestión de tu cartera de propiedad intelectual', icon: 'database', color: '#0ea5e9' },
  { slug: 'docket', name: 'Docket & Deadlines', description: 'Expedientes, plazos y gestión de trámites', icon: 'book-open', color: '#0ea5e9' },
  { slug: 'filing', name: 'Filing', description: 'Presentación de solicitudes ante oficinas', icon: 'target', color: '#14b8a6' },
  { slug: 'costes', name: 'Costes', description: 'Control de costes y presupuestos de PI', icon: 'credit-card', color: '#14b8a6' },
  { slug: 'genius', name: 'Genius AI', description: 'Asistentes de inteligencia artificial', icon: 'brain', color: '#f59e0b' },
  { slug: 'crm', name: 'CRM', description: 'Gestión de contactos y relaciones comerciales', icon: 'users', color: '#ec4899' },
  { slug: 'configuracion', name: 'Configuración', description: 'Ajustes de la organización y preferencias', icon: 'settings', color: '#64748b' },
  { slug: 'integraciones', name: 'Integraciones', description: 'Conexiones con servicios y plataformas externas', icon: 'trending-up', color: '#8b5cf6' },
  { slug: 'facturacion', name: 'Facturación', description: 'Planes, pagos y gestión de suscripción', icon: 'credit-card', color: '#f59e0b' },
  { slug: 'troubleshooting', name: 'Solución de Problemas', description: 'Resolución de errores y problemas comunes', icon: 'shield', color: '#ef4444' },
];

// ── Articles ──
export const HELP_ARTICLES: StaticHelpArticle[] = [
  // ═══════════════════════════════════════
  // PRIMEROS PASOS
  // ═══════════════════════════════════════
  {
    slug: 'bienvenida-ip-nexus',
    title: 'Bienvenida a IP-NEXUS: Tu guía de inicio',
    summary: 'Todo lo que necesitas para dar tus primeros pasos en IP-NEXUS y configurar tu espacio de trabajo.',
    categorySlug: 'getting-started',
    tags: ['onboarding', 'configuración', 'inicio'],
    readTime: '5 min',
    articleType: 'guide',
    isFeatured: true,
    content: `
## ¿Qué es IP-NEXUS?

IP-NEXUS es la plataforma integral para la gestión de propiedad intelectual. Desde el registro de marcas y patentes hasta la vigilancia y análisis estratégico, IP-NEXUS centraliza todas las operaciones de tu despacho o departamento de PI.

## Primeros pasos

### 1. Configura tu organización

Tras crear tu cuenta, el primer paso es configurar los datos de tu organización:

- **Nombre y logo**: Aparecerán en tus comunicaciones y documentos
- **Dirección fiscal**: Necesaria para la facturación
- **Zona horaria**: Para los plazos y notificaciones

Ve a **Configuración → Organización** para completar estos datos.

### 2. Invita a tu equipo

IP-NEXUS funciona mejor en equipo. Desde **Configuración → Usuarios** puedes invitar a colaboradores con diferentes roles:

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total, gestión de usuarios |
| **Manager** | CRUD expedientes, CRM, reportes |
| **Miembro** | Editar expedientes asignados |
| **Visor** | Solo lectura |

### 3. Crea tu primer expediente

Ve a **Expedientes → Nuevo** y sigue el asistente para crear tu primer expediente de PI. Necesitarás:

- Tipo de PI (marca, patente, diseño)
- Datos del titular
- Jurisdicción
- Clases o área técnica

> **💡 Consejo**: Usa la importación masiva si ya tienes expedientes en otro sistema. Ve a **Configuración → Importar datos**.

### 4. Explora el Dashboard

Tu Dashboard te da una vista instantánea de:

- 📊 Expedientes activos y su estado
- ⏰ Plazos próximos que requieren atención
- 📈 Métricas clave de tu portfolio
- 🔔 Notificaciones y alertas recientes

## ¿Necesitas ayuda?

- Usa **NEXUS Guide** (botón flotante) para obtener ayuda contextual
- Crea un **ticket de soporte** desde Ayuda → Mis Tickets
- Consulta la **documentación completa** en cada sección
`,
  },
  {
    slug: 'crear-primer-expediente',
    title: 'Cómo crear tu primer expediente de PI',
    summary: 'Tutorial paso a paso para registrar una marca, patente o diseño en IP-NEXUS.',
    categorySlug: 'getting-started',
    tags: ['expedientes', 'marcas', 'patentes', 'tutorial'],
    readTime: '4 min',
    articleType: 'tutorial',
    isFeatured: true,
    content: `
## Antes de empezar

Asegúrate de tener preparados:
- Los datos del **titular** (persona física o jurídica)
- El **tipo de PI** que quieres registrar
- La **jurisdicción** donde deseas proteger tu PI
- Para marcas: las **clases de Niza** relevantes
- Para patentes: la **descripción técnica** y reivindicaciones

## Paso 1: Accede al formulario

Navega a **Expedientes** en el menú lateral y haz clic en el botón **+ Nuevo expediente**. También puedes usar el atajo de teclado \`Ctrl+N\`.

## Paso 2: Selecciona el tipo de PI

Elige entre:
- 🏷️ **Marca**: Denominativa, figurativa, mixta, tridimensional
- 📋 **Patente**: Invención, modelo de utilidad
- 🎨 **Diseño industrial**: Dibujos y modelos
- 📝 **Nombre comercial**
- 🌐 **Nombre de dominio**

## Paso 3: Completa los datos básicos

Rellena la información del expediente:

- **Referencia interna**: Se genera automáticamente, pero puedes personalizarla
- **Denominación**: El nombre de la marca, título de la patente, etc.
- **Titular**: Selecciona de tu CRM o crea un nuevo contacto
- **Representante**: El agente o abogado encargado

## Paso 4: Configura la jurisdicción

Selecciona la oficina de PI donde se presenta:

- 🇪🇸 OEPM (España)
- 🇪🇺 EUIPO (Unión Europea)
- 🌍 OMPI/WIPO (Internacional)
- 🇺🇸 USPTO (Estados Unidos)
- Otras oficinas nacionales

## Paso 5: Añade las clases (para marcas)

Si estás registrando una marca, selecciona las clases de la Clasificación de Niza:

1. Haz clic en **Añadir clase**
2. Busca por número o descripción
3. Selecciona las clases relevantes
4. Añade la descripción de productos/servicios

> **💡 Consejo**: Usa NEXUS Genius para obtener sugerencias de clasificación basadas en tu descripción de productos.

## Paso 6: Documenta y guarda

Adjunta los documentos necesarios (logo, memoria descriptiva, etc.) y haz clic en **Crear expediente**.

> **⚠️ Importante**: El expediente se crea en estado "Borrador". Revisa toda la información antes de cambiar el estado a "Presentado".

## Siguientes pasos

Una vez creado el expediente, puedes:
- Configurar **plazos y recordatorios**
- Asociar **costes estimados**
- Vincular **contactos relacionados**
- Activar **vigilancia** en IP-Spider
`,
  },
  {
    slug: 'navegacion-dashboard',
    title: 'Navegación y Dashboard: domina la interfaz',
    summary: 'Aprende a moverte por IP-NEXUS y saca el máximo partido al Dashboard.',
    categorySlug: 'getting-started',
    tags: ['dashboard', 'navegación', 'interfaz'],
    readTime: '3 min',
    articleType: 'guide',
    content: `
## Estructura de la interfaz

IP-NEXUS organiza la interfaz en tres áreas principales:

### Barra lateral (Sidebar)

La barra lateral izquierda es tu navegación principal. Contiene:

- 📊 **Dashboard**: Vista general
- 📁 **Expedientes**: Gestión de PI
- 🔗 **Data Hub**: Conexiones con oficinas
- 🕷️ **Spider**: Vigilancia y alertas
- 💰 **Finance**: Costes y facturación
- 👥 **CRM**: Gestión de contactos
- 📣 **Marketing**: Campañas y emails
- 🧠 **Genius**: Asistentes de IA
- 🏪 **Market**: Marketplace de servicios
- ⚙️ **Configuración**: Ajustes

> **💡 Consejo**: Puedes colapsar la barra lateral con el botón \`≡\` para ganar espacio de trabajo.

### Área principal

El contenido de cada módulo se muestra en el área central. Incluye:
- Cabecera con título y acciones principales
- Filtros y búsqueda
- Contenido (tablas, formularios, dashboards)

### Barra de acciones rápidas

En la parte superior encontrarás:
- 🔍 **Búsqueda global** (\`Ctrl+K\`)
- 🔔 **Notificaciones**
- 👤 **Tu perfil**

## El Dashboard

El Dashboard es tu centro de comando. Muestra:

### KPIs principales
- Expedientes activos, pendientes, completados
- Plazos próximos (7, 15, 30 días)
- Actividad reciente del equipo

### Widgets personalizables
- Arrastra y reorganiza las tarjetas
- Añade o quita widgets según tus necesidades
- Filtra por período temporal

### Accesos directos
- Botones rápidos para las acciones más frecuentes
- Expedientes recientes
- Tareas pendientes

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| \`Ctrl+K\` | Búsqueda global |
| \`Ctrl+N\` | Nuevo expediente |
| \`Ctrl+/\` | Mostrar atajos |
| \`Esc\` | Cerrar modal/panel |
`,
  },

  // ═══════════════════════════════════════
  // PORTFOLIO
  // ═══════════════════════════════════════
  {
    slug: 'gestion-portfolio-pi',
    title: 'Gestión de tu portfolio de PI',
    summary: 'Cómo visualizar, filtrar y analizar tu cartera de propiedad intelectual.',
    categorySlug: 'portfolio',
    tags: ['portfolio', 'cartera', 'análisis'],
    readTime: '4 min',
    articleType: 'guide',
    content: `
## Vista general del portfolio

El módulo de Portfolio te permite tener una visión completa de toda tu cartera de propiedad intelectual en un solo lugar.

### Filtros disponibles

Puedes filtrar tu portfolio por:

- **Tipo de PI**: Marcas, patentes, diseños, dominios
- **Estado**: Vigente, en trámite, vencido, abandonado
- **Jurisdicción**: País u oficina
- **Titular**: Persona física o jurídica
- **Fecha**: Solicitud, concesión, vencimiento
- **Clase de Niza**: Para marcas
- **CPC/IPC**: Para patentes

### Vistas disponibles

| Vista | Uso ideal |
|-------|-----------|
| **Tabla** | Gestión masiva, exportación |
| **Tarjetas** | Revisión visual rápida |
| **Mapa** | Distribución geográfica |
| **Timeline** | Evolución temporal |

### Exportación

Puedes exportar tu portfolio en formato:
- 📊 Excel (.xlsx)
- 📄 PDF (informe)
- 📋 CSV (datos planos)

> **💡 Consejo**: Programa exportaciones periódicas para mantener backups de tu cartera.

## Métricas del portfolio

El dashboard de portfolio muestra:

- Total de activos por tipo
- Distribución geográfica
- Próximos vencimientos
- Costes acumulados
- Tendencias de crecimiento
`,
  },
  {
    slug: 'importar-portfolio',
    title: 'Importar tu portfolio existente',
    summary: 'Migra tus expedientes desde hojas de cálculo u otros sistemas a IP-NEXUS.',
    categorySlug: 'portfolio',
    tags: ['importar', 'migración', 'excel'],
    readTime: '5 min',
    articleType: 'tutorial',
    content: `
## Formatos soportados

IP-NEXUS acepta importaciones desde:
- 📊 **Excel** (.xlsx, .xls)
- 📋 **CSV** (separado por comas o punto y coma)
- 🔄 **Otros sistemas**: Consulta con soporte para migraciones asistidas

## Proceso de importación

### 1. Prepara tu archivo

Asegúrate de que tu archivo contiene al menos estas columnas:

| Columna | Obligatoria | Ejemplo |
|---------|-------------|---------|
| Referencia | Sí | MRC-2024-001 |
| Tipo | Sí | Marca |
| Denominación | Sí | AURORA |
| Titular | Sí | Tech Corp S.L. |
| Jurisdicción | Sí | EUIPO |
| Estado | No | En trámite |
| Fecha solicitud | No | 2024-01-15 |
| Clases | No | 9, 35, 42 |

### 2. Sube el archivo

1. Ve a **Configuración → Importar datos**
2. Selecciona **Importar expedientes**
3. Arrastra o selecciona tu archivo
4. IP-NEXUS detectará automáticamente las columnas

### 3. Mapea los campos

Revisa que cada columna de tu archivo se corresponde con el campo correcto en IP-NEXUS. El sistema sugiere el mapeo automáticamente.

### 4. Revisa y confirma

Antes de importar, podrás:
- Ver una **preview** de los datos
- Identificar **errores** o datos incompletos
- Decidir qué hacer con **duplicados**

### 5. Importa

Haz clic en **Importar** y espera a que el proceso finalice. Recibirás un informe con:
- ✅ Expedientes importados correctamente
- ⚠️ Expedientes con advertencias
- ❌ Expedientes con errores

> **⚠️ Importante**: La importación masiva no se puede deshacer automáticamente. Revisa bien los datos antes de confirmar.

> **💡 Consejo**: Si tienes más de 500 expedientes, contacta con nuestro equipo para una migración asistida gratuita.
`,
  },

  // ═══════════════════════════════════════
  // DOCKET & DEADLINES
  // ═══════════════════════════════════════
  {
    slug: 'gestion-expedientes',
    title: 'Gestión completa de expedientes',
    summary: 'Todo sobre la creación, edición y seguimiento de expedientes de PI.',
    categorySlug: 'docket',
    tags: ['expedientes', 'docket', 'gestión'],
    readTime: '6 min',
    articleType: 'guide',
    isFeatured: true,
    content: `
## Vista de expedientes

La sección de Expedientes es el corazón de IP-NEXUS. Desde aquí gestionas todo el ciclo de vida de tus derechos de propiedad intelectual.

### Tabla de expedientes

La vista principal muestra todos tus expedientes con:

- **Referencia**: Tu código interno
- **Tipo**: Marca, patente, diseño, etc.
- **Denominación**: Nombre o título
- **Titular**: Propietario del derecho
- **Estado**: Fase actual del trámite
- **Jurisdicción**: Oficina de PI
- **Plazos**: Próxima fecha importante

### Acciones rápidas

Desde la tabla puedes:
- 🔍 **Filtrar** por cualquier columna
- 🔄 **Ordenar** ascendente/descendente
- ✏️ **Editar** con doble clic
- 📋 **Copiar** referencia
- 🗑️ **Archivar** expedientes inactivos

## Ficha del expediente

Al abrir un expediente ves su ficha completa organizada en pestañas:

### Datos generales
- Información básica del expediente
- Estado y fechas clave
- Titular y representante

### Documentos
- Documentos adjuntos al expediente
- Versiones y control de cambios
- Compartir con clientes (portal)

### Plazos
- Todos los plazos asociados
- Recordatorios configurables
- Historial de acciones

### Costes
- Tasas oficiales
- Honorarios profesionales
- Presupuestos y facturas vinculadas

### Actividad
- Historial completo de cambios
- Notas internas
- Comunicaciones relacionadas

## Estados del expediente

| Estado | Descripción |
|--------|-------------|
| 📝 Borrador | Expediente en preparación |
| 📤 Presentado | Solicitud enviada a la oficina |
| 🔍 En examen | Oficina revisando la solicitud |
| 📢 Publicado | En período de oposición |
| ✅ Concedido | Derecho otorgado |
| 🔄 Renovación | Pendiente de renovación |
| ❌ Denegado | Solicitud rechazada |
| 📁 Archivado | Expediente cerrado |

> **💡 Consejo**: Configura acciones automáticas al cambiar de estado. Por ejemplo, enviar un email al cliente cuando un expediente pase a "Concedido".
`,
  },
  {
    slug: 'plazos-recordatorios',
    title: 'Plazos y recordatorios: nunca pierdas una fecha',
    summary: 'Configura y gestiona los plazos legales de tus expedientes de forma eficiente.',
    categorySlug: 'docket',
    tags: ['plazos', 'deadlines', 'recordatorios', 'alertas'],
    readTime: '4 min',
    articleType: 'guide',
    content: `
## Sistema de plazos

IP-NEXUS gestiona automáticamente los plazos legales asociados a tus expedientes. El sistema incluye:

### Tipos de plazos

- ⏰ **Plazos legales**: Fechas impuestas por la ley o la oficina de PI
- 📅 **Plazos internos**: Fechas definidas por tu equipo
- 🔄 **Plazos recurrentes**: Renovaciones periódicas
- ⚡ **Plazos urgentes**: Con prioridad alta

### Configuración de recordatorios

Para cada plazo puedes configurar:

1. **Cuándo avisar**: 30, 15, 7, 3, 1 días antes
2. **A quién avisar**: Responsable, equipo, o contactos específicos
3. **Cómo avisar**: Email, notificación in-app, o ambos
4. **Escalado**: Si no se atiende, escalar a supervisor

### Vista de plazos

Accede a la vista de plazos desde **Expedientes → Plazos** para ver:

- 📋 **Lista**: Todos los plazos ordenados cronológicamente
- 📅 **Calendario**: Vista mensual con plazos destacados
- 🚨 **Urgentes**: Solo plazos de los próximos 7 días

### Código de colores

| Color | Significado |
|-------|-------------|
| 🔴 Rojo | Vence en ≤5 días o vencido |
| 🟡 Amarillo | Vence en ≤15 días |
| 🟢 Verde | Vence en >15 días |
| ✅ Completado | Acción realizada |

> **⚠️ Importante**: Los plazos legales no se pueden eliminar, solo completar. Esto es una medida de seguridad para evitar pérdidas de derechos.

> **💡 Consejo**: Activa las notificaciones por email para no depender solo de la app. Ve a **Configuración → Notificaciones**.
`,
  },
  {
    slug: 'busqueda-filtros-expedientes',
    title: 'Búsqueda avanzada y filtros de expedientes',
    summary: 'Domina la búsqueda y filtrado para encontrar cualquier expediente al instante.',
    categorySlug: 'docket',
    tags: ['búsqueda', 'filtros', 'expedientes'],
    readTime: '3 min',
    articleType: 'reference',
    content: `
## Búsqueda global

Usa \`Ctrl+K\` para abrir la búsqueda global. Puedes buscar por:

- Referencia del expediente
- Denominación (nombre de marca, título de patente)
- Titular
- Número de solicitud/registro

## Filtros avanzados

En la vista de expedientes, haz clic en **Filtros** para acceder a:

### Filtros básicos
- **Tipo de PI**: Marca, patente, diseño, etc.
- **Estado**: Cualquier estado del ciclo de vida
- **Jurisdicción**: País u oficina de PI
- **Responsable**: Miembro del equipo asignado

### Filtros avanzados
- **Fecha de solicitud**: Rango de fechas
- **Fecha de vencimiento**: Próximo vencimiento
- **Clase de Niza**: Una o varias clases
- **Tags**: Etiquetas personalizadas
- **Titular**: Filtrar por propietario
- **Tiene plazos pendientes**: Sí/No
- **Costes**: Rango de importes

### Guardar filtros

Puedes guardar combinaciones de filtros frecuentes:

1. Configura los filtros deseados
2. Haz clic en **Guardar vista**
3. Asigna un nombre descriptivo
4. La vista aparecerá como acceso directo

> **💡 Consejo**: Crea vistas guardadas como "Marcas UE en examen" o "Plazos próximos 30 días" para acceder rápidamente a la información que más consultas.
`,
  },

  // ═══════════════════════════════════════
  // FILING
  // ═══════════════════════════════════════
  {
    slug: 'presentacion-solicitudes',
    title: 'Presentación de solicitudes ante oficinas de PI',
    summary: 'Cómo preparar y gestionar la presentación de solicitudes desde IP-NEXUS.',
    categorySlug: 'filing',
    tags: ['filing', 'solicitudes', 'oficinas'],
    readTime: '5 min',
    articleType: 'guide',
    content: `
## Proceso de Filing

El módulo de Filing de IP-NEXUS te permite preparar y hacer seguimiento de las presentaciones ante oficinas de PI.

### Oficinas soportadas

IP-NEXUS conecta con las principales oficinas:

| Oficina | País/Región | Funcionalidades |
|---------|-------------|-----------------|
| OEPM | España | Consulta, alertas |
| EUIPO | Unión Europea | Consulta, alertas, TMView |
| WIPO | Internacional | Madrid, PCT, La Haya |
| USPTO | Estados Unidos | Consulta, TSDR |
| UKIPO | Reino Unido | Consulta |

### Preparación de la solicitud

1. **Crea el expediente** con tipo "Borrador"
2. **Completa todos los datos** requeridos
3. **Adjunta documentos** necesarios (logos, memorias, etc.)
4. **Revisa con el checklist** automático
5. **Genera el formulario** oficial (si disponible)

### Checklist automático

IP-NEXUS verifica antes de presentar:

- ✅ Datos del titular completos
- ✅ Representante designado
- ✅ Clases/área técnica definida
- ✅ Descripción de productos/servicios
- ✅ Documentos obligatorios adjuntos
- ✅ Tasas calculadas

### Seguimiento post-presentación

Una vez presentada la solicitud:

1. Actualiza el estado a "Presentado"
2. Introduce el **número de solicitud** oficial
3. Los plazos se generan **automáticamente**
4. Activa la **vigilancia** si lo deseas

> **💡 Consejo**: Usa Data Hub para conectar directamente con las oficinas y recibir actualizaciones automáticas del estado de tus solicitudes.
`,
  },

  // ═══════════════════════════════════════
  // COSTES
  // ═══════════════════════════════════════
  {
    slug: 'control-costes-pi',
    title: 'Control de costes de propiedad intelectual',
    summary: 'Cómo registrar, analizar y presupuestar los costes asociados a tu cartera de PI.',
    categorySlug: 'costes',
    tags: ['costes', 'finanzas', 'presupuestos', 'tasas'],
    readTime: '4 min',
    articleType: 'guide',
    content: `
## Tipos de costes

IP-NEXUS clasifica los costes en:

### Tasas oficiales
- Tasas de solicitud
- Tasas de examen
- Tasas de publicación
- Tasas de concesión
- Tasas de renovación
- Tasas de mantenimiento (anualidades)

### Honorarios profesionales
- Honorarios de preparación
- Honorarios de seguimiento
- Honorarios de asesoramiento
- Informes y dictámenes

### Otros costes
- Traducciones
- Legalizaciones
- Búsquedas de anterioridades
- Vigilancia

## Registro de costes

Para registrar un coste:

1. Abre el expediente
2. Ve a la pestaña **Costes**
3. Haz clic en **+ Añadir coste**
4. Completa: tipo, importe, moneda, fecha, descripción
5. Opcionalmente vincula a una factura

### Costes estimados vs. reales

Puedes registrar:
- **Estimaciones**: Costes previstos (presupuesto)
- **Reales**: Costes efectivamente incurridos

El sistema muestra la desviación entre ambos.

## Reportes de costes

Genera informes por:
- 📊 Por expediente
- 👤 Por titular/cliente
- 🌍 Por jurisdicción
- 📅 Por período
- 📈 Tendencias anuales

> **💡 Consejo**: Configura alertas para recibir avisos cuando los costes de un expediente superen el presupuesto estimado.
`,
  },

  // ═══════════════════════════════════════
  // GENIUS AI
  // ═══════════════════════════════════════
  {
    slug: 'genius-ai-asistentes',
    title: 'NEXUS Genius: tus asistentes de IA',
    summary: 'Descubre los agentes de inteligencia artificial que potencian tu trabajo con PI.',
    categorySlug: 'genius',
    tags: ['ia', 'genius', 'asistentes', 'automatización'],
    readTime: '5 min',
    articleType: 'guide',
    isFeatured: true,
    content: `
## ¿Qué es NEXUS Genius?

NEXUS Genius es el sistema de inteligencia artificial de IP-NEXUS. Incluye varios agentes especializados que te ayudan en diferentes tareas.

## Agentes disponibles

### 🧠 NEXUS Legal
**El abogado de PI que nunca duerme**

- Consultas sobre legislación de PI
- Análisis de registrabilidad
- Comparación de marcas
- Redacción de descripciones de productos/servicios
- Informes de anterioridades

### 📊 NEXUS Analyst
**Análisis inteligente de datos**

- Análisis de tu portfolio
- Tendencias del mercado
- Benchmarking competitivo
- Predicciones de costes
- Informes automatizados

### 🕵️ NEXUS Watch
**Vigilancia inteligente**

- Análisis de alertas de Spider
- Evaluación de riesgo automática
- Recomendaciones de acción
- Priorización de amenazas

### 📝 NEXUS Ops
**Automatización de tareas**

- Generación de documentos
- Actualización masiva de datos
- Clasificación automática
- Workflows inteligentes

### 💰 NEXUS Finance
**Análisis financiero de PI**

- Estimación de costes
- Optimización de presupuestos
- ROI de la cartera
- Proyecciones

## Cómo usar Genius

1. Haz clic en **Genius** en el menú lateral
2. Selecciona el agente que necesitas
3. Escribe tu consulta en lenguaje natural
4. El agente analizará el contexto y responderá

### Ejemplo de uso

> **Tú**: "¿Es registrable la marca AURORA para software en la UE?"
>
> **NEXUS Legal**: "Basándome en mi análisis, la marca AURORA presenta los siguientes riesgos: [análisis detallado]..."

> **⚠️ Importante**: Las respuestas de IA son orientativas y no sustituyen el asesoramiento profesional. Siempre verifica la información con fuentes oficiales.

> **💡 Consejo**: Cuanto más contexto des al agente (expediente, jurisdicción, clase), mejores serán sus respuestas.
`,
  },
  {
    slug: 'genius-clasificacion-niza',
    title: 'Clasificación de Niza con Genius AI',
    summary: 'Usa la IA para encontrar las clases y descripciones correctas para tu marca.',
    categorySlug: 'genius',
    tags: ['niza', 'clasificación', 'marcas', 'ia'],
    readTime: '3 min',
    articleType: 'tutorial',
    content: `
## Clasificación asistida por IA

NEXUS Legal puede ayudarte a clasificar correctamente tus productos y servicios según la Clasificación de Niza.

## Cómo funciona

### 1. Describe tus productos

En lugar de buscar manualmente entre las 45 clases, simplemente describe lo que vendes:

> "Vendemos software de gestión empresarial en la nube, ofrecemos consultoría tecnológica y vendemos hardware informático"

### 2. Genius analiza y clasifica

El sistema sugerirá:
- **Clase 9**: Software (programas informáticos)
- **Clase 35**: Consultoría en gestión empresarial
- **Clase 42**: Servicios de computación en la nube (SaaS)

### 3. Descripciones optimizadas

Para cada clase, Genius genera descripciones conformes con la terminología aceptada por las oficinas:

- ✅ "Programas informáticos de gestión empresarial descargables"
- ✅ "Software de gestión de datos como servicio [SaaS]"
- ❌ ~~"Aplicaciones de ordenador"~~ (demasiado genérico)

## Consejos

> **💡 Consejo**: Usa el lenguaje más específico posible. "Software de contabilidad" es mejor que "software" a secas.

> **⚠️ Importante**: Verifica siempre las sugerencias de clasificación con las bases de datos oficiales (TMClass, MGS de EUIPO).

## Soporte multi-jurisdicción

Genius adapta las descripciones según la oficina:
- **EUIPO**: Usa terminología del Manual de la base de datos armonizada
- **OEPM**: Adaptado al español oficial
- **USPTO**: ID Manual compatible
- **WIPO**: Términos del Manager del Sistema de Madrid
`,
  },

  // ═══════════════════════════════════════
  // CRM
  // ═══════════════════════════════════════
  {
    slug: 'crm-gestion-contactos',
    title: 'CRM: gestión de contactos y clientes',
    summary: 'Organiza tus contactos, clientes y oportunidades de negocio con el CRM de IP-NEXUS.',
    categorySlug: 'crm',
    tags: ['crm', 'contactos', 'clientes', 'ventas'],
    readTime: '5 min',
    articleType: 'guide',
    content: `
## El CRM de IP-NEXUS

A diferencia de un CRM genérico, el CRM de IP-NEXUS está diseñado específicamente para profesionales de la propiedad intelectual. Cada contacto puede vincularse directamente a expedientes, plazos y servicios de PI.

## Contactos

### Tipos de contacto
- 👤 **Persona**: Clientes individuales, inventores, representantes
- 🏢 **Empresa**: Personas jurídicas, titulares corporativos
- 🤝 **Agente**: Corresponsales, agentes de PI en otras jurisdicciones

### Información del contacto
- Datos básicos (nombre, email, teléfono)
- Dirección postal
- Datos fiscales
- Expedientes vinculados
- Historial de comunicaciones
- Notas internas

## Pipelines de ventas

El CRM incluye pipelines predefinidos para PI:

### Pipeline de captación
📥 Lead → 📞 Contacto → 📋 Análisis → 💰 Propuesta → 🤝 Negociación → ✅ Cliente

### Pipeline de registro de marca
📝 Solicitud → 🔍 Búsqueda → 📄 Preparación → 📤 Presentación → ⏳ Examen → ✅ Concedida

### Pipeline de renovaciones
📅 Próxima → 📧 Notificado → ✅ Confirmado → 💳 Pagado → 📤 Renovado → ✅ Completado

## Vista Kanban

Visualiza tus deals arrastrando tarjetas entre etapas. Cada tarjeta muestra:
- Nombre del contacto/empresa
- Valor estimado
- Fecha esperada de cierre
- Responsable asignado

## Timeline de actividad

Cada contacto tiene un timeline completo con:
- 📧 Emails enviados y recibidos
- 📞 Llamadas con notas y duración
- 📝 Notas internas
- 📅 Reuniones
- 📋 Expedientes vinculados
- 🔄 Cambios de etapa

> **💡 Consejo**: Vincula siempre tus contactos a los expedientes relevantes. Así podrás ver toda la relación entre cliente y sus activos de PI en un solo lugar.
`,
  },
  {
    slug: 'crm-pipelines-personalizados',
    title: 'Crear pipelines personalizados',
    summary: 'Personaliza los pipelines del CRM para adaptarlos a tu flujo de trabajo.',
    categorySlug: 'crm',
    tags: ['crm', 'pipelines', 'personalización'],
    readTime: '3 min',
    articleType: 'tutorial',
    content: `
## Crear un nuevo pipeline

1. Ve a **CRM → Configuración → Pipelines**
2. Haz clic en **+ Nuevo pipeline**
3. Asigna un nombre descriptivo
4. Añade las etapas en orden

## Configurar etapas

Para cada etapa puedes definir:

- **Nombre**: Ej. "Propuesta enviada"
- **Color**: Para identificación visual
- **Probabilidad** (%): Probabilidad de cierre estimada
- **Etapa ganada**: Marcar como etapa de éxito
- **Etapa perdida**: Marcar como etapa de pérdida

### Acciones automáticas por etapa

Configura qué sucede al mover un deal a una etapa:

- 📧 Enviar email automático al contacto
- 📝 Crear tarea para el responsable
- 🔔 Notificar a un miembro del equipo
- 📋 Actualizar campo personalizado

## Ejemplo: Pipeline de oposiciones

| Etapa | Probabilidad | Acción automática |
|-------|-------------|-------------------|
| 🚨 Alerta recibida | 10% | Notificar al responsable |
| 📊 Análisis de riesgo | 20% | Crear tarea de análisis |
| 👤 Consulta al cliente | 30% | Enviar email al titular |
| ⚖️ Acción iniciada | 50% | — |
| 📝 Intercambio escritos | 60% | — |
| 🏛️ Vista/Audiencia | 75% | Recordatorio 7 días antes |
| 📜 Resolución | 90% | — |
| ✅ Cerrado | 100% | Actualizar expediente |

> **💡 Consejo**: No crees demasiadas etapas. 5-8 etapas por pipeline es lo ideal para mantener la claridad.
`,
  },

  // ═══════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════
  {
    slug: 'configurar-organizacion',
    title: 'Configuración de la organización',
    summary: 'Personaliza IP-NEXUS con los datos y preferencias de tu organización.',
    categorySlug: 'configuracion',
    tags: ['configuración', 'organización', 'ajustes'],
    readTime: '4 min',
    articleType: 'guide',
    content: `
## Datos de la organización

En **Configuración → Organización** puedes gestionar:

### Información básica
- **Nombre**: Nombre de tu despacho/empresa
- **Logo**: Se muestra en la app y documentos
- **Dirección**: Sede principal
- **Teléfono y email**: Datos de contacto

### Configuración regional
- **País**: País principal de operación
- **Zona horaria**: Para plazos y notificaciones
- **Idioma**: Español, English
- **Moneda**: EUR, USD, GBP, etc.
- **Formato de fecha**: DD/MM/YYYY, MM/DD/YYYY

## Gestión de usuarios

### Invitar usuarios

1. Ve a **Configuración → Usuarios**
2. Haz clic en **Invitar usuario**
3. Introduce el email del invitado
4. Selecciona el **rol** apropiado
5. El usuario recibirá un email con instrucciones

### Roles disponibles

| Rol | Descripción |
|-----|-------------|
| **Owner** | Control total, facturación |
| **Admin** | Gestión de usuarios y configuración |
| **Manager** | CRUD completo, reportes |
| **Miembro** | Editar lo asignado |
| **Visor** | Solo lectura |
| **Portal** | Acceso limitado para clientes |

## Notificaciones

Configura qué notificaciones recibes y cómo:

- **In-app**: Campana de notificaciones
- **Email**: Correos electrónicos
- **Digest**: Resumen diario o semanal

### Tipos de notificaciones
- Plazos próximos y vencidos
- Alertas de vigilancia (Spider)
- Cambios en expedientes
- Nuevos tickets de soporte
- Actividad del equipo

> **💡 Consejo**: Activa el digest semanal si no quieres recibir emails individuales pero quieres mantenerte informado.
`,
  },
  {
    slug: 'seguridad-cuenta',
    title: 'Seguridad de la cuenta',
    summary: 'Protege tu cuenta con autenticación de dos factores y gestión de sesiones.',
    categorySlug: 'configuracion',
    tags: ['seguridad', 'autenticación', '2FA', 'contraseña'],
    readTime: '3 min',
    articleType: 'guide',
    content: `
## Autenticación segura

### Cambiar contraseña
1. Ve a **Configuración → Seguridad**
2. Introduce tu contraseña actual
3. Introduce la nueva contraseña (mínimo 8 caracteres)
4. Confirma la nueva contraseña

### Autenticación de dos factores (2FA)
1. Ve a **Configuración → Seguridad → 2FA**
2. Escanea el código QR con tu app de autenticación
3. Introduce el código de verificación
4. Guarda los **códigos de recuperación** en un lugar seguro

> **⚠️ Importante**: Los códigos de recuperación son la única forma de acceder a tu cuenta si pierdes tu dispositivo 2FA. Guárdalos en un lugar seguro.

## Sesiones activas

Puedes ver y gestionar tus sesiones activas:
- **Dispositivo**: Tipo de dispositivo y navegador
- **Ubicación**: Localización aproximada
- **Última actividad**: Fecha y hora
- **Cerrar sesión**: Revoca acceso desde ese dispositivo

## Registro de acceso

El registro de acceso muestra:
- Inicios de sesión exitosos y fallidos
- Cambios de contraseña
- Activaciones/desactivaciones de 2FA
- Dispositivos nuevos

> **💡 Consejo**: Revisa periódicamente tus sesiones activas y cierra las que no reconozcas.
`,
  },

  // ═══════════════════════════════════════
  // INTEGRACIONES
  // ═══════════════════════════════════════
  {
    slug: 'integraciones-disponibles',
    title: 'Integraciones disponibles',
    summary: 'Conecta IP-NEXUS con las herramientas y servicios que ya utilizas.',
    categorySlug: 'integraciones',
    tags: ['integraciones', 'API', 'conexiones'],
    readTime: '4 min',
    articleType: 'reference',
    content: `
## Integraciones nativas

IP-NEXUS se conecta con:

### Oficinas de PI
- 🇪🇸 **OEPM**: Consultas y seguimiento
- 🇪🇺 **EUIPO**: TMView, eSearch, alertas
- 🌍 **WIPO**: Madrid Monitor, PATENTSCOPE
- 🇺🇸 **USPTO**: TSDR, consultas

### Comunicaciones
- 📧 **Email**: Gmail, Outlook (sincronización bidireccional)
- 💬 **WhatsApp Business**: Envío y recepción desde CRM
- 📅 **Calendario**: Google Calendar, Outlook Calendar

### Productividad
- 📁 **Google Drive**: Almacenamiento de documentos
- 📁 **OneDrive/SharePoint**: Integración Microsoft
- 📊 **Excel/Sheets**: Exportación e importación

### Pagos y facturación
- 💳 **Stripe**: Gestión de cobros y suscripciones

## API de IP-NEXUS

Para integraciones personalizadas, IP-NEXUS ofrece una API REST completa:

- Documentación OpenAPI/Swagger
- Autenticación via API keys
- Rate limiting configurable
- Webhooks para eventos

### Endpoints principales

\`\`\`
GET    /api/v1/matters        # Listar expedientes
POST   /api/v1/matters        # Crear expediente
GET    /api/v1/contacts       # Listar contactos
POST   /api/v1/contacts       # Crear contacto
GET    /api/v1/deadlines      # Listar plazos
\`\`\`

> **💡 Consejo**: Si necesitas una integración que no está disponible, contacta con nuestro equipo. Evaluamos las solicitudes de los usuarios para priorizar nuevas integraciones.
`,
  },

  // ═══════════════════════════════════════
  // FACTURACIÓN
  // ═══════════════════════════════════════
  {
    slug: 'planes-facturacion',
    title: 'Planes y facturación',
    summary: 'Información sobre los planes de IP-NEXUS, facturación y gestión de tu suscripción.',
    categorySlug: 'facturacion',
    tags: ['planes', 'facturación', 'suscripción', 'precios'],
    readTime: '3 min',
    articleType: 'reference',
    content: `
## Planes disponibles

| Plan | Precio | Expedientes | Usuarios | Características |
|------|--------|-------------|----------|-----------------|
| **Starter** | €99/mes | 50 | 2 | Funciones básicas |
| **Professional** | €249/mes | 500 | 10 | + Spider avanzado, API |
| **Business** | €499/mes | 2.000 | 25 | + CRM, Marketing |
| **Enterprise** | Personalizado | Ilimitado | Ilimitado | Todo incluido |

### Add-ons disponibles
- **CRM**: +€99/mes
- **Marketing**: +€149/mes
- **Market**: +€49/mes
- **Genius España**: +€79/mes
- **Genius Europa**: +€149/mes
- **Genius Global**: +€249/mes

## Gestión de suscripción

### Cambiar de plan
1. Ve a **Configuración → Suscripción**
2. Compara los planes disponibles
3. Haz clic en **Cambiar plan**
4. El cambio se aplica inmediatamente (prorrateo)

### Facturación
- Facturación mensual o anual (10% descuento)
- Facturas disponibles en **Configuración → Facturas**
- Descarga en PDF
- Envío automático por email

### Métodos de pago
- 💳 Tarjeta de crédito/débito
- 🏦 Domiciliación bancaria (SEPA)
- Gestión segura vía Stripe

> **💡 Consejo**: El plan anual te ahorra un 10%. Si estás satisfecho con IP-NEXUS, te recomendamos cambiar a facturación anual.

> **⚠️ Importante**: Al hacer downgrade de plan, las funcionalidades premium se desactivan al final del período actual. Tus datos se conservan.
`,
  },

  // ═══════════════════════════════════════
  // TROUBLESHOOTING
  // ═══════════════════════════════════════
  {
    slug: 'problemas-comunes',
    title: 'Problemas comunes y soluciones',
    summary: 'Soluciones rápidas a los problemas más frecuentes en IP-NEXUS.',
    categorySlug: 'troubleshooting',
    tags: ['errores', 'problemas', 'soluciones'],
    readTime: '4 min',
    articleType: 'troubleshooting',
    content: `
## Problemas de acceso

### No puedo iniciar sesión
1. Verifica que tu email es correcto
2. Comprueba si Bloq Mayús está activado
3. Usa "Olvidé mi contraseña" para restablecer
4. Si tienes 2FA, asegúrate de usar el código actual
5. Comprueba que tu cuenta no ha sido suspendida

### La página no carga
1. Borra la caché del navegador (\`Ctrl+Shift+Delete\`)
2. Intenta en una ventana de incógnito
3. Desactiva extensiones del navegador
4. Prueba con otro navegador (Chrome, Firefox, Safari)
5. Comprueba tu conexión a internet

## Problemas con expedientes

### No puedo crear un expediente
- Verifica que tienes **permisos de creación** (rol Manager o superior)
- Comprueba que no has alcanzado el **límite de tu plan**
- Asegúrate de completar todos los **campos obligatorios**

### No veo los expedientes de mi equipo
- Verifica tu **rol**: los miembros solo ven expedientes asignados
- Contacta con tu administrador para ajustar permisos
- Usa los filtros para verificar que no estás filtrando datos

## Problemas con notificaciones

### No recibo emails
1. Revisa la carpeta de **spam/correo no deseado**
2. Añade noreply@ip-nexus.com a tus contactos
3. Verifica que las notificaciones por email están **activadas** en Configuración
4. Comprueba que tu email es correcto en tu perfil

### Recibo demasiadas notificaciones
1. Ve a **Configuración → Notificaciones**
2. Desactiva las notificaciones que no necesites
3. Activa el **digest** semanal en lugar de notificaciones individuales

## Problemas de rendimiento

### La app va lenta
- Limpia la caché del navegador
- Cierra pestañas innecesarias
- Verifica tu conexión a internet
- Si el problema persiste, contacta con soporte

> **💡 Consejo**: Si ninguna solución funciona, crea un **ticket de soporte** con una descripción detallada del problema, incluyendo capturas de pantalla y el navegador que utilizas.
`,
  },
  {
    slug: 'contactar-soporte',
    title: 'Cómo contactar con soporte',
    summary: 'Todas las formas de obtener ayuda del equipo de IP-NEXUS.',
    categorySlug: 'troubleshooting',
    tags: ['soporte', 'ayuda', 'contacto', 'tickets'],
    readTime: '2 min',
    articleType: 'guide',
    content: `
## Canales de soporte

### 📝 Tickets de soporte
El canal principal para reportar problemas:

1. Ve a **Ayuda → Mis Tickets**
2. Haz clic en **Nuevo ticket**
3. Selecciona la **categoría** y **prioridad**
4. Describe el problema con todo el detalle posible
5. Adjunta capturas de pantalla si es relevante

**Tiempos de respuesta:**
| Prioridad | Tiempo estimado |
|-----------|----------------|
| Urgente | < 2 horas |
| Alta | < 4 horas |
| Normal | < 24 horas |
| Baja | < 48 horas |

### 💬 Chat en vivo
Disponible en horario laboral (L-V, 9:00-18:00 CET) para planes Professional y superiores.

### 📧 Email
Escríbenos a **soporte@ip-nexus.com** para consultas generales.

### 🤖 NEXUS Guide
El asistente de IA está disponible 24/7 para responder preguntas frecuentes y guiarte por la plataforma.

## Para un ticket eficaz

Incluye siempre:
- **Descripción clara** del problema
- **Pasos para reproducir** el error
- **Navegador y sistema operativo**
- **Capturas de pantalla** o vídeos
- **Mensaje de error** exacto (si hay alguno)

> **💡 Consejo**: Cuanto más detalle incluyas en tu ticket, más rápido podremos ayudarte.
`,
  },
];

// ── Helper functions ──

export function getStaticArticlesByCategory(categorySlug: string): StaticHelpArticle[] {
  return HELP_ARTICLES.filter(a => a.categorySlug === categorySlug);
}

export function getStaticArticle(slug: string): StaticHelpArticle | undefined {
  return HELP_ARTICLES.find(a => a.slug === slug);
}

export function getFeaturedStaticArticles(): StaticHelpArticle[] {
  return HELP_ARTICLES.filter(a => a.isFeatured);
}

export function searchStaticArticles(query: string): StaticHelpArticle[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  return HELP_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(lower) ||
    a.summary.toLowerCase().includes(lower) ||
    a.tags.some(t => t.toLowerCase().includes(lower)) ||
    a.content.toLowerCase().includes(lower)
  ).slice(0, 10);
}

export function getStaticCategory(slug: string): StaticHelpCategory | undefined {
  return HELP_CATEGORIES.find(c => c.slug === slug);
}

// ── Glossary data ──
export interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'general' | 'marcas' | 'patentes' | 'diseños' | 'procedimientos';
}

export const IP_GLOSSARY: GlossaryTerm[] = [
  // ── General ──
  { term: 'Anterioridad', definition: 'Derecho de PI registrado previamente que puede constituir un obstáculo para un nuevo registro.', category: 'general' },
  { term: 'Cesión', definition: 'Transferencia de la titularidad de un derecho de PI de una persona o entidad a otra.', category: 'general' },
  { term: 'Derechos de autor', definition: 'Protección legal otorgada a obras literarias, artísticas, musicales y otras creaciones originales.', category: 'general' },
  { term: 'EUIPO', definition: 'Oficina de Propiedad Intelectual de la Unión Europea, con sede en Alicante. Gestiona marcas y diseños de la UE.', category: 'general' },
  { term: 'Infracción', definition: 'Uso no autorizado de un derecho de PI registrado, que puede dar lugar a acciones legales.', category: 'general' },
  { term: 'Licencia', definition: 'Autorización que otorga el titular de un derecho de PI a un tercero para su uso bajo condiciones determinadas.', category: 'general' },
  { term: 'OEPM', definition: 'Oficina Española de Patentes y Marcas. Organismo encargado del registro de PI en España.', category: 'general' },
  { term: 'OMPI/WIPO', definition: 'Organización Mundial de la Propiedad Intelectual. Organismo internacional de PI con sede en Ginebra.', category: 'general' },
  { term: 'Propiedad industrial', definition: 'Rama de la PI que protege invenciones, marcas, diseños y signos distintivos.', category: 'general' },
  { term: 'Propiedad intelectual', definition: 'Conjunto de derechos que protegen las creaciones del intelecto humano, tanto industriales como artísticas.', category: 'general' },
  { term: 'Registro', definition: 'Acto formal por el que una oficina otorga un derecho de PI a su titular.', category: 'general' },
  { term: 'Solicitud', definition: 'Petición formal de registro de un derecho de PI ante una oficina.', category: 'general' },
  { term: 'Tasa', definition: 'Importe que cobra la oficina de PI por los servicios de registro y mantenimiento.', category: 'general' },
  { term: 'Titular', definition: 'Persona física o jurídica propietaria de un derecho de PI.', category: 'general' },
  { term: 'USPTO', definition: 'United States Patent and Trademark Office. Oficina de patentes y marcas de EE.UU.', category: 'general' },
  { term: 'Vigilancia', definition: 'Monitorización sistemática de nuevos registros o publicaciones que puedan afectar a tus derechos de PI.', category: 'general' },

  // ── Marcas ──
  { term: 'Clase de Niza', definition: 'Sistema internacional que clasifica productos y servicios en 45 clases para el registro de marcas.', category: 'marcas' },
  { term: 'Coexistencia', definition: 'Acuerdo entre titulares de marcas similares para convivir en el mercado bajo condiciones pactadas.', category: 'marcas' },
  { term: 'Denominativa', definition: 'Marca formada exclusivamente por palabras, letras o números, sin elemento gráfico.', category: 'marcas' },
  { term: 'Dilución de marca', definition: 'Debilitamiento del carácter distintivo de una marca notoria por el uso de signos similares en otros sectores.', category: 'marcas' },
  { term: 'Distintividad', definition: 'Capacidad de una marca para identificar y diferenciar productos o servicios de los de otros competidores.', category: 'marcas' },
  { term: 'Figurativa', definition: 'Marca compuesta por un elemento gráfico o diseño, con o sin texto.', category: 'marcas' },
  { term: 'Marca colectiva', definition: 'Marca que identifica productos o servicios de los miembros de una asociación u organización.', category: 'marcas' },
  { term: 'Marca de garantía', definition: 'Marca que certifica que los productos o servicios cumplen determinados estándares de calidad.', category: 'marcas' },
  { term: 'Marca mixta', definition: 'Marca que combina elementos denominativos (texto) y figurativos (gráfico).', category: 'marcas' },
  { term: 'Marca notoria', definition: 'Marca ampliamente conocida en el mercado que goza de protección reforzada.', category: 'marcas' },
  { term: 'Marca tridimensional', definition: 'Marca constituida por una forma tridimensional, como el envase o la forma del producto.', category: 'marcas' },
  { term: 'Protocolo de Madrid', definition: 'Tratado internacional que permite solicitar el registro de marcas en múltiples países con una sola solicitud.', category: 'marcas' },
  { term: 'Riesgo de confusión', definition: 'Probabilidad de que el público confunda dos marcas por su similitud visual, fonética o conceptual.', category: 'marcas' },
  { term: 'TMView', definition: 'Base de datos que permite buscar marcas registradas en múltiples oficinas del mundo.', category: 'marcas' },
  { term: 'Trade dress', definition: 'Apariencia visual general de un producto que sirve como identificador de su origen comercial.', category: 'marcas' },

  // ── Patentes ──
  { term: 'Anualidad', definition: 'Tasa periódica que debe pagarse para mantener vigente una patente. Generalmente a partir del 3er año.', category: 'patentes' },
  { term: 'CPC', definition: 'Clasificación Cooperativa de Patentes. Sistema de clasificación utilizado por las oficinas de patentes.', category: 'patentes' },
  { term: 'Estado de la técnica', definition: 'Conjunto de conocimientos técnicos que se han hecho públicos antes de la fecha de presentación de una patente.', category: 'patentes' },
  { term: 'Invención', definition: 'Solución técnica a un problema técnico que puede ser protegida mediante patente si cumple los requisitos legales.', category: 'patentes' },
  { term: 'Modelo de utilidad', definition: 'Protección para invenciones de menor rango inventivo que las patentes, con tramitación más rápida.', category: 'patentes' },
  { term: 'Novedad', definition: 'Requisito de patentabilidad: la invención no debe haber sido divulgada previamente al público.', category: 'patentes' },
  { term: 'PCT', definition: 'Tratado de Cooperación en materia de Patentes. Permite solicitar protección de patente en múltiples países.', category: 'patentes' },
  { term: 'Reivindicación', definition: 'Parte de la patente que define el alcance de la protección solicitada.', category: 'patentes' },
  { term: 'Secreto industrial', definition: 'Información empresarial confidencial que proporciona ventaja competitiva y se protege mediante confidencialidad.', category: 'patentes' },
  { term: 'SPC (Certificado complementario)', definition: 'Extensión de la protección de patente para productos farmacéuticos y fitosanitarios, compensando retrasos regulatorios.', category: 'patentes' },

  // ── Diseños ──
  { term: 'Arreglo de La Haya', definition: 'Tratado internacional para el registro de diseños industriales en múltiples jurisdicciones.', category: 'diseños' },
  { term: 'Carácter singular', definition: 'Requisito de protección de diseño: la impresión general que produce debe diferir de la de cualquier diseño anterior.', category: 'diseños' },
  { term: 'Diseño comunitario', definition: 'Diseño registrado ante la EUIPO con protección en todos los países de la Unión Europea.', category: 'diseños' },
  { term: 'Diseño industrial', definition: 'Apariencia externa de un producto, definida por líneas, contornos, colores, forma o textura.', category: 'diseños' },
  { term: 'Diseño no registrado', definition: 'Protección automática de 3 años para diseños divulgados en la UE sin necesidad de registro formal.', category: 'diseños' },

  // ── Procedimientos ──
  { term: 'Caducidad', definition: 'Extinción de un derecho de PI por falta de uso, falta de pago de tasas u otras causas legales.', category: 'procedimientos' },
  { term: 'Examen de forma', definition: 'Verificación por la oficina de que la solicitud cumple los requisitos formales.', category: 'procedimientos' },
  { term: 'Examen de fondo', definition: 'Análisis sustantivo de la solicitud por la oficina (registrabilidad, novedad, etc.).', category: 'procedimientos' },
  { term: 'Filing', definition: 'Acto de presentar una solicitud de registro ante una oficina de PI.', category: 'procedimientos' },
  { term: 'Nulidad', definition: 'Procedimiento para declarar inválido un derecho de PI ya registrado, como si nunca hubiera existido.', category: 'procedimientos' },
  { term: 'Oposición', definition: 'Procedimiento por el cual un tercero se opone al registro de un derecho de PI.', category: 'procedimientos' },
  { term: 'Prioridad', definition: 'Derecho a reclamar la fecha de una primera solicitud al presentar en otros países (plazo: 6 meses marcas, 12 meses patentes).', category: 'procedimientos' },
  { term: 'Publicación', definition: 'Divulgación oficial de una solicitud o registro en el boletín de la oficina de PI, abriendo plazos de oposición.', category: 'procedimientos' },
  { term: 'Recurso', definition: 'Acción legal para impugnar una decisión de la oficina de PI ante una instancia superior.', category: 'procedimientos' },
  { term: 'Renovación', definition: 'Acción de mantener vigente un derecho de PI mediante el pago de tasas periódicas.', category: 'procedimientos' },
];

// ── Keyboard shortcuts ──
export interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'general' | 'expedientes' | 'navegación' | 'edición';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { keys: ['Ctrl', 'K'], description: 'Búsqueda global', category: 'general' },
  { keys: ['Ctrl', 'N'], description: 'Nuevo expediente', category: 'expedientes' },
  { keys: ['Ctrl', '/'], description: 'Mostrar atajos de teclado', category: 'general' },
  { keys: ['Esc'], description: 'Cerrar modal o panel', category: 'general' },
  { keys: ['Ctrl', 'S'], description: 'Guardar cambios', category: 'edición' },
  { keys: ['Ctrl', 'Z'], description: 'Deshacer', category: 'edición' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Rehacer', category: 'edición' },
  { keys: ['Alt', '1'], description: 'Ir al Dashboard', category: 'navegación' },
  { keys: ['Alt', '2'], description: 'Ir a Expedientes', category: 'navegación' },
  { keys: ['Alt', '3'], description: 'Ir a CRM', category: 'navegación' },
  { keys: ['Alt', '4'], description: 'Ir a Spider', category: 'navegación' },
  { keys: ['Alt', 'H'], description: 'Ir a Centro de Ayuda', category: 'navegación' },
  { keys: ['↑', '↓'], description: 'Navegar entre filas de tabla', category: 'expedientes' },
  { keys: ['Enter'], description: 'Abrir expediente seleccionado', category: 'expedientes' },
  { keys: ['Ctrl', 'E'], description: 'Exportar vista actual', category: 'expedientes' },
];
