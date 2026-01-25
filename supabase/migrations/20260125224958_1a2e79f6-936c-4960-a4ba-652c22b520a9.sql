-- First, update the category check constraint to include billing document types
ALTER TABLE document_templates DROP CONSTRAINT document_templates_category_check;

ALTER TABLE document_templates ADD CONSTRAINT document_templates_category_check 
CHECK (category = ANY (ARRAY['trademark', 'patent', 'contract', 'correspondence', 'report', 'other', 'billing', 'documents', 'certificate']));

-- Now insert system document templates
INSERT INTO document_templates (
  organization_id, code, name, description, document_type, category,
  is_system_template, layout, template_content, template_type,
  show_logo, show_header, show_footer,
  body_sections, custom_texts, type_config,
  numbering_prefix, numbering_digits,
  is_active, is_default
) VALUES
-- INVOICE TEMPLATES
(
  NULL, 'INV_CLASSIC',
  'Factura Clásica', 'Diseño profesional tradicional para facturas',
  'invoice', 'billing', true, 'classic',
  '{"sections": ["header", "client", "items", "totals", "payment", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "items_table", "columns": ["description", "quantity", "unit_price", "total"]}, {"type": "totals", "show_subtotal": true, "show_tax": true}]'::jsonb,
  '{"invoice_title": "FACTURA", "date_label": "Fecha", "due_date_label": "Vencimiento"}'::jsonb,
  '{"show_qr": true, "show_bank_details": true}'::jsonb,
  'INV-', 5, true, true
),
(
  NULL, 'INV_MODERN',
  'Factura Moderna', 'Diseño limpio y contemporáneo',
  'invoice', 'billing', true, 'modern',
  '{"sections": ["header", "client", "items", "totals", "payment", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "items_table", "columns": ["description", "quantity", "unit_price", "total"]}, {"type": "totals", "show_subtotal": true, "show_tax": true}]'::jsonb,
  '{"invoice_title": "FACTURA", "date_label": "Fecha de emisión", "due_date_label": "Fecha de vencimiento"}'::jsonb,
  '{"show_qr": true, "show_bank_details": true, "accent_style": "gradient"}'::jsonb,
  'INV-', 5, true, false
),
(
  NULL, 'INV_MINIMAL',
  'Factura Minimalista', 'Diseño simple y elegante',
  'invoice', 'billing', true, 'minimal',
  '{"sections": ["header", "client", "items", "totals", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "items_table", "columns": ["description", "quantity", "unit_price", "total"]}, {"type": "totals", "show_subtotal": true, "show_tax": true}]'::jsonb,
  '{"invoice_title": "Factura", "date_label": "Fecha", "due_date_label": "Vencimiento"}'::jsonb,
  '{"show_qr": false, "show_bank_details": true}'::jsonb,
  'F', 6, true, false
),
(
  NULL, 'INV_CORPORATE',
  'Factura Corporativa', 'Diseño formal para grandes empresas',
  'invoice', 'billing', true, 'corporate',
  '{"sections": ["header", "client", "reference", "items", "totals", "payment", "terms", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "items_table", "columns": ["code", "description", "quantity", "unit_price", "discount", "total"]}, {"type": "totals", "show_subtotal": true, "show_discount": true, "show_tax": true}]'::jsonb,
  '{"invoice_title": "FACTURA COMERCIAL", "date_label": "Fecha de emisión", "due_date_label": "Fecha de vencimiento", "reference_label": "Referencia"}'::jsonb,
  '{"show_qr": true, "show_bank_details": true, "show_terms": true}'::jsonb,
  'FC-', 6, true, false
),

-- QUOTE TEMPLATES
(
  NULL, 'QUOTE_CLASSIC',
  'Presupuesto Clásico', 'Diseño profesional para presupuestos',
  'quote', 'billing', true, 'classic',
  '{"sections": ["header", "client", "items", "totals", "validity", "terms", "signature", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "items_table", "columns": ["description", "quantity", "unit_price", "total"]}, {"type": "category_subtotals", "enabled": true}, {"type": "totals", "show_subtotal": true, "show_tax": true}]'::jsonb,
  '{"quote_title": "PRESUPUESTO", "date_label": "Fecha", "validity_label": "Válido hasta", "acceptance_text": "Acepto las condiciones del presente presupuesto"}'::jsonb,
  '{"show_validity": true, "validity_days": 30, "show_acceptance": true, "show_signature": true}'::jsonb,
  'PRES-', 5, true, true
),
(
  NULL, 'QUOTE_DETAILED',
  'Presupuesto Detallado', 'Presupuesto con desglose por categorías',
  'quote', 'billing', true, 'modern',
  '{"sections": ["header", "client", "summary", "categories", "items", "totals", "terms", "signature", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "category_sections", "enabled": true}, {"type": "items_table", "columns": ["description", "official_fees", "professional_fees", "total"]}, {"type": "totals", "show_subtotal": true, "show_official_fees": true, "show_professional_fees": true, "show_tax": true}]'::jsonb,
  '{"quote_title": "PRESUPUESTO DETALLADO", "official_fees_label": "Tasas Oficiales", "professional_fees_label": "Honorarios Profesionales"}'::jsonb,
  '{"show_categories": true, "show_fee_breakdown": true, "show_validity": true, "validity_days": 30}'::jsonb,
  'PD-', 5, true, false
),

