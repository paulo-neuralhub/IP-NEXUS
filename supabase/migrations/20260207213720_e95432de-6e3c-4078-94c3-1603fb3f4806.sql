
-- Drop FK constraints that block inserts from rfq_requests into market_service_transactions
ALTER TABLE market_service_transactions DROP CONSTRAINT IF EXISTS market_service_transactions_request_id_fkey;
ALTER TABLE market_service_transactions DROP CONSTRAINT IF EXISTS market_service_transactions_offer_id_fkey;
