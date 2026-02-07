
-- ═══════════════════════════════════════════════════════════
-- IP-MARKET: Tablas de Servicios (RFQ / Ofertas / Transacciones)
-- Complementa las tablas existentes de marketplace de activos
-- ═══════════════════════════════════════════════════════════

-- 1) Solicitudes del marketplace de servicios
CREATE TABLE public.market_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Identificador
  request_number TEXT NOT NULL DEFAULT ('RFQ-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random()*999999)::text, 6, '0')),

  -- Servicio
  service_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Jurisdicción
  jurisdiction_code TEXT NOT NULL,
  jurisdiction_name TEXT NOT NULL,
  office_code TEXT,
  office_name TEXT,

  -- Detalles condicionales
  service_details JSONB DEFAULT '{}',

  -- Económico
  currency TEXT DEFAULT 'EUR',
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),

  -- Configuración
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('urgent','normal','flexible')),
  requester_type TEXT DEFAULT 'agent' CHECK (requester_type IN ('agent','public')),

  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','open','reviewing','accepted','in_progress','completed','disputed','cancelled','expired')),
  expires_at TIMESTAMPTZ,
  accepted_offer_id UUID,

  -- Meta
  views_count INTEGER DEFAULT 0,
  offers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Ofertas de agentes para solicitudes de servicios
CREATE TABLE public.market_service_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.market_requests(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- Precio desglosado
  currency TEXT DEFAULT 'EUR',
  professional_fees DECIMAL(10,2) NOT NULL,
  official_fees DECIMAL(10,2) DEFAULT 0,
  platform_fee_seller DECIMAL(10,2) DEFAULT 0,
  platform_fee_buyer DECIMAL(10,2) DEFAULT 0,
  total_buyer_pays DECIMAL(10,2) NOT NULL,
  total_seller_receives DECIMAL(10,2) NOT NULL,

  -- Servicio
  estimated_days INTEGER,
  includes JSONB DEFAULT '[]',
  milestones_proposed JSONB DEFAULT '[]',
  relevant_experience TEXT,
  message TEXT,

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','viewed','accepted','rejected','withdrawn','expired')),
  valid_until TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Transacciones de servicios (con escrow)
CREATE TABLE public.market_service_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL DEFAULT ('STX-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random()*999999)::text, 6, '0')),
  request_id UUID REFERENCES public.market_requests(id),
  offer_id UUID REFERENCES public.market_service_offers(id),

  -- Partes
  buyer_organization_id UUID REFERENCES public.organizations(id),
  buyer_user_id UUID REFERENCES auth.users(id),
  seller_organization_id UUID REFERENCES public.organizations(id),
  seller_user_id UUID REFERENCES auth.users(id),

  -- Importes
  currency TEXT DEFAULT 'EUR',
  professional_fees DECIMAL(10,2),
  official_fees DECIMAL(10,2),
  platform_fee_seller DECIMAL(10,2),
  platform_fee_buyer DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  escrow_held DECIMAL(10,2) DEFAULT 0,
  escrow_released DECIMAL(10,2) DEFAULT 0,

  -- Estado
  status TEXT DEFAULT 'pending_payment' CHECK (status IN ('pending_payment','payment_held','in_progress','delivered','completed','disputed','refunded','cancelled')),

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  stripe_connected_account_id TEXT,

  -- Confirmaciones
  buyer_confirmed BOOLEAN DEFAULT false,
  seller_confirmed BOOLEAN DEFAULT false,
  buyer_reviewed BOOLEAN DEFAULT false,
  seller_reviewed BOOLEAN DEFAULT false,

  -- Datos confidenciales (revelados tras pago)
  confidential_data JSONB,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 4) Milestones de cada transacción de servicio
CREATE TABLE public.market_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,

  -- Pago parcial
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','delivered','approved','disputed')),

  -- Entrega
  delivered_at TIMESTAMPTZ,
  delivered_note TEXT,
  approved_at TIMESTAMPTZ,
  approved_note TEXT,

  -- Pago
  payment_released BOOLEAN DEFAULT false,
  payment_released_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) Mensajería de servicios (entre partes de una transacción)
