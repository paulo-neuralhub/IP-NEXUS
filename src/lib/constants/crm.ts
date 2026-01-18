export const CONTACT_TYPES = {
  person: { label: 'Persona', icon: 'User' },
  company: { label: 'Empresa', icon: 'Building2' },
} as const;

export const LIFECYCLE_STAGES = {
  subscriber: { label: 'Suscriptor', color: '#94A3B8' },
  lead: { label: 'Lead', color: '#3B82F6' },
  mql: { label: 'MQL', color: '#8B5CF6' },
  sql: { label: 'SQL', color: '#F59E0B' },
  opportunity: { label: 'Oportunidad', color: '#EC4899' },
  customer: { label: 'Cliente', color: '#22C55E' },
  evangelist: { label: 'Evangelista', color: '#10B981' },
  other: { label: 'Otro', color: '#6B7280' },
} as const;

export const PIPELINE_TYPES = {
  sales: { label: 'Ventas', icon: 'TrendingUp' },
  registration: { label: 'Registro de marca', icon: 'FileCheck' },
  opposition: { label: 'Oposiciones', icon: 'Shield' },
  renewal: { label: 'Renovaciones', icon: 'RefreshCw' },
  support: { label: 'Soporte', icon: 'Headphones' },
  custom: { label: 'Personalizado', icon: 'Settings' },
} as const;

export const DEAL_STATUSES = {
  open: { label: 'Abierto', color: '#3B82F6' },
  won: { label: 'Ganado', color: '#22C55E' },
  lost: { label: 'Perdido', color: '#EF4444' },
} as const;

export const DEAL_PRIORITIES = {
  low: { label: 'Baja', color: '#94A3B8' },
  medium: { label: 'Media', color: '#3B82F6' },
  high: { label: 'Alta', color: '#F59E0B' },
  urgent: { label: 'Urgente', color: '#EF4444' },
} as const;

export const ACTIVITY_TYPES = {
  email: { label: 'Email', icon: 'Mail', color: '#3B82F6' },
  call: { label: 'Llamada', icon: 'Phone', color: '#22C55E' },
  whatsapp: { label: 'WhatsApp', icon: 'MessageCircle', color: '#25D366' },
  meeting: { label: 'Reunión', icon: 'Calendar', color: '#8B5CF6' },
  note: { label: 'Nota', icon: 'StickyNote', color: '#F59E0B' },
  task: { label: 'Tarea', icon: 'CheckSquare', color: '#EC4899' },
  stage_change: { label: 'Cambio de etapa', icon: 'ArrowRight', color: '#6B7280' },
  document: { label: 'Documento', icon: 'FileText', color: '#0EA5E9' },
  deal_created: { label: 'Deal creado', icon: 'Plus', color: '#22C55E' },
  deal_won: { label: 'Deal ganado', icon: 'Trophy', color: '#22C55E' },
  deal_lost: { label: 'Deal perdido', icon: 'X', color: '#EF4444' },
  contact_created: { label: 'Contacto creado', icon: 'UserPlus', color: '#3B82F6' },
  other: { label: 'Otro', icon: 'MoreHorizontal', color: '#6B7280' },
} as const;

export const CONTACT_SOURCES = [
  { value: 'website', label: 'Sitio web' },
  { value: 'referral', label: 'Referido' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'cold_call', label: 'Llamada en frío' },
  { value: 'event', label: 'Evento' },
  { value: 'advertisement', label: 'Publicidad' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Otro' },
] as const;

export const INDUSTRIES = [
  { value: 'technology', label: 'Tecnología' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Servicios' },
  { value: 'legal', label: 'Legal' },
  { value: 'education', label: 'Educación' },
  { value: 'construction', label: 'Construcción' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'food', label: 'Alimentación' },
  { value: 'other', label: 'Otro' },
] as const;

// Pipelines predefinidos para crear al iniciar
export const DEFAULT_PIPELINES = {
  sales: {
    name: 'Captación de Clientes',
    stages: [
      { name: 'Lead entrante', color: '#94A3B8', probability: 10 },
      { name: 'Contacto inicial', color: '#3B82F6', probability: 20 },
      { name: 'Análisis necesidades', color: '#8B5CF6', probability: 40 },
      { name: 'Propuesta enviada', color: '#F59E0B', probability: 60 },
      { name: 'Negociación', color: '#EC4899', probability: 80 },
      { name: 'Ganado', color: '#22C55E', probability: 100, is_won_stage: true },
      { name: 'Perdido', color: '#EF4444', probability: 0, is_lost_stage: true },
    ],
  },
  registration: {
    name: 'Registro de Marca',
    stages: [
      { name: 'Solicitud recibida', color: '#94A3B8', probability: 10 },
      { name: 'Búsqueda anterioridades', color: '#3B82F6', probability: 20 },
      { name: 'Preparación documentación', color: '#8B5CF6', probability: 40 },
      { name: 'Presentación oficina', color: '#F59E0B', probability: 60 },
      { name: 'En examen', color: '#EC4899', probability: 70 },
      { name: 'Publicación', color: '#0EA5E9', probability: 85 },
      { name: 'Concedida', color: '#22C55E', probability: 100, is_won_stage: true },
      { name: 'Denegada', color: '#EF4444', probability: 0, is_lost_stage: true },
    ],
  },
} as const;
