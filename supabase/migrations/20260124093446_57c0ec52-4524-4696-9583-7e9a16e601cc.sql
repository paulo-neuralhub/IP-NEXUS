-- L33-PAGOS: Align schema to Stripe Payment Links

ALTER TABLE public.payment_links
  ADD COLUMN IF NOT EXISTS stripe_payment_link_id TEXT;

-- Backfill best-effort if older rows exist (keep as NULL if unknown)
-- (No-op if table empty)

CREATE INDEX IF NOT EXISTS idx_payment_links_stripe_plink
  ON public.payment_links(stripe_payment_link_id);
