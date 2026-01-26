-- Add voip_enabled column to telephony_config for global toggle
ALTER TABLE public.telephony_config 
ADD COLUMN IF NOT EXISTS voip_enabled boolean NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.telephony_config.voip_enabled IS 'Global toggle to enable/disable VoIP functionality across all tenants';