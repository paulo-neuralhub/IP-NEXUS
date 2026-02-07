
-- Drop FKs on market_notifications that reference old tables
ALTER TABLE market_notifications DROP CONSTRAINT IF EXISTS market_notifications_request_id_fkey;
ALTER TABLE market_notifications DROP CONSTRAINT IF EXISTS market_notifications_offer_id_fkey;
ALTER TABLE market_notifications DROP CONSTRAINT IF EXISTS market_notifications_transaction_id_fkey;
