-- FIX 1/4 - Reintento (corrige DO/EXECUTE) + backfill para no romper FKs

-- TAREA 1: ELIMINAR POLICY DUPLICADA
DROP POLICY IF EXISTS "crm_lead_events_all" ON crm_lead_events;

-- TAREA 2: CREAR TABLA crm_pipelines
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_es TEXT,
  description TEXT,
  pipeline_type TEXT NOT NULL DEFAULT 'sales' CHECK (pipeline_type IN (
    'sales', 'service', 'renewal', 'expansion', 'disputes'
  )),
  icon TEXT DEFAULT 'kanban',
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_crm_pipelines_org ON crm_pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipelines_active ON crm_pipelines(organization_id, is_active) WHERE is_active = TRUE;

ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='crm_pipelines' AND policyname='tenant_select_crm_pipelines'
  ) THEN
    EXECUTE 'CREATE POLICY "tenant_select_crm_pipelines" ON crm_pipelines FOR SELECT USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='crm_pipelines' AND policyname='tenant_insert_crm_pipelines'
  ) THEN
    EXECUTE 'CREATE POLICY "tenant_insert_crm_pipelines" ON crm_pipelines FOR INSERT WITH CHECK (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='crm_pipelines' AND policyname='tenant_update_crm_pipelines'
  ) THEN
    EXECUTE 'CREATE POLICY "tenant_update_crm_pipelines" ON crm_pipelines FOR UPDATE USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='crm_pipelines' AND policyname='tenant_delete_crm_pipelines'
  ) THEN
    EXECUTE 'CREATE POLICY "tenant_delete_crm_pipelines" ON crm_pipelines FOR DELETE USING (organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())';
  END IF;
END $$;

-- TAREA 3: CREAR TABLA crm_pipeline_stages
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_es TEXT,
  color TEXT DEFAULT '#64748b',
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  requires_amount BOOLEAN DEFAULT FALSE,
  requires_close_date BOOLEAN DEFAULT FALSE,
  creates_matter BOOLEAN DEFAULT FALSE,
  expected_days INTEGER,
  auto_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pipeline_id, code)
);

CREATE INDEX IF NOT EXISTS idx_crm_stages_pipeline ON crm_pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_stages_sort ON crm_pipeline_stages(pipeline_id, sort_order);

ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='crm_pipeline_stages' AND policyname='tenant_stages_all'
  ) THEN
    EXECUTE 'CREATE POLICY "tenant_stages_all" ON crm_pipeline_stages FOR ALL USING (pipeline_id IN (SELECT id FROM crm_pipelines WHERE organization_id = ANY(get_user_organization_ids())) OR is_backoffice_admin()) WITH CHECK (pipeline_id IN (SELECT id FROM crm_pipelines WHERE organization_id = ANY(get_user_organization_ids())) OR is_backoffice_admin())';
  END IF;
END $$;

-- BACKFILL (necesario para que las FKs no fallen): copiar legacy pipelines/stages con los mismos IDs
INSERT INTO crm_pipelines (id, organization_id, code, name, is_default, sort_order, is_active)
SELECT
  p.id,
  p.organization_id,
  ('legacy_' || p.id::text),
  p.name,
  COALESCE(p.is_default, false),
  COALESCE(p.position, 0),
  true
FROM pipelines p
WHERE p.owner_type = 'tenant'
ON CONFLICT (id) DO NOTHING;

INSERT INTO crm_pipeline_stages (
  id,
  pipeline_id,
  code,
  name,
  color,
  sort_order,
  probability,
  is_won,
  is_lost,
  is_active
)
SELECT
  s.id,
  s.pipeline_id,
  ('legacy_' || s.id::text),
  s.name,
  COALESCE(s.color, '#64748b'),
  COALESCE(s.position, 0),
  COALESCE(s.probability, 0),
  COALESCE(s.is_won_stage, false),
  COALESCE(s.is_lost_stage, false),
  true
FROM pipeline_stages s
JOIN pipelines p ON p.id = s.pipeline_id
WHERE p.owner_type = 'tenant'
ON CONFLICT (id) DO NOTHING;

-- TAREA 4: ACTUALIZAR FKs EN crm_deals
ALTER TABLE crm_deals DROP CONSTRAINT IF EXISTS crm_deals_pipeline_id_fkey;
ALTER TABLE crm_deals DROP CONSTRAINT IF EXISTS crm_deals_stage_id_fkey;

ALTER TABLE crm_deals
  ADD CONSTRAINT crm_deals_crm_pipeline_fkey FOREIGN KEY (pipeline_id) REFERENCES crm_pipelines(id) ON DELETE SET NULL,
  ADD CONSTRAINT crm_deals_crm_stage_fkey FOREIGN KEY (stage_id) REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL;

