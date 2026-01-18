-- =====================================================
-- TARIFAS OFICIALES (fees de oficinas)
-- =====================================================
CREATE TABLE official_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Clasificación
  office TEXT NOT NULL,
  ip_type TEXT NOT NULL CHECK (ip_type IN ('trademark', 'patent', 'design', 'domain', 'copyright')),
  fee_type TEXT NOT NULL CHECK (fee_type IN (
    'filing', 'examination', 'publication', 'registration',
    'renewal', 'opposition', 'appeal', 'annuity',
    'restoration', 'assignment', 'license', 'other'
  )),
  
  -- Importe
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Variaciones
  per_class BOOLEAN DEFAULT false,
  base_classes INT DEFAULT 1,
  extra_class_fee DECIMAL(10,2),
  
  -- Vigencia
  effective_from DATE NOT NULL,
  effective_until DATE,
  is_current BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  source_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(code, effective_from)
);

-- =====================================================
-- TARIFAS DE SERVICIOS (honorarios propios)
-- =====================================================
CREATE TABLE service_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  category TEXT NOT NULL CHECK (category IN (
    'filing', 'prosecution', 'renewal', 'opposition',
    'litigation', 'advisory', 'search', 'watch',
    'valuation', 'other'
  )),
  ip_type TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  fee_model TEXT DEFAULT 'fixed' CHECK (fee_model IN (
    'fixed', 'hourly', 'percentage', 'per_class', 'tiered'
  )),
  
  hourly_rate DECIMAL(10,2),
  estimated_hours DECIMAL(5,2),
  percentage_rate DECIMAL(5,2),
  percentage_base TEXT,
  per_class_fee DECIMAL(10,2),
  base_classes INT DEFAULT 1,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, code)
);

-- =====================================================
-- CLIENTES FACTURACIÓN
-- =====================================================
CREATE TABLE billing_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  contact_id UUID REFERENCES contacts(id),
  
  legal_name TEXT NOT NULL,
  tax_id TEXT,
  tax_id_type TEXT,
  
  billing_address TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'ES',
  
  billing_email TEXT,
  billing_phone TEXT,
  
  default_currency TEXT DEFAULT 'EUR',
  payment_terms INT DEFAULT 30,
  tax_exempt BOOLEAN DEFAULT false,
  
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FACTURAS
-- =====================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  invoice_number TEXT NOT NULL,
  invoice_series TEXT,
  
  billing_client_id UUID NOT NULL REFERENCES billing_clients(id),
  
  client_name TEXT NOT NULL,
  client_tax_id TEXT,
  client_address TEXT,
  
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 21,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'paid',
    'partial', 'overdue', 'cancelled', 'refunded'
  )),
  
  paid_amount DECIMAL(12,2) DEFAULT 0,
  paid_date DATE,
  payment_method TEXT,
  payment_reference TEXT,
  
  notes TEXT,
  internal_notes TEXT,
  footer_text TEXT,
  
  pdf_url TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  
  UNIQUE(organization_id, invoice_number, invoice_series)
);

-- =====================================================
-- COSTES DE EXPEDIENTE
-- =====================================================
CREATE TABLE matter_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  
  cost_type TEXT NOT NULL CHECK (cost_type IN (
    'official_fee', 'service_fee', 'third_party', 'translation', 'other'
  )),
  
  official_fee_id UUID REFERENCES official_fees(id),
  service_fee_id UUID REFERENCES service_fees(id),
  
  description TEXT NOT NULL,
  notes TEXT,
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  exchange_rate DECIMAL(10,6) DEFAULT 1,
  amount_local DECIMAL(10,2),
  
  quantity INT DEFAULT 1,
  total_amount DECIMAL(10,2),
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'invoiced', 'cancelled'
  )),
  
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  
  is_billable BOOLEAN DEFAULT true,
  invoice_id UUID REFERENCES invoices(id),
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LÍNEAS DE FACTURA
-- =====================================================
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  line_number INT NOT NULL,
  
  matter_cost_id UUID REFERENCES matter_costs(id),
  matter_id UUID REFERENCES matters(id),
  
  description TEXT NOT NULL,
  
  quantity DECIMAL(10,3) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  
  tax_rate DECIMAL(5,2),
  tax_amount DECIMAL(12,2),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRESUPUESTOS
-- =====================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  quote_number TEXT NOT NULL,
  
  billing_client_id UUID REFERENCES billing_clients(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  
  client_name TEXT NOT NULL,
  client_email TEXT,
  
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 21,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted',
    'rejected', 'expired', 'converted'
  )),
  
  converted_invoice_id UUID REFERENCES invoices(id),
  converted_at TIMESTAMPTZ,
  
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  
  pdf_url TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(organization_id, quote_number)
);

