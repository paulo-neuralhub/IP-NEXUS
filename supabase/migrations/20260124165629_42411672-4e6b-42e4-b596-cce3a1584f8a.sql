-- =============================================
-- SERVICE PRICES BY JURISDICTION
-- =============================================

-- Tabla de precios por jurisdicción
CREATE TABLE IF NOT EXISTS public.service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.service_catalog(id) ON DELETE CASCADE,
  jurisdiction VARCHAR(10) NOT NULL,
  official_fee DECIMAL(10,2) DEFAULT 0,
  professional_fee DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (official_fee + professional_fee) STORED,
  currency VARCHAR(3) DEFAULT 'EUR',
  classes_included INTEGER DEFAULT 1,
  extra_class_fee DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: un precio por servicio y jurisdicción
  UNIQUE(service_id, jurisdiction)
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_service_prices_service_id ON public.service_prices(service_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_jurisdiction ON public.service_prices(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_service_prices_active ON public.service_prices(is_active) WHERE is_active = true;

-- Trigger para updated_at
CREATE TRIGGER update_service_prices_updated_at
  BEFORE UPDATE ON public.service_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.service_prices ENABLE ROW LEVEL SECURITY;

-- RLS policies (heredan del service_catalog padre)
CREATE POLICY "Users can view service prices through catalog"
  ON public.service_prices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_catalog sc
      WHERE sc.id = service_prices.service_id
      AND (
        sc.organization_id IN (
          SELECT organization_id FROM public.memberships 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage service prices for their org services"
  ON public.service_prices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.service_catalog sc
      WHERE sc.id = service_prices.service_id
      AND sc.organization_id IN (
        SELECT organization_id FROM public.memberships 
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_catalog sc
      WHERE sc.id = service_prices.service_id
      AND sc.organization_id IN (
        SELECT organization_id FROM public.memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Comentarios
COMMENT ON TABLE public.service_prices IS 'Precios de servicios por jurisdicción';
COMMENT ON COLUMN public.service_prices.jurisdiction IS 'Código de jurisdicción (ES, EU, US, CN, etc.)';
COMMENT ON COLUMN public.service_prices.total_price IS 'Precio total calculado (official_fee + professional_fee)';