/**
 * WhatsApp Integration Types for IP-NEXUS
 * Supports both Meta API and QR Web integrations
 */

// Integration types
export type WhatsAppIntegrationType = 'none' | 'meta_api' | 'qr_web';
export type WhatsAppMetaStatus = 'not_configured' | 'pending' | 'active' | 'error';
export type WhatsAppImplementationStatus = 'none' | 'pending' | 'in_progress' | 'completed' | 'rejected';
export type WhatsAppQRSessionStatus = 'disconnected' | 'qr_pending' | 'connected' | 'error';
export type WhatsAppMessageDirection = 'incoming' | 'outgoing';
export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact';
export type WhatsAppMessageStatus = 'received' | 'sent' | 'delivered' | 'read' | 'failed';
export type WhatsAppConversationStatus = 'open' | 'closed' | 'archived';

// Tenant configuration
export interface WhatsAppTenantConfig {
  id: string;
  organization_id: string;
  integration_type: WhatsAppIntegrationType;
  
  // Meta API config
  meta_phone_number_id: string | null;
  meta_business_account_id: string | null;
  meta_access_token: string | null;
  meta_webhook_verify_token: string | null;
  meta_app_id: string | null;
  meta_status: WhatsAppMetaStatus;
  
  // Implementation request
  implementation_requested: boolean;
  implementation_request_date: string | null;
  implementation_status: WhatsAppImplementationStatus;
  implementation_notes: string | null;
  
  // General settings
  auto_reply_enabled: boolean;
  auto_reply_message: string;
  business_hours_only: boolean;
  business_hours_start: string;
  business_hours_end: string;
  
  // Notifications
  notify_new_messages: boolean;
  notify_email: string | null;
  
  created_at: string;
  updated_at: string;
}

// QR Session
export interface WhatsAppQRSession {
  id: string;
  organization_id: string;
  user_id: string;
  status: WhatsAppQRSessionStatus;
  phone_number: string | null;
  device_name: string | null;
  session_data: Record<string, unknown> | null;
  last_seen: string | null;
  connected_at: string | null;
  disconnected_at: string | null;
  is_active: boolean;
  receive_notifications: boolean;
  created_at: string;
  updated_at: string;
}

// Message
export interface WhatsAppMessage {
  id: string;
  organization_id: string;
  wa_id: string;
  contact_name: string | null;
  contact_phone: string;
  client_id: string | null;
  message_id: string | null;
  direction: WhatsAppMessageDirection;
  message_type: WhatsAppMessageType;
  content: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_filename: string | null;
  media_caption: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  location_name: string | null;
  status: WhatsAppMessageStatus;
  error_message: string | null;
  timestamp: string;
  read_at: string | null;
  read_by: string | null;
  sent_by: string | null;
  source: 'meta_api' | 'qr_web';
  session_id: string | null;
  created_at: string;
}

// Conversation
export interface WhatsAppConversation {
  id: string;
  organization_id: string;
  contact_phone: string;
  contact_name: string | null;
  wa_id: string | null;
  client_id: string | null;
  status: WhatsAppConversationStatus;
  assigned_to: string | null;
  last_message_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  total_messages: number;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  client?: {
    id: string;
    full_name: string;
    company_name?: string;
    avatar_url?: string;
  } | null;
  assigned_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
}

// Implementation request
export interface WhatsAppImplementationRequest {
  id: string;
  organization_id: string;
  requested_by: string | null;
  requested_at: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  plan_type: 'standard' | 'premium' | 'enterprise';
  estimated_monthly_messages: number | null;
  current_whatsapp_number: string | null;
  additional_notes: string | null;
  status: 'pending' | 'contacted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  assigned_admin: string | null;
  admin_notes: string | null;
  contacted_at: string | null;
  completed_at: string | null;
  quoted_price: number | null;
  setup_fee: number | null;
  monthly_fee: number | null;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  organization?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  requester?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

// Form types
export interface WhatsAppSettingsForm {
  auto_reply_enabled: boolean;
  auto_reply_message: string;
  business_hours_only: boolean;
  business_hours_start: string;
  business_hours_end: string;
  notify_new_messages: boolean;
  notify_email: string;
}

export interface WhatsAppImplementationRequestForm {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  plan_type: 'standard' | 'premium' | 'enterprise';
  estimated_monthly_messages: number | null;
  current_whatsapp_number: string;
  additional_notes: string;
}

// Send message params
export interface SendWhatsAppMessageParams {
  recipientPhone: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: WhatsAppMessageType;
  contactId?: string;
}
