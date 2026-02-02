// =====================================================
// IP-NEXUS - HOLDER TYPES (PROMPT 26)
// =====================================================

export type HolderType = 'individual' | 'company' | 'government' | 'organization' | 'trust';

export type RelationshipType = 'representation' | 'subsidiary' | 'affiliate' | 'licensor' | 'licensee';

export type RepresentationScope = 'all' | 'trademarks' | 'patents' | 'designs' | 'specific';

export interface Holder {
  id: string;
  organization_id: string;
  code: string | null;
  holder_type: HolderType;
  legal_name: string;
  trade_name: string | null;
  first_name: string | null;
  last_name: string | null;
  tax_id: string | null;
  tax_id_type: string | null;
  tax_country: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string | null;
  notification_address: {
    address_line1?: string;
    city?: string;
    country?: string;
    attention?: string;
  } | null;
  email: string | null;
  phone: string | null;
  fax: string | null;
  website: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  primary_contact_position: string | null;
  incorporation_country: string | null;
  incorporation_date: string | null;
  incorporation_number: string | null;
  industry: string | null;
  industry_codes: string[] | null;
  preferred_language: string;
  notes: string | null;
  internal_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ClientHolder {
  id: string;
  organization_id: string;
  account_id: string;
  holder_id: string;
  relationship_type: RelationshipType;
  representation_scope: RepresentationScope;
  jurisdictions: string[] | null;
  effective_from: string | null;
  effective_to: string | null;
  is_active: boolean;
  client_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  holder?: Holder;
  account?: {
    id: string;
    name: string;
    account_type: string;
  };
}

export interface HolderFormData {
  holder_type: HolderType;
  legal_name: string;
  trade_name?: string;
  first_name?: string;
  last_name?: string;
  tax_id?: string;
  tax_id_type?: string;
  tax_country?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
  primary_contact_position?: string;
  incorporation_country?: string;
  incorporation_date?: string;
  incorporation_number?: string;
  industry?: string;
  preferred_language?: string;
  notes?: string;
  internal_notes?: string;
}

// Party roles for matter_parties
export type PartyRole = 
  | 'holder' | 'co_holder' | 'applicant' | 'co_applicant'
  | 'assignor' | 'assignee' | 'previous_holder'
  | 'licensor' | 'licensee' | 'sub_licensee'
  | 'opponent' | 'petitioner' | 'defendant' | 'plaintiff' | 'intervener'
  | 'inventor' | 'designer' | 'creator'
  | 'agent' | 'correspondent' | 'interested_party';

export const PARTY_ROLE_LABELS: Record<PartyRole, string> = {
  holder: 'Titular',
  co_holder: 'Co-titular',
  applicant: 'Solicitante',
  co_applicant: 'Co-solicitante',
  assignor: 'Cedente',
  assignee: 'Cesionario',
  previous_holder: 'Titular anterior',
  licensor: 'Licenciante',
  licensee: 'Licenciatario',
  sub_licensee: 'Sub-licenciatario',
  opponent: 'Oponente',
  petitioner: 'Peticionario',
  defendant: 'Demandado',
  plaintiff: 'Demandante',
  intervener: 'Interviniente',
  inventor: 'Inventor',
  designer: 'Diseñador',
  creator: 'Creador/Autor',
  agent: 'Representante',
  correspondent: 'Corresponsal',
  interested_party: 'Parte interesada',
};

export const HOLDER_TYPE_LABELS: Record<HolderType, string> = {
  individual: 'Persona física',
  company: 'Empresa',
  government: 'Entidad gubernamental',
  organization: 'Organización',
  trust: 'Fideicomiso/Trust',
};

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  representation: 'Representación',
  subsidiary: 'Subsidiaria',
  affiliate: 'Afiliada',
  licensor: 'Licenciante',
  licensee: 'Licenciatario',
};
