-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT 2: CAMPOS ESPECÍFICOS COMPLETOS - JURISDICCIONES TIER 1
-- ════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 1: ESPAÑA (ES) - OEPM - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  -- MARCAS ESPAÑA
  ('trademark', 'es_pyme_reduction', 'SME Fee Reduction', 'Reducción Tasa PYME',
   'Reducción 50% si cumple requisitos PYME', 'checkbox', null,
   false, null, 'fees', 20, 'third'),
  ('trademark', 'es_pyme_certificate', 'SME Certificate', 'Certificado PYME',
   'Documento acreditativo de condición PYME', 'file', null,
   false, 'es_pyme_reduction === true', 'fees', 21, 'third'),
  ('trademark', 'es_pyme_expiry', 'SME Certificate Expiry', 'Caducidad Certificado',
   null, 'date', null,
   false, 'es_pyme_reduction === true', 'fees', 22, 'third'),
  ('trademark', 'es_opposition_filed', 'Opposition Filed', 'Oposición Presentada',
   'Se ha presentado oposición contra esta marca', 'checkbox', null,
   false, null, 'opposition', 30, 'half'),
  ('trademark', 'es_opposition_deadline', 'Opposition Deadline', 'Plazo Oposición',
   '2 meses desde publicación BOPI', 'date', null,
   false, null, 'opposition', 31, 'half'),
  ('trademark', 'es_suspended', 'Suspended', 'Suspendida',
   'Tramitación suspendida', 'checkbox', null,
   false, null, 'status', 40, 'half'),
  ('trademark', 'es_suspension_reason', 'Suspension Reason', 'Motivo Suspensión',
   null, 'select',
   '[{"value":"opposition","label":"Oposición pendiente"},{"value":"office_action","label":"Requerimiento oficial"},{"value":"court","label":"Procedimiento judicial"},{"value":"other","label":"Otro"}]',
   false, 'es_suspended === true', 'status', 41, 'half'),
  
  -- PATENTES ESPAÑA
  ('patent', 'es_patent_type', 'Patent Type', 'Tipo de Patente',
   null, 'select',
   '[{"value":"invention","label":"Patente de Invención"},{"value":"addition","label":"Patente de Adición"}]',
   true, null, 'filing', 10, 'half'),
  ('patent', 'es_iet_received', 'Technical Report Received', 'IET Recibido',
   null, 'checkbox', null,
   false, 'es_iet_requested === true', 'examination', 21, 'third'),
  ('patent', 'es_iet_date', 'Technical Report Date', 'Fecha IET',
   null, 'date', null,
   false, 'es_iet_received === true', 'examination', 22, 'third'),
  ('patent', 'es_substantive_exam_requested', 'Substantive Exam Requested', 'Examen Sustantivo Solicitado',
   null, 'checkbox', null,
   false, null, 'examination', 30, 'half'),
  ('patent', 'es_annuities_paid_until', 'Annuities Paid Until', 'Anualidades Pagadas Hasta',
   'Año hasta el que están pagadas las anualidades', 'number', null,
   false, null, 'maintenance', 40, 'half'),
  ('patent', 'es_next_annuity_due', 'Next Annuity Due', 'Próxima Anualidad',
   null, 'date', null,
   false, null, 'maintenance', 41, 'half'),
  
  -- MODELOS UTILIDAD ESPAÑA
  ('utility_model', 'es_um_type', 'Utility Model Type', 'Tipo Modelo Utilidad',
   null, 'select',
   '[{"value":"original","label":"Original"},{"value":"addition","label":"De Adición"}]',
   true, null, 'filing', 10, 'half'),
  ('utility_model', 'es_um_technical_report', 'Technical Report', 'Informe Técnico',
   'IET para modelo de utilidad', 'checkbox', null,
   false, null, 'examination', 20, 'half'),
  
  -- DISEÑOS ESPAÑA
  ('design', 'es_design_type', 'Design Type', 'Tipo de Diseño',
   null, 'select',
   '[{"value":"single","label":"Diseño único"},{"value":"multiple","label":"Diseño múltiple"}]',
   true, null, 'filing', 10, 'half'),
  ('design', 'es_design_count', 'Number of Designs', 'Número de Diseños',
   'Solo para diseño múltiple', 'number', null,
   false, 'es_design_type === "multiple"', 'filing', 11, 'half'),
  ('design', 'es_locarno_class', 'Locarno Class', 'Clase Locarno',
   'Clasificación de Locarno', 'text', null,
   false, null, 'classification', 20, 'half'),
  ('design', 'es_defer_publication', 'Defer Publication', 'Aplazar Publicación',
   'Aplazar publicación hasta 30 meses', 'checkbox', null,
   false, null, 'filing', 30, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'ES'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 2: EUIPO (EU) - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  -- MARCAS EUIPO (extendiendo existentes)
  ('trademark', 'eu_seniority_country', 'Seniority Country', 'País Antigüedad',
   'País de la marca base para seniority', 'country_select', null,
   false, 'eu_seniority_claimed === true', 'seniority', 31, 'third'),
  ('trademark', 'eu_seniority_number', 'Seniority Number', 'Número Antigüedad',
   'Número de registro de la marca nacional', 'text', null,
   false, 'eu_seniority_claimed === true', 'seniority', 32, 'third'),
  ('trademark', 'eu_seniority_date', 'Seniority Date', 'Fecha Antigüedad',
   'Fecha de registro de la marca nacional', 'date', null,
   false, 'eu_seniority_claimed === true', 'seniority', 33, 'third'),
  ('trademark', 'eu_priority_claimed', 'Priority Claimed', 'Prioridad Reivindicada',
   'Reivindicar prioridad de Convenio de París', 'checkbox', null,
   false, null, 'priority', 40, 'half'),
  ('trademark', 'eu_priority_country', 'Priority Country', 'País Prioridad',
   null, 'country_select', null,
   false, 'eu_priority_claimed === true', 'priority', 41, 'third'),
  ('trademark', 'eu_priority_number', 'Priority Number', 'Número Prioridad',
   null, 'text', null,
   false, 'eu_priority_claimed === true', 'priority', 42, 'third'),
  ('trademark', 'eu_priority_date', 'Priority Date', 'Fecha Prioridad',
   null, 'date', null,
   false, 'eu_priority_claimed === true', 'priority', 43, 'third'),
  ('trademark', 'eu_opposition_period_end', 'Opposition Period End', 'Fin Plazo Oposición',
   '3 meses desde publicación', 'date', null,
   false, null, 'opposition', 50, 'half'),
  ('trademark', 'eu_cooling_off_requested', 'Cooling-Off Requested', 'Período Enfriamiento',
   'Solicitar período de enfriamiento en oposición', 'checkbox', null,
   false, null, 'opposition', 51, 'half'),
  
  -- DISEÑOS EUIPO
  ('design', 'eu_rcd_type', 'RCD Type', 'Tipo DMC',
   null, 'select',
   '[{"value":"single","label":"Diseño único"},{"value":"multiple","label":"Diseño múltiple (max 100)"}]',
   true, null, 'filing', 10, 'half'),
  ('design', 'eu_rcd_count', 'Number of Designs', 'Número de Diseños',
   null, 'number', null,
   false, 'eu_rcd_type === "multiple"', 'filing', 11, 'half'),
  ('design', 'eu_rcd_defer', 'Defer Publication', 'Aplazar Publicación',
   'Aplazar hasta 30 meses', 'checkbox', null,
   false, null, 'filing', 20, 'half'),
  ('design', 'eu_rcd_locarno', 'Locarno Classification', 'Clasificación Locarno',
   null, 'text', null,
   false, null, 'classification', 30, 'half'),
  ('design', 'eu_rcd_priority', 'Priority Claimed', 'Prioridad Reivindicada',
   null, 'checkbox', null,
   false, null, 'priority', 40, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'EU'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 3: USPTO (US) - CAMPOS COMPLETOS (EL MÁS EXTENSO)
-- ══════════════════════════════════════════════════════════════════════════════

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
  -- MARCAS USPTO (extendiendo existentes)
  ('trademark', 'us_priority_claimed', 'Priority Claimed', 'Prioridad Reivindicada',
   'Reivindicar prioridad §44(d)', 'checkbox', null,
   false, null, 'priority', 60, 'half'),
  ('trademark', 'us_priority_country', 'Priority Country', 'País Prioridad',
   null, 'country_select', null,
   false, 'us_priority_claimed === true', 'priority', 61, 'third'),
  ('trademark', 'us_priority_number', 'Priority Number', 'Número Prioridad',
   null, 'text', null,
   false, 'us_priority_claimed === true', 'priority', 62, 'third'),
  ('trademark', 'us_priority_date', 'Priority Date', 'Fecha Prioridad',
   null, 'date', null,
   false, 'us_priority_claimed === true', 'priority', 63, 'third'),
  ('trademark', 'us_section_8_due', 'Section 8 Due', 'Vencimiento §8',
   'Declaration of Use (años 5-6)', 'date', null,
   false, null, 'maintenance', 70, 'third'),
  ('trademark', 'us_section_8_filed', 'Section 8 Filed', '§8 Presentada',
   null, 'checkbox', null,
   false, null, 'maintenance', 71, 'third'),
  ('trademark', 'us_section_9_due', 'Section 9 Due', 'Vencimiento §9',
   'Renewal (cada 10 años)', 'date', null,
   false, null, 'maintenance', 72, 'third'),
  ('trademark', 'us_section_15_filed', 'Section 15 Filed', '§15 Presentada',
   'Incontestability', 'checkbox', null,
   false, null, 'maintenance', 73, 'half'),
  ('trademark', 'us_section_71_due', 'Section 71 Due', 'Vencimiento §71',
   'Para marcas Madrid', 'date', null,
   false, 'us_basis === "66a"', 'maintenance', 74, 'half'),
  ('trademark', 'us_office_action_pending', 'Office Action Pending', 'Office Action Pendiente',
   null, 'checkbox', null,
   false, null, 'prosecution', 80, 'half'),
  ('trademark', 'us_office_action_deadline', 'Response Deadline', 'Plazo Respuesta',
   '6 meses desde Office Action', 'date', null,
   false, 'us_office_action_pending === true', 'prosecution', 81, 'half'),
  ('trademark', 'us_suspension_letter', 'Suspension Letter', 'Carta Suspensión',
   'Expediente suspendido por conflicto', 'checkbox', null,
   false, null, 'prosecution', 82, 'half'),
  
  -- PATENTES USPTO
  ('patent', 'us_patent_type', 'Patent Type', 'Tipo Patente',
   null, 'select',
   '[{"value":"utility","label":"Utility Patent"},{"value":"design","label":"Design Patent"},{"value":"plant","label":"Plant Patent"},{"value":"provisional","label":"Provisional Application"}]',
   true, null, 'filing', 10, 'half'),
  ('patent', 'us_entity_status', 'Entity Status', 'Estatus Entidad',
   'Determina tasas reducidas', 'select',
   '[{"value":"large","label":"Large Entity"},{"value":"small","label":"Small Entity (50%)"},{"value":"micro","label":"Micro Entity (75%)"}]',
   true, null, 'fees', 20, 'half'),
  ('patent', 'us_provisional_priority', 'Provisional Priority', 'Prioridad Provisional',
   'Reivindicar prioridad de provisional', 'checkbox', null,
   false, 'us_patent_type !== "provisional"', 'priority', 30, 'half'),
  ('patent', 'us_provisional_number', 'Provisional Number', 'Número Provisional',
   null, 'text', null,
   false, 'us_provisional_priority === true', 'priority', 31, 'half'),
  ('patent', 'us_provisional_date', 'Provisional Date', 'Fecha Provisional',
   null, 'date', null,
   false, 'us_provisional_priority === true', 'priority', 32, 'half'),
  ('patent', 'us_continuation_type', 'Continuation Type', 'Tipo Continuación',
   null, 'select',
   '[{"value":"none","label":"None"},{"value":"continuation","label":"Continuation"},{"value":"cip","label":"Continuation-in-Part (CIP)"},{"value":"divisional","label":"Divisional"}]',
   false, null, 'filing', 40, 'half'),
  ('patent', 'us_parent_application', 'Parent Application', 'Solicitud Padre',
   null, 'text', null,
   false, 'us_continuation_type !== "none"', 'filing', 41, 'half'),
  ('patent', 'us_track_one', 'Track One Prioritized', 'Track One (Priorizado)',
   'Examen prioritizado ($4000)', 'checkbox', null,
   false, null, 'examination', 50, 'half'),
  ('patent', 'us_pph_requested', 'PPH Requested', 'PPH Solicitado',
   'Patent Prosecution Highway', 'checkbox', null,
   false, null, 'examination', 51, 'half'),
  ('patent', 'us_maintenance_fee_3_5', '3.5 Year Fee Due', 'Tasa 3.5 Años',
   null, 'date', null,
   false, null, 'maintenance', 60, 'third'),
  ('patent', 'us_maintenance_fee_7_5', '7.5 Year Fee Due', 'Tasa 7.5 Años',
   null, 'date', null,
   false, null, 'maintenance', 61, 'third'),
  ('patent', 'us_maintenance_fee_11_5', '11.5 Year Fee Due', 'Tasa 11.5 Años',
   null, 'date', null,
   false, null, 'maintenance', 62, 'third'),
  
  -- DISEÑOS USPTO
  ('design', 'us_design_views', 'Design Views', 'Vistas Diseño',
   'Número de vistas incluidas', 'number', null,
   false, null, 'filing', 10, 'half'),
  ('design', 'us_design_claim', 'Design Claim', 'Reivindicación Diseño',
   'Descripción del diseño ornamental', 'textarea', null,
   true, null, 'filing', 20, 'full')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'US'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 4: WIPO MADRID (WO) - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  ('trademark', 'wo_basic_mark_type', 'Basic Mark Type', 'Tipo Marca Base',
   null, 'select',
   '[{"value":"application","label":"Application"},{"value":"registration","label":"Registration"}]',
   true, null, 'basic_mark', 9, 'third'),
  ('trademark', 'wo_dependency_end', 'Dependency Period End', 'Fin Dependencia',
   '5 años desde registro internacional', 'date', null,
   false, null, 'basic_mark', 15, 'half'),
  ('trademark', 'wo_limitation_text', 'Limitation of Goods/Services', 'Limitación P/S',
   'Limitación por país designado', 'textarea', null,
   false, null, 'designations', 30, 'full'),
  ('trademark', 'wo_transformation_available', 'Transformation Available', 'Transformación Disponible',
   'Si marca base cancela, puede transformar', 'checkbox', null,
   false, null, 'status', 40, 'half'),
  ('trademark', 'wo_subsequent_designation', 'Subsequent Designation', 'Designación Posterior',
   'Añadir más países después de registro', 'checkbox', null,
   false, null, 'designations', 50, 'half'),
  ('trademark', 'wo_renewal_due', 'Renewal Due', 'Vencimiento Renovación',
   'Cada 10 años', 'date', null,
   false, null, 'maintenance', 60, 'half'),
  ('trademark', 'wo_holder_change', 'Change of Holder', 'Cambio Titular',
   'Registrar cambio de titularidad', 'checkbox', null,
   false, null, 'changes', 70, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'WIPO'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 5: PCT - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  ('patent', 'pct_filing_language', 'Filing Language', 'Idioma Presentación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"fr","label":"Français"},{"value":"de","label":"Deutsch"},{"value":"es","label":"Español"},{"value":"ja","label":"日本語"},{"value":"zh","label":"中文"},{"value":"ko","label":"한국어"},{"value":"ru","label":"Русский"}]',
   true, null, 'filing', 5, 'half'),
  ('patent', 'pct_publication_language', 'Publication Language', 'Idioma Publicación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"fr","label":"Français"},{"value":"de","label":"Deutsch"},{"value":"es","label":"Español"},{"value":"ja","label":"日本語"},{"value":"zh","label":"中文"},{"value":"ko","label":"한국어"},{"value":"ru","label":"Русский"}]',
   false, null, 'filing', 6, 'half'),
  ('patent', 'pct_priority_claimed', 'Priority Claimed', 'Prioridad Reivindicada',
   null, 'checkbox', null,
   false, null, 'priority', 20, 'half'),
  ('patent', 'pct_priority_country', 'Priority Country', 'País Prioridad',
   null, 'country_select', null,
   false, 'pct_priority_claimed === true', 'priority', 21, 'third'),
  ('patent', 'pct_priority_number', 'Priority Number', 'Número Prioridad',
   null, 'text', null,
   false, 'pct_priority_claimed === true', 'priority', 22, 'third'),
  ('patent', 'pct_priority_date', 'Priority Date', 'Fecha Prioridad',
   null, 'date', null,
   false, 'pct_priority_claimed === true', 'priority', 23, 'third'),
  ('patent', 'pct_publication_date', 'Publication Date', 'Fecha Publicación',
   '18 meses desde prioridad/filing', 'date', null,
   false, null, 'publication', 30, 'half'),
  ('patent', 'pct_isr_received', 'ISR Received', 'ISR Recibido',
   'International Search Report', 'checkbox', null,
   false, null, 'search', 40, 'half'),
  ('patent', 'pct_isr_date', 'ISR Date', 'Fecha ISR',
   null, 'date', null,
   false, 'pct_isr_received === true', 'search', 41, 'half'),
  ('patent', 'pct_wo_received', 'Written Opinion Received', 'Opinión Escrita Recibida',
   null, 'checkbox', null,
   false, null, 'search', 42, 'half'),
  ('patent', 'pct_demand_filed', 'Demand Filed', 'Demanda Presentada',
   'Capítulo II', 'checkbox', null,
   false, null, 'examination', 50, 'half'),
  ('patent', 'pct_iper_received', 'IPER Received', 'IPER Recibido',
   'International Preliminary Examination Report', 'checkbox', null,
   false, 'pct_demand_filed === true', 'examination', 51, 'half'),
  ('patent', 'pct_national_phase_31', 'National Phase (31 months)', 'Fase Nacional (31 meses)',
   null, 'date', null,
   false, null, 'national_phase', 60, 'half'),
  ('patent', 'pct_designated_states', 'Designated States', 'Estados Designados',
   null, 'multi_select', null,
   false, null, 'national_phase', 61, 'full')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'PCT'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 6: EPO (EP) - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  ('patent', 'ep_filing_language', 'Filing Language', 'Idioma Presentación',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"de","label":"Deutsch"},{"value":"fr","label":"Français"}]',
   true, null, 'filing', 10, 'half'),
  ('patent', 'ep_procedure_language', 'Procedure Language', 'Idioma Procedimiento',
   null, 'select',
   '[{"value":"en","label":"English"},{"value":"de","label":"Deutsch"},{"value":"fr","label":"Français"}]',
   true, null, 'filing', 11, 'half'),
  ('patent', 'ep_entry_route', 'Entry Route', 'Vía de Entrada',
   null, 'select',
   '[{"value":"direct","label":"Direct EP"},{"value":"euro_pct","label":"Euro-PCT"}]',
   true, null, 'filing', 20, 'half'),
  ('patent', 'ep_pct_number', 'PCT Number', 'Número PCT',
   null, 'text', null,
   false, 'ep_entry_route === "euro_pct"', 'filing', 21, 'half'),
  ('patent', 'ep_priority_claimed', 'Priority Claimed', 'Prioridad Reivindicada',
   null, 'checkbox', null,
   false, null, 'priority', 30, 'half'),
  ('patent', 'ep_esr_received', 'ESR Received', 'IEB Recibido',
   'European Search Report', 'checkbox', null,
   false, null, 'search', 40, 'half'),
  ('patent', 'ep_esr_date', 'ESR Date', 'Fecha IEB',
   null, 'date', null,
   false, 'ep_esr_received === true', 'search', 41, 'half'),
  ('patent', 'ep_exam_requested', 'Examination Requested', 'Examen Solicitado',
   '6 meses desde publicación IEB', 'checkbox', null,
   false, null, 'examination', 50, 'half'),
  ('patent', 'ep_pace_requested', 'PACE Requested', 'PACE Solicitado',
   'Programa de examen acelerado', 'checkbox', null,
   false, null, 'examination', 51, 'half'),
  ('patent', 'ep_oral_proceedings', 'Oral Proceedings', 'Vista Oral',
   'Citación a vista oral', 'checkbox', null,
   false, null, 'examination', 52, 'half'),
  ('patent', 'ep_opposition_period_end', 'Opposition Period End', 'Fin Plazo Oposición',
   '9 meses desde concesión', 'date', null,
   false, null, 'opposition', 60, 'half'),
  ('patent', 'ep_validation_states', 'Validation States', 'Estados Validación',
   'Países donde validar', 'multi_select', null,
   false, null, 'validation', 70, 'full'),
  ('patent', 'ep_unitary_patent', 'Unitary Patent', 'Patente Unitaria',
   'Solicitar efecto unitario', 'checkbox', null,
   false, null, 'validation', 71, 'half'),
  ('patent', 'ep_renewal_fee_year', 'Renewal Year', 'Año Renovación',
   'Año hasta el que está pagado', 'number', null,
   false, null, 'maintenance', 80, 'half'),
  ('patent', 'ep_next_renewal_due', 'Next Renewal Due', 'Próxima Renovación',
   null, 'date', null,
   false, null, 'maintenance', 81, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'EP'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 7: CHINA (CN) - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  -- MARCAS CHINA
  ('trademark', 'cn_subclass', 'Subclass', 'Subclase',
   'Subclase china (más específica que Nice)', 'text', null,
   false, null, 'classification', 30, 'half'),
  ('trademark', 'cn_opposition_period', 'Opposition Period', 'Período Oposición',
   '3 meses desde publicación', 'date', null,
   false, null, 'opposition', 40, 'half'),
  ('trademark', 'cn_preliminary_approval', 'Preliminary Approval', 'Aprobación Preliminar',
   'Fecha de aprobación preliminar', 'date', null,
   false, null, 'status', 50, 'half'),
  ('trademark', 'cn_madrid_extension', 'Madrid Extension', 'Extensión Madrid',
   'Es extensión vía Madrid', 'checkbox', null,
   false, null, 'filing', 60, 'half'),
  
  -- PATENTES CHINA
  ('patent', 'cn_patent_type', 'Patent Type', 'Tipo Patente',
   null, 'select',
   '[{"value":"invention","label":"Invention Patent (发明专利)"},{"value":"utility","label":"Utility Model (实用新型)"},{"value":"design","label":"Design Patent (外观设计)"}]',
   true, null, 'filing', 10, 'half'),
  ('patent', 'cn_pct_entry', 'PCT Entry', 'Entrada PCT',
   null, 'checkbox', null,
   false, null, 'filing', 20, 'half'),
  ('patent', 'cn_pct_number', 'PCT Number', 'Número PCT',
   null, 'text', null,
   false, 'cn_pct_entry === true', 'filing', 21, 'half'),
  ('patent', 'cn_substantive_exam', 'Substantive Exam Requested', 'Examen Sustantivo',
   '3 años desde solicitud', 'checkbox', null,
   false, 'cn_patent_type === "invention"', 'examination', 30, 'half'),
  ('patent', 'cn_exam_deadline', 'Exam Request Deadline', 'Plazo Solicitar Examen',
   null, 'date', null,
   false, 'cn_patent_type === "invention"', 'examination', 31, 'half'),
  ('patent', 'cn_oa_count', 'Office Actions Count', 'Número OAs',
   'Cantidad de Office Actions recibidos', 'number', null,
   false, null, 'prosecution', 40, 'half'),
  ('patent', 'cn_annuity_year', 'Annuity Year', 'Año Anualidad',
   'Año hasta el que está pagado', 'number', null,
   false, null, 'maintenance', 50, 'half'),
  ('patent', 'cn_next_annuity', 'Next Annuity Due', 'Próxima Anualidad',
   null, 'date', null,
   false, null, 'maintenance', 51, 'half'),
  
  -- DISEÑOS CHINA
  ('design', 'cn_design_type', 'Design Type', 'Tipo Diseño',
   null, 'select',
   '[{"value":"single","label":"Single Design"},{"value":"similar","label":"Similar Designs (max 10)"},{"value":"set","label":"Set Design"}]',
   true, null, 'filing', 10, 'half'),
  ('design', 'cn_design_count', 'Design Count', 'Número Diseños',
   null, 'number', null,
   false, 'cn_design_type !== "single"', 'filing', 11, 'half'),
  ('design', 'cn_locarno', 'Locarno Class', 'Clase Locarno',
   null, 'text', null,
   false, null, 'classification', 20, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'CN'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 8: JAPÓN (JP) - CAMPOS COMPLETOS
-- ══════════════════════════════════════════════════════════════════════════════

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
  -- MARCAS JAPÓN
  ('trademark', 'jp_japanese_name', 'Japanese Name', 'Nombre Japonés',
   'Traducción/transliteración japonesa', 'text', null,
   false, null, 'translation', 10, 'half'),
  ('trademark', 'jp_katakana', 'Katakana', 'Katakana',
   'Escritura en katakana', 'text', null,
   false, null, 'translation', 11, 'half'),
  ('trademark', 'jp_accelerated_exam', 'Accelerated Examination', 'Examen Acelerado',
   'Fast Track disponible', 'checkbox', null,
   false, null, 'examination', 20, 'half'),
  ('trademark', 'jp_renewal_due', 'Renewal Due', 'Vencimiento Renovación',
   null, 'date', null,
   false, null, 'maintenance', 30, 'half'),
  ('trademark', 'jp_division_possible', 'Division Possible', 'División Posible',
   null, 'checkbox', null,
   false, null, 'filing', 40, 'half'),
  
  -- PATENTES JAPÓN
  ('patent', 'jp_patent_type', 'Patent Type', 'Tipo Patente',
   null, 'select',
   '[{"value":"invention","label":"Invention Patent (特許)"},{"value":"utility","label":"Utility Model (実用新案)"},{"value":"design","label":"Design (意匠)"}]',
   true, null, 'filing', 10, 'half'),
  ('patent', 'jp_pct_entry', 'PCT Entry', 'Entrada PCT',
   null, 'checkbox', null,
   false, null, 'filing', 20, 'half'),
  ('patent', 'jp_exam_requested', 'Examination Requested', 'Examen Solicitado',
   '3 años desde solicitud', 'checkbox', null,
   false, null, 'examination', 30, 'half'),
  ('patent', 'jp_exam_deadline', 'Exam Request Deadline', 'Plazo Solicitar Examen',
   null, 'date', null,
   false, null, 'examination', 31, 'half'),
  ('patent', 'jp_super_accelerated', 'Super Accelerated Exam', 'Examen Super Acelerado',
   null, 'checkbox', null,
   false, null, 'examination', 32, 'half'),
  ('patent', 'jp_pph_used', 'PPH Used', 'PPH Utilizado',
   'Patent Prosecution Highway', 'checkbox', null,
   false, null, 'examination', 33, 'half'),
  ('patent', 'jp_annuity_year', 'Annuity Year', 'Año Anualidad',
   null, 'number', null,
   false, null, 'maintenance', 40, 'half'),
  ('patent', 'jp_next_annuity', 'Next Annuity Due', 'Próxima Anualidad',
   null, 'date', null,
   false, null, 'maintenance', 41, 'half'),
  
  -- DISEÑOS JAPÓN
  ('design', 'jp_partial_design', 'Partial Design', 'Diseño Parcial',
   'Proteger solo parte del producto', 'checkbox', null,
   false, null, 'filing', 10, 'half'),
  ('design', 'jp_related_design', 'Related Design', 'Diseño Relacionado',
   null, 'checkbox', null,
   false, null, 'filing', 11, 'half'),
  ('design', 'jp_secret_design', 'Secret Design', 'Diseño Secreto',
   'Mantener secreto hasta 3 años', 'checkbox', null,
   false, null, 'filing', 12, 'half')

) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'JP'
ON CONFLICT (jurisdiction_id, right_type, field_key) 
DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description,
  field_options = EXCLUDED.field_options,
  visible_condition = EXCLUDED.visible_condition;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 9: COREA (KR) e INDIA (IN)
-- ══════════════════════════════════════════════════════════════════════════════

-- COREA
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
  ('trademark', 'kr_korean_name', 'Korean Name', 'Nombre Coreano',
   'Traducción coreana', 'text', null,
   false, null, 'translation', 10, 'half'),
  ('trademark', 'kr_hangul', 'Hangul', 'Hangul',
   'Escritura en hangul', 'text', null,
   false, null, 'translation', 11, 'half'),
  ('trademark', 'kr_k_brandi', 'K-BranDi Used', 'K-BranDi Utilizado',
   'Sistema de búsqueda anticipada', 'checkbox', null,
   false, null, 'examination', 20, 'half'),
  ('trademark', 'kr_priority', 'Priority Claimed', 'Prioridad Reivindicada',
   null, 'checkbox', null,
   false, null, 'priority', 30, 'half'),
  ('patent', 'kr_pct_entry', 'PCT Entry', 'Entrada PCT',
   null, 'checkbox', null,
   false, null, 'filing', 10, 'half'),
  ('patent', 'kr_exam_requested', 'Examination Requested', 'Examen Solicitado',
   null, 'checkbox', null,
   false, null, 'examination', 20, 'half'),
  ('patent', 'kr_super_speed', 'Super-Speed Examination', 'Examen Super Rápido',
   null, 'checkbox', null,
   false, null, 'examination', 21, 'half'),
  ('patent', 'kr_annuity_year', 'Annuity Year', 'Año Anualidad',
   null, 'number', null,
   false, null, 'maintenance', 30, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'KR'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es;

-- INDIA
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
  ('trademark', 'in_user_affidavit', 'User Affidavit', 'Declaración Uso',
   'Affidavit de uso previo', 'checkbox', null,
   false, null, 'filing', 10, 'half'),
  ('trademark', 'in_opposition_filed', 'Opposition Filed', 'Oposición Presentada',
   '4 meses desde publicación', 'checkbox', null,
   false, null, 'opposition', 20, 'half'),
  ('trademark', 'in_expedited', 'Expedited Examination', 'Examen Acelerado',
   null, 'checkbox', null,
   false, null, 'examination', 30, 'half'),
  ('patent', 'in_working_statement', 'Working Statement Filed', 'Declaración Explotación',
   'Form 27 - declaración anual obligatoria', 'checkbox', null,
   false, null, 'maintenance', 10, 'half'),
  ('patent', 'in_working_due', 'Working Statement Due', 'Vencimiento Form 27',
   null, 'date', null,
   false, null, 'maintenance', 11, 'half'),
  ('patent', 'in_pre_grant_opposition', 'Pre-Grant Opposition', 'Oposición Pre-Concesión',
   null, 'checkbox', null,
   false, null, 'opposition', 20, 'half'),
  ('patent', 'in_pct_entry', 'PCT Entry', 'Entrada PCT',
   null, 'checkbox', null,
   false, null, 'filing', 30, 'half'),
  ('patent', 'in_expedited_exam', 'Expedited Examination', 'Examen Acelerado',
   null, 'checkbox', null,
   false, null, 'examination', 40, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'IN'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es;

-- ══════════════════════════════════════════════════════════════════════════════
-- PASO 10: UK (GB) POST-BREXIT
-- ══════════════════════════════════════════════════════════════════════════════

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
  ('trademark', 'gb_series_mark', 'Series Mark', 'Marca Serie',
   'Registrar variantes como serie', 'checkbox', null,
   false, null, 'filing', 10, 'half'),
  ('trademark', 'gb_certification_mark', 'Certification Mark', 'Marca Certificación',
   null, 'checkbox', null,
   false, null, 'filing', 11, 'half'),
  ('trademark', 'gb_eu_comparable', 'EU Comparable Right', 'Derecho Comparable UE',
   'Creado automáticamente post-Brexit de EUTM', 'checkbox', null,
   false, null, 'brexit', 20, 'half'),
  ('trademark', 'gb_original_eutm', 'Original EUTM Number', 'Número EUTM Original',
   null, 'text', null,
   false, 'gb_eu_comparable === true', 'brexit', 21, 'half'),
  ('trademark', 'gb_opposition_period', 'Opposition Period End', 'Fin Plazo Oposición',
   '2 meses + 1 mes extensión', 'date', null,
   false, null, 'opposition', 30, 'half'),
  ('patent', 'gb_supplementary_protection', 'SPC Filed', 'CCP Solicitado',
   'Supplementary Protection Certificate', 'checkbox', null,
   false, null, 'extension', 10, 'half'),
  ('patent', 'gb_ep_validation', 'EP Validated', 'EP Validada',
   'Validación de patente europea', 'checkbox', null,
   false, null, 'filing', 20, 'half'),
  ('patent', 'gb_ep_number', 'EP Number', 'Número EP',
   null, 'text', null,
   false, 'gb_ep_validation === true', 'filing', 21, 'half'),
  ('patent', 'gb_renewal_year', 'Renewal Year', 'Año Renovación',
   null, 'number', null,
   false, null, 'maintenance', 30, 'half'),
  ('design', 'gb_eu_comparable_design', 'EU Comparable Right', 'Derecho Comparable UE',
   'Creado automáticamente post-Brexit de RCD', 'checkbox', null,
   false, null, 'brexit', 10, 'half'),
  ('design', 'gb_original_rcd', 'Original RCD Number', 'Número RCD Original',
   null, 'text', null,
   false, 'gb_eu_comparable_design === true', 'brexit', 11, 'half')
) AS v(right_type, field_key, field_label_en, field_label_es, field_description, 
       field_type, field_options, is_required, visible_condition, field_group, 
       display_order, grid_column)
WHERE j.code = 'GB'
ON CONFLICT (jurisdiction_id, right_type, field_key) DO UPDATE SET
  field_label_en = EXCLUDED.field_label_en,
  field_label_es = EXCLUDED.field_label_es,
  field_description = EXCLUDED.field_description;