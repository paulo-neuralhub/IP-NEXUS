-- =====================================================
-- PROMPT 35: IMPORT/EXPORT & MIGRATIONS (Parte 2)
-- Crear tablas faltantes y corregir
-- =====================================================

-- Verificar y crear importable_fields si no existe
CREATE TABLE IF NOT EXISTS importable_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_label VARCHAR(150) NOT NULL,
  data_type VARCHAR(30) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_unique BOOLEAN DEFAULT false,
  max_length INTEGER,
  allowed_values TEXT[],
  available_transforms TEXT[],
  description TEXT,
  example_value TEXT,
  display_order INTEGER DEFAULT 0,
  UNIQUE(entity_type, field_name)
);

-- RLS para importable_fields
ALTER TABLE importable_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view importable fields" ON importable_fields;
CREATE POLICY "Anyone can view importable fields"
  ON importable_fields FOR SELECT
  TO authenticated
  USING (true);

-- Insertar o actualizar campos para assets
INSERT INTO importable_fields (entity_type, field_name, field_label, data_type, is_required, description, example_value, display_order, available_transforms)
VALUES 
  ('asset', 'name', 'Nombre', 'string', true, 'Nombre del activo', 'ACME Corporation', 1, ARRAY['trim', 'uppercase', 'lowercase']),
  ('asset', 'ip_type', 'Tipo PI', 'string', true, 'Tipo: trademark, patent, design, etc.', 'trademark', 2, ARRAY['lowercase']),
  ('asset', 'status', 'Estado', 'string', false, 'Estado actual del activo', 'registered', 3, ARRAY['lowercase']),
  ('asset', 'filing_number', 'Nº Solicitud', 'string', false, 'Número de solicitud', '202412345', 4, ARRAY['trim', 'uppercase']),
  ('asset', 'filing_date', 'Fecha Solicitud', 'date', false, 'Fecha de presentación', '2024-01-15', 5, ARRAY['parse_date']),
  ('asset', 'registration_number', 'Nº Registro', 'string', false, 'Número de registro', 'M1234567', 6, ARRAY['trim', 'uppercase']),
  ('asset', 'registration_date', 'Fecha Registro', 'date', false, 'Fecha de registro', '2024-06-15', 7, ARRAY['parse_date']),
  ('asset', 'expiry_date', 'Fecha Expiración', 'date', false, 'Fecha de vencimiento', '2034-06-15', 8, ARRAY['parse_date']),
  ('asset', 'jurisdiction', 'Jurisdicción', 'string', false, 'Código de país/oficina', 'ES', 9, ARRAY['uppercase']),
  ('asset', 'classes', 'Clases Nice', 'array', false, 'Clases de Niza (separadas por coma)', '9,42', 10, ARRAY['split_array']),
  ('asset', 'goods_services', 'Productos/Servicios', 'string', false, 'Descripción de productos/servicios', 'Software...', 11, ARRAY['trim']),
  ('asset', 'owner_name', 'Propietario', 'string', false, 'Nombre del propietario', 'ACME Inc.', 12, ARRAY['trim']),
  ('asset', 'notes', 'Notas', 'string', false, 'Notas adicionales', '', 13, ARRAY['trim']),
  ('asset', 'tags', 'Etiquetas', 'array', false, 'Etiquetas separadas por coma', 'importante,cliente-vip', 14, ARRAY['split_array']),
  ('contact', 'name', 'Nombre', 'string', true, 'Nombre del contacto', 'John Smith', 1, ARRAY['trim']),
  ('contact', 'type', 'Tipo', 'string', false, 'Tipo: client, supplier, agent, applicant', 'client', 2, ARRAY['lowercase']),
  ('contact', 'company_name', 'Empresa', 'string', false, 'Nombre de la empresa', 'ACME Inc.', 3, ARRAY['trim']),
  ('contact', 'email', 'Email', 'string', false, 'Correo electrónico', 'john@acme.com', 4, ARRAY['lowercase', 'trim']),
  ('contact', 'phone', 'Teléfono', 'string', false, 'Número de teléfono', '+34 91 123 4567', 5, ARRAY['trim']),
  ('contact', 'address_line1', 'Dirección', 'string', false, 'Dirección principal', 'Calle Mayor 1', 6, ARRAY['trim']),
  ('contact', 'city', 'Ciudad', 'string', false, 'Ciudad', 'Madrid', 7, ARRAY['trim']),
  ('contact', 'country', 'País', 'string', false, 'Código de país', 'ES', 8, ARRAY['uppercase']),
  ('contact', 'tax_id', 'NIF/VAT', 'string', false, 'Identificador fiscal', 'B12345678', 9, ARRAY['uppercase', 'trim']),
  ('contact', 'notes', 'Notas', 'string', false, 'Notas adicionales', '', 10, ARRAY['trim']),
  ('deadline', 'title', 'Título', 'string', true, 'Título del deadline', 'Renovación marca', 1, ARRAY['trim']),
  ('deadline', 'due_date', 'Fecha Límite', 'date', true, 'Fecha de vencimiento', '2024-12-31', 2, ARRAY['parse_date']),
  ('deadline', 'deadline_type', 'Tipo', 'string', false, 'Tipo de deadline', 'renewal', 3, ARRAY['lowercase']),
  ('deadline', 'priority', 'Prioridad', 'string', false, 'Prioridad: low, medium, high, critical', 'high', 4, ARRAY['lowercase']),
  ('deadline', 'status', 'Estado', 'string', false, 'Estado: pending, in_progress, completed', 'pending', 5, ARRAY['lowercase']),
  ('deadline', 'matter_reference', 'Ref. Expediente', 'string', false, 'Referencia del expediente asociado', 'M-2024-001', 6, ARRAY['uppercase', 'trim']),
  ('deadline', 'notes', 'Notas', 'string', false, 'Notas adicionales', '', 7, ARRAY['trim']),
  ('cost', 'description', 'Descripción', 'string', true, 'Descripción del coste', 'Tasa oficial OEPM', 1, ARRAY['trim']),
  ('cost', 'amount', 'Importe', 'number', true, 'Importe del coste', '350.00', 2, ARRAY['parse_number']),
  ('cost', 'currency', 'Moneda', 'string', false, 'Código de moneda', 'EUR', 3, ARRAY['uppercase']),
  ('cost', 'cost_type', 'Tipo', 'string', false, 'Tipo: official_fee, attorney_fee, expense', 'official_fee', 4, ARRAY['lowercase']),
  ('cost', 'date', 'Fecha', 'date', false, 'Fecha del coste', '2024-01-15', 5, ARRAY['parse_date']),
  ('cost', 'matter_reference', 'Ref. Expediente', 'string', false, 'Referencia del expediente', 'M-2024-001', 6, ARRAY['uppercase', 'trim']),
  ('cost', 'invoice_number', 'Nº Factura', 'string', false, 'Número de factura', 'INV-2024-001', 7, ARRAY['uppercase', 'trim']),
  ('cost', 'notes', 'Notas', 'string', false, 'Notas adicionales', '', 8, ARRAY['trim'])
ON CONFLICT (entity_type, field_name) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  data_type = EXCLUDED.data_type,
  is_required = EXCLUDED.is_required,
  description = EXCLUDED.description,
  example_value = EXCLUDED.example_value,
  display_order = EXCLUDED.display_order,
  available_transforms = EXCLUDED.available_transforms;