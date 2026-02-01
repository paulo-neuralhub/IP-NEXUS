-- ════════════════════════════════════════════════════════════════════════════
-- REINO UNIDO (GB) - UKIPO - Campos específicos post-Brexit
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
  ('trademark', 'gb_from_eutm', 'Converted from EUTM', 'Convertida de MUTUE',
   'Comparable UK trademark from EUTM', 'checkbox', null,
   false, null, 'origin', 10, 'half'),
   
  ('trademark', 'gb_original_eutm', 'Original EUTM Number', 'Número MUTUE Original',
   null, 'text', null,
   false, 'gb_from_eutm === true', 'origin', 11, 'half'),
   
  ('trademark', 'gb_series_mark', 'Series Mark', 'Marca en Serie',
   'UK allows series of similar marks', 'checkbox', null,
   false, null, 'filing', 20, 'half'),
   
  ('trademark', 'gb_series_count', 'Number in Series', 'Número en Serie',
   'Max 6 marks in a series', 'number', null,
   false, 'gb_series_mark === true', 'filing', 21, 'half'),
   
  ('trademark', 'gb_right_to_be_heard', 'Right to be Heard Requested', 'Audiencia Solicitada',
   null, 'checkbox', null,
   false, null, 'examination', 30, 'half'),
   
  ('patent', 'gb_from_ep', 'Converted from EP', 'Convertida de EP',
   'UK validation of EP patent', 'checkbox', null,
   false, null, 'origin', 10, 'half'),
   
  ('patent', 'gb_original_ep', 'Original EP Number', 'Número EP Original',
   null, 'text', null,
   false, 'gb_from_ep === true', 'origin', 11, 'half'),
   
  ('patent', 'gb_green_channel', 'Green Channel', 'Canal Verde',
   'Accelerated examination for green tech', 'checkbox', null,
   false, null, 'examination', 20, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'GB'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;