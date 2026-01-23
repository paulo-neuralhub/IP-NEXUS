export type VoipPlanType = 'package' | 'pay_as_you_go' | 'unlimited';

export type VoipMinuteType = 'included' | 'overage' | 'pay_as_you_go';

export type VoipUsageStatus = 'pending' | 'billed' | 'credited' | 'void';

export type BackofficeVoipGlobalStats = {
  current_period: string;
  active_organizations: number;
  total_calls: number;
  total_minutes: number;
  total_cost_cents: number;
  total_revenue_cents: number;
  total_margin_cents: number;
  margin_percentage: number;
  pay_as_you_go_orgs: number;
  starter_orgs: number;
  pro_orgs: number;
  business_orgs: number;
  unlimited_orgs: number;
};

export type BackofficeVoipOrgSummary = {
  organization_id: string;
  organization_name: string;
  plan_name: string | null;
  plan_code: string | null;
  subscription_status: string | null;
  current_minutes_used: number | null;
  current_minutes_included: number | null;
  current_overage_minutes: number | null;
  month_total_calls: number;
  month_total_minutes: number;
  month_total_cost_cents: number;
  month_total_price_cents: number;
  month_margin_cents: number;
  lifetime_minutes: number | null;
  lifetime_calls: number | null;
  lifetime_amount_cents: number | null;
  twilio_phone_number: string | null;
};
