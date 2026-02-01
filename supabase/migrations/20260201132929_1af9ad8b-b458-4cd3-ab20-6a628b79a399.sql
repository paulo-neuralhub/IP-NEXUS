-- ════════════════════════════════════════════════════════════════════════════
-- USPTO (US) - El sistema más complejo - CAMPOS COMPLETOS
-- Marcas con bases múltiples y declaraciones de mantenimiento
-- ════════════════════════════════════════════════════════════════════════════

INSERT INTO jurisdiction_field_configs (
  jurisdiction_id, right_type, field_key, field_label_en, field_label_es,
  field_description, field_type, field_options, is_required, 
  is_required_condition, visible_condition, field_group, display_order, grid_column
)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es,
       v.field_description, v.field_type, v.field_options::jsonb, v.is_required,
       v.is_required_condition, v.visible_condition, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j
CROSS JOIN (VALUES
  -- ══════════════════════════════════════════════════════════════════════════
  -- MARCAS USPTO - BASE DE SOLICITUD
  -- ══════════════════════════════════════════════════════════════════════════
  
  -- Base principal (obligatorio)
  ('trademark', 'us_filing_basis', 'Filing Basis', 'Base de Solicitud',
   'Legal basis for trademark application', 'select',
   '[{"value":"1a","label":"§1(a) - Use in Commerce"},{"value":"1b","label":"§1(b) - Intent to Use"},{"value":"44d","label":"§44(d) - Foreign Application Priority"},{"value":"44e","label":"§44(e) - Foreign Registration"},{"value":"66a","label":"§66(a) - Madrid Protocol"}]',
   true, null, null, 'basis', 10, 'full'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- CAMPOS PARA §1(a) - USO EN COMERCIO
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('trademark', 'us_first_use_anywhere', 'Date of First Use Anywhere', 'Fecha Primer Uso',
   'Date mark was first used anywhere in the world', 'date', null,
   false, 'us_filing_basis === "1a"', 'us_filing_basis === "1a"', 'use', 20, 'half'),
   
  ('trademark', 'us_first_use_commerce', 'Date of First Use in Commerce', 'Fecha Primer Uso en Comercio',
   'Date mark was first used in interstate/international commerce', 'date', null,
   false, 'us_filing_basis === "1a"', 'us_filing_basis === "1a"', 'use', 21, 'half'),
   
  ('trademark', 'us_specimen_type', 'Specimen Type', 'Tipo de Espécimen',
   null, 'select',
   '[{"value":"product","label":"Product Specimen (goods)"},{"value":"website","label":"Website Screenshot"},{"value":"advertising","label":"Advertising (services)"},{"value":"packaging","label":"Product Packaging"},{"value":"tag","label":"Tag/Label"}]',
   false, 'us_filing_basis === "1a"', 'us_filing_basis === "1a"', 'specimen', 30, 'half'),
   
  ('trademark', 'us_specimen_file', 'Specimen File', 'Archivo Espécimen',
   'Upload specimen showing use in commerce', 'file', null,
   false, 'us_filing_basis === "1a"', 'us_filing_basis === "1a"', 'specimen', 31, 'half'),
   
  ('trademark', 'us_specimen_description', 'Specimen Description', 'Descripción Espécimen',
   'Describe how mark appears on specimen and how it is used', 'textarea', null,
   false, null, 'us_filing_basis === "1a"', 'specimen', 32, 'full'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- CAMPOS PARA §1(b) - INTENCIÓN DE USO
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('trademark', 'us_noa_received', 'Notice of Allowance Received', 'NOA Recibido',
   'Notice of Allowance has been issued', 'checkbox', null,
   false, null, 'us_filing_basis === "1b"', 'itu', 40, 'third'),
   
  ('trademark', 'us_noa_date', 'NOA Issue Date', 'Fecha NOA',
   null, 'date', null,
   false, null, 'us_noa_received === true', 'itu', 41, 'third'),
   
  ('trademark', 'us_sou_deadline', 'Statement of Use Deadline', 'Plazo SOU',
   '6 months from NOA, extendable', 'date', null,
   false, null, 'us_noa_received === true', 'itu', 42, 'third'),
   
  ('trademark', 'us_sou_filed', 'Statement of Use Filed', 'SOU Presentada',
   null, 'checkbox', null,
   false, null, 'us_filing_basis === "1b"', 'itu', 50, 'half'),
   
  ('trademark', 'us_sou_file_date', 'SOU Filing Date', 'Fecha Presentación SOU',
   null, 'date', null,
   false, null, 'us_sou_filed === true', 'itu', 51, 'half'),
   
  ('trademark', 'us_extensions_filed', 'Extensions Filed', 'Extensiones Solicitadas',
   'Number of 6-month extensions (max 5)', 'select',
   '[{"value":"0","label":"0"},{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"}]',
   false, null, 'us_filing_basis === "1b"', 'itu', 60, 'half'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- CAMPOS PARA §44(d) - PRIORIDAD EXTRANJERA
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('trademark', 'us_foreign_app_country', 'Foreign Application Country', 'País Solicitud Extranjera',
   null, 'country_select', null,
   false, 'us_filing_basis === "44d"', 'us_filing_basis === "44d"', 'foreign', 70, 'third'),
   
  ('trademark', 'us_foreign_app_number', 'Foreign Application Number', 'Número Solicitud Extranjera',
   null, 'text', null,
   false, 'us_filing_basis === "44d"', 'us_filing_basis === "44d"', 'foreign', 71, 'third'),
   
  ('trademark', 'us_foreign_app_date', 'Foreign Application Date', 'Fecha Solicitud Extranjera',
   null, 'date', null,
   false, 'us_filing_basis === "44d"', 'us_filing_basis === "44d"', 'foreign', 72, 'third'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- CAMPOS PARA §44(e) - REGISTRO EXTRANJERO
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('trademark', 'us_foreign_reg_country', 'Foreign Registration Country', 'País Registro Extranjero',
   null, 'country_select', null,
   false, 'us_filing_basis === "44e"', 'us_filing_basis === "44e"', 'foreign', 80, 'third'),
   
  ('trademark', 'us_foreign_reg_number', 'Foreign Registration Number', 'Número Registro Extranjero',
   null, 'text', null,
   false, 'us_filing_basis === "44e"', 'us_filing_basis === "44e"', 'foreign', 81, 'third'),
   
  ('trademark', 'us_foreign_reg_date', 'Foreign Registration Date', 'Fecha Registro Extranjero',
   null, 'date', null,
   false, 'us_filing_basis === "44e"', 'us_filing_basis === "44e"', 'foreign', 82, 'third'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- CAMPOS PARA §66(a) - MADRID PROTOCOL
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('trademark', 'us_intl_reg_number', 'International Registration Number', 'Número Registro Internacional',
   'WIPO International Registration number', 'text', null,
   false, 'us_filing_basis === "66a"', 'us_filing_basis === "66a"', 'madrid', 90, 'half'),
   
  ('trademark', 'us_intl_reg_date', 'International Registration Date', 'Fecha Registro Internacional',
   null, 'date', null,
   false, 'us_filing_basis === "66a"', 'us_filing_basis === "66a"', 'madrid', 91, 'half'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- ASPECTOS LEGALES COMUNES
  -- ══════════════════════════════════════════════════════════════════════════
  
  -- Disclaimer
  ('trademark', 'us_disclaimer', 'Disclaimer', 'Renuncia',
   'Elements disclaimed from exclusive rights', 'text', null,
   false, null, null, 'legal', 100, 'full'),
  
  -- Distintividad adquirida
  ('trademark', 'us_2f_claim', 'Acquired Distinctiveness (§2(f))', 'Distintividad Adquirida §2(f)',
   'Claim acquired distinctiveness for descriptive mark', 'checkbox', null,
   false, null, null, 'legal', 110, 'half'),
   
  ('trademark', 'us_2f_basis', '§2(f) Basis', 'Base §2(f)',
   null, 'select',
   '[{"value":"claim","label":"Claim only"},{"value":"5years","label":"5 years substantially exclusive use"},{"value":"evidence","label":"Other evidence"}]',
   false, null, 'us_2f_claim === true', 'legal', 111, 'half'),
  
  -- Uso concurrente
  ('trademark', 'us_concurrent_use', 'Concurrent Use', 'Uso Concurrente',
   'Application based on concurrent use', 'checkbox', null,
   false, null, null, 'legal', 120, 'half'),
   
  ('trademark', 'us_concurrent_territory', 'Concurrent Use Territory', 'Territorio Uso Concurrente',
   'Geographic territory for concurrent use', 'text', null,
   false, null, 'us_concurrent_use === true', 'legal', 121, 'half'),
  
  -- ══════════════════════════════════════════════════════════════════════════
  -- DECLARACIONES DE MANTENIMIENTO
  -- ══════════════════════════════════════════════════════════════════════════
  
  -- Section 8 (Declaración de uso continuo - años 5-6)
  ('trademark', 'us_sec8_due', 'Section 8 Due Date', 'Fecha Límite §8',
   'Declaration of continued use (between 5th-6th year)', 'date', null,
   false, null, null, 'maintenance', 130, 'third'),
   
  ('trademark', 'us_sec8_filed', 'Section 8 Filed', '§8 Presentada',
   null, 'checkbox', null,
   false, null, null, 'maintenance', 131, 'third'),
   
  ('trademark', 'us_sec8_date', 'Section 8 Filing Date', 'Fecha §8',
   null, 'date', null,
   false, null, 'us_sec8_filed === true', 'maintenance', 132, 'third'),
  
  -- Section 15 (Incontestabilidad)
  ('trademark', 'us_sec15_filed', 'Section 15 Filed (Incontestability)', '§15 Presentada',
   'Declaration of incontestability', 'checkbox', null,
   false, null, null, 'maintenance', 140, 'half'),
   
  ('trademark', 'us_sec15_date', 'Section 15 Filing Date', 'Fecha §15',
   null, 'date', null,
   false, null, 'us_sec15_filed === true', 'maintenance', 141, 'half'),
  
  -- Section 9 (Renovación - cada 10 años)
  ('trademark', 'us_sec9_due', 'Section 9 Due Date (Renewal)', 'Fecha Límite §9',
   'Renewal declaration (every 10 years)', 'date', null,
   false, null, null, 'maintenance', 150, 'third'),
   
  ('trademark', 'us_sec9_filed', 'Section 9 Filed', '§9 Presentada',
   null, 'checkbox', null,
   false, null, null, 'maintenance', 151, 'third'),
   
  ('trademark', 'us_sec9_date', 'Section 9 Filing Date', 'Fecha §9',
   null, 'date', null,
   false, null, 'us_sec9_filed === true', 'maintenance', 152, 'third'),
  
  -- Section 71 (Solo para §66(a) Madrid)
  ('trademark', 'us_sec71_due', 'Section 71 Due Date', 'Fecha Límite §71',
   'Affidavit for Madrid Protocol registrations', 'date', null,
   false, null, 'us_filing_basis === "66a"', 'maintenance', 160, 'half'),
   
  ('trademark', 'us_sec71_filed', 'Section 71 Filed', '§71 Presentada',
   null, 'checkbox', null,
   false, null, 'us_filing_basis === "66a"', 'maintenance', 161, 'half'),

  -- ══════════════════════════════════════════════════════════════════════════
  -- PATENTES USPTO
  -- ══════════════════════════════════════════════════════════════════════════
  
  ('patent', 'us_patent_type', 'Patent Type', 'Tipo de Patente',
   null, 'select',
   '[{"value":"utility","label":"Utility Patent"},{"value":"design","label":"Design Patent"},{"value":"plant","label":"Plant Patent"},{"value":"provisional","label":"Provisional Application"}]',
   true, null, null, 'filing', 10, 'half'),
   
  ('patent', 'us_filing_type', 'Filing Type', 'Tipo de Solicitud',
   null, 'select',
   '[{"value":"original","label":"Original"},{"value":"continuation","label":"Continuation"},{"value":"cip","label":"Continuation-in-Part (CIP)"},{"value":"divisional","label":"Divisional"}]',
   true, null, null, 'filing', 11, 'half'),
   
  ('patent', 'us_parent_app', 'Parent Application', 'Solicitud Matriz',
   null, 'text', null,
   false, null, 'us_filing_type !== "original"', 'filing', 12, 'half'),
   
  ('patent', 'us_track_one', 'Track One Prioritized Examination', 'Examen Prioritizado Track One',
   'Accelerated examination (extra fee)', 'checkbox', null,
   false, null, null, 'examination', 20, 'half'),
   
  ('patent', 'us_pph', 'Patent Prosecution Highway', 'PPH',
   'Accelerated examination based on foreign grant', 'checkbox', null,
   false, null, null, 'examination', 21, 'half'),
   
  ('patent', 'us_entity_status', 'Entity Status', 'Tipo de Entidad',
   'Affects fee rates', 'select',
   '[{"value":"large","label":"Large Entity"},{"value":"small","label":"Small Entity"},{"value":"micro","label":"Micro Entity"}]',
   true, null, null, 'fees', 30, 'half'),
   
  ('patent', 'us_maintenance_4yr', '4-Year Maintenance Fee Due', 'Mantenimiento 4 años',
   null, 'date', null,
   false, null, null, 'maintenance', 40, 'third'),
   
  ('patent', 'us_maintenance_8yr', '8-Year Maintenance Fee Due', 'Mantenimiento 8 años',
   null, 'date', null,
   false, null, null, 'maintenance', 41, 'third'),
   
  ('patent', 'us_maintenance_12yr', '12-Year Maintenance Fee Due', 'Mantenimiento 12 años',
   null, 'date', null,
   false, null, null, 'maintenance', 42, 'third')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, is_required_condition, visible_condition, 
       field_group, display_order, grid_column)
WHERE j.code = 'US'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  is_required_condition = EXCLUDED.is_required_condition,
  visible_condition = EXCLUDED.visible_condition;