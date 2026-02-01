-- ════════════════════════════════════════════════════════════════════════════
-- CHINA (CN) - CNIPA - CAMPOS COMPLETOS
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
  -- TRADUCCIÓN CHINA
  ('trademark', 'cn_chinese_name', 'Chinese Name', 'Nombre en Chino',
   'Chinese characters (Hanzi) for the mark', 'text', null,
   false, null, 'translation', 10, 'third'),
   
  ('trademark', 'cn_pinyin', 'Pinyin Romanization', 'Pinyin',
   'Romanized pronunciation of Chinese name', 'text', null,
   false, 'cn_chinese_name', 'translation', 11, 'third'),
   
  ('trademark', 'cn_meaning', 'Chinese Meaning', 'Significado en Chino',
   'Translation/meaning of Chinese characters', 'text', null,
   false, 'cn_chinese_name', 'translation', 12, 'third'),
   
  ('trademark', 'cn_transliteration_type', 'Transliteration Type', 'Tipo de Transliteración',
   null, 'select',
   '[{"value":"phonetic","label":"Phonetic (sounds like)"},{"value":"semantic","label":"Semantic (meaning)"},{"value":"mixed","label":"Mixed"}]',
   false, 'cn_chinese_name', 'translation', 13, 'half'),
  
  -- CLASIFICACIÓN (China usa subclases)
  ('trademark', 'cn_subclasses', 'Chinese Subclasses', 'Subclases China',
   'China divides Nice classes into subclasses', 'text', null,
   false, null, 'classification', 20, 'full'),
   
  ('trademark', 'cn_similar_group', 'Similar Group', 'Grupo Similar',
   'Chinese similar goods/services group', 'text', null,
   false, null, 'classification', 21, 'half'),
  
  -- REPRESENTACIÓN
  ('trademark', 'cn_local_agent_name', 'Local Agent Name', 'Nombre Agente Local',
   'Required for foreign applicants', 'text', null,
   true, null, 'representation', 30, 'half'),
   
  ('trademark', 'cn_local_agent_code', 'Agent Code', 'Código Agente',
   'CNIPA registered agent code', 'text', null,
   false, null, 'representation', 31, 'half'),
  
  -- PROCESO
  ('trademark', 'cn_preliminary_approval', 'Preliminary Approval', 'Aprobación Preliminar',
   'Passed preliminary examination', 'checkbox', null,
   false, null, 'process', 40, 'third'),
   
  ('trademark', 'cn_opposition_period_end', 'Opposition Period End', 'Fin Plazo Oposición',
   '3 months from preliminary approval', 'date', null,
   false, 'cn_preliminary_approval === true', 'process', 41, 'third'),
   
  ('trademark', 'cn_multi_class', 'Multi-Class Application', 'Solicitud Multiclase',
   'China allows multi-class since 2014', 'checkbox', null,
   false, null, 'process', 42, 'third'),
  
  -- PATENTES CHINA
  ('patent', 'cn_patent_type', 'Patent Type', 'Tipo de Patente',
   null, 'select',
   '[{"value":"invention","label":"Invention Patent (发明专利)"},{"value":"utility","label":"Utility Model (实用新型)"},{"value":"design","label":"Design Patent (外观设计)"}]',
   true, null, 'filing', 10, 'half'),
   
  ('patent', 'cn_local_agent_name', 'Local Agent Name', 'Nombre Agente Local',
   null, 'text', null,
   true, null, 'representation', 20, 'half'),
   
  ('patent', 'cn_local_agent_code', 'Agent Code', 'Código Agente',
   null, 'text', null,
   false, null, 'representation', 21, 'half'),
   
  ('patent', 'cn_substantive_exam_requested', 'Substantive Exam Requested', 'Examen Sustantivo Solicitado',
   'Must be requested within 3 years', 'checkbox', null,
   false, 'cn_patent_type === "invention"', 'examination', 30, 'half'),
   
  ('patent', 'cn_substantive_exam_deadline', 'Substantive Exam Deadline', 'Plazo Examen Sustantivo',
   '3 years from filing date', 'date', null,
   false, 'cn_patent_type === "invention"', 'examination', 31, 'half'),
   
  ('patent', 'cn_pph_requested', 'PPH Requested', 'PPH Solicitado',
   'Patent Prosecution Highway', 'checkbox', null,
   false, null, 'examination', 40, 'half'),
   
  ('patent', 'cn_priority_exam', 'Priority Examination', 'Examen Prioritario',
   'Accelerated examination available', 'checkbox', null,
   false, null, 'examination', 41, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'CN'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_description = EXCLUDED.field_description;