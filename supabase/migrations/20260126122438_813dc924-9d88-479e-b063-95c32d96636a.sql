-- =============================================
-- L56-E: Integrar Sistema de Módulos en Sidebar
-- Añade módulos faltantes y actualiza secciones
-- =============================================

-- PASO 1: Añadir módulos faltantes a platform_modules

INSERT INTO platform_modules (
  code, name, short_name, description, tagline,
  sidebar_section, sidebar_order, sidebar_icon,
  icon, icon_lucide, color,
  price_addon_monthly, price_addon_yearly,
  category, requires_modules, menu_items,
  is_popular, sort_order
) VALUES

-- ========== GESTIÓN ==========
-- Data Hub
(
  'data-hub', 'Data Hub', 'Data Hub',
  'Centro de datos y conectores. Importa y sincroniza información de múltiples fuentes.',
  'Conecta todas tus fuentes de datos',
  'gestion', 3, '🗄️', '🗄️', 'Database', '#6366F1',
  19.00, 182.00, 'addon', '{docket}',
  '[{"label": "Conectores", "path": "/app/data-hub/conectores", "icon": "Plug"}, {"label": "Importar", "path": "/app/data-hub/importar", "icon": "Upload"}]',
  false, 10
),

-- ========== OPERACIONES ==========
-- Filing
(
  'filing', 'Filing', 'Filing',
  'Gestión de presentaciones y trámites ante oficinas de PI.',
  'Presenta solicitudes fácilmente',
  'operaciones', 2, '📤', '📤', 'Send', '#0EA5E9',
  29.00, 278.00, 'addon', '{docket}',
  '[{"label": "Presentar", "path": "/app/filing/presentar", "icon": "Send"}, {"label": "Seguimiento", "path": "/app/filing/seguimiento", "icon": "Eye"}]',
  false, 11
),

-- Workflow
(
  'workflow', 'Workflow', 'Workflow',
  'Automatización de flujos de trabajo y procesos internos.',
  'Automatiza tus procesos',
  'operaciones', 3, '🔀', '🔀', 'GitBranch', '#F59E0B',
  29.00, 278.00, 'addon', '{docket,crm}',
  '[{"label": "Mis workflows", "path": "/app/workflow/lista", "icon": "GitBranch"}, {"label": "Editor", "path": "/app/workflow/editor", "icon": "Edit"}]',
  false, 12
),

-- Finance
(
  'finance', 'Finance', 'Finance',
  'Facturación, presupuestos y gestión financiera de expedientes.',
  'Controla tus finanzas',
  'operaciones', 4, '💰', '💰', 'DollarSign', '#10B981',
  39.00, 374.00, 'addon', '{docket,crm}',
  '[{"label": "Facturas", "path": "/app/finance/facturas", "icon": "FileText"}, {"label": "Presupuestos", "path": "/app/finance/presupuestos", "icon": "Calculator"}]',
  false, 13
),

-- Timetracking
(
  'timetracking', 'Timetracking', 'Tiempo',
  'Control de tiempo y horas trabajadas por expediente.',
  'Registra tu tiempo',
  'operaciones', 5, '⏱️', '⏱️', 'Clock', '#8B5CF6',
  19.00, 182.00, 'addon', '{docket}',
  '[{"label": "Timer", "path": "/app/timetracking/timer", "icon": "Play"}, {"label": "Registros", "path": "/app/timetracking/registros", "icon": "List"}]',
  false, 14
),

-- Equipos
(
  'equipos', 'Equipos', 'Equipos',
  'Gestión de equipos, roles y permisos avanzados.',
  'Gestiona tu equipo',
  'operaciones', 6, '👥', '👥', 'Users', '#EC4899',
  29.00, 278.00, 'addon', '{}',
  '[{"label": "Usuarios", "path": "/app/equipos/usuarios", "icon": "Users"}, {"label": "Roles", "path": "/app/equipos/roles", "icon": "Shield"}]',
  false, 15
),

-- ========== INTELIGENCIA ==========
-- Alertas IA
(
  'alertas-ia', 'Alertas IA', 'Alertas',
  'Sistema de alertas inteligentes basado en IA.',
  'Alertas que importan',
  'inteligencia', 2, '🔔', '🔔', 'Bell', '#F59E0B',
  19.00, 182.00, 'addon', '{}',
  '[{"label": "Alertas", "path": "/app/alertas-ia/lista", "icon": "Bell"}, {"label": "Configurar", "path": "/app/alertas-ia/configurar", "icon": "Settings"}]',
  false, 16
),

