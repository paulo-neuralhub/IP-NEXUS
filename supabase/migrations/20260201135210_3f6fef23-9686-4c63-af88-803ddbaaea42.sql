-- ════════════════════════════════════════════════════════════════════════════
-- SEED: DEADLINE_RULES - Reglas de plazos principales
-- ════════════════════════════════════════════════════════════════════════════

-- MARCAS - PLAZOS GENERALES (Prioridad París)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, consequence_if_missed, category) VALUES
('PARIS_TM', 'Paris Priority Deadline', 'Plazo Prioridad París', NULL, 'trademark', 'priority_date', 'priority_date', 'months', 6, 'absolute', '{90,60,30,14,7}', false, 'loss_of_priority', 'priority'),
('PARIS_PT', 'Paris Priority Deadline (Patents)', 'Plazo Prioridad París (Patentes)', NULL, 'patent', 'priority_date', 'priority_date', 'months', 12, 'absolute', '{180,90,60,30,14}', false, 'loss_of_priority', 'priority'),
('PARIS_DS', 'Paris Priority Deadline (Designs)', 'Plazo Prioridad París (Diseños)', NULL, 'design', 'priority_date', 'priority_date', 'months', 6, 'absolute', '{90,60,30,14,7}', false, 'loss_of_priority', 'priority')
ON CONFLICT (code) DO NOTHING;

-- ESPAÑA (ES)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, v.is_extendable, v.max_extensions,
  v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('ES_TM_OPP', 'Opposition Period (ES)', 'Plazo Oposición (ES)', 'trademark', 'publication_date', 'publication_date', 'months', 2, 'high', '{45,30,14,7}'::integer[], false, NULL::integer, 'registration_proceeds', 'opposition', 'Art. 19 Ley de Marcas'),
  ('ES_TM_RESPONSE', 'Office Action Response (ES)', 'Respuesta Requerimiento (ES)', 'trademark', 'office_action_date', NULL, 'months', 2, 'critical', '{45,30,14,7}'::integer[], true, 1, 'abandonment', 'response', 'Art. 20 Ley de Marcas'),
  ('ES_TM_RENEWAL', 'Renewal (ES)', 'Renovación (ES)', 'trademark', 'expiry_date', 'expiry_date', 'months', -6, 'high', '{180,90,60,30}'::integer[], false, NULL::integer, 'expiration', 'renewal', 'Art. 32 Ley de Marcas'),
  ('ES_PT_SUBEXAM', 'Substantive Exam Request (ES)', 'Solicitud Examen Sustantivo (ES)', 'patent', 'filing_date', 'filing_date', 'months', 36, 'critical', '{180,90,60,30}'::integer[], false, NULL::integer, 'deemed_withdrawn', 'examination', 'Art. 38 Ley de Patentes')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
WHERE j.code = 'ES'
ON CONFLICT (code) DO NOTHING;

-- EUIPO (EU)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, v.is_extendable, v.max_extensions,
  v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('EU_TM_OPP', 'Opposition Period (EUIPO)', 'Plazo Oposición (EUIPO)', 'trademark', 'publication_date', 'publication_date', 'months', 3, 'high', '{60,45,30,14}'::integer[], false, NULL::integer, 'registration_proceeds', 'opposition', 'Art. 46 EUTMR'),
  ('EU_TM_COOLING', 'Cooling-Off Period (EUIPO)', 'Periodo Cooling-Off (EUIPO)', 'trademark', 'opposition_filed_date', NULL, 'months', 24, 'normal', '{60,30}'::integer[], true, NULL::integer, 'opposition_proceeds', 'opposition', 'Art. 6 EUTMDR'),
  ('EU_TM_PROOF', 'Proof of Use (EUIPO)', 'Prueba de Uso (EUIPO)', 'trademark', 'manual_date', NULL, 'months', 2, 'critical', '{45,30,14}'::integer[], false, NULL::integer, 'opposition_rejected', 'opposition', 'Art. 47 EUTMR'),
  ('EU_TM_RENEWAL', 'Renewal (EUIPO)', 'Renovación (EUIPO)', 'trademark', 'expiry_date', 'expiry_date', 'months', -6, 'high', '{180,90,60,30}'::integer[], false, NULL::integer, 'expiration', 'renewal', 'Art. 53 EUTMR'),
  ('EU_DS_DEFER', 'Deferred Publication (EUIPO)', 'Publicación Aplazada (EUIPO)', 'design', 'filing_date', 'filing_date', 'months', 30, 'normal', '{90,60,30}'::integer[], false, NULL::integer, 'automatic_publication', 'publication', 'Art. 50 CDR')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
