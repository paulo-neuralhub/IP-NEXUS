export const WATCHLIST_TYPES = {
  trademark: { label: 'Marcas', icon: 'Stamp', description: 'Vigilar nuevas solicitudes de marcas similares' },
  patent: { label: 'Patentes', icon: 'Lightbulb', description: 'Vigilar patentes relacionadas' },
  domain: { label: 'Dominios', icon: 'Globe', description: 'Vigilar registros de dominios similares' },
  web: { label: 'Web', icon: 'Search', description: 'Vigilar menciones en sitios web' },
  social: { label: 'Redes Sociales', icon: 'Share2', description: 'Vigilar menciones en redes sociales' },
  marketplace: { label: 'Marketplaces', icon: 'ShoppingBag', description: 'Vigilar productos en Amazon, eBay, etc.' },
} as const;

export const RESULT_TYPES = {
  trademark_filing: { label: 'Solicitud de marca', icon: 'FileText', color: '#3B82F6' },
  trademark_published: { label: 'Marca publicada', icon: 'Bell', color: '#F59E0B' },
  patent_filing: { label: 'Solicitud de patente', icon: 'Lightbulb', color: '#8B5CF6' },
  domain_registered: { label: 'Dominio registrado', icon: 'Globe', color: '#0EA5E9' },
  web_mention: { label: 'Mención web', icon: 'Search', color: '#22C55E' },
  social_mention: { label: 'Mención social', icon: 'Share2', color: '#EC4899' },
  marketplace_listing: { label: 'Producto en marketplace', icon: 'ShoppingBag', color: '#F97316' },
  similar_logo: { label: 'Logo similar', icon: 'Image', color: '#6366F1' },
  renewal_due: { label: 'Renovación pendiente', icon: 'RefreshCw', color: '#EAB308' },
  opposition_window: { label: 'Ventana de oposición', icon: 'AlertTriangle', color: '#EF4444' },
} as const;

export const RESULT_STATUSES = {
  new: { label: 'Nuevo', color: '#3B82F6' },
  reviewing: { label: 'En revisión', color: '#F59E0B' },
  threat: { label: 'Amenaza', color: '#EF4444' },
  dismissed: { label: 'Descartado', color: '#6B7280' },
  actioned: { label: 'Accionado', color: '#22C55E' },
} as const;

export const RESULT_PRIORITIES = {
  low: { label: 'Baja', color: '#94A3B8', icon: 'ArrowDown' },
  medium: { label: 'Media', color: '#3B82F6', icon: 'Minus' },
  high: { label: 'Alta', color: '#F59E0B', icon: 'ArrowUp' },
  critical: { label: 'Crítica', color: '#EF4444', icon: 'AlertTriangle' },
} as const;

export const ALERT_TYPES = {
  new_conflict: { label: 'Nuevo conflicto', icon: 'AlertCircle', color: '#EF4444' },
  opposition_window: { label: 'Ventana de oposición', icon: 'Clock', color: '#F59E0B' },
  deadline_approaching: { label: 'Plazo próximo', icon: 'Calendar', color: '#F97316' },
  high_similarity: { label: 'Alta similitud', icon: 'Copy', color: '#8B5CF6' },
  renewal_due: { label: 'Renovación pendiente', icon: 'RefreshCw', color: '#0EA5E9' },
  status_change: { label: 'Cambio de estado', icon: 'ArrowRightCircle', color: '#22C55E' },
  web_mention: { label: 'Mención web', icon: 'Search', color: '#EC4899' },
  domain_alert: { label: 'Alerta de dominio', icon: 'Globe', color: '#6366F1' },
  infringement: { label: 'Posible infracción', icon: 'ShieldAlert', color: '#DC2626' },
} as const;

export const ALERT_SEVERITIES = {
  low: { label: 'Baja', color: '#94A3B8' },
  medium: { label: 'Media', color: '#3B82F6' },
  high: { label: 'Alta', color: '#F59E0B' },
  critical: { label: 'Crítica', color: '#EF4444' },
} as const;

export const ALERT_STATUSES = {
  unread: { label: 'Sin leer', color: '#3B82F6' },
  read: { label: 'Leída', color: '#6B7280' },
  actioned: { label: 'Accionada', color: '#22C55E' },
  dismissed: { label: 'Descartada', color: '#94A3B8' },
} as const;

