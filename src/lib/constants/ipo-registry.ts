// src/lib/constants/ipo-registry.ts
// IPO Master Registry Constants

import { OfficeTier, OfficeType, ConnectionMethodType, HealthStatus, IPType } from '@/types/ipo-registry.types';

export const OFFICE_TIERS: Record<OfficeTier, { label: string; description: string; color: string }> = {
  1: { label: 'Tier 1', description: 'Críticas', color: 'bg-purple-100 text-purple-700' },
  2: { label: 'Tier 2', description: 'Importantes', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Tier 3', description: 'Secundarias', color: 'bg-gray-100 text-gray-700' },
};

export const OFFICE_TYPES: Record<OfficeType, string> = {
  national: 'Nacional',
  regional: 'Regional',
  international: 'Internacional',
};

export const CONNECTION_METHOD_TYPES: Record<ConnectionMethodType, { label: string; icon: string; description: string }> = {
  api: { label: 'API', icon: 'Plug', description: 'Conexión directa via API REST/GraphQL' },
  scraper: { label: 'Scraper', icon: 'Globe', description: 'Extracción web automatizada' },
  bulk_ftp: { label: 'Bulk FTP', icon: 'HardDrive', description: 'Descarga masiva via FTP/SFTP' },
  bulk_http: { label: 'Bulk HTTP', icon: 'Download', description: 'Descarga masiva via HTTP' },
  manual: { label: 'Manual', icon: 'Hand', description: 'Actualización manual' },
};

export const HEALTH_STATUS_CONFIG: Record<HealthStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  healthy: { label: 'Online', color: 'text-green-600', bgColor: 'bg-green-500', icon: 'CheckCircle' },
  degraded: { label: 'Degradado', color: 'text-yellow-600', bgColor: 'bg-yellow-500', icon: 'AlertCircle' },
  unhealthy: { label: 'Caído', color: 'text-red-600', bgColor: 'bg-red-500', icon: 'XCircle' },
  unknown: { label: 'Desconocido', color: 'text-gray-500', bgColor: 'bg-gray-400', icon: 'HelpCircle' },
};

export const IP_TYPES_CONFIG: Record<IPType, { label: string; color: string }> = {
  trademark: { label: 'Marcas', color: 'bg-blue-100 text-blue-700' },
  patent: { label: 'Patentes', color: 'bg-green-100 text-green-700' },
  design: { label: 'Diseños', color: 'bg-purple-100 text-purple-700' },
  copyright: { label: 'Derechos de Autor', color: 'bg-orange-100 text-orange-700' },
};

export const REGIONS = [
  { value: 'europe', label: 'Europa' },
  { value: 'north_america', label: 'Norteamérica' },
  { value: 'latin_america', label: 'Latinoamérica' },
  { value: 'asia_pacific', label: 'Asia Pacífico' },
  { value: 'middle_east', label: 'Oriente Medio' },
  { value: 'africa', label: 'África' },
  { value: 'oceania', label: 'Oceanía' },
];

export const AUTH_TYPES = [
  { value: 'none', label: 'Sin autenticación' },
  { value: 'api_key', label: 'API Key' },
  { value: 'oauth2', label: 'OAuth 2.0' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'mtls', label: 'mTLS (Certificado)' },
  { value: 'custom', label: 'Personalizado' },
];

export const FEE_TYPES = [
  { value: 'application', label: 'Solicitud' },
  { value: 'registration', label: 'Registro' },
  { value: 'renewal', label: 'Renovación' },
  { value: 'opposition', label: 'Oposición' },
  { value: 'appeal', label: 'Recurso' },
  { value: 'restoration', label: 'Restauración' },
  { value: 'assignment', label: 'Cesión' },
  { value: 'license_recordal', label: 'Inscripción de Licencia' },
  { value: 'search', label: 'Búsqueda' },
  { value: 'certificate', label: 'Certificado' },
];

export const DEADLINE_TYPES = [
  { value: 'opposition_period', label: 'Período de Oposición' },
  { value: 'response_office_action', label: 'Respuesta a Office Action' },
  { value: 'renewal', label: 'Renovación' },
  { value: 'use_declaration', label: 'Declaración de Uso' },
  { value: 'priority_claim', label: 'Reivindicación de Prioridad' },
  { value: 'appeal', label: 'Recurso' },
  { value: 'restoration', label: 'Restauración' },
  { value: 'publication_observation', label: 'Observaciones a Publicación' },
];

