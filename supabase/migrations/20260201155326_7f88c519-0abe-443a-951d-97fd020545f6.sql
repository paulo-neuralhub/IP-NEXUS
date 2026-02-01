-- ════════════════════════════════════════════════════════════════════════════
-- Actualizar check constraint de category para incluir nuevas categorías PI
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE document_templates DROP CONSTRAINT IF EXISTS document_templates_category_check;

ALTER TABLE document_templates ADD CONSTRAINT document_templates_category_check 
CHECK (category = ANY (ARRAY[
  'trademark'::text, 
  'patent'::text, 
  'contract'::text, 
  'correspondence'::text, 
  'report'::text, 
  'other'::text, 
  'billing'::text, 
  'documents'::text, 
  'certificate'::text,
  -- Nuevas categorías PI
  'power_of_attorney'::text,
  'assignment'::text,
  'declaration'::text,
  'filing'::text,
  'official'::text,
  'invoice'::text,
  'evidence'::text
]));

-- ════════════════════════════════════════════════════════════════════════════
-- SEED: DOCUMENT_TEMPLATES - Plantillas principales PI (Sistema)
-- ════════════════════════════════════════════════════════════════════════════

-- Función auxiliar para insertar o actualizar templates del sistema
CREATE OR REPLACE FUNCTION upsert_system_template(
  p_code TEXT,
  p_name TEXT,
  p_category TEXT,
  p_right_type TEXT,
  p_jur_code TEXT,
  p_phase TEXT,
  p_variables TEXT[],
  p_template TEXT,
  p_tags TEXT[]
) RETURNS void AS $$
DECLARE
  v_jur_id UUID;
