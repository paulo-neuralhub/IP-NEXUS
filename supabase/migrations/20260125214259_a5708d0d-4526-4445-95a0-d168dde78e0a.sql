-- Add missing columns to document_template_variables
ALTER TABLE public.document_template_variables 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Update null codes in document_templates
UPDATE public.document_templates 
SET code = 'template_' || id::text
WHERE code IS NULL;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'document_templates_org_code_unique'
  ) THEN
    ALTER TABLE public.document_templates 
    ADD CONSTRAINT document_templates_org_code_unique 
    UNIQUE (organization_id, code);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON public.document_templates(document_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_system ON public.document_templates(is_system_template);
CREATE INDEX IF NOT EXISTS idx_document_template_variables_type ON public.document_template_variables(document_type);

-- Seed all variables
INSERT INTO public.document_template_variables (document_type, variable_code, variable_name, variable_group, example_value, sort_order) VALUES
-- Invoice variables
('invoice', 'invoice.number', 'Número factura', 'Factura', 'INV-2025-0001', 1),
('invoice', 'invoice.date', 'Fecha emisión', 'Factura', '25/01/2025', 2),
('invoice', 'invoice.due_date', 'Fecha vencimiento', 'Factura', '25/02/2025', 3),
('invoice', 'invoice.subtotal', 'Subtotal', 'Factura', '1.250,00 €', 4),
('invoice', 'invoice.tax_rate', 'Tipo IVA', 'Factura', '21%', 5),
('invoice', 'invoice.tax_amount', 'Importe IVA', 'Factura', '262,50 €', 6),
('invoice', 'invoice.total', 'Total', 'Factura', '1.512,50 €', 7),
('invoice', 'invoice.status', 'Estado', 'Factura', 'Pendiente', 8),
('invoice', 'invoice.notes', 'Notas', 'Factura', 'Gracias por confiar en nosotros', 9),
('invoice', 'client.name', 'Nombre cliente', 'Cliente', 'ACME Corporation', 10),
('invoice', 'client.tax_id', 'NIF/CIF cliente', 'Cliente', 'B12345678', 11),
('invoice', 'client.address', 'Dirección cliente', 'Cliente', 'Calle Mayor 123', 12),
('invoice', 'client.city', 'Ciudad cliente', 'Cliente', 'Madrid', 13),
('invoice', 'client.postal_code', 'CP cliente', 'Cliente', '28001', 14),
('invoice', 'client.country', 'País cliente', 'Cliente', 'España', 15),
('invoice', 'client.email', 'Email cliente', 'Cliente', 'cliente@acme.com', 16),
('invoice', 'company.name', 'Nombre empresa', 'Empresa', 'Mi Despacho SL', 20),
('invoice', 'company.legal_name', 'Razón social', 'Empresa', 'Mi Despacho Legal SL', 21),
('invoice', 'company.tax_id', 'NIF empresa', 'Empresa', 'B87654321', 22),
('invoice', 'company.address', 'Dirección empresa', 'Empresa', 'Paseo de la Castellana 50', 23),
('invoice', 'company.city', 'Ciudad empresa', 'Empresa', 'Madrid', 24),
('invoice', 'company.postal_code', 'CP empresa', 'Empresa', '28046', 25),
('invoice', 'company.phone', 'Teléfono empresa', 'Empresa', '+34 91 123 45 67', 26),
('invoice', 'company.email', 'Email empresa', 'Empresa', 'info@midespacho.com', 27),
('invoice', 'company.website', 'Web empresa', 'Empresa', 'www.midespacho.com', 28),
('invoice', 'company.bank_iban', 'IBAN', 'Empresa', 'ES12 3456 7890 1234 5678 9012', 29),
('invoice', 'company.bank_swift', 'SWIFT/BIC', 'Empresa', 'CAIXESBBXXX', 30),
('invoice', 'company.registry_info', 'Datos registrales', 'Empresa', 'Inscrita en el RM de Madrid', 31),
-- Quote variables
('quote', 'quote.number', 'Número presupuesto', 'Presupuesto', 'Q-2025-0042', 1),
('quote', 'quote.date', 'Fecha emisión', 'Presupuesto', '25/01/2025', 2),
('quote', 'quote.valid_until', 'Válido hasta', 'Presupuesto', '25/02/2025', 3),
('quote', 'quote.subtotal', 'Subtotal', 'Presupuesto', '850,00 €', 4),
('quote', 'quote.tax_rate', 'Tipo IVA', 'Presupuesto', '21%', 5),
('quote', 'quote.tax_amount', 'Importe IVA', 'Presupuesto', '178,50 €', 6),
('quote', 'quote.total', 'Total', 'Presupuesto', '1.028,50 €', 7),
('quote', 'quote.description', 'Descripción', 'Presupuesto', 'Servicios de registro de marca', 8),
('quote', 'quote.status', 'Estado', 'Presupuesto', 'Pendiente', 9),
('quote', 'quote.notes', 'Notas', 'Presupuesto', 'Presupuesto sin compromiso', 10),
('quote', 'quote.terms', 'Condiciones', 'Presupuesto', 'Pago a 30 días', 11),
('quote', 'matter.reference', 'Referencia expediente', 'Expediente', 'ACME-2025-001', 15),
('quote', 'matter.mark_name', 'Nombre marca', 'Expediente', 'ACME', 16),
('quote', 'matter.jurisdiction', 'Jurisdicción', 'Expediente', 'España', 17),
('quote', 'matter.type', 'Tipo expediente', 'Expediente', 'Marca', 18),
('quote', 'client.name', 'Nombre cliente', 'Cliente', 'ACME Corporation', 20),
('quote', 'client.tax_id', 'NIF/CIF cliente', 'Cliente', 'B12345678', 21),
('quote', 'client.address', 'Dirección cliente', 'Cliente', 'Calle Mayor 123', 22),
('quote', 'client.city', 'Ciudad cliente', 'Cliente', 'Madrid', 23),
('quote', 'client.email', 'Email cliente', 'Cliente', 'cliente@acme.com', 24),
('quote', 'company.name', 'Nombre empresa', 'Empresa', 'Mi Despacho SL', 30),
('quote', 'company.legal_name', 'Razón social', 'Empresa', 'Mi Despacho Legal SL', 31),
('quote', 'company.tax_id', 'NIF empresa', 'Empresa', 'B87654321', 32),
('quote', 'company.address', 'Dirección empresa', 'Empresa', 'Paseo de la Castellana 50', 33),
('quote', 'company.phone', 'Teléfono empresa', 'Empresa', '+34 91 123 45 67', 34),
('quote', 'company.email', 'Email empresa', 'Empresa', 'info@midespacho.com', 35),
('quote', 'company.website', 'Web empresa', 'Empresa', 'www.midespacho.com', 36),
-- Certificate variables
('certificate', 'certificate.number', 'Número certificado', 'Certificado', 'CERT-2025-0001', 1),
('certificate', 'certificate.date', 'Fecha emisión', 'Certificado', '25/01/2025', 2),
('certificate', 'certificate.title', 'Título', 'Certificado', 'Certificado de Registro', 3),
('certificate', 'certificate.type', 'Tipo certificado', 'Certificado', 'Registro de Marca', 4),
('certificate', 'matter.reference', 'Referencia', 'Expediente', 'ACME-2025-001', 10),
('certificate', 'matter.mark_name', 'Nombre marca', 'Expediente', 'ACME', 11),
('certificate', 'matter.registration_number', 'Nº registro', 'Expediente', 'M1234567', 12),
('certificate', 'matter.registration_date', 'Fecha registro', 'Expediente', '15/01/2025', 13),
('certificate', 'matter.expiry_date', 'Fecha caducidad', 'Expediente', '15/01/2035', 14),
('certificate', 'matter.jurisdiction', 'Jurisdicción', 'Expediente', 'España', 15),
('certificate', 'matter.classes', 'Clases', 'Expediente', '9, 35, 42', 16),
('certificate', 'client.name', 'Nombre titular', 'Titular', 'ACME Corporation', 20),
('certificate', 'client.tax_id', 'NIF/CIF titular', 'Titular', 'B12345678', 21),
('certificate', 'company.name', 'Nombre empresa', 'Empresa', 'Mi Despacho SL', 30),
('certificate', 'company.signatory', 'Firmante', 'Empresa', 'Juan García López', 31),
('certificate', 'company.signatory_title', 'Cargo firmante', 'Empresa', 'Director', 32),
-- Letter variables
('letter', 'letter.date', 'Fecha', 'Carta', '25/01/2025', 1),
('letter', 'letter.reference', 'Referencia', 'Carta', 'REF/2025/001', 2),
('letter', 'letter.subject', 'Asunto', 'Carta', 'Comunicación sobre su expediente', 3),
('letter', 'letter.salutation', 'Saludo', 'Carta', 'Estimado/a cliente', 4),
('letter', 'letter.body', 'Cuerpo', 'Carta', 'Le informamos...', 5),
('letter', 'letter.closing', 'Despedida', 'Carta', 'Atentamente', 6),
('letter', 'recipient.name', 'Nombre destinatario', 'Destinatario', 'D. Juan Pérez', 10),
('letter', 'recipient.title', 'Tratamiento', 'Destinatario', 'D./Dña.', 11),
('letter', 'recipient.company', 'Empresa destinatario', 'Destinatario', 'ACME Corporation', 12),
('letter', 'recipient.address', 'Dirección', 'Destinatario', 'Calle Mayor 123', 13),
('letter', 'recipient.city', 'Ciudad', 'Destinatario', 'Madrid', 14),
('letter', 'matter.reference', 'Ref. expediente', 'Expediente', 'ACME-2025-001', 20),
('letter', 'matter.mark_name', 'Marca', 'Expediente', 'ACME', 21),
('letter', 'company.name', 'Nombre empresa', 'Empresa', 'Mi Despacho SL', 30),
('letter', 'company.signatory', 'Firmante', 'Empresa', 'Juan García López', 31),
('letter', 'company.signatory_title', 'Cargo', 'Empresa', 'Director', 32),
-- Report variables
('report', 'report.title', 'Título informe', 'Informe', 'Informe de Vigilancia', 1),
('report', 'report.date', 'Fecha', 'Informe', '25/01/2025', 2),
('report', 'report.period', 'Período', 'Informe', 'Enero 2025', 3),
('report', 'report.type', 'Tipo informe', 'Informe', 'Vigilancia de marca', 4),
('report', 'report.summary', 'Resumen ejecutivo', 'Informe', 'Durante el período...', 5),
('report', 'report.conclusions', 'Conclusiones', 'Informe', 'Se recomienda...', 6),
('report', 'matter.reference', 'Ref. expediente', 'Expediente', 'ACME-2025-001', 10),
('report', 'matter.mark_name', 'Marca vigilada', 'Expediente', 'ACME', 11),
('report', 'report.findings_count', 'Nº resultados', 'Resultados', '15', 20),
('report', 'report.risk_level', 'Nivel de riesgo', 'Resultados', 'Medio', 21),
('report', 'report.action_required', 'Acción requerida', 'Resultados', 'Sí', 22),
('report', 'client.name', 'Cliente', 'Cliente', 'ACME Corporation', 30),
('report', 'company.name', 'Empresa', 'Empresa', 'Mi Despacho SL', 40),
('report', 'company.analyst', 'Analista', 'Empresa', 'María López', 41)
ON CONFLICT (document_type, variable_code) DO NOTHING;