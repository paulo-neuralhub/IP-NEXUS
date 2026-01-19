-- ============================================
-- HELP & SUPPORT SYSTEM - Tablas Principales
-- ============================================

-- ============================================
-- 1. CATEGORÍAS DE AYUDA
-- ============================================
CREATE TABLE IF NOT EXISTS help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  parent_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_categories_parent ON help_categories(parent_id);
CREATE INDEX idx_help_categories_active ON help_categories(is_active, display_order);

-- ============================================
-- 2. ARTÍCULOS DE AYUDA (Knowledge Base)
-- ============================================
CREATE TABLE IF NOT EXISTS help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL UNIQUE,
  
  -- Contenido
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  
  -- Categorización
  category_id UUID REFERENCES help_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Módulo relacionado
  module VARCHAR(50),
  
  -- Tipo
  article_type VARCHAR(30) DEFAULT 'guide',
  -- 'guide', 'tutorial', 'faq', 'troubleshooting', 'reference', 'video'
  
  -- Media
  featured_image VARCHAR(500),
  video_url VARCHAR(500),
  video_duration INTEGER,
  
  -- SEO
  meta_title VARCHAR(200),
  meta_description VARCHAR(300),
  
  -- Búsqueda full-text
  search_vector tsvector,
  
  -- Orden y visibilidad
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  -- Idioma
  language VARCHAR(5) DEFAULT 'es',
  translations JSONB DEFAULT '{}',
  
  -- Estadísticas
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Autoría
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_category ON help_articles(category_id);
CREATE INDEX idx_articles_module ON help_articles(module);
CREATE INDEX idx_articles_type ON help_articles(article_type);
CREATE INDEX idx_articles_published ON help_articles(is_published, published_at DESC);
CREATE INDEX idx_articles_featured ON help_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_articles_search ON help_articles USING GIN(search_vector);

-- Trigger para search vector
CREATE OR REPLACE FUNCTION update_help_article_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('spanish', array_to_string(COALESCE(NEW.tags, '{}'), ' ')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_help_article_search
  BEFORE INSERT OR UPDATE ON help_articles
  FOR EACH ROW EXECUTE FUNCTION update_help_article_search_vector();

-- ============================================
-- 3. FEEDBACK DE ARTÍCULOS
-- ============================================
CREATE TABLE IF NOT EXISTS help_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES help_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  is_helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_feedback_article ON help_article_feedback(article_id);
CREATE INDEX idx_article_feedback_user ON help_article_feedback(user_id);

-- ============================================
-- 4. TICKETS DE SOPORTE
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Identificador
  ticket_number VARCHAR(20) NOT NULL UNIQUE,
  
  -- Contenido
  subject VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  
  -- Clasificación
  category VARCHAR(50) NOT NULL,
  -- 'bug', 'feature_request', 'question', 'billing', 'account', 'other'
  
  priority VARCHAR(20) DEFAULT 'normal',
  -- 'low', 'normal', 'high', 'urgent'
  
  -- Estado
  status VARCHAR(30) DEFAULT 'open',
  -- 'open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'
  
  -- Asignación (agent del backoffice)
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  
  -- Módulo afectado
  affected_module VARCHAR(50),
  
  -- Archivos adjuntos
  attachments JSONB DEFAULT '[]',
  
  -- Metadata
  browser_info JSONB,
  page_url VARCHAR(500),
  
  -- Resolución
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- SLA
  first_response_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  
  -- Satisfacción
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  satisfaction_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_org ON support_tickets(organization_id, status);
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status, created_at DESC);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_tickets_number ON support_tickets(ticket_number);

-- ============================================
-- 5. MENSAJES DE TICKET
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Autor
  author_type VARCHAR(20) NOT NULL,  -- 'customer', 'agent', 'system'
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(100),
  
  -- Contenido
  message TEXT NOT NULL,
  
  -- Adjuntos
  attachments JSONB DEFAULT '[]',
  
  -- Interno (no visible para cliente)
  is_internal BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);

-- ============================================
-- 6. TOOLTIPS CONTEXTUALES
-- ============================================
CREATE TABLE IF NOT EXISTS help_tooltips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  tooltip_key VARCHAR(100) NOT NULL UNIQUE,
  
  -- Contenido
  title VARCHAR(200),
  content TEXT NOT NULL,
  
  -- Ubicación
  page_path VARCHAR(200),
  element_selector VARCHAR(200),
  
  -- Enlace a documentación
  help_article_id UUID REFERENCES help_articles(id) ON DELETE SET NULL,
  help_url VARCHAR(500),
  
  -- Tipo
  tooltip_type VARCHAR(30) DEFAULT 'info',
  -- 'info', 'tip', 'warning', 'new_feature'
  
  -- Condiciones
  show_conditions JSONB DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tooltips_page ON help_tooltips(page_path);
