-- ============================================
-- IP-FINANCE: VALORACIÓN DE PORTFOLIOS IP
-- ============================================

-- PORTFOLIOS DE VALORACIÓN
CREATE TABLE finance_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Totals (cached, updated by trigger)
  total_assets INTEGER DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  total_cost DECIMAL(15,2) DEFAULT 0,
  unrealized_gain DECIMAL(15,2) DEFAULT 0,
  
  -- Settings
  valuation_frequency VARCHAR(20) DEFAULT 'quarterly',
  auto_revalue BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVOS EN PORTFOLIOS
CREATE TABLE finance_portfolio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES finance_portfolios(id) ON DELETE CASCADE,
  
  -- Asset reference
  asset_type VARCHAR(50) NOT NULL,
  asset_id UUID,
  external_reference VARCHAR(200),
  matter_id UUID REFERENCES matters(id),
  
  -- Asset details
  title VARCHAR(500) NOT NULL,
  registration_number VARCHAR(100),
  registration_office VARCHAR(50),
  jurisdiction VARCHAR(50),
  
  -- Acquisition
  acquisition_date DATE,
  acquisition_cost DECIMAL(15,2),
  acquisition_currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Current valuation
  current_value DECIMAL(15,2),
  last_valuation_date DATE,
  valuation_method VARCHAR(50),
  
  -- Metadata
  nice_classes INTEGER[],
  expiry_date DATE,
  status VARCHAR(30) DEFAULT 'active',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VALORACIONES
CREATE TABLE finance_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Reference
  portfolio_id UUID REFERENCES finance_portfolios(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES finance_portfolio_assets(id) ON DELETE CASCADE,
  
  -- Valuation details
  valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valuation_type VARCHAR(30) NOT NULL,
  
  -- Methods used
  methods_used JSONB DEFAULT '[]',
  primary_method VARCHAR(50),
  
  -- Results
  estimated_value DECIMAL(15,2) NOT NULL,
  value_range_low DECIMAL(15,2),
  value_range_high DECIMAL(15,2),
  confidence_level DECIMAL(3,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Method-specific results
  cost_approach_value DECIMAL(15,2),
  market_approach_value DECIMAL(15,2),
  income_approach_value DECIMAL(15,2),
  
  -- Factors and analysis
  factors JSONB DEFAULT '{}',
  adjustments JSONB DEFAULT '[]',
  comparable_transactions JSONB DEFAULT '[]',
  
  -- AI Analysis
  ai_analysis TEXT,
  ai_confidence DECIMAL(3,2),
  
  -- Status
  status VARCHAR(30) DEFAULT 'draft',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- PARÁMETROS DE VALORACIÓN
CREATE TABLE finance_valuation_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scope
  asset_type VARCHAR(50),
  jurisdiction VARCHAR(50),
  
  -- Cost approach parameters
  development_cost_multiplier DECIMAL(5,2) DEFAULT 1.0,
  legal_cost_base DECIMAL(10,2),
  maintenance_cost_annual DECIMAL(10,2),
  
  -- Income approach parameters
  royalty_rate_low DECIMAL(5,4),
  royalty_rate_mid DECIMAL(5,4),
  royalty_rate_high DECIMAL(5,4),
  discount_rate DECIMAL(5,4) DEFAULT 0.1000,
  growth_rate DECIMAL(5,4) DEFAULT 0.0200,
  useful_life_years INTEGER DEFAULT 10,
  
  -- Market approach parameters
  market_multiplier_low DECIMAL(5,2),
  market_multiplier_mid DECIMAL(5,2),
  market_multiplier_high DECIMAL(5,2),
  
  -- Adjustments
  brand_strength_factor DECIMAL(3,2) DEFAULT 1.0,
  market_position_factor DECIMAL(3,2) DEFAULT 1.0,
  legal_strength_factor DECIMAL(3,2) DEFAULT 1.0,
  
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar parámetros por defecto
INSERT INTO finance_valuation_parameters 
(asset_type, royalty_rate_low, royalty_rate_mid, royalty_rate_high, market_multiplier_low, market_multiplier_mid, market_multiplier_high, legal_cost_base, maintenance_cost_annual) VALUES
('trademark', 0.0100, 0.0300, 0.0800, 1.5, 3.0, 6.0, 5000, 1000),
('patent', 0.0200, 0.0500, 0.1500, 2.0, 5.0, 12.0, 15000, 3000),
('design', 0.0050, 0.0150, 0.0400, 1.0, 2.5, 5.0, 3000, 500),
('copyright', 0.0050, 0.0150, 0.0400, 1.0, 2.5, 5.0, 2000, 300),
('domain', 0.0050, 0.0100, 0.0300, 0.5, 2.0, 5.0, 500, 100);

-- Índices
CREATE INDEX idx_finance_portfolios_org ON finance_portfolios(organization_id);
CREATE INDEX idx_portfolio_assets_portfolio ON finance_portfolio_assets(portfolio_id);
CREATE INDEX idx_valuations_portfolio ON finance_valuations(portfolio_id);
CREATE INDEX idx_valuations_asset ON finance_valuations(asset_id);
CREATE INDEX idx_valuations_date ON finance_valuations(valuation_date DESC);
CREATE INDEX idx_valuation_params_type ON finance_valuation_parameters(asset_type);

-- Enable RLS
ALTER TABLE finance_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_valuation_parameters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view org portfolios" ON finance_portfolios
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage org portfolios" ON finance_portfolios
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view portfolio assets" ON finance_portfolio_assets
  FOR SELECT USING (
    portfolio_id IN (
      SELECT id FROM finance_portfolios WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage portfolio assets" ON finance_portfolio_assets
  FOR ALL USING (
    portfolio_id IN (
      SELECT id FROM finance_portfolios WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view org valuations" ON finance_valuations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage org valuations" ON finance_valuations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read valuation parameters" ON finance_valuation_parameters
  FOR SELECT USING (true);

-- Function to update portfolio totals
CREATE OR REPLACE FUNCTION update_portfolio_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE finance_portfolios
  SET 
    total_assets = (
      SELECT COUNT(*) FROM finance_portfolio_assets WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    total_value = (
      SELECT COALESCE(SUM(current_value), 0) FROM finance_portfolio_assets WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    total_cost = (
      SELECT COALESCE(SUM(acquisition_cost), 0) FROM finance_portfolio_assets WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    unrealized_gain = (
      SELECT COALESCE(SUM(current_value - COALESCE(acquisition_cost, 0)), 0) FROM finance_portfolio_assets WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_portfolio_totals
AFTER INSERT OR UPDATE OR DELETE ON finance_portfolio_assets
FOR EACH ROW EXECUTE FUNCTION update_portfolio_totals();