BEGIN
  -- Obtener jurisdiction_id si existe
  IF p_jur_code IS NOT NULL THEN
    SELECT id INTO v_jur_id FROM jurisdictions WHERE code = p_jur_code LIMIT 1;
  END IF;

  -- Verificar si existe template del sistema con ese código
  IF EXISTS (SELECT 1 FROM document_templates WHERE code = p_code AND organization_id IS NULL) THEN
    -- Actualizar
    UPDATE document_templates SET
      name = p_name,
      category = p_category,
      right_type = p_right_type,
      jurisdiction_id = v_jur_id,
      typical_phase = p_phase,
      variable_codes = p_variables,
      template_content = p_template,
      content_html = p_template,
      tags = p_tags,
      updated_at = now()
    WHERE code = p_code AND organization_id IS NULL;
  ELSE
    -- Insertar
    INSERT INTO document_templates (
      code, name, category, right_type, jurisdiction_id, typical_phase,
      format, requires_signature, signature_type, variable_codes,
      template_content, content_html, tags, is_active, is_system_template, organization_id
    ) VALUES (
      p_code, p_name, p_category, p_right_type, v_jur_id, p_phase,
      'html', true, 'client', p_variables,
      p_template, p_template, p_tags, true, true, NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- PODERES
SELECT upsert_system_template(
  'POA_ES', 'Power of Attorney - Spain', 'power_of_attorney', 'all', 'ES', 'F1',
  ARRAY['{{client_name}}', '{{client_address}}', '{{org_name}}', '{{today_date}}'],
  '<h1>PODER DE REPRESENTACIÓN</h1><p>En {{today_date}}</p><p>D./Dña. <strong>{{client_name}}</strong>, con domicilio en {{client_address}}, en su propio nombre y representación,</p><p><strong>CONFIERE PODER</strong></p><p>A favor de <strong>{{org_name}}</strong>, para que en su nombre y representación pueda realizar cuantos actos y gestiones sean necesarios ante la Oficina Española de Patentes y Marcas...</p>',
  ARRAY['spain','oepm','poder']
);

SELECT upsert_system_template(
  'POA_EU', 'Power of Attorney - EUIPO', 'power_of_attorney', 'all', 'EU', 'F1',
  ARRAY['{{client_name}}', '{{client_address}}', '{{org_name}}', '{{today_date}}'],
  '<h1>POWER OF ATTORNEY</h1><p>Date: {{today_date}}</p><p>The undersigned, <strong>{{client_name}}</strong>, having its address at {{client_address}},</p><p><strong>HEREBY APPOINTS</strong></p><p><strong>{{org_name}}</strong> as representative before the European Union Intellectual Property Office (EUIPO)...</p>',
  ARRAY['euipo','power','authorization']
);

SELECT upsert_system_template(
  'POA_USPTO', 'Power of Attorney - USPTO', 'power_of_attorney', 'all', 'US', 'F1',
  ARRAY['{{client_name}}', '{{client_address}}', '{{org_name}}', '{{agent_number}}'],
  '<h1>POWER OF ATTORNEY</h1><p>As a named applicant, I hereby appoint:</p><p><strong>{{org_name}}</strong><br/>Registration Number: {{agent_number}}</p><p>as my attorney(s) or agent(s) to prosecute applications before the United States Patent and Trademark Office...</p>',
  ARRAY['uspto','power','attorney']
);

-- DECLARACIONES
SELECT upsert_system_template(
  'DECL_USE_US', 'Declaration of Use (§8)', 'declaration', 'trademark', 'US', 'F8',
  ARRAY['{{matter_reference}}', '{{registration_number}}', '{{client_name}}', '{{today_date}}'],
  '<h1>DECLARATION OF USE OF MARK IN COMMERCE</h1><p>Under Section 8 of the Trademark Act</p><p>Registration Number: {{registration_number}}</p><p>The undersigned, <strong>{{client_name}}</strong>, being the owner of the above registration, declares that:</p><p>The mark is in use in commerce on or in connection with all goods/services listed in the registration...</p>',
  ARRAY['uspto','section8','use','declaration']
);

SELECT upsert_system_template(
  'DECL_INCONTESTABLE', 'Declaration of Incontestability (§15)', 'declaration', 'trademark', 'US', 'F8',
  ARRAY['{{matter_reference}}', '{{registration_number}}', '{{client_name}}'],
  '<h1>DECLARATION OF INCONTESTABILITY</h1><p>Under Section 15 of the Trademark Act</p><p>Registration Number: {{registration_number}}</p><p>The undersigned, <strong>{{client_name}}</strong>, declares that the mark has been in continuous use in commerce for five consecutive years...</p>',
  ARRAY['uspto','section15','incontestability']
);

SELECT upsert_system_template(
  'DECL_PRIORITY', 'Priority Declaration', 'declaration', 'all', NULL, 'F2',
  ARRAY['{{matter_reference}}', '{{priority_number}}', '{{priority_date}}', '{{jurisdiction_name}}'],
  '<h1>PRIORITY CLAIM DECLARATION</h1><p>In connection with application {{matter_reference}}, priority is hereby claimed based on:</p><p>Prior Application Number: {{priority_number}}<br/>Filing Date: {{priority_date}}<br/>Country: {{jurisdiction_name}}</p>',
  ARRAY['priority','paris','convention']
);

-- CORRESPONDENCIA
SELECT upsert_system_template(
  'LETTER_CLIENT_STATUS', 'Status Update Letter', 'correspondence', 'all', NULL, NULL,
  ARRAY['{{client_name}}', '{{matter_reference}}', '{{matter_title}}', '{{today_date}}', '{{org_name}}'],
  '<p>{{today_date}}</p><p>Dear {{client_name}},</p><p>Re: {{matter_reference}} - {{matter_title}}</p><p>We are writing to provide you with an update on the status of the above-referenced matter...</p><p>Best regards,<br/>{{org_name}}</p>',
  ARRAY['correspondence','client','status']
);

SELECT upsert_system_template(
  'LETTER_OFFICE_RESPONSE', 'Office Action Response Cover', 'correspondence', 'all', NULL, 'F3',
  ARRAY['{{office_name}}', '{{matter_reference}}', '{{application_number}}', '{{today_date}}'],
  '<p>{{today_date}}</p><p>{{office_name}}</p><p>Re: Application No. {{application_number}}<br/>Our Ref: {{matter_reference}}</p><p>Dear Sir/Madam,</p><p>In response to the Office Action dated [DATE], please find enclosed our response...</p>',
  ARRAY['correspondence','office','response']
);

-- INFORMES
SELECT upsert_system_template(
  'REPORT_SEARCH', 'Search Report', 'report', 'trademark', NULL, 'F1',
  ARRAY['{{matter_reference}}', '{{matter_title}}', '{{nice_classes}}', '{{today_date}}', '{{client_name}}'],
  '<h1>TRADEMARK SEARCH REPORT</h1><p>Date: {{today_date}}</p><p>Client: {{client_name}}</p><p>Mark: {{matter_title}}</p><p>Classes: {{nice_classes}}</p><h2>1. SCOPE OF SEARCH</h2><p>The search was conducted in the following databases...</p><h2>2. FINDINGS</h2><h2>3. RECOMMENDATIONS</h2>',
  ARRAY['search','clearance','report']
);

SELECT upsert_system_template(
  'REPORT_RENEWAL', 'Renewal Report', 'report', 'all', NULL, 'F8',
  ARRAY['{{matter_reference}}', '{{registration_number}}', '{{expiry_date}}', '{{client_name}}'],
  '<h1>RENEWAL REPORT</h1><p>Registration: {{registration_number}}</p><p>Expiry Date: {{expiry_date}}</p><p>Client: {{client_name}}</p><h2>Renewal Requirements</h2><h2>Fees</h2><h2>Recommended Action</h2>',
  ARRAY['renewal','report','maintenance']
);

-- CERTIFICADOS/RECIBOS
SELECT upsert_system_template(
  'RECEIPT_FILING', 'Filing Receipt', 'certificate', 'all', NULL, 'F2',
  ARRAY['{{matter_reference}}', '{{matter_title}}', '{{filing_date}}', '{{application_number}}', '{{client_name}}'],
  '<h1>FILING RECEIPT</h1><p>We confirm that the following application has been filed:</p><table><tr><td>Reference:</td><td>{{matter_reference}}</td></tr><tr><td>Title/Mark:</td><td>{{matter_title}}</td></tr><tr><td>Filing Date:</td><td>{{filing_date}}</td></tr><tr><td>Application No:</td><td>{{application_number}}</td></tr><tr><td>Applicant:</td><td>{{client_name}}</td></tr></table>',
  ARRAY['filing','receipt','confirmation']
);

SELECT upsert_system_template(
  'RECEIPT_REGISTRATION', 'Registration Certificate', 'certificate', 'all', NULL, 'F8',
  ARRAY['{{matter_reference}}', '{{matter_title}}', '{{registration_number}}', '{{registration_date}}', '{{client_name}}'],
  '<h1>REGISTRATION CERTIFICATE</h1><p>This is to certify that the following has been registered:</p><table><tr><td>Registration No:</td><td>{{registration_number}}</td></tr><tr><td>Title/Mark:</td><td>{{matter_title}}</td></tr><tr><td>Registration Date:</td><td>{{registration_date}}</td></tr><tr><td>Owner:</td><td>{{client_name}}</td></tr></table>',
  ARRAY['registration','certificate','confirmation']
);

-- Limpiar función temporal
DROP FUNCTION IF EXISTS upsert_system_template;