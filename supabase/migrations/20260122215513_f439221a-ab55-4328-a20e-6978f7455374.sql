-- IP-NEXUS CRM FIX 2/4: MIGRAR FKs DE LEGACY A V2

-- TAREA 1: ACTUALIZAR crm_ai_recommendations
ALTER TABLE crm_ai_recommendations 
  ADD COLUMN IF NOT EXISTS crm_deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS crm_contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_rec_crm_deal ON crm_ai_recommendations(crm_deal_id) WHERE crm_deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_rec_crm_contact ON crm_ai_recommendations(crm_contact_id) WHERE crm_contact_id IS NOT NULL;

COMMENT ON COLUMN crm_ai_recommendations.deal_id IS 'DEPRECATED: Usar crm_deal_id en su lugar';
COMMENT ON COLUMN crm_ai_recommendations.contact_id IS 'DEPRECATED: Usar crm_contact_id en su lugar';

-- TAREA 2: ACTUALIZAR crm_ai_learning_logs
ALTER TABLE crm_ai_learning_logs 
  ADD COLUMN IF NOT EXISTS crm_interaction_id UUID REFERENCES crm_interactions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_learning_crm_interaction ON crm_ai_learning_logs(crm_interaction_id) WHERE crm_interaction_id IS NOT NULL;

COMMENT ON COLUMN crm_ai_learning_logs.interaction_id IS 'DEPRECATED: Usar crm_interaction_id en su lugar';

-- TAREA 3: ACTUALIZAR crm_lead_events
ALTER TABLE crm_lead_events 
  ADD COLUMN IF NOT EXISTS crm_contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lead_events_crm_contact ON crm_lead_events(crm_contact_id) WHERE crm_contact_id IS NOT NULL;

COMMENT ON COLUMN crm_lead_events.contact_id IS 'DEPRECATED: Usar crm_contact_id en su lugar';

-- TAREA 4: AÑADIR CAMPOS DE INTEGRACIONES A crm_contacts
ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opted_in BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_opted_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_opted_in BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_opted_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'email' 
    CHECK (preferred_channel IN ('email', 'whatsapp', 'phone', 'portal')),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_channel TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_whatsapp ON crm_contacts(whatsapp_phone) WHERE whatsapp_phone IS NOT NULL;

-- TAREA 5: AÑADIR CAMPOS DE MATTER A crm_deals
ALTER TABLE crm_deals
  ADD COLUMN IF NOT EXISTS matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS trademark_name TEXT,
  ADD COLUMN IF NOT EXISTS patent_title TEXT,
  ADD COLUMN IF NOT EXISTS renewal_date DATE,
  ADD COLUMN IF NOT EXISTS territory TEXT DEFAULT 'ES';

CREATE INDEX IF NOT EXISTS idx_crm_deals_matter ON crm_deals(matter_id) WHERE matter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_service_type ON crm_deals(organization_id, service_type) WHERE service_type IS NOT NULL;

-- TAREA 6: CREAR VISTA UNIFICADA DE CLIENT 360
CREATE OR REPLACE VIEW crm_client_360_view AS
SELECT 
  a.id as account_id,
  a.organization_id,
  a.name as account_name,
  a.status as account_status,
  a.tier as account_tier,
  a.health_score,
  a.churn_risk_level,
  a.last_interaction_at,
  
  (SELECT COUNT(*) FROM crm_contacts c WHERE c.account_id = a.id) as total_contacts,
  (SELECT COUNT(*) FROM crm_contacts c WHERE c.account_id = a.id AND c.is_lead = TRUE) as total_leads,
  
  (SELECT COUNT(*) FROM crm_deals d 
   LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
   WHERE d.account_id = a.id AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))) as open_deals,
   
  (SELECT COALESCE(SUM(d.amount), 0) FROM crm_deals d 
   LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
   WHERE d.account_id = a.id AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))) as open_pipeline_value,
   
  (SELECT COUNT(*) FROM crm_deals d 
   JOIN crm_pipeline_stages s ON s.id = d.stage_id
   WHERE d.account_id = a.id AND s.is_won = TRUE) as won_deals,
   
  (SELECT COALESCE(SUM(d.amount), 0) FROM crm_deals d 
   JOIN crm_pipeline_stages s ON s.id = d.stage_id
   WHERE d.account_id = a.id AND s.is_won = TRUE) as total_revenue,
   
  (SELECT COUNT(*) FROM crm_interactions i 
   WHERE i.account_id = a.id AND i.created_at > NOW() - INTERVAL '30 days') as interactions_30d,
   
  (SELECT COUNT(*) FROM crm_tasks t 
   WHERE t.account_id = a.id AND t.status = 'pending') as pending_tasks,
   
  (SELECT MAX(created_at) FROM crm_interactions WHERE account_id = a.id) as last_interaction_date,
  
  a.created_at,
  a.updated_at