-- TAREA 5: CREAR RPC crm_get_dashboard_kpis
CREATE OR REPLACE FUNCTION crm_get_dashboard_kpis(
  p_organization_id UUID,
  p_date_from DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN jsonb_build_object(
    'total_deals', (SELECT COUNT(*) FROM crm_deals WHERE organization_id = p_organization_id),
    'open_deals', (
      SELECT COUNT(*) FROM crm_deals d
      LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id
      AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
    ),
    'won_deals_period', (
      SELECT COUNT(*) FROM crm_deals d
      JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id AND s.is_won
      AND d.actual_close_date BETWEEN p_date_from AND p_date_to
    ),
    'stale_deals', (
      SELECT COUNT(*) FROM crm_deals d
      LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id
      AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
      AND d.stage_entered_at < NOW() - INTERVAL '14 days'
    ),
    'total_pipeline_value', (
      SELECT COALESCE(SUM(amount), 0) FROM crm_deals d
      LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id
      AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
    ),
    'weighted_pipeline_value', (
      SELECT COALESCE(SUM(COALESCE(weighted_amount, amount * COALESCE(s.probability, 50) / 100)), 0)
      FROM crm_deals d
      LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id
      AND (s.id IS NULL OR (NOT s.is_won AND NOT s.is_lost))
    ),
    'won_revenue_period', (
      SELECT COALESCE(SUM(amount), 0) FROM crm_deals d
      JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id AND s.is_won
      AND d.actual_close_date BETWEEN p_date_from AND p_date_to
    ),
    'win_rate', (
      SELECT CASE WHEN COUNT(*) FILTER (WHERE s.is_won OR s.is_lost) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE s.is_won)::NUMERIC /
             NULLIF(COUNT(*) FILTER (WHERE s.is_won OR s.is_lost), 0) * 100, 1)
        ELSE 0 END
      FROM crm_deals d JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.organization_id = p_organization_id
      AND d.actual_close_date BETWEEN p_date_from AND p_date_to
    ),
    'total_accounts', (SELECT COUNT(*) FROM crm_accounts WHERE organization_id = p_organization_id),
    'total_contacts', (SELECT COUNT(*) FROM crm_contacts WHERE organization_id = p_organization_id),
    'total_leads', (SELECT COUNT(*) FROM crm_contacts WHERE organization_id = p_organization_id AND is_lead = TRUE),
    'pending_tasks', (SELECT COUNT(*) FROM crm_tasks WHERE organization_id = p_organization_id AND status = 'pending'),
    'overdue_tasks', (SELECT COUNT(*) FROM crm_tasks WHERE organization_id = p_organization_id AND status = 'pending' AND due_date < CURRENT_DATE),
    'interactions_period', (SELECT COUNT(*) FROM crm_interactions WHERE organization_id = p_organization_id AND created_at BETWEEN p_date_from AND p_date_to),
    'pending_recommendations', (SELECT COUNT(*) FROM crm_ai_recommendations WHERE organization_id = p_organization_id AND status = 'pending'),
    'period_from', p_date_from,
    'period_to', p_date_to
  );
END;
$$;

