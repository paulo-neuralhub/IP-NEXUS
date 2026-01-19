-- ============================================
-- FIX SECURITY WARNINGS FOR IP-MARKET
-- ============================================

-- Enable RLS on remaining tables
ALTER TABLE market_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_audit_log ENABLE ROW LEVEL SECURITY;

-- Certifications: Only transaction participants can view
CREATE POLICY "Transaction participants can view certifications" 
ON market_certifications FOR SELECT 
USING (
  transaction_id IN (
    SELECT id FROM market_transactions 
    WHERE seller_id = auth.uid() OR buyer_id = auth.uid()
  )
);

-- Certifications: System creates (via service role), no direct user insert
CREATE POLICY "Service role can manage certifications" 
ON market_certifications FOR ALL 
USING (auth.role() = 'service_role');

-- Audit Log: Only service role can manage (internal use only)
CREATE POLICY "Service role can manage audit log" 
ON market_audit_log FOR ALL 
USING (auth.role() = 'service_role');

-- Audit Log: Users can view their own actions
CREATE POLICY "Users can view own audit entries" 
ON market_audit_log FOR SELECT 
USING (actor_id = auth.uid());