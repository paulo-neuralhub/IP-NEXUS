// Auth & Users
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

// Organizations (tenants)
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'business' | 'enterprise';
  addons: string[];
  status: 'active' | 'suspended' | 'cancelled';
  settings: Record<string, unknown>;
  created_at: string;
}

// Memberships
export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer' | 'external';
  permissions: Record<string, unknown>;
  created_at: string;
}

// Para distinguir entre APP y BACKOFFICE
export type OwnerType = 'tenant' | 'backoffice';

// CRM Contact (compartido)
export interface Contact {
  id: string;
  organization_id: string;
  owner_type: OwnerType;
  type: 'person' | 'company';
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

// Pipeline
export interface Pipeline {
  id: string;
  organization_id: string;
  owner_type: OwnerType;
  name: string;
  is_default: boolean;
  position: number;
}

// Pipeline Stage
export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  is_won_stage: boolean;
  is_lost_stage: boolean;
  probability: number;
}

// Deal
export interface Deal {
  id: string;
  organization_id: string;
  owner_type: OwnerType;
  pipeline_id: string;
  stage_id: string;
  title: string;
  value: number | null;
  currency: string;
  contact_id: string | null;
  status: 'open' | 'won' | 'lost';
}

// Activity (Timeline)
export interface Activity {
  id: string;
  organization_id: string;
  owner_type: OwnerType;
  type: 'email' | 'call' | 'whatsapp' | 'meeting' | 'note' | 'task' | 'stage_change';
  contact_id: string | null;
  deal_id: string | null;
  subject: string | null;
  content: string | null;
  created_by: string;
  created_at: string;
}

// AI Provider
export interface AIProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
}

// AI Model
export interface AIModel {
  id: string;
  provider_id: string;
  model_id: string;
  name: string;
  capabilities: Record<string, boolean>;
  input_cost_per_1m: number;
  output_cost_per_1m: number;
  status: 'active' | 'deprecated';
}

// IP-MARKET Types
export * from './market.types';

// Jurisdiction Types
export * from './jurisdiction';

// Service Types (PROMPT 4D)
export * from './services';

// Workflow Types (PROMPT 4D)
export * from './workflow';

// Holder Types (PROMPT 26)
export * from './holders';
