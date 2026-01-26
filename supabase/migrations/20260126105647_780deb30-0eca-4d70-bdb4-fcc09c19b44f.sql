-- =============================================
-- L56-A: Sidebar Sections & Platform Modules Organization
-- =============================================

-- PASO 1: Crear tabla de secciones del sidebar
CREATE TABLE IF NOT EXISTS sidebar_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_short TEXT,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_always_visible BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para sidebar_sections
ALTER TABLE sidebar_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active sections" ON sidebar_sections;
CREATE POLICY "Anyone can view active sections"
  ON sidebar_sections FOR SELECT
  USING (is_active = true);

-- Seeds de secciones
INSERT INTO sidebar_sections (code, name, name_short, icon, display_order, is_always_visible) VALUES
('dashboard', 'Inicio', NULL, 'LayoutDashboard', 0, true),
('gestion', 'Gestión', 'GESTIÓN', 'Briefcase', 1, false),
('operaciones', 'Operaciones', 'OPERACIONES', 'Cog', 2, false),
('inteligencia', 'Inteligencia', 'INTELIGENCIA', 'Brain', 3, false),
('extensiones', 'Extensiones', 'EXTENSIONES', 'Puzzle', 4, false),
('sistema', 'Sistema', 'SISTEMA', 'Settings', 5, true)
ON CONFLICT (code) DO NOTHING;

-- PASO 2: Añadir columnas de organización sidebar a platform_modules
ALTER TABLE platform_modules 
  ADD COLUMN IF NOT EXISTS sidebar_section TEXT,
  ADD COLUMN IF NOT EXISTS sidebar_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sidebar_icon TEXT,
  ADD COLUMN IF NOT EXISTS sidebar_expanded_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS menu_items JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS short_name TEXT,
  ADD COLUMN IF NOT EXISTS icon_lucide TEXT,
  ADD COLUMN IF NOT EXISTS color_secondary TEXT DEFAULT '#1D4ED8',
  ADD COLUMN IF NOT EXISTS price_standalone_monthly DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_standalone_yearly DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_addon_monthly DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_addon_yearly DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS requires_modules TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS default_limits JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_price_monthly_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_yearly_id TEXT;

-- Añadir FK constraint si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'platform_modules_sidebar_section_fkey'
  ) THEN
    ALTER TABLE platform_modules 
      ADD CONSTRAINT platform_modules_sidebar_section_fkey 
      FOREIGN KEY (sidebar_section) REFERENCES sidebar_sections(code);
  END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_platform_modules_sidebar_section ON platform_modules(sidebar_section);

-- PASO 3: Actualizar módulos existentes con organización
UPDATE platform_modules SET
  sidebar_section = 'gestion',
  sidebar_order = 1,
  sidebar_icon = 'FolderKanban',
  sidebar_expanded_default = true,
  short_name = 'Docket',
  icon_lucide = 'FolderKanban',
  color_secondary = '#1D4ED8',
  price_standalone_monthly = 39.00,
  price_standalone_yearly = 374.00,
  price_addon_monthly = 29.00,
  price_addon_yearly = 278.00,
  is_popular = true,
  menu_items = '[
    {"label": "Expedientes", "path": "/app/docket", "icon": "Folder"},
    {"label": "Plazos", "path": "/app/docket/deadlines", "icon": "Calendar", "badge": "deadlines"},
    {"label": "Tareas", "path": "/app/docket/tasks", "icon": "CheckSquare", "badge": "tasks"},
    {"label": "Documentos", "path": "/app/docket/documents", "icon": "FileText"}
  ]'::jsonb
WHERE code = 'docket';

UPDATE platform_modules SET
  sidebar_section = 'gestion',
  sidebar_order = 2,
  sidebar_icon = 'Users',
  sidebar_expanded_default = true,
  short_name = 'CRM',
  icon_lucide = 'Users',
  color_secondary = '#047857',
  price_standalone_monthly = 29.00,
  price_standalone_yearly = 278.00,
  price_addon_monthly = 29.00,
  price_addon_yearly = 278.00,
  menu_items = '[
    {"label": "Clientes", "path": "/app/crm/accounts", "icon": "Building2"},
    {"label": "Contactos", "path": "/app/crm/contacts", "icon": "Users"},
    {"label": "Deals", "path": "/app/crm/deals", "icon": "Handshake"},
    {"label": "Actividades", "path": "/app/crm/activities", "icon": "Activity"}
  ]'::jsonb
WHERE code = 'crm';

