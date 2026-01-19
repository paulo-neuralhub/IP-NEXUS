// ============================================
// IP-MARKET TYPES AND CONSTANTS
// ============================================

// --- TRANSACTION TYPES (12 tipos) ---
export type TransactionType =
  // Transferencia de Propiedad (3)
  | 'full_sale'           // Venta completa del activo
  | 'partial_assignment'  // Cesión parcial (territorio/clase)
  | 'swap'                // Intercambio de activos
  // Licencias (5)
  | 'exclusive_license'   // Licencia exclusiva
  | 'non_exclusive_license' // Licencia no exclusiva
  | 'cross_license'       // Licencia cruzada (mutua)
  | 'franchise'           // Franquicia (licencia + modelo negocio)
  | 'option_to_buy'       // Opción de compra futura
  // Subastas y Ofertas (2)
  | 'auction'             // Subasta pública
  | 'rfp'                 // Request for Proposal
  // Acuerdos (2)
  | 'coexistence'         // Acuerdo de coexistencia
  | 'settlement';         // Acuerdo de resolución

export interface TransactionTypeConfig {
  label: string;
  labelEs: string;
  description: string;
  category: 'transfer' | 'license' | 'auction' | 'agreement';
  requiresNegotiation: boolean;
  supportsCounterOffer: boolean;
  requiresContract: boolean;
  minKycLevel: number;
  icon: string;
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> = {
  full_sale: {
    label: 'Full Sale',
    labelEs: 'Venta Completa',
    description: 'Complete transfer of IP ownership rights',
    category: 'transfer',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'ShoppingCart'
  },
  partial_assignment: {
    label: 'Partial Assignment',
    labelEs: 'Cesión Parcial',
    description: 'Transfer of rights for specific territories or classes',
    category: 'transfer',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'GitBranch'
  },
  swap: {
    label: 'IP Swap',
    labelEs: 'Intercambio',
    description: 'Exchange of IP assets between parties',
    category: 'transfer',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'ArrowLeftRight'
  },
  exclusive_license: {
    label: 'Exclusive License',
    labelEs: 'Licencia Exclusiva',
    description: 'Sole right to use IP in specified scope',
    category: 'license',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Lock'
  },
  non_exclusive_license: {
    label: 'Non-Exclusive License',
    labelEs: 'Licencia No Exclusiva',
    description: 'Right to use IP alongside other licensees',
    category: 'license',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 1,
    icon: 'Unlock'
  },
  cross_license: {
    label: 'Cross-License',
    labelEs: 'Licencia Cruzada',
    description: 'Mutual exchange of license rights',
    category: 'license',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Repeat'
  },
  franchise: {
    label: 'Franchise',
    labelEs: 'Franquicia',
    description: 'License including business model and support',
    category: 'license',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 3,
    icon: 'Store'
  },
  option_to_buy: {
    label: 'Option to Buy',
    labelEs: 'Opción de Compra',
    description: 'Right to purchase IP at future date',
    category: 'license',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Calendar'
  },
  auction: {
    label: 'Auction',
    labelEs: 'Subasta',
    description: 'Public bidding for IP rights',
    category: 'auction',
    requiresNegotiation: false,
    supportsCounterOffer: false,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Gavel'
  },
  rfp: {
    label: 'Request for Proposal',
    labelEs: 'Solicitud de Propuesta',
    description: 'Open call for offers on IP need',
    category: 'auction',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'FileSearch'
  },
  coexistence: {
    label: 'Coexistence Agreement',
    labelEs: 'Acuerdo de Coexistencia',
    description: 'Agreement for similar marks to coexist',
    category: 'agreement',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Handshake'
  },
  settlement: {
    label: 'Settlement Agreement',
    labelEs: 'Acuerdo de Resolución',
    description: 'Resolution of IP dispute or litigation',
    category: 'agreement',
    requiresNegotiation: true,
    supportsCounterOffer: true,
    requiresContract: true,
    minKycLevel: 2,
    icon: 'Scale'
  }
};

// --- ASSET TYPES (18 tipos) ---
export type AssetType =
  // Industrial Property
  | 'patent_invention'
  | 'patent_utility'
  | 'patent_design'
  | 'trademark_word'
  | 'trademark_figurative'
  | 'trademark_mixed'
  | 'trademark_3d'
  | 'trademark_sound'
  | 'industrial_design'
  // Intellectual Property
  | 'copyright_software'
  | 'copyright_literary'
  | 'copyright_musical'
  | 'copyright_artistic'
  | 'domain_gtld'
  | 'domain_cctld'
  // Intangible Assets
  | 'know_how'
  | 'trade_secret'
  | 'trade_name'
  | 'portfolio';

export type AssetCategory = 'industrial_property' | 'intellectual_property' | 'intangible_assets';

export interface AssetTypeConfig {
  label: string;
  labelEs: string;
  category: AssetCategory;
  icon: string;
  requiresRegistration: boolean;
  verifiableOffices: string[];
  requiredFields: string[];
  optionalFields: string[];
}

export const ASSET_TYPE_CONFIG: Record<AssetType, AssetTypeConfig> = {
  patent_invention: {
    label: 'Invention Patent',
    labelEs: 'Patente de Invención',
    category: 'industrial_property',
    icon: 'Lightbulb',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO', 'EPO', 'WIPO', 'OEPM', 'IMPI', 'INPI'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'title', 'claims'],
    optionalFields: ['priorityDate', 'inventors', 'assignee', 'abstract', 'pctNumber']
  },
  patent_utility: {
    label: 'Utility Model',
    labelEs: 'Modelo de Utilidad',
    category: 'industrial_property',
    icon: 'Wrench',
    requiresRegistration: true,
    verifiableOffices: ['OEPM', 'DPMA', 'INPI', 'IMPI'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'title'],
    optionalFields: ['claims', 'inventors', 'abstract']
  },
  patent_design: {
    label: 'Design Patent',
    labelEs: 'Patente de Diseño',
    category: 'industrial_property',
    icon: 'Palette',
    requiresRegistration: true,
    verifiableOffices: ['USPTO', 'EUIPO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'images'],
    optionalFields: ['designers', 'description']
  },
  trademark_word: {
    label: 'Word Trademark',
    labelEs: 'Marca Denominativa',
    category: 'industrial_property',
    icon: 'Type',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO', 'WIPO', 'OEPM', 'INPI', 'IMPI', 'UKIPO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'wordMark', 'niceClasses'],
    optionalFields: ['owner', 'representative', 'priority', 'seniority']
  },
  trademark_figurative: {
    label: 'Figurative Trademark',
    labelEs: 'Marca Figurativa',
    category: 'industrial_property',
    icon: 'Image',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO', 'WIPO', 'OEPM', 'INPI', 'IMPI', 'UKIPO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'logo', 'niceClasses'],
    optionalFields: ['colors', 'description', 'owner']
  },
  trademark_mixed: {
    label: 'Mixed Trademark',
    labelEs: 'Marca Mixta',
    category: 'industrial_property',
    icon: 'Layers',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO', 'WIPO', 'OEPM', 'INPI', 'IMPI', 'UKIPO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'wordMark', 'logo', 'niceClasses'],
    optionalFields: ['colors', 'description', 'owner']
  },
  trademark_3d: {
    label: '3D Trademark',
    labelEs: 'Marca Tridimensional',
    category: 'industrial_property',
    icon: 'Box',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO', 'WIPO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'images3d', 'niceClasses'],
    optionalFields: ['description', 'owner']
  },
  trademark_sound: {
    label: 'Sound Trademark',
    labelEs: 'Marca Sonora',
    category: 'industrial_property',
    icon: 'Music',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'USPTO'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'soundFile', 'niceClasses'],
    optionalFields: ['musicalNotation', 'description', 'owner']
  },
  industrial_design: {
    label: 'Industrial Design',
    labelEs: 'Diseño Industrial',
    category: 'industrial_property',
    icon: 'PenTool',
    requiresRegistration: true,
    verifiableOffices: ['EUIPO', 'WIPO', 'OEPM', 'INPI'],
    requiredFields: ['registrationNumber', 'filingDate', 'jurisdiction', 'images', 'locarnoClass'],
    optionalFields: ['designer', 'description', 'owner']
  },
  copyright_software: {
    label: 'Software Copyright',
    labelEs: 'Copyright de Software',
    category: 'intellectual_property',
    icon: 'Code',
    requiresRegistration: false,
    verifiableOffices: ['US_COPYRIGHT'],
    requiredFields: ['title', 'creationDate', 'author'],
    optionalFields: ['registrationNumber', 'version', 'description', 'repository']
  },
  copyright_literary: {
    label: 'Literary Work',
    labelEs: 'Obra Literaria',
    category: 'intellectual_property',
    icon: 'Book',
    requiresRegistration: false,
    verifiableOffices: ['US_COPYRIGHT'],
    requiredFields: ['title', 'creationDate', 'author'],
    optionalFields: ['registrationNumber', 'isbn', 'publisher']
  },
  copyright_musical: {
    label: 'Musical Work',
    labelEs: 'Obra Musical',
    category: 'intellectual_property',
    icon: 'Music2',
    requiresRegistration: false,
    verifiableOffices: ['US_COPYRIGHT'],
    requiredFields: ['title', 'creationDate', 'composer'],
    optionalFields: ['registrationNumber', 'isrc', 'performers', 'publisher']
  },
  copyright_artistic: {
    label: 'Artistic Work',
    labelEs: 'Obra Artística',
    category: 'intellectual_property',
    icon: 'Paintbrush',
    requiresRegistration: false,
    verifiableOffices: ['US_COPYRIGHT'],
    requiredFields: ['title', 'creationDate', 'artist'],
    optionalFields: ['registrationNumber', 'medium', 'dimensions']
  },
  domain_gtld: {
    label: 'Generic Domain (gTLD)',
    labelEs: 'Dominio Genérico',
    category: 'intellectual_property',
    icon: 'Globe',
    requiresRegistration: true,
    verifiableOffices: ['WHOIS', 'ICANN'],
    requiredFields: ['domainName', 'registrationDate', 'expirationDate'],
    optionalFields: ['registrar', 'registrant', 'dns', 'traffic']
  },
  domain_cctld: {
    label: 'Country Domain (ccTLD)',
    labelEs: 'Dominio Nacional',
    category: 'intellectual_property',
    icon: 'Flag',
    requiresRegistration: true,
    verifiableOffices: ['WHOIS', 'NIC'],
    requiredFields: ['domainName', 'registrationDate', 'expirationDate', 'registrar', 'country'],
    optionalFields: ['registrant', 'dns', 'traffic']
  },
  know_how: {
    label: 'Know-How',
    labelEs: 'Know-How',
    category: 'intangible_assets',
    icon: 'Brain',
    requiresRegistration: false,
    verifiableOffices: [],
    requiredFields: ['title', 'description', 'industry'],
    optionalFields: ['documentation', 'trainingIncluded', 'supportPeriod']
  },
  trade_secret: {
    label: 'Trade Secret',
    labelEs: 'Secreto Comercial',
    category: 'intangible_assets',
    icon: 'Lock',
    requiresRegistration: false,
    verifiableOffices: [],
    requiredFields: ['title', 'description', 'protectionMeasures'],
    optionalFields: ['ndaTemplate', 'accessLog']
  },
  trade_name: {
    label: 'Trade Name',
    labelEs: 'Nombre Comercial',
    category: 'intangible_assets',
    icon: 'Building',
    requiresRegistration: false,
    verifiableOffices: ['OEPM', 'INPI'],
    requiredFields: ['name', 'jurisdiction', 'useDate'],
    optionalFields: ['registrationNumber', 'businessType']
  },
  portfolio: {
    label: 'IP Portfolio',
    labelEs: 'Portafolio de PI',
    category: 'intangible_assets',
    icon: 'Briefcase',
    requiresRegistration: false,
    verifiableOffices: [],
    requiredFields: ['name', 'assetIds', 'totalAssets'],
    optionalFields: ['valuation', 'industry', 'description']
  }
};

