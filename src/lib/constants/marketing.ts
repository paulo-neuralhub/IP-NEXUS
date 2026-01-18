export const TEMPLATE_CATEGORIES = {
  general: { label: 'General', icon: 'Mail' },
  welcome: { label: 'Bienvenida', icon: 'UserPlus' },
  newsletter: { label: 'Newsletter', icon: 'Newspaper' },
  promotion: { label: 'Promoción', icon: 'Tag' },
  reminder: { label: 'Recordatorio', icon: 'Bell' },
  notification: { label: 'Notificación', icon: 'BellRing' },
  renewal: { label: 'Renovación', icon: 'RefreshCw' },
  invoice: { label: 'Factura', icon: 'Receipt' },
  custom: { label: 'Personalizada', icon: 'Settings' },
} as const;

export const CAMPAIGN_STATUSES = {
  draft: { label: 'Borrador', color: '#94A3B8', icon: 'FileEdit' },
  scheduled: { label: 'Programada', color: '#3B82F6', icon: 'Clock' },
  sending: { label: 'Enviando', color: '#F59E0B', icon: 'Send' },
  sent: { label: 'Enviada', color: '#22C55E', icon: 'CheckCircle' },
  paused: { label: 'Pausada', color: '#6B7280', icon: 'Pause' },
  cancelled: { label: 'Cancelada', color: '#EF4444', icon: 'XCircle' },
  failed: { label: 'Fallida', color: '#EF4444', icon: 'AlertTriangle' },
} as const;

export const CAMPAIGN_TYPES = {
  regular: { label: 'Regular', description: 'Envío único a una lista de contactos' },
  automated: { label: 'Automatizada', description: 'Se envía automáticamente por triggers' },
  ab_test: { label: 'Test A/B', description: 'Prueba diferentes versiones' },
  rss: { label: 'RSS', description: 'Contenido dinámico desde RSS' },
  transactional: { label: 'Transaccional', description: 'Emails de confirmación, facturas, etc.' },
} as const;

export const AUTOMATION_TRIGGERS = {
  contact_created: { label: 'Contacto creado', icon: 'UserPlus', category: 'contacts' },
  contact_updated: { label: 'Contacto actualizado', icon: 'UserCog', category: 'contacts' },
  tag_added: { label: 'Tag añadido', icon: 'Tag', category: 'contacts' },
  tag_removed: { label: 'Tag eliminado', icon: 'Tag', category: 'contacts' },
  list_joined: { label: 'Añadido a lista', icon: 'ListPlus', category: 'contacts' },
  list_left: { label: 'Eliminado de lista', icon: 'ListMinus', category: 'contacts' },
  deal_created: { label: 'Deal creado', icon: 'Plus', category: 'crm' },
  deal_stage_changed: { label: 'Deal cambió de etapa', icon: 'ArrowRight', category: 'crm' },
  deal_won: { label: 'Deal ganado', icon: 'Trophy', category: 'crm' },
  deal_lost: { label: 'Deal perdido', icon: 'X', category: 'crm' },
  matter_created: { label: 'Expediente creado', icon: 'FolderPlus', category: 'docket' },
  matter_expiring: { label: 'Expediente por vencer', icon: 'AlertTriangle', category: 'docket' },
  form_submitted: { label: 'Formulario enviado', icon: 'FileText', category: 'forms' },
  email_opened: { label: 'Email abierto', icon: 'MailOpen', category: 'email' },
  email_clicked: { label: 'Click en email', icon: 'MousePointer', category: 'email' },
  date_based: { label: 'Basado en fecha', icon: 'Calendar', category: 'time' },
  manual: { label: 'Manual', icon: 'Hand', category: 'other' },
  api: { label: 'API', icon: 'Code', category: 'other' },
} as const;

export const AUTOMATION_TRIGGER_CATEGORIES = {
  contacts: { label: 'Contactos', color: '#EC4899' },
  crm: { label: 'CRM', color: '#3B82F6' },
  docket: { label: 'Expedientes', color: '#0EA5E9' },
  forms: { label: 'Formularios', color: '#8B5CF6' },
  email: { label: 'Email', color: '#F97316' },
  time: { label: 'Tiempo', color: '#14B8A6' },
  other: { label: 'Otros', color: '#6B7280' },
} as const;

