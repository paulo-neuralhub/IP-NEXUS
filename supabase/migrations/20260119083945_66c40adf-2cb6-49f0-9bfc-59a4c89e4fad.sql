-- ============================================
-- GENIUS PRO: Legal Knowledge Base (RAG)
-- ============================================

CREATE TABLE public.genius_legal_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source info
  source_type VARCHAR(50) NOT NULL, -- 'law', 'regulation', 'case', 'template', 'guideline'
  jurisdiction VARCHAR(50) NOT NULL, -- 'EU', 'ES', 'US', 'INT', etc.
  
  -- Document
  title VARCHAR(500) NOT NULL,
  reference_number VARCHAR(200), -- 'EUTMR', 'T-123/24', etc.
  
  -- Content
  content TEXT NOT NULL,
  
  -- Metadata
  effective_date DATE,
  expiry_date DATE,
  language VARCHAR(5) DEFAULT 'es',
  url TEXT, -- Link to official source
  
  -- Versioning
  version INTEGER DEFAULT 1,
  is_current BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_genius_legal_sources_type ON public.genius_legal_sources(source_type, jurisdiction);
CREATE INDEX idx_genius_legal_sources_current ON public.genius_legal_sources(is_current) WHERE is_current = true;

-- ============================================
-- GENIUS PRO: Generated Documents
-- ============================================

CREATE TABLE public.genius_generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Document type
  document_type VARCHAR(50) NOT NULL,
  -- 'opposition', 'cease_desist', 'response_office_action', 'appeal', 
  -- 'license_draft', 'assignment_draft', 'infringement_notice', 'coexistence_agreement'
  
  title VARCHAR(500),
  
  -- Input data
  input_data JSONB NOT NULL,
  
  -- Generated content
  content_html TEXT,
  content_markdown TEXT,
  
  -- Analysis results
  trademark_analysis JSONB, -- Visual, phonetic, conceptual scores
  legal_analysis JSONB, -- Applicable laws, precedents
  risk_assessment JSONB,
  
  -- Citations used
  citations JSONB DEFAULT '[]', -- Array of source IDs used
  
  -- Verification
  verification_status VARCHAR(30) DEFAULT 'pending',
  -- 'pending', 'verified', 'has_warnings', 'failed'
  verification_warnings JSONB DEFAULT '[]',
  verified_at TIMESTAMPTZ,
  
  -- Export
  export_formats JSONB DEFAULT '{}', -- { pdf: url, docx: url, xml: url }
  
  -- User review
  user_approved BOOLEAN DEFAULT false,
  user_notes TEXT,
  
  -- Tone/style
  tone VARCHAR(30) DEFAULT 'professional', -- 'diplomatic', 'professional', 'aggressive'
  
  -- Disclaimers
  disclaimer_accepted BOOLEAN DEFAULT false,
  disclaimer_accepted_at TIMESTAMPTZ,
  
  -- Estimated fees
  estimated_fees JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_genius_docs_org ON public.genius_generated_documents(organization_id);
CREATE INDEX idx_genius_docs_user ON public.genius_generated_documents(user_id);
CREATE INDEX idx_genius_docs_type ON public.genius_generated_documents(document_type);

-- ============================================
-- GENIUS PRO: Trademark Comparisons
-- ============================================

CREATE TABLE public.genius_trademark_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Marks being compared
  mark_a_text VARCHAR(500),
  mark_a_image_url TEXT,
  mark_a_classes INTEGER[],
  mark_a_goods TEXT,
  
  mark_b_text VARCHAR(500),
  mark_b_image_url TEXT,
  mark_b_classes INTEGER[],
  mark_b_goods TEXT,
  
  -- Analysis scores (0-100)
  visual_similarity INTEGER,
  visual_analysis TEXT,
  
  phonetic_similarity INTEGER,
  phonetic_analysis TEXT,
  phonetic_details JSONB,
  
  conceptual_similarity INTEGER,
  conceptual_analysis TEXT,
  conceptual_details JSONB,
  
  goods_similarity INTEGER,
  goods_analysis TEXT,
  goods_details JSONB,
  
  -- Overall
  overall_risk VARCHAR(30), -- 'low', 'medium', 'high', 'critical'
  overall_score INTEGER,
  recommendation TEXT,
  
  -- Methodology
  analysis_methodology JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_genius_comparisons_org ON public.genius_trademark_comparisons(organization_id);

-- ============================================
-- GENIUS PRO: Official Fees (Updatable)
-- ============================================

CREATE TABLE public.genius_official_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  office VARCHAR(50) NOT NULL, -- 'EUIPO', 'OEPM', 'USPTO', etc.
  procedure_type VARCHAR(100) NOT NULL, -- 'opposition', 'appeal', 'renewal', etc.
  
  base_fee DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Additional fees
  per_class_fee DECIMAL(10,2),
  extension_fee DECIMAL(10,2),
  
  -- Validity
  effective_from DATE NOT NULL,
  effective_until DATE,
  
  -- Source
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_genius_fees_office ON public.genius_official_fees(office, procedure_type);

-- Insert current official fees
INSERT INTO public.genius_official_fees (office, procedure_type, base_fee, currency, effective_from, source_url, last_verified_at) VALUES
('EUIPO', 'opposition', 320.00, 'EUR', '2024-01-01', 'https://euipo.europa.eu/ohimportal/en/fees-and-payments', NOW()),
('EUIPO', 'appeal', 720.00, 'EUR', '2024-01-01', 'https://euipo.europa.eu/ohimportal/en/fees-and-payments', NOW()),
('EUIPO', 'cancellation', 630.00, 'EUR', '2024-01-01', 'https://euipo.europa.eu/ohimportal/en/fees-and-payments', NOW()),
('OEPM', 'opposition', 170.61, 'EUR', '2024-01-01', 'https://www.oepm.es/es/tasas/', NOW()),
('OEPM', 'appeal', 256.06, 'EUR', '2024-01-01', 'https://www.oepm.es/es/tasas/', NOW()),
('USPTO', 'opposition', 600.00, 'USD', '2024-01-01', 'https://www.uspto.gov/trademarks/fees', NOW()),
('USPTO', 'appeal', 200.00, 'USD', '2024-01-01', 'https://www.uspto.gov/trademarks/fees', NOW()),
('WIPO', 'opposition', 0.00, 'CHF', '2024-01-01', 'https://www.wipo.int/madrid/en/fees/', NOW());

-- ============================================
-- RLS POLICIES
-- ============================================

-- Legal sources (read-only for authenticated users)
ALTER TABLE public.genius_legal_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read legal sources"
ON public.genius_legal_sources FOR SELECT
TO authenticated
USING (true);

-- Generated documents (org-scoped)
ALTER TABLE public.genius_generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org generated documents"
ON public.genius_generated_documents FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create generated documents in own org"
ON public.genius_generated_documents FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own generated documents"
ON public.genius_generated_documents FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own generated documents"
ON public.genius_generated_documents FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trademark comparisons (org-scoped)
ALTER TABLE public.genius_trademark_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org comparisons"
ON public.genius_trademark_comparisons FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comparisons in own org"
ON public.genius_trademark_comparisons FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own comparisons"
ON public.genius_trademark_comparisons FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Official fees (read-only for all authenticated)
ALTER TABLE public.genius_official_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read official fees"
ON public.genius_official_fees FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- Trigger for updated_at
-- ============================================

CREATE TRIGGER update_genius_generated_documents_updated_at
BEFORE UPDATE ON public.genius_generated_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();