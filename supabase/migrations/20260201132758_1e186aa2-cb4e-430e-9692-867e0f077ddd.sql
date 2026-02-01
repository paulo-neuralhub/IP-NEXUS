-- ════════════════════════════════════════════════════════════════════════════
-- EUIPO (EU) - Marca de la Unión Europea y Diseño Comunitario - CAMPOS COMPLETOS
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO jurisdiction_field_configs (
  jurisdiction_id, right_type, field_key, field_label_en, field_label_es,
  field_description, field_type, field_options, is_required, 
  visible_condition, field_group, display_order, grid_column
)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es,
       v.field_description, v.field_type, v.field_options::jsonb, v.is_required,
       v.visible_condition, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j
CROSS JOIN (VALUES
  -- ══════════════════════════════════════════════════════════════════════════
  -- MARCAS EUIPO (EUTM)
  -- ══════════════════════════════════════════════════════════════════════════
  
  -- Idiomas (obligatorio)
  ('trademark', 'eu_first_language', 'First Language', 'Primer Idioma',
   'Idioma de la solicitud', 'select',
   '[{"value":"en","label":"English"},{"value":"de","label":"Deutsch"},{"value":"es","label":"Español"},{"value":"fr","label":"Français"},{"value":"it","label":"Italiano"}]',
   true, null, 'languages', 10, 'half'),
  
  -- Tipo de marca
  ('trademark', 'eu_mark_category', 'Mark Category', 'Categoría de Marca',
   null, 'select',
   '[{"value":"individual","label":"Individual"},{"value":"collective","label":"Colectiva"},{"value":"certification","label":"De Certificación"}]',
   true, null, 'filing', 20, 'half'),
   
  ('trademark', 'eu_regulations_doc', 'Regulations Document', 'Documento de Reglamento',
   'Reglamento de uso (para marcas colectivas/certificación)', 'file', null,
   false, 'eu_mark_category !== "individual"', 'filing', 21, 'half'),
  
  -- Fast Track
  ('trademark', 'eu_fast_track_eligible', 'Fast Track Eligible', 'Elegible Fast Track',
   'Cumple requisitos para Fast Track', 'checkbox', null,
   false, 'eu_fast_track === true', 'filing', 31, 'half'),
  
  -- Antigüedad (Seniority) - campos adicionales
  ('trademark', 'eu_claim_seniority', 'Claim Seniority', 'Reivindicar Antigüedad',
   'Reivindicar antigüedad de marca nacional anterior', 'checkbox', null,
   false, null, 'seniority', 40, 'full'),
  
  -- Prioridad de exposición
  ('trademark', 'eu_exhibition_priority', 'Exhibition Priority', 'Prioridad de Exposición',
   'Prioridad por exposición internacional', 'checkbox', null,
   false, null, 'priority', 50, 'full'),
   
  ('trademark', 'eu_exhibition_name', 'Exhibition Name', 'Nombre Exposición',
   null, 'text', null,
   false, 'eu_exhibition_priority === true', 'priority', 51, 'half'),
   
  ('trademark', 'eu_exhibition_date', 'Exhibition Date', 'Fecha Exposición',
   null, 'date', null,
   false, 'eu_exhibition_priority === true', 'priority', 52, 'half'),
  
  -- Oposición
  ('trademark', 'eu_opposition_received', 'Opposition Received', 'Oposición Recibida',
   null, 'checkbox', null,
   false, null, 'opposition', 61, 'half'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- DISEÑOS EUIPO (RCD)
  -- ══════════════════════════════════════════════════════════════════════════
  
  -- Tipo de solicitud
  ('design', 'eu_design_type', 'Design Application Type', 'Tipo Solicitud Diseño',
   null, 'select',
   '[{"value":"single","label":"Single Design"},{"value":"multiple","label":"Multiple Design"}]',
   true, null, 'filing', 10, 'half'),
   
  ('design', 'eu_design_count', 'Number of Designs', 'Número de Diseños',
   'Hasta 100 diseños en solicitud múltiple', 'number', null,
   false, 'eu_design_type === "multiple"', 'filing', 11, 'half'),
  
  -- Aplazamiento publicación
  ('design', 'eu_defer_period', 'Deferment Period', 'Periodo Aplazamiento',
   null, 'select',
   '[{"value":"12","label":"12 months"},{"value":"24","label":"24 months"},{"value":"30","label":"30 months"}]',
   false, 'eu_rcd_defer === true', 'publication', 21, 'half'),
  
  -- Clasificación
  ('design', 'eu_locarno_class', 'Locarno Class', 'Clase Locarno',
   'Clasificación de Locarno', 'text', null,
   true, null, 'classification', 30, 'half'),
   
  ('design', 'eu_product_indication', 'Product Indication', 'Indicación de Producto',
   'Descripción del producto', 'text', null,
   true, null, 'classification', 31, 'half'),
  
  -- Prioridad
  ('design', 'eu_priority_country', 'Priority Country', 'País Prioridad',
   null, 'country_select', null,
   false, 'eu_rcd_priority === true', 'priority', 41, 'half'),
   
  ('design', 'eu_priority_number', 'Priority Number', 'Número Prioridad',
   null, 'text', null,
   false, 'eu_rcd_priority === true', 'priority', 42, 'third'),
   
  ('design', 'eu_priority_date', 'Priority Date', 'Fecha Prioridad',
   null, 'date', null,
   false, 'eu_rcd_priority === true', 'priority', 43, 'third')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'EU'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;