-- TAREA 6: CREAR RPC PARA REORDENAR STAGES
CREATE OR REPLACE FUNCTION crm_reorder_pipeline_stages(
  p_pipeline_id UUID,
  p_stage_ids UUID[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_idx INTEGER := 0;
  v_stage_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM crm_pipelines p
    WHERE p.id = p_pipeline_id
    AND (p.organization_id = ANY(get_user_organization_ids()) OR is_backoffice_admin())
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  FOREACH v_stage_id IN ARRAY p_stage_ids LOOP
    UPDATE crm_pipeline_stages SET sort_order = v_idx, updated_at = NOW()
    WHERE id = v_stage_id AND pipeline_id = p_pipeline_id;
    v_idx := v_idx + 1;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- TAREA 7: FUNCIÓN DE INICIALIZACIÓN DE PIPELINES
CREATE OR REPLACE FUNCTION crm_initialize_default_pipelines(p_organization_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pipeline_id UUID;
  v_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM crm_pipelines WHERE organization_id = p_organization_id) THEN
    RETURN 0;
  END IF;

  -- PIPELINE 1: NEW BUSINESS
  INSERT INTO crm_pipelines (organization_id, code, name, name_es, pipeline_type, icon, color, is_default, sort_order)
  VALUES (p_organization_id, 'new_business', 'New Business', 'Captación', 'sales', 'target', '#3b82f6', TRUE, 1)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, code, name, name_es, color, sort_order, probability, is_won, is_lost) VALUES
    (v_pipeline_id, 'lead', 'Lead', 'Lead', '#94a3b8', 0, 10, FALSE, FALSE),
    (v_pipeline_id, 'contacted', 'Contacted', 'Contactado', '#60a5fa', 1, 20, FALSE, FALSE),
    (v_pipeline_id, 'qualified', 'Qualified', 'Cualificado', '#a78bfa', 2, 40, FALSE, FALSE),
    (v_pipeline_id, 'proposal', 'Proposal', 'Propuesta', '#f59e0b', 3, 60, FALSE, FALSE),
    (v_pipeline_id, 'negotiation', 'Negotiation', 'Negociación', '#f97316', 4, 80, FALSE, FALSE),
    (v_pipeline_id, 'won', 'Won', 'Ganado', '#22c55e', 5, 100, TRUE, FALSE),
    (v_pipeline_id, 'lost', 'Lost', 'Perdido', '#ef4444', 6, 0, FALSE, TRUE);
  v_count := v_count + 1;

  -- PIPELINE 2: TRADEMARK FILING
  INSERT INTO crm_pipelines (organization_id, code, name, name_es, pipeline_type, icon, color, sort_order)
  VALUES (p_organization_id, 'trademark_filing', 'Trademark Filing', 'Registro Marcas', 'service', 'badge-check', '#8b5cf6', 2)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, code, name, name_es, color, sort_order, probability, is_won, is_lost, creates_matter) VALUES
    (v_pipeline_id, 'intake', 'Intake', 'Recepción', '#94a3b8', 0, 20, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'docs_pending', 'Docs Pending', 'Docs Pendientes', '#f59e0b', 1, 30, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'search', 'Prior Search', 'Búsqueda', '#60a5fa', 2, 40, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'filed', 'Filed', 'Presentado', '#10b981', 3, 70, FALSE, FALSE, TRUE),
    (v_pipeline_id, 'examination', 'Examination', 'Examen', '#06b6d4', 4, 75, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'office_action', 'Office Action', 'Suspenso', '#ef4444', 5, 50, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'publication', 'Published', 'Publicado', '#8b5cf6', 6, 85, FALSE, FALSE, FALSE),
    (v_pipeline_id, 'granted', 'Granted', 'Concedido', '#22c55e', 7, 100, TRUE, FALSE, FALSE),
    (v_pipeline_id, 'refused', 'Refused', 'Denegado', '#ef4444', 8, 0, FALSE, TRUE, FALSE);
  v_count := v_count + 1;

  -- PIPELINE 3: RENEWALS
  INSERT INTO crm_pipelines (organization_id, code, name, name_es, pipeline_type, icon, color, sort_order)
  VALUES (p_organization_id, 'renewals', 'Renewals', 'Renovaciones', 'renewal', 'refresh-cw', '#10b981', 3)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, code, name, name_es, color, sort_order, probability, is_won, is_lost) VALUES
    (v_pipeline_id, 'pre_notice', 'Pre-Notice', 'Pre-Aviso', '#94a3b8', 0, 50, FALSE, FALSE),
    (v_pipeline_id, 'first_notice', 'First Notice', 'Primer Aviso', '#60a5fa', 1, 60, FALSE, FALSE),
    (v_pipeline_id, 'urgent', 'Urgent', 'Urgente', '#ef4444', 2, 80, FALSE, FALSE),
    (v_pipeline_id, 'confirmed', 'Confirmed', 'Confirmado', '#a78bfa', 3, 90, FALSE, FALSE),
    (v_pipeline_id, 'renewed', 'Renewed', 'Renovado', '#22c55e', 4, 100, TRUE, FALSE),
    (v_pipeline_id, 'abandoned', 'Abandoned', 'Abandonado', '#64748b', 5, 0, FALSE, TRUE);
  v_count := v_count + 1;

  -- PIPELINE 4: EXPANSION
  INSERT INTO crm_pipelines (organization_id, code, name, name_es, pipeline_type, icon, color, sort_order)
  VALUES (p_organization_id, 'expansion', 'Expansion', 'Expansión', 'expansion', 'trending-up', '#22c55e', 4)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, code, name, name_es, color, sort_order, probability, is_won, is_lost) VALUES
    (v_pipeline_id, 'opportunity', 'Opportunity', 'Oportunidad', '#94a3b8', 0, 20, FALSE, FALSE),
    (v_pipeline_id, 'proposal', 'Proposal', 'Propuesta', '#60a5fa', 1, 50, FALSE, FALSE),
    (v_pipeline_id, 'accepted', 'Accepted', 'Aceptado', '#22c55e', 2, 100, TRUE, FALSE),
    (v_pipeline_id, 'declined', 'Declined', 'Rechazado', '#ef4444', 3, 0, FALSE, TRUE);
  v_count := v_count + 1;

  -- PIPELINE 5: IP DISPUTES
  INSERT INTO crm_pipelines (organization_id, code, name, name_es, pipeline_type, icon, color, sort_order)
  VALUES (p_organization_id, 'ip_disputes', 'IP Disputes', 'Oposiciones/Litigios', 'disputes', 'scale', '#ef4444', 5)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, code, name, name_es, color, sort_order, probability, is_won, is_lost) VALUES
    (v_pipeline_id, 'alert', 'Alert', 'Alerta', '#f59e0b', 0, 20, FALSE, FALSE),
    (v_pipeline_id, 'analysis', 'Analysis', 'Análisis', '#60a5fa', 1, 30, FALSE, FALSE),
    (v_pipeline_id, 'filed', 'Action Filed', 'Acción', '#8b5cf6', 2, 60, FALSE, FALSE),
    (v_pipeline_id, 'resolution', 'Resolution', 'Resolución', '#10b981', 3, 85, FALSE, FALSE),
    (v_pipeline_id, 'won', 'Won', 'Ganado', '#22c55e', 4, 100, TRUE, FALSE),
    (v_pipeline_id, 'lost', 'Lost', 'Perdido', '#ef4444', 5, 0, FALSE, TRUE);
  v_count := v_count + 1;

  RETURN v_count;
END;
$$;