-- ════════════════════════════════════════════════════════════════════════════
-- PCT - Patent Cooperation Treaty
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Insertar PCT como jurisdicción internacional (con price_monthly)
INSERT INTO jurisdictions (
  code, name, name_en, name_es, jurisdiction_type, tier, region,
  ipo_name, office_acronym, office_website,
  supports_trademarks, supports_patents, supports_utility_models, supports_designs,
  is_madrid_member, is_pct_member, is_hague_member, is_paris_member,
  is_active, sort_order, price_monthly
) VALUES (
  'PCT', 'PCT (Patent Cooperation Treaty)', 'PCT (Patent Cooperation Treaty)', 'PCT (Tratado de Cooperación en Patentes)',
  'international', 1, 'International',
  'World Intellectual Property Organization', 'WIPO', 'https://www.wipo.int/pct/',
  false, true, false, false,
  false, true, false, true,
  true, 5, 0
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  supports_patents = EXCLUDED.supports_patents;

-- 2. Insertar campos PCT
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
  -- OFICINAS PCT
  ('patent', 'pct_receiving_office', 'Receiving Office (RO)', 'Oficina Receptora',
   'Where the PCT application was filed', 'select',
   '[{"value":"IB","label":"WIPO (IB)"},{"value":"EP","label":"EPO"},{"value":"US","label":"USPTO"},{"value":"ES","label":"OEPM"},{"value":"CN","label":"CNIPA"},{"value":"JP","label":"JPO"},{"value":"KR","label":"KIPO"},{"value":"other","label":"Other"}]',
   true, null, 'offices', 10, 'third'),
   
  ('patent', 'pct_ro_other', 'Other RO', 'Otra Oficina Receptora',
   'Specify if Other selected', 'country_select', null,
   false, 'pct_receiving_office === "other"', 'offices', 11, 'third'),
   
  ('patent', 'pct_isa', 'International Searching Authority (ISA)', 'Autoridad de Búsqueda',
   null, 'select',
   '[{"value":"EP","label":"EPO"},{"value":"US","label":"USPTO"},{"value":"CN","label":"CNIPA"},{"value":"JP","label":"JPO"},{"value":"KR","label":"KIPO"},{"value":"ES","label":"OEPM"},{"value":"AU","label":"IP Australia"},{"value":"other","label":"Other"}]',
   true, null, 'offices', 12, 'third'),
   
  ('patent', 'pct_ipea', 'International Preliminary Examining Authority (IPEA)', 'Autoridad de Examen',
   'Optional - for Chapter II', 'select',
   '[{"value":"EP","label":"EPO"},{"value":"US","label":"USPTO"},{"value":"CN","label":"CNIPA"},{"value":"JP","label":"JPO"},{"value":"KR","label":"KIPO"},{"value":"other","label":"Other"}]',
   false, null, 'offices', 13, 'half'),
  
  -- IDIOMA
  ('patent', 'pct_filing_language', 'Filing Language', 'Idioma de Presentación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"fr","label":"French"},{"value":"de","label":"German"},{"value":"es","label":"Spanish"},{"value":"zh","label":"Chinese"},{"value":"ja","label":"Japanese"},{"value":"ko","label":"Korean"},{"value":"ru","label":"Russian"},{"value":"ar","label":"Arabic"},{"value":"pt","label":"Portuguese"}]',
   true, null, 'language', 20, 'half'),
   
  ('patent', 'pct_publication_language', 'Publication Language', 'Idioma de Publicación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"fr","label":"French"},{"value":"de","label":"German"},{"value":"es","label":"Spanish"},{"value":"zh","label":"Chinese"},{"value":"ja","label":"Japanese"},{"value":"ko","label":"Korean"},{"value":"ru","label":"Russian"},{"value":"ar","label":"Arabic"}]',
   false, null, 'language', 21, 'half'),
  
  -- FECHAS CLAVE
  ('patent', 'pct_international_filing_date', 'International Filing Date', 'Fecha Presentación Internacional',
   null, 'date', null, true, null, 'dates', 30, 'third'),
   
  ('patent', 'pct_priority_date', 'Earliest Priority Date', 'Fecha Prioridad más Antigua',
   null, 'date', null, false, null, 'dates', 31, 'third'),
   
  ('patent', 'pct_publication_date', 'Publication Date', 'Fecha Publicación',
   '18 months from priority/filing', 'date', null, false, null, 'dates', 32, 'third'),
  
  -- CAPÍTULO I
  ('patent', 'pct_isr_received', 'ISR Received', 'ISR Recibido',
   'International Search Report received', 'checkbox', null, false, null, 'chapter_i', 40, 'third'),
   
  ('patent', 'pct_isr_date', 'ISR Date', 'Fecha ISR',
   null, 'date', null, false, 'pct_isr_received === true', 'chapter_i', 41, 'third'),
   
  ('patent', 'pct_written_opinion_received', 'Written Opinion Received', 'Opinión Escrita Recibida',
   null, 'checkbox', null, false, null, 'chapter_i', 42, 'third'),
   
  ('patent', 'pct_art19_amendments', 'Article 19 Amendments', 'Enmiendas Art. 19',
   'Amendments to claims before WIPO', 'checkbox', null, false, null, 'chapter_i', 50, 'half'),
   
  ('patent', 'pct_art19_date', 'Article 19 Amendment Date', 'Fecha Enmiendas Art. 19',
   null, 'date', null, false, 'pct_art19_amendments === true', 'chapter_i', 51, 'half'),
  
  -- CAPÍTULO II
  ('patent', 'pct_chapter_ii', 'Chapter II Demanded', 'Capítulo II Solicitado',
   'International Preliminary Examination', 'checkbox', null, false, null, 'chapter_ii', 60, 'third'),
   
  ('patent', 'pct_chapter_ii_date', 'Chapter II Demand Date', 'Fecha Demanda Capítulo II',
   null, 'date', null, false, 'pct_chapter_ii === true', 'chapter_ii', 61, 'third'),
   
  ('patent', 'pct_iprp_received', 'IPRP Received', 'IPRP Recibido',
   'International Preliminary Report on Patentability', 'checkbox', null,
   false, 'pct_chapter_ii === true', 'chapter_ii', 62, 'third'),
   
  ('patent', 'pct_art34_amendments', 'Article 34 Amendments', 'Enmiendas Art. 34',
   'Amendments during Chapter II', 'checkbox', null, false, 'pct_chapter_ii === true', 'chapter_ii', 70, 'half'),
  
  -- FASE NACIONAL
  ('patent', 'pct_national_phase_deadline', 'National Phase Deadline', 'Plazo Fase Nacional',
   '30 or 31 months from priority date', 'date', null, false, null, 'national_phase', 80, 'half'),
   
  ('patent', 'pct_national_phase_months', 'National Phase Term', 'Plazo Meses',
   'Standard or extended deadline', 'select',
   '[{"value":"30","label":"30 months (standard)"},{"value":"31","label":"31 months (some offices)"}]',
   false, null, 'national_phase', 81, 'half'),
   
  ('patent', 'pct_target_countries', 'Target National Phase Countries', 'Países Objetivo Fase Nacional',
   'Where national phase will be entered', 'multi_select', null, false, null, 'national_phase', 90, 'full')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'PCT'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options;