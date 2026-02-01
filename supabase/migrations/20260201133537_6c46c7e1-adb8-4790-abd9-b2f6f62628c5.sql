-- ════════════════════════════════════════════════════════════════════════════
-- JAPÓN (JP) - JPO - CAMPOS COMPLETOS
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
  -- TRADUCCIÓN JAPONESA
  ('trademark', 'jp_japanese_name', 'Japanese Name', 'Nombre en Japonés',
   'Katakana, Hiragana, or Kanji representation', 'text', null,
   false, null, 'translation', 10, 'half'),
   
  ('trademark', 'jp_pronunciation', 'Pronunciation', 'Pronunciación',
   'How the mark is pronounced in Japanese', 'text', null,
   false, null, 'translation', 11, 'half'),
   
  ('trademark', 'jp_script_type', 'Script Type', 'Tipo de Escritura',
   null, 'select',
   '[{"value":"katakana","label":"Katakana (カタカナ)"},{"value":"hiragana","label":"Hiragana (ひらがな)"},{"value":"kanji","label":"Kanji (漢字)"},{"value":"romaji","label":"Romaji (Latin)"},{"value":"mixed","label":"Mixed"}]',
   false, 'jp_japanese_name', 'translation', 12, 'half'),
  
  -- EXAMEN ACELERADO
  ('trademark', 'jp_accelerated', 'Accelerated Examination', 'Examen Acelerado',
   'Fast track if mark already in use', 'checkbox', null,
   false, null, 'examination', 20, 'half'),
   
  ('trademark', 'jp_accelerated_grounds', 'Accelerated Grounds', 'Motivo Aceleración',
   null, 'select',
   '[{"value":"use","label":"Mark in use"},{"value":"infringement","label":"Infringement concerns"},{"value":"foreign_filing","label":"Foreign filing pending"}]',
   false, 'jp_accelerated === true', 'examination', 21, 'half'),
  
  -- PROCESO
  ('trademark', 'jp_office_action', 'Office Action Received', 'Requerimiento Recibido',
   null, 'checkbox', null,
   false, null, 'process', 30, 'half'),
   
  ('trademark', 'jp_response_deadline', 'Response Deadline', 'Plazo Respuesta',
   'Usually 40 days, extendable', 'date', null,
   false, 'jp_office_action === true', 'process', 31, 'half'),
  
  -- PATENTES JAPÓN
  ('patent', 'jp_examination_requested', 'Examination Requested', 'Examen Solicitado',
   'Must be requested within 3 years', 'checkbox', null,
   false, null, 'examination', 10, 'half'),
   
  ('patent', 'jp_examination_deadline', 'Examination Request Deadline', 'Plazo Solicitud Examen',
   '3 years from filing date', 'date', null,
   false, null, 'examination', 11, 'half'),
   
  ('patent', 'jp_accelerated_exam', 'Accelerated Examination', 'Examen Acelerado',
   null, 'checkbox', null,
   false, null, 'examination', 20, 'half'),
   
  ('patent', 'jp_accelerated_type', 'Accelerated Type', 'Tipo Aceleración',
   null, 'select',
   '[{"value":"working","label":"Working in Japan"},{"value":"pph","label":"Patent Prosecution Highway"},{"value":"super_accelerated","label":"Super Accelerated"},{"value":"green","label":"Green Technology"}]',
   false, 'jp_accelerated_exam === true', 'examination', 21, 'half'),
   
  ('patent', 'jp_divisional', 'Is Divisional', 'Es Divisional',
   null, 'checkbox', null,
   false, null, 'filing', 30, 'half'),
   
  ('patent', 'jp_parent_app', 'Parent Application', 'Solicitud Matriz',
   null, 'text', null,
   false, 'jp_divisional === true', 'filing', 31, 'half'),
   
  ('patent', 'jp_annuity_paid_until', 'Annuities Paid Until Year', 'Anualidades Pagadas Hasta',
   null, 'number', null,
   false, null, 'maintenance', 40, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'JP'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_options = EXCLUDED.field_options;