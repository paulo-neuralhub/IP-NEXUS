-- =============================================
-- PROVISIONES DE FONDOS
-- =============================================
CREATE TABLE IF NOT EXISTS provisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Cliente y expediente
  client_id UUID REFERENCES contacts(id),
  matter_id UUID REFERENCES matters(id),
  
  -- Concepto
  concept VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Importe
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Pendiente de pago por cliente
    'requested',  -- Solicitada al cliente
    'received',   -- Recibida
    'used',       -- Utilizada
    'returned'    -- Devuelta al cliente
  )),
  
  -- Fechas
  requested_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  
  -- Pago recibido
  payment_reference VARCHAR(100),
  payment_date DATE,
  
  -- Uso de la provisión
  used_amount DECIMAL(12,2) DEFAULT 0,
  used_for TEXT,
  
  -- Devolución (si hay excedente)
  returned_amount DECIMAL(12,2) DEFAULT 0,
  returned_at TIMESTAMPTZ,
  
  -- Vinculación
  quote_id UUID REFERENCES quotes(id),
  quote_line_id UUID REFERENCES quote_items(id),
  invoice_id UUID REFERENCES invoices(id),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MOVIMIENTOS DE PROVISIÓN
-- =============================================
CREATE TABLE IF NOT EXISTS provision_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provision_id UUID NOT NULL REFERENCES provisions(id) ON DELETE CASCADE,
  
  -- Tipo
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN (
    'request',    -- Solicitud
    'receipt',    -- Ingreso recibido
    'use',        -- Uso/Pago de tasa
    'return'      -- Devolución
  )),
  
  amount DECIMAL(12,2) NOT NULL,
  
  -- Detalle
  description TEXT,
  reference VARCHAR(100),
  
  -- Documento justificante
  document_url TEXT,
  
  -- Fecha
  movement_date DATE NOT NULL,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_provisions_org ON provisions(organization_id);
CREATE INDEX IF NOT EXISTS idx_provisions_client ON provisions(client_id);
CREATE INDEX IF NOT EXISTS idx_provisions_matter ON provisions(matter_id);
CREATE INDEX IF NOT EXISTS idx_provisions_status ON provisions(status);
CREATE INDEX IF NOT EXISTS idx_provision_movements_provision ON provision_movements(provision_id);

-- RLS
ALTER TABLE provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provision_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para provisions
CREATE POLICY "Users can view provisions of their organization" ON provisions
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create provisions in their organization" ON provisions
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update provisions in their organization" ON provisions
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete provisions in their organization" ON provisions
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Políticas para provision_movements
CREATE POLICY "Users can view provision movements of their org" ON provision_movements
  FOR SELECT USING (provision_id IN (
    SELECT id FROM provisions WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can create provision movements" ON provision_movements
  FOR INSERT WITH CHECK (provision_id IN (
    SELECT id FROM provisions WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can update provision movements" ON provision_movements
  FOR UPDATE USING (provision_id IN (
    SELECT id FROM provisions WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete provision movements" ON provision_movements
  FOR DELETE USING (provision_id IN (
    SELECT id FROM provisions WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));