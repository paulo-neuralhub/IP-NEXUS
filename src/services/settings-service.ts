// src/services/settings-service.ts
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ============================================
// TYPES
// ============================================

export interface OrganizationGeneral {
  type?: string;
  industry?: string;
  description?: string;
  website?: string;
  support_email?: string;
  phone?: string;
}

export interface OrganizationBranding {
  logo_url?: string | null;
  logo_dark_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  email_header_url?: string | null;
  email_footer_html?: string;
  powered_by_hidden?: boolean;
}

export interface OrganizationRegional {
  timezone?: string;
  currency?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  date_format?: string;
  time_format?: '12h' | '24h';
  week_start?: string;
  language?: string;
  number_format?: {
    decimal_separator: string;
    thousands_separator: string;
  };
}

export interface OrganizationSecurity {
  require_2fa?: boolean;
  allowed_2fa_methods?: string[];
  session_timeout_minutes?: number;
  max_sessions_per_user?: number;
  password_policy?: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    max_age_days: number;
    prevent_reuse: number;
  };
  ip_whitelist?: string[];
  ip_blacklist?: string[];
  sso_enabled?: boolean;
  login_alerts?: boolean;
}

export interface OrganizationEmail {
  custom_smtp?: boolean;
  smtp_config?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password_encrypted?: string;
  } | null;

  // Ingesta (Inbox) por IMAP (polling)
  inbound_imap?: boolean;
  imap_config?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    mailbox?: string;
    poll_minutes?: number;
    password_encrypted?: string;
  } | null;

  default_sender_name?: string;
  default_sender_email?: string | null;
  reply_to_email?: string | null;
  verified_domains?: string[];
  email_signature?: string;
}

export interface OrganizationModules {
  [key: string]: {
    enabled: boolean;
    daily_limit?: number;
  };
}

export interface OrganizationDefaults {
  asset_status?: string;
  deadline_reminder_days?: number[];
  cost_currency?: string;
  auto_archive_after_days?: number;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  general: OrganizationGeneral;
  branding: OrganizationBranding;
  regional: OrganizationRegional;
  security: OrganizationSecurity;
  email: OrganizationEmail;
  modules: OrganizationModules;
  defaults: OrganizationDefaults;
  integrations: Record<string, any>;
}

export interface UserProfile {
  display_name?: string;
  job_title?: string;
  department?: string;
  bio?: string;
  phone?: string;
  linkedin?: string;
}

export interface UserDisplay {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  sidebar_collapsed?: boolean;
  sidebar_position?: 'left' | 'right';
  items_per_page?: number;
  show_tooltips?: boolean;
  animations_enabled?: boolean;
  keyboard_shortcuts_enabled?: boolean;
}

export interface UserSecurity {
  two_factor_enabled?: boolean;
  two_factor_method?: 'totp' | 'sms';
  login_notifications?: boolean;
  session_alerts?: boolean;
}

export interface UserDashboard {
  widgets?: Array<{ id: string; position: number; size: string }>;
  default_date_range?: string;
  show_announcements?: boolean;
}

export interface UserShortcuts {
  favorites?: string[];
  recent?: string[];
  pinned_searches?: Array<{ name: string; query: string }>;
  quick_actions?: string[];
}

export interface UserSettings {
  id: string;
  user_id: string;
  profile: UserProfile;
  display: UserDisplay;
  security: UserSecurity;
  dashboard: UserDashboard;
  shortcuts: UserShortcuts;
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_ORG_SETTINGS: Omit<OrganizationSettings, 'id' | 'organization_id'> = {
  general: {
    type: 'law_firm',
    industry: 'legal',
  },
  branding: {
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
    powered_by_hidden: false,
  },
  regional: {
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    currency_symbol: '€',
    currency_position: 'after',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    week_start: 'monday',
    language: 'es',
  },
  security: {
    require_2fa: false,
    session_timeout_minutes: 480,
    max_sessions_per_user: 5,
    password_policy: {
      min_length: 12,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false,
      max_age_days: 0,
      prevent_reuse: 0,
    },
    login_alerts: true,
  },
  email: {
    custom_smtp: false,
    inbound_imap: false,
    default_sender_name: 'IP-NEXUS',
  },
  modules: {
    docket: { enabled: true },
    crm: { enabled: true },
    marketing: { enabled: true },
    spider: { enabled: true },
    genius: { enabled: true, daily_limit: 100 },
    finance: { enabled: true },
  },
  defaults: {
    deadline_reminder_days: [30, 14, 7, 3, 1],
    cost_currency: 'EUR',
    auto_archive_after_days: 365,
  },
  integrations: {},
};

const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'id' | 'user_id'> = {
  profile: {},
  display: {
    theme: 'system',
    language: 'es',
    density: 'normal',
    sidebar_collapsed: false,
    items_per_page: 25,
    show_tooltips: true,
    animations_enabled: true,
    keyboard_shortcuts_enabled: true,
  },
  security: {
    two_factor_enabled: false,
    login_notifications: true,
  },
  dashboard: {
    default_date_range: '30d',
    show_announcements: true,
  },
  shortcuts: {
    favorites: [],
    recent: [],
    pinned_searches: [],
    quick_actions: ['new_asset', 'new_deadline', 'search'],
  },
};

// ============================================
// ORGANIZATION SETTINGS SERVICE
// ============================================

export async function getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null> {
  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No existe, crear uno
      const { data: newData } = await supabase
        .from('organization_settings')
        .insert({ organization_id: organizationId })
        .select()
        .single();
      return newData ? parseOrgSettings(newData) : null;
    }
    console.error('Error fetching org settings:', error);
    return null;
  }

  return parseOrgSettings(data);
}

