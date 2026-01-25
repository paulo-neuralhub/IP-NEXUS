-- ============================================================
-- STEP 1: Add columns to document_templates first
-- ============================================================

ALTER TABLE public.document_templates
ADD COLUMN IF NOT EXISTS code VARCHAR,
ADD COLUMN IF NOT EXISTS document_type VARCHAR,
ADD COLUMN IF NOT EXISTS is_system_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS based_on_template_id UUID REFERENCES public.document_templates(id),
ADD COLUMN IF NOT EXISTS layout VARCHAR DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS custom_colors JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS show_logo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_header BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS header_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS body_sections JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS footer_content JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_texts JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS type_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS numbering_prefix VARCHAR,
ADD COLUMN IF NOT EXISTS numbering_suffix VARCHAR,
ADD COLUMN IF NOT EXISTS numbering_digits INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;