CREATE INDEX idx_tooltips_active ON help_tooltips(is_active);

-- ============================================
-- 7. TOURS/WALKTHROUGHS
-- ============================================
CREATE TABLE IF NOT EXISTS help_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  tour_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Pasos (JSON array)
  steps JSONB NOT NULL DEFAULT '[]',
  
  -- Configuración
  trigger_conditions JSONB DEFAULT '{}',
  show_once BOOLEAN DEFAULT true,
  can_skip BOOLEAN DEFAULT true,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PROGRESO DE TOURS POR USUARIO
-- ============================================
CREATE TABLE IF NOT EXISTS help_tour_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tour_id UUID NOT NULL REFERENCES help_tours(id) ON DELETE CASCADE,
  
  status VARCHAR(20) DEFAULT 'not_started',
  -- 'not_started', 'in_progress', 'completed', 'skipped'
  
  current_step INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tour_id)
);

CREATE INDEX idx_tour_progress_user ON help_tour_progress(user_id);

-- ============================================
-- 9. ANNOUNCEMENTS / CHANGELOG
-- ============================================
CREATE TABLE IF NOT EXISTS help_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  
  -- Tipo
  announcement_type VARCHAR(30) NOT NULL,
  -- 'feature', 'improvement', 'fix', 'maintenance', 'security', 'deprecation'
  
  -- Versión
  version VARCHAR(20),
  
  -- Módulos afectados
  affected_modules TEXT[] DEFAULT '{}',
  
  -- Visibilidad
  audience VARCHAR(30) DEFAULT 'all',
  -- 'all', 'admins', 'enterprise', 'beta'
  
  -- Media
  image_url VARCHAR(500),
  video_url VARCHAR(500),
  
  -- Enlaces
  learn_more_url VARCHAR(500),
  
  -- Destacado
  is_featured BOOLEAN DEFAULT false,
  is_breaking_change BOOLEAN DEFAULT false,
  
  -- Programación
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  expire_at TIMESTAMPTZ,
  
  -- Estado
  is_published BOOLEAN DEFAULT true,
  
  -- Autoría
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON help_announcements(is_published, publish_at DESC);
CREATE INDEX idx_announcements_type ON help_announcements(announcement_type);

-- ============================================
-- 10. ANUNCIOS LEÍDOS
-- ============================================
CREATE TABLE IF NOT EXISTS help_announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES help_announcements(id) ON DELETE CASCADE,
  
  read_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, announcement_id)
);

CREATE INDEX idx_announcement_reads_user ON help_announcement_reads(user_id);

-- ============================================
-- 11. ESTADO DEL SISTEMA
-- ============================================
CREATE TABLE IF NOT EXISTS help_system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Componente
  component VARCHAR(100) NOT NULL,
  -- 'api', 'database', 'filing_service', 'ai_service', 'email', 'storage'
  
  -- Estado
  status VARCHAR(30) NOT NULL,
  -- 'operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance'
  
  -- Descripción
  title VARCHAR(200),
  description TEXT,
  
  -- Impacto
  impact VARCHAR(30),
  -- 'none', 'minor', 'major', 'critical'
  
  -- Timeline
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  expected_resolution_at TIMESTAMPTZ,
  
  -- Actualizaciones
  updates JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_status_active ON help_system_status(resolved_at) WHERE resolved_at IS NULL;

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tooltips ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tour_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_system_status ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Categories: todos pueden ver las activas
CREATE POLICY "Anyone can view active help categories"
  ON help_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Superadmins can manage help categories"
  ON help_categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Articles: todos pueden ver los publicados
CREATE POLICY "Anyone can view published help articles"
  ON help_articles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Superadmins can manage help articles"
  ON help_articles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Article Feedback: usuarios autenticados pueden dar feedback
CREATE POLICY "Users can submit article feedback"
  ON help_article_feedback FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own feedback"
  ON help_article_feedback FOR SELECT
  USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true));

-- Tickets: usuarios ven sus propios tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Ticket Messages
CREATE POLICY "Users can view ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_messages.ticket_id 
      AND (support_tickets.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true))
    ) AND (is_internal = false OR EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true))
  );

CREATE POLICY "Users can add messages to own tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = ticket_messages.ticket_id 
      AND (support_tickets.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true))
    )
  );

-- Tooltips: todos pueden ver los activos
CREATE POLICY "Anyone can view active tooltips"
  ON help_tooltips FOR SELECT
  USING (is_active = true);

CREATE POLICY "Superadmins can manage tooltips"
  ON help_tooltips FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Tours: todos pueden ver los activos
