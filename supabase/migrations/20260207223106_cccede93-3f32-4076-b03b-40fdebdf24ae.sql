
-- Drop FK from rfq_requests.transaction_id → market_transactions
ALTER TABLE rfq_requests DROP CONSTRAINT IF EXISTS rfq_requests_transaction_id_fkey;
