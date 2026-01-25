
-- Añadir constraints UNIQUE en code para poder usar ON CONFLICT
ALTER TABLE workflow_templates 
  ADD CONSTRAINT workflow_templates_code_key UNIQUE (code);

ALTER TABLE email_templates 
  ADD CONSTRAINT email_templates_code_key UNIQUE (code);