WHERE j.code = 'EU'
ON CONFLICT (code) DO NOTHING;

-- USPTO (US)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, v.is_extendable, v.max_extensions,
  v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('US_TM_OPP', 'Opposition Period (USPTO)', 'Plazo Oposición (USPTO)', 'trademark', 'publication_date', 'publication_date', 'days', 30, 'high', '{21,14,7}'::integer[], true, 3, 'registration_proceeds', 'opposition', 'TMEP §1503.01'),
  ('US_TM_RESPONSE', 'Office Action Response (USPTO)', 'Respuesta Requerimiento (USPTO)', 'trademark', 'office_action_date', NULL, 'months', 6, 'critical', '{90,60,30,14}'::integer[], false, NULL::integer, 'abandonment', 'response', '37 CFR 2.62'),
  ('US_TM_SOU', 'Statement of Use (USPTO)', 'Declaración de Uso (USPTO)', 'trademark', 'manual_date', NULL, 'months', 6, 'critical', '{90,60,30,14}'::integer[], true, 5, 'abandonment', 'itu', 'TMEP §1108'),
  ('US_TM_SEC8', 'Section 8 Declaration (USPTO)', 'Declaración §8 (USPTO)', 'trademark', 'registration_date', 'registration_date', 'years', 6, 'absolute', '{365,180,90,60,30}'::integer[], false, NULL::integer, 'cancellation', 'maintenance', '15 USC §1058'),
  ('US_TM_SEC9', 'Section 9 Renewal (USPTO)', 'Renovación §9 (USPTO)', 'trademark', 'registration_date', 'registration_date', 'years', 10, 'absolute', '{365,180,90,60,30}'::integer[], false, NULL::integer, 'expiration', 'renewal', '15 USC §1059'),
  ('US_PT_MAINT4', '4-Year Maintenance Fee (USPTO)', 'Mantenimiento 4 años (USPTO)', 'patent', 'grant_date', 'grant_date', 'years', 4, 'absolute', '{180,90,60,30}'::integer[], false, NULL::integer, 'lapse', 'maintenance', '37 CFR 1.362'),
  ('US_PT_MAINT8', '8-Year Maintenance Fee (USPTO)', 'Mantenimiento 8 años (USPTO)', 'patent', 'grant_date', 'grant_date', 'years', 8, 'absolute', '{180,90,60,30}'::integer[], false, NULL::integer, 'lapse', 'maintenance', '37 CFR 1.362'),
  ('US_PT_MAINT12', '12-Year Maintenance Fee (USPTO)', 'Mantenimiento 12 años (USPTO)', 'patent', 'grant_date', 'grant_date', 'years', 12, 'absolute', '{180,90,60,30}'::integer[], false, NULL::integer, 'lapse', 'maintenance', '37 CFR 1.362')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, max_extensions, consequence_if_missed, category, legal_basis)
WHERE j.code = 'US'
ON CONFLICT (code) DO NOTHING;

