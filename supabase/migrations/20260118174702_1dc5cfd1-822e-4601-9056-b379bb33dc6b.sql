-- =====================================================
-- WATCHLISTS (Listas de vigilancia)
-- =====================================================
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  -- Configuración
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'trademark',
    'patent',
    'domain',
    'web',
    'social',
    'marketplace'
  )),
  
  -- Qué vigilar
  watch_terms TEXT[] NOT NULL DEFAULT '{}',
  watch_classes INT[] DEFAULT '{}',
  watch_jurisdictions TEXT[] DEFAULT '{}',
  
  -- Vinculación opcional a expediente
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Filtros avanzados
  similarity_threshold INT DEFAULT 70,
  filter_config JSONB DEFAULT '{}',
  
  -- Notificaciones
  notify_email BOOLEAN DEFAULT true,
  notify_in_app BOOLEAN DEFAULT true,
  notify_frequency TEXT DEFAULT 'instant' CHECK (notify_frequency IN ('instant', 'daily', 'weekly')),
  notify_users UUID[] DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_frequency TEXT DEFAULT 'daily' CHECK (run_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Auditoría
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WATCH RESULTS (Resultados de vigilancia)
-- =====================================================
CREATE TABLE watch_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo de resultado
  result_type TEXT NOT NULL CHECK (result_type IN (
    'trademark_filing',
    'trademark_published',
    'patent_filing',
    'domain_registered',
    'web_mention',
    'social_mention',
    'marketplace_listing',
    'similar_logo',
    'renewal_due',
    'opposition_window'
  )),
  
  -- Datos del resultado
  title TEXT NOT NULL,
  description TEXT,
  source TEXT,
  source_url TEXT,
  source_id TEXT,
  
  -- Para marcas/patentes
  applicant_name TEXT,
  applicant_country TEXT,
  filing_date DATE,
  publication_date DATE,
  classes INT[],
  
  -- Para dominios
  domain_name TEXT,
  registrar TEXT,
  registration_date DATE,
  expiry_date DATE,
  
  -- Para web/social
  found_url TEXT,
  found_text TEXT,
  screenshot_url TEXT,
  
  -- Análisis de similitud
  similarity_score INT,
  similarity_type TEXT,
  similarity_details JSONB DEFAULT '{}',
  
  -- Estado y acciones
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new',
    'reviewing',
    'threat',
    'dismissed',
    'actioned'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Acciones tomadas
  action_taken TEXT,
  action_date TIMESTAMPTZ,
  action_by UUID REFERENCES users(id),
  action_notes TEXT,
  
  -- Vinculación
  related_matter_id UUID REFERENCES matters(id),
  related_deal_id UUID REFERENCES deals(id),
  
  -- Fechas importantes
  opposition_deadline DATE,
  
  -- Auditoría
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  
  -- Metadata
  raw_data JSONB DEFAULT '{}'
);

-- =====================================================
-- SIMILARITY ANALYSIS (Análisis de similitud guardados)
-- =====================================================
CREATE TABLE similarity_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Términos comparados
  term_a TEXT NOT NULL,
  term_b TEXT NOT NULL,
  
  -- Imágenes (si aplica)
  image_a_url TEXT,
  image_b_url TEXT,
  
  -- Resultados
  overall_score INT NOT NULL,
  phonetic_score INT,
  visual_score INT,
  conceptual_score INT,
  
  -- Detalles del análisis
  analysis_method TEXT,
  analysis_details JSONB DEFAULT '{}',
  
  -- IA analysis
  ai_explanation TEXT,
  ai_recommendation TEXT,
  
  -- Auditoría
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- OFFICIAL GAZETTES TRACKING (Boletines oficiales)
-- =====================================================
CREATE TABLE gazette_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fuente
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country TEXT,
  url TEXT,
  
  -- Tipo
  source_type TEXT NOT NULL CHECK (source_type IN ('trademark', 'patent', 'design', 'mixed')),
  
  -- Configuración de scraping
  scrape_config JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMPTZ,
  last_issue_date DATE,
  scrape_frequency TEXT DEFAULT 'daily',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ALERTS (Alertas generadas)
-- =====================================================
CREATE TABLE spider_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Origen
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE SET NULL,
  watch_result_id UUID REFERENCES watch_results(id) ON DELETE SET NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Tipo de alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'new_conflict',
    'opposition_window',
    'deadline_approaching',
    'high_similarity',
    'renewal_due',
    'status_change',
    'web_mention',
    'domain_alert',
    'infringement'
  )),
  
  -- Contenido
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Datos adicionales
  data JSONB DEFAULT '{}',
  action_url TEXT,
  
  -- Estado
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'actioned', 'dismissed')),
  
  -- Notificación
  notified_at TIMESTAMPTZ,
  notified_via TEXT[],
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES users(id),
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES users(id)
);

