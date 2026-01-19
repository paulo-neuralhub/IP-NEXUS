// src/data/ipo-seed-data.ts
// IPO Master Registry - Seed Data for Initial Import

export interface IPOSeedData {
  code: string;
  codeAlt?: string;
  nameOfficial: string;
  nameShort?: string;
  countryCode?: string;
  region: string;
  officeType: 'national' | 'regional' | 'international';
  ipTypes: string[];
  timezone: string;
  languages: string[];
  currency: string;
  websiteOfficial?: string;
  websiteSearch?: string;
  tier: 1 | 2 | 3;
}

// TIER 1: Critical offices (high volume, APIs available)
export const TIER1_OFFICES: IPOSeedData[] = [
  {
    code: 'US', codeAlt: 'USPTO',
    nameOfficial: 'United States Patent and Trademark Office', nameShort: 'USPTO',
    countryCode: 'US', region: 'north_america', officeType: 'national',
    ipTypes: ['trademark', 'patent'], timezone: 'America/New_York',
    languages: ['en'], currency: 'USD',
    websiteOfficial: 'https://www.uspto.gov', websiteSearch: 'https://tmsearch.uspto.gov',
    tier: 1,
  },
  {
    code: 'EM', codeAlt: 'EUIPO',
    nameOfficial: 'European Union Intellectual Property Office', nameShort: 'EUIPO',
    region: 'europe', officeType: 'regional',
    ipTypes: ['trademark', 'design'], timezone: 'Europe/Madrid',
    languages: ['en', 'es', 'de', 'fr', 'it'], currency: 'EUR',
    websiteOfficial: 'https://euipo.europa.eu', websiteSearch: 'https://euipo.europa.eu/eSearch/',
    tier: 1,
  },
  {
    code: 'WO', codeAlt: 'WIPO',
    nameOfficial: 'World Intellectual Property Organization', nameShort: 'WIPO',
    region: 'international', officeType: 'international',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/Zurich',
    languages: ['en', 'fr', 'es', 'zh', 'ar', 'ru'], currency: 'CHF',
    websiteOfficial: 'https://www.wipo.int', websiteSearch: 'https://branddb.wipo.int',
    tier: 1,
  },
  {
    code: 'CN', codeAlt: 'CNIPA',
    nameOfficial: 'China National Intellectual Property Administration', nameShort: 'CNIPA',
    countryCode: 'CN', region: 'asia_pacific', officeType: 'national',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Asia/Shanghai',
    languages: ['zh'], currency: 'CNY',
    websiteOfficial: 'https://www.cnipa.gov.cn', websiteSearch: 'https://sbj.cnipa.gov.cn',
    tier: 1,
  },
  {
    code: 'GB', codeAlt: 'UKIPO',
    nameOfficial: 'UK Intellectual Property Office', nameShort: 'UKIPO',
    countryCode: 'GB', region: 'europe', officeType: 'national',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/London',
    languages: ['en'], currency: 'GBP',
    websiteOfficial: 'https://www.gov.uk/government/organisations/intellectual-property-office',
    websiteSearch: 'https://trademarks.ipo.gov.uk', tier: 1,
  },
  {
    code: 'JP', codeAlt: 'JPO',
    nameOfficial: 'Japan Patent Office', nameShort: 'JPO',
    countryCode: 'JP', region: 'asia_pacific', officeType: 'national',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Asia/Tokyo',
    languages: ['ja'], currency: 'JPY',
    websiteOfficial: 'https://www.jpo.go.jp', websiteSearch: 'https://www.j-platpat.inpit.go.jp',
    tier: 1,
  },
  {
    code: 'KR', codeAlt: 'KIPO',
    nameOfficial: 'Korean Intellectual Property Office', nameShort: 'KIPO',
    countryCode: 'KR', region: 'asia_pacific', officeType: 'national',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Asia/Seoul',
    languages: ['ko'], currency: 'KRW',
    websiteOfficial: 'https://www.kipo.go.kr', websiteSearch: 'https://kipris.or.kr',
    tier: 1,
  },
  {
    code: 'DE', codeAlt: 'DPMA',
    nameOfficial: 'Deutsches Patent- und Markenamt', nameShort: 'DPMA',
    countryCode: 'DE', region: 'europe', officeType: 'national',
    ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/Berlin',
    languages: ['de'], currency: 'EUR',
    websiteOfficial: 'https://www.dpma.de', websiteSearch: 'https://register.dpma.de',
    tier: 1,
  },
];

