-- =============================================
-- ANALYTICS DAILY METRICS (for BI Dashboard)
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  
  -- Suscripciones
  total_tenants INTEGER DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  trialing_subscriptions INTEGER DEFAULT 0,
  canceled_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,
  
  -- Ingresos
  mrr_total DECIMAL(12,2) DEFAULT 0,
  mrr_new DECIMAL(12,2) DEFAULT 0,
  mrr_expansion DECIMAL(12,2) DEFAULT 0,
  mrr_contraction DECIMAL(12,2) DEFAULT 0,
  mrr_churned DECIMAL(12,2) DEFAULT 0,
  arr_total DECIMAL(14,2) DEFAULT 0,
  
  -- Por plan
  subscribers_starter INTEGER DEFAULT 0,
  subscribers_professional INTEGER DEFAULT 0,
  subscribers_business INTEGER DEFAULT 0,
  subscribers_enterprise INTEGER DEFAULT 0,
  mrr_starter DECIMAL(12,2) DEFAULT 0,
  mrr_professional DECIMAL(12,2) DEFAULT 0,
  mrr_business DECIMAL(12,2) DEFAULT 0,
  mrr_enterprise DECIMAL(12,2) DEFAULT 0,
  
  -- Add-ons
  total_addons_active INTEGER DEFAULT 0,
  mrr_addons DECIMAL(12,2) DEFAULT 0,
  
  -- Uso
  total_users INTEGER DEFAULT 0,
  active_users_day INTEGER DEFAULT 0,
  total_matters INTEGER DEFAULT 0,
  matters_created INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  clients_created INTEGER DEFAULT 0,
  
  -- Oficinas
  office_syncs INTEGER DEFAULT 0,
  office_documents_downloaded INTEGER DEFAULT 0,
  
  -- Marketplace
  market_requests INTEGER DEFAULT 0,
  market_transactions INTEGER DEFAULT 0,
  market_gmv DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT analytics_daily_metrics_date_unique UNIQUE(metric_date)
);

-- Enable RLS
ALTER TABLE public.analytics_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Only superadmin can access
CREATE POLICY "Superadmin access analytics_daily_metrics"
  ON public.analytics_daily_metrics
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Index for date queries
CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date 
  ON public.analytics_daily_metrics(metric_date DESC);

-- =============================================
-- ANALYTICS TENANT METRICS
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_tenant_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Plan
  plan_code VARCHAR(50),
  mrr DECIMAL(12,2) DEFAULT 0,
  
  -- Uso
  users_count INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  matters_count INTEGER DEFAULT 0,
  matters_created INTEGER DEFAULT 0,
  clients_count INTEGER DEFAULT 0,
  
  -- Actividad
  logins INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  documents_uploaded INTEGER DEFAULT 0,
  
  -- Oficinas
  office_syncs INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT analytics_tenant_metrics_date_tenant_unique UNIQUE(metric_date, tenant_id)
);

-- Enable RLS
ALTER TABLE public.analytics_tenant_metrics ENABLE ROW LEVEL SECURITY;

-- Only superadmin can access
CREATE POLICY "Superadmin access analytics_tenant_metrics"
  ON public.analytics_tenant_metrics
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_metrics_date 
  ON public.analytics_tenant_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_metrics_tenant 
  ON public.analytics_tenant_metrics(tenant_id);

-- =============================================
-- ANALYTICS SUBSCRIPTION EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  event_type VARCHAR(50) NOT NULL,
  
  -- Detalles
  from_plan VARCHAR(50),
  to_plan VARCHAR(50),
  from_mrr DECIMAL(12,2),
  to_mrr DECIMAL(12,2),
  mrr_change DECIMAL(12,2),
  
  -- Metadata
  reason VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_subscription_events ENABLE ROW LEVEL SECURITY;

-- Only superadmin can access
CREATE POLICY "Superadmin access analytics_subscription_events"
  ON public.analytics_subscription_events
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_subscription_events_tenant 
  ON public.analytics_subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_subscription_events_type 
  ON public.analytics_subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_subscription_events_created 
  ON public.analytics_subscription_events(created_at DESC);

-- =============================================
-- ANALYTICS COHORTS
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_month DATE NOT NULL,
  
  -- Tamaño cohorte
  initial_count INTEGER DEFAULT 0,
  initial_mrr DECIMAL(12,2) DEFAULT 0,
  
  -- Retención por mes
  retention_counts JSONB DEFAULT '{}',
  retention_mrr JSONB DEFAULT '{}',
  
  -- Calculado
  ltv_average DECIMAL(12,2),
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT analytics_cohorts_month_unique UNIQUE(cohort_month)
);