UPDATE platform_modules SET
  sidebar_section = 'inteligencia',
  sidebar_order = 1,
  sidebar_icon = 'Radar',
  short_name = 'Spider',
  icon_lucide = 'Radar',
  color_secondary = '#6D28D9',
  price_standalone_monthly = 29.00,
  price_standalone_yearly = 278.00,
  price_addon_monthly = 29.00,
  price_addon_yearly = 278.00,
  is_popular = true,
  menu_items = '[
    {"label": "Vigilancias", "path": "/app/spider/watchlists", "icon": "Eye"},
    {"label": "Alertas", "path": "/app/spider/alerts", "icon": "Bell", "badge": "alerts"},
    {"label": "Informes", "path": "/app/spider/reports", "icon": "FileBarChart"}
  ]'::jsonb
WHERE code = 'spider';

UPDATE platform_modules SET
  sidebar_section = 'inteligencia',
  sidebar_order = 2,
  sidebar_icon = 'Brain',
  short_name = 'Genius',
  icon_lucide = 'Brain',
  color_secondary = '#0891B2',
  price_addon_monthly = 29.00,
  price_addon_yearly = 278.00,
  is_popular = true,
  menu_items = '[
    {"label": "Asistente", "path": "/app/genius", "icon": "Bot"},
    {"label": "Historial", "path": "/app/genius/history", "icon": "History"}
  ]'::jsonb
WHERE code = 'genius';

UPDATE platform_modules SET
  sidebar_section = 'inteligencia',
  sidebar_order = 3,
  sidebar_icon = 'BarChart3',
  short_name = 'Analytics',
  icon_lucide = 'BarChart3',
  color_secondary = '#DC2626',
  price_addon_monthly = 19.00,
  price_addon_yearly = 182.00,
  menu_items = '[
    {"label": "Dashboard", "path": "/app/analytics", "icon": "LayoutDashboard"},
    {"label": "Reportes", "path": "/app/analytics/reports", "icon": "FileBarChart"}
  ]'::jsonb
WHERE code = 'analytics';

UPDATE platform_modules SET
  sidebar_section = 'operaciones',
  sidebar_order = 1,
  sidebar_icon = 'Cog',
  short_name = 'Legal-Ops',
  icon_lucide = 'Cog',
  color_secondary = '#D97706',
  price_addon_monthly = 39.00,
  price_addon_yearly = 374.00,
  requires_modules = '{docket,crm}',
  menu_items = '[
    {"label": "Workflows", "path": "/app/legal-ops/workflows", "icon": "GitBranch"},
    {"label": "Plantillas", "path": "/app/legal-ops/templates", "icon": "FileText"},
    {"label": "Servicios", "path": "/app/legal-ops/services", "icon": "ShoppingBag"}
  ]'::jsonb
WHERE code = 'legalops';

UPDATE platform_modules SET
  sidebar_section = 'gestion',
  sidebar_order = 3,
  sidebar_icon = 'Wallet',
  short_name = 'Finance',
  icon_lucide = 'Wallet',
  color_secondary = '#0F766E',
  price_addon_monthly = 29.00,
  price_addon_yearly = 278.00,
  menu_items = '[
    {"label": "Facturación", "path": "/app/finance/invoices", "icon": "Receipt"},
    {"label": "Gastos", "path": "/app/finance/expenses", "icon": "CreditCard"},
    {"label": "Informes", "path": "/app/finance/reports", "icon": "FileBarChart"}
  ]'::jsonb
WHERE code = 'finance';

UPDATE platform_modules SET
  sidebar_section = 'gestion',
  sidebar_order = 4,
  sidebar_icon = 'Database',
  short_name = 'Data Hub',
  icon_lucide = 'Database',
  menu_items = '[
    {"label": "Conexiones", "path": "/app/data-hub", "icon": "Plug"},
    {"label": "Importar", "path": "/app/data-hub/import", "icon": "Upload"}
  ]'::jsonb
WHERE code = 'datahub';

UPDATE platform_modules SET
  sidebar_section = 'extensiones',
  sidebar_order = 2,
  sidebar_icon = 'Store',
  short_name = 'Market',
  icon_lucide = 'Store',
  menu_items = '[
    {"label": "Buscar agentes", "path": "/app/market", "icon": "Search"},
    {"label": "Mis transacciones", "path": "/app/market/transactions", "icon": "ArrowRightLeft"}
  ]'::jsonb
WHERE code = 'market';