-- CERTIFICATE TEMPLATES
(
  NULL, 'CERT_REGISTRATION',
  'Certificado de Registro', 'Certificado elegante de registro de marca/patente',
  'certificate', 'certificate', true, 'certificate',
  '{"sections": ["ornament_top", "logo", "title", "body", "details", "signature", "seal", "ornament_bottom"]}',
  'fill_blanks', true, false, true,
  '[{"type": "certificate_body", "fields": ["mark_name", "registration_number", "registration_date", "owner", "classes"]}, {"type": "signature_block", "show_date": true, "show_seal": true}]'::jsonb,
  '{"title": "CERTIFICADO DE REGISTRO", "subtitle": "Registro de Marca", "certify_text": "Se certifica que la marca descrita a continuación ha sido debidamente registrada"}'::jsonb,
  '{"show_ornaments": true, "show_seal": true, "paper_style": "elegant"}'::jsonb,
  'CERT-', 6, true, true
),
(
  NULL, 'CERT_FILING',
  'Certificado de Presentación', 'Prueba de presentación de solicitud',
  'certificate', 'certificate', true, 'certificate',
  '{"sections": ["logo", "title", "body", "details", "signature", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "certificate_body", "fields": ["application_number", "filing_date", "applicant", "mark_name", "classes"]}, {"type": "signature_block", "show_date": true}]'::jsonb,
  '{"title": "CERTIFICADO DE PRESENTACIÓN", "certify_text": "Se certifica que se ha presentado la siguiente solicitud"}'::jsonb,
  '{"show_ornaments": false, "formal_style": true}'::jsonb,
  'PRES-', 6, true, false
),

-- LETTER TEMPLATES
(
  NULL, 'LETTER_FORMAL',
  'Carta Formal', 'Carta estándar de correspondencia profesional',
  'letter', 'correspondence', true, 'letter',
  '{"sections": ["header", "date", "recipient", "reference", "salutation", "body", "closing", "signature", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "letter_body", "paragraph_style": "justified"}, {"type": "signature_block", "show_name": true, "show_title": true}]'::jsonb,
  '{"salutation": "Muy Sres. nuestros:", "closing": "Atentamente,"}'::jsonb,
  '{"formal_style": true, "show_reference": true}'::jsonb,
  NULL, 4, true, true
),
(
  NULL, 'LETTER_NOTIFICATION',
  'Carta de Notificación', 'Notificación con lista de acciones destacadas',
  'letter', 'correspondence', true, 'letter',
  '{"sections": ["header", "date", "recipient", "reference", "salutation", "body", "action_list", "closing", "signature", "footer"]}',
  'fill_blanks', true, true, true,
  '[{"type": "letter_body"}, {"type": "action_list", "highlight": true, "numbered": true}, {"type": "signature_block"}]'::jsonb,
  '{"salutation": "Estimado/a cliente:", "closing": "Quedamos a su disposición,"}'::jsonb,
  '{"show_action_list": true, "highlight_actions": true}'::jsonb,
  NULL, 4, true, false
),

-- REPORT TEMPLATES
(
  NULL, 'REPORT_SURVEILLANCE',
  'Informe de Vigilancia', 'Informe de resultados de vigilancia de marca',
  'report', 'report', true, 'modern',
  '{"sections": ["cover", "summary", "findings", "details", "recommendations", "appendix"]}',
  'fill_blanks', true, true, true,
  '[{"type": "executive_summary"}, {"type": "findings_table", "columns": ["mark", "applicant", "classes", "similarity", "risk"]}, {"type": "recommendations"}]'::jsonb,
  '{"title": "INFORME DE VIGILANCIA", "period_label": "Período analizado", "findings_label": "Resultados encontrados"}'::jsonb,
  '{"show_cover": true, "show_toc": true, "show_charts": true}'::jsonb,
  'VIG-', 6, true, true
);