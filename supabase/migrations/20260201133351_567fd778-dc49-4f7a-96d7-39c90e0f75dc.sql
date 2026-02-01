-- ════════════════════════════════════════════════════════════════════════════
-- EPO (EP) - European Patent Office - CAMPOS COMPLETOS
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Crear jurisdicción EP
INSERT INTO jurisdictions (
  code, name, name_en, name_es, jurisdiction_type, tier, region,
  ipo_name, office_acronym, office_website,
  supports_trademarks, supports_patents, supports_utility_models, supports_designs,
  is_madrid_member, is_pct_member, is_hague_member, is_paris_member,
  is_active, sort_order, price_monthly
) VALUES (
  'EP', 'EPO (European Patent Office)', 'European Patent Office', 'Oficina Europea de Patentes',
  'regional', 1, 'Europe',
  'European Patent Office', 'EPO', 'https://www.epo.org/',
  false, true, false, false,
  false, true, false, true,
  true, 6, 0
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  supports_patents = EXCLUDED.supports_patents;

-- 2. Insertar campos EPO
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
  -- TIPO Y VÍA DE ENTRADA
  ('patent', 'ep_entry_route', 'Entry Route', 'Vía de Entrada',
   null, 'select',
   '[{"value":"direct","label":"Direct EP Application"},{"value":"pct","label":"Euro-PCT (PCT National Phase)"}]',
   true, null, 'filing', 10, 'half'),
   
  ('patent', 'ep_pct_number', 'PCT Application Number', 'Número PCT',
   null, 'text', null,
   false, 'ep_entry_route === "pct"', 'filing', 11, 'half'),
  
  -- IDIOMA
  ('patent', 'ep_filing_language', 'Filing Language', 'Idioma de Presentación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"de","label":"German"},{"value":"fr","label":"French"}]',
   true, null, 'language', 20, 'half'),
   
  ('patent', 'ep_proceedings_language', 'Proceedings Language', 'Idioma de Procedimiento',
   'Usually same as filing language', 'select',
   '[{"value":"en","label":"English"},{"value":"de","label":"German"},{"value":"fr","label":"French"}]',
   false, null, 'language', 21, 'half'),
  
  -- DESIGNACIONES
  ('patent', 'ep_designated_states', 'Designated Contracting States', 'Estados Designados',
   'Countries where protection is sought', 'multi_select', null,
   false, null, 'designations', 30, 'full'),
   
  ('patent', 'ep_extension_states', 'Extension States', 'Estados de Extensión',
   'Non-member states with extension agreements', 'multi_select', null,
   false, null, 'designations', 31, 'full'),
  
  -- EXAMEN
  ('patent', 'ep_search_report_received', 'Search Report Received', 'Informe Búsqueda Recibido',
   null, 'checkbox', null, false, null, 'examination', 40, 'third'),
   
  ('patent', 'ep_search_report_date', 'Search Report Date', 'Fecha Informe Búsqueda',
   null, 'date', null, false, 'ep_search_report_received === true', 'examination', 41, 'third'),
   
  ('patent', 'ep_examination_requested', 'Examination Requested', 'Examen Solicitado',
   'Within 6 months of search report publication', 'checkbox', null, false, null, 'examination', 42, 'third'),
   
  ('patent', 'ep_pace', 'PACE Requested', 'PACE Solicitado',
   'Programme for Accelerated Prosecution', 'checkbox', null, false, null, 'examination', 50, 'half'),
   
  ('patent', 'ep_oral_proceedings', 'Oral Proceedings Scheduled', 'Vista Oral Programada',
   null, 'checkbox', null, false, null, 'examination', 51, 'half'),
  
  -- DIVISIONALES
  ('patent', 'ep_is_divisional', 'Is Divisional', 'Es Divisional',
   null, 'checkbox', null, false, null, 'divisional', 60, 'half'),
   
  ('patent', 'ep_parent_application', 'Parent Application', 'Solicitud Matriz',
   null, 'text', null, false, 'ep_is_divisional === true', 'divisional', 61, 'half'),
  
  -- CONCESIÓN Y VALIDACIÓN
  ('patent', 'ep_grant_date', 'Grant Date', 'Fecha Concesión',
   null, 'date', null, false, null, 'grant', 70, 'half'),
   
  ('patent', 'ep_publication_b1', 'B1 Publication Number', 'Número Publicación B1',
   'Granted patent publication', 'text', null, false, null, 'grant', 71, 'half'),
   
  ('patent', 'ep_validation_deadline', 'Validation Deadline', 'Plazo Validación',
   '3 months from grant publication', 'date', null, false, null, 'validation', 80, 'half'),
   
  ('patent', 'ep_validated_countries', 'Validated Countries', 'Países Validados',
   'Countries where national validation completed', 'multi_select', null, false, null, 'validation', 81, 'full'),
  
  -- OPOSICIÓN
  ('patent', 'ep_opposition_period_end', 'Opposition Period End', 'Fin Plazo Oposición',
   '9 months from grant publication', 'date', null, false, null, 'opposition', 90, 'half'),
   
  ('patent', 'ep_opposition_filed', 'Opposition Filed Against', 'Oposición Presentada',
   null, 'checkbox', null, false, null, 'opposition', 91, 'half'),

  -- UPC (Unified Patent Court)
  ('patent', 'ep_upc_opt_out', 'UPC Opt-Out', 'Exclusión UPC',
   'Opted out of Unified Patent Court jurisdiction', 'checkbox', null, false, null, 'upc', 100, 'half'),
   
  ('patent', 'ep_upc_opt_out_date', 'Opt-Out Date', 'Fecha Exclusión',
   null, 'date', null, false, 'ep_upc_opt_out === true', 'upc', 101, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'EP'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_description = EXCLUDED.field_description;