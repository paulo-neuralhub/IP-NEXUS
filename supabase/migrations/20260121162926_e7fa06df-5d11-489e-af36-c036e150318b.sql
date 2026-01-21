-- =====================================================
-- P69: IP-MARKET - SISTEMA DE PRESUPUESTOS (RFQ)
-- Usando prefijo rfq_ para evitar conflictos
-- =====================================================

-- Secuencias para números de referencia
CREATE SEQUENCE IF NOT EXISTS rfq_request_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS rfq_quote_seq START 1000;

-- =====================================================
-- TABLA: rfq_requests (solicitudes de presupuesto)
-- =====================================================
CREATE TABLE rfq_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Número de referencia público
  reference_number TEXT UNIQUE NOT NULL DEFAULT 'RFQ-' || LPAD(nextval('rfq_request_seq')::TEXT, 6, '0'),
  
  -- Solicitante
  requester_id UUID NOT NULL REFERENCES market_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Tipo de servicio
  service_category TEXT NOT NULL CHECK (service_category IN (
    'trademark', 'patent', 'design', 'copyright', 'domain',
    'litigation', 'licensing', 'valuation', 'general'
  )),
  
  service_type TEXT NOT NULL CHECK (service_type IN (
    'tm_search', 'tm_registration', 'tm_renewal', 'tm_opposition',
    'tm_cancellation', 'tm_watch', 'tm_portfolio_audit',
    'pt_search', 'pt_drafting', 'pt_filing', 'pt_prosecution',
    'pt_maintenance', 'pt_freedom_to_operate', 'pt_landscape',
    'ds_registration', 'ds_renewal',
    'litigation_infringement', 'litigation_defense',
    'licensing_negotiation', 'licensing_audit',
    'valuation_single', 'valuation_portfolio',
    'general_consultation', 'other'
  )),
  
  -- Detalles de la solicitud
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  jurisdictions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  nice_classes INT[],
  locarno_classes TEXT[],
  details JSONB DEFAULT '{}',
  
  -- Presupuesto y plazos
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  budget_currency TEXT DEFAULT 'EUR',
  budget_type TEXT DEFAULT 'total' CHECK (budget_type IN ('total', 'per_jurisdiction', 'hourly')),
  
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent', 'normal', 'flexible')),
  deadline_response TIMESTAMPTZ,
  deadline_completion TIMESTAMPTZ,
  
  -- Configuración
  is_blind BOOLEAN DEFAULT true,
  max_quotes INT DEFAULT 5,
  auto_match BOOLEAN DEFAULT true,
  allow_counter_questions BOOLEAN DEFAULT true,
  invited_agent_ids UUID[] DEFAULT ARRAY[]::UUID[],
  requirements JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'open', 'evaluating', 'awarded', 'cancelled', 'expired'
  )),
  
  -- Resultado
  awarded_quote_id UUID,
  awarded_at TIMESTAMPTZ,
  awarded_notes TEXT,
  transaction_id UUID REFERENCES market_transactions(id),
  
  -- Métricas
  views_count INT DEFAULT 0,
  quotes_received INT DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rfq_requests
CREATE INDEX idx_rfq_requests_requester ON rfq_requests(requester_id);
CREATE INDEX idx_rfq_requests_status ON rfq_requests(status);
CREATE INDEX idx_rfq_requests_category ON rfq_requests(service_category);
CREATE INDEX idx_rfq_requests_type ON rfq_requests(service_type);
CREATE INDEX idx_rfq_requests_jurisdictions ON rfq_requests USING GIN(jurisdictions);
CREATE INDEX idx_rfq_requests_published ON rfq_requests(published_at DESC) WHERE status = 'open';
CREATE INDEX idx_rfq_requests_deadline ON rfq_requests(deadline_response) WHERE status = 'open';

-- =====================================================
-- TABLA: rfq_quotes (presupuestos enviados por agentes)
-- =====================================================
CREATE TABLE rfq_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  reference_number TEXT UNIQUE NOT NULL DEFAULT 'QT-' || LPAD(nextval('rfq_quote_seq')::TEXT, 6, '0'),
  
  request_id UUID NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES market_users(id) ON DELETE CASCADE,
  
  -- Propuesta económica
  total_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  price_breakdown JSONB NOT NULL DEFAULT '{}',
  price_per_jurisdiction JSONB,
  
  payment_terms TEXT DEFAULT 'upfront' CHECK (payment_terms IN (
    'upfront', 'milestone', 'completion', 'split'
  )),
  payment_milestones JSONB,
  
  -- Propuesta de servicio
  estimated_duration_days INT NOT NULL,
  estimated_start_date DATE,
  proposal_summary TEXT NOT NULL,
  proposal_detail TEXT,
  methodology TEXT,
  relevant_experience TEXT,
  similar_cases_count INT,
  deliverables JSONB DEFAULT '[]',
  guarantees TEXT,
  
  attachments JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'viewed', 'shortlisted', 'awarded', 'rejected', 'withdrawn'
  )),
  
  submitted_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  awarded_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id, agent_id)
);

