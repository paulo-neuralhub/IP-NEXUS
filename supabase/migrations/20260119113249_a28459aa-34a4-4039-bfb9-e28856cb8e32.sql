-- ============================================
-- ONBOARDING WIZARD - Tablas completas (con nombres de índice únicos)
-- ============================================

-- 1. PROGRESO DEL ONBOARDING
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  status VARCHAR(30) DEFAULT 'in_progress',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  
  steps_completed JSONB DEFAULT '{}',
  collected_data JSONB DEFAULT '{}',
  
  tour_completed BOOLEAN DEFAULT false,
  tour_progress JSONB DEFAULT '{}',
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  started_by UUID REFERENCES auth.users(id)
);

CREATE UNIQUE INDEX idx_onboarding_progress_org ON onboarding_progress(organization_id);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_progress_select" ON onboarding_progress
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "onboarding_progress_update" ON onboarding_progress
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "onboarding_progress_insert" ON onboarding_progress
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- 2. IMPORTACIONES DE DATOS
CREATE TABLE data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  source_type VARCHAR(50) NOT NULL,
  source_file_id TEXT,
  source_file_name VARCHAR(255),
  
  data_type VARCHAR(50) NOT NULL,
  column_mapping JSONB,
  
  status VARCHAR(30) DEFAULT 'pending',
  
  validation_results JSONB,
  import_results JSONB,
  options JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_data_imports_org ON data_imports(organization_id, created_at DESC);

ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "data_imports_select" ON data_imports
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "data_imports_all" ON data_imports
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- 3. ONBOARDING TIPS
CREATE TABLE onboarding_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  tip_key VARCHAR(100) NOT NULL UNIQUE,
  
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  
  module VARCHAR(50),
  trigger_type VARCHAR(50),
  trigger_condition JSONB,
  
  position VARCHAR(30) DEFAULT 'bottom',
  highlight_selector VARCHAR(200),
  
  tour_order INTEGER,
  is_tour_step BOOLEAN DEFAULT false,
  
  dismissible BOOLEAN DEFAULT true,
  show_once BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE onboarding_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_tips_select" ON onboarding_tips
  FOR SELECT USING (is_active = true);

-- 4. PROGRESO DE TIPS POR USUARIO
CREATE TABLE user_tip_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  tip_id UUID NOT NULL REFERENCES onboarding_tips(id) ON DELETE CASCADE,
  
  status VARCHAR(30) DEFAULT 'unseen',
  
  seen_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  UNIQUE(user_id, tip_id)
);

CREATE INDEX idx_user_tip_progress ON user_tip_progress(user_id, status);

ALTER TABLE user_tip_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tip_progress_select" ON user_tip_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_tip_progress_all" ON user_tip_progress
  FOR ALL USING (user_id = auth.uid());

-- 5. ORGANIZATION OFFICES (favoritas)
CREATE TABLE organization_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  
  is_favorite BOOLEAN DEFAULT true,
  credentials_configured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, office_id)
);

ALTER TABLE organization_offices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organization_offices_select" ON organization_offices
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "organization_offices_all" ON organization_offices
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- ============================================
-- DATOS INICIALES - Tips de onboarding
-- ============================================

INSERT INTO onboarding_tips (tip_key, title, content, module, trigger_type, position, highlight_selector, tour_order, is_tour_step) VALUES
('tour_welcome', 'Bienvenido a IP-NEXUS', 'Esta es tu plataforma de gestión de Propiedad Intelectual. Te guiaremos por las funciones principales.', NULL, 'first_visit', 'center', NULL, 1, true),
('tour_dashboard', 'Dashboard Principal', 'Aquí verás un resumen de tu portfolio: activos, deadlines próximos, tareas pendientes y métricas clave.', 'dashboard', 'first_visit', 'bottom', '.dashboard-stats', 2, true),
('tour_docket', 'Gestión de Expedientes', 'Gestiona todos tus expedientes de PI: marcas, patentes y diseños. Filtra, busca y organiza fácilmente.', 'docket', 'first_visit', 'right', '.sidebar-docket', 3, true),
('tour_spider', 'Vigilancia de Marcas', 'Monitoriza el mercado para detectar marcas similares y proteger tus derechos.', 'spider', 'first_visit', 'bottom', '.sidebar-spider', 4, true),
('tour_genius', 'Asistente IA', 'Usa la inteligencia artificial para analizar marcas, generar documentos y obtener asesoramiento.', 'genius', 'first_visit', 'bottom', '.sidebar-genius', 5, true),
('tour_search', 'Búsqueda Inteligente', 'Usa Cmd/Ctrl + K para buscar cualquier cosa: expedientes, contactos, documentos...', NULL, 'first_visit', 'top', '.search-bar', 6, true),
('tour_complete', '¡Listo para empezar!', 'Ya conoces lo básico. Explora la plataforma y no dudes en usar el botón de ayuda si necesitas asistencia.', NULL, 'first_visit', 'center', NULL, 7, true),
('tip_keyboard_shortcuts', 'Atajos de Teclado', 'Pulsa ? en cualquier momento para ver todos los atajos disponibles.', NULL, 'feature', 'bottom', NULL, NULL, false),
('tip_bulk_actions', 'Acciones en Lote', 'Selecciona múltiples expedientes con Shift+Click para realizar acciones masivas.', 'docket', 'action', 'top', '.bulk-actions', NULL, false),
('tip_filters', 'Filtros Avanzados', 'Combina múltiples filtros y guárdalos como vistas personalizadas.', 'docket', 'feature', 'left', '.filter-panel', NULL, false);