export const TRIGGER_EVENTS = [
  { value: 'application', label: 'Fecha de Solicitud' },
  { value: 'publication', label: 'Fecha de Publicación' },
  { value: 'registration', label: 'Fecha de Registro' },
  { value: 'grant', label: 'Fecha de Concesión' },
  { value: 'office_action', label: 'Office Action' },
  { value: 'priority_date', label: 'Fecha de Prioridad' },
];

export const KNOWLEDGE_TYPES = [
  { value: 'trademark_law', label: 'Ley de Marcas' },
  { value: 'patent_law', label: 'Ley de Patentes' },
  { value: 'design_law', label: 'Ley de Diseños' },
  { value: 'examination_guide', label: 'Guía de Examen' },
  { value: 'fee_schedule', label: 'Tabla de Tasas' },
  { value: 'filing_requirements', label: 'Requisitos de Presentación' },
  { value: 'deadline_rules', label: 'Reglas de Plazos' },
  { value: 'classification_notes', label: 'Notas de Clasificación' },
  { value: 'practice_notes', label: 'Notas Prácticas' },
];

export const ALERT_TYPES = [
  { value: 'connection_down', label: 'Conexión Caída', severity: 'error' },
  { value: 'sync_failed', label: 'Sync Fallida', severity: 'error' },
  { value: 'credential_expiring', label: 'Credencial por Expirar', severity: 'warning' },
  { value: 'subscription_expiring', label: 'Suscripción por Expirar', severity: 'warning' },
  { value: 'fee_changed', label: 'Tasa Modificada', severity: 'info' },
  { value: 'law_changed', label: 'Legislación Modificada', severity: 'info' },
  { value: 'high_error_rate', label: 'Tasa de Error Alta', severity: 'warning' },
  { value: 'scraper_broken', label: 'Scraper Roto', severity: 'error' },
  { value: 'failover_triggered', label: 'Failover Activado', severity: 'warning' },
  { value: 'all_methods_failed', label: 'Todos los Métodos Fallaron', severity: 'critical' },
];

