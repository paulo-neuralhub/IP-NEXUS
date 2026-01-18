import { FileSpreadsheet, Users, Clock, DollarSign, FileText, RefreshCw, Globe, Building2, Search } from 'lucide-react';

export const IMPORT_TYPES = {
  matters: { 
    label: 'Expedientes', 
    icon: FileSpreadsheet, 
    color: '#3B82F6',
    description: 'Importar expedientes de PI' 
  },
  contacts: { 
    label: 'Contactos', 
    icon: Users, 
    color: '#22C55E',
    description: 'Importar contactos y empresas' 
  },
  deadlines: { 
    label: 'Plazos', 
    icon: Clock, 
    color: '#F59E0B',
    description: 'Importar plazos y fechas límite' 
  },
  costs: { 
    label: 'Costes', 
    icon: DollarSign, 
    color: '#8B5CF6',
    description: 'Importar costes y gastos' 
  },
  documents: { 
    label: 'Documentos', 
    icon: FileText, 
    color: '#EC4899',
    description: 'Importar metadatos de documentos' 
  },
  renewals: { 
    label: 'Renovaciones', 
    icon: RefreshCw, 
    color: '#06B6D4',
    description: 'Importar calendario de renovaciones' 
  },
} as const;

export const SOURCE_TYPES = {
  excel: { label: 'Excel (.xlsx)', accept: '.xlsx,.xls', icon: FileSpreadsheet },
  csv: { label: 'CSV', accept: '.csv', icon: FileText },
  json: { label: 'JSON', accept: '.json', icon: FileText },
} as const;

export const CONNECTOR_TYPES = {
  euipo: { 
    label: 'EUIPO', 
    description: 'European Union Intellectual Property Office',
    region: 'EU',
    icon: Globe,
    color: '#003399'
  },
  wipo: { 
    label: 'WIPO', 
    description: 'World Intellectual Property Organization',
    region: 'International',
    icon: Globe,
    color: '#00A0DC'
  },
  tmview: { 
    label: 'TMView', 
    description: 'Trademark View Database',
    region: 'EU',
    icon: Search,
    color: '#6B21A8'
  },
  oepm: { 
    label: 'OEPM', 
    description: 'Oficina Española de Patentes y Marcas',
    region: 'España',
    icon: Building2,
    color: '#AA151B'
  },
  epo: { 
    label: 'EPO', 
    description: 'European Patent Office',
    region: 'EU',
    icon: Building2,
    color: '#004A93'
  },
  uspto: { 
    label: 'USPTO', 
    description: 'United States Patent and Trademark Office',
    region: 'USA',
    icon: Building2,
    color: '#112E51'
  },
  ukipo: { 
    label: 'UKIPO', 
    description: 'UK Intellectual Property Office',
    region: 'UK',
    icon: Building2,
    color: '#012169'
  },
  inpi_es: {
    label: 'INPI',
    description: 'Institut National de la Propriété Industrielle',
    region: 'France',
    icon: Building2,
    color: '#002654'
  },
  custom_api: {
    label: 'API Personalizada',
    description: 'Conexión a API REST personalizada',
    region: 'Custom',
    icon: Globe,
    color: '#6B7280'
  }
} as const;

export const IMPORT_STATUSES = {
  pending: { label: 'Pendiente', color: '#6B7280', bgColor: '#F3F4F6' },
  validating: { label: 'Validando', color: '#3B82F6', bgColor: '#DBEAFE' },
  validated: { label: 'Validado', color: '#22C55E', bgColor: '#DCFCE7' },
  importing: { label: 'Importando', color: '#F59E0B', bgColor: '#FEF3C7' },
  completed: { label: 'Completado', color: '#22C55E', bgColor: '#DCFCE7' },
  failed: { label: 'Error', color: '#EF4444', bgColor: '#FEE2E2' },
  cancelled: { label: 'Cancelado', color: '#6B7280', bgColor: '#F3F4F6' },
} as const;

export const SYNC_STATUSES = {
  pending: { label: 'Pendiente', color: '#6B7280', bgColor: '#F3F4F6' },
  running: { label: 'Ejecutando', color: '#3B82F6', bgColor: '#DBEAFE' },
  completed: { label: 'Completado', color: '#22C55E', bgColor: '#DCFCE7' },
  failed: { label: 'Error', color: '#EF4444', bgColor: '#FEE2E2' },
  cancelled: { label: 'Cancelado', color: '#6B7280', bgColor: '#F3F4F6' },
} as const;

export const CONNECTION_STATUSES = {
  connected: { label: 'Conectado', color: '#22C55E', bgColor: '#DCFCE7' },
  disconnected: { label: 'Desconectado', color: '#6B7280', bgColor: '#F3F4F6' },
  error: { label: 'Error', color: '#EF4444', bgColor: '#FEE2E2' },
  unknown: { label: 'Desconocido', color: '#6B7280', bgColor: '#F3F4F6' },
} as const;

export const SYNC_FREQUENCIES = {
  manual: { label: 'Manual', description: 'Solo sincronización manual' },
  hourly: { label: 'Cada hora', description: 'Sincronizar cada hora' },
  daily: { label: 'Diario', description: 'Sincronizar una vez al día' },
  weekly: { label: 'Semanal', description: 'Sincronizar una vez a la semana' },
  monthly: { label: 'Mensual', description: 'Sincronizar una vez al mes' },
} as const;

export const FIELD_TRANSFORMS = {
  ip_type_map: {
    'marca': 'trademark',
    'trademark': 'trademark',
    'patente': 'patent',
    'patent': 'patent',
    'diseño': 'design',
    'design': 'design',
    'copyright': 'copyright',
    'dominio': 'domain',
    'domain': 'domain',
  },
  status_map: {
    'activo': 'active',
    'active': 'active',
    'pendiente': 'pending',
    'pending': 'pending',
    'registrado': 'registered',
    'registered': 'registered',
  },
} as const;

// Matter field options for mapping
export const MATTER_FIELD_OPTIONS = [
  { value: 'reference', label: 'Referencia', required: true },
  { value: 'title', label: 'Título', required: true },
  { value: 'ip_type', label: 'Tipo de PI' },
  { value: 'status', label: 'Estado' },
  { value: 'client_name', label: 'Cliente' },
  { value: 'filing_date', label: 'Fecha de presentación' },
  { value: 'filing_number', label: 'Número de solicitud' },
  { value: 'registration_date', label: 'Fecha de registro' },
  { value: 'registration_number', label: 'Número de registro' },
  { value: 'expiry_date', label: 'Fecha de vencimiento' },
  { value: 'classes', label: 'Clases' },
  { value: 'jurisdictions', label: 'Jurisdicciones' },
  { value: 'notes', label: 'Notas' },
] as const;

export const CONTACT_FIELD_OPTIONS = [
  { value: 'name', label: 'Nombre', required: true },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'company_name', label: 'Empresa' },
  { value: 'job_title', label: 'Cargo' },
  { value: 'address_line1', label: 'Dirección' },
  { value: 'city', label: 'Ciudad' },
  { value: 'country', label: 'País' },
  { value: 'notes', label: 'Notas' },
] as const;