-- PCT
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, false, v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('PCT_NATPHASE30', 'National Phase Entry (30 months)', 'Entrada Fase Nacional (30 meses)', 'patent', 'priority_date', 'priority_date', 'months', 30, 'absolute', '{180,90,60,30,14}'::integer[], 'loss_of_rights', 'national_phase', 'PCT Art. 22'),
  ('PCT_NATPHASE31', 'National Phase Entry (31 months)', 'Entrada Fase Nacional (31 meses)', 'patent', 'priority_date', 'priority_date', 'months', 31, 'absolute', '{180,90,60,30,14}'::integer[], 'loss_of_rights', 'national_phase', 'PCT Art. 39'),
  ('PCT_CHAPTERII', 'Chapter II Demand', 'Demanda Capítulo II', 'patent', 'international_filing_date', NULL, 'months', 22, 'high', '{90,60,30}'::integer[], 'chapter_ii_unavailable', 'examination', 'PCT Art. 31'),
  ('PCT_ART19', 'Article 19 Amendments', 'Enmiendas Artículo 19', 'patent', 'manual_date', NULL, 'months', 2, 'normal', '{30,14}'::integer[], 'no_amendments', 'amendments', 'PCT Art. 19')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, consequence_if_missed, category, legal_basis)
WHERE j.code = 'PCT'
ON CONFLICT (code) DO NOTHING;

-- MADRID (WO)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, false, v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('WO_DEPENDENCY', 'Central Attack Dependency Period', 'Periodo Dependencia Marca Base', 'trademark', 'registration_date', 'registration_date', 'years', 5, 'high', '{365,180,90}'::integer[], 'dependency_ends', 'dependency', 'Madrid Protocol Art. 6'),
  ('WO_RENEWAL', 'International Registration Renewal', 'Renovación Registro Internacional', 'trademark', 'expiry_date', 'expiry_date', 'months', -6, 'high', '{180,90,60,30}'::integer[], 'expiration', 'renewal', 'Madrid Protocol Art. 7'),
  ('WO_SUBSEQUENT', 'Subsequent Designation Response', 'Respuesta Designación Posterior', 'trademark', 'manual_date', NULL, 'months', 18, 'normal', '{90,60,30}'::integer[], 'designation_refused', 'designation', 'Madrid Protocol Art. 5')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, consequence_if_missed, category, legal_basis)
WHERE j.code = 'WO'
ON CONFLICT (code) DO NOTHING;

-- EPO (EP)
INSERT INTO deadline_rules (code, name_en, name_es, jurisdiction_id, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, is_extendable, consequence_if_missed, category, legal_basis)
SELECT 
  v.code, v.name_en, v.name_es, j.id, v.right_type, v.trigger_event, v.trigger_field, 
  v.time_unit::text, v.time_value, v.criticality::text, v.alert_days, false, v.consequence_if_missed, v.category, v.legal_basis
FROM jurisdictions j
CROSS JOIN (VALUES
  ('EP_EXAM_REQ', 'Examination Request', 'Solicitud de Examen', 'patent', 'publication_date', 'publication_date', 'months', 6, 'critical', '{90,60,30,14}'::integer[], 'deemed_withdrawn', 'examination', 'EPC Art. 94'),
  ('EP_VALIDATION', 'Validation Deadline', 'Plazo Validación', 'patent', 'grant_date', 'grant_date', 'months', 3, 'absolute', '{60,45,30,14}'::integer[], 'no_protection_in_state', 'validation', 'EPC Art. 65'),
  ('EP_OPPOSITION', 'Opposition Period', 'Plazo Oposición', 'patent', 'grant_date', 'grant_date', 'months', 9, 'high', '{180,90,60,30}'::integer[], 'patent_final', 'opposition', 'EPC Art. 99'),
  ('EP_ANNUITY', 'Annual Fee', 'Anualidad', 'patent', 'filing_date', 'filing_date', 'years', 1, 'high', '{90,60,30}'::integer[], 'lapse', 'maintenance', 'EPC Art. 86')
) AS v(code, name_en, name_es, right_type, trigger_event, trigger_field, time_unit, time_value, criticality, alert_days, consequence_if_missed, category, legal_basis)
WHERE j.code = 'EP'
ON CONFLICT (code) DO NOTHING;