-- =====================================================
-- LÍNEAS DE PRESUPUESTO
-- =====================================================
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  line_number INT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  
  service_fee_id UUID REFERENCES service_fees(id),
  official_fee_id UUID REFERENCES official_fees(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RENOVACIONES PENDIENTES
-- =====================================================
CREATE TABLE renewal_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  
  renewal_type TEXT NOT NULL CHECK (renewal_type IN (
    'trademark_renewal', 'patent_annuity', 'design_renewal', 'domain_renewal'
  )),
  
  due_date DATE NOT NULL,
  grace_period_end DATE,
  
  official_fee_estimate DECIMAL(10,2),
  service_fee_estimate DECIMAL(10,2),
  total_estimate DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  
  status TEXT DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'due', 'in_grace', 'instructed',
    'processing', 'completed', 'abandoned', 'missed'
  )),
  
  client_instruction TEXT CHECK (client_instruction IN ('renew', 'abandon', 'pending')),
  instruction_date DATE,
  instruction_by UUID REFERENCES users(id),
  
  matter_cost_id UUID REFERENCES matter_costs(id),
  
  reminders_sent JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VALORACIÓN DE PORTFOLIO
-- =====================================================
CREATE TABLE portfolio_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  total_matters INT DEFAULT 0,
  total_value DECIMAL(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  breakdown_by_type JSONB DEFAULT '{}',
  breakdown_by_jurisdiction JSONB DEFAULT '{}',
  breakdown_by_status JSONB DEFAULT '{}',
  
  methodology TEXT,
  assumptions TEXT,
  notes TEXT,
  report_url TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VALORACIÓN POR ACTIVO
-- =====================================================
CREATE TABLE matter_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_valuation_id UUID REFERENCES portfolio_valuations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  
  estimated_value DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  
  factors JSONB DEFAULT '{}',
  methodology TEXT,
  calculation_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_official_fees_office ON official_fees(office, ip_type);
CREATE INDEX idx_official_fees_current ON official_fees(is_current, code);
CREATE INDEX idx_service_fees_org ON service_fees(organization_id);
CREATE INDEX idx_service_fees_category ON service_fees(category);
CREATE INDEX idx_matter_costs_org ON matter_costs(organization_id);
CREATE INDEX idx_matter_costs_matter ON matter_costs(matter_id);
CREATE INDEX idx_matter_costs_status ON matter_costs(status);
CREATE INDEX idx_matter_costs_date ON matter_costs(cost_date);
CREATE INDEX idx_billing_clients_org ON billing_clients(organization_id);
CREATE INDEX idx_billing_clients_contact ON billing_clients(contact_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_client ON invoices(billing_client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status NOT IN ('paid', 'cancelled');
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_matter ON invoice_items(matter_id);
CREATE INDEX idx_quotes_org ON quotes(organization_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_renewal_schedule_org ON renewal_schedule(organization_id);
CREATE INDEX idx_renewal_schedule_matter ON renewal_schedule(matter_id);
CREATE INDEX idx_renewal_schedule_due ON renewal_schedule(due_date);
CREATE INDEX idx_renewal_schedule_status ON renewal_schedule(status);
CREATE INDEX idx_portfolio_valuations_org ON portfolio_valuations(organization_id);
CREATE INDEX idx_matter_valuations_portfolio ON matter_valuations(portfolio_valuation_id);
CREATE INDEX idx_matter_valuations_matter ON matter_valuations(matter_id);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE official_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_valuations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public official_fees" ON official_fees FOR SELECT USING (true);

CREATE POLICY "Org service_fees" ON service_fees FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org matter_costs" ON matter_costs FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org billing_clients" ON billing_clients FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org invoices" ON invoices FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org invoice_items" ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Org quotes" ON quotes FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org quote_items" ON quote_items FOR ALL USING (
  quote_id IN (SELECT id FROM quotes WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

CREATE POLICY "Org renewal_schedule" ON renewal_schedule FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org portfolio_valuations" ON portfolio_valuations FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org matter_valuations" ON matter_valuations FOR ALL USING (
  matter_id IN (SELECT id FROM matters WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Calculate total_amount when inserting/updating matter_costs
CREATE OR REPLACE FUNCTION calculate_matter_cost_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount := NEW.amount * COALESCE(NEW.quantity, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER matter_cost_calculate_total
  BEFORE INSERT OR UPDATE ON matter_costs
  FOR EACH ROW EXECUTE FUNCTION calculate_matter_cost_total();

-- Calcular totales de factura
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;
  
  UPDATE invoices SET
    subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM invoice_items WHERE invoice_id = v_invoice_id),
    tax_amount = (SELECT COALESCE(SUM(COALESCE(tax_amount, 0)), 0) FROM invoice_items WHERE invoice_id = v_invoice_id),
    total = (SELECT COALESCE(SUM(subtotal + COALESCE(tax_amount, 0)), 0) FROM invoice_items WHERE invoice_id = v_invoice_id),
    updated_at = NOW()
  WHERE id = v_invoice_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER invoice_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Actualizar estado de coste cuando se factura
CREATE OR REPLACE FUNCTION mark_cost_invoiced()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.matter_cost_id IS NOT NULL THEN
    UPDATE matter_costs SET
      status = 'invoiced',
      invoice_id = NEW.invoice_id,
      updated_at = NOW()
    WHERE id = NEW.matter_cost_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER invoice_item_mark_cost
  AFTER INSERT ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION mark_cost_invoiced();

-- =====================================================
-- DATOS INICIALES - TARIFAS OFICIALES
-- =====================================================

-- Tarifas EUIPO (2024)
INSERT INTO official_fees (code, name, office, ip_type, fee_type, amount, per_class, base_classes, extra_class_fee, effective_from) VALUES
  ('EUIPO_TM_FILING_ONLINE', 'Solicitud marca UE online', 'EUIPO', 'trademark', 'filing', 850, true, 1, 50, '2024-01-01'),
  ('EUIPO_TM_FILING_PAPER', 'Solicitud marca UE papel', 'EUIPO', 'trademark', 'filing', 1000, true, 1, 50, '2024-01-01'),
  ('EUIPO_TM_RENEWAL', 'Renovación marca UE', 'EUIPO', 'trademark', 'renewal', 850, true, 1, 50, '2024-01-01'),
  ('EUIPO_TM_OPPOSITION', 'Oposición marca UE', 'EUIPO', 'trademark', 'opposition', 320, false, 0, 0, '2024-01-01'),
  ('EUIPO_DESIGN_FILING', 'Solicitud diseño UE', 'EUIPO', 'design', 'filing', 350, false, 0, 0, '2024-01-01'),
  ('EUIPO_DESIGN_RENEWAL', 'Renovación diseño UE', 'EUIPO', 'design', 'renewal', 90, false, 0, 0, '2024-01-01')
ON CONFLICT DO NOTHING;

-- Tarifas OEPM (2024)
INSERT INTO official_fees (code, name, office, ip_type, fee_type, amount, per_class, base_classes, extra_class_fee, effective_from) VALUES
  ('OEPM_TM_FILING', 'Solicitud marca España', 'OEPM', 'trademark', 'filing', 144.58, true, 1, 95.54, '2024-01-01'),
  ('OEPM_TM_RENEWAL', 'Renovación marca España', 'OEPM', 'trademark', 'renewal', 154.44, true, 1, 103.83, '2024-01-01'),
  ('OEPM_PATENT_FILING', 'Solicitud patente España', 'OEPM', 'patent', 'filing', 104.95, false, 0, 0, '2024-01-01'),
  ('OEPM_PATENT_EXAM', 'Examen patente España', 'OEPM', 'patent', 'examination', 404.17, false, 0, 0, '2024-01-01')
ON CONFLICT DO NOTHING;

-- Tarifas WIPO Madrid
INSERT INTO official_fees (code, name, office, ip_type, fee_type, amount, currency, per_class, base_classes, extra_class_fee, effective_from) VALUES
  ('WIPO_MADRID_BASE', 'Tasa base Madrid', 'WIPO', 'trademark', 'filing', 653, 'CHF', true, 3, 100, '2024-01-01'),
  ('WIPO_MADRID_COMPLEMENTARY', 'Tasa complementaria Madrid', 'WIPO', 'trademark', 'filing', 100, 'CHF', false, 0, 0, '2024-01-01')
ON CONFLICT DO NOTHING;

-- Anualidades patente EPO
INSERT INTO official_fees (code, name, office, ip_type, fee_type, amount, effective_from, notes) VALUES
  ('EPO_ANNUITY_3', 'Anualidad EPO año 3', 'EPO', 'patent', 'annuity', 530, '2024-01-01', 'Tercer año'),
  ('EPO_ANNUITY_4', 'Anualidad EPO año 4', 'EPO', 'patent', 'annuity', 660, '2024-01-01', 'Cuarto año'),
  ('EPO_ANNUITY_5', 'Anualidad EPO año 5', 'EPO', 'patent', 'annuity', 920, '2024-01-01', 'Quinto año'),
  ('EPO_ANNUITY_6', 'Anualidad EPO año 6', 'EPO', 'patent', 'annuity', 1175, '2024-01-01', 'Sexto año'),
  ('EPO_ANNUITY_10', 'Anualidad EPO año 10', 'EPO', 'patent', 'annuity', 1640, '2024-01-01', 'Décimo año'),
  ('EPO_ANNUITY_20', 'Anualidad EPO año 20', 'EPO', 'patent', 'annuity', 1640, '2024-01-01', 'Vigésimo año')
ON CONFLICT DO NOTHING;