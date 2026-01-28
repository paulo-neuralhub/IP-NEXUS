-- Populate agent_rankings with current agent data
-- Excluding rank_change since it's a generated column

INSERT INTO agent_rankings (
  agent_id,
  ranking_date,
  rank_position,
  rank_previous,
  rank_percentile,
  reputation_score,
  rating_avg,
  total_transactions,
  success_rate,
  response_time_avg,
  ranking_category,
  jurisdiction
)
SELECT 
  id as agent_id,
  CURRENT_DATE as ranking_date,
  ROW_NUMBER() OVER (ORDER BY reputation_score DESC, rating_avg DESC) as rank_position,
  NULL as rank_previous,
  ROUND(100.0 * (ROW_NUMBER() OVER (ORDER BY reputation_score DESC, rating_avg DESC) - 1) / 
    NULLIF(COUNT(*) OVER (), 0), 2) as rank_percentile,
  reputation_score,
  COALESCE(rating_avg, 0) as rating_avg,
  total_transactions,
  COALESCE(success_rate, 0) as success_rate,
  COALESCE(response_time_avg, 0) as response_time_avg,
  'global' as ranking_category,
  NULL as jurisdiction
FROM market_users
WHERE is_agent = true 
  AND is_active = true
  AND is_verified_agent = true
ON CONFLICT DO NOTHING;