/**
 * Mock Data Factories
 * Factory functions to create test data with sensible defaults
 */

// ==========================================
// USER & AUTH MOCKS
// ==========================================

export interface MockUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  language: string;
  timezone: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: "user-" + Math.random().toString(36).substring(7),
  email: "test@example.com",
  full_name: "Test User",
  avatar_url: null,
  phone: null,
  language: "es",
  timezone: "Europe/Madrid",
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// ORGANIZATION MOCKS
// ==========================================

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  addons: string[];
  settings: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export const createMockOrganization = (overrides: Partial<MockOrganization> = {}): MockOrganization => ({
  id: "org-" + Math.random().toString(36).substring(7),
  name: "Test Organization",
  slug: "test-org",
  plan: "professional",
  addons: [],
  settings: {},
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// MEMBERSHIP MOCKS
// ==========================================

export interface MockMembership {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export const createMockMembership = (overrides: Partial<MockMembership> = {}): MockMembership => ({
  id: "membership-" + Math.random().toString(36).substring(7),
  user_id: "user-123",
  organization_id: "org-123",
  role: "member",
  permissions: {},
  created_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// MATTER/ASSET MOCKS
// ==========================================

export interface MockMatter {
  id: string;
  organization_id: string;
  matter_type: string;
  ip_right_type: string;
  reference_number: string;
  title: string;
  status: string;
  priority: string;
  filing_number: string | null;
  filing_date: string | null;
  registration_number: string | null;
  registration_date: string | null;
  expiry_date: string | null;
  office_code: string | null;
  nice_classes: number[];
  owner_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const createMockMatter = (overrides: Partial<MockMatter> = {}): MockMatter => ({
  id: "matter-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  matter_type: "trademark",
  ip_right_type: "trademark",
  reference_number: "TM-2024-" + Math.floor(Math.random() * 10000).toString().padStart(4, "0"),
  title: "Test Trademark",
  status: "active",
  priority: "normal",
  filing_number: "FN-2024-001",
  filing_date: "2024-01-15",
  registration_number: "REG-2024-001",
  registration_date: "2024-06-15",
  expiry_date: "2034-06-15",
  office_code: "ES",
  nice_classes: [9, 42],
  owner_id: null,
  assigned_to: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// DEADLINE MOCKS
// ==========================================

export interface MockDeadline {
  id: string;
  organization_id: string;
  matter_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  entry_type: string;
  assigned_to: string | null;
  created_at: string;
}

export const createMockDeadline = (overrides: Partial<MockDeadline> = {}): MockDeadline => ({
  id: "deadline-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  matter_id: null,
  title: "Renewal Due",
  description: null,
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  priority: "high",
  status: "pending",
  entry_type: "renewal",
  assigned_to: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// CONTACT MOCKS
// ==========================================

export interface MockContact {
  id: string;
  organization_id: string;
  owner_type: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  job_title: string | null;
  country: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const createMockContact = (overrides: Partial<MockContact> = {}): MockContact => ({
  id: "contact-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  owner_type: "tenant",
  type: "person",
  name: "John Doe",
  email: "john@example.com",
  phone: "+34 91 123 4567",
  company_name: "ACME Inc.",
  job_title: "CEO",
  country: "ES",
  tags: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// DEAL MOCKS
// ==========================================

export interface MockDeal {
  id: string;
  organization_id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  value: number;
  currency: string;
  contact_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const createMockDeal = (overrides: Partial<MockDeal> = {}): MockDeal => ({
  id: "deal-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  pipeline_id: "pipeline-123",
  stage_id: "stage-123",
  title: "New Client Deal",
  value: 5000,
  currency: "EUR",
  contact_id: null,
  status: "open",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// ACTIVITY MOCKS
// ==========================================

export interface MockActivity {
  id: string;
  organization_id: string;
  owner_type: string;
  type: string;
  subject: string | null;
  content: string | null;
  contact_id: string | null;
  deal_id: string | null;
  matter_id: string | null;
  direction: string | null;
  created_by: string | null;
  created_at: string;
}

export const createMockActivity = (overrides: Partial<MockActivity> = {}): MockActivity => ({
  id: "activity-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  owner_type: "tenant",
  type: "note",
  subject: "Follow-up call",
  content: "Discussed project requirements",
  contact_id: null,
  deal_id: null,
  matter_id: null,
  direction: null,
  created_by: "user-123",
  created_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// AI CONVERSATION MOCKS
// ==========================================

export interface MockAIConversation {
  id: string;
  organization_id: string;
  user_id: string;
  agent_type: string;
  title: string | null;
  status: string;
  message_count: number;
  token_count: number;
  created_at: string;
  updated_at: string;
}

export const createMockAIConversation = (overrides: Partial<MockAIConversation> = {}): MockAIConversation => ({
  id: "conv-" + Math.random().toString(36).substring(7),
  organization_id: "org-123",
  user_id: "user-123",
  agent_type: "nexus_guide",
  title: "Help with trademarks",
  status: "active",
  message_count: 5,
  token_count: 1500,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// AI MESSAGE MOCKS
// ==========================================

export interface MockAIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number | null;
  model_used: string | null;
  created_at: string;
}

export const createMockAIMessage = (overrides: Partial<MockAIMessage> = {}): MockAIMessage => ({
  id: "msg-" + Math.random().toString(36).substring(7),
  conversation_id: "conv-123",
  role: "user",
  content: "Hello, I need help with trademark registration",
  tokens_used: null,
  model_used: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

// ==========================================
// BATCH CREATORS
// ==========================================

/**
 * Create an array of mock items
 */
export function createMockArray<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: Partial<T>
): T[] {
  return Array.from({ length: count }, () => factory(overrides));
}

/**
 * Create mock pagination response
 */
export function createMockPaginatedResponse<T>(
  items: T[],
  page = 1,
  pageSize = 10,
  total?: number
) {
  return {
    data: items,
    pagination: {
      page,
      pageSize,
      total: total ?? items.length,
      totalPages: Math.ceil((total ?? items.length) / pageSize),
      hasMore: page * pageSize < (total ?? items.length),
    },
  };
}
