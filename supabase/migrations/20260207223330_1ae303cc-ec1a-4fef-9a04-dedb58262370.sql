
-- Add FK from market_service_transactions.offer_id to rfq_quotes.id
ALTER TABLE market_service_transactions
  ADD CONSTRAINT market_service_transactions_offer_id_rfq_fkey
  FOREIGN KEY (offer_id) REFERENCES rfq_quotes(id);
