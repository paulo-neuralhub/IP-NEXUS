
-- Add business fields to market_users table for agent profile completion
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS professional_email TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.market_users ADD COLUMN IF NOT EXISTS professional_registration TEXT;