CREATE POLICY "Anyone can view active tours"
  ON help_tours FOR SELECT
  USING (is_active = true);

CREATE POLICY "Superadmins can manage tours"
  ON help_tours FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Tour Progress: usuarios manejan su propio progreso
CREATE POLICY "Users can manage own tour progress"
  ON help_tour_progress FOR ALL
  USING (user_id = auth.uid());

-- Announcements: todos ven los publicados
CREATE POLICY "Anyone can view published announcements"
  ON help_announcements FOR SELECT
  USING (is_published = true AND publish_at <= NOW() AND (expire_at IS NULL OR expire_at > NOW()));

CREATE POLICY "Superadmins can manage announcements"
  ON help_announcements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Announcement Reads
CREATE POLICY "Users can manage own announcement reads"
  ON help_announcement_reads FOR ALL
  USING (user_id = auth.uid());

-- System Status: todos pueden ver
CREATE POLICY "Anyone can view system status"
  ON help_system_status FOR SELECT
  USING (true);

CREATE POLICY "Superadmins can manage system status"
  ON help_system_status FOR ALL
  USING (
    EXISTS (SELECT 1 FROM superadmins WHERE user_id = auth.uid() AND is_active = true)
  );

-- ============================================
-- FUNCTION: Increment article feedback counts
-- ============================================
CREATE OR REPLACE FUNCTION increment_article_feedback(
  p_article_id UUID,
  p_is_helpful BOOLEAN
) RETURNS void AS $$
BEGIN
  IF p_is_helpful THEN
    UPDATE help_articles SET helpful_count = helpful_count + 1 WHERE id = p_article_id;
  ELSE
    UPDATE help_articles SET not_helpful_count = not_helpful_count + 1 WHERE id = p_article_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Generate ticket number
-- ============================================
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'TKT-' || UPPER(TO_CHAR(NOW(), 'YYMMDD')) || '-' || 
                         UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- ============================================
-- INSERT DEFAULT CATEGORIES
-- ============================================
INSERT INTO help_categories (slug, name, description, icon, display_order) VALUES
('getting-started', 'Primeros Pasos', 'Guías para comenzar con IP-NEXUS', 'rocket', 1),
('portfolio', 'Portfolio', 'Gestión de activos de PI', 'folder', 2),
('docket', 'Docket & Deadlines', 'Control de plazos y vencimientos', 'calendar', 3),
('filing', 'Filing', 'Presentación de solicitudes', 'file-text', 4),
('costs', 'Costes', 'Gestión financiera de PI', 'dollar-sign', 5),
('genius', 'Genius AI', 'Asistentes de inteligencia artificial', 'sparkles', 6),
('crm', 'CRM', 'Gestión de contactos y clientes', 'users', 7),
('settings', 'Configuración', 'Ajustes de cuenta y organización', 'settings', 8),
('integrations', 'Integraciones', 'Conexión con otros servicios', 'plug', 9),
('billing', 'Facturación', 'Planes, pagos y facturas', 'credit-card', 10),
('troubleshooting', 'Solución de Problemas', 'Resolución de errores comunes', 'alert-triangle', 11)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INSERT WELCOME TOUR
-- ============================================
INSERT INTO help_tours (tour_key, name, description, steps, show_once) VALUES
(
  'welcome_tour',
  'Tour de Bienvenida',
  'Conoce las funcionalidades principales de IP-NEXUS',
  '[
    {
      "id": "welcome",
      "title": "¡Bienvenido a IP-NEXUS!",
      "content": "Te guiaremos por las funcionalidades principales de la plataforma.",
      "target": "body",
      "placement": "center"
    },
    {
      "id": "sidebar",
      "title": "Menú de navegación",
      "content": "Accede a todos los módulos desde aquí: Portfolio, Docket, Filing, Costes y más.",
      "target": "#sidebar",
      "placement": "right",
      "spotlight": true
    },
    {
      "id": "search",
      "title": "Búsqueda rápida",
      "content": "Pulsa ⌘K (o Ctrl+K) para buscar cualquier activo, contacto o deadline.",
      "target": "#search-button",
      "placement": "bottom",
      "spotlight": true
    },
    {
      "id": "notifications",
      "title": "Centro de notificaciones",
      "content": "Aquí verás alertas de deadlines, actualizaciones de filings y menciones.",
      "target": "#notifications-button",
      "placement": "bottom-end",
      "spotlight": true
    },
    {
      "id": "help",
      "title": "¿Necesitas ayuda?",
      "content": "Accede a documentación, tutoriales y soporte en cualquier momento.",
      "target": "#help-button",
      "placement": "bottom-end",
      "spotlight": true
    }
  ]',
  true
)
ON CONFLICT (tour_key) DO NOTHING;