-- =====================================================
-- DEADLINE MONITORING (Monitoreo de plazos)
-- =====================================================
CREATE TABLE monitored_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Origen
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  watch_result_id UUID REFERENCES watch_results(id) ON DELETE SET NULL,
  
  -- Plazo
  deadline_type TEXT NOT NULL CHECK (deadline_type IN (
    'opposition',
    'renewal',
    'response',
    'priority',
    'pct_entry',
    'annuity',
    'use_proof',
    'custom'
  )),
  
  title TEXT NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  
  -- Recordatorios
  reminder_days INT[] DEFAULT '{90, 60, 30, 14, 7, 1}',
  last_reminder_sent DATE,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Vinculación
  assigned_to UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_watchlists_org ON watchlists(organization_id);
CREATE INDEX idx_watchlists_active ON watchlists(is_active, next_run_at);
CREATE INDEX idx_watchlists_matter ON watchlists(matter_id);

CREATE INDEX idx_watch_results_watchlist ON watch_results(watchlist_id);
CREATE INDEX idx_watch_results_org ON watch_results(organization_id);
CREATE INDEX idx_watch_results_status ON watch_results(status);
CREATE INDEX idx_watch_results_priority ON watch_results(priority);
CREATE INDEX idx_watch_results_detected ON watch_results(detected_at DESC);
CREATE INDEX idx_watch_results_opposition ON watch_results(opposition_deadline) WHERE opposition_deadline IS NOT NULL;

CREATE INDEX idx_spider_alerts_org ON spider_alerts(organization_id);
CREATE INDEX idx_spider_alerts_status ON spider_alerts(status);
CREATE INDEX idx_spider_alerts_type ON spider_alerts(alert_type);
CREATE INDEX idx_spider_alerts_created ON spider_alerts(created_at DESC);

CREATE INDEX idx_monitored_deadlines_org ON monitored_deadlines(organization_id);
CREATE INDEX idx_monitored_deadlines_date ON monitored_deadlines(deadline_date);
CREATE INDEX idx_monitored_deadlines_matter ON monitored_deadlines(matter_id);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE similarity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitored_deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for watchlists
CREATE POLICY "View org watchlists" ON watchlists FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage org watchlists" ON watchlists FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Policies for watch_results
CREATE POLICY "View org watch_results" ON watch_results FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage org watch_results" ON watch_results FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Policies for similarity_analyses
CREATE POLICY "View org analyses" ON similarity_analyses FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage org analyses" ON similarity_analyses FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Policies for spider_alerts
CREATE POLICY "View org alerts" ON spider_alerts FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage org alerts" ON spider_alerts FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Policies for monitored_deadlines
CREATE POLICY "View org deadlines" ON monitored_deadlines FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Manage org deadlines" ON monitored_deadlines FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-crear alerta cuando se detecta resultado de alta prioridad
CREATE OR REPLACE FUNCTION create_alert_from_result()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.priority IN ('high', 'critical') AND NEW.status = 'new' THEN
    INSERT INTO spider_alerts (
      organization_id, watchlist_id, watch_result_id,
      alert_type, title, message, severity, data
    ) VALUES (
      NEW.organization_id,
      NEW.watchlist_id,
      NEW.id,
      CASE 
        WHEN NEW.result_type = 'trademark_filing' THEN 'new_conflict'
        WHEN NEW.result_type = 'trademark_published' THEN 'opposition_window'
        ELSE 'high_similarity'
      END,
      NEW.title,
      COALESCE(NEW.description, 'Se ha detectado un resultado que requiere atención'),
      NEW.priority,
      jsonb_build_object(
        'similarity_score', NEW.similarity_score,
        'source', NEW.source,
        'source_url', NEW.source_url
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watch_result_alert
  AFTER INSERT ON watch_results
  FOR EACH ROW EXECUTE FUNCTION create_alert_from_result();

-- Actualizar updated_at en watchlists
CREATE OR REPLACE FUNCTION update_watchlist_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watchlists_updated BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_watchlist_timestamp();

-- =====================================================
-- DATOS INICIALES: Fuentes de boletines oficiales
-- =====================================================
INSERT INTO gazette_sources (name, code, country, source_type, url) VALUES
  ('EUIPO eSearch plus', 'EUIPO', 'EU', 'trademark', 'https://euipo.europa.eu/eSearch/'),
  ('USPTO TSDR', 'USPTO', 'US', 'trademark', 'https://tsdr.uspto.gov/'),
  ('OEPM Localizador', 'OEPM', 'ES', 'mixed', 'https://consultas2.oepm.es/'),
  ('WIPO Global Brand', 'WIPO', 'WO', 'trademark', 'https://branddb.wipo.int/'),
  ('INPI France', 'INPI_FR', 'FR', 'mixed', 'https://bases-marques.inpi.fr/'),
  ('DPMA Germany', 'DPMA', 'DE', 'mixed', 'https://register.dpma.de/'),
  ('UKIPO', 'UKIPO', 'GB', 'trademark', 'https://trademarks.ipo.gov.uk/'),
  ('EPO Espacenet', 'EPO', 'EU', 'patent', 'https://worldwide.espacenet.com/'),
  ('Google Patents', 'GOOGLE', 'WO', 'patent', 'https://patents.google.com/')
ON CONFLICT (code) DO NOTHING;