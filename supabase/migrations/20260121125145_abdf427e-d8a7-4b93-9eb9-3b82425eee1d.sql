-- =====================================================
-- P59: ALERTAS PREDICTIVAS CON IA
-- =====================================================

-- Tabla principal de alertas predictivas
CREATE TABLE public.predictive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Tipo y categoría
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'deadline_risk',
    'payment_risk',
    'workload_imbalance',
    'client_churn',
    'cost_overrun',
    'renewal_upcoming',
    'conflict_detected',
    'anomaly_detected',
    'opportunity',
    'compliance_risk'
  )),
  
  -- Severidad
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Confianza de la predicción (0-100)
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  
  -- Contenido
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  
  -- Entidades relacionadas (solo tablas existentes)
  matter_id UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- ID genérico para otras entidades
  related_entity_type TEXT,
  related_entity_id UUID,
  
  -- Datos de análisis
  analysis_data JSONB DEFAULT '{}',
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'acknowledged', 'resolved', 'dismissed', 'expired'
  )),
  
  -- Acciones tomadas
  acknowledged_by UUID REFERENCES public.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Feedback para mejorar el modelo
  was_useful BOOLEAN,
  feedback_notes TEXT,
  
  -- Fechas
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX idx_predictive_alerts_org ON public.predictive_alerts(organization_id);
CREATE INDEX idx_predictive_alerts_status ON public.predictive_alerts(organization_id, status) WHERE status = 'active';
CREATE INDEX idx_predictive_alerts_type ON public.predictive_alerts(alert_type);
CREATE INDEX idx_predictive_alerts_matter ON public.predictive_alerts(matter_id) WHERE matter_id IS NOT NULL;
CREATE INDEX idx_predictive_alerts_severity ON public.predictive_alerts(severity);
CREATE INDEX idx_predictive_alerts_created ON public.predictive_alerts(created_at DESC);

-- Índice único para evitar duplicados de alertas activas
CREATE UNIQUE INDEX idx_predictive_alerts_unique 
  ON public.predictive_alerts(organization_id, alert_type, COALESCE(matter_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(related_entity_id, '00000000-0000-0000-0000-000000000000'::uuid)) 
  WHERE status = 'active';

-- RLS
ALTER TABLE public.predictive_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts of their organization"
  ON public.predictive_alerts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts of their organization"
  ON public.predictive_alerts FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert alerts"
  ON public.predictive_alerts FOR INSERT
  WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_predictive_alerts_updated_at
  BEFORE UPDATE ON public.predictive_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Configuración de alertas por organización
-- =====================================================
CREATE TABLE public.alert_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  alert_type TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  min_severity TEXT DEFAULT 'medium' CHECK (min_severity IN ('low', 'medium', 'high', 'critical')),
  min_confidence INTEGER DEFAULT 70 CHECK (min_confidence BETWEEN 0 AND 100),
  
  -- Configuración de notificaciones
  notify_email BOOLEAN DEFAULT true,
  notify_in_app BOOLEAN DEFAULT true,
  notify_slack BOOLEAN DEFAULT false,
  slack_webhook_url TEXT,
  
  -- Destinatarios
  notify_roles TEXT[] DEFAULT ARRAY['admin', 'manager'],
  notify_matter_owner BOOLEAN DEFAULT true,
  
  -- Análisis automático
  auto_analyze_enabled BOOLEAN DEFAULT true,
  analyze_frequency TEXT DEFAULT 'daily' CHECK (analyze_frequency IN ('hourly', 'daily', 'weekly')),
  last_analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, alert_type)
);

ALTER TABLE public.alert_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alert config of their organization"
  ON public.alert_configurations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage alert config"
  ON public.alert_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT m.organization_id FROM public.memberships m 
      WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
    )
  );

CREATE TRIGGER update_alert_configurations_updated_at
  BEFORE UPDATE ON public.alert_configurations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();