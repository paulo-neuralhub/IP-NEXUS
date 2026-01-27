-- ============================================================
-- AI BRAIN PHASE 5: EVALUATION + QUALITY GATE
-- Test suites, golden sets, quality evaluation, regression detection
-- ============================================================

-- 1. Test Suites
CREATE TABLE IF NOT EXISTS ai_test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES ai_task_assignments(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_required_for_publish BOOLEAN DEFAULT FALSE,
  pass_threshold DECIMAL(3,2) DEFAULT 0.80,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_test_suites_task ON ai_test_suites(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_test_suites_active ON ai_test_suites(is_active) WHERE is_active = TRUE;

-- 2. Test Cases
CREATE TABLE IF NOT EXISTS ai_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES ai_test_suites(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  input_variables JSONB NOT NULL DEFAULT '{}',
  expected_contains TEXT[] DEFAULT '{}',
  expected_not_contains TEXT[] DEFAULT '{}',
  expected_format VARCHAR(20),
  expected_schema JSONB,
  expected_min_length INTEGER,
  expected_max_length INTEGER,
  reference_output TEXT,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.70,
  is_golden BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_ai_test_cases_suite ON ai_test_cases(suite_id);
CREATE INDEX IF NOT EXISTS idx_ai_test_cases_golden ON ai_test_cases(suite_id, is_golden) WHERE is_golden = TRUE;

-- 3. Test Runs
CREATE TABLE IF NOT EXISTS ai_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID NOT NULL REFERENCES ai_test_suites(id) ON DELETE CASCADE,
  prompt_id UUID,
  triggered_by VARCHAR(50) NOT NULL DEFAULT 'manual',
  triggered_by_user UUID,
  model_code VARCHAR(100),
  temperature DECIMAL(3,2),
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  skipped_tests INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,4),
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  total_latency_ms INTEGER DEFAULT 0,
  avg_latency_ms INTEGER,
  avg_quality_score DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_test_runs_suite ON ai_test_runs(suite_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_test_runs_status ON ai_test_runs(status);

-- 4. Test Results
CREATE TABLE IF NOT EXISTS ai_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES ai_test_runs(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES ai_test_cases(id),
  status VARCHAR(20) NOT NULL,
  actual_output TEXT,
  validations JSONB DEFAULT '[]',
  input_tokens INTEGER,
  output_tokens INTEGER,
  latency_ms INTEGER,
  cost DECIMAL(10,6),
  quality_score DECIMAL(3,2),
  quality_notes TEXT,
  evaluated_by UUID,
  evaluated_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_test_results_run ON ai_test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_ai_test_results_case ON ai_test_results(test_case_id);

-- 5. Quality Evaluations
CREATE TABLE IF NOT EXISTS ai_quality_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_result_id UUID REFERENCES ai_test_results(id),
  execution_id UUID,
  score DECIMAL(3,2) NOT NULL,
  criteria_scores JSONB DEFAULT '{}',
  strengths TEXT,
  weaknesses TEXT,
  suggestions TEXT,
  evaluated_by UUID NOT NULL,
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_quality_evals_result ON ai_quality_evaluations(test_result_id);
CREATE INDEX IF NOT EXISTS idx_ai_quality_evals_exec ON ai_quality_evaluations(execution_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Start a test run
CREATE OR REPLACE FUNCTION start_test_run(
  p_suite_id UUID,
  p_triggered_by VARCHAR DEFAULT 'manual',
  p_user_id UUID DEFAULT NULL,
  p_model_code VARCHAR DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run_id UUID;
  v_total_tests INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_tests
  FROM ai_test_cases
  WHERE suite_id = p_suite_id AND is_active = TRUE;
  
  INSERT INTO ai_test_runs (
    suite_id, triggered_by, triggered_by_user,
    model_code, total_tests, status, started_at
  )
  VALUES (
    p_suite_id, p_triggered_by, p_user_id,
    p_model_code, v_total_tests, 'running', NOW()
  )
  RETURNING id INTO v_run_id;
  
  RETURN v_run_id;
END;
$$;

-- Record test result
CREATE OR REPLACE FUNCTION record_test_result(
  p_run_id UUID,
  p_test_case_id UUID,
  p_status VARCHAR,
  p_actual_output TEXT,
  p_validations JSONB,
  p_input_tokens INTEGER DEFAULT NULL,
  p_output_tokens INTEGER DEFAULT NULL,
  p_latency_ms INTEGER DEFAULT NULL,
  p_cost DECIMAL DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result_id UUID;
BEGIN
  INSERT INTO ai_test_results (
    run_id, test_case_id, status, actual_output, validations,
    input_tokens, output_tokens, latency_ms, cost, error_message
  )
  VALUES (
    p_run_id, p_test_case_id, p_status, p_actual_output, p_validations,
    p_input_tokens, p_output_tokens, p_latency_ms, p_cost, p_error_message
  )
  RETURNING id INTO v_result_id;
  
  UPDATE ai_test_runs SET
    passed_tests = passed_tests + CASE WHEN p_status = 'passed' THEN 1 ELSE 0 END,
    failed_tests = failed_tests + CASE WHEN p_status = 'failed' THEN 1 ELSE 0 END,
    skipped_tests = skipped_tests + CASE WHEN p_status = 'skipped' THEN 1 ELSE 0 END,
    total_tokens = total_tokens + COALESCE(p_input_tokens, 0) + COALESCE(p_output_tokens, 0),
    total_cost = total_cost + COALESCE(p_cost, 0),
    total_latency_ms = total_latency_ms + COALESCE(p_latency_ms, 0)
  WHERE id = p_run_id;
  
  RETURN v_result_id;
END;
$$;

-- Complete test run
CREATE OR REPLACE FUNCTION complete_test_run(p_run_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_run RECORD;
  v_suite RECORD;
  v_pass_rate DECIMAL;
  v_passed BOOLEAN;
BEGIN
  SELECT * INTO v_run FROM ai_test_runs WHERE id = p_run_id;
  SELECT * INTO v_suite FROM ai_test_suites WHERE id = v_run.suite_id;
  
  v_pass_rate := CASE 
    WHEN v_run.total_tests > 0 THEN v_run.passed_tests::DECIMAL / v_run.total_tests
    ELSE 0
  END;
  
  v_passed := v_pass_rate >= v_suite.pass_threshold;
  
  UPDATE ai_test_runs SET
    status = 'completed',
    completed_at = NOW(),
    pass_rate = v_pass_rate,
    avg_latency_ms = CASE WHEN total_tests > 0 THEN total_latency_ms / total_tests ELSE 0 END,
    passed = v_passed
  WHERE id = p_run_id;
  
  RETURN v_passed;
END;
$$;

-- Check if task can publish (quality gate)
CREATE OR REPLACE FUNCTION can_task_publish(p_task_id UUID)
RETURNS TABLE (
  can_publish BOOLEAN,
  reason VARCHAR,
  required_suites INTEGER,
  passed_suites INTEGER,
  failed_suites TEXT[]
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required_count INTEGER;
  v_passed_count INTEGER;
  v_failed_names TEXT[];
BEGIN
  SELECT COUNT(*) INTO v_required_count
  FROM ai_test_suites
  WHERE task_id = p_task_id AND is_required_for_publish = TRUE AND is_active = TRUE;
  
  IF v_required_count = 0 THEN
    RETURN QUERY SELECT true, 'No required test suites'::VARCHAR, 0, 0, ARRAY[]::TEXT[];
    RETURN;
  END IF;
  
  SELECT 
    COUNT(*) FILTER (WHERE latest_passed = TRUE),
    ARRAY_AGG(s.name) FILTER (WHERE latest_passed IS DISTINCT FROM TRUE)
  INTO v_passed_count, v_failed_names
  FROM ai_test_suites s
  LEFT JOIN LATERAL (
    SELECT passed AS latest_passed FROM ai_test_runs r
    WHERE r.suite_id = s.id
    ORDER BY r.created_at DESC
    LIMIT 1
  ) lr ON TRUE
  WHERE s.task_id = p_task_id AND s.is_required_for_publish = TRUE AND s.is_active = TRUE;
  
  IF v_passed_count >= v_required_count THEN
    RETURN QUERY SELECT true, 'All required tests passed'::VARCHAR, v_required_count, v_passed_count, ARRAY[]::TEXT[];
  ELSE
    RETURN QUERY SELECT false, 'Some required tests failed'::VARCHAR, v_required_count, v_passed_count, COALESCE(v_failed_names, ARRAY[]::TEXT[]);
  END IF;
END;
$$;

-- Get test suite stats
CREATE OR REPLACE FUNCTION get_test_suite_stats(p_suite_id UUID)
RETURNS TABLE (
  total_cases INTEGER,
  golden_cases INTEGER,
  latest_run_id UUID,
  latest_run_status VARCHAR,
  latest_run_passed BOOLEAN,
  latest_pass_rate DECIMAL,
  total_runs INTEGER,
  avg_pass_rate DECIMAL
) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM ai_test_cases WHERE suite_id = p_suite_id AND is_active = TRUE),
    (SELECT COUNT(*)::INTEGER FROM ai_test_cases WHERE suite_id = p_suite_id AND is_active = TRUE AND is_golden = TRUE),
    lr.id,
    lr.status,
    lr.passed,
    lr.pass_rate,
    (SELECT COUNT(*)::INTEGER FROM ai_test_runs WHERE suite_id = p_suite_id),
    (SELECT AVG(pass_rate)::DECIMAL FROM ai_test_runs WHERE suite_id = p_suite_id AND status = 'completed')
  FROM (
    SELECT id, status, passed, pass_rate 
    FROM ai_test_runs 
    WHERE suite_id = p_suite_id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) lr;
END;
$$;

-- Enable RLS
ALTER TABLE ai_test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quality_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for authenticated users - backoffice)
CREATE POLICY "Allow all for authenticated" ON ai_test_suites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON ai_test_cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON ai_test_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON ai_test_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON ai_quality_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);