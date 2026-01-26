-- Drop and recreate the get_tenant_sidebar_menu function
DROP FUNCTION IF EXISTS public.get_tenant_sidebar_menu(uuid);

CREATE OR REPLACE FUNCTION public.get_tenant_sidebar_menu(p_organization_id uuid)
RETURNS TABLE (
  section_code text,
  section_name text,
  section_label text,
  section_icon text,
  section_order integer,
  section_always_visible boolean,
  module_code text,
  module_name text,
  module_short_name text,
  module_icon text,
  module_icon_lucide text,
  module_color text,
  module_order integer,
  module_category text,
  module_expanded boolean,
  module_menu_items jsonb,
  module_requires text[],
  module_popular boolean,
  module_coming_soon boolean,
  is_licensed boolean,
  is_trial boolean,
  trial_ends_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ms.code, 'otros')::text AS section_code,
    COALESCE(ms.name, 'Otros')::text AS section_name,
    COALESCE(ms.label, ms.name, 'Otros')::text AS section_label,
    COALESCE(ms.icon, 'Folder')::text AS section_icon,
    COALESCE(ms.sort_order, 99) AS section_order,
    COALESCE(ms.always_visible, false) AS section_always_visible,
    m.code::text AS module_code,
    m.name::text AS module_name,
    m.short_name::text AS module_short_name,
    COALESCE(m.icon, 'Package')::text AS module_icon,
    COALESCE(m.icon_lucide, m.icon, 'Package')::text AS module_icon_lucide,
    COALESCE(m.color, '#6B7280')::text AS module_color,
    COALESCE(m.sort_order, 99) AS module_order,
    COALESCE(m.category, 'general')::text AS module_category,
    COALESCE(m.default_expanded, false) AS module_expanded,
    COALESCE(m.menu_items, '[]'::jsonb) AS module_menu_items,
    COALESCE(m.requires, ARRAY[]::text[]) AS module_requires,
    COALESCE(m.is_popular, false) AS module_popular,
    COALESCE(m.coming_soon, false) AS module_coming_soon,
    -- Check if module is licensed for this organization
    CASE 
      WHEN m.is_core THEN true
      WHEN oml.id IS NOT NULL THEN true
      ELSE false
    END AS is_licensed,
    COALESCE(oml.is_trial, false) AS is_trial,
    oml.trial_ends_at
  FROM modules m
  LEFT JOIN module_sections ms ON ms.id = m.section_id
  LEFT JOIN organization_module_licenses oml 
    ON oml.module_id = m.id 
    AND oml.organization_id = p_organization_id
    AND oml.is_active = true
  WHERE m.is_active = true
    AND (
      m.is_core = true 
      OR oml.id IS NOT NULL
      OR ms.always_visible = true
    )
  ORDER BY 
    COALESCE(ms.sort_order, 99),
    COALESCE(m.sort_order, 99),
    m.name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_tenant_sidebar_menu(uuid) TO authenticated;