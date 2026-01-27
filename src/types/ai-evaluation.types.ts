// ============================================================
// IP-NEXUS AI BRAIN - EVALUATION TYPES (PHASE 5)
// ============================================================

export interface AITestSuite {
  id: string;
  task_id: string;
  name: string;
  description: string | null;
  is_required_for_publish: boolean;
  pass_threshold: number;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  // Joined
  task?: {
    task_code: string;
    task_name: string;
  };
}

export interface AITestSuiteWithStats extends AITestSuite {
  total_cases: number;
  golden_cases: number;
  latest_run?: AITestRun | null;
}

export interface AITestCase {
  id: string;
  suite_id: string;
  name: string;
  description: string | null;
  input_variables: Record<string, unknown>;
  expected_contains: string[];
  expected_not_contains: string[];
  expected_format: string | null;
  expected_schema: Record<string, unknown> | null;
  expected_min_length: number | null;
  expected_max_length: number | null;
  reference_output: string | null;
  similarity_threshold: number;
  is_golden: boolean;
  priority: number;
  tags: string[];
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface AITestRun {
  id: string;
  suite_id: string;
  prompt_id: string | null;
  triggered_by: 'manual' | 'pre_publish' | 'scheduled' | 'prompt_change';
  triggered_by_user: string | null;
  model_code: string | null;
  temperature: number | null;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  pass_rate: number | null;
  total_tokens: number;
  total_cost: number;
  total_latency_ms: number;
  avg_latency_ms: number | null;
  avg_quality_score: number | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  passed: boolean | null;
  created_at: string;
}

export interface AITestResult {
  id: string;
  run_id: string;
  test_case_id: string;
  status: 'passed' | 'failed' | 'error' | 'skipped';
  actual_output: string | null;
  validations: TestValidation[];
  input_tokens: number | null;
  output_tokens: number | null;
  latency_ms: number | null;
  cost: number | null;
  quality_score: number | null;
  quality_notes: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  error_message: string | null;
  created_at: string;
  // Joined
  test_case?: AITestCase;
}

export interface TestValidation {
  check: 'contains' | 'not_contains' | 'format' | 'length' | 'schema' | 'similarity';
  expected: string | number;
  actual?: string | number;
  passed: boolean;
  error?: string;
}

export interface AIQualityEvaluation {
  id: string;
  test_result_id: string | null;
  execution_id: string | null;
  score: number;
  criteria_scores: Record<string, number>;
  strengths: string | null;
  weaknesses: string | null;
  suggestions: string | null;
  evaluated_by: string;
  evaluated_at: string;
}

export interface TestSuiteFormData {
  name: string;
  description?: string;
  task_id: string;
  is_required_for_publish: boolean;
  pass_threshold: number;
}

export interface TestCaseFormData {
  name: string;
  description?: string;
  input_variables: Record<string, unknown>;
  expected_contains: string[];
  expected_not_contains?: string[];
  expected_format?: string;
  expected_min_length?: number;
  expected_max_length?: number;
  reference_output?: string;
  similarity_threshold?: number;
  is_golden: boolean;
  priority?: number;
  tags?: string[];
}

export interface QualityGateResult {
  can_publish: boolean;
  reason: string;
  required_suites: number;
  passed_suites: number;
  failed_suites: string[];
}