CREATE TABLE public.market_service_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) ON DELETE CASCADE NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id) NOT NULL,

  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','file','system')),
  file_url TEXT,
  file_name TEXT,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) Documentos adjuntos de servicios
CREATE TABLE public.market_service_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES public.market_milestones(id),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,

  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7) Valoraciones de servicios
CREATE TABLE public.market_service_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) NOT NULL,
  request_id UUID REFERENCES public.market_requests(id),

  reviewer_organization_id UUID REFERENCES public.organizations(id),
  reviewer_user_id UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_organization_id UUID REFERENCES public.organizations(id),

  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),

  comment TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8) Notificaciones de market
CREATE TABLE public.market_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Referencias
  request_id UUID REFERENCES public.market_requests(id),
  offer_id UUID REFERENCES public.market_service_offers(id),
  transaction_id UUID REFERENCES public.market_service_transactions(id),

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9) Disputas
CREATE TABLE public.market_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) NOT NULL,
  milestone_id UUID REFERENCES public.market_milestones(id),

  opened_by UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',

  status TEXT DEFAULT 'open' CHECK (status IN ('open','under_review','resolved_buyer','resolved_seller','escalated')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10) Perfiles de agente en marketplace de servicios
CREATE TABLE public.market_agent_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) UNIQUE NOT NULL,

  display_name TEXT NOT NULL,
  bio TEXT,
  logo_url TEXT,

  jurisdictions JSONB DEFAULT '[]',
  services JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',

  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  avg_response_time_hours INTEGER,

  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_documents JSONB DEFAULT '[]',

  stripe_connected_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,

  custom_seller_fee_pct DECIMAL(4,2),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11) Historial de comisiones
CREATE TABLE public.market_platform_fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.market_service_transactions(id) NOT NULL,
  milestone_id UUID REFERENCES public.market_milestones(id),

  fee_type TEXT NOT NULL CHECK (fee_type IN ('seller_fee','buyer_fee')),
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(4,2) NOT NULL,

  collected BOOLEAN DEFAULT false,
  collected_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- ÍNDICES
-- ═══════════════════════════════════════
CREATE INDEX idx_mkt_requests_status ON public.market_requests(status);
CREATE INDEX idx_mkt_requests_service ON public.market_requests(service_type);
CREATE INDEX idx_mkt_requests_jurisdiction ON public.market_requests(jurisdiction_code);
CREATE INDEX idx_mkt_requests_org ON public.market_requests(organization_id);
CREATE INDEX idx_mkt_requests_user ON public.market_requests(user_id);

CREATE INDEX idx_mkt_svc_offers_request ON public.market_service_offers(request_id);
CREATE INDEX idx_mkt_svc_offers_org ON public.market_service_offers(organization_id);

CREATE INDEX idx_mkt_svc_tx_buyer ON public.market_service_transactions(buyer_organization_id);
CREATE INDEX idx_mkt_svc_tx_seller ON public.market_service_transactions(seller_organization_id);
CREATE INDEX idx_mkt_svc_tx_status ON public.market_service_transactions(status);

CREATE INDEX idx_mkt_milestones_tx ON public.market_milestones(transaction_id);
CREATE INDEX idx_mkt_svc_messages_tx ON public.market_service_messages(transaction_id);
CREATE INDEX idx_mkt_notifications_user ON public.market_notifications(user_id, is_read);
CREATE INDEX idx_mkt_svc_reviews_reviewed ON public.market_service_reviews(reviewed_organization_id);
CREATE INDEX idx_mkt_disputes_tx ON public.market_disputes(transaction_id);

-- ═══════════════════════════════════════
-- RLS
-- ═══════════════════════════════════════
ALTER TABLE public.market_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_service_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_service_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_service_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_service_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_platform_fees ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

-- market_requests: open requests visible to all authenticated, drafts only to owner
CREATE POLICY "Anyone can view open requests" ON public.market_requests
  FOR SELECT USING (status IN ('open','reviewing','accepted','in_progress','completed') OR user_id = auth.uid());

CREATE POLICY "Users create own requests" ON public.market_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own requests" ON public.market_requests
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users delete own draft requests" ON public.market_requests
  FOR DELETE USING (user_id = auth.uid() AND status = 'draft');