// --- KYC LEVELS (5 niveles) ---
export type KycLevel = '0' | '1' | '2' | '3' | '4';

export interface KycLevelConfig {
  level: number;
  name: string;
  nameEs: string;
  description: string;
  requirements: string[];
  permissions: string[];
  transactionLimit: number | null;
  verificationTime: string;
  cost: number;
}

export const KYC_LEVEL_CONFIG: Record<KycLevel, KycLevelConfig> = {
  '0': {
    level: 0,
    name: 'Visitor',
    nameEs: 'Visitante',
    description: 'Email verification only',
    requirements: ['email'],
    permissions: ['browse_listings', 'save_favorites', 'receive_alerts'],
    transactionLimit: 0,
    verificationTime: 'Instant',
    cost: 0
  },
  '1': {
    level: 1,
    name: 'Basic',
    nameEs: 'Básico',
    description: 'Basic identity verification',
    requirements: ['email', 'full_name', 'phone', 'country'],
    permissions: ['contact_sellers', 'make_offers', 'create_rfp'],
    transactionLimit: 5000,
    verificationTime: 'Instant',
    cost: 0
  },
  '2': {
    level: 2,
    name: 'Verified',
    nameEs: 'Verificado',
    description: 'Full identity verification',
    requirements: ['email', 'full_name', 'phone', 'country', 'id_document', 'selfie', 'address_proof'],
    permissions: ['full_transactions', 'create_listings', 'participate_auctions'],
    transactionLimit: 50000,
    verificationTime: '24-48 hours',
    cost: 0
  },
  '3': {
    level: 3,
    name: 'Professional',
    nameEs: 'Profesional',
    description: 'Business verification (KYB)',
    requirements: ['kyb_company', 'legal_representative', 'company_documents', 'due_diligence'],
    permissions: ['unlimited_transactions', 'bulk_listings', 'api_access', 'white_label'],
    transactionLimit: null,
    verificationTime: '3-5 business days',
    cost: 0
  },
  '4': {
    level: 4,
    name: 'IP Agent',
    nameEs: 'Agente PI',
    description: 'Verified IP professional',
    requirements: ['agent_license', 'bar_association', 'professional_insurance', 'references'],
    permissions: ['represent_clients', 'agent_dashboard', 'bulk_management', 'priority_support'],
    transactionLimit: null,
    verificationTime: '5-7 business days',
    cost: 0
  }
};

