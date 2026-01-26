-- =============================================
-- SEED: Automation Rules for Patents (EPO, USPTO, PCT, OEPM)
-- Verified: 2026-01-26
-- =============================================

-- 1. EPO (European Patent) RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
-- Anualidad próxima
('EPO_PT_ANNUITY_REMINDER',
 'Recordatorio anualidad patente europea',
 'Recordar pago de anualidad 3 meses antes del vencimiento.',
 'deadline', 'patents', 'annuity',
 'deadline_approaching', 'annuity_due',
 '{"days_before": 90}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_ANNUITY_START'),
 '{
   "title_template": "Anualidad EPO: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [90, 30, 14],
   "auto_create_task": true
 }',
 true, false, 500),

-- Respuesta a examinador
('EPO_PT_EXAMINATION_RESPONSE_RULE',
 'Plazo respuesta comunicación EPO',
 'Cuando se recibe comunicación del examinador, crear plazo de 4 meses.',
 'deadline', 'patents', 'response',
 'event', 'notification_received',
 '{"notification_type": "examination_report"}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_EXAMINATION_RESPONSE'),
 '{
   "title_template": "Responder EPO: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [60, 30, 14, 7],
   "auto_create_task": true,
   "task_title": "Preparar respuesta examinador EPO"
 }',
 true, false, 510),

-- Plazo oposición
('EPO_PT_OPPOSITION_DEADLINE',
 'Crear plazo oposición patente europea',
 'Cuando se publica concesión de patente EP, crear plazo de 9 meses.',
 'deadline', 'patents', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "granted"}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_OPPOSITION'),
 '{
   "title_template": "Fin plazo oposición EP: {{matter.reference}}",
   "priority": "medium",
   "notify_before_days": [60, 30, 7]
 }',
 true, false, 520),

-- Validación nacional
('EPO_PT_VALIDATION_RULE',
 'Plazo validación nacional patente EP',
 'Cuando se concede patente EP, crear plazo de 3 meses para validaciones.',
 'deadline', 'patents', 'response',
 'event', 'matter_status_changed',
 '{"new_status": "granted"}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_VALIDATION'),
 '{
   "title_template": "Validar patente EP: {{matter.reference}}",
   "description_template": "La patente {{matter.reference}} fue concedida. Validar en países designados dentro de 3 meses.",
   "priority": "high",
   "notify_before_days": [45, 14, 7],
   "auto_create_task": true,
   "task_title": "Gestionar validaciones nacionales"
 }',
 true, false, 530),

-- Apelación
('EPO_PT_APPEAL_RULE',
 'Plazo apelación decisión EPO',
 'Cuando se recibe decisión adversa, crear plazo de 2 meses para apelar.',
 'deadline', 'patents', 'response',
 'event', 'notification_received',
 '{"notification_type": "decision", "decision_type": "adverse"}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_APPEAL'),
 '{
   "title_template": "Plazo apelación EPO: {{matter.reference}}",
   "priority": "urgent",
   "notify_before_days": [30, 14, 7, 3],
   "auto_create_task": true
 }',
 true, false, 540),

-- Further Processing
('EPO_PT_FURTHER_PROCESSING_RULE',
 'Oportunidad Further Processing EPO',
 'Cuando se pierde un plazo, notificar opción de further processing.',
 'notification', 'patents', 'restoration',
 'event', 'deadline_missed',
 '{"deadline_type": "response"}',
 '{"matter_types": ["patent"], "offices": ["EPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EPO_PT_FURTHER_PROCESSING'),
 '{
   "title_template": "Further Processing disponible: {{matter.reference}}",
   "description_template": "Se ha perdido un plazo. Puede solicitar further processing dentro de 2 meses.",
   "priority": "urgent",
   "auto_create_task": true
 }',
 true, false, 550)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- 2. USPTO PATENT RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
-- Maintenance fee 3.5 años
('USPTO_PT_MAINTENANCE_3_5_RULE',
 'Maintenance fee patente USA (3.5 años)',
 'Recordar pago de maintenance fee a los 3.5 años.',
 'deadline', 'patents', 'annuity',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 3, "months": 6, "months_before": 6}',
 '{"matter_types": ["patent"], "offices": ["USPTO"], "statuses": ["granted"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_PT_MAINTENANCE_3_5'),
 '{
   "title_template": "Maintenance fee 3.5Y: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [180, 90, 30],
   "auto_send_email": true
 }',
 true, false, 600),

-- Maintenance fee 7.5 años
('USPTO_PT_MAINTENANCE_7_5_RULE',
 'Maintenance fee patente USA (7.5 años)',
 'Recordar pago de maintenance fee a los 7.5 años.',
 'deadline', 'patents', 'annuity',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 7, "months": 6, "months_before": 6}',
 '{"matter_types": ["patent"], "offices": ["USPTO"], "statuses": ["granted"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_PT_MAINTENANCE_7_5'),
 '{
   "title_template": "Maintenance fee 7.5Y: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [180, 90, 30]
 }',
 true, false, 601),

-- Maintenance fee 11.5 años
('USPTO_PT_MAINTENANCE_11_5_RULE',
 'Maintenance fee patente USA (11.5 años)',
 'Recordar pago de maintenance fee a los 11.5 años.',
 'deadline', 'patents', 'annuity',
 'deadline_approaching', 'matter_anniversary',
 '{"years": 11, "months": 6, "months_before": 6}',
 '{"matter_types": ["patent"], "offices": ["USPTO"], "statuses": ["granted"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_PT_MAINTENANCE_11_5'),
 '{
   "title_template": "Maintenance fee 11.5Y: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [180, 90, 30]
 }',
 true, false, 602),

