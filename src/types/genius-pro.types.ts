// src/types/genius-pro.types.ts

export type DocumentType = 
  | 'opposition'           // Oposición de marca
  | 'cease_desist'         // Carta de cese y desistimiento
  | 'response_office_action' // Respuesta a office action
  | 'appeal'               // Recurso
  | 'license_draft'        // Borrador de licencia
  | 'assignment_draft'     // Borrador de cesión
  | 'infringement_notice'  // Notificación de infracción
  | 'coexistence_agreement' // Acuerdo de coexistencia
  | 'observations'         // Observaciones de tercero
  | 'cancellation';        // Solicitud de cancelación

export type DocumentTone = 'diplomatic' | 'professional' | 'aggressive' | 'formal';

export type VerificationStatus = 'pending' | 'verified' | 'has_warnings' | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TrademarkMark {
  text: string;
  imageUrl?: string;
  classes?: number[];
  goods?: string[];
  registrationNumber?: string;
  registrationDate?: string;
  registrationOffice?: string;
  applicationNumber?: string;
  filingDate?: string;
  applicant?: string;
  publicationDate?: string;
  reputation?: boolean;
  proofOfUse?: string[];
}

export interface PhoneticDetails {
  levenshtein: number;
  soundex: { a: string; b: string; match: boolean };
  metaphone: { a: string[]; b: string[]; match: boolean };
  syllables: { a: string[]; b: string[]; common: string[] };
  syllableMatch?: number;
}

export interface TrademarkAnalysis {
  visual: {
    score: number;
    analysis: string;
    factors: string[];
  };
  phonetic: {
    score: number;
    analysis: string;
    syllables: { a: string[]; b: string[] };
    algorithms: PhoneticDetails;
  };
  conceptual: {
    score: number;
    analysis: string;
    concepts: { a: string[]; b: string[] };
    overlap: string[];
  };
  goods: {
    score: number;
    analysis: string;
    identicalClasses: number[];
    similarClasses: number[];
  };
}

export interface TrademarkComparison {
  id?: string;
  markA: TrademarkMark;
  markB: TrademarkMark;
  analysis: TrademarkAnalysis;
  overall: {
    riskLevel: RiskLevel;
    score: number;
    recommendation: string;
  };
}

export interface LegalCitation {
  id: string;
  sourceId: string;
  sourceType: 'law' | 'case' | 'guideline';
  reference: string;
  text: string;
  relevance: number; // 0-100
  url?: string;
  verified: boolean;
}

export interface VerificationWarning {
  type: 'citation_not_found' | 'outdated_law' | 'missing_precedent' | 'fee_changed' | 'content_mismatch';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface EstimatedFees {
  office: string;
  baseFee: number;
  additionalFees: Array<{ description: string; amount: number }>;
  total: number;
  currency: string;
  lastUpdated: string;
  disclaimer: string;
}

export interface LegalArgument {
  point: string;
  basis: LegalCitation[];
  strength: 'weak' | 'moderate' | 'strong';
}

export interface GeneratedDocument {
  id: string;
  documentType: DocumentType;
  title: string;
  contentHtml: string;
  contentMarkdown: string;
  
  // Analysis
  trademarkAnalysis?: TrademarkComparison;
  legalAnalysis: {
    applicableLaws: LegalCitation[];
    relevantCases: LegalCitation[];
    arguments: LegalArgument[];
  };
  
  // Verification
  verificationStatus: VerificationStatus;
  verificationWarnings: VerificationWarning[];
  
  // Citations
  citations: LegalCitation[];
  
  // Fees
  estimatedFees?: EstimatedFees;
  
  // Metadata
  tone: DocumentTone;
  language: string;
  jurisdiction: string;
  
  createdAt: string;
}

export interface OppositionInput {
  // Opponent (you)
  opponent: {
    name: string;
    address?: string;
    email?: string;
    taxId?: string;
    representative?: string;
  };
  
  // Your earlier mark
  earlierMark: TrademarkMark;
  
  // Contested mark
  contestedMark: TrademarkMark;
  
  // Grounds
  grounds?: string[];
  additionalArguments?: string;
  
  // Options
  office?: string;
  tone?: DocumentTone;
  language?: string;
}

export interface CeaseDesistInput {
  sender: {
    name: string;
    address: string;
    email: string;
    phone?: string;
  };
  recipient: {
    name: string;
    address?: string;
    email?: string;
  };
  infringement: {
    description: string;
    evidenceUrls?: string[];
    firstDetectedDate?: string;
  };
  yourRights: {
    markText: string;
    registrationNumber: string;
    registrationOffice: string;
    classes: number[];
  };
  demands: {
    ceaseUse: boolean;
    removeFromSale: boolean;
    removeFromWeb: boolean;
    destroyInventory: boolean;
    compensation?: number;
    responseDeadlineDays: number;
  };
  options: {
    tone: DocumentTone;
    language: 'es' | 'en' | 'fr' | 'de';
  };
}

// Database types
export interface GeniusLegalSource {
  id: string;
  source_type: 'law' | 'regulation' | 'case' | 'template' | 'guideline';
  jurisdiction: string;
  title: string;
  reference_number: string | null;
  content: string;
  effective_date: string | null;
  expiry_date: string | null;
  language: string;
  url: string | null;
  version: number;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeniusGeneratedDocument {
  id: string;
  organization_id: string;
  user_id: string;
  document_type: DocumentType;
  title: string | null;
  input_data: Record<string, unknown>;
  content_html: string | null;
  content_markdown: string | null;
  trademark_analysis: TrademarkComparison | null;
  legal_analysis: Record<string, unknown> | null;
  risk_assessment: Record<string, unknown> | null;
  citations: LegalCitation[];
  verification_status: VerificationStatus;
  verification_warnings: VerificationWarning[];
  verified_at: string | null;
  export_formats: Record<string, string>;
  user_approved: boolean;
  user_notes: string | null;
  tone: DocumentTone;
  jurisdiction?: string;
  status?: string;
  disclaimer_accepted: boolean;
  disclaimer_accepted_at: string | null;
  estimated_fees: EstimatedFees | null;
  created_at: string;
  updated_at: string;
}

export interface GeniusOfficialFee {
  id: string;
  office: string;
  procedure_type: string;
  fee_name: string;
  base_fee: number;
  amount: number;
  currency: string;
  per_class_fee: number | null;
  extension_fee: number | null;
  effective_from: string;
  effective_until: string | null;
  source_url: string | null;
  last_verified_at: string | null;
  created_at: string;
}
