// Push Subscription Types
export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
}

// Notification Preferences Types
export interface NotificationPreferences {
  id: string;
  user_id: string;
  
  // Channels
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  
  // Notification types
  deadline_reminders: boolean;
  deadline_reminder_days: number[];
  renewal_reminders: boolean;
  renewal_reminder_days: number[];
  watch_alerts: boolean;
  invoice_notifications: boolean;
  team_notifications: boolean;
  marketing_notifications: boolean;
  
  // Schedule
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  
  created_at: string;
  updated_at: string;
}

// Notification Types
export type NotificationType = 
  | 'deadline_reminder'
  | 'renewal_reminder'
  | 'watch_alert'
  | 'invoice'
  | 'team_invite'
  | 'team_update'
  | 'system'
  | 'marketing';

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  
  // Content
  title: string;
  body: string;
  icon?: string;
  image_url?: string;
  
  // Type
  type: NotificationType;
  
  // Action
  action_url?: string;
  action_data: Record<string, unknown>;
  
  // Status
  is_read: boolean;
  read_at?: string;
  
  // Delivery
  sent_via: ('email' | 'push' | 'in_app')[];
  
  // Reference
  reference_type?: string;
  reference_id?: string;
  
  // Metadata
  metadata: Record<string, unknown>;
  
  created_at: string;
  expires_at?: string;
}

// PWA Types
export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// Device Types
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

// Notification Channel
export type NotificationChannel = 'email' | 'push' | 'in_app';

// Notification Constants
export const NOTIFICATION_TYPES: Record<NotificationType, { label: string; icon: string; color: string }> = {
  deadline_reminder: { label: 'Recordatorio de Plazo', icon: 'Clock', color: 'text-orange-500' },
  renewal_reminder: { label: 'Recordatorio de Renovación', icon: 'RefreshCw', color: 'text-blue-500' },
  watch_alert: { label: 'Alerta de Vigilancia', icon: 'Eye', color: 'text-purple-500' },
  invoice: { label: 'Facturación', icon: 'Receipt', color: 'text-green-500' },
  team_invite: { label: 'Invitación de Equipo', icon: 'UserPlus', color: 'text-pink-500' },
  team_update: { label: 'Actualización de Equipo', icon: 'Users', color: 'text-indigo-500' },
  system: { label: 'Sistema', icon: 'Settings', color: 'text-gray-500' },
  marketing: { label: 'Marketing', icon: 'Megaphone', color: 'text-teal-500' },
};

export const DEFAULT_REMINDER_DAYS = {
  deadline: [7, 3, 1],
  renewal: [90, 60, 30],
};
