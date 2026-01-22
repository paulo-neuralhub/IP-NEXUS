-- Fix security finding introduced/related: make crm_get_pipeline_summary SECURITY INVOKER (default)
CREATE OR REPLACE FUNCTION public.crm_get_pipeline_summary(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
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