-- Insertar módulos que no existen aún
INSERT INTO platform_modules (
  code, name, short_name, description, tagline,
  sidebar_section, sidebar_order, sidebar_icon, icon, icon_lucide,
  color, color_secondary, category,
  price_addon_monthly, price_addon_yearly,
  requires_modules, menu_items, is_active
) VALUES
-- Comunicaciones
(
  'communications',
  'Comunicaciones',
  'Comms',
  'Módulo de comunicaciones integrado. Llamadas, SMS y WhatsApp desde IP-NEXUS.',
  'Llamadas y mensajes integrados',
  'operaciones',
  2,
  'Phone',
  'Phone',
  'Phone',
  '#EC4899',
  '#BE185D',
  'addon',
  39.00, 374.00,
  '{crm}',
  '[
    {"label": "Llamadas", "path": "/app/communications/calls", "icon": "Phone"},
    {"label": "Mensajes", "path": "/app/communications/messages", "icon": "MessageSquare"},
    {"label": "Historial", "path": "/app/communications/history", "icon": "History"}
  ]'::jsonb,
  true
),
-- Portal Cliente
(
  'portal-cliente',
  'Portal Cliente',
  'Portal',
  'Portal de cliente avanzado con autoservicio y acceso a expedientes.',
  'Autoservicio para tus clientes',
  'extensiones',
  1,
  'Globe',
  'Globe',
  'Globe',
  '#64748B',
  '#475569',
  'addon',
  29.00, 278.00,
  '{docket,crm}',
  '[
    {"label": "Configuración", "path": "/app/portal-cliente/config", "icon": "Settings"},
    {"label": "Usuarios", "path": "/app/portal-cliente/users", "icon": "Users"}
  ]'::jsonb,
  true
)
ON CONFLICT (code) DO UPDATE SET
  short_name = EXCLUDED.short_name,
  sidebar_section = EXCLUDED.sidebar_section,
  sidebar_order = EXCLUDED.sidebar_order,
  sidebar_icon = EXCLUDED.sidebar_icon,
  icon_lucide = EXCLUDED.icon_lucide,
  color_secondary = EXCLUDED.color_secondary,
  price_addon_monthly = EXCLUDED.price_addon_monthly,
  price_addon_yearly = EXCLUDED.price_addon_yearly,
  requires_modules = EXCLUDED.requires_modules,
  menu_items = EXCLUDED.menu_items;

-- PASO 4: Vista para obtener menú organizado
CREATE OR REPLACE VIEW sidebar_menu_view AS
SELECT 
  s.code AS section_code,
  s.name AS section_name,
  s.name_short AS section_label,
  s.icon AS section_icon,
  s.display_order AS section_order,
  s.is_always_visible AS section_always_visible,
  m.code AS module_code,
  m.name AS module_name,
  m.short_name AS module_short_name,
  m.sidebar_icon AS module_icon,
  m.icon_lucide AS module_icon_lucide,
  m.color AS module_color,
  m.sidebar_order AS module_order,
  m.sidebar_expanded_default AS module_expanded,
  m.menu_items AS module_menu_items,
  m.category AS module_category,
  m.requires_modules AS module_requires,
  m.is_popular AS module_popular,
  m.is_coming_soon AS module_coming_soon
FROM sidebar_sections s
LEFT JOIN platform_modules m 
  ON m.sidebar_section = s.code 
  AND m.is_active = true
WHERE s.is_active = true
ORDER BY s.display_order, m.sidebar_order;

-- PASO 5: Función para obtener menú del tenant
CREATE OR REPLACE FUNCTION get_tenant_sidebar_menu(p_organization_id UUID)
RETURNS TABLE (
  section_code TEXT,
  section_name TEXT,
  section_label TEXT,
  section_icon TEXT,
  section_order INTEGER,
  section_always_visible BOOLEAN,
  module_code TEXT,
  module_name TEXT,
  module_short_name TEXT,
  module_icon TEXT,
  module_icon_lucide TEXT,
  module_color TEXT,
  module_order INTEGER,
  module_expanded BOOLEAN,
  module_menu_items JSONB,
  module_category TEXT,
  module_requires TEXT[],
  module_popular BOOLEAN,
  module_coming_soon BOOLEAN,
  is_licensed BOOLEAN,
  is_trial BOOLEAN,
  trial_ends_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.section_code,
    v.section_name,
    v.section_label,
    v.section_icon,
    v.section_order,
    v.section_always_visible,
    v.module_code,
    v.module_name,
    v.module_short_name,
    v.module_icon,
    v.module_icon_lucide,
    v.module_color,
    v.module_order,
    v.module_expanded,
    v.module_menu_items,
    v.module_category,
    v.module_requires,
    v.module_popular,
    v.module_coming_soon,
    COALESCE(oml.status IN ('active', 'trial'), false) AS is_licensed,
    COALESCE(oml.status = 'trial', false) AS is_trial,
    oml.trial_ends_at
  FROM sidebar_menu_view v
  LEFT JOIN organization_module_licenses oml 
    ON oml.module_code = v.module_code 
    AND oml.organization_id = p_organization_id
    AND oml.status IN ('active', 'trial')
  ORDER BY v.section_order, v.module_order;
END;
$$;