-- Enable RLS
ALTER TABLE public.analytics_cohorts ENABLE ROW LEVEL SECURITY;

-- Only superadmin can access
CREATE POLICY "Superadmin access analytics_cohorts"
  ON public.analytics_cohorts
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Index
CREATE INDEX IF NOT EXISTS idx_analytics_cohorts_month 
  ON public.analytics_cohorts(cohort_month DESC);

-- =============================================
-- BACKOFFICE CHATBOT CONFIG
-- =============================================
CREATE TABLE IF NOT EXISTS public.backoffice_chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuración IA
  model VARCHAR(100) DEFAULT 'claude-sonnet-4-20250514',
  system_prompt TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2048,
  
  -- Features habilitadas
  can_search_tenants BOOLEAN DEFAULT true,
  can_view_metrics BOOLEAN DEFAULT true,
  can_view_subscriptions BOOLEAN DEFAULT true,
  can_execute_actions BOOLEAN DEFAULT false,
  
  -- Acciones permitidas
  allowed_actions TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backoffice_chatbot_config ENABLE ROW LEVEL SECURITY;

-- Only superadmin
CREATE POLICY "Superadmin access backoffice_chatbot_config"
  ON public.backoffice_chatbot_config
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- =============================================
-- BACKOFFICE CHATBOT CONVERSATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.backoffice_chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active',
  title VARCHAR(255),
  
  -- Metadata
  messages_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backoffice_chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Superadmin can see all, users can see own
CREATE POLICY "Users can manage own chatbot conversations"
  ON public.backoffice_chatbot_conversations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

-- Index
CREATE INDEX IF NOT EXISTS idx_backoffice_chatbot_conversations_user 
  ON public.backoffice_chatbot_conversations(user_id);

-- =============================================
-- BACKOFFICE CHATBOT MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.backoffice_chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.backoffice_chatbot_conversations(id) ON DELETE CASCADE,
  
  -- Mensaje
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  
  -- Si usó herramientas
  tool_calls JSONB,
  tool_results JSONB,
  
  -- Metadata
  tokens_used INTEGER,
  latency_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backoffice_chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Access through conversation ownership
CREATE POLICY "Users can manage own chatbot messages"
  ON public.backoffice_chatbot_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.backoffice_chatbot_conversations c
      WHERE c.id = conversation_id
      AND (c.user_id = auth.uid() OR public.is_superadmin())
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_backoffice_chatbot_messages_conversation 
  ON public.backoffice_chatbot_messages(conversation_id, created_at);

-- =============================================
-- BACKOFFICE CHATBOT ACTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.backoffice_chatbot_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.backoffice_chatbot_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.backoffice_chatbot_messages(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Acción
  action_type VARCHAR(50) NOT NULL,
  action_params JSONB,
  
  -- Resultado
  status VARCHAR(20) DEFAULT 'pending',
  result JSONB,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.backoffice_chatbot_actions ENABLE ROW LEVEL SECURITY;

-- Only superadmin
CREATE POLICY "Superadmin access backoffice_chatbot_actions"
  ON public.backoffice_chatbot_actions
  FOR ALL
  TO authenticated
  USING (public.is_superadmin());

-- Index
CREATE INDEX IF NOT EXISTS idx_backoffice_chatbot_actions_conversation 
  ON public.backoffice_chatbot_actions(conversation_id);

-- =============================================
-- SEED: Default chatbot config
-- =============================================
INSERT INTO public.backoffice_chatbot_config (system_prompt, allowed_actions)
VALUES (
  'Eres el asistente IA del backoffice de IP-NEXUS, una plataforma SaaS de gestión de propiedad intelectual.

Tu rol es ayudar al administrador a:
- Consultar métricas del negocio (MRR, suscripciones, churn, etc.)
- Buscar información sobre tenants específicos
- Analizar tendencias y detectar problemas
- Responder preguntas sobre el estado del sistema

CAPACIDADES:
- Puedes buscar tenants por nombre, email o ID
- Puedes consultar métricas actuales e históricas
- Puedes ver detalles de suscripciones
- Puedes analizar datos y dar recomendaciones

FORMATO:
- Sé conciso y directo
- Usa tablas cuando muestres datos comparativos
- Destaca métricas importantes con énfasis
- Si no tienes datos suficientes, indícalo claramente

LIMITACIONES:
- NO puedes modificar datos sin confirmación explícita
- NO puedes acceder a datos de usuarios finales (solo agregados)
- NO puedes ejecutar acciones destructivas',
  ARRAY['search_tenant', 'view_metrics', 'view_subscription', 'export_data']
)
ON CONFLICT DO NOTHING;