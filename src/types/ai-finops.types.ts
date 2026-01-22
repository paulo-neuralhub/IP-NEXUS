// ============================================================
// IP-NEXUS AI BRAIN - FINOPS TYPES (PHASE 3)
// ============================================================

export interface AIFinOpsTotals {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_tokens: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_internal: number;
  total_cost_billable: number;
  profit: number;
  profit_margin: number;
  avg_latency_ms: number;
  error_rate: number;
}

export interface AIFinOpsByModel {
  model_id: string | null;
  model_code: string | null;
  model_name: string | null;
  provider_id: string | null;
  transactions: number;
  tokens: number;
  cost_internal: number;
  cost_billable: number;
  avg_latency_ms: number;
  error_rate: number;
}

export interface AIFinOpsByModule {
  module: string;
  transactions: number;
  tokens: number;
  cost_internal: number;
  cost_billable: number;
}

export interface AIFinOpsTopClient {
  client_id: string;
  transactions: number;
  tokens: number;
  cost_internal: number;
  cost_billable: number;
  profit: number;
}

export interface AIFinOpsDailyTrend {
  date: string;
  transactions: number;
  tokens: number;
  cost_internal: number;
  cost_billable: number;
}

export interface AIFinOpsHourlyTrend24h {
  hour: string;
  transactions: number;
  cost: number;
}

export interface AIFinOpsPendingAlert {
  id: string;
  alert_type: string;
  threshold_percent: number | null;
  budget_amount: number | null;
  current_spend: number | null;
  created_at: string;
}

export interface AIFinOpsDashboard {
  period: { start: string; end: string; days: number };
  totals: AIFinOpsTotals;
  by_model: AIFinOpsByModel[];
  by_module: AIFinOpsByModule[];
  top_clients: AIFinOpsTopClient[];
  daily_trend: AIFinOpsDailyTrend[];
  hourly_trend_24h: AIFinOpsHourlyTrend24h[];
  pending_alerts: AIFinOpsPendingAlert[];
}
