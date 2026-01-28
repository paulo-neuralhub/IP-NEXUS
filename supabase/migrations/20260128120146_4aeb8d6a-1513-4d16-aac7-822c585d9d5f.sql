-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- CRM Configuration Catalogs - Phase 1
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- 1. client_type_config (Tipos de cliente: Directo, Agente, etc.)
CREATE TABLE IF NOT EXISTS public.client_type_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 2. payment_classification_config (Alertas de pago: Excelente, Riesgo, etc.)
CREATE TABLE IF NOT EXISTS public.payment_classification_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  alert_level VARCHAR(20) DEFAULT 'none' CHECK (alert_level IN ('none', 'warning', 'critical')),
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 3. client_tag_categories (Categorías de etiquetas: Sector, Comportamiento, etc.)
CREATE TABLE IF NOT EXISTS public.client_tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. client_tag_config (Etiquetas: Pharma, Startup, VIP, etc.)
CREATE TABLE IF NOT EXISTS public.client_tag_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.client_tag_categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. contact_role_config (Roles de contacto: Principal, Legal, Facturación, etc.)
CREATE TABLE IF NOT EXISTS public.contact_role_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_unique BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 6. client_tags (Relación cliente ↔ etiquetas) - Referencias crm_accounts como "clients"
CREATE TABLE IF NOT EXISTS public.client_tags (
  client_id UUID NOT NULL REFERENCES public.crm_accounts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.client_tag_config(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, tag_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- Modificar tabla crm_accounts (añadir columnas de configuración)
-- ═══════════════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.crm_accounts 
  ADD COLUMN IF NOT EXISTS client_type_id UUID REFERENCES public.client_type_config(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_classification_id UUID REFERENCES public.payment_classification_config(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rating_stars INTEGER CHECK (rating_stars IS NULL OR (rating_stars >= 1 AND rating_stars <= 5)),
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- Enable RLS on all new tables
-- ═══════════════════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.client_type_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_classification_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tag_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tag_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_role_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- RLS Policies - Organization-scoped access
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- client_type_config policies
CREATE POLICY "Users can view client types for their org" ON public.client_type_config
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage client types" ON public.client_type_config
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- payment_classification_config policies
CREATE POLICY "Users can view payment classifications for their org" ON public.payment_classification_config
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage payment classifications" ON public.payment_classification_config
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- client_tag_categories policies
CREATE POLICY "Users can view tag categories for their org" ON public.client_tag_categories
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage tag categories" ON public.client_tag_categories
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- client_tag_config policies
CREATE POLICY "Users can view tags for their org" ON public.client_tag_config
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage tags" ON public.client_tag_config
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- contact_role_config policies
CREATE POLICY "Users can view contact roles for their org" ON public.contact_role_config
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage contact roles" ON public.contact_role_config
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- client_tags policies (join table)
CREATE POLICY "Users can view client tags for their org" ON public.client_tags
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.crm_accounts 
      WHERE organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage client tags" ON public.client_tags
  FOR ALL TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.crm_accounts 
      WHERE organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.crm_accounts 
      WHERE organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_client_type_config_org ON public.client_type_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_classification_config_org ON public.payment_classification_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_categories_org ON public.client_tag_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_config_org ON public.client_tag_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_tag_config_category ON public.client_tag_config(category_id);
CREATE INDEX IF NOT EXISTS idx_contact_role_config_org ON public.contact_role_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_client ON public.client_tags(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_tag ON public.client_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_client_type ON public.crm_accounts(client_type_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_payment_class ON public.crm_accounts(payment_classification_id);