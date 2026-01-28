
-- =====================================================
-- CRM SIMPLIFICADO - PARTE 1: MODELO DE DATOS
-- =====================================================

-- 1. TABLA: crm_leads (Prospectos sin cualificar)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Datos de contacto
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Datos de empresa
  company_name TEXT,
  company_tax_id TEXT,
  
  -- Estado y seguimiento
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'standby', 'converted')),
  interested_in TEXT[] DEFAULT '{}',
  estimated_value DECIMAL(15,2),
  source TEXT, -- web, referral, linkedin, cold_call, etc.
  
  -- Próxima acción
  next_action TEXT,
  next_action_date DATE,
  
  -- Stand-by
  standby_until DATE,
  standby_reason TEXT,
  
  -- Conversión
  converted_to_deal_id UUID,
  converted_to_client_id UUID,
  converted_at TIMESTAMPTZ,
  converted_by UUID REFERENCES public.users(id),
  
  -- Asignación
  assigned_to UUID REFERENCES public.users(id),
  
  -- Metadatos
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para crm_leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_org ON public.crm_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_next_action ON public.crm_leads(organization_id, next_action_date) WHERE next_action_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_leads_standby ON public.crm_leads(organization_id, standby_until) WHERE status = 'standby';

-- RLS para crm_leads
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_leads_org_access" ON public.crm_leads;
CREATE POLICY "crm_leads_org_access" ON public.crm_leads
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 2. TABLA: clients (Clientes confirmados)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Numeración automática
  client_number TEXT NOT NULL,
  
  -- Datos principales
  name TEXT NOT NULL,
  legal_name TEXT,
  client_type TEXT DEFAULT 'direct' CHECK (client_type IN ('direct', 'agent', 'partner')),
  
  -- Identificación fiscal
  tax_id TEXT,
  vat_number TEXT,
  
  -- Contacto principal
  email TEXT,
  phone TEXT,
  mobile TEXT,
  website TEXT,
  
  -- Dirección
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'ES',
  
  -- Facturación
  billing_email TEXT,
  billing_address JSONB,
  payment_terms INTEGER DEFAULT 30,
  currency TEXT DEFAULT 'EUR',
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'archived')),
  
  -- Origen
  source_lead_id UUID,
  source_deal_id UUID,
  
  -- Metadatos
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Asignación
  assigned_to UUID REFERENCES public.users(id),
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT clients_number_unique UNIQUE(organization_id, client_number)
);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_org ON public.clients(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_number ON public.clients(organization_id, client_number);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(organization_id, name);

-- RLS para clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_org_access" ON public.clients;
CREATE POLICY "clients_org_access" ON public.clients
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 3. TABLA: client_contacts (Contactos dentro de un cliente)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Datos personales
  first_name TEXT NOT NULL,
  last_name TEXT,
  job_title TEXT,
  department TEXT,
  
  -- Contacto
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Roles
  is_primary BOOLEAN DEFAULT false,
  is_billing_contact BOOLEAN DEFAULT false,
  is_legal_contact BOOLEAN DEFAULT false,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadatos
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para client_contacts
CREATE INDEX IF NOT EXISTS idx_client_contacts_org ON public.client_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON public.client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_primary ON public.client_contacts(client_id) WHERE is_primary = true;

-- RLS para client_contacts
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_contacts_org_access" ON public.client_contacts;
CREATE POLICY "client_contacts_org_access" ON public.client_contacts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 4. ACTUALIZAR TABLA: crm_deals (añadir campos faltantes)
-- =====================================================
-- Añadir columnas si no existen
DO $$ 
BEGIN
  -- client_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'client_id') THEN
    ALTER TABLE public.crm_deals ADD COLUMN client_id UUID REFERENCES public.clients(id);
  END IF;
  
  -- lead_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'lead_id') THEN
    ALTER TABLE public.crm_deals ADD COLUMN lead_id UUID REFERENCES public.crm_leads(id);
  END IF;
  
  -- deal_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'deal_number') THEN
    ALTER TABLE public.crm_deals ADD COLUMN deal_number TEXT;
  END IF;
  
  -- stage (nuevo set de valores)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'stage') THEN
    ALTER TABLE public.crm_deals ADD COLUMN stage TEXT DEFAULT 'contacted';
  END IF;
  
  -- probability
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'probability') THEN
    ALTER TABLE public.crm_deals ADD COLUMN probability INTEGER DEFAULT 20;
  END IF;
  
  -- expected_close_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'expected_close_date') THEN
    ALTER TABLE public.crm_deals ADD COLUMN expected_close_date DATE;
  END IF;
  
  -- next_action
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'next_action') THEN
    ALTER TABLE public.crm_deals ADD COLUMN next_action TEXT;
  END IF;
  
  -- next_action_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'next_action_date') THEN
    ALTER TABLE public.crm_deals ADD COLUMN next_action_date DATE;
  END IF;
  
  -- won_at, won_value
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'won_at') THEN
    ALTER TABLE public.crm_deals ADD COLUMN won_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'won_value') THEN
    ALTER TABLE public.crm_deals ADD COLUMN won_value DECIMAL(15,2);
  END IF;
  
  -- lost_at, lost_reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'lost_at') THEN
    ALTER TABLE public.crm_deals ADD COLUMN lost_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_deals' AND column_name = 'lost_reason') THEN
    ALTER TABLE public.crm_deals ADD COLUMN lost_reason TEXT;
  END IF;