// --- LISTING STATUS ---
export type ListingStatus =
  | 'draft'
  | 'pending_verification'
  | 'active'
  | 'under_offer'
  | 'reserved'
  | 'sold'
  | 'licensed'
  | 'expired'
  | 'withdrawn'
  | 'suspended';

export interface ListingStatusConfig {
  label: string;
  labelEs: string;
  color: string;
  allowsEditing: boolean;
  visibleInSearch: boolean;
  allowsOffers: boolean;
}

export const LISTING_STATUS_CONFIG: Record<ListingStatus, ListingStatusConfig> = {
  draft: {
    label: 'Draft',
    labelEs: 'Borrador',
    color: 'gray',
    allowsEditing: true,
    visibleInSearch: false,
    allowsOffers: false
  },
  pending_verification: {
    label: 'Pending Verification',
    labelEs: 'Pendiente de Verificación',
    color: 'yellow',
    allowsEditing: false,
    visibleInSearch: false,
    allowsOffers: false
  },
  active: {
    label: 'Active',
    labelEs: 'Activo',
    color: 'green',
    allowsEditing: true,
    visibleInSearch: true,
    allowsOffers: true
  },
  under_offer: {
    label: 'Under Offer',
    labelEs: 'Con Oferta',
    color: 'blue',
    allowsEditing: false,
    visibleInSearch: true,
    allowsOffers: false
  },
  reserved: {
    label: 'Reserved',
    labelEs: 'Reservado',
    color: 'purple',
    allowsEditing: false,
    visibleInSearch: true,
    allowsOffers: false
  },
  sold: {
    label: 'Sold',
    labelEs: 'Vendido',
    color: 'emerald',
    allowsEditing: false,
    visibleInSearch: false,
    allowsOffers: false
  },
  licensed: {
    label: 'Licensed',
    labelEs: 'Licenciado',
    color: 'teal',
    allowsEditing: false,
    visibleInSearch: true,
    allowsOffers: true
  },
  expired: {
    label: 'Expired',
    labelEs: 'Expirado',
    color: 'red',
    allowsEditing: true,
    visibleInSearch: false,
    allowsOffers: false
  },
  withdrawn: {
    label: 'Withdrawn',
    labelEs: 'Retirado',
    color: 'gray',
    allowsEditing: true,
    visibleInSearch: false,
    allowsOffers: false
  },
  suspended: {
    label: 'Suspended',
    labelEs: 'Suspendido',
    color: 'red',
    allowsEditing: false,
    visibleInSearch: false,
    allowsOffers: false
  }
};

