// ============================================================
// IP-MARKET — Wizard Translation
// Translates particular user wizard data into professional RFQ format
// ============================================================

export type WhatToProtect = 'brand_name' | 'brand_logo' | 'invention' | 'design_product' | 'not_sure';
export type WizardUrgency = 'urgent' | 'normal' | 'flexible';

export interface WizardJurisdiction {
  code: string;
  flag: string;
  name: string;
  office: string;
  description: string;
}

export interface WizardBudget {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

export interface WizardData {
  whatToProtect: WhatToProtect;
  jurisdiction: WizardJurisdiction;
  selectedCategories: string[];
  brandName: string;
  hasLogo: boolean | null;
  additionalInfo: string;
  urgency: WizardUrgency;
  budget: WizardBudget | null;
}

// ── Business categories mapped to Nice classes ──
export const BUSINESS_CATEGORIES = [
  { id: 'food', icon: '🍽️', label: 'Restauración y hostelería', desc: 'Restaurantes, cafeterías, bares, catering', niceClasses: [43] },
  { id: 'clothing', icon: '👕', label: 'Moda y ropa', desc: 'Ropa, calzado, accesorios', niceClasses: [25] },
  { id: 'tech', icon: '💻', label: 'Tecnología y software', desc: 'Apps, SaaS, tecnología, informática', niceClasses: [9, 42] },
  { id: 'health', icon: '🏥', label: 'Salud y bienestar', desc: 'Clínicas, farmacias, cosmética, deporte', niceClasses: [44, 3, 5] },
  { id: 'education', icon: '📚', label: 'Educación y formación', desc: 'Academias, cursos, coaching', niceClasses: [41] },
  { id: 'retail', icon: '🛍️', label: 'Comercio y tiendas', desc: 'Tiendas, e-commerce, distribución', niceClasses: [35] },
  { id: 'construction', icon: '🏗️', label: 'Construcción e inmobiliaria', desc: 'Construcción, reformas, inmobiliarias', niceClasses: [37, 36] },
  { id: 'consulting', icon: '💼', label: 'Consultoría y servicios', desc: 'Asesoría, legal, financiera, marketing', niceClasses: [35, 36] },
  { id: 'food_products', icon: '🥫', label: 'Alimentación y bebidas', desc: 'Productos alimenticios, bebidas', niceClasses: [29, 30, 32, 33] },
  { id: 'beauty', icon: '💄', label: 'Belleza y peluquería', desc: 'Peluquerías, salones de belleza, spa', niceClasses: [44, 3] },
  { id: 'transport', icon: '🚚', label: 'Transporte y logística', desc: 'Transporte, mensajería, mudanzas', niceClasses: [39] },
  { id: 'entertainment', icon: '🎬', label: 'Entretenimiento y medios', desc: 'Cine, música, streaming, eventos', niceClasses: [41] },
  { id: 'finance', icon: '🏦', label: 'Finanzas y seguros', desc: 'Bancos, seguros, inversiones', niceClasses: [36] },
  { id: 'agriculture', icon: '🌱', label: 'Agricultura y medio ambiente', desc: 'Agricultura, jardinería, sostenibilidad', niceClasses: [31, 44] },
  { id: 'other', icon: '📦', label: 'Otro', desc: 'Mi negocio no encaja en estas categorías', niceClasses: [] },
] as const;

export const POPULAR_JURISDICTIONS: WizardJurisdiction[] = [
  { code: 'ES', flag: '🇪🇸', name: 'Solo en España', office: 'OEPM', description: 'Protección nacional' },
  { code: 'EU', flag: '🇪🇺', name: 'Toda la Unión Europea', office: 'EUIPO', description: 'Protección en los 27 países de la UE' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos', office: 'USPTO', description: 'Protección en EE.UU.' },
  { code: 'WIPO', flag: '🌍', name: 'Varios países', office: 'WIPO', description: 'Protección internacional (Madrid System)' },
];

export const OTHER_COUNTRIES: WizardJurisdiction[] = [
  { code: 'GB', flag: '🇬🇧', name: 'Reino Unido', office: 'UKIPO', description: '' },
  { code: 'DE', flag: '🇩🇪', name: 'Alemania', office: 'DPMA', description: '' },
  { code: 'FR', flag: '🇫🇷', name: 'Francia', office: 'INPI', description: '' },
  { code: 'IT', flag: '🇮🇹', name: 'Italia', office: 'UIBM', description: '' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', office: 'INPI-PT', description: '' },
  { code: 'CN', flag: '🇨🇳', name: 'China', office: 'CNIPA', description: '' },
  { code: 'JP', flag: '🇯🇵', name: 'Japón', office: 'JPO', description: '' },
  { code: 'KR', flag: '🇰🇷', name: 'Corea del Sur', office: 'KIPO', description: '' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil', office: 'INPI-BR', description: '' },
  { code: 'MX', flag: '🇲🇽', name: 'México', office: 'IMPI', description: '' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina', office: 'INPI-AR', description: '' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile', office: 'INAPI', description: '' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia', office: 'SIC', description: '' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', office: 'IP Australia', description: '' },
  { code: 'CA', flag: '🇨🇦', name: 'Canadá', office: 'CIPO', description: '' },
  { code: 'IN', flag: '🇮🇳', name: 'India', office: 'IPO India', description: '' },
  { code: 'CH', flag: '🇨🇭', name: 'Suiza', office: 'IGE', description: '' },
];

export const BUDGET_RANGES: WizardBudget[] = [
  { id: 'low', label: 'Hasta 500 €', min: 0, max: 500 },
  { id: 'medium', label: '500 – 1.500 €', min: 500, max: 1500 },
  { id: 'high', label: '1.500 – 3.000 €', min: 1500, max: 3000 },
  { id: 'premium', label: 'Más de 3.000 €', min: 3000, max: null },
];

// ── Translation functions ──

export function calculateNiceClasses(selectedCategoryIds: string[]): number[] {
  const allClasses = new Set<number>();
  selectedCategoryIds.forEach(catId => {
    const cat = BUSINESS_CATEGORIES.find(c => c.id === catId);
    if (cat) cat.niceClasses.forEach(cls => allClasses.add(cls));
  });
  return Array.from(allClasses).sort((a, b) => a - b);
}

const JURISDICTION_CURRENCY: Record<string, string> = {
  ES: 'EUR', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', PT: 'EUR',
  US: 'USD', GB: 'GBP', JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR',
  MX: 'MXN', BR: 'BRL', CH: 'CHF', CA: 'CAD', AU: 'AUD',
};

function getProtectionLabel(what: WhatToProtect): string {
  const map: Record<WhatToProtect, string> = {
    brand_name: 'Registro de marca denominativa',
    brand_logo: 'Registro de marca figurativa/mixta',
    invention: 'Registro de patente',
    design_product: 'Registro de diseño industrial',
    not_sure: 'Consulta de asesoramiento IP',
  };
  return map[what] || 'Servicio de PI';
}

function getCategoryLabels(selectedIds: string[]): string {
  return selectedIds
    .map(id => BUSINESS_CATEGORIES.find(c => c.id === id)?.label || '')
    .filter(Boolean)
    .join(', ');
}

export function translateWizardToRfq(data: WizardData) {
  const niceClasses = calculateNiceClasses(data.selectedCategories);
  
  const serviceCategory = (() => {
    switch (data.whatToProtect) {
      case 'brand_name':
      case 'brand_logo': return 'trademark';
      case 'invention': return 'patent';
      case 'design_product': return 'design';
      case 'not_sure': return 'general';
      default: return 'general';
    }
  })();

  const serviceType = (() => {
    switch (data.whatToProtect) {
      case 'brand_name':
      case 'brand_logo': return 'tm_registration';
      case 'invention': return 'pt_filing';
      case 'design_product': return 'ds_registration';
      case 'not_sure': return 'general_consultation';
      default: return 'general_consultation';
    }
  })();

  const markType = data.whatToProtect === 'brand_name'
    ? 'word'
    : data.whatToProtect === 'brand_logo'
      ? (data.hasLogo ? 'figurative' : 'word')
      : undefined;

  const sectors = getCategoryLabels(data.selectedCategories);
  const classText = niceClasses.length > 0
    ? `${niceClasses.length} clase(s) Niza: ${niceClasses.join(', ')}`
    : '';

  const title = `${getProtectionLabel(data.whatToProtect)} — ${data.jurisdiction.name}${niceClasses.length > 0 ? ` — ${niceClasses.length} clases` : ''}`;

  const descParts = [
    `Se busca profesional para ${getProtectionLabel(data.whatToProtect).toLowerCase()} ante ${data.jurisdiction.office} (${data.jurisdiction.name}).`,
    sectors ? `Sectores de actividad: ${sectors}.` : '',
    classText ? `Alcance estimado: ${classText}.` : '',
    data.additionalInfo ? `Información adicional del solicitante: ${data.additionalInfo}` : '',
    `Solicitud creada por un particular a través del wizard guiado de IP-Market.`,
  ].filter(Boolean);

  const currency = JURISDICTION_CURRENCY[data.jurisdiction.code] || 'EUR';

  return {
    service_category: serviceCategory,
    service_type: serviceType,
    title,
    description: descParts.join(' '),
    jurisdictions: [data.jurisdiction.code],
    budget_min: data.budget?.min || undefined,
    budget_max: data.budget?.max || undefined,
    budget_currency: currency,
    urgency: data.urgency,
    is_blind: true,
    max_quotes: 5,
    nice_classes: niceClasses,
    details: {
      trademark_type: markType,
      num_classes: niceClasses.length || undefined,
      requester_type: 'client',
      wizard_data: {
        whatToProtect: data.whatToProtect,
        categories: data.selectedCategories,
        hasLogo: data.hasLogo,
      },
    },
  };
}

// Helpers for summary display
export { getProtectionLabel, getCategoryLabels };
