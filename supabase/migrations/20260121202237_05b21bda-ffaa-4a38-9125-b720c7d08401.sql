-- Seed an AI-driven contextual tip for CRM dashboard (used for dismiss+cooldown tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.onboarding_tips WHERE tip_key = 'crm.dashboard.ai_tip'
  ) THEN
    INSERT INTO public.onboarding_tips (
      id,
      tip_key,
      title,
      content,
      module,
      trigger_type,
      trigger_condition,
      position,
      highlight_selector,
      tour_order,
      is_tour_step,
      dismissible,
      show_once,
      is_active,
      created_at
    ) VALUES (
      gen_random_uuid(),
      'crm.dashboard.ai_tip',
      'Tip de CRM',
      'Consejo contextual para CRM (generado por IA).',
      'crm',
      NULL,
      NULL,
      'top',
      NULL,
      NULL,
      false,
      true,
      false,
      true,
      now()
    );
  END IF;
END $$;