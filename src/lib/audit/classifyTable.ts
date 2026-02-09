// ============================================================
// IP-NEXUS - Database Audit: Table Classification
// ============================================================

export interface TableClassification {
  project: string;
  module: string;
  color: string;
  emoji: string;
}

export function classifyTable(name: string): TableClassification {
  const n = name.toLowerCase();

  // ── UMBRELLA BRANDS ──
  if (n.includes('umbrella')) return { project: 'Umbrella Brands', module: 'Core', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('brand_registration')) return { project: 'Umbrella Brands', module: 'Registros', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('trademark_order')) return { project: 'Umbrella Brands', module: 'Pedidos', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('brand_monitor')) return { project: 'Umbrella Brands', module: 'Vigilancia', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('registration_request')) return { project: 'Umbrella Brands', module: 'Solicitudes', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('service_order')) return { project: 'Umbrella Brands', module: 'Servicios', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('professional_profile')) return { project: 'Umbrella Brands', module: 'Profesionales', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('client_request')) return { project: 'Umbrella Brands', module: 'Clientes', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('jurisdiction') && !n.startsWith('ai_')) return { project: 'Umbrella Brands', module: 'Jurisdicciones', color: '#F59E0B', emoji: '☂️' };
  if (n.includes('pricing') && !n.includes('ai_')) return { project: 'Umbrella Brands', module: 'Precios', color: '#F59E0B', emoji: '☂️' };

  // ── IP-NEXUS: AI/Genius ──
  if (n.startsWith('ai_')) return { project: 'IP-NEXUS', module: 'AI/Genius', color: '#0EA5E9', emoji: '🧠' };

  // ── IP-NEXUS: Docket/Matters ──
  if (n.startsWith('matter') || n === 'matters') return { project: 'IP-NEXUS', module: 'Docket', color: '#0EA5E9', emoji: '📁' };
  if (n.includes('deadline') || n.includes('renewal')) return { project: 'IP-NEXUS', module: 'Docket', color: '#0EA5E9', emoji: '📁' };
  if (n.includes('nice_class')) return { project: 'IP-NEXUS', module: 'Docket', color: '#0EA5E9', emoji: '📁' };

  // ── IP-NEXUS: CRM ──
  if (n.startsWith('crm_') || n === 'contacts' || n === 'contact_activities') return { project: 'IP-NEXUS', module: 'CRM', color: '#10B981', emoji: '🤝' };
  if (n === 'deals' || n === 'pipelines' || n === 'pipeline_stages') return { project: 'IP-NEXUS', module: 'CRM', color: '#10B981', emoji: '🤝' };

  // ── IP-NEXUS: Automation ──
  if (n.startsWith('automation_') || n.includes('workflow')) return { project: 'IP-NEXUS', module: 'Automatización', color: '#8B5CF6', emoji: '⚙️' };

  // ── IP-NEXUS: Portal ──
  if (n.startsWith('portal_')) return { project: 'IP-NEXUS', module: 'Portal', color: '#6366F1', emoji: '🌐' };

  // ── IP-NEXUS: Migration/DataHub ──
  if (n.startsWith('migration_') || n.startsWith('data_hub') || n.startsWith('ip_office') || n.startsWith('organization_office')) return { project: 'IP-NEXUS', module: 'DataHub', color: '#0D9488', emoji: '🔄' };

  // ── IP-NEXUS: Spider ──
  if (n.startsWith('spider_') || n.includes('monitoring') || n.includes('surveillance') || n.includes('watch')) return { project: 'IP-NEXUS', module: 'Spider', color: '#8B5CF6', emoji: '🕷️' };

  // ── IP-NEXUS: Documents ──
  if (n.startsWith('document') || n.includes('template') || n.includes('signature')) return { project: 'IP-NEXUS', module: 'Documentos', color: '#64748B', emoji: '📄' };

  // ── IP-NEXUS: Finance ──
  if (n.startsWith('invoice') || n.startsWith('payment') || n.startsWith('billing') || n.includes('fee') || n.includes('cost') || n.startsWith('quote') || n.startsWith('provision') || n.startsWith('subscription')) return { project: 'IP-NEXUS', module: 'Finanzas', color: '#6366F1', emoji: '💰' };

  // ── IP-NEXUS: Telephony ──
  if (n.startsWith('telephony') || n.includes('voip') || n.includes('call_')) return { project: 'IP-NEXUS', module: 'Telefonía', color: '#EC4899', emoji: '📞' };

  // ── IP-NEXUS: Notifications ──
  if (n.startsWith('notification')) return { project: 'IP-NEXUS', module: 'Notificaciones', color: '#F43F5E', emoji: '🔔' };

  // ── IP-NEXUS: Agent/Market ──
  if (n.startsWith('agent_') || n.startsWith('market_') || n.startsWith('rfq_') || n.startsWith('kyc_')) return { project: 'IP-NEXUS', module: 'Market/Agents', color: '#F59E0B', emoji: '🏪' };

  // ── IP-NEXUS: Calendar/Tasks ──
  if (n.startsWith('calendar') || n.startsWith('task') || n === 'events') return { project: 'IP-NEXUS', module: 'Calendario', color: '#0EA5E9', emoji: '📅' };

  // ── IP-NEXUS: Email ──
  if (n.startsWith('email')) return { project: 'IP-NEXUS', module: 'Email', color: '#3B82F6', emoji: '📧' };

  // ── IP-NEXUS: Reports ──
  if (n.startsWith('report')) return { project: 'IP-NEXUS', module: 'Informes', color: '#8B5CF6', emoji: '📊' };

  // ── IP-NEXUS: Roles/Permissions ──
  if (n === 'roles' || n === 'role_permissions' || n === 'permissions' || n === 'memberships') return { project: 'IP-NEXUS', module: 'RBAC', color: '#0EA5E9', emoji: '🔐' };

  // ── IP-NEXUS: Teams ──
  if (n.startsWith('team')) return { project: 'IP-NEXUS', module: 'Equipos', color: '#0EA5E9', emoji: '👥' };

  // ── COMPARTIDO/CORE ──
  if (n === 'organizations' || n === 'users' || n === 'user_preferences')
    return { project: '⚠️ COMPARTIDO', module: 'Auth/Org', color: '#EF4444', emoji: '⚠️' };
  if (n === 'activity_log' || n === 'access_logs' || n === 'access_audit_log' || n === 'active_sessions')
    return { project: '⚠️ COMPARTIDO', module: 'Logs', color: '#EF4444', emoji: '⚠️' };
  if (n === 'activities' || n === 'activity_action_types')
    return { project: '⚠️ COMPARTIDO', module: 'Activities', color: '#EF4444', emoji: '⚠️' };

  // ── NO CLASIFICADO ──
  return { project: '❓ REVISAR', module: 'Desconocido', color: '#9CA3AF', emoji: '❓' };
}

/** Get background color class for table rows */
export function getRowBgClass(project: string): string {
  if (project === 'IP-NEXUS') return 'bg-blue-50/60';
  if (project === 'Umbrella Brands') return 'bg-amber-50/60';
  if (project.includes('COMPARTIDO')) return 'bg-red-50/60';
  if (project.includes('REVISAR')) return 'bg-gray-50/60';
  return '';
}

/** Get all unique project names for filtering */
export const PROJECT_FILTERS = ['Todos', 'IP-NEXUS', 'Umbrella Brands', '⚠️ COMPARTIDO', '❓ REVISAR'] as const;
