import { 
  Shield, 
  Key, 
  User, 
  Globe, 
  Database, 
  Monitor 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SystemDefinition {
  id: string;
  name: string;
  vendor: string;
  description: string;
  logo?: string;
  color: string;
  supportedAuthTypes: string[];
  supportedEntities: string[];
  hasApi: boolean;
  apiDocs?: string;
  supportsWebhooks: boolean;
  supportsRealtime: boolean;
  estimatedSetupTime: string;
  popularity: number;
}

export const MIGRATION_SYSTEMS: Record<string, SystemDefinition> = {
  patsnap: {
    id: 'patsnap',
    name: 'PatSnap',
    vendor: 'PatSnap',
    description: 'Plataforma líder de inteligencia de patentes',
    color: '#1E88E5',
    supportedAuthTypes: ['oauth2', 'api_key'],
    supportedEntities: ['patents', 'trademarks', 'portfolios', 'searches'],
    hasApi: true,
    apiDocs: 'https://docs.patsnap.com/api',
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '5-10 min',
    popularity: 9
  },
  anaqua: {
    id: 'anaqua',
    name: 'Anaqua',
    vendor: 'Anaqua Inc.',
    description: 'Gestión integral de propiedad intelectual',
    color: '#00897B',
    supportedAuthTypes: ['oauth2', 'api_key', 'basic_auth'],
    supportedEntities: ['matters', 'contacts', 'deadlines', 'documents', 'costs'],
    hasApi: true,
    apiDocs: 'https://developer.anaqua.com',
    supportsWebhooks: true,
    supportsRealtime: true,
    estimatedSetupTime: '10-15 min',
    popularity: 8
  },
  cpa_global: {
    id: 'cpa_global',
    name: 'CPA Global',
    vendor: 'Clarivate (CPA Global)',
    description: 'Servicios de renovación y gestión de PI',
    color: '#5E35B1',
    supportedAuthTypes: ['api_key', 'session_cookie', 'agent'],
    supportedEntities: ['renewals', 'matters', 'deadlines', 'invoices'],
    hasApi: true,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '15-20 min',
    popularity: 7
  },
  dennemeyer: {
    id: 'dennemeyer',
    name: 'Dennemeyer',
    vendor: 'Dennemeyer Group',
    description: 'Servicios completos de PI',
    color: '#D32F2F',
    supportedAuthTypes: ['api_key', 'basic_auth', 'session_cookie'],
    supportedEntities: ['matters', 'renewals', 'deadlines', 'costs'],
    hasApi: true,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 6
  },
  ipan: {
    id: 'ipan',
    name: 'IPAN',
    vendor: 'IPAN Software',
    description: 'Software de gestión de PI para despachos',
    color: '#FF6F00',
    supportedAuthTypes: ['database', 'agent'],
    supportedEntities: ['matters', 'contacts', 'deadlines', 'documents', 'invoices'],
    hasApi: false,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '30-45 min (requiere agente)',
    popularity: 5
  },
  orbit: {
    id: 'orbit',
    name: 'Questel Orbit',
    vendor: 'Questel',
    description: 'Inteligencia y gestión de patentes',
    color: '#0277BD',
    supportedAuthTypes: ['oauth2', 'api_key'],
    supportedEntities: ['patents', 'trademarks', 'searches', 'alerts'],
    hasApi: true,
    apiDocs: 'https://www.questel.com/api',
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '5-10 min',
    popularity: 8
  },
  thomson_compumark: {
    id: 'thomson_compumark',
    name: 'Thomson CompuMark',
    vendor: 'Clarivate',
    description: 'Búsqueda y vigilancia de marcas',
    color: '#F57C00',
    supportedAuthTypes: ['api_key', 'oauth2'],
    supportedEntities: ['trademarks', 'searches', 'watches', 'reports'],
    hasApi: true,
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 7
  },
  corsearch: {
    id: 'corsearch',
    name: 'Corsearch',
    vendor: 'Corsearch',
    description: 'Protección de marca e IP',
    color: '#6A1B9A',
    supportedAuthTypes: ['api_key', 'oauth2'],
    supportedEntities: ['trademarks', 'domains', 'watches', 'enforcement'],
    hasApi: true,
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 6
  },
  darts_ip: {
    id: 'darts_ip',
    name: 'Darts-IP',
    vendor: 'Clarivate',
    description: 'Base de datos de litigios de PI',
    color: '#00ACC1',
    supportedAuthTypes: ['api_key', 'session_cookie'],
    supportedEntities: ['cases', 'decisions', 'parties', 'patents'],
    hasApi: true,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 5
  },
  clarivate: {
    id: 'clarivate',
    name: 'Clarivate IP',
    vendor: 'Clarivate',
    description: 'Suite completa de soluciones de PI',
    color: '#1565C0',
    supportedAuthTypes: ['oauth2', 'api_key'],
    supportedEntities: ['patents', 'trademarks', 'searches', 'analytics'],
    hasApi: true,
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 8
  },
  ipfolio: {
    id: 'ipfolio',
    name: 'IPfolio',
    vendor: 'CPA Global',
    description: 'Gestión de portafolio de PI en la nube',
    color: '#7B1FA2',
    supportedAuthTypes: ['api_key', 'oauth2'],
    supportedEntities: ['matters', 'contacts', 'deadlines', 'costs', 'documents'],
    hasApi: true,
    supportsWebhooks: true,
    supportsRealtime: false,
    estimatedSetupTime: '10-15 min',
    popularity: 6
  },
  filemaker: {
    id: 'filemaker',
    name: 'FileMaker',
    vendor: 'Claris (Apple)',
    description: 'Base de datos personalizada',
    color: '#424242',
    supportedAuthTypes: ['database', 'agent', 'api_key'],
    supportedEntities: ['custom'],
    hasApi: true,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '30-60 min',
    popularity: 4
  },
  custom_api: {
    id: 'custom_api',
    name: 'API Personalizada',
    vendor: 'Custom',
    description: 'Conectar a cualquier API REST/GraphQL',
    color: '#455A64',
    supportedAuthTypes: ['api_key', 'api_key_secret', 'bearer_token', 'oauth2', 'basic_auth'],
    supportedEntities: ['custom'],
    hasApi: true,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '30-60 min',
    popularity: 3
  },
  custom_db: {
    id: 'custom_db',
    name: 'Base de Datos Directa',
    vendor: 'Custom',
    description: 'Conectar a SQL Server, Oracle, MySQL, PostgreSQL',
    color: '#37474F',
    supportedAuthTypes: ['database', 'agent'],
    supportedEntities: ['custom'],
    hasApi: false,
    supportsWebhooks: false,
    supportsRealtime: false,
    estimatedSetupTime: '45-90 min (requiere agente)',
    popularity: 2
  }
};

export interface AuthTypeInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  fields: { 
    key: string; 
    label: string; 
    type: string; 
    required: boolean; 
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

export const AUTH_TYPE_INFO: Record<string, AuthTypeInfo> = {
  oauth2: {
    name: 'OAuth 2.0',
    description: 'Autorización segura sin compartir contraseñas',
    icon: Shield,
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true }
    ]
  },
  api_key: {
    name: 'API Key',
    description: 'Clave de API simple',
    icon: Key,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'base_url', label: 'URL Base (opcional)', type: 'url', required: false, placeholder: 'https://api.example.com' }
    ]
  },
  api_key_secret: {
    name: 'API Key + Secret',
    description: 'Par de clave y secreto',
    icon: Key,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
      { key: 'api_secret', label: 'API Secret', type: 'password', required: true }
    ]
  },
  basic_auth: {
    name: 'Usuario y Contraseña',
    description: 'Credenciales básicas de acceso',
    icon: User,
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true },
      { key: 'base_url', label: 'URL Base', type: 'url', required: true, placeholder: 'https://portal.example.com' }
    ]
  },
  bearer_token: {
    name: 'Token Bearer',
    description: 'Token de acceso directo',
    icon: Key,
    fields: [
      { key: 'token', label: 'Access Token', type: 'password', required: true },
      { key: 'base_url', label: 'URL Base', type: 'url', required: true }
    ]
  },
  session_cookie: {
    name: 'Sesión Web',
    description: 'Acceso vía portal web (scraping)',
    icon: Globe,
    fields: [
      { key: 'username', label: 'Usuario del portal', type: 'text', required: true },
      { key: 'password', label: 'Contraseña del portal', type: 'password', required: true },
      { key: 'login_url', label: 'URL de Login', type: 'url', required: true, placeholder: 'https://portal.example.com/login' }
    ]
  },
  database: {
    name: 'Base de Datos',
    description: 'Conexión directa a BD (requiere agente)',
    icon: Database,
    fields: [
      { 
        key: 'db_type', 
        label: 'Tipo de BD', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sqlserver', label: 'SQL Server' },
          { value: 'oracle', label: 'Oracle' },
          { value: 'mysql', label: 'MySQL' },
          { value: 'postgresql', label: 'PostgreSQL' },
          { value: 'sqlite', label: 'SQLite' },
          { value: 'access', label: 'Microsoft Access' }
        ]
      },
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: '192.168.1.100' },
      { key: 'port', label: 'Puerto', type: 'number', required: true },
      { key: 'database', label: 'Nombre de BD', type: 'text', required: true },
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true }
    ]
  },
  agent: {
    name: 'Agente de Escritorio',
    description: 'Vía aplicación instalada en tu red',
    icon: Monitor,
    fields: []
  }
};

export const DATABASE_TYPES = [
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'access', label: 'Microsoft Access' }
];