export const DEADLINE_TYPES = {
  opposition: { label: 'Oposición', icon: 'Shield', days_typical: 90 },
  renewal: { label: 'Renovación', icon: 'RefreshCw', days_typical: 365 },
  response: { label: 'Respuesta oficina', icon: 'MessageSquare', days_typical: 60 },
  priority: { label: 'Prioridad', icon: 'Flag', days_typical: 180 },
  pct_entry: { label: 'Entrada PCT', icon: 'Globe', days_typical: 365 },
  annuity: { label: 'Anualidad', icon: 'Calendar', days_typical: 365 },
  use_proof: { label: 'Prueba de uso', icon: 'FileCheck', days_typical: 1825 },
  custom: { label: 'Personalizado', icon: 'Settings', days_typical: 30 },
} as const;

export const DEADLINE_STATUSES = {
  pending: { label: 'Pendiente', color: '#3B82F6' },
  completed: { label: 'Completado', color: '#22C55E' },
  missed: { label: 'Vencido', color: '#EF4444' },
  cancelled: { label: 'Cancelado', color: '#6B7280' },
} as const;

export const SIMILARITY_THRESHOLDS = {
  low: { min: 0, max: 50, label: 'Baja similitud', color: '#22C55E' },
  medium: { min: 50, max: 70, label: 'Similitud media', color: '#F59E0B' },
  high: { min: 70, max: 85, label: 'Alta similitud', color: '#F97316' },
  critical: { min: 85, max: 100, label: 'Similitud crítica', color: '#EF4444' },
} as const;

export const RUN_FREQUENCIES = {
  hourly: { label: 'Cada hora', value: 'hourly' },
  daily: { label: 'Diario', value: 'daily' },
  weekly: { label: 'Semanal', value: 'weekly' },
  monthly: { label: 'Mensual', value: 'monthly' },
} as const;

export const NOTIFY_FREQUENCIES = {
  instant: { label: 'Instantáneo', value: 'instant' },
  daily: { label: 'Resumen diario', value: 'daily' },
  weekly: { label: 'Resumen semanal', value: 'weekly' },
} as const;

export const NICE_CLASSES_LABELS: Record<number, string> = {
  1: 'Productos químicos',
  2: 'Pinturas y barnices',
  3: 'Cosméticos y limpieza',
  4: 'Lubricantes y combustibles',
  5: 'Productos farmacéuticos',
  6: 'Metales comunes',
  7: 'Máquinas y herramientas',
  8: 'Herramientas manuales',
  9: 'Aparatos electrónicos',
  10: 'Aparatos médicos',
  11: 'Aparatos de iluminación',
  12: 'Vehículos',
  13: 'Armas de fuego',
  14: 'Joyería y relojería',
  15: 'Instrumentos musicales',
  16: 'Papel y artículos oficina',
  17: 'Caucho y plástico',
  18: 'Cuero y marroquinería',
  19: 'Materiales construcción',
  20: 'Muebles',
  21: 'Utensilios cocina',
  22: 'Cuerdas y redes',
  23: 'Hilos textiles',
  24: 'Tejidos',
  25: 'Prendas de vestir',
  26: 'Mercería',
  27: 'Alfombras y tapices',
  28: 'Juegos y juguetes',
  29: 'Alimentos (carne, etc.)',
  30: 'Alimentos (café, etc.)',
  31: 'Productos agrícolas',
  32: 'Cerveza y bebidas',
  33: 'Bebidas alcohólicas',
  34: 'Tabaco',
  35: 'Publicidad y negocios',
  36: 'Seguros y finanzas',
  37: 'Construcción y reparación',
  38: 'Telecomunicaciones',
  39: 'Transporte',
  40: 'Tratamiento de materiales',
  41: 'Educación y entretenimiento',
  42: 'Servicios científicos y tecnológicos',
  43: 'Restauración y alojamiento',
  44: 'Servicios médicos',
  45: 'Servicios jurídicos y seguridad',
};

// Helper to get similarity level from score
export function getSimilarityLevel(score: number): keyof typeof SIMILARITY_THRESHOLDS {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Helper to get days until deadline
export function getDaysUntilDeadline(deadlineDate: string): number {
  const deadline = new Date(deadlineDate);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to get deadline urgency
export function getDeadlineUrgency(daysRemaining: number): 'critical' | 'high' | 'medium' | 'low' {
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 30) return 'high';
  if (daysRemaining <= 90) return 'medium';
  return 'low';
}