END $$;

-- 5. TABLA: crm_activities (Actividades de leads y deals)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Vinculación (uno u otro, no ambos obligatorios)
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Tipo de actividad
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'stage_change', 'status_change', 'document', 'other')),
  
  -- Contenido
  subject TEXT,
  description TEXT,
  outcome TEXT,
  
  -- Para llamadas
  call_duration INTEGER, -- segundos
  call_recording_url TEXT,
  
  -- Para emails
  email_message_id TEXT,
  
  -- Para cambios de estado/etapa
  old_value TEXT,
  new_value TEXT,
  
  -- Programación
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  
  -- Metadatos
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Al menos uno debe estar presente
  CONSTRAINT crm_activities_has_parent CHECK (
    lead_id IS NOT NULL OR deal_id IS NOT NULL OR client_id IS NOT NULL
  )
);

-- Índices para crm_activities
CREATE INDEX IF NOT EXISTS idx_crm_activities_org ON public.crm_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON public.crm_activities(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON public.crm_activities(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_activities_client ON public.crm_activities(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON public.crm_activities(organization_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created ON public.crm_activities(organization_id, created_at DESC);

-- RLS para crm_activities
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_activities_org_access" ON public.crm_activities;
CREATE POLICY "crm_activities_org_access" ON public.crm_activities
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 6. FUNCIONES DE NUMERACIÓN AUTOMÁTICA
-- =====================================================

-- Función para generar número de cliente: CLI-2025-0001
CREATE OR REPLACE FUNCTION public.generate_client_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Contar clientes de esta org este año
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.clients
  WHERE organization_id = p_organization_id
    AND client_number LIKE 'CLI-' || v_year || '-%';
  
  v_number := 'CLI-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
  
  RETURN v_number;
END;
$$;

-- Función para generar número de deal: DEAL-2025-0001
CREATE OR REPLACE FUNCTION public.generate_deal_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Contar deals de esta org este año
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.crm_deals
  WHERE organization_id = p_organization_id
    AND deal_number LIKE 'DEAL-' || v_year || '-%';
  
  v_number := 'DEAL-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
  
  RETURN v_number;
END;
$$;

-- 7. TRIGGERS PARA NUMERACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para client_number
CREATE OR REPLACE FUNCTION public.trigger_set_client_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_number IS NULL OR NEW.client_number = '' THEN
    NEW.client_number := public.generate_client_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_client_number ON public.clients;
CREATE TRIGGER set_client_number
  BEFORE INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_client_number();

-- Trigger para deal_number
CREATE OR REPLACE FUNCTION public.trigger_set_deal_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.deal_number IS NULL OR NEW.deal_number = '' THEN
    NEW.deal_number := public.generate_deal_number(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_deal_number ON public.crm_deals;
CREATE TRIGGER set_deal_number
  BEFORE INSERT ON public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_deal_number();

-- 8. TRIGGERS PARA updated_at
-- =====================================================

-- Función genérica de updated_at (si no existe)
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- Triggers para cada tabla
DROP TRIGGER IF EXISTS set_updated_at ON public.crm_leads;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.clients;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.client_contacts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_updated_at();

-- 9. AÑADIR FK a crm_leads después de crear clients
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crm_leads_converted_to_client_fk'
  ) THEN
    ALTER TABLE public.crm_leads 
      ADD CONSTRAINT crm_leads_converted_to_client_fk 
      FOREIGN KEY (converted_to_client_id) REFERENCES public.clients(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'crm_leads_converted_to_deal_fk'
  ) THEN
    ALTER TABLE public.crm_leads 
      ADD CONSTRAINT crm_leads_converted_to_deal_fk 
      FOREIGN KEY (converted_to_deal_id) REFERENCES public.crm_deals(id);
  END IF;
END $$;

-- 10. ÍNDICE ÚNICO PARA deal_number
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_deals_number_unique 
  ON public.crm_deals(organization_id, deal_number) 
  WHERE deal_number IS NOT NULL;