// TIER 2: Important offices
export const TIER2_OFFICES: IPOSeedData[] = [
  { code: 'ES', codeAlt: 'OEPM', nameOfficial: 'Oficina Española de Patentes y Marcas', nameShort: 'OEPM', countryCode: 'ES', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/Madrid', languages: ['es'], currency: 'EUR', websiteOfficial: 'https://www.oepm.es', websiteSearch: 'https://consultas2.oepm.es/LocalizadorWeb', tier: 2 },
  { code: 'FR', codeAlt: 'INPI', nameOfficial: 'Institut National de la Propriété Industrielle', nameShort: 'INPI', countryCode: 'FR', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/Paris', languages: ['fr'], currency: 'EUR', websiteOfficial: 'https://www.inpi.fr', websiteSearch: 'https://bases-marques.inpi.fr', tier: 2 },
  { code: 'IT', codeAlt: 'UIBM', nameOfficial: 'Ufficio Italiano Brevetti e Marchi', nameShort: 'UIBM', countryCode: 'IT', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Europe/Rome', languages: ['it'], currency: 'EUR', websiteOfficial: 'https://uibm.mise.gov.it', tier: 2 },
  { code: 'CA', codeAlt: 'CIPO', nameOfficial: 'Canadian Intellectual Property Office', nameShort: 'CIPO', countryCode: 'CA', region: 'north_america', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'America/Toronto', languages: ['en', 'fr'], currency: 'CAD', websiteOfficial: 'https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/eng/home', tier: 2 },
  { code: 'AU', codeAlt: 'IP Australia', nameOfficial: 'IP Australia', nameShort: 'IP Australia', countryCode: 'AU', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Australia/Sydney', languages: ['en'], currency: 'AUD', websiteOfficial: 'https://www.ipaustralia.gov.au', tier: 2 },
  { code: 'BR', codeAlt: 'INPI-BR', nameOfficial: 'Instituto Nacional da Propriedade Industrial', nameShort: 'INPI Brasil', countryCode: 'BR', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'America/Sao_Paulo', languages: ['pt'], currency: 'BRL', websiteOfficial: 'https://www.gov.br/inpi', tier: 2 },
  { code: 'MX', codeAlt: 'IMPI', nameOfficial: 'Instituto Mexicano de la Propiedad Industrial', nameShort: 'IMPI', countryCode: 'MX', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'America/Mexico_City', languages: ['es'], currency: 'MXN', websiteOfficial: 'https://www.gob.mx/impi', tier: 2 },
  { code: 'IN', codeAlt: 'CGPDTM', nameOfficial: 'Controller General of Patents, Designs and Trade Marks', nameShort: 'Indian IP Office', countryCode: 'IN', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Asia/Kolkata', languages: ['en', 'hi'], currency: 'INR', websiteOfficial: 'https://ipindia.gov.in', tier: 2 },
  { code: 'OA', codeAlt: 'OAPI', nameOfficial: 'Organisation Africaine de la Propriété Intellectuelle', nameShort: 'OAPI', region: 'africa', officeType: 'regional', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Africa/Douala', languages: ['fr'], currency: 'XAF', websiteOfficial: 'https://www.oapi.int', tier: 2 },
  { code: 'AP', codeAlt: 'ARIPO', nameOfficial: 'African Regional Intellectual Property Organization', nameShort: 'ARIPO', region: 'africa', officeType: 'regional', ipTypes: ['trademark', 'patent', 'design'], timezone: 'Africa/Harare', languages: ['en'], currency: 'USD', websiteOfficial: 'https://www.aripo.org', tier: 2 },
  { code: 'BX', codeAlt: 'BOIP', nameOfficial: 'Benelux Office for Intellectual Property', nameShort: 'BOIP', region: 'europe', officeType: 'regional', ipTypes: ['trademark', 'design'], timezone: 'Europe/Amsterdam', languages: ['en', 'nl', 'fr'], currency: 'EUR', websiteOfficial: 'https://www.boip.int', tier: 2 },
];

// TIER 3: Secondary offices
export const TIER3_OFFICES: IPOSeedData[] = [
  // Europe
  { code: 'AT', nameOfficial: 'Austrian Patent Office', countryCode: 'AT', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Vienna', languages: ['de'], currency: 'EUR', tier: 3 },
  { code: 'BE', nameOfficial: 'Belgian Office for Intellectual Property', countryCode: 'BE', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Brussels', languages: ['nl', 'fr', 'de'], currency: 'EUR', tier: 3 },
  { code: 'CH', nameOfficial: 'Swiss Federal Institute of Intellectual Property', countryCode: 'CH', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Zurich', languages: ['de', 'fr', 'it'], currency: 'CHF', tier: 3 },
  { code: 'NL', nameOfficial: 'Netherlands Patent Office', countryCode: 'NL', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Amsterdam', languages: ['nl'], currency: 'EUR', tier: 3 },
  { code: 'SE', nameOfficial: 'Swedish Patent and Registration Office', countryCode: 'SE', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Stockholm', languages: ['sv'], currency: 'SEK', tier: 3 },
  { code: 'NO', nameOfficial: 'Norwegian Industrial Property Office', countryCode: 'NO', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Oslo', languages: ['no'], currency: 'NOK', tier: 3 },
  { code: 'DK', nameOfficial: 'Danish Patent and Trademark Office', countryCode: 'DK', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Copenhagen', languages: ['da'], currency: 'DKK', tier: 3 },
  { code: 'FI', nameOfficial: 'Finnish Patent and Registration Office', countryCode: 'FI', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Helsinki', languages: ['fi', 'sv'], currency: 'EUR', tier: 3 },
  { code: 'PT', nameOfficial: 'Portuguese Institute of Industrial Property', countryCode: 'PT', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Lisbon', languages: ['pt'], currency: 'EUR', tier: 3 },
  { code: 'PL', nameOfficial: 'Polish Patent Office', countryCode: 'PL', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Warsaw', languages: ['pl'], currency: 'PLN', tier: 3 },
  { code: 'CZ', nameOfficial: 'Industrial Property Office of the Czech Republic', countryCode: 'CZ', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Prague', languages: ['cs'], currency: 'CZK', tier: 3 },
  { code: 'IE', nameOfficial: 'Intellectual Property Office of Ireland', countryCode: 'IE', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Dublin', languages: ['en', 'ga'], currency: 'EUR', tier: 3 },
  { code: 'RU', nameOfficial: 'Federal Service for Intellectual Property', countryCode: 'RU', region: 'europe', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Moscow', languages: ['ru'], currency: 'RUB', tier: 3 },
  // Asia-Pacific
  { code: 'SG', nameOfficial: 'Intellectual Property Office of Singapore', countryCode: 'SG', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Singapore', languages: ['en'], currency: 'SGD', tier: 3 },
  { code: 'HK', nameOfficial: 'Intellectual Property Department of Hong Kong', countryCode: 'HK', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Hong_Kong', languages: ['zh', 'en'], currency: 'HKD', tier: 3 },
  { code: 'TW', nameOfficial: 'Taiwan Intellectual Property Office', countryCode: 'TW', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Taipei', languages: ['zh'], currency: 'TWD', tier: 3 },
  { code: 'TH', nameOfficial: 'Department of Intellectual Property Thailand', countryCode: 'TH', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Bangkok', languages: ['th'], currency: 'THB', tier: 3 },
  { code: 'MY', nameOfficial: 'Intellectual Property Corporation of Malaysia', countryCode: 'MY', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Kuala_Lumpur', languages: ['ms', 'en'], currency: 'MYR', tier: 3 },
  { code: 'NZ', nameOfficial: 'Intellectual Property Office of New Zealand', countryCode: 'NZ', region: 'asia_pacific', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Pacific/Auckland', languages: ['en'], currency: 'NZD', tier: 3 },
  // Latin America
  { code: 'AR', nameOfficial: 'Instituto Nacional de la Propiedad Industrial', countryCode: 'AR', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'America/Buenos_Aires', languages: ['es'], currency: 'ARS', tier: 3 },
  { code: 'CL', nameOfficial: 'Instituto Nacional de Propiedad Industrial', countryCode: 'CL', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'America/Santiago', languages: ['es'], currency: 'CLP', tier: 3 },
  { code: 'CO', nameOfficial: 'Superintendencia de Industria y Comercio', countryCode: 'CO', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'America/Bogota', languages: ['es'], currency: 'COP', tier: 3 },
  { code: 'PE', nameOfficial: 'INDECOPI', countryCode: 'PE', region: 'latin_america', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'America/Lima', languages: ['es'], currency: 'PEN', tier: 3 },
  // Middle East
  { code: 'AE', nameOfficial: 'Ministry of Economy UAE', countryCode: 'AE', region: 'middle_east', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Dubai', languages: ['ar', 'en'], currency: 'AED', tier: 3 },
  { code: 'SA', nameOfficial: 'Saudi Authority for Intellectual Property', countryCode: 'SA', region: 'middle_east', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Riyadh', languages: ['ar'], currency: 'SAR', tier: 3 },
  { code: 'IL', nameOfficial: 'Israel Patent Office', countryCode: 'IL', region: 'middle_east', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Asia/Jerusalem', languages: ['he', 'ar', 'en'], currency: 'ILS', tier: 3 },
  { code: 'TR', nameOfficial: 'Turkish Patent and Trademark Office', countryCode: 'TR', region: 'middle_east', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Europe/Istanbul', languages: ['tr'], currency: 'TRY', tier: 3 },
  // Africa
  { code: 'ZA', nameOfficial: 'Companies and Intellectual Property Commission', countryCode: 'ZA', region: 'africa', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Africa/Johannesburg', languages: ['en'], currency: 'ZAR', tier: 3 },
  { code: 'EG', nameOfficial: 'Egyptian Patent Office', countryCode: 'EG', region: 'africa', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Africa/Cairo', languages: ['ar'], currency: 'EGP', tier: 3 },
  { code: 'MA', nameOfficial: 'Office Marocain de la Propriété Industrielle et Commerciale', countryCode: 'MA', region: 'africa', officeType: 'national', ipTypes: ['trademark', 'patent'], timezone: 'Africa/Casablanca', languages: ['ar', 'fr'], currency: 'MAD', tier: 3 },
];

export const ALL_IPO_SEED_DATA: IPOSeedData[] = [...TIER1_OFFICES, ...TIER2_OFFICES, ...TIER3_OFFICES];
