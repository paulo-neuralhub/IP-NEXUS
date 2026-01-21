-- =============================================
-- TIME TRACKING MODULE
-- P57: Billing by Time
-- =============================================

-- 1. Billing Rates (tarifas por hora)
CREATE TABLE public.billing_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Tipo de tarifa
  rate_type TEXT NOT NULL CHECK (rate_type IN (
    'user',        -- Tarifa específica para un usuario
    'role',        -- Tarifa por rol (socio, asociado, junior)
    'matter_type', -- Tarifa por tipo de asunto
    'client',      -- Tarifa especial para un cliente
    'default'      -- Tarifa por defecto de la organización
  )),
  
  -- Vinculación según tipo
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role_name TEXT,
  matter_type TEXT,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  
  -- Tarifa
  hourly_rate DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Descripción
  name TEXT,
  description TEXT,
  
  -- Vigencia
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Time Entries (entradas de tiempo) - sin referencia a tasks
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  task_id UUID, -- Sin FK por ahora, tasks se creará después
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Tiempo
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  start_time TIME,
  end_time TIME,
  
  -- Descripción
  description TEXT NOT NULL,
  activity_type TEXT, -- research, drafting, review, meeting, call, email, filing, court, travel, admin, other
  
  -- Facturación
  is_billable BOOLEAN DEFAULT true,
  billing_rate_id UUID REFERENCES public.billing_rates(id) ON DELETE SET NULL,
  billing_rate DECIMAL(10,2),
  billing_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Estado de facturación (preparado para flujo de aprobación)
  billing_status TEXT DEFAULT 'draft' CHECK (billing_status IN (
    'draft',      -- Borrador
    'submitted',  -- Enviado para aprobación (futuro)
    'approved',   -- Aprobado (futuro)
    'rejected',   -- Rechazado (futuro)
    'billed'      -- Facturado
  )),
  invoice_id UUID,
  invoice_line_id UUID,
  
  -- Timer en vivo
  timer_started_at TIMESTAMPTZ,
  timer_running BOOLEAN DEFAULT false,
  
  -- Aprobación (campos preparados para futuro)
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX idx_billing_rates_org ON public.billing_rates(organization_id);
CREATE INDEX idx_billing_rates_user ON public.billing_rates(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_billing_rates_contact ON public.billing_rates(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_billing_rates_active ON public.billing_rates(organization_id, is_active) WHERE is_active = true;

CREATE INDEX idx_time_entries_org ON public.time_entries(organization_id);
CREATE INDEX idx_time_entries_matter ON public.time_entries(matter_id);
CREATE INDEX idx_time_entries_user ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_time_entries_unbilled ON public.time_entries(organization_id, billing_status) 
  WHERE billing_status IN ('draft', 'approved') AND is_billable = true;
CREATE INDEX idx_time_entries_timer ON public.time_entries(user_id) WHERE timer_running = true;

-- 4. RLS
ALTER TABLE public.billing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Políticas para billing_rates
CREATE POLICY "Users can view billing rates of their organization"
  ON public.billing_rates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage billing rates"
  ON public.billing_rates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Políticas para time_entries
CREATE POLICY "Users can view time entries of their organization"
  ON public.time_entries FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own time entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own time entries"
  ON public.time_entries FOR UPDATE
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "Users can delete their own time entries"
  ON public.time_entries FOR DELETE
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- 5. Trigger para calcular billing_amount automáticamente
CREATE OR REPLACE FUNCTION public.calculate_time_billing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_billable AND NEW.billing_rate IS NOT NULL THEN
    NEW.billing_amount = ROUND((NEW.duration_minutes / 60.0) * NEW.billing_rate, 2);
  ELSE
    NEW.billing_amount = 0;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER time_entry_calculate_billing
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_time_billing();

-- 6. Función para obtener tarifa aplicable
CREATE OR REPLACE FUNCTION public.get_applicable_rate(
  p_organization_id UUID,
  p_user_id UUID,
  p_matter_id UUID
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
  v_user_role TEXT;
  v_matter_type TEXT;
  v_contact_id UUID;
BEGIN
  -- Obtener info del matter
  SELECT type, contact_id INTO v_matter_type, v_contact_id 
  FROM public.matters WHERE id = p_matter_id;
  
  -- Obtener rol del usuario en la organización
  SELECT role INTO v_user_role 
  FROM public.memberships 
  WHERE user_id = p_user_id AND organization_id = p_organization_id;
  
  -- Prioridad de tarifas:
  -- 1. Usuario específico
  SELECT hourly_rate INTO v_rate FROM public.billing_rates
  WHERE organization_id = p_organization_id
    AND rate_type = 'user'
    AND user_id = p_user_id
    AND is_active = true
    AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
  ORDER BY effective_from DESC
  LIMIT 1;
  IF v_rate IS NOT NULL THEN RETURN v_rate; END IF;
  
  -- 2. Cliente específico
  IF v_contact_id IS NOT NULL THEN
    SELECT hourly_rate INTO v_rate FROM public.billing_rates
    WHERE organization_id = p_organization_id
      AND rate_type = 'client'
      AND contact_id = v_contact_id
      AND is_active = true
      AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    ORDER BY effective_from DESC
    LIMIT 1;
    IF v_rate IS NOT NULL THEN RETURN v_rate; END IF;
  END IF;
  
  -- 3. Tipo de asunto
  IF v_matter_type IS NOT NULL THEN
    SELECT hourly_rate INTO v_rate FROM public.billing_rates
    WHERE organization_id = p_organization_id
      AND rate_type = 'matter_type'
      AND matter_type = v_matter_type
      AND is_active = true
      AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    ORDER BY effective_from DESC
    LIMIT 1;
    IF v_rate IS NOT NULL THEN RETURN v_rate; END IF;
  END IF;
  
  -- 4. Rol del usuario
  IF v_user_role IS NOT NULL THEN
    SELECT hourly_rate INTO v_rate FROM public.billing_rates
    WHERE organization_id = p_organization_id
      AND rate_type = 'role'
      AND role_name = v_user_role
      AND is_active = true
      AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
    ORDER BY effective_from DESC
    LIMIT 1;
    IF v_rate IS NOT NULL THEN RETURN v_rate; END IF;
  END IF;
  
  -- 5. Tarifa por defecto
  SELECT hourly_rate INTO v_rate FROM public.billing_rates
  WHERE organization_id = p_organization_id
    AND rate_type = 'default'
    AND is_active = true
    AND (effective_until IS NULL OR effective_until >= CURRENT_DATE)
  ORDER BY effective_from DESC
  LIMIT 1;
  
  RETURN COALESCE(v_rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;