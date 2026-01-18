export const API_SCOPES = {
  read: { label: 'Lectura', description: 'Leer todos los datos' },
  write: { label: 'Escritura', description: 'Crear y actualizar datos' },
  delete: { label: 'Eliminar', description: 'Eliminar datos' },
  admin: { label: 'Administración', description: 'Acceso completo' },
  'matters:read': { label: 'Expedientes (lectura)', description: 'Leer expedientes' },
  'matters:write': { label: 'Expedientes (escritura)', description: 'Crear/editar expedientes' },
  'contacts:read': { label: 'Contactos (lectura)', description: 'Leer contactos' },
  'contacts:write': { label: 'Contactos (escritura)', description: 'Crear/editar contactos' },
  'deadlines:read': { label: 'Plazos (lectura)', description: 'Leer plazos' },
  'deadlines:write': { label: 'Plazos (escritura)', description: 'Crear/editar plazos' },
  'documents:read': { label: 'Documentos (lectura)', description: 'Leer documentos' },
  'documents:write': { label: 'Documentos (escritura)', description: 'Subir documentos' },
  'invoices:read': { label: 'Facturas (lectura)', description: 'Leer facturas' },
  'invoices:write': { label: 'Facturas (escritura)', description: 'Crear/editar facturas' },
} as const;

export const WEBHOOK_EVENTS = {
  'matter.created': { label: 'Expediente creado', category: 'matters' },
  'matter.updated': { label: 'Expediente actualizado', category: 'matters' },
  'matter.deleted': { label: 'Expediente eliminado', category: 'matters' },
  'deadline.created': { label: 'Plazo creado', category: 'deadlines' },
  'deadline.completed': { label: 'Plazo completado', category: 'deadlines' },
  'deadline.overdue': { label: 'Plazo vencido', category: 'deadlines' },
  'contact.created': { label: 'Contacto creado', category: 'contacts' },
  'contact.updated': { label: 'Contacto actualizado', category: 'contacts' },
  'invoice.created': { label: 'Factura creada', category: 'invoices' },
  'invoice.paid': { label: 'Factura pagada', category: 'invoices' },
  'document.uploaded': { label: 'Documento subido', category: 'documents' },
  'renewal.due': { label: 'Renovación pendiente', category: 'renewals' },
  'renewal.completed': { label: 'Renovación completada', category: 'renewals' },
  'watch_alert.created': { label: 'Alerta de vigilancia', category: 'spider' },
} as const;

export const WEBHOOK_EVENT_CATEGORIES = {
  matters: { label: 'Expedientes', icon: 'Briefcase' },
  deadlines: { label: 'Plazos', icon: 'Clock' },
  contacts: { label: 'Contactos', icon: 'Users' },
  invoices: { label: 'Facturas', icon: 'FileText' },
  documents: { label: 'Documentos', icon: 'File' },
  renewals: { label: 'Renovaciones', icon: 'RefreshCw' },
  spider: { label: 'Vigilancia', icon: 'Eye' },
} as const;

export const RATE_LIMITS_BY_PLAN = {
  free: { per_minute: 20, per_day: 1000 },
  starter: { per_minute: 30, per_day: 3000 },
  professional: { per_minute: 60, per_day: 10000 },
  business: { per_minute: 120, per_day: 50000 },
  enterprise: { per_minute: 300, per_day: 200000 },
} as const;

export const API_KEY_STATUS_CONFIG = {
  active: { label: 'Activa', color: 'success' },
  expired: { label: 'Expirada', color: 'warning' },
  revoked: { label: 'Revocada', color: 'destructive' },
} as const;

export const WEBHOOK_DELIVERY_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'default' },
  delivered: { label: 'Entregado', color: 'success' },
  failed: { label: 'Fallido', color: 'destructive' },
  retrying: { label: 'Reintentando', color: 'warning' },
} as const;