FROM crm_accounts a;

COMMENT ON VIEW crm_client_360_view IS 'Vista unificada de Client 360 para dashboard y reportes';

-- TAREA 7: ACTUALIZAR RPC crm_get_client_360
CREATE OR REPLACE FUNCTION crm_get_client_360(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_account RECORD;
BEGIN
  SELECT * INTO v_account FROM crm_accounts WHERE id = p_account_id;
  
  IF v_account IS NULL THEN
    RETURN jsonb_build_object('error', 'Account not found');
  END IF;
  
  SELECT jsonb_build_object(
    'account', jsonb_build_object(
      'id', v_account.id,
      'name', v_account.name,
      'legal_name', v_account.legal_name,
      'status', v_account.status,
      'tier', v_account.tier,
      'health_score', v_account.health_score,
      'churn_risk_level', v_account.churn_risk_level,
      'tags', v_account.tags,
      'created_at', v_account.created_at
    ),
    
    'contacts', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'full_name', c.full_name,
        'email', c.email,
        'phone', c.phone,
        'whatsapp_phone', c.whatsapp_phone,
        'is_lead', c.is_lead,
        'lead_score', c.lead_score,
        'lead_status', c.lead_status,
        'preferred_channel', c.preferred_channel
      )), '[]'::jsonb)
      FROM crm_contacts c WHERE c.account_id = p_account_id
    ),
    
    'open_deals', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', d.id,
        'name', d.name,
        'amount', d.amount,
        'stage', s.name,
        'stage_color', s.color,
        'pipeline', p.name,
        'expected_close_date', d.expected_close_date,
        'days_in_stage', EXTRACT(DAY FROM NOW() - d.stage_entered_at)::INTEGER,
        'owner_id', d.owner_id
      ) ORDER BY d.created_at DESC), '[]'::jsonb)
      FROM crm_deals d
      LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      LEFT JOIN crm_pipelines p ON p.id = d.pipeline_id
      WHERE d.account_id = p_account_id
      AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
    ),
    
    'recent_interactions', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', i.id,
        'channel', i.channel,
        'direction', i.direction,
        'subject', i.subject,
        'created_at', i.created_at
      ) ORDER BY i.created_at DESC), '[]'::jsonb)
      FROM crm_interactions i
      WHERE i.account_id = p_account_id
      LIMIT 10
    ),
    
    'pending_tasks', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'due_date', t.due_date,
        'status', t.status,
        'assigned_to', t.assigned_to
      ) ORDER BY t.due_date ASC), '[]'::jsonb)
      FROM crm_tasks t
      WHERE t.account_id = p_account_id AND t.status = 'pending'
    ),
    
    'kpis', jsonb_build_object(
      'total_contacts', (SELECT COUNT(*) FROM crm_contacts WHERE account_id = p_account_id),
      'open_deals_count', (
        SELECT COUNT(*) FROM crm_deals d
        LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
        WHERE d.account_id = p_account_id AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
      ),
      'open_pipeline_value', (
        SELECT COALESCE(SUM(amount), 0) FROM crm_deals d
        LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
        WHERE d.account_id = p_account_id AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
      ),
      'won_deals_total', (
        SELECT COUNT(*) FROM crm_deals d
        JOIN crm_pipeline_stages s ON s.id = d.stage_id
        WHERE d.account_id = p_account_id AND s.is_won = TRUE
      ),
      'total_revenue', (
        SELECT COALESCE(SUM(amount), 0) FROM crm_deals d
        JOIN crm_pipeline_stages s ON s.id = d.stage_id
        WHERE d.account_id = p_account_id AND s.is_won = TRUE
      ),
      'interactions_30d', (
        SELECT COUNT(*) FROM crm_interactions
        WHERE account_id = p_account_id AND created_at > NOW() - INTERVAL '30 days'
      ),
      'pending_tasks_count', (
        SELECT COUNT(*) FROM crm_tasks
        WHERE account_id = p_account_id AND status = 'pending'
      ),
      'overdue_tasks_count', (
        SELECT COUNT(*) FROM crm_tasks
        WHERE account_id = p_account_id AND status = 'pending' AND due_date < CURRENT_DATE
      )
    ),
    
    'recommendations', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', r.id,
        'type', r.type,
        'title', r.title,
        'description', r.description,
        'priority', r.priority,
        'status', r.status
      ) ORDER BY r.urgency DESC), '[]'::jsonb)
      FROM crm_ai_recommendations r
      WHERE r.organization_id = v_account.organization_id
      AND (
        r.crm_contact_id IN (SELECT id FROM crm_contacts WHERE account_id = p_account_id)
        OR r.crm_deal_id IN (SELECT id FROM crm_deals WHERE account_id = p_account_id)
      )
      AND r.status = 'pending'
      LIMIT 5
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;