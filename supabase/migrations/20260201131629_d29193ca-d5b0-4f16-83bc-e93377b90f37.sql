
-- ════════════════════════════════════════════════════════════════════════════
-- IP-NEXUS: SEED DATA - Campos específicos por jurisdicción
-- ════════════════════════════════════════════════════════════════════════════

-- ESPAÑA (ES) - Campos Trademark y Patent
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_type, v.field_options::jsonb, v.is_required, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'es_modality', 'Modality', 'Modalidad', 'select', '[{"value":"normal","label":"Normal"},{"value":"accelerated","label":"Acelerada (+tasas)"}]', false, 'filing', 10, 'half'),
  ('trademark', 'es_pyme_reduction', 'SME Fee Reduction', 'Reducción PYME (50%)', 'checkbox', null, false, 'fees', 20, 'half'),
  ('patent', 'es_iet_requested', 'Technical Status Report', 'Informe Estado Técnica', 'checkbox', null, false, 'examination', 10, 'half'),
  ('patent', 'es_early_examination', 'Early Examination', 'Examen Anticipado', 'checkbox', null, false, 'examination', 20, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
WHERE j.code = 'ES'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;

-- EUIPO (EU) - Campos Trademark y Design
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_type, v.field_options::jsonb, v.is_required, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'eu_second_language', 'Second Language', 'Segundo Idioma', 'select', '[{"value":"en","label":"English"},{"value":"de","label":"Deutsch"},{"value":"fr","label":"Français"},{"value":"it","label":"Italiano"},{"value":"es","label":"Español"}]', true, 'filing', 10, 'half'),
  ('trademark', 'eu_fast_track', 'Fast Track', 'Fast Track', 'checkbox', null, false, 'filing', 20, 'half'),
  ('trademark', 'eu_seniority_claimed', 'Claim Seniority', 'Reivindicar Antigüedad', 'checkbox', null, false, 'seniority', 30, 'half'),
  ('trademark', 'eu_seniority_country', 'Seniority Country', 'País Antigüedad', 'text', null, false, 'seniority', 31, 'third'),
  ('trademark', 'eu_seniority_number', 'Seniority Number', 'Nº Registro', 'text', null, false, 'seniority', 32, 'third'),
  ('trademark', 'eu_seniority_date', 'Seniority Date', 'Fecha Registro', 'date', null, false, 'seniority', 33, 'third'),
  ('design', 'eu_defer_publication', 'Defer Publication', 'Aplazar Publicación', 'checkbox', null, false, 'filing', 10, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
WHERE j.code = 'EU'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;

-- USPTO (US) - Campos Trademark con condiciones de visibilidad
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_description, field_type, field_options, is_required, visible_condition, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_description, v.field_type, v.field_options::jsonb, v.is_required, v.visible_condition, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'us_basis', 'Filing Basis', 'Base Solicitud', 'Legal basis for trademark application', 'select', '[{"value":"1a","label":"§1(a) Use in Commerce"},{"value":"1b","label":"§1(b) Intent to Use"},{"value":"44d","label":"§44(d) Foreign Priority"},{"value":"44e","label":"§44(e) Foreign Registration"},{"value":"66a","label":"§66(a) Madrid Protocol"}]', true, null, 'basis', 10, 'full'),
  ('trademark', 'us_first_use_date', 'First Use Date', 'Fecha Primer Uso', null, 'date', null, false, 'us_basis === "1a"', 'basis', 20, 'half'),
  ('trademark', 'us_first_use_commerce_date', 'First Use in Commerce', 'Primer Uso Comercio', null, 'date', null, false, 'us_basis === "1a"', 'basis', 21, 'half'),
  ('trademark', 'us_specimen_url', 'Specimen', 'Espécimen', 'Evidence of use in commerce', 'file', null, false, 'us_basis === "1a"', 'basis', 22, 'full'),
  ('trademark', 'us_disclaimer', 'Disclaimer', 'Renuncia', 'Elements disclaimed', 'text', null, false, null, 'legal', 30, 'full'),
  ('trademark', 'us_acquired_distinctiveness', 'Acquired Distinctiveness §2(f)', 'Distintividad Adquirida §2(f)', null, 'checkbox', null, false, null, 'legal', 40, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_description, field_type, field_options, is_required, visible_condition, field_group, display_order, grid_column)
WHERE j.code = 'US'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;

-- WIPO/Madrid (WIPO) - Campos marca base
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_type, v.field_options::jsonb, v.is_required, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'wo_basic_mark_country', 'Basic Mark Country', 'País Marca Base', 'text', null, true, 'basic_mark', 10, 'third'),
  ('trademark', 'wo_basic_mark_type', 'Basic Mark Type', 'Tipo Marca Base', 'select', '[{"value":"application","label":"Application"},{"value":"registration","label":"Registration"}]', true, 'basic_mark', 11, 'third'),
  ('trademark', 'wo_basic_mark_number', 'Basic Mark Number', 'Número Marca Base', 'text', null, true, 'basic_mark', 12, 'third'),
  ('trademark', 'wo_basic_mark_date', 'Basic Mark Date', 'Fecha Marca Base', 'date', null, true, 'basic_mark', 13, 'half'),
  ('trademark', 'wo_limit_by_country', 'Limit Goods/Services by Country', 'Limitar Productos por País', 'checkbox', null, false, 'designations', 30, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_type, field_options, is_required, field_group, display_order, grid_column)
WHERE j.code = 'WIPO'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;

-- CHINA (CN) - Campos traducción y agente local
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_type, is_required, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_type, v.is_required, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'cn_chinese_name', 'Chinese Name', 'Nombre Chino', 'text', false, 'translation', 10, 'third'),
  ('trademark', 'cn_pinyin', 'Pinyin', 'Pinyin', 'text', false, 'translation', 11, 'third'),
  ('trademark', 'cn_meaning', 'Meaning', 'Significado', 'text', false, 'translation', 12, 'third'),
  ('trademark', 'cn_local_agent', 'Local Agent', 'Agente Local', 'text', true, 'representation', 20, 'full')
) AS v(right_type, field_key, field_label_en, field_label_es, field_type, is_required, field_group, display_order, grid_column)
WHERE j.code = 'CN'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;

-- JAPÓN (JP) - Campos
INSERT INTO jurisdiction_field_configs (jurisdiction_id, right_type, field_key, field_label_en, field_label_es, field_type, is_required, field_group, display_order, grid_column)
SELECT j.id, v.right_type, v.field_key, v.field_label_en, v.field_label_es, v.field_type, v.is_required, v.field_group, v.display_order, v.grid_column
FROM jurisdictions j, (VALUES
  ('trademark', 'jp_accelerated', 'Accelerated Examination', 'Examen Acelerado', 'checkbox', false, 'examination', 10, 'half'),
  ('trademark', 'jp_translation', 'Japanese Translation', 'Traducción Japonés', 'text', false, 'translation', 20, 'full')
) AS v(right_type, field_key, field_label_en, field_label_es, field_type, is_required, field_group, display_order, grid_column)
WHERE j.code = 'JP'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO NOTHING;
