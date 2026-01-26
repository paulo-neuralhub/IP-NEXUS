-- =============================================
-- L62-A: Finance Module - Campos de Normativa Española/Europea
-- Añade campos para Facturae, SII, TicketBAI y VERI*FACTU
-- =============================================

-- =============================================
-- 1) CONFIGURACIÓN FISCAL DEL TENANT
-- =============================================
CREATE TABLE IF NOT EXISTS public.fiscal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Datos fiscales
  tax_id VARCHAR(20) NOT NULL,
  tax_id_type VARCHAR(10) DEFAULT 'NIF' CHECK (tax_id_type IN ('NIF', 'CIF', 'NIE', 'VAT', 'OTHER')),
  legal_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  
  -- Dirección fiscal
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  postal_code VARCHAR(10),
  city VARCHAR(100),
  province VARCHAR(100),
  country_code VARCHAR(2) DEFAULT 'ES',
  
  -- Configuración IVA
  vat_regime VARCHAR(50) DEFAULT 'general' CHECK (vat_regime IN ('general', 'simplified', 'surcharge', 'exempt', 'oss')),
  default_vat_rate DECIMAL(5,2) DEFAULT 21,
  applies_surcharge BOOLEAN DEFAULT FALSE,
  default_withholding DECIMAL(5,2) DEFAULT 0,
  
  -- Formato numeración: PREFIX-YEAR-NUMBER
  invoice_number_format VARCHAR(50) DEFAULT '{series}{year}-{number:05d}',
  quote_number_format VARCHAR(50) DEFAULT 'P{year}-{number:04d}',
  
  -- === SII (Suministro Inmediato de Información) ===
  sii_enabled BOOLEAN DEFAULT FALSE,
  sii_test_mode BOOLEAN DEFAULT TRUE,
  sii_certificate_id VARCHAR(100),
  
  -- === TICKETBAI (País Vasco) ===
  tbai_enabled BOOLEAN DEFAULT FALSE,
  tbai_territory VARCHAR(2) CHECK (tbai_territory IN ('BI', 'SS', 'VI')),
  tbai_license_key VARCHAR(100),
  tbai_software_name VARCHAR(100) DEFAULT 'IP-NEXUS',
  tbai_software_version VARCHAR(20) DEFAULT '1.0.0',
  
  -- === VERI*FACTU (2025) ===
  verifactu_enabled BOOLEAN DEFAULT FALSE,
  verifactu_certificate_id VARCHAR(100),
  
  -- Certificado digital (encriptado)
  certificate_data TEXT,
  certificate_password_encrypted TEXT,
  certificate_expires_at DATE,
  certificate_subject VARCHAR(255),
  
  -- Cuenta bancaria por defecto
  default_bank_account VARCHAR(34),
  default_bank_name VARCHAR(100),
  default_bank_bic VARCHAR(11),
  
  -- Textos legales
  invoice_footer TEXT,
  invoice_notes TEXT,
  dpd_clause TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2) SERIES DE FACTURACIÓN
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoice_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Numeración
  current_number INTEGER DEFAULT 0,
  prefix VARCHAR(20),
  suffix VARCHAR(20),
  
  -- Tipo de documentos
  for_invoices BOOLEAN DEFAULT TRUE,
  for_quotes BOOLEAN DEFAULT FALSE,
  for_credit_notes BOOLEAN DEFAULT FALSE,
  for_proforma BOOLEAN DEFAULT FALSE,
  
  -- Año fiscal
  fiscal_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  reset_yearly BOOLEAN DEFAULT TRUE,
  
  -- Estado
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, code, fiscal_year)
);

-- =============================================
-- 3) AÑADIR CAMPOS DE NORMATIVA A INVOICES
-- =============================================

-- Tipo de factura (Facturae)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(20) DEFAULT 'FC';

COMMENT ON COLUMN public.invoices.invoice_type IS 'FC=Completa, FA=Simplificada, FR=Rectificativa, NC=Nota crédito';

-- Rectificativa
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS corrected_invoice_id UUID REFERENCES public.invoices(id);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS correction_reason VARCHAR(4);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS correction_description TEXT;

-- Fecha devengo
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tax_point_date DATE;

-- Período de facturación
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS period_start DATE;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS period_end DATE;

