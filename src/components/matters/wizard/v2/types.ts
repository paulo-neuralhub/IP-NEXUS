// ============================================================
// IP-NEXUS - MATTER WIZARD V2 TYPES
// L132: Types for 6-step matter creation wizard
// ============================================================

import type { NiceSelection } from '../NiceClassWithProductsSelector';

// Party data for step 2
export interface WizardParty {
  id?: string;
  role: string; // owner, applicant, inventor, etc.
  sourceType: 'client' | 'contact' | 'external';
  clientId?: string;
  contactId?: string;
  externalName?: string;
  externalAddress?: string;
  externalCountry?: string;
  externalEmail?: string;
  externalPhone?: string;
  percentage?: number;
  isPrimary?: boolean;
  inventorNationality?: string;
  inventorIdNumber?: string;
  assignmentStatus?: 'pending' | 'signed' | 'not_required';
}

// Priority claim data for step 4
export interface WizardPriority {
  id?: string;
  country: string;
  number: string;
  date: string;
  documentReceived: boolean;
  certifiedCopy: boolean;
}

// Fee/cost line for step 5
export interface WizardFeeLine {
  id: string;
  type: 'official' | 'professional';
  description: string;
  amount: number;
  currency: string;
  quantity: number;
}

// Related matter for step 4
export interface WizardRelatedMatter {
  matterId: string;
  relationshipType: 'derived_from' | 'related_to' | 'replaces';
  matterNumber?: string;
  matterTitle?: string;
}

// Main wizard state
export interface MatterWizardState {
  // Step 1: Type + Jurisdiction
  step1: {
    matterType: string;
    subType?: string; // word, figurative, mixed for trademarks
    jurisdictions: string[];
    filingRoute: 'national' | 'regional' | 'international';
  };
  
  // Step 2: Parties
  step2: {
    clientId: string;
    clientIsOwner: boolean;
    parties: WizardParty[];
    correspondenceAddress: 'client' | 'custom';
    billingAddress: 'client' | 'custom';
    customCorrespondence?: {
      name: string;
      address: string;
      city: string;
      country: string;
      email: string;
    };
  };
  
  // Step 3: Right data (adapts by type/jurisdiction)
  step3: {
    // Common
    title: string;
    
    // Trademark specific
    markName?: string;
    markType?: 'word' | 'figurative' | 'mixed' | '3d' | 'sound' | 'other';
    logoUrl?: string;
    claimedColors?: string;
    markDescription?: string;
    niceClasses?: number[];
    niceClassesDetail?: NiceSelection;
    
    // Patent specific
    inventionTitle?: string;
    abstract?: string;
    ipcClasses?: string[];
    claimsCount?: number;
    drawingsCount?: number;
    hasSequenceListing?: boolean;
    hasSourceCode?: boolean;
    hasBioDeposit?: boolean;
    
    // Jurisdiction-specific fields (JSONB in DB)
    jurisdictionFields?: {
      // USPTO
      usptoBasis?: '1a' | '1b' | '44d' | '44e' | '66a';
      usptoFirstUseDate?: string;
      usptoFirstCommerceDate?: string;
      usptoSpecimenUrl?: string;
      usptoDisclaimer?: string;
      
      // EUIPO
      euipoSecondLanguage?: 'en' | 'de' | 'fr' | 'it' | 'es';
      euipoFastTrack?: boolean;
      euipoSeniority?: {
        country: string;
        number: string;
        date: string;
      };
      
      // WIPO (Madrid)
      wipoBaseCountry?: string;
      wipoBaseType?: 'application' | 'registration';
      wipoBaseNumber?: string;
      wipoBaseDate?: string;
      wipoDesignatedCountries?: string[];
      wipoLimitByCountry?: boolean;
      
      // China
      chinaTranslation?: string;
      chinaPinyin?: string;
      chinaSubclasses?: string[];
      
      // Spain
      oepmModality?: 'normal' | 'accelerated';
      oepmPymeReduction?: boolean;
      oepmIetRequested?: boolean;
    };
  };
  
  // Step 4: Priorities & Related
  step4: {
    priorities: WizardPriority[];
    relatedMatters: WizardRelatedMatter[];
    hasAssignment?: boolean;
    hasLicense?: boolean;
    hasCoOwnership?: boolean;
  };
  
  // Step 5: Fees
  step5: {
    currency: string;
    feeLines: WizardFeeLine[];
    invoiceTiming: 'on_create' | 'on_filing' | 'manual';
    billingContactId?: string;
  };
  
  // Computed
  previewNumber?: string;
}

// Default initial state
export const INITIAL_WIZARD_STATE: MatterWizardState = {
  step1: {
    matterType: '',
    jurisdictions: [],
    filingRoute: 'national',
  },
  step2: {
    clientId: '',
    clientIsOwner: true,
    parties: [],
    correspondenceAddress: 'client',
    billingAddress: 'client',
  },
  step3: {
    title: '',
  },
  step4: {
    priorities: [],
    relatedMatters: [],
  },
  step5: {
    currency: 'EUR',
    feeLines: [],
    invoiceTiming: 'on_create',
  },
};

// Step configuration
export interface WizardStepConfig {
  number: number;
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
}

export const WIZARD_STEPS_CONFIG: WizardStepConfig[] = [
  { number: 1, key: 'type', label: 'Tipo y Jurisdicción', shortLabel: 'Tipo', icon: 'Tag' },
  { number: 2, key: 'parties', label: 'Partes y Roles', shortLabel: 'Partes', icon: 'Users' },
  { number: 3, key: 'data', label: 'Datos del Derecho', shortLabel: 'Datos', icon: 'FileText' },
  { number: 4, key: 'priorities', label: 'Prioridades', shortLabel: 'Prior.', icon: 'Calendar' },
  { number: 5, key: 'fees', label: 'Tasas', shortLabel: 'Tasas', icon: 'Coins' },
  { number: 6, key: 'review', label: 'Crear', shortLabel: 'Crear', icon: 'Check' },
];
