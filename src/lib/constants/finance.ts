export const COST_TYPES = {
  official_fee: { label: 'Tasa oficial', icon: 'Building', color: '#3B82F6' },
  service_fee: { label: 'Honorarios', icon: 'Briefcase', color: '#8B5CF6' },
  third_party: { label: 'Corresponsal', icon: 'Users', color: '#F59E0B' },
  translation: { label: 'Traducción', icon: 'Languages', color: '#22C55E' },
  other: { label: 'Otros', icon: 'MoreHorizontal', color: '#6B7280' },
} as const;

export const COST_STATUSES = {
  pending: { label: 'Pendiente', color: '#F59E0B' },
  paid: { label: 'Pagado', color: '#22C55E' },
  invoiced: { label: 'Facturado', color: '#3B82F6' },
  cancelled: { label: 'Cancelado', color: '#6B7280' },
} as const;

export const INVOICE_STATUSES = {
  draft: { label: 'Borrador', color: '#6B7280', icon: 'FileEdit' },
  sent: { label: 'Enviada', color: '#3B82F6', icon: 'Send' },
  viewed: { label: 'Vista', color: '#8B5CF6', icon: 'Eye' },
  paid: { label: 'Pagada', color: '#22C55E', icon: 'CheckCircle' },
  partial: { label: 'Pago parcial', color: '#F59E0B', icon: 'Clock' },
  overdue: { label: 'Vencida', color: '#EF4444', icon: 'AlertTriangle' },
  cancelled: { label: 'Anulada', color: '#6B7280', icon: 'XCircle' },
  refunded: { label: 'Reembolsada', color: '#EC4899', icon: 'RotateCcw' },
} as const;

export const QUOTE_STATUSES = {
  draft: { label: 'Borrador', color: '#6B7280' },
  sent: { label: 'Enviado', color: '#3B82F6' },
  viewed: { label: 'Visto', color: '#8B5CF6' },
  accepted: { label: 'Aceptado', color: '#22C55E' },
  rejected: { label: 'Rechazado', color: '#EF4444' },
  expired: { label: 'Expirado', color: '#F59E0B' },
  converted: { label: 'Convertido', color: '#22C55E' },
} as const;

export const RENEWAL_STATUSES = {
  upcoming: { label: 'Próxima', color: '#3B82F6', icon: 'Calendar' },
  due: { label: 'Vence pronto', color: '#F59E0B', icon: 'AlertCircle' },
  in_grace: { label: 'En gracia', color: '#EF4444', icon: 'Clock' },
  instructed: { label: 'Instrucciones', color: '#8B5CF6', icon: 'MessageSquare' },
  processing: { label: 'En proceso', color: '#0EA5E9', icon: 'Loader2' },
  completed: { label: 'Completada', color: '#22C55E', icon: 'CheckCircle' },
  abandoned: { label: 'Abandonada', color: '#6B7280', icon: 'XCircle' },
  missed: { label: 'Perdida', color: '#DC2626', icon: 'AlertTriangle' },
} as const;

export const RENEWAL_TYPES = {
  trademark_renewal: { label: 'Renovación marca', period_years: 10 },
  patent_annuity: { label: 'Anualidad patente', period_years: 1 },
  design_renewal: { label: 'Renovación diseño', period_years: 5 },
  domain_renewal: { label: 'Renovación dominio', period_years: 1 },
} as const;

export const SERVICE_FEE_CATEGORIES = {
  filing: { label: 'Presentación', icon: 'FileText' },
  prosecution: { label: 'Tramitación', icon: 'Gavel' },
  renewal: { label: 'Renovación', icon: 'RefreshCw' },
  opposition: { label: 'Oposición', icon: 'Shield' },
  litigation: { label: 'Litigio', icon: 'Scale' },
  advisory: { label: 'Asesoramiento', icon: 'MessageCircle' },
  search: { label: 'Búsquedas', icon: 'Search' },
  watch: { label: 'Vigilancia', icon: 'Eye' },
  valuation: { label: 'Valoración', icon: 'TrendingUp' },
  other: { label: 'Otros', icon: 'MoreHorizontal' },
} as const;

export const FEE_TYPES = {
  filing: { label: 'Solicitud' },
  examination: { label: 'Examen' },
  publication: { label: 'Publicación' },
  registration: { label: 'Registro' },
  renewal: { label: 'Renovación' },
  opposition: { label: 'Oposición' },
  appeal: { label: 'Recurso' },
  annuity: { label: 'Anualidad' },
  restoration: { label: 'Restauración' },
  assignment: { label: 'Cesión' },
  license: { label: 'Licencia' },
  other: { label: 'Otros' },
} as const;

export const OFFICES = {
  EUIPO: { name: 'EUIPO', fullName: 'Oficina de Propiedad Intelectual de la UE', country: 'EU', currency: 'EUR' },
  OEPM: { name: 'OEPM', fullName: 'Oficina Española de Patentes y Marcas', country: 'ES', currency: 'EUR' },
  USPTO: { name: 'USPTO', fullName: 'United States Patent and Trademark Office', country: 'US', currency: 'USD' },
  WIPO: { name: 'WIPO', fullName: 'World Intellectual Property Organization', country: 'WO', currency: 'CHF' },
  EPO: { name: 'EPO', fullName: 'European Patent Office', country: 'EU', currency: 'EUR' },
  UKIPO: { name: 'UKIPO', fullName: 'UK Intellectual Property Office', country: 'GB', currency: 'GBP' },
  INPI_FR: { name: 'INPI', fullName: 'Institut National de la Propriété Industrielle', country: 'FR', currency: 'EUR' },
  DPMA: { name: 'DPMA', fullName: 'Deutsches Patent- und Markenamt', country: 'DE', currency: 'EUR' },
} as const;

export const TAX_RATES = {
  ES: { rate: 21, name: 'IVA' },
  DE: { rate: 19, name: 'MwSt' },
  FR: { rate: 20, name: 'TVA' },
  IT: { rate: 22, name: 'IVA' },
  PT: { rate: 23, name: 'IVA' },
  GB: { rate: 20, name: 'VAT' },
  US: { rate: 0, name: 'Sales Tax' },
} as const;

export const PAYMENT_TERMS = [
  { days: 0, label: 'Pago inmediato' },
  { days: 15, label: '15 días' },
  { days: 30, label: '30 días' },
  { days: 45, label: '45 días' },
  { days: 60, label: '60 días' },
  { days: 90, label: '90 días' },
] as const;

export const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro', position: 'after' },
  USD: { symbol: '$', name: 'US Dollar', position: 'before' },
  GBP: { symbol: '£', name: 'British Pound', position: 'before' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', position: 'before' },
} as const;

export const VALUATION_METHODOLOGIES = {
  cost: { label: 'Método del coste', description: 'Suma de costes históricos incurridos' },
  market: { label: 'Método de mercado', description: 'Comparación con transacciones similares' },
  income: { label: 'Método de ingresos', description: 'Flujos de caja futuros descontados' },
  relief_from_royalty: { label: 'Alivio de royalties', description: 'Royalties evitados por titularidad' },
} as const;

// Formatear moneda
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const config = CURRENCIES[currency as keyof typeof CURRENCIES] || CURRENCIES.EUR;
  const formatted = amount.toLocaleString('es-ES', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  return config.position === 'before' 
    ? `${config.symbol}${formatted}` 
    : `${formatted} ${config.symbol}`;
}

// Calcular fecha de vencimiento
export function calculateDueDate(invoiceDate: Date, paymentTerms: number): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + paymentTerms);
  return dueDate;
}
