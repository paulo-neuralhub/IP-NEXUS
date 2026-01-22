-- CRM V2: vincular deals a pipelines/etapas reales (legacy tables: pipelines, pipeline_stages)

-- 1) Nuevas columnas
ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS pipeline_id uuid;

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS stage_id uuid;

-- 2) FKs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_deals_pipeline_id_fkey'
  ) THEN
    ALTER TABLE public.crm_deals
      ADD CONSTRAINT crm_deals_pipeline_id_fkey
      FOREIGN KEY (pipeline_id) REFERENCES public.pipelines(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'crm_deals_stage_id_fkey'
  ) THEN
    ALTER TABLE public.crm_deals
      ADD CONSTRAINT crm_deals_stage_id_fkey
      FOREIGN KEY (stage_id) REFERENCES public.pipeline_stages(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Índices
CREATE INDEX IF NOT EXISTS idx_crm_deals_org_pipeline ON public.crm_deals(organization_id, pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_org_stage ON public.crm_deals(organization_id, stage_id);

-- 4) Backfill pipeline_id -> pipeline default por organización (tenant)
WITH defaults AS (
  SELECT p.organization_id, p.id AS pipeline_id
  FROM public.pipelines p
  WHERE p.owner_type = 'tenant' AND p.is_default = true
)
UPDATE public.crm_deals d
SET pipeline_id = defaults.pipeline_id
FROM defaults
WHERE d.organization_id = defaults.organization_id
  AND d.pipeline_id IS NULL;

-- 5) Backfill stage_id para deals antiguos (best-effort) usando pipeline default:
--    - terminal won/lost por flags
--    - resto por posición (primeras N no-terminal)
WITH stages AS (
  SELECT
    p.organization_id,
    p.id AS pipeline_id,
    s.id AS stage_id,
    s.position,
    COALESCE(s.is_won_stage, false) AS is_won,
    COALESCE(s.is_lost_stage, false) AS is_lost
  FROM public.pipelines p
  JOIN public.pipeline_stages s ON s.pipeline_id = p.id
  WHERE p.owner_type = 'tenant' AND p.is_default = true
), pick AS (
  SELECT
    organization_id,
    pipeline_id,
    -- terminal
    (SELECT stage_id FROM stages st WHERE st.organization_id = stages.organization_id AND st.pipeline_id = stages.pipeline_id AND st.is_won ORDER BY st.position LIMIT 1) AS won_stage_id,
    (SELECT stage_id FROM stages st WHERE st.organization_id = stages.organization_id AND st.pipeline_id = stages.pipeline_id AND st.is_lost ORDER BY st.position LIMIT 1) AS lost_stage_id,
    -- no-terminal ordenadas
    array_agg(stage_id ORDER BY position) FILTER (WHERE NOT is_won AND NOT is_lost) AS open_stage_ids
  FROM stages
  GROUP BY organization_id, pipeline_id
)
UPDATE public.crm_deals d
SET stage_id = CASE
  WHEN d.stage = 'won' THEN pick.won_stage_id
  WHEN d.stage = 'lost' THEN pick.lost_stage_id
  WHEN d.stage = 'negotiation' THEN COALESCE(pick.open_stage_ids[5], pick.open_stage_ids[array_length(pick.open_stage_ids,1)])
  WHEN d.stage = 'proposal' THEN COALESCE(pick.open_stage_ids[4], pick.open_stage_ids[array_length(pick.open_stage_ids,1)])
  WHEN d.stage = 'needs' THEN COALESCE(pick.open_stage_ids[3], pick.open_stage_ids[1])
  WHEN d.stage = 'contact' THEN COALESCE(pick.open_stage_ids[2], pick.open_stage_ids[1])
  WHEN d.stage = 'lead_in' THEN COALESCE(pick.open_stage_ids[1], pick.open_stage_ids[1])
  ELSE d.stage_id
END
FROM pick
WHERE d.organization_id = pick.organization_id
  AND d.pipeline_id = pick.pipeline_id
  AND d.stage_id IS NULL;

-- 6) RPC: resumen por etapas (pipeline-aware si stage_id existe)
CREATE OR REPLACE FUNCTION public.crm_get_pipeline_summary(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Si hay stage_id, agregamos por pipeline_stages.name
  WITH deals AS (
    SELECT d.*
    FROM public.crm_deals d
    WHERE d.organization_id = p_organization_id
  ), by_stage AS (
    SELECT
      COALESCE(s.name, d.stage) AS stage,
      count(*)::int AS count,
      COALESCE(sum(d.amount),0)::numeric AS amount,
      COALESCE(sum(d.weighted_amount),0)::numeric AS weighted_amount
    FROM deals d
    LEFT JOIN public.pipeline_stages s ON s.id = d.stage_id
    GROUP BY COALESCE(s.name, d.stage)
    ORDER BY amount DESC
  ), totals AS (
    SELECT
      count(*)::int AS total,
      COALESCE(sum(amount),0)::numeric AS total_amount,
      COALESCE(sum(weighted_amount),0)::numeric AS total_weighted_amount
    FROM deals
  )
  SELECT jsonb_build_object(
    'total', totals.total,
    'total_amount', totals.total_amount,
    'total_weighted_amount', totals.total_weighted_amount,
    'by_stage', COALESCE(jsonb_agg(jsonb_build_object(
      'stage', by_stage.stage,
      'count', by_stage.count,
      'amount', by_stage.amount,
      'weighted_amount', by_stage.weighted_amount
    )), '[]'::jsonb)
  )
  INTO result
  FROM totals
  LEFT JOIN by_stage ON true;

  RETURN result;
END;
$$;

-- Nota: RLS no se modifica aquí; asumimos ya está aplicada en crm_deals/pipelines/pipeline_stages.