-- IVA desglosado por tipo
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS vat_breakdown JSONB DEFAULT '[]';

COMMENT ON COLUMN public.invoices.vat_breakdown IS 'Array: [{rate, base, amount, surcharge, withholding}]';

-- Recargo equivalencia y retenciones
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS total_surcharge DECIMAL(12,2) DEFAULT 0;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS total_withholding DECIMAL(12,2) DEFAULT 0;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS withholding_percent DECIMAL(5,2) DEFAULT 0;

-- Método de pago (códigos Facturae)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS payment_method_code VARCHAR(4);

COMMENT ON COLUMN public.invoices.payment_method_code IS 'Facturae: 01=Contado, 02=Recibo, 04=Transferencia, etc.';

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS bank_account VARCHAR(34);

-- === CAMPOS SII ===
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sii_status VARCHAR(20);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sii_csv VARCHAR(50);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sii_sent_at TIMESTAMPTZ;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sii_response JSONB;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sii_registration_key VARCHAR(2);

COMMENT ON COLUMN public.invoices.sii_status IS 'pending, sent, accepted, rejected, error';
COMMENT ON COLUMN public.invoices.sii_csv IS 'Código Seguro de Verificación';
COMMENT ON COLUMN public.invoices.sii_registration_key IS 'Clave régimen especial SII';

-- === CAMPOS TICKETBAI ===
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_status VARCHAR(20);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_identifier VARCHAR(50);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_qr_url TEXT;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_signature TEXT;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_sent_at TIMESTAMPTZ;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tbai_chain_hash VARCHAR(64);

COMMENT ON COLUMN public.invoices.tbai_identifier IS 'TBAI-XXXXXXXX identificador único';
COMMENT ON COLUMN public.invoices.tbai_chain_hash IS 'Hash encadenamiento anterior';

-- === CAMPOS VERI*FACTU (2025) ===
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS verifactu_status VARCHAR(20);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS verifactu_id VARCHAR(50);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS verifactu_qr TEXT;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS verifactu_hash VARCHAR(64);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS verifactu_sent_at TIMESTAMPTZ;

-- === FACTURAE XML ===
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS facturae_xml TEXT;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS facturae_signed BOOLEAN DEFAULT FALSE;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS facturae_certificate_id VARCHAR(100);

-- Envío y tracking
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sent_to_email VARCHAR(255);

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- =============================================
-- 4) AÑADIR CAMPOS A INVOICE_ITEMS
-- =============================================

-- Recargo equivalencia
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS surcharge_rate DECIMAL(5,2) DEFAULT 0;

ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS surcharge_amount DECIMAL(12,2) DEFAULT 0;

-- Código producto/servicio (Facturae)
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);

-- Total línea
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS total DECIMAL(12,2);

-- Referencia time entry
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS time_entry_id UUID;

-- Referencia expense
ALTER TABLE public.invoice_items 
ADD COLUMN IF NOT EXISTS expense_id UUID;

-- =============================================
-- 5) TABLA DE PAGOS DE FACTURAS (invoice_payments)
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  -- Importe
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Fecha
  payment_date DATE NOT NULL,
  
  -- Método
  payment_method VARCHAR(50) CHECK (payment_method IN (
    'cash', 'transfer', 'card', 'direct_debit', 'check', 'paypal', 'stripe', 'other'
  )),
  payment_method_code VARCHAR(4),
  reference VARCHAR(100),
  
  -- Cuenta
  bank_account VARCHAR(34),
  
  -- Notas
  notes TEXT,
  
  -- Stripe
  stripe_payment_id VARCHAR(100),
  stripe_charge_id VARCHAR(100),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6) HISTORIAL DE ENVÍOS A SII/TBAI/VERIFACTU