-- market_service_offers: agent sees own offers, request owner sees received offers
CREATE POLICY "Agents view own offers" ON public.market_service_offers
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.market_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
  );

CREATE POLICY "Agents create offers" ON public.market_service_offers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Agents update own offers" ON public.market_service_offers
  FOR UPDATE USING (user_id = auth.uid());

-- market_service_transactions: only buyer and seller
CREATE POLICY "Participants view transactions" ON public.market_service_transactions
  FOR SELECT USING (buyer_user_id = auth.uid() OR seller_user_id = auth.uid());

CREATE POLICY "Participants update transactions" ON public.market_service_transactions
  FOR UPDATE USING (buyer_user_id = auth.uid() OR seller_user_id = auth.uid());

CREATE POLICY "System creates transactions" ON public.market_service_transactions
  FOR INSERT WITH CHECK (buyer_user_id = auth.uid());

-- market_milestones: only transaction participants
CREATE POLICY "Participants view milestones" ON public.market_milestones
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

CREATE POLICY "Participants manage milestones" ON public.market_milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

-- market_service_messages: only transaction participants
CREATE POLICY "Participants view messages" ON public.market_service_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

CREATE POLICY "Participants send messages" ON public.market_service_messages
  FOR INSERT WITH CHECK (sender_user_id = auth.uid());

-- market_service_documents: only transaction participants
CREATE POLICY "Participants view documents" ON public.market_service_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

CREATE POLICY "Participants upload documents" ON public.market_service_documents
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- market_service_reviews: public read, participants write
CREATE POLICY "Anyone can view reviews" ON public.market_service_reviews
  FOR SELECT USING (true);

CREATE POLICY "Participants create reviews" ON public.market_service_reviews
  FOR INSERT WITH CHECK (reviewer_user_id = auth.uid());

CREATE POLICY "Reviewed org can respond" ON public.market_service_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.memberships m 
            WHERE m.organization_id = reviewed_organization_id AND m.user_id = auth.uid())
  );

-- market_notifications: only recipient
CREATE POLICY "Users view own notifications" ON public.market_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.market_notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System creates notifications" ON public.market_notifications
  FOR INSERT WITH CHECK (true);

-- market_disputes: only transaction participants
CREATE POLICY "Participants view disputes" ON public.market_disputes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

CREATE POLICY "Participants open disputes" ON public.market_disputes
  FOR INSERT WITH CHECK (opened_by = auth.uid());

CREATE POLICY "Participants update disputes" ON public.market_disputes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.market_service_transactions t 
            WHERE t.id = transaction_id AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid()))
  );

-- market_agent_profiles: public read, org members write
CREATE POLICY "Anyone can view agent profiles" ON public.market_agent_profiles
  FOR SELECT USING (true);

CREATE POLICY "Org members manage profile" ON public.market_agent_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.memberships m 
            WHERE m.organization_id = market_agent_profiles.organization_id AND m.user_id = auth.uid())
  );

-- market_platform_fees: no public access (backoffice only via service_role)
CREATE POLICY "No public access to fees" ON public.market_platform_fees
  FOR SELECT USING (false);

-- ═══════════════════════════════════════
-- TRIGGERS: updated_at
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_market_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_market_requests_updated_at BEFORE UPDATE ON public.market_requests FOR EACH ROW EXECUTE FUNCTION public.update_market_updated_at();
CREATE TRIGGER trg_market_svc_offers_updated_at BEFORE UPDATE ON public.market_service_offers FOR EACH ROW EXECUTE FUNCTION public.update_market_updated_at();
CREATE TRIGGER trg_market_svc_tx_updated_at BEFORE UPDATE ON public.market_service_transactions FOR EACH ROW EXECUTE FUNCTION public.update_market_updated_at();
CREATE TRIGGER trg_market_disputes_updated_at BEFORE UPDATE ON public.market_disputes FOR EACH ROW EXECUTE FUNCTION public.update_market_updated_at();
CREATE TRIGGER trg_market_agent_profiles_updated_at BEFORE UPDATE ON public.market_agent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_market_updated_at();
