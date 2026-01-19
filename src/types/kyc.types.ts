// src/types/kyc.types.ts

// ============================================
// KYC LEVELS (5 niveles)
// ============================================

export type KycLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const KYC_LEVELS: Record<KycLevel, {
  name: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
  requirements: string[];
  benefits: { en: string; es: string }[];
  limits: {
    maxTransactionValue: number | null;
    maxMonthlyVolume: number | null;
    canSell: boolean;
    canBuy: boolean;
    canAuction: boolean;
    canUsePremiumFeatures: boolean;
  };
  color: string;
}> = {
  0: {
    name: 'unverified',
    label: { en: 'Unverified', es: 'Sin verificar' },
    description: { 
      en: 'Account created but not verified',
      es: 'Cuenta creada pero sin verificar'
    },
    requirements: [],
    benefits: [
      { en: 'Browse marketplace', es: 'Navegar el marketplace' },
      { en: 'Save favorites', es: 'Guardar favoritos' },
    ],
    limits: {
      maxTransactionValue: 0,
      maxMonthlyVolume: 0,
      canSell: false,
      canBuy: false,
      canAuction: false,
      canUsePremiumFeatures: false,
    },
    color: 'gray',
  },
  1: {
    name: 'basic',
    label: { en: 'Basic', es: 'Básico' },
    description: {
      en: 'Email verified, basic profile completed',
      es: 'Email verificado, perfil básico completado'
    },
    requirements: ['email_verified', 'profile_complete'],
    benefits: [
      { en: 'Send inquiries', es: 'Enviar consultas' },
      { en: 'Make offers up to €5,000', es: 'Hacer ofertas hasta €5,000' },
      { en: 'Basic messaging', es: 'Mensajería básica' },
    ],
    limits: {
      maxTransactionValue: 5000,
      maxMonthlyVolume: 10000,
      canSell: false,
      canBuy: true,
      canAuction: false,
      canUsePremiumFeatures: false,
    },
    color: 'blue',
  },
  2: {
    name: 'verified',
    label: { en: 'Verified', es: 'Verificado' },
    description: {
      en: 'Identity verified with government ID',
      es: 'Identidad verificada con documento oficial'
    },
    requirements: ['email_verified', 'profile_complete', 'identity_verified', 'phone_verified'],
    benefits: [
      { en: 'Transactions up to €50,000', es: 'Transacciones hasta €50,000' },
      { en: 'Sell assets', es: 'Vender activos' },
      { en: 'Verified badge', es: 'Insignia de verificado' },
      { en: 'Priority support', es: 'Soporte prioritario' },
    ],
    limits: {
      maxTransactionValue: 50000,
      maxMonthlyVolume: 100000,
      canSell: true,
      canBuy: true,
      canAuction: false,
      canUsePremiumFeatures: false,
    },
    color: 'green',
  },
  3: {
    name: 'enhanced',
    label: { en: 'Enhanced', es: 'Mejorado' },
    description: {
      en: 'Address verified, enhanced due diligence',
      es: 'Dirección verificada, diligencia debida mejorada'
    },
    requirements: ['email_verified', 'profile_complete', 'identity_verified', 'phone_verified', 'address_verified', 'source_of_funds'],
    benefits: [
      { en: 'Transactions up to €250,000', es: 'Transacciones hasta €250,000' },
      { en: 'Participate in auctions', es: 'Participar en subastas' },
      { en: 'Premium features', es: 'Funciones premium' },
      { en: 'Reduced fees', es: 'Comisiones reducidas' },
    ],
    limits: {
      maxTransactionValue: 250000,
      maxMonthlyVolume: 500000,
      canSell: true,
      canBuy: true,
      canAuction: true,
      canUsePremiumFeatures: true,
    },
    color: 'purple',
  },
  4: {
    name: 'business',
    label: { en: 'Business', es: 'Empresarial' },
    description: {
      en: 'Business entity verified',
      es: 'Entidad empresarial verificada'
    },
    requirements: ['email_verified', 'profile_complete', 'identity_verified', 'phone_verified', 'address_verified', 'source_of_funds', 'business_verified', 'ubo_verified'],
    benefits: [
      { en: 'Transactions up to €1,000,000', es: 'Transacciones hasta €1,000,000' },
      { en: 'Corporate account', es: 'Cuenta corporativa' },
      { en: 'API access', es: 'Acceso API' },
      { en: 'Dedicated account manager', es: 'Gestor de cuenta dedicado' },
    ],
    limits: {
      maxTransactionValue: 1000000,
      maxMonthlyVolume: 5000000,
      canSell: true,
      canBuy: true,
      canAuction: true,
      canUsePremiumFeatures: true,
    },
    color: 'amber',
  },
  5: {
    name: 'agent',
    label: { en: 'Licensed Agent', es: 'Agente Autorizado' },
    description: {
      en: 'Licensed IP professional',
      es: 'Profesional de PI autorizado'
    },
    requirements: ['email_verified', 'profile_complete', 'identity_verified', 'phone_verified', 'address_verified', 'source_of_funds', 'business_verified', 'ubo_verified', 'agent_license_verified', 'professional_insurance'],
    benefits: [
      { en: 'Unlimited transactions', es: 'Transacciones ilimitadas' },
      { en: 'Agent badge', es: 'Insignia de agente' },
      { en: 'Featured listings', es: 'Listings destacados' },
      { en: 'White-label options', es: 'Opciones marca blanca' },
      { en: 'Lowest fees', es: 'Comisiones más bajas' },
    ],
    limits: {
      maxTransactionValue: null,
      maxMonthlyVolume: null,
      canSell: true,
      canBuy: true,
      canAuction: true,
      canUsePremiumFeatures: true,
    },
    color: 'indigo',
  },
};