-- =============================================
CREATE TABLE IF NOT EXISTS public.regulatory_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  
  -- Tipo
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('sii', 'tbai', 'verifactu', 'facturae')),
  
  -- Operación
  operation VARCHAR(20) NOT NULL CHECK (operation IN ('alta', 'modificacion', 'anulacion')),
  
  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'accepted', 'rejected', 'error', 'cancelled'
  )),
  
  -- Request/Response
  request_xml TEXT,
  request_json JSONB,
  response_xml TEXT,
  response_json JSONB,
  
  -- Identificadores
  csv_code VARCHAR(50),
  registration_id VARCHAR(100),
  
  -- Error
  error_code VARCHAR(20),
  error_message TEXT,
  
  -- Fechas
  sent_at TIMESTAMPTZ,
  response_at TIMESTAMPTZ,
  
  -- Reintentos
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_fiscal_settings_org ON public.fiscal_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_series_org ON public.invoice_series(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_series_active ON public.invoice_series(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_org ON public.invoice_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_sii_status ON public.invoices(sii_status) WHERE sii_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_tbai_status ON public.invoices(tbai_status) WHERE tbai_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_verifactu ON public.invoices(verifactu_status) WHERE verifactu_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_regulatory_submissions_invoice ON public.regulatory_submissions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_regulatory_submissions_status ON public.regulatory_submissions(status);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.fiscal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_submissions ENABLE ROW LEVEL SECURITY;

-- Fiscal Settings
CREATE POLICY "Users can view their org fiscal_settings" ON public.fiscal_settings
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert their org fiscal_settings" ON public.fiscal_settings
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update their org fiscal_settings" ON public.fiscal_settings
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

-- Invoice Series
CREATE POLICY "Users can view their org invoice_series" ON public.invoice_series
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can manage their org invoice_series" ON public.invoice_series
  FOR ALL USING (organization_id IN (SELECT get_user_org_ids()));

-- Invoice Payments
CREATE POLICY "Users can view their org invoice_payments" ON public.invoice_payments
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can manage their org invoice_payments" ON public.invoice_payments
  FOR ALL USING (organization_id IN (SELECT get_user_org_ids()));

-- Regulatory Submissions
CREATE POLICY "Users can view their org regulatory_submissions" ON public.regulatory_submissions
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can manage their org regulatory_submissions" ON public.regulatory_submissions
  FOR ALL USING (organization_id IN (SELECT get_user_org_ids()));

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para obtener siguiente número de factura
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(
  p_org_id UUID,
  p_series_code VARCHAR DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_series RECORD;
  v_next_number INTEGER;
  v_format TEXT;
  v_result TEXT;
BEGIN
  -- Obtener serie (default si no se especifica)
  SELECT * INTO v_series
  FROM invoice_series
  WHERE organization_id = p_org_id
    AND (code = p_series_code OR (p_series_code IS NULL AND is_default = TRUE))
    AND is_active = TRUE
    AND fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE)
  LIMIT 1;
  
  IF v_series IS NULL THEN
    -- Crear serie por defecto si no existe
    INSERT INTO invoice_series (organization_id, code, name, is_default, fiscal_year)
    VALUES (p_org_id, 'F', 'Facturas', TRUE, EXTRACT(YEAR FROM CURRENT_DATE))
    RETURNING * INTO v_series;
  END IF;
  
  -- Incrementar contador
  v_next_number := v_series.current_number + 1;
  
  UPDATE invoice_series
  SET current_number = v_next_number,
      updated_at = NOW()
  WHERE id = v_series.id;
  
  -- Formatear número
  v_result := COALESCE(v_series.prefix, v_series.code) || 
              EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
              LPAD(v_next_number::TEXT, 5, '0') ||
              COALESCE(v_series.suffix, '');
  
  RETURN v_result;
END;
$$;

-- Función para calcular totales de factura con desglose IVA
CREATE OR REPLACE FUNCTION public.calculate_invoice_vat_breakdown(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_breakdown JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'rate', tax_rate,
        'base', SUM(subtotal),
        'amount', SUM(COALESCE(tax_amount, 0)),
        'surcharge', SUM(COALESCE(surcharge_amount, 0))
      )
    ),
    '[]'::jsonb
  )
  INTO v_breakdown
  FROM invoice_items
  WHERE invoice_id = p_invoice_id
  GROUP BY tax_rate;
  
  -- Actualizar factura
  UPDATE invoices
  SET vat_breakdown = v_breakdown,
      updated_at = NOW()
  WHERE id = p_invoice_id;
  
  RETURN v_breakdown;
END;
$$;