-- Índices para rfq_quotes
CREATE INDEX idx_rfq_quotes_request ON rfq_quotes(request_id);
CREATE INDEX idx_rfq_quotes_agent ON rfq_quotes(agent_id);
CREATE INDEX idx_rfq_quotes_status ON rfq_quotes(status);
CREATE INDEX idx_rfq_quotes_submitted ON rfq_quotes(submitted_at DESC) WHERE status != 'draft';

-- =====================================================
-- TABLA: rfq_invitations (invitaciones a agentes)
-- =====================================================
CREATE TABLE rfq_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  request_id UUID NOT NULL REFERENCES rfq_requests(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES market_users(id) ON DELETE CASCADE,
  
  invitation_type TEXT DEFAULT 'auto' CHECK (invitation_type IN (
    'auto', 'manual', 'referral'
  )),
  
  match_score DECIMAL(5,2),
  match_reasons JSONB,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'viewed', 'accepted', 'declined', 'expired'
  )),
  
  decline_reason TEXT,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  email_sent BOOLEAN DEFAULT false,
  push_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(request_id, agent_id)
);

-- Índices para rfq_invitations
CREATE INDEX idx_rfq_invitations_request ON rfq_invitations(request_id);
CREATE INDEX idx_rfq_invitations_agent ON rfq_invitations(agent_id);
CREATE INDEX idx_rfq_invitations_status ON rfq_invitations(status);
CREATE INDEX idx_rfq_invitations_pending ON rfq_invitations(agent_id, status) WHERE status = 'pending';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- rfq_requests
ALTER TABLE rfq_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfq_requests_select_open_or_own"
  ON rfq_requests FOR SELECT
  USING (
    status = 'open' 
    OR requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "rfq_requests_all_own"
  ON rfq_requests FOR ALL
  USING (
    requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  );

-- rfq_quotes
ALTER TABLE rfq_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfq_quotes_all_agent"
  ON rfq_quotes FOR ALL
  USING (
    agent_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    agent_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "rfq_quotes_select_requester"
  ON rfq_quotes FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM rfq_requests 
      WHERE requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
    )
    AND status != 'draft'
  );

CREATE POLICY "rfq_quotes_update_requester"
  ON rfq_quotes FOR UPDATE
  USING (
    request_id IN (
      SELECT id FROM rfq_requests 
      WHERE requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT id FROM rfq_requests 
      WHERE requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
    )
  );

-- rfq_invitations
ALTER TABLE rfq_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfq_invitations_select_agent"
  ON rfq_invitations FOR SELECT
  USING (
    agent_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "rfq_invitations_update_agent"
  ON rfq_invitations FOR UPDATE
  USING (
    agent_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    agent_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "rfq_invitations_all_requester"
  ON rfq_invitations FOR ALL
  USING (
    request_id IN (
      SELECT id FROM rfq_requests 
      WHERE requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT id FROM rfq_requests 
      WHERE requester_id IN (SELECT id FROM market_users WHERE auth_user_id = auth.uid())
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Función: Actualizar contadores en rfq_requests
CREATE OR REPLACE FUNCTION update_rfq_request_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'submitted' THEN
    UPDATE rfq_requests 
    SET quotes_received = quotes_received + 1,
        updated_at = NOW()
    WHERE id = NEW.request_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'draft' AND NEW.status = 'submitted' THEN
      UPDATE rfq_requests 
      SET quotes_received = quotes_received + 1,
          updated_at = NOW()
      WHERE id = NEW.request_id;
    END IF;
    IF NEW.status = 'awarded' AND OLD.status != 'awarded' THEN
      UPDATE rfq_requests 
      SET status = 'awarded',
          awarded_quote_id = NEW.id,
          awarded_at = NOW(),
          updated_at = NOW()
      WHERE id = NEW.request_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_rfq_quote_counts
  AFTER INSERT OR UPDATE ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_rfq_request_counts();

-- Trigger para updated_at
CREATE TRIGGER update_rfq_requests_updated_at
  BEFORE UPDATE ON rfq_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfq_quotes_updated_at
  BEFORE UPDATE ON rfq_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();