-- Respuesta a Office Action
('USPTO_PT_OFFICE_ACTION_RULE',
 'Plazo respuesta Office Action patente',
 'Cuando se recibe Office Action, crear plazo de 3 meses.',
 'deadline', 'patents', 'response',
 'event', 'notification_received',
 '{"notification_type": "office_action"}',
 '{"matter_types": ["patent"], "offices": ["USPTO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_PT_OFFICE_ACTION'),
 '{
   "title_template": "Responder OA: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [45, 21, 7],
   "auto_create_task": true
 }',
 true, false, 610),

-- Revival
('USPTO_PT_REVIVAL_RULE',
 'Petition to Revive patente abandonada',
 'Cuando se abandona patente, notificar opción de revival.',
 'notification', 'patents', 'restoration',
 'event', 'matter_status_changed',
 '{"new_status": "abandoned"}',
 '{"matter_types": ["patent"], "offices": ["USPTO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'USPTO_PT_REVIVAL'),
 '{
   "title_template": "Revival disponible: {{matter.reference}}",
   "priority": "high",
   "auto_create_task": true,
   "task_title": "Evaluar petition to revive"
 }',
 true, false, 620)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- 3. PCT/WIPO PATENT RULES
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
-- Fase nacional
('WIPO_PCT_NATIONAL_PHASE_RULE',
 'Plazo entrada fase nacional PCT',
 'Recordar plazo de 30/31 meses para entrar en fase nacional.',
 'deadline', 'patents', 'response',
 'deadline_approaching', 'priority_anniversary',
 '{"months": 30, "months_before": 6}',
 '{"matter_types": ["patent"], "pct_application": true}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_PCT_NATIONAL_PHASE'),
 '{
   "title_template": "Fase nacional PCT: {{matter.reference}}",
   "description_template": "El plazo de 30/31 meses para entrar en fase nacional vence pronto.",
   "priority": "urgent",
   "notify_before_days": [180, 90, 60, 30, 14],
   "auto_create_task": true,
   "task_title": "Decidir países fase nacional"
 }',
 true, false, 700),

-- Capítulo II
('WIPO_PCT_CHAPTER_II_RULE',
 'Plazo demanda Capítulo II PCT',
 'Recordar plazo de 22 meses para demanda de examen preliminar.',
 'deadline', 'patents', 'response',
 'deadline_approaching', 'priority_anniversary',
 '{"months": 22, "months_before": 3}',
 '{"matter_types": ["patent"], "pct_application": true}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_PCT_CHAPTER_II'),
 '{
   "title_template": "Capítulo II PCT: {{matter.reference}}",
   "priority": "medium",
   "notify_before_days": [60, 30, 14]
 }',
 true, false, 710),

-- Respuesta a ISR
('WIPO_PCT_ISR_RESPONSE_RULE',
 'Plazo respuesta a ISR (Art. 19)',
 'Cuando se recibe ISR, crear plazo para modificaciones Art. 19.',
 'deadline', 'patents', 'response',
 'event', 'notification_received',
 '{"notification_type": "isr"}',
 '{"matter_types": ["patent"], "pct_application": true}',
 (SELECT id FROM legal_deadlines WHERE code = 'WIPO_PCT_ISR_RESPONSE'),
 '{
   "title_template": "Modificaciones Art. 19: {{matter.reference}}",
   "priority": "medium",
   "notify_before_days": [30, 14, 7]
 }',
 true, false, 720)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- 4. OEPM PATENT RULES (Spain)
INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
('OEPM_PT_ANNUITY_REMINDER',
 'Recordatorio anualidad patente España',
 'Recordar pago de anualidad 3 meses antes.',
 'deadline', 'patents', 'annuity',
 'deadline_approaching', 'annuity_due',
 '{"days_before": 90}',
 '{"matter_types": ["patent"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_PT_ANNUITY_START'),
 '{
   "title_template": "Anualidad OEPM: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [90, 30, 14]
 }',
 true, false, 800),

('OEPM_PT_EXAMINATION_REQUEST_RULE',
 'Plazo solicitar examen patente España',
 'Recordar solicitar examen sustantivo dentro de 3 años.',
 'deadline', 'patents', 'response',
 'deadline_approaching', 'filing_anniversary',
 '{"years": 3, "months_before": 6}',
 '{"matter_types": ["patent"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_PT_EXAMINATION_REQUEST'),
 '{
   "title_template": "Solicitar examen: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [180, 90, 30],
   "auto_create_task": true
 }',
 true, false, 810),

('OEPM_PT_OFFICE_ACTION_RULE',
 'Plazo respuesta requerimiento OEPM',
 'Cuando se recibe requerimiento, crear plazo de respuesta.',
 'deadline', 'patents', 'response',
 'event', 'notification_received',
 '{"notification_type": "office_action"}',
 '{"matter_types": ["patent"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_PT_EXAMINATION_REQUEST'),
 '{
   "title_template": "Responder OEPM: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [30, 14, 7],
   "auto_create_task": true
 }',
 true, false, 820)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();