// ============================================
// VERIFICATION TYPES
// ============================================

export type VerificationType = 
  | 'email'
  | 'phone'
  | 'identity'
  | 'address'
  | 'source_of_funds'
  | 'business'
  | 'ubo'
  | 'agent_license'
  | 'professional_insurance';

export type VerificationStatus = 
  | 'not_started'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface VerificationRecord {
  id: string;
  user_id: string;
  type: VerificationType;
  status: VerificationStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  expires_at?: string;
  rejection_reason?: string;
  documents?: VerificationDocument[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  verification_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'verified' | 'rejected';
  extracted_data?: Record<string, any>;
  rejection_reason?: string;
  uploaded_at: string;
}

export type DocumentType = 
  | 'passport'
  | 'national_id'
  | 'drivers_license'
  | 'residence_permit'
  | 'utility_bill'
  | 'bank_statement'
  | 'tax_return'
  | 'company_registration'
  | 'articles_of_incorporation'
  | 'shareholder_register'
  | 'agent_license'
  | 'insurance_certificate'
  | 'power_of_attorney'
  | 'selfie'
  | 'other';

export const DOCUMENT_TYPES: Record<DocumentType, {
  label: { en: string; es: string };
  description: { en: string; es: string };
  acceptedFormats: string[];
  maxSize: number;
  required_for: VerificationType[];
}> = {
  passport: {
    label: { en: 'Passport', es: 'Pasaporte' },
    description: { en: 'Valid passport photo page', es: 'Página de foto del pasaporte válido' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10,
    required_for: ['identity'],
  },
  national_id: {
    label: { en: 'National ID', es: 'DNI/Cédula' },
    description: { en: 'Front and back of national ID', es: 'Anverso y reverso del documento' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10,
    required_for: ['identity'],
  },
  drivers_license: {
    label: { en: "Driver's License", es: 'Carnet de conducir' },
    description: { en: 'Valid drivers license', es: 'Carnet de conducir válido' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10,
    required_for: ['identity'],
  },
  residence_permit: {
    label: { en: 'Residence Permit', es: 'Permiso de residencia' },
    description: { en: 'Valid residence permit', es: 'Permiso de residencia válido' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10,
    required_for: ['identity'],
  },
  utility_bill: {
    label: { en: 'Utility Bill', es: 'Factura de servicios' },
    description: { en: 'Recent utility bill (< 3 months)', es: 'Factura reciente (< 3 meses)' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10,
    required_for: ['address'],
  },
  bank_statement: {
    label: { en: 'Bank Statement', es: 'Extracto bancario' },
    description: { en: 'Recent bank statement (< 3 months)', es: 'Extracto bancario reciente (< 3 meses)' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['address', 'source_of_funds'],
  },
  tax_return: {
    label: { en: 'Tax Return', es: 'Declaración de impuestos' },
    description: { en: 'Most recent tax return', es: 'Última declaración de impuestos' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['source_of_funds'],
  },
  company_registration: {
    label: { en: 'Company Registration', es: 'Registro mercantil' },
    description: { en: 'Certificate of incorporation', es: 'Certificado de constitución' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['business'],
  },
  articles_of_incorporation: {
    label: { en: 'Articles of Incorporation', es: 'Estatutos sociales' },
    description: { en: 'Company articles/bylaws', es: 'Estatutos de la empresa' },
    acceptedFormats: ['application/pdf'],
    maxSize: 20,
    required_for: ['business'],
  },
  shareholder_register: {
    label: { en: 'Shareholder Register', es: 'Registro de accionistas' },
    description: { en: 'Current shareholder register', es: 'Registro actual de accionistas' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['ubo'],
  },
  agent_license: {
    label: { en: 'Agent License', es: 'Licencia de agente' },
    description: { en: 'IP agent/attorney license', es: 'Licencia de agente/abogado PI' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['agent_license'],
  },
  insurance_certificate: {
    label: { en: 'Insurance Certificate', es: 'Certificado de seguro' },
    description: { en: 'Professional liability insurance', es: 'Seguro de responsabilidad civil profesional' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: ['professional_insurance'],
  },
  power_of_attorney: {
    label: { en: 'Power of Attorney', es: 'Poder notarial' },
    description: { en: 'If acting on behalf of another', es: 'Si actúa en representación de otro' },
    acceptedFormats: ['application/pdf'],
    maxSize: 10,
    required_for: [],
  },
  selfie: {
    label: { en: 'Selfie', es: 'Selfie' },
    description: { en: 'Photo holding your ID', es: 'Foto sosteniendo tu documento' },
    acceptedFormats: ['image/jpeg', 'image/png'],
    maxSize: 10,
    required_for: ['identity'],
  },
  other: {
    label: { en: 'Other Document', es: 'Otro documento' },
    description: { en: 'Additional supporting document', es: 'Documento adicional de soporte' },
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 20,
    required_for: [],
  },
};

// ============================================
// COMPLIANCE TYPES
// ============================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceCheck {
  id: string;
  user_id: string;
  check_type: 'aml' | 'sanctions' | 'pep' | 'adverse_media';
  status: 'pending' | 'clear' | 'flagged' | 'blocked';
  risk_score: number;
  risk_level: RiskLevel;
  provider: string;
  provider_reference?: string;
  results?: Record<string, any>;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  expires_at: string;
}

export interface RiskAssessment {
  id: string;
  user_id: string;
  overall_score: number;
  overall_level: RiskLevel;
  factors: {
    kyc_level: number;
    transaction_volume: number;
    transaction_frequency: number;
    geographic_risk: number;
    product_risk: number;
    behavior_risk: number;
  };
  flags: string[];
  recommendations: string[];
  calculated_at: string;
  valid_until?: string;
}

// ============================================
// MODERATION TYPES
// ============================================

export type ReportType = 
  | 'spam'
  | 'fraud'
  | 'counterfeit'
  | 'inappropriate_content'
  | 'copyright_violation'
  | 'misleading_info'
  | 'harassment'
  | 'other';

export type ReportStatus = 
  | 'pending'
  | 'under_review'
  | 'resolved_valid'
  | 'resolved_invalid'
  | 'escalated';

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_entity_type: 'listing' | 'user' | 'message' | 'review';
  reported_entity_id: string;
  report_type: ReportType;
  description: string;
  evidence_urls?: string[];
  status: ReportStatus;
  assigned_to?: string;
  resolution_notes?: string;
  action_taken?: 'none' | 'warning' | 'content_removed' | 'user_suspended' | 'user_banned';
  created_at: string;
  resolved_at?: string;
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  target_type: 'listing' | 'user' | 'message' | 'review';
  target_id: string;
  action: 'approve' | 'reject' | 'remove' | 'warn' | 'suspend' | 'ban' | 'restore';
  reason: string;
  report_id?: string;
  created_at: string;
}

// ============================================
// VERIFICATION STEP CONFIG
// ============================================

export const VERIFICATION_STEPS: Record<VerificationType, {
  label: { en: string; es: string };
  description: { en: string; es: string };
  icon: string;
  requiredDocuments: DocumentType[];
  requiredLevel: KycLevel;
}> = {
  email: {
    label: { en: 'Email Verification', es: 'Verificación de email' },
    description: { en: 'Verify your email address', es: 'Verifica tu dirección de email' },
    icon: 'Mail',
    requiredDocuments: [],
    requiredLevel: 1,
  },
  phone: {
    label: { en: 'Phone Verification', es: 'Verificación de teléfono' },
    description: { en: 'Verify your phone number', es: 'Verifica tu número de teléfono' },
    icon: 'Phone',
    requiredDocuments: [],
    requiredLevel: 2,
  },
  identity: {
    label: { en: 'Identity Verification', es: 'Verificación de identidad' },
    description: { en: 'Verify your identity with a government ID', es: 'Verifica tu identidad con documento oficial' },
    icon: 'User',
    requiredDocuments: ['passport', 'selfie'],
    requiredLevel: 2,
  },
  address: {
    label: { en: 'Address Verification', es: 'Verificación de dirección' },
    description: { en: 'Verify your residential address', es: 'Verifica tu dirección de residencia' },
    icon: 'MapPin',
    requiredDocuments: ['utility_bill'],
    requiredLevel: 3,
  },
  source_of_funds: {
    label: { en: 'Source of Funds', es: 'Origen de fondos' },
    description: { en: 'Verify your source of funds', es: 'Verifica el origen de tus fondos' },
    icon: 'Wallet',
    requiredDocuments: ['bank_statement'],
    requiredLevel: 3,
  },
  business: {
    label: { en: 'Business Verification', es: 'Verificación empresarial' },
    description: { en: 'Verify your business entity', es: 'Verifica tu entidad empresarial' },
    icon: 'Building',
    requiredDocuments: ['company_registration', 'articles_of_incorporation'],
    requiredLevel: 4,
  },
  ubo: {
    label: { en: 'UBO Verification', es: 'Verificación de beneficiarios' },
    description: { en: 'Verify ultimate beneficial owners', es: 'Verifica los beneficiarios finales' },
    icon: 'Users',
    requiredDocuments: ['shareholder_register'],
    requiredLevel: 4,
  },
  agent_license: {
    label: { en: 'Agent License', es: 'Licencia de agente' },
    description: { en: 'Verify your professional license', es: 'Verifica tu licencia profesional' },
    icon: 'Award',
    requiredDocuments: ['agent_license'],
    requiredLevel: 5,
  },
  professional_insurance: {
    label: { en: 'Professional Insurance', es: 'Seguro profesional' },
    description: { en: 'Verify your liability insurance', es: 'Verifica tu seguro de responsabilidad' },
    icon: 'Shield',
    requiredDocuments: ['insurance_certificate'],
    requiredLevel: 5,
  },
};