// --- TRANSACTION STATUS ---
export type TransactionStatus =
  | 'inquiry'
  | 'negotiation'
  | 'offer_made'
  | 'offer_accepted'
  | 'due_diligence'
  | 'contract_draft'
  | 'contract_review'
  | 'pending_payment'
  | 'payment_in_escrow'
  | 'pending_transfer'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface TransactionStatusConfig {
  label: string;
  labelEs: string;
  step: number;
  category: 'negotiation' | 'documentation' | 'payment' | 'completion';
  color: string;
  nextStatuses: TransactionStatus[];
  requiresAction: 'buyer' | 'seller' | 'both' | 'system' | 'none';
}

export const TRANSACTION_STATUS_CONFIG: Record<TransactionStatus, TransactionStatusConfig> = {
  inquiry: {
    label: 'Inquiry',
    labelEs: 'Consulta',
    step: 1,
    category: 'negotiation',
    color: 'gray',
    nextStatuses: ['negotiation', 'cancelled'],
    requiresAction: 'seller'
  },
  negotiation: {
    label: 'Negotiation',
    labelEs: 'Negociación',
    step: 2,
    category: 'negotiation',
    color: 'blue',
    nextStatuses: ['offer_made', 'cancelled'],
    requiresAction: 'both'
  },
  offer_made: {
    label: 'Offer Made',
    labelEs: 'Oferta Realizada',
    step: 3,
    category: 'negotiation',
    color: 'yellow',
    nextStatuses: ['offer_accepted', 'negotiation', 'cancelled'],
    requiresAction: 'seller'
  },
  offer_accepted: {
    label: 'Offer Accepted',
    labelEs: 'Oferta Aceptada',
    step: 4,
    category: 'negotiation',
    color: 'green',
    nextStatuses: ['due_diligence', 'contract_draft', 'cancelled'],
    requiresAction: 'buyer'
  },
  due_diligence: {
    label: 'Due Diligence',
    labelEs: 'Due Diligence',
    step: 5,
    category: 'documentation',
    color: 'orange',
    nextStatuses: ['contract_draft', 'cancelled'],
    requiresAction: 'buyer'
  },
  contract_draft: {
    label: 'Contract Draft',
    labelEs: 'Borrador de Contrato',
    step: 6,
    category: 'documentation',
    color: 'purple',
    nextStatuses: ['contract_review'],
    requiresAction: 'system'
  },
  contract_review: {
    label: 'Contract Review',
    labelEs: 'Revisión de Contrato',
    step: 7,
    category: 'documentation',
    color: 'indigo',
    nextStatuses: ['pending_payment', 'contract_draft', 'cancelled'],
    requiresAction: 'both'
  },
  pending_payment: {
    label: 'Pending Payment',
    labelEs: 'Pendiente de Pago',
    step: 8,
    category: 'payment',
    color: 'yellow',
    nextStatuses: ['payment_in_escrow', 'cancelled'],
    requiresAction: 'buyer'
  },
  payment_in_escrow: {
    label: 'Payment in Escrow',
    labelEs: 'Pago en Escrow',
    step: 9,
    category: 'payment',
    color: 'emerald',
    nextStatuses: ['pending_transfer', 'disputed'],
    requiresAction: 'seller'
  },
  pending_transfer: {
    label: 'Pending Transfer',
    labelEs: 'Pendiente de Transferencia',
    step: 10,
    category: 'completion',
    color: 'cyan',
    nextStatuses: ['completed', 'disputed'],
    requiresAction: 'seller'
  },
  completed: {
    label: 'Completed',
    labelEs: 'Completada',
    step: 11,
    category: 'completion',
    color: 'green',
    nextStatuses: [],
    requiresAction: 'none'
  },
  cancelled: {
    label: 'Cancelled',
    labelEs: 'Cancelada',
    step: 0,
    category: 'completion',
    color: 'red',
    nextStatuses: [],
    requiresAction: 'none'
  },
  disputed: {
    label: 'Disputed',
    labelEs: 'En Disputa',
    step: 0,
    category: 'completion',
    color: 'red',
    nextStatuses: ['pending_transfer', 'cancelled', 'completed'],
    requiresAction: 'both'
  }
};