-- Trigger para actualizar vat_breakdown automáticamente
CREATE OR REPLACE FUNCTION public.trigger_update_vat_breakdown()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_invoice_vat_breakdown(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_invoice_vat_breakdown(NEW.invoice_id);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS update_vat_breakdown_trigger ON public.invoice_items;
CREATE TRIGGER update_vat_breakdown_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_vat_breakdown();

-- Trigger para actualizar paid_amount cuando se registra un pago
CREATE OR REPLACE FUNCTION public.trigger_update_invoice_paid_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_paid DECIMAL(12,2);
  v_invoice_total DECIMAL(12,2);
BEGIN
  -- Calcular total pagado
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Obtener total factura
  SELECT total INTO v_invoice_total
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Actualizar factura
  UPDATE invoices
  SET 
    paid_amount = v_total_paid,
    paid_date = CASE WHEN v_total_paid >= v_invoice_total THEN CURRENT_DATE ELSE NULL END,
    status = CASE 
      WHEN v_total_paid >= v_invoice_total THEN 'paid'
      WHEN v_total_paid > 0 THEN 'partial'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_invoice_paid_trigger ON public.invoice_payments;
CREATE TRIGGER update_invoice_paid_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_invoice_paid_amount();

-- =============================================
-- INSERTAR CÓDIGOS DE MÉTODO DE PAGO FACTURAE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_method_codes (
  code VARCHAR(4) PRIMARY KEY,
  name_es VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL
);

INSERT INTO public.payment_method_codes (code, name_es, name_en) VALUES
  ('01', 'Al contado', 'Cash'),
  ('02', 'Recibo Domiciliado', 'Direct Debit'),
  ('03', 'Recibo', 'Receipt'),
  ('04', 'Transferencia', 'Bank Transfer'),
  ('05', 'Letra Aceptada', 'Accepted Bill of Exchange'),
  ('06', 'Crédito Documentario', 'Documentary Credit'),
  ('07', 'Contrato Adjudicación', 'Award Contract'),
  ('08', 'Letra de cambio', 'Bill of Exchange'),
  ('09', 'Pagaré a la Orden', 'Promissory Note'),
  ('10', 'Pagaré No a la Orden', 'Non-Order Promissory Note'),
  ('11', 'Cheque', 'Check'),
  ('12', 'Reposición', 'Replacement'),
  ('13', 'Especiales', 'Special'),
  ('14', 'Compensación', 'Compensation'),
  ('15', 'Giro postal', 'Postal Money Order'),
  ('16', 'Cheque conformado', 'Certified Check'),
  ('17', 'Cheque bancario', 'Bank Check'),
  ('18', 'Pago contra reembolso', 'Cash on Delivery'),
  ('19', 'Pago mediante tarjeta', 'Card Payment')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- CÓDIGOS DE RECTIFICACIÓN FACTURAE
-- =============================================
CREATE TABLE IF NOT EXISTS public.correction_reason_codes (
  code VARCHAR(4) PRIMARY KEY,
  name_es VARCHAR(255) NOT NULL
);

INSERT INTO public.correction_reason_codes (code, name_es) VALUES
  ('01', 'Número de la factura'),
  ('02', 'Serie de la factura'),
  ('03', 'Fecha expedición'),
  ('04', 'Nombre y apellidos/Razón Social-Emisor'),
  ('05', 'Nombre y apellidos/Razón Social-Receptor'),
  ('06', 'Identificación fiscal Emisor/obligado'),
  ('07', 'Identificación fiscal Receptor'),
  ('08', 'Domicilio Emisor/Obligado'),
  ('09', 'Domicilio Receptor'),
  ('10', 'Detalle Operación'),
  ('11', 'Porcentaje impositivo a aplicar'),
  ('12', 'Cuota tributaria a aplicar'),
  ('13', 'Fecha/Periodo a aplicar'),
  ('14', 'Clase de factura'),
  ('15', 'Literales legales'),
  ('16', 'Base imponible'),
  ('80', 'Cálculo de cuotas repercutidas'),
  ('81', 'Cálculo de cuotas retenidas'),
  ('82', 'Base imponible modificada por devolución de envases'),
  ('83', 'Base imponible modificada por descuentos y bonificaciones'),
  ('84', 'Base imponible modificada por resolución firme'),
  ('85', 'Base imponible modificada por auto de declaración de concurso')
ON CONFLICT (code) DO NOTHING;