-- Informes
(
  'informes', 'Informes', 'Informes',
  'Generación de informes profesionales y automatizados.',
  'Reportes profesionales',
  'inteligencia', 4, '📈', '📈', 'TrendingUp', '#06B6D4',
  29.00, 278.00, 'addon', '{docket}',
  '[{"label": "Generar", "path": "/app/informes/generar", "icon": "FileText"}, {"label": "Plantillas", "path": "/app/informes/plantillas", "icon": "Copy"}]',
  false, 17
),

-- ========== EXTENSIONES ==========
-- Marketing
(
  'marketing', 'Marketing', 'Marketing',
  'Herramientas de marketing y captación de clientes.',
  'Haz crecer tu despacho',
  'extensiones', 1, '📣', '📣', 'Megaphone', '#F97316',
  39.00, 374.00, 'addon', '{crm}',
  '[{"label": "Campañas", "path": "/app/marketing/campanas", "icon": "Mail"}, {"label": "Leads", "path": "/app/marketing/leads", "icon": "UserPlus"}]',
  false, 18
),

-- Market
(
  'market', 'IP-Market', 'Market',
  'Marketplace de servicios de Propiedad Intelectual.',
  'Compra y vende servicios PI',
  'extensiones', 2, '🌐', '🌐', 'Globe', '#3B82F6',
  NULL, NULL, 'addon', '{docket,crm}',
  '[{"label": "Explorar", "path": "/app/market/explorar", "icon": "Search"}, {"label": "Mis servicios", "path": "/app/market/mis-servicios", "icon": "Package"}]',
  false, 19
),

-- IP-Chain
(
  'ip-chain', 'IP-Chain', 'Chain',
  'Registro blockchain de evidencias y pruebas de uso.',
  'Evidencia inmutable',
  'extensiones', 3, '🔗', '🔗', 'Link', '#8B5CF6',
  29.00, 278.00, 'addon', '{docket}',
  '[{"label": "Registrar", "path": "/app/ip-chain/registrar", "icon": "Upload"}, {"label": "Mis registros", "path": "/app/ip-chain/registros", "icon": "List"}]',
  false, 20
),

-- Herramientas
(
  'herramientas', 'Herramientas', 'Tools',
  'Herramientas auxiliares y utilidades para PI.',
  'Utilidades prácticas',
  'extensiones', 4, '🔧', '🔧', 'Wrench', '#64748B',
  NULL, NULL, 'addon', '{}',
  '[{"label": "Calculadoras", "path": "/app/herramientas/calculadoras", "icon": "Calculator"}, {"label": "Buscadores", "path": "/app/herramientas/buscadores", "icon": "Search"}]',
  false, 21
)

ON CONFLICT (code) DO UPDATE SET
  sidebar_section = EXCLUDED.sidebar_section,
  sidebar_order = EXCLUDED.sidebar_order,
  sidebar_icon = EXCLUDED.sidebar_icon,
  menu_items = EXCLUDED.menu_items,
  short_name = EXCLUDED.short_name,
  icon_lucide = EXCLUDED.icon_lucide,
  updated_at = NOW();

-- =============================================
-- PASO 2: Actualizar módulos existentes
-- =============================================

UPDATE platform_modules SET sidebar_section = 'operaciones', sidebar_order = 1 WHERE code = 'spider';
UPDATE platform_modules SET sidebar_section = 'operaciones', sidebar_order = 7 WHERE code = 'communications';
UPDATE platform_modules SET sidebar_section = 'inteligencia', sidebar_order = 1 WHERE code = 'genius';
UPDATE platform_modules SET sidebar_section = 'inteligencia', sidebar_order = 3 WHERE code = 'analytics';
UPDATE platform_modules SET sidebar_section = 'inteligencia', sidebar_order = 5 WHERE code = 'legal-ops';

-- =============================================
-- PASO 3: Actualizar sidebar_sections
-- =============================================

INSERT INTO sidebar_sections (code, name, name_short, icon, display_order, is_always_visible) VALUES
('dashboard', 'Dashboard', NULL, '🏠', 0, true),
('gestion', 'Gestión', 'GESTIÓN', '📋', 1, true),
('operaciones', 'Operaciones', 'OPERACIONES', '💼', 2, false),
('inteligencia', 'Inteligencia', 'INTELIGENCIA', '🧠', 3, false),
('extensiones', 'Extensiones', 'EXTENSIONES', '🧩', 4, false),
('soporte', 'Soporte', 'SOPORTE', '🛟', 5, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order,
  is_always_visible = EXCLUDED.is_always_visible;