// --- CERTIFICATION LEVELS (3 niveles) ---
export type CertificationLevel = 'basic' | 'standard' | 'premium';

export interface CertificationLevelConfig {
  label: string;
  labelEs: string;
  minAmount: number;
  maxAmount: number | null;
  method: 'hash_db' | 'tsa_eidas' | 'blockchain';
  provider: string;
  cost: number;
  legalValidity: string;
  features: string[];
}

export const CERTIFICATION_LEVEL_CONFIG: Record<CertificationLevel, CertificationLevelConfig> = {
  basic: {
    label: 'Basic Certification',
    labelEs: 'Certificación Básica',
    minAmount: 0,
    maxAmount: 5000,
    method: 'hash_db',
    provider: 'IP-NEXUS',
    cost: 0,
    legalValidity: 'Internal record only',
    features: ['SHA-256 hash', 'Timestamp', 'IP-NEXUS signature', 'PDF certificate']
  },
  standard: {
    label: 'Standard Certification',
    labelEs: 'Certificación Estándar',
    minAmount: 5000,
    maxAmount: 50000,
    method: 'tsa_eidas',
    provider: 'Signaturit/DigiCert',
    cost: 0.50,
    legalValidity: 'eIDAS compliant - EU legal validity',
    features: ['Qualified timestamp', 'eIDAS certificate', 'Third-party verification', 'Legal validity EU']
  },
  premium: {
    label: 'Premium Certification',
    labelEs: 'Certificación Premium',
    minAmount: 50000,
    maxAmount: null,
    method: 'blockchain',
    provider: 'Polygon',
    cost: 5,
    legalValidity: 'Immutable blockchain record + eIDAS',
    features: ['Blockchain timestamp', 'NFT certificate', 'Public verification', 'Immutable record', 'Smart contract']
  }
};

