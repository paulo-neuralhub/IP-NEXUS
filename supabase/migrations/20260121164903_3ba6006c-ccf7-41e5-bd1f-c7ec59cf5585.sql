-- =====================================================
-- RANKINGS DIARIOS DE AGENTES
-- =====================================================
CREATE TABLE agent_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fecha del ranking
  ranking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Agente
  agent_id UUID NOT NULL REFERENCES market_users(id) ON DELETE CASCADE,
  
  -- Posición
  rank_position INT NOT NULL,
  rank_previous INT,
  rank_change INT GENERATED ALWAYS AS (
    CASE WHEN rank_previous IS NOT NULL 
         THEN rank_previous - rank_position 
         ELSE 0 
    END
  ) STORED,
  
  -- Percentil
  rank_percentile DECIMAL(5,2),
  
  -- Scores componentes (snapshot)
  reputation_score INT NOT NULL,
  rating_avg DECIMAL(3,1) NOT NULL,
  success_rate DECIMAL(5,2) NOT NULL,
  response_time_avg INT NOT NULL,
  total_transactions INT NOT NULL,
  
  -- Categoría del ranking
  ranking_category TEXT DEFAULT 'global' CHECK (ranking_category IN (
    'global',
    'trademark',
    'patent',
    'country_es',
    'country_us',
    'country_eu',
    'rising'
  )),
  
  -- Jurisdicción (para rankings por país)
  jurisdiction TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un ranking por agente por día por categoría
  UNIQUE(ranking_date, agent_id, ranking_category)
);

-- Índices
CREATE INDEX idx_rankings_date ON agent_rankings(ranking_date DESC);
CREATE INDEX idx_rankings_agent ON agent_rankings(agent_id);
CREATE INDEX idx_rankings_category ON agent_rankings(ranking_category);
CREATE INDEX idx_rankings_position ON agent_rankings(ranking_date, ranking_category, rank_position);

-- RLS (público para lectura)
ALTER TABLE agent_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rankings are publicly viewable"
  ON agent_rankings FOR SELECT
  USING (true);

-- =====================================================
-- BADGES DE AGENTES
-- =====================================================
CREATE TABLE agent_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  agent_id UUID NOT NULL REFERENCES market_users(id) ON DELETE CASCADE,
  
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'top_1', 'top_3', 'top_10', 'top_performer',
    'fast_responder', 'lightning_fast',
    'trusted_agent', 'veteran', 'master',
    'five_star', 'highly_rated', 'perfect_record',
    'expert_trademarks', 'expert_patents', 'expert_litigation',
    'multilingual', 'global_reach', 'eu_specialist', 'us_specialist',
    'rising_star', 'comeback', 'consistent',
    'verified_pro', 'premium_member'
  )),
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  context JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único parcial para un badge activo por tipo por agente
CREATE UNIQUE INDEX idx_badges_unique_active ON agent_badges(agent_id, badge_type) WHERE is_active = true;

