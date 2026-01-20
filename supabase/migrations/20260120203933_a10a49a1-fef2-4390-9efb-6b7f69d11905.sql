-- PROMPT 50 Phase 6: Trial System Functions

-- Function to start a trial for a module/pack
CREATE OR REPLACE FUNCTION public.start_module_trial(
  p_pack_code VARCHAR(50),
  p_trial_days INT DEFAULT 14
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_pack RECORD;
  v_module RECORD;
  v_module_config JSONB;
  v_existing_trial INT;
BEGIN
  -- Get current user's organization
  SELECT om.organization_id INTO v_org_id
  FROM memberships om
  WHERE om.user_id = auth.uid()
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found for user';
  END IF;

  -- Get pack
  SELECT * INTO v_pack FROM subscription_packs sp WHERE sp.code = p_pack_code;

  IF v_pack IS NULL THEN
    RAISE EXCEPTION 'Pack not found: %', p_pack_code;
  END IF;

  -- Check if already has active trial for this pack
  SELECT COUNT(*) INTO v_existing_trial
  FROM organization_module_licenses oml
  JOIN platform_modules pm ON pm.id = oml.module_id
  WHERE oml.organization_id = v_org_id
    AND oml.license_type = 'trial'
    AND oml.status = 'active'
    AND pm.code IN (
      SELECT (jm->>'module_code')::text
      FROM jsonb_array_elements(v_pack.included_modules) jm
    );

  IF v_existing_trial > 0 THEN
    RAISE EXCEPTION 'Already has active trial for modules in this pack';
  END IF;

  -- Create trial licenses for each module in the pack
  FOR v_module_config IN SELECT * FROM jsonb_array_elements(v_pack.included_modules) LOOP
    -- Get module
    SELECT * INTO v_module 
    FROM platform_modules pm 
    WHERE pm.code = v_module_config->>'module_code';

    IF v_module IS NOT NULL THEN
      INSERT INTO organization_module_licenses (
        organization_id,
        module_id,
        license_type,
        tier_code,
        billing_cycle,
        status,
        trial_ends_at
      ) VALUES (
        v_org_id,
        v_module.id,
        'trial',
        v_module_config->>'tier',
        'monthly',
        'active',
        NOW() + (p_trial_days || ' days')::INTERVAL
      )
      ON CONFLICT (organization_id, module_id) DO UPDATE SET
        license_type = 'trial',
        tier_code = EXCLUDED.tier_code,
        status = 'active',
        trial_ends_at = EXCLUDED.trial_ends_at,
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$;

-- Function to check and expire trials
CREATE OR REPLACE FUNCTION public.expire_trials()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INT;
BEGIN
  UPDATE organization_module_licenses
  SET status = 'expired',
      updated_at = NOW()
  WHERE license_type = 'trial'
    AND status = 'active'
    AND trial_ends_at < NOW();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.start_module_trial(VARCHAR, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_trials() TO service_role;

-- Create index for trial expiration checks
CREATE INDEX IF NOT EXISTS idx_licenses_trial_expiry 
ON organization_module_licenses(trial_ends_at) 
WHERE license_type = 'trial' AND status = 'active';