// --- VERIFICATION STATUS ---
export type VerificationStatus = 'pending' | 'verified' | 'failed' | 'expired' | 'not_required';

export interface VerificationStatusConfig {
  label: string;
  labelEs: string;
  color: string;
  icon: string;
}

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, VerificationStatusConfig> = {
  pending: {
    label: 'Pending',
    labelEs: 'Pendiente',
    color: 'yellow',
    icon: 'Clock'
  },
  verified: {
    label: 'Verified',
    labelEs: 'Verificado',
    color: 'green',
    icon: 'CheckCircle'
  },
  failed: {
    label: 'Failed',
    labelEs: 'Fallido',
    color: 'red',
    icon: 'XCircle'
  },
  expired: {
    label: 'Expired',
    labelEs: 'Expirado',
    color: 'orange',
    icon: 'AlertTriangle'
  },
  not_required: {
    label: 'Not Required',
    labelEs: 'No Requerido',
    color: 'gray',
    icon: 'Minus'
  }
};

// --- JURISDICTIONS ---
export interface JurisdictionConfig {
  code: string;
  name: string;
  nameEs: string;
  country: string;
  region: 'europe' | 'latam' | 'north_america' | 'asia' | 'international';
  types: ('trademark' | 'patent' | 'design' | 'copyright')[];
  apiAvailable: boolean;
  searchUrl: string;
  filingUrl: string;
}