-- Índices
CREATE INDEX idx_badges_agent ON agent_badges(agent_id);
CREATE INDEX idx_badges_type ON agent_badges(badge_type);
CREATE INDEX idx_badges_active ON agent_badges(agent_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE agent_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are publicly viewable"
  ON agent_badges FOR SELECT
  USING (true);

-- =====================================================
-- FUNCIÓN: Calcular rankings diarios
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_daily_rankings()
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_total_agents INT;
BEGIN
  SELECT COUNT(*) INTO v_total_agents
  FROM market_users
  WHERE is_agent = true 
    AND is_active = true 
    AND is_public_profile = true
    AND total_transactions >= 1;
  
  IF v_total_agents = 0 THEN
    RETURN;
  END IF;
  
  -- Calcular ranking global
  INSERT INTO agent_rankings (
    ranking_date, agent_id, rank_position, rank_previous, rank_percentile,
    reputation_score, rating_avg, success_rate, response_time_avg, total_transactions, ranking_category
  )
  SELECT
    v_today,
    mu.id,
    ROW_NUMBER() OVER (ORDER BY mu.reputation_score DESC, mu.rating_avg DESC, mu.total_transactions DESC),
    prev.rank_position,
    (ROW_NUMBER() OVER (ORDER BY mu.reputation_score DESC)::DECIMAL / v_total_agents) * 100,
    mu.reputation_score,
    mu.rating_avg,
    mu.success_rate,
    mu.response_time_avg,
    mu.total_transactions,
    'global'
  FROM market_users mu
  LEFT JOIN agent_rankings prev ON prev.agent_id = mu.id 
    AND prev.ranking_date = v_yesterday 
    AND prev.ranking_category = 'global'
  WHERE mu.is_agent = true 
    AND mu.is_active = true 
    AND mu.is_public_profile = true
    AND mu.total_transactions >= 1
  ON CONFLICT (ranking_date, agent_id, ranking_category) 
  DO UPDATE SET
    rank_position = EXCLUDED.rank_position,
    rank_previous = EXCLUDED.rank_previous,
    rank_percentile = EXCLUDED.rank_percentile,
    reputation_score = EXCLUDED.reputation_score;
  
  -- Actualizar market_users con posición actual
  UPDATE market_users mu
  SET 
    rank_position = ar.rank_position,
    rank_percentile = ar.rank_percentile,
    updated_at = NOW()
  FROM agent_rankings ar
  WHERE ar.agent_id = mu.id
    AND ar.ranking_date = v_today
    AND ar.ranking_category = 'global';
  
  -- Asignar badges automáticos
  PERFORM assign_automatic_badges();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- FUNCIÓN: Asignar badges automáticos
-- =====================================================
CREATE OR REPLACE FUNCTION assign_automatic_badges()
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Badge: top_1
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT agent_id, 'top_1', jsonb_build_object('ranking_date', v_today, 'category', 'global')
  FROM agent_rankings
  WHERE ranking_date = v_today AND ranking_category = 'global' AND rank_position = 1
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: top_3
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT agent_id, 'top_3', jsonb_build_object('ranking_date', v_today)
  FROM agent_rankings
  WHERE ranking_date = v_today AND ranking_category = 'global' AND rank_position <= 3
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: top_10
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT agent_id, 'top_10', jsonb_build_object('ranking_date', v_today)
  FROM agent_rankings
  WHERE ranking_date = v_today AND ranking_category = 'global' AND rank_position <= 10
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: top_performer (top 10%)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT agent_id, 'top_performer', jsonb_build_object('percentile', rank_percentile)
  FROM agent_rankings
  WHERE ranking_date = v_today AND ranking_category = 'global' AND rank_percentile <= 10
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: fast_responder (< 120 min promedio)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'fast_responder', jsonb_build_object('avg_minutes', response_time_avg)
  FROM market_users
  WHERE is_agent = true AND response_time_avg > 0 AND response_time_avg <= 120
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: trusted_agent (50+ transacciones)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'trusted_agent', jsonb_build_object('transactions', total_transactions)
  FROM market_users
  WHERE is_agent = true AND total_transactions >= 50
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: veteran (100+ transacciones)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'veteran', jsonb_build_object('transactions', total_transactions)
  FROM market_users
  WHERE is_agent = true AND total_transactions >= 100
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: five_star (5.0 rating con min 10 reviews)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'five_star', jsonb_build_object('rating', rating_avg, 'reviews', ratings_count)
  FROM market_users
  WHERE is_agent = true AND rating_avg = 5.0 AND ratings_count >= 10
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: highly_rated (>= 4.8 con min 20 reviews)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'highly_rated', jsonb_build_object('rating', rating_avg, 'reviews', ratings_count)
  FROM market_users
  WHERE is_agent = true AND rating_avg >= 4.8 AND ratings_count >= 20
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: multilingual (3+ idiomas)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'multilingual', jsonb_build_object('languages', languages)
  FROM market_users
  WHERE is_agent = true AND array_length(languages, 1) >= 3
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: global_reach (5+ jurisdicciones)
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'global_reach', jsonb_build_object('jurisdictions', jurisdictions)
  FROM market_users
  WHERE is_agent = true AND array_length(jurisdictions, 1) >= 5
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Badge: verified_pro
  INSERT INTO agent_badges (agent_id, badge_type, context)
  SELECT id, 'verified_pro', jsonb_build_object('verified_at', agent_verified_at)
  FROM market_users
  WHERE is_agent = true AND is_verified_agent = true
  ON CONFLICT (agent_id, badge_type) WHERE is_active = true DO NOTHING;
  
  -- Desactivar badges que ya no aplican
  UPDATE agent_badges SET is_active = false, expires_at = NOW()
  WHERE badge_type = 'fast_responder'
    AND agent_id NOT IN (
      SELECT id FROM market_users WHERE response_time_avg <= 120 AND response_time_avg > 0
    )
    AND is_active = true;
  
  -- Actualizar array de badges en market_users
  UPDATE market_users mu
  SET badges = (
    SELECT COALESCE(array_agg(badge_type::text), ARRAY[]::TEXT[])
    FROM agent_badges ab
    WHERE ab.agent_id = mu.id AND ab.is_active = true
  ),
  updated_at = NOW()
  WHERE is_agent = true;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;