export const REPORT_TYPES = {
  portfolio_summary: { 
    label: 'Resumen de Cartera', 
    icon: 'Briefcase',
    description: 'Vista general de todos los activos de PI'
  },
  matter_detail: { 
    label: 'Ficha de Expediente', 
    icon: 'FileText',
    description: 'Informe detallado de un expediente'
  },
  deadline_report: { 
    label: 'Informe de Plazos', 
    icon: 'Clock',
    description: 'Plazos próximos y vencidos'
  },
  renewal_forecast: { 
    label: 'Previsión de Renovaciones', 
    icon: 'RefreshCw',
    description: 'Renovaciones y costes previstos'
  },
  cost_analysis: { 
    label: 'Análisis de Costes', 
    icon: 'DollarSign',
    description: 'Desglose detallado de costes'
  },
  client_report: { 
    label: 'Informe para Cliente', 
    icon: 'Users',
    description: 'Resumen para enviar a cliente'
  },
  invoice_summary: { 
    label: 'Resumen de Facturación', 
    icon: 'FileText',
    description: 'Estado de facturación'
  },
  activity_log: { 
    label: 'Registro de Actividad', 
    icon: 'Activity',
    description: 'Historial de acciones'
  },
  conflict_analysis: { 
    label: 'Análisis de Conflictos', 
    icon: 'AlertTriangle',
    description: 'Marcas en conflicto potencial'
  },
  valuation_report: { 
    label: 'Informe de Valoración', 
    icon: 'TrendingUp',
    description: 'Valoración de cartera'
  },
  custom: {
    label: 'Personalizado',
    icon: 'Settings',
    description: 'Informe personalizado'
  },
} as const;

export const REPORT_STATUSES = {
  pending: { label: 'Pendiente', color: '#6B7280' },
  generating: { label: 'Generando', color: '#3B82F6' },
  completed: { label: 'Completado', color: '#22C55E' },
  failed: { label: 'Error', color: '#EF4444' },
} as const;

export const SCHEDULE_TYPES = {
  daily: { label: 'Diario', description: 'Todos los días' },
  weekly: { label: 'Semanal', description: 'Una vez a la semana' },
  monthly: { label: 'Mensual', description: 'Una vez al mes' },
  quarterly: { label: 'Trimestral', description: 'Cada 3 meses' },
  yearly: { label: 'Anual', description: 'Una vez al año' },
} as const;

export const DASHBOARD_TYPES = {
  executive: { label: 'Ejecutivo', description: 'KPIs de alto nivel', icon: 'BarChart3' },
  operations: { label: 'Operaciones', description: 'Día a día', icon: 'Settings' },
  financial: { label: 'Financiero', description: 'Costes y facturación', icon: 'DollarSign' },
  client: { label: 'Cliente', description: 'Vista para clientes', icon: 'Users' },
  custom: { label: 'Personalizado', description: 'Diseño propio', icon: 'Layout' },
} as const;

export const WIDGET_TYPES = {
  stat_card: { label: 'Tarjeta', icon: 'Square' },
  chart: { label: 'Gráfico', icon: 'BarChart' },
  table: { label: 'Tabla', icon: 'Table' },
  list: { label: 'Lista', icon: 'List' },
  calendar: { label: 'Calendario', icon: 'Calendar' },
  map: { label: 'Mapa', icon: 'Map' },
  progress: { label: 'Progreso', icon: 'Activity' },
  timeline: { label: 'Timeline', icon: 'GitBranch' },
  custom: { label: 'Personalizado', icon: 'Settings' },
} as const;

export const CHART_TYPES = {
  line: { label: 'Líneas', icon: 'TrendingUp' },
  bar: { label: 'Barras', icon: 'BarChart' },
  pie: { label: 'Circular', icon: 'PieChart' },
  donut: { label: 'Donut', icon: 'Circle' },
  area: { label: 'Área', icon: 'Activity' },
} as const;

export const EXPORT_TYPES = {
  matters: { label: 'Expedientes', icon: 'Briefcase' },
  contacts: { label: 'Contactos', icon: 'Users' },
  deadlines: { label: 'Plazos', icon: 'Clock' },
  invoices: { label: 'Facturas', icon: 'FileText' },
  costs: { label: 'Costes', icon: 'DollarSign' },
  renewals: { label: 'Renovaciones', icon: 'RefreshCw' },
  audit_logs: { label: 'Auditoría', icon: 'FileText' },
  custom: { label: 'Personalizado', icon: 'Settings' },
} as const;

export const EXPORT_FORMATS = {
  xlsx: { label: 'Excel (.xlsx)', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  csv: { label: 'CSV (.csv)', mime: 'text/csv' },
  json: { label: 'JSON (.json)', mime: 'application/json' },
  pdf: { label: 'PDF (.pdf)', mime: 'application/pdf' },
} as const;

export const DATE_RANGES = {
  today: { label: 'Hoy', days: 0 },
  last_7_days: { label: 'Últimos 7 días', days: 7 },
  last_30_days: { label: 'Últimos 30 días', days: 30 },
  last_90_days: { label: 'Últimos 90 días', days: 90 },
  this_month: { label: 'Este mes', days: null },
  last_month: { label: 'Mes anterior', days: null },
  this_quarter: { label: 'Este trimestre', days: null },
  this_year: { label: 'Este año', days: null },
  last_year: { label: 'Año anterior', days: null },
  all_time: { label: 'Todo', days: null },
} as const;

export const CHART_COLORS = [
  '#EC4899', // Primary pink
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Deep orange
  '#6366F1', // Indigo
];

export const REPORT_SECTIONS = {
  header: 'Cabecera',
  cover: 'Portada',
  summary: 'Resumen',
  summary_stats: 'Estadísticas resumen',
  by_type: 'Por tipo',
  by_status: 'Por estado',
  by_jurisdiction: 'Por jurisdicción',
  by_month: 'Por mes',
  by_matter: 'Por expediente',
  urgent: 'Urgentes',
  this_week: 'Esta semana',
  this_month: 'Este mes',
  next_quarter: 'Próximo trimestre',
  active_matters: 'Expedientes activos',
  pending_actions: 'Acciones pendientes',
  costs_summary: 'Resumen de costes',
  cost_forecast: 'Previsión de costes',
  basic_info: 'Información básica',
  timeline: 'Línea de tiempo',
  documents: 'Documentos',
  costs: 'Costes',
  notes: 'Notas',
  trends: 'Tendencias',
  footer: 'Pie de página',
} as const;