function parseOrgSettings(data: any): OrganizationSettings {
  return {
    id: data.id,
    organization_id: data.organization_id,
    general: { ...DEFAULT_ORG_SETTINGS.general, ...(data.general || {}) },
    branding: { ...DEFAULT_ORG_SETTINGS.branding, ...(data.branding || {}) },
    regional: { ...DEFAULT_ORG_SETTINGS.regional, ...(data.regional || {}) },
    security: { ...DEFAULT_ORG_SETTINGS.security, ...(data.security || {}) },
    email: { ...DEFAULT_ORG_SETTINGS.email, ...(data.email || {}) },
    modules: { ...DEFAULT_ORG_SETTINGS.modules, ...(data.modules || {}) },
    defaults: { ...DEFAULT_ORG_SETTINGS.defaults, ...(data.defaults || {}) },
    integrations: data.integrations || {},
  };
}

export async function updateOrganizationSettings(
  organizationId: string,
  category: keyof Omit<OrganizationSettings, 'id' | 'organization_id'>,
  updates: Record<string, any>
): Promise<boolean> {
  // Get current settings for this category
  const current = await getOrganizationSettings(organizationId);
  if (!current) return false;

  const currentValue = current[category] as Record<string, any>;
  const newValue = { ...currentValue, ...updates };

  const { error } = await supabase
    .from('organization_settings')
    .update({ [category]: newValue as Json })
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error updating org settings:', error);
    return false;
  }

  // Log the change
  await logSettingsChange(organizationId, `org_${category}_updated`, { 
    field: category, 
    changes: updates 
  });

  return true;
}

// ============================================
// USER SETTINGS SERVICE
// ============================================

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No existe, crear uno
      const { data: newData } = await supabase
        .from('user_settings')
        .insert({ user_id: userId })
        .select()
        .single();
      return newData ? parseUserSettings(newData) : null;
    }
    console.error('Error fetching user settings:', error);
    return null;
  }

  return parseUserSettings(data);
}

function parseUserSettings(data: any): UserSettings {
  return {
    id: data.id,
    user_id: data.user_id,
    profile: { ...DEFAULT_USER_SETTINGS.profile, ...(data.profile || {}) },
    display: { ...DEFAULT_USER_SETTINGS.display, ...(data.display || {}) },
    security: { ...DEFAULT_USER_SETTINGS.security, ...(data.security || {}) },
    dashboard: { ...DEFAULT_USER_SETTINGS.dashboard, ...(data.dashboard || {}) },
    shortcuts: { ...DEFAULT_USER_SETTINGS.shortcuts, ...(data.shortcuts || {}) },
  };
}

export async function updateUserSettings(
  userId: string,
  category: keyof Omit<UserSettings, 'id' | 'user_id'>,
  updates: Record<string, any>
): Promise<boolean> {
  const current = await getUserSettings(userId);
  if (!current) return false;

  const currentValue = current[category] as Record<string, any>;
  const newValue = { ...currentValue, ...updates };

  const { error } = await supabase
    .from('user_settings')
    .update({ [category]: newValue as Json })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user settings:', error);
    return false;
  }

  return true;
}

// ============================================
// ACTIVE SESSIONS
// ============================================

export async function getUserSessions(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('active_sessions')
    .update({ 
      is_active: false, 
      revoked_at: new Date().toISOString() 
    })
    .eq('id', sessionId)
    .eq('user_id', userId);

  return !error;
}

export async function revokeAllSessions(userId: string, exceptCurrentId?: string): Promise<boolean> {
  let query = supabase
    .from('active_sessions')
    .update({ 
      is_active: false, 
      revoked_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (exceptCurrentId) {
    query = query.neq('id', exceptCurrentId);
  }

  const { error } = await query;
  return !error;
}

// ============================================
// AUDIT LOG
// ============================================

async function logSettingsChange(
  organizationId: string | null,
  action: string,
  changes: Record<string, any>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('settings_audit_log').insert({
      organization_id: organizationId,
      user_id: user.id,
      action,
      category: getCategoryFromAction(action),
      changes: changes as Json,
    });
  } catch (error) {
    console.error('Error logging settings change:', error);
  }
}

function getCategoryFromAction(action: string): string {
  if (action.includes('api_key') || action.includes('webhook') || action.includes('oauth')) {
    return 'integration';
  }
  if (action.includes('security') || action.includes('session') || action.includes('2fa')) {
    return 'security';
  }
  if (action.includes('user') || action.includes('profile') || action.includes('display')) {
    return 'user';
  }
  return 'organization';
}

// ============================================
// EXPORT
// ============================================

export const SettingsService = {
  getOrganizationSettings,
  updateOrganizationSettings,
  getUserSettings,
  updateUserSettings,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  DEFAULT_ORG_SETTINGS,
  DEFAULT_USER_SETTINGS,
};

export default SettingsService;