// Seed data for major IP offices
export const MAJOR_IP_OFFICES = [
  // Tier 1 - Critical
  { code: 'US', code_alt: 'USPTO', name_official: 'United States Patent and Trademark Office', name_short: 'USPTO', country_code: 'US', region: 'north_america', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'America/New_York', languages: ['en'], currency: 'USD', tier: 1, website_official: 'https://www.uspto.gov', website_search: 'https://tmsearch.uspto.gov' },
  { code: 'EM', code_alt: 'EUIPO', name_official: 'European Union Intellectual Property Office', name_short: 'EUIPO', country_code: null, region: 'europe', office_type: 'regional', ip_types: ['trademark', 'design'], timezone: 'Europe/Madrid', languages: ['en', 'es', 'de', 'fr', 'it'], currency: 'EUR', tier: 1, website_official: 'https://euipo.europa.eu', website_search: 'https://euipo.europa.eu/eSearch/' },
  { code: 'WO', code_alt: 'WIPO', name_official: 'World Intellectual Property Organization', name_short: 'WIPO', country_code: null, region: 'europe', office_type: 'international', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/Zurich', languages: ['en', 'es', 'fr', 'ar', 'zh', 'ru'], currency: 'CHF', tier: 1, website_official: 'https://www.wipo.int', website_search: 'https://www.wipo.int/madrid/monitor/' },
  { code: 'CN', code_alt: 'CNIPA', name_official: 'China National Intellectual Property Administration', name_short: 'CNIPA', country_code: 'CN', region: 'asia_pacific', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Asia/Shanghai', languages: ['zh', 'en'], currency: 'CNY', tier: 1, website_official: 'https://english.cnipa.gov.cn', website_search: 'https://wsjs.saic.gov.cn' },
  
  // Tier 2 - Important
  { code: 'ES', code_alt: 'OEPM', name_official: 'Oficina Española de Patentes y Marcas', name_short: 'OEPM', country_code: 'ES', region: 'europe', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/Madrid', languages: ['es'], currency: 'EUR', tier: 2, website_official: 'https://www.oepm.es', website_search: 'https://consultas2.oepm.es/LocalizadorWeb/' },
  { code: 'GB', code_alt: 'UKIPO', name_official: 'UK Intellectual Property Office', name_short: 'UKIPO', country_code: 'GB', region: 'europe', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/London', languages: ['en'], currency: 'GBP', tier: 2, website_official: 'https://www.gov.uk/government/organisations/intellectual-property-office', website_search: 'https://trademarks.ipo.gov.uk/ipo-tmcase' },
  { code: 'JP', code_alt: 'JPO', name_official: 'Japan Patent Office', name_short: 'JPO', country_code: 'JP', region: 'asia_pacific', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Asia/Tokyo', languages: ['ja', 'en'], currency: 'JPY', tier: 2, website_official: 'https://www.jpo.go.jp', website_search: 'https://www.j-platpat.inpit.go.jp' },
  { code: 'KR', code_alt: 'KIPO', name_official: 'Korean Intellectual Property Office', name_short: 'KIPO', country_code: 'KR', region: 'asia_pacific', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Asia/Seoul', languages: ['ko', 'en'], currency: 'KRW', tier: 2, website_official: 'https://www.kipo.go.kr', website_search: 'http://eng.kipris.or.kr' },
  { code: 'DE', code_alt: 'DPMA', name_official: 'Deutsches Patent- und Markenamt', name_short: 'DPMA', country_code: 'DE', region: 'europe', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/Berlin', languages: ['de'], currency: 'EUR', tier: 2, website_official: 'https://www.dpma.de', website_search: 'https://register.dpma.de' },
  { code: 'FR', code_alt: 'INPI', name_official: 'Institut National de la Propriété Industrielle', name_short: 'INPI France', country_code: 'FR', region: 'europe', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/Paris', languages: ['fr'], currency: 'EUR', tier: 2, website_official: 'https://www.inpi.fr', website_search: 'https://bases-marques.inpi.fr' },
  
  // Tier 3 - Secondary (sample)
  { code: 'IT', code_alt: 'UIBM', name_official: 'Ufficio Italiano Brevetti e Marchi', name_short: 'UIBM', country_code: 'IT', region: 'europe', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Europe/Rome', languages: ['it'], currency: 'EUR', tier: 3, website_official: 'https://uibm.mise.gov.it', website_search: 'https://uibm.mise.gov.it/bancadati/' },
  { code: 'BR', code_alt: 'INPI-BR', name_official: 'Instituto Nacional da Propriedade Industrial', name_short: 'INPI Brasil', country_code: 'BR', region: 'latin_america', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'America/Sao_Paulo', languages: ['pt'], currency: 'BRL', tier: 3, website_official: 'https://www.gov.br/inpi', website_search: 'https://busca.inpi.gov.br' },
  { code: 'MX', code_alt: 'IMPI', name_official: 'Instituto Mexicano de la Propiedad Industrial', name_short: 'IMPI', country_code: 'MX', region: 'latin_america', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'America/Mexico_City', languages: ['es'], currency: 'MXN', tier: 3, website_official: 'https://www.gob.mx/impi', website_search: 'https://marcanet.impi.gob.mx' },
  { code: 'AU', code_alt: 'IP Australia', name_official: 'IP Australia', name_short: 'IP Australia', country_code: 'AU', region: 'oceania', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Australia/Sydney', languages: ['en'], currency: 'AUD', tier: 3, website_official: 'https://www.ipaustralia.gov.au', website_search: 'https://search.ipaustralia.gov.au/trademarks/search/' },
  { code: 'CA', code_alt: 'CIPO', name_official: 'Canadian Intellectual Property Office', name_short: 'CIPO', country_code: 'CA', region: 'north_america', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'America/Toronto', languages: ['en', 'fr'], currency: 'CAD', tier: 3, website_official: 'https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/', website_search: 'https://www.ic.gc.ca/app/opic-cipo/trdmrks/srch/home' },
  { code: 'IN', code_alt: 'CGPDTM', name_official: 'Controller General of Patents, Designs & Trade Marks', name_short: 'IP India', country_code: 'IN', region: 'asia_pacific', office_type: 'national', ip_types: ['trademark', 'patent', 'design'], timezone: 'Asia/Kolkata', languages: ['en', 'hi'], currency: 'INR', tier: 3, website_official: 'https://ipindia.gov.in', website_search: 'https://ipindiaservices.gov.in/tmrpublicsearch/' },
] as const;

export const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];
