-- =============================================
-- WORKFLOW TEMPLATES SYSTEM - EXTEND EXISTING TABLES
-- =============================================

-- 1. Añadir columnas faltantes a workflow_templates
ALTER TABLE workflow_templates 
  ADD COLUMN IF NOT EXISTS steps JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS icon VARCHAR,
  ADD COLUMN IF NOT EXISTS color VARCHAR,
  ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- 2. Añadir columna code a email_templates (usar slug si existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_templates' AND column_name = 'code'
  ) THEN
    ALTER TABLE email_templates ADD COLUMN code VARCHAR;
    -- Copiar valores de slug a code si slug existe
    UPDATE email_templates SET code = slug WHERE slug IS NOT NULL AND code IS NULL;
  END IF;
END $$;

-- Añadir otras columnas faltantes a email_templates
ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS body_html TEXT,
  ADD COLUMN IF NOT EXISTS body_text TEXT,
  ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS language VARCHAR DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_open_rate DECIMAL(5,2);

-- Si body_html está vacío, copiar de html_content
UPDATE email_templates 
SET body_html = html_content 
WHERE body_html IS NULL AND html_content IS NOT NULL;

-- 3. Crear tabla de relación workflow-emails
CREATE TABLE IF NOT EXISTS workflow_template_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
  email_template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  step_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workflow_template_id, email_template_id, step_index)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger_type ON workflow_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_is_active ON workflow_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- 5. RLS para nueva tabla
ALTER TABLE workflow_template_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflow template emails"
  ON workflow_template_emails FOR SELECT
  TO authenticated
  USING (true);

-- 6. Comentarios
COMMENT ON TABLE workflow_template_emails IS 'Relación entre workflows y sus emails';
COMMENT ON COLUMN workflow_templates.steps IS 'Array JSON de pasos: trigger, delay, send_email, create_task, condition, send_notification, update_field, webhook, end';
COMMENT ON COLUMN workflow_templates.category IS 'Categorías: client_management, marketing, reminders, operations, billing';