export const AUTOMATION_ACTIONS = {
  send_email: { label: 'Enviar email', icon: 'Mail', color: '#3B82F6' },
  wait: { label: 'Esperar', icon: 'Clock', color: '#6B7280' },
  condition: { label: 'Condición', icon: 'GitBranch', color: '#8B5CF6' },
  add_tag: { label: 'Añadir tag', icon: 'Tag', color: '#22C55E' },
  remove_tag: { label: 'Eliminar tag', icon: 'Tag', color: '#EF4444' },
  add_to_list: { label: 'Añadir a lista', icon: 'ListPlus', color: '#0EA5E9' },
  remove_from_list: { label: 'Eliminar de lista', icon: 'ListMinus', color: '#F59E0B' },
  update_contact: { label: 'Actualizar contacto', icon: 'UserCog', color: '#EC4899' },
  create_task: { label: 'Crear tarea', icon: 'CheckSquare', color: '#14B8A6' },
  notify_team: { label: 'Notificar equipo', icon: 'Users', color: '#F97316' },
  webhook: { label: 'Webhook', icon: 'Globe', color: '#6366F1' },
} as const;

export const AUTOMATION_STATUSES = {
  draft: { label: 'Borrador', color: '#94A3B8' },
  active: { label: 'Activa', color: '#22C55E' },
  paused: { label: 'Pausada', color: '#F59E0B' },
  archived: { label: 'Archivada', color: '#6B7280' },
} as const;

export const FILTER_OPERATORS = {
  equals: 'Es igual a',
  not_equals: 'No es igual a',
  contains: 'Contiene',
  not_contains: 'No contiene',
  starts_with: 'Empieza por',
  ends_with: 'Termina en',
  greater_than: 'Mayor que',
  less_than: 'Menor que',
  is_set: 'Tiene valor',
  is_not_set: 'No tiene valor',
  older_than: 'Hace más de',
  newer_than: 'Hace menos de',
} as const;

export const EMAIL_VARIABLES = [
  { key: '{{contact.name}}', label: 'Nombre del contacto' },
  { key: '{{contact.email}}', label: 'Email del contacto' },
  { key: '{{contact.company_name}}', label: 'Empresa' },
  { key: '{{contact.first_name}}', label: 'Nombre' },
  { key: '{{contact.last_name}}', label: 'Apellido' },
  { key: '{{contact.phone}}', label: 'Teléfono' },
  { key: '{{contact.job_title}}', label: 'Cargo' },
  { key: '{{organization.name}}', label: 'Nombre de tu empresa' },
  { key: '{{unsubscribe_link}}', label: 'Link de baja' },
  { key: '{{view_in_browser}}', label: 'Ver en navegador' },
  { key: '{{current_date}}', label: 'Fecha actual' },
  { key: '{{current_year}}', label: 'Año actual' },
] as const;

// Bloques disponibles en el editor
export const EMAIL_BLOCKS = {
  header: { label: 'Cabecera', icon: 'Type', description: 'Logo y título' },
  text: { label: 'Texto', icon: 'AlignLeft', description: 'Párrafo de texto' },
  image: { label: 'Imagen', icon: 'Image', description: 'Imagen con link opcional' },
  button: { label: 'Botón', icon: 'Square', description: 'Botón de llamada a la acción' },
  divider: { label: 'Divisor', icon: 'Minus', description: 'Línea separadora' },
  spacer: { label: 'Espaciador', icon: 'Move', description: 'Espacio en blanco' },
  columns: { label: 'Columnas', icon: 'Columns', description: '2 o 3 columnas' },
  social: { label: 'Redes sociales', icon: 'Share2', description: 'Links a redes sociales' },
  footer: { label: 'Pie', icon: 'FileText', description: 'Información legal y baja' },
  html: { label: 'HTML', icon: 'Code', description: 'Código HTML personalizado' },
} as const;

export const LIST_TYPES = {
  static: { label: 'Estática', description: 'Contactos añadidos manualmente' },
  dynamic: { label: 'Dinámica', description: 'Contactos por filtros automáticos' },
} as const;

export const SEND_STATUSES = {
  pending: { label: 'Pendiente', color: '#94A3B8' },
  sent: { label: 'Enviado', color: '#3B82F6' },
  delivered: { label: 'Entregado', color: '#22C55E' },
  opened: { label: 'Abierto', color: '#8B5CF6' },
  clicked: { label: 'Clic', color: '#EC4899' },
  bounced: { label: 'Rebotado', color: '#EF4444' },
  unsubscribed: { label: 'Baja', color: '#F59E0B' },
  complained: { label: 'Queja', color: '#DC2626' },
  failed: { label: 'Fallido', color: '#EF4444' },
} as const;

export const DEFAULT_EMAIL_SETTINGS = {
  backgroundColor: '#F8FAFC',
  contentWidth: 600,
  fontFamily: 'Arial, sans-serif',
  linkColor: '#3B82F6',
} as const;