export const JURISDICTIONS: JurisdictionConfig[] = [
  // Europe
  { code: 'EUIPO', name: 'EU Intellectual Property Office', nameEs: 'Oficina de PI de la UE', country: 'EU', region: 'europe', types: ['trademark', 'design'], apiAvailable: true, searchUrl: 'https://euipo.europa.eu/eSearch/', filingUrl: 'https://euipo.europa.eu/ohimportal/' },
  { code: 'EPO', name: 'European Patent Office', nameEs: 'Oficina Europea de Patentes', country: 'EU', region: 'europe', types: ['patent'], apiAvailable: true, searchUrl: 'https://worldwide.espacenet.com/', filingUrl: 'https://www.epo.org/' },
  { code: 'OEPM', name: 'Spanish Patent and Trademark Office', nameEs: 'Oficina Española de Patentes y Marcas', country: 'ES', region: 'europe', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://consultas2.oepm.es/', filingUrl: 'https://sede.oepm.gob.es/' },
  { code: 'INPI_FR', name: 'French National Institute of Industrial Property', nameEs: 'Instituto Nacional de Propiedad Industrial de Francia', country: 'FR', region: 'europe', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://data.inpi.fr/', filingUrl: 'https://www.inpi.fr/' },
  { code: 'DPMA', name: 'German Patent and Trade Mark Office', nameEs: 'Oficina Alemana de Patentes y Marcas', country: 'DE', region: 'europe', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://register.dpma.de/', filingUrl: 'https://www.dpma.de/' },
  { code: 'UKIPO', name: 'UK Intellectual Property Office', nameEs: 'Oficina de PI del Reino Unido', country: 'GB', region: 'europe', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://trademarks.ipo.gov.uk/', filingUrl: 'https://www.gov.uk/intellectual-property-an-overview' },
  // Latin America
  { code: 'IMPI', name: 'Mexican Institute of Industrial Property', nameEs: 'Instituto Mexicano de la Propiedad Industrial', country: 'MX', region: 'latam', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://marcanet.impi.gob.mx/', filingUrl: 'https://www.gob.mx/impi' },
  { code: 'INPI_BR', name: 'Brazilian National Institute of Industrial Property', nameEs: 'Instituto Nacional de Propiedad Industrial de Brasil', country: 'BR', region: 'latam', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://busca.inpi.gov.br/', filingUrl: 'https://www.gov.br/inpi/' },
  { code: 'INAPI', name: 'Chilean National Institute of Industrial Property', nameEs: 'Instituto Nacional de Propiedad Industrial de Chile', country: 'CL', region: 'latam', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://ion.inapi.cl/', filingUrl: 'https://www.inapi.cl/' },
  { code: 'INDECOPI', name: 'Peruvian National Institute for the Defense of Competition', nameEs: 'Instituto Nacional de Defensa de la Competencia de Perú', country: 'PE', region: 'latam', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://servicio.indecopi.gob.pe/', filingUrl: 'https://www.indecopi.gob.pe/' },
  { code: 'SIC', name: 'Colombian Superintendence of Industry and Commerce', nameEs: 'Superintendencia de Industria y Comercio de Colombia', country: 'CO', region: 'latam', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://sipi.sic.gov.co/', filingUrl: 'https://www.sic.gov.co/' },
  // North America
  { code: 'USPTO', name: 'United States Patent and Trademark Office', nameEs: 'Oficina de Patentes y Marcas de Estados Unidos', country: 'US', region: 'north_america', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://www.uspto.gov/trademarks/search', filingUrl: 'https://www.uspto.gov/' },
  { code: 'US_COPYRIGHT', name: 'US Copyright Office', nameEs: 'Oficina de Copyright de Estados Unidos', country: 'US', region: 'north_america', types: ['copyright'], apiAvailable: true, searchUrl: 'https://cocatalog.loc.gov/', filingUrl: 'https://www.copyright.gov/' },
  // International
  { code: 'WIPO', name: 'World Intellectual Property Organization', nameEs: 'Organización Mundial de la Propiedad Intelectual', country: 'INT', region: 'international', types: ['trademark', 'patent', 'design'], apiAvailable: true, searchUrl: 'https://www.wipo.int/madrid/monitor/', filingUrl: 'https://www.wipo.int/' }
];

// --- CURRENCIES ---
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  regions: string[];
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', regions: ['europe'] },
  { code: 'USD', symbol: '$', name: 'US Dollar', regions: ['north_america', 'latam'] },
  { code: 'GBP', symbol: '£', name: 'British Pound', regions: ['europe'] },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', regions: ['latam'] },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', regions: ['latam'] },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', regions: ['latam'] }
];

// --- COMMISSION STRUCTURE ---
export interface CommissionTier {
  minAmount: number;
  maxAmount: number | null;
  percentage: number;
  minimumFee: number;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { minAmount: 0, maxAmount: 5000, percentage: 5.0, minimumFee: 50 },
  { minAmount: 5000, maxAmount: 25000, percentage: 4.0, minimumFee: 250 },
  { minAmount: 25000, maxAmount: 100000, percentage: 3.0, minimumFee: 1000 },
  { minAmount: 100000, maxAmount: 500000, percentage: 2.5, minimumFee: 3000 },
  { minAmount: 500000, maxAmount: null, percentage: 2.0, minimumFee: 12500 }
];

// --- DATABASE INTERFACES ---
export interface MarketUserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  kyc_level: KycLevel;
  kyc_verified_at: string | null;
  kyc_expires_at: string | null;
  phone: string | null;
  phone_verified: boolean;
  country_code: string | null;
  address: Record<string, unknown> | null;
  is_agent: boolean;
  agent_license_number: string | null;
  bar_association: string | null;
  professional_insurance: Record<string, unknown> | null;
  is_company: boolean;
  company_name: string | null;
  company_registration_number: string | null;
  company_vat_number: string | null;
  legal_representative_name: string | null;
  preferred_language: string;
  preferred_currency: string;
  notification_preferences: Record<string, unknown>;
  total_listings: number;
  total_transactions: number;
  total_volume: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface KycVerification {
  id: string;
  user_id: string;
  verification_type: string;
  provider: string | null;
  external_reference: string | null;
  status: VerificationStatus;
  documents: Record<string, unknown> | null;
  verification_result: Record<string, unknown> | null;
  rejection_reason: string | null;
  submitted_at: string;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketAsset {
  id: string;
  owner_id: string;
  asset_type: AssetType;
  asset_category: AssetCategory;
  title: string;
  description: string | null;
  registration_number: string | null;
  filing_date: string | null;
  registration_date: string | null;
  expiration_date: string | null;
  jurisdiction: string | null;
  word_mark: string | null;
  nice_classes: number[] | null;
  logo_url: string | null;
  claims: string[] | null;
  inventors: string[] | null;
  abstract: string | null;
  pct_number: string | null;
  domain_name: string | null;
  registrar: string | null;
  author: string | null;
  creation_date: string | null;
  verification_status: VerificationStatus;
  verification_data: Record<string, unknown> | null;
  verified_at: string | null;
  verification_expires_at: string | null;
  images: string[] | null;
  documents: Record<string, unknown>[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MarketListing {
  id: string;
  listing_number: string;
  asset_id: string;
  seller_id: string;
  status: ListingStatus;
  transaction_types: TransactionType[];
  asking_price: number | null;
  price_negotiable: boolean;
  minimum_offer: number | null;
  currency: string;
  license_terms: Record<string, unknown> | null;
  available_territories: string[] | null;
  available_classes: number[] | null;
  title: string;
  description: string | null;
  highlights: string[] | null;
  industries: string[] | null;
  keywords: string[] | null;
  is_featured: boolean;
  featured_until: string | null;
  is_urgent: boolean;
  expires_at: string | null;
  view_count: number;
  favorite_count: number;
  inquiry_count: number;
  offer_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketTransaction {
  id: string;
  transaction_number: string;
  listing_id: string;
  asset_id: string;
  seller_id: string;
  buyer_id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  offered_price: number | null;
  agreed_price: number | null;
  currency: string;
  commission_rate: number | null;
  commission_amount: number | null;
  license_terms: Record<string, unknown> | null;
  certification_level: CertificationLevel | null;
  certification_hash: string | null;
  certification_timestamp: string | null;
  blockchain_tx_hash: string | null;
  certificate_url: string | null;
  escrow_provider: string | null;
  escrow_reference: string | null;
  escrow_status: string | null;
  payment_intent_id: string | null;
  payment_method: string | null;
  paid_at: string | null;
  contract_url: string | null;
  contract_signed_at: string | null;
  nda_url: string | null;
  nda_signed_at: string | null;
  due_diligence_completed: boolean;
  due_diligence_report: Record<string, unknown> | null;
  transfer_completed: boolean;
  transfer_proof_url: string | null;
  completed_at: string | null;
  dispute_id: string | null;
  dispute_reason: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MarketOffer {
  id: string;
  listing_id: string;
  transaction_id: string | null;
  buyer_id: string;
  offer_type: 'offer' | 'counter_offer' | 'bid';
  parent_offer_id: string | null;
  amount: number;
  currency: string;
  proposed_terms: Record<string, unknown> | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  response_message: string | null;
  responded_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketMessage {
  id: string;
  thread_id: string;
  listing_id: string | null;
  transaction_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  attachments?: string[] | null;
  is_read?: boolean;
  read_at: string | null;
  created_at: string;
  // Joined fields
  sender?: MarketUserProfile;
}

export interface MarketConversation {
  id: string;
  listing_id?: string | null;
  transaction_id?: string | null;
  participant_1_id: string;
  participant_2_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at: string;
  // Joined fields
  listing?: MarketListing;
  participant_1?: MarketUserProfile;
  participant_2?: MarketUserProfile;
}

export interface MarketFavorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface MarketAlert {
  id: string;
  user_id: string;
  name: string | null;
  asset_types: AssetType[] | null;
  jurisdictions: string[] | null;
  nice_classes: number[] | null;
  keywords: string[] | null;
  min_price: number | null;
  max_price: number | null;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketReview {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewed_id: string;
  overall_rating: number;
  communication_rating: number | null;
  professionalism_rating: number | null;
  accuracy_rating: number | null;
  title: string | null;
  review: string | null;
  response: string | null;
  responded_at: string | null;
  visible: boolean;
  flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketCertification {
  id: string;
  transaction_id: string;
  certification_level: CertificationLevel;
  method: string;
  document_hash: string;
  metadata_hash: string | null;
  provider: string | null;
  provider_reference: string | null;
  blockchain_network: string | null;
  blockchain_tx_hash: string | null;
  smart_contract_address: string | null;
  token_id: string | null;
  certificate_url: string | null;
  certificate_data: Record<string, unknown> | null;
  verified: boolean;
  verification_url: string | null;
  created_at: string;
}

export interface MarketAuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// --- HELPER FUNCTIONS ---
export function calculateCommission(amount: number): { rate: number; amount: number } {
  const tier = COMMISSION_TIERS.find(t => 
    amount >= t.minAmount && (t.maxAmount === null || amount <= t.maxAmount)
  ) || COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
  
  const calculatedAmount = Math.max(amount * (tier.percentage / 100), tier.minimumFee);
  return { rate: tier.percentage, amount: calculatedAmount };
}

export function getRecommendedCertificationLevel(amount: number): CertificationLevel {
  if (amount >= 50000) return 'premium';
  if (amount >= 5000) return 'standard';
  return 'basic';
}

export function canTransition(currentStatus: TransactionStatus, newStatus: TransactionStatus): boolean {
  const config = TRANSACTION_STATUS_CONFIG[currentStatus];
  return config.nextStatuses.includes(newStatus);
}

export function getAssetTypesByCategory(category: AssetCategory): AssetType[] {
  return (Object.entries(ASSET_TYPE_CONFIG) as [AssetType, AssetTypeConfig][])
    .filter(([_, config]) => config.category === category)
    .map(([type]) => type);
}

export function getJurisdictionsByRegion(region: JurisdictionConfig['region']): JurisdictionConfig[] {
  return JURISDICTIONS.